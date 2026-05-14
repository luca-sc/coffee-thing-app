import { create } from 'zustand';
import { Table, Customer, Order, Product, OrderItem, PaymentMethod } from '@/types';
import { mockTables, mockCustomers, mockOrders, mockProducts } from '@/data/mock-data';

interface TableState {
  tables: Table[];
  customers: Customer[];
  orders: Order[];
  selectedTable: Table | null;
  selectedCustomer: Customer | null;
  
  // Table actions
  selectTable: (tableId: string | null) => void;
  updateTableStatus: (tableId: string, status: Table['status']) => void;
  
  // Customer actions
  selectCustomer: (customerId: string | null) => void;
  addCustomerToTable: (tableId: string, customerName: string) => Customer;
  removeCustomerFromTable: (customerId: string) => void;
  
  // Order actions
  createOrder: (customerId: string, tableId: string) => Order;
  addItemToOrder: (orderId: string, product: Product, quantity: number) => void;
  removeItemFromOrder: (orderId: string, itemId: string) => void;
  updateOrderStatus: (orderId: string, status: Order['status']) => void;
  setPaymentMethod: (orderId: string, method: PaymentMethod) => void;
  markOrderPaid: (orderId: string) => void;
  
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
  tables: mockTables,
  customers: mockCustomers,
  orders: mockOrders,
  selectedTable: null,
  selectedCustomer: null,

  selectTable: (tableId: string | null) => {
    if (!tableId) {
      set({ selectedTable: null, selectedCustomer: null });
      return;
    }
    const table = get().tables.find((t) => t.id === tableId) || null;
    set({ selectedTable: table, selectedCustomer: null });
  },

  updateTableStatus: (tableId: string, status: Table['status']) => {
    set((state) => ({
      tables: state.tables.map((table) =>
        table.id === tableId ? { ...table, status } : table
      ),
    }));
  },

  selectCustomer: (customerId: string | null) => {
    if (!customerId) {
      set({ selectedCustomer: null });
      return;
    }
    const customer = get().customers.find((c) => c.id === customerId) || null;
    set({ selectedCustomer: customer });
  },

  addCustomerToTable: (tableId: string, customerName: string) => {
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
          ? {
              ...table,
              status: 'occupied' as const,
              currentCustomers: [...table.currentCustomers, newCustomer.id],
            }
          : table
      ),
    }));

    return newCustomer;
  },

  removeCustomerFromTable: (customerId: string) => {
    const customer = get().customers.find((c) => c.id === customerId);
    if (!customer) return;

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

  createOrder: (customerId: string, tableId: string) => {
    const newOrder: Order = {
      id: generateId('order'),
      customerId,
      tableId,
      items: [],
      status: 'pending',
      paymentMethod: null,
      paymentStatus: 'unpaid',
      subtotal: 0,
      total: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      orders: [...state.orders, newOrder],
    }));

    return newOrder;
  },

  addItemToOrder: (orderId: string, product: Product, quantity: number) => {
    set((state) => ({
      orders: state.orders.map((order) => {
        if (order.id !== orderId) return order;

        const existingItemIndex = order.items.findIndex(
          (item) => item.productId === product.id
        );

        let updatedItems: OrderItem[];

        if (existingItemIndex >= 0) {
          updatedItems = order.items.map((item, index) =>
            index === existingItemIndex
              ? {
                  ...item,
                  quantity: item.quantity + quantity,
                  price: (item.quantity + quantity) * product.price,
                }
              : item
          );
        } else {
          const newItem: OrderItem = {
            id: generateId('item'),
            productId: product.id,
            product,
            quantity,
            price: quantity * product.price,
          };
          updatedItems = [...order.items, newItem];
        }

        const subtotal = updatedItems.reduce((sum, item) => sum + item.price, 0);

        return {
          ...order,
          items: updatedItems,
          subtotal,
          total: subtotal,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },

  removeItemFromOrder: (orderId: string, itemId: string) => {
    set((state) => ({
      orders: state.orders.map((order) => {
        if (order.id !== orderId) return order;

        const updatedItems = order.items.filter((item) => item.id !== itemId);
        const subtotal = updatedItems.reduce((sum, item) => sum + item.price, 0);

        return {
          ...order,
          items: updatedItems,
          subtotal,
          total: subtotal,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
  },

  updateOrderStatus: (orderId: string, status: Order['status']) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId
          ? { ...order, status, updatedAt: new Date().toISOString() }
          : order
      ),
    }));
  },

  setPaymentMethod: (orderId: string, method: PaymentMethod) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              paymentMethod: method,
              paymentStatus: method ? 'pending' : 'unpaid',
              updatedAt: new Date().toISOString(),
            }
          : order
      ),
    }));
  },

  markOrderPaid: (orderId: string) => {
    set((state) => ({
      orders: state.orders.map((order) =>
        order.id === orderId
          ? {
              ...order,
              status: 'paid',
              paymentStatus: 'paid',
              updatedAt: new Date().toISOString(),
            }
          : order
      ),
    }));
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

  closeTableSession: (tableId: string) => {
    const tableCustomerIds = get().customers
      .filter((c) => c.tableId === tableId)
      .map((c) => c.id);

    set((state) => ({
      customers: state.customers.filter((c) => c.tableId !== tableId),
      orders: state.orders.filter((o) => !tableCustomerIds.includes(o.customerId)),
      tables: state.tables.map((table) =>
        table.id === tableId
          ? { ...table, status: 'free' as const, currentCustomers: [] }
          : table
      ),
      selectedTable: state.selectedTable?.id === tableId ? null : state.selectedTable,
      selectedCustomer: null,
    }));
  },
}));
