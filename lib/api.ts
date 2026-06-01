import { useAuthStore } from '@/store/auth-store';
import { Table, Customer, Order, OrderItem } from '@/types';

export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export function authHeaders(json = true): Record<string, string> {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {};
  if (json) headers['Content-Type'] = 'application/json';
  if (token) headers['Authorization'] = `Bearer ${token}`;
  return headers;
}

// The backend stores columns in snake_case; the frontend works in camelCase.
// These map a raw backend record onto the shape the UI expects.

export function normalizeCustomer(c: any): Customer {
  return {
    id: c.id,
    name: c.name,
    tableId: c.tableId ?? c.table_id,
    orders: c.orders ?? [],
    createdAt: c.createdAt ?? c.created_at,
  };
}

export function normalizeOrderItem(it: any): OrderItem {
  const productId = it.productId ?? it.product_id;
  return {
    id: it.id,
    productId,
    product: it.product ?? { id: productId, name: it.product_name, price: Number(it.unit_price ?? 0) } as any,
    quantity: it.quantity,
    price: Number(it.price ?? it.line_total ?? 0),
  };
}

export function normalizeOrder(o: any): Order {
  return {
    id: o.id,
    customerId: o.customerId ?? o.customer_id,
    tableId: o.tableId ?? o.table_id,
    items: Array.isArray(o.items) ? o.items.map(normalizeOrderItem) : [],
    status: o.status,
    paymentMethod: o.paymentMethod ?? o.payment_method ?? null,
    paymentStatus: o.paymentStatus ?? o.payment_status ?? 'unpaid',
    subtotal: Number(o.subtotal ?? 0),
    total: Number(o.total ?? 0),
    createdAt: o.createdAt ?? o.created_at,
    updatedAt: o.updatedAt ?? o.updated_at,
  };
}

export function normalizeTable(t: any, customers: Customer[]): Table {
  return {
    id: t.id,
    number: t.number,
    capacity: t.capacity,
    status: t.status,
    currentCustomers: customers.filter((c) => c.tableId === t.id).map((c) => c.id),
  };
}
