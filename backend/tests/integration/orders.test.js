/**
 * tests/integration/orders.test.js
 * ---------------------------------------------------------------------
 * TESTE DE INTEGRARE pentru comenzi - verifica ca logica de business
 * (Task 2) functioneaza corect cand este apelata prin API si persistata
 * in baza de date MySQL.
 * ---------------------------------------------------------------------
 */
const request = require('supertest');
const app = require('../../src/app');
const { resetDatabase, createTestCustomer, closeDatabase } = require('../setup');

describe('Comenzi /api/orders (teste de integrare)', () => {

  let token;
  let productId;
  let customerId;

  beforeEach(async () => {
    await resetDatabase();

    // inregistram un utilizator si obtinem tokenul
    const reg = await request(app).post('/api/auth/register').send({
      name: 'Ospatar Test',
      email: 'ospatar@example.com',
      password: 'parola123',
    });
    token = reg.body.data.token;

    // cream un produs (pret 5.00)
    const prod = await request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Cappuccino', price: 5.0, category: 'espresso' });
    productId = prod.body.data.id;

    // cream un client la masa 1
    customerId = await createTestCustomer(1);
  });

  afterAll(async () => {
    await closeDatabase();
  });

  describe('POST /api/orders - creare comanda', () => {
    test('creeaza o comanda si calculeaza corect totalul', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          customerId,
          tableId: 1,
          items: [{ productId, quantity: 2 }], // 2 x 5.00 = 10.00
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.subtotal).toBe(10.0);
      expect(res.body.data.tax).toBe(0.9);    // 10.00 * 0.09
      expect(res.body.data.total).toBe(10.9); // 10.00 + 0.90
    });

    test('respinge comanda fara autentificare', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({ customerId, tableId: 1, items: [{ productId, quantity: 1 }] });

      expect(res.statusCode).toBe(401);
    });

    test('respinge comanda fara produse', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ customerId, tableId: 1, items: [] });

      expect(res.statusCode).toBe(400);
    });

    test('respinge comanda cu un produs inexistent', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          customerId,
          tableId: 1,
          items: [{ productId: 99999, quantity: 1 }],
        });

      expect(res.statusCode).toBe(404);
    });

    test('respinge comanda cu cantitate invalida', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          customerId,
          tableId: 1,
          items: [{ productId, quantity: -2 }],
        });

      expect(res.statusCode).toBe(400);
    });
  });

  describe('PUT /api/orders/:id/status - schimbare stare', () => {
    test('permite o tranzitie valida de stare', async () => {
      const order = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ customerId, tableId: 1, items: [{ productId, quantity: 1 }] });
      const orderId = order.body.data.id;

      const res = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'preparing' });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.status).toBe('preparing');
    });

    test('respinge o tranzitie invalida de stare', async () => {
      const order = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${token}`)
        .send({ customerId, tableId: 1, items: [{ productId, quantity: 1 }] });
      const orderId = order.body.data.id;

      // pending -> delivered nu este permis (sare peste pasi)
      const res = await request(app)
        .put(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'delivered' });

      expect(res.statusCode).toBe(400);
    });
  });
});
