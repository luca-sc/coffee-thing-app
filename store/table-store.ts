import { create } from 'zustand';
import { Table, Customer, Order, Product, OrderItem, PaymentMethod } from '@/types';
import { API_URL, authHeaders, normalizeCustomer, normalizeOrder, normalizeTable } from '@/lib/api';

interface TableState {
  tables: Table[];
  customers: Customer[];
  orders: Order[];
  selectedTable: Table | null;
  selectedCustomer: Customer | null;
  
  // Table actions
  selectTable: (tableId: string | null) => void;
  updateTableStatus: (tableId: string, status: Table['status']) => Promise<void>;
  loadInitialData: () => Promise<void>;
  
  // Customer actions
  selectCustomer: (customerId: string | null) => void;
  addCustomerToTable: (tableId: string, customerName: string) => Promise<Customer>;
  removeCustomerFromTable: (customerId: string) => Promise<void>;
  
  // Order actions
  createOrder: (customerId: string, tableId: string, initialItems?: { product: Product; quantity: number }[]) => Promise<Order>;
  addItemToOrder: (orderId: string, product: Product, quantity: number) => Promise<void>;
  removeItemFromOrder: (orderId: string, itemId: string) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
  setPaymentMethod: (orderId: string, method: PaymentMethod) => Promise<void>;
  markOrderPaid: (orderId: string) => Promise<boolean>;
  
  // Getters
  getTableCustomers: (tableId: string) => Customer[];
  getCustomerOrders: (customerId: string) => Order[];
  getTableOrders: (tableId: string) => Order[];
  getActiveOrders: () => Order[];
  
  // Close table session
  closeTableSession: (tableId: string) => void;
}

// Generate unique IDs
const generateId = (prefix: string) => `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export const useTableStore = create<TableState>((set, get) => ({
  tables: [],
  customers: [],
  orders: [],
  selectedTable: null,
  selectedCustomer: null,

  // Load initial data from backend
  loadInitialData: async () => {
    try {
      const [tablesRes, customersRes, ordersRes] = await Promise.all([
        fetch(`${API_URL}/api/tables`, { headers: authHeaders(false) }).then((r) => r.json()).catch(() => ({ success: false })),
        fetch(`${API_URL}/api/customers`, { headers: authHeaders(false) }).then((r) => r.json()).catch(() => ({ success: false })),
        fetch(`${API_URL}/api/orders`, { headers: authHeaders(false) }).then((r) => r.json()).catch(() => ({ success: false })),
      ]);

      const customers = customersRes && customersRes.success ? customersRes.data.map(normalizeCustomer) : [];
      const orders = ordersRes && ordersRes.success ? ordersRes.data.map(normalizeOrder) : [];
      const tables = tablesRes && tablesRes.success ? tablesRes.data.map((t: any) => normalizeTable(t, customers)) : [];

      set((state) => ({
        tables,
        customers,
        orders,
        // keep the open session panel in sync with refreshed data
        selectedTable: state.selectedTable ? tables.find((t) => t.id === state.selectedTable!.id) ?? null : null,
      }));
    } catch (err) {
      // keep defaults on error
    }
  },

  selectTable: (tableId: string | null) => {
    if (!tableId) {
      set({ selectedTable: null, selectedCustomer: null });
      return;
    }
    const table = get().tables.find((t) => t.id === tableId) || null;
    set({ selectedTable: table, selectedCustomer: null });
  },

  updateTableStatus: async (tableId: string, status: Table['status']) => {
    // optimistic local update
    set((state) => ({
      tables: state.tables.map((table) =>
        table.id === tableId ? { ...table, status } : table
      ),
    }));
    try {
      await fetch(`${API_URL}/api/tables/${tableId}/status`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      });
    } catch (err) {
      // keep optimistic value on network error
    }
  },

  selectCustomer: (customerId: string | null) => {
    if (!customerId) {
      set({ selectedCustomer: null });
      return;
    }
    const customer = get().customers.find((c) => c.id === customerId) || null;
    set({ selectedCustomer: customer });
  },

  addCustomerToTable: async (tableId: string, customerName: string) => {
    try {
      const res = await fetch(`${API_URL}/api/customers`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ name: customerName, tableId }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Failed');
      const customer = normalizeCustomer(data.data);

      set((state) => ({
        customers: [...state.customers, customer],
        tables: state.tables.map((table) =>
          table.id === tableId
            ? { ...table, status: 'occupied', currentCustomers: [...table.currentCustomers, customer.id] }
            : table
        ),
      }));

      return customer;
    } catch (err) {
      // fallback: create locally
      const newCustomer: Customer = {
        id: generateId('cust'),
        name: customerName,
        tableId,
        orders: [],
        createdAt: new Date().toISOString(),
      };
      set((state) => ({
        customers: [...state.customers, newCustomer],
        tables: state.tables.map((table) =>
          table.id === tableId
            ? { ...table, status: 'occupied', currentCustomers: [...table.currentCustomers, newCustomer.id] }
            : table
        ),
      }));
      return newCustomer;
    }
  },

  removeCustomerFromTable: async (customerId: string) => {
    const customer = get().customers.find((c) => c.id === customerId);
    if (!customer) return;
    const res = await fetch(`${API_URL}/api/customers/${customerId}`, { method: 'DELETE', headers: authHeaders(false) });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data || !data.success) {
      // propagate error to caller so UI can show message and avoid local inconsistencies
      throw new Error((data && data.error) || 'Failed to delete customer');
    }
    set((state) => {
      const updatedTables = state.tables.map((table) => {
        if (table.id === customer.tableId) {
          const remainingCustomers = table.currentCustomers.filter((id) => id !== customerId);
          return {
            ...table,
            currentCustomers: remainingCustomers,
            status: remainingCustomers.length === 0 ? ('free' as const) : table.status,
          };
        }
        return table;
      });

      return {
        customers: state.customers.filter((c) => c.id !== customerId),
        orders: state.orders.filter((o) => o.customerId !== customerId),
        tables: updatedTables,
        selectedCustomer: state.selectedCustomer?.id === customerId ? null : state.selectedCustomer,
      };
    });
  },

  createOrder: async (customerId: string, tableId: string, initialItems: { product: Product; quantity: number }[] = []) => {
    // backend requires at least one item, so always send the first products with the order
    const items = initialItems.map((i) => ({ productId: i.product.id, quantity: i.quantity }));
    try {
      const res = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ customerId, tableId, items }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Order creation failed');
      const order = normalizeOrder(data.data);
      // the create response has no product names yet; reuse the products we already have
      const productsById = new Map(initialItems.map((i) => [i.product.id, i.product]));
      order.items = order.items.map((it) => ({ ...it, product: productsById.get(it.productId) ?? it.product }));
      set((state) => ({ orders: [...state.orders, order] }));
      return order;
    } catch (err) {
      const localItems: OrderItem[] = initialItems.map((i) => ({
        id: generateId('item'),
        productId: i.product.id,
        product: i.product,
        quantity: i.quantity,
        price: i.quantity * i.product.price,
      }));
      const subtotal = localItems.reduce((sum, it) => sum + it.price, 0);
      const newOrder: Order = {
        id: generateId('order'),
        customerId,
        tableId,
        items: localItems,
        status: 'pending',
        paymentMethod: null,
        paymentStatus: 'unpaid',
        subtotal,
        total: subtotal,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      set((state) => ({ orders: [...state.orders, newOrder] }));
      return newOrder;
    }
  },

  addItemToOrder: async (orderId: string, product: Product, quantity: number) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/items`, {
        method: 'POST',
        headers: authHeaders(),
        body: JSON.stringify({ productId: product.id, quantity }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Add item failed');
      const order = normalizeOrder(data.data);
      order.items = order.items.map((it) => (it.productId === product.id ? { ...it, product } : it));
      set((state) => ({
        orders: state.orders.map((o) => (o.id === orderId ? order : o)),
      }));
    } catch (err) {
      // fallback: local update
      set((state) => ({
        orders: state.orders.map((order) => {
          if (order.id !== orderId) return order;

          const existingItemIndex = order.items.findIndex((item) => item.productId === product.id);
          let updatedItems: OrderItem[];
          if (existingItemIndex >= 0) {
            updatedItems = order.items.map((item, index) =>
              index === existingItemIndex
                ? { ...item, quantity: item.quantity + quantity, price: (item.quantity + quantity) * product.price }
                : item
            );
          } else {
            const newItem: OrderItem = { id: generateId('item'), productId: product.id, product, quantity, price: quantity * product.price };
            updatedItems = [...order.items, newItem];
          }
          const subtotal = updatedItems.reduce((sum, item) => sum + item.price, 0);
          return { ...order, items: updatedItems, subtotal, total: subtotal, updatedAt: new Date().toISOString() };
        }),
      }));
    }
  },

  removeItemFromOrder: async (orderId: string, itemId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/items/${itemId}`, { method: 'DELETE', headers: authHeaders(false) });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Remove item failed');
      set((state) => ({ orders: state.orders.map((o) => (o.id === orderId ? normalizeOrder(data.data) : o)) }));
    } catch (err) {
      // fallback local
      set((state) => ({
        orders: state.orders.map((order) => {
          if (order.id !== orderId) return order;
          const updatedItems = order.items.filter((item) => item.id !== itemId);
          const subtotal = updatedItems.reduce((sum, item) => sum + item.price, 0);
          return { ...order, items: updatedItems, subtotal, total: subtotal, updatedAt: new Date().toISOString() };
        }),
      }));
    }
  },

  updateOrderStatus: async (orderId: string, status: Order['status']) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/status`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Update status failed');
      set((state) => ({ orders: state.orders.map((o) => (o.id === orderId ? normalizeOrder(data.data) : o)) }));
    } catch (err) {
      set((state) => ({ orders: state.orders.map((order) => (order.id === orderId ? { ...order, status, updatedAt: new Date().toISOString() } : order)) }));
    }
  },

  setPaymentMethod: async (orderId: string, method: PaymentMethod) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/payment-method`, {
        method: 'PUT',
        headers: authHeaders(),
        body: JSON.stringify({ method }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error || 'Set payment failed');
      set((state) => ({ orders: state.orders.map((o) => (o.id === orderId ? normalizeOrder(data.data) : o)) }));
    } catch (err) {
      set((state) => ({ orders: state.orders.map((order) => (order.id === orderId ? { ...order, paymentMethod: method, paymentStatus: method ? 'pending' : 'unpaid', updatedAt: new Date().toISOString() } : order)) }));
    }
  },

  markOrderPaid: async (orderId: string) => {
    try {
      const res = await fetch(`${API_URL}/api/orders/${orderId}/pay`, { method: 'PUT', headers: authHeaders(false) });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || !data.success) throw new Error((data && data.error) || 'Pay failed');

      // update local order
      set((state) => ({ orders: state.orders.map((o) => (o.id === orderId ? normalizeOrder(data.data) : o)) }));

      // try to remove customer if they have no unpaid orders
      const customerId = data.data.customerId ?? data.data.customer_id;
      if (customerId) {
        try {
          const orRes = await fetch(`${API_URL}/api/orders?customerId=${customerId}`, { headers: authHeaders(false) });
          const orData = await orRes.json().catch(() => null);
          let hasUnpaid = true;
          if (orRes.ok && orData && orData.success) {
            hasUnpaid = orData.data.some((o: any) => (o.payment_status ?? o.paymentStatus) !== 'paid');
          } else {
            hasUnpaid = get().orders.some((o) => o.customerId === customerId && o.paymentStatus !== 'paid');
          }

          if (!hasUnpaid) {
            await get().removeCustomerFromTable(customerId);
          }
        } catch (err) {
          // ignore removal errors
        }
      }
      return true;
    } catch (err) {
      // optimistic fallback: mark locally as paid
      set((state) => ({ orders: state.orders.map((order) => (order.id === orderId ? { ...order, status: 'paid', paymentStatus: 'paid', updatedAt: new Date().toISOString() } : order)) }));
      return false;
    }
  },

  getTableCustomers: (tableId: string) => {
    return get().customers.filter((c) => c.tableId === tableId);
  },

  getCustomerOrders: (customerId: string) => {
    return get().orders.filter((o) => o.customerId === customerId);
  },

  getTableOrders: (tableId: string) => {
    return get().orders.filter((o) => o.tableId === tableId);
  },

  getActiveOrders: () => {
    return get().orders.filter((o) => o.status !== 'paid');
  },

  closeTableSession: async (tableId: string) => {
    const tableCustomerIds = get().customers.filter((c) => c.tableId === tableId).map((c) => c.id);
    // delete customers via API (sequential to surface first error)
    for (const id of tableCustomerIds) {
      const res = await fetch(`${API_URL}/api/customers/${id}`, { method: 'DELETE', headers: authHeaders(false) });
      const data = await res.json().catch(() => null);
      if (!res.ok || !data || !data.success) {
        throw new Error((data && data.error) || 'Failed to delete customer');
      }
    }

    const res2 = await fetch(`${API_URL}/api/tables/${tableId}/status`, { method: 'PUT', headers: authHeaders(), body: JSON.stringify({ status: 'free' }) });
    const data2 = await res2.json().catch(() => null);
    if (!res2.ok || !data2 || !data2.success) {
      throw new Error((data2 && data2.error) || 'Failed to free table');
    }

    set((state) => ({
      customers: state.customers.filter((c) => c.tableId !== tableId),
      orders: state.orders.filter((o) => !tableCustomerIds.includes(o.customerId)),
      tables: state.tables.map((table) => (table.id === tableId ? { ...table, status: 'free', currentCustomers: [] } : table)),
      selectedTable: state.selectedTable?.id === tableId ? null : state.selectedTable,
      selectedCustomer: null,
    }));
  },
}));
