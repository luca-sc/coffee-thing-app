/**
 * tests/integration/products.test.js
 * ---------------------------------------------------------------------
 * TESTE DE INTEGRARE pentru operatiile CRUD (Task 3 din cerinta).
 *
 * Conform tabelului: "Creare, citire, autorizare (poti edita doar
 * resursele proprii)". Testeaza intregul lant: ruta HTTP -> controller
 * -> baza de date, inclusiv regula de autorizare pe proprietar.
 * ---------------------------------------------------------------------
 */
const request = require('supertest');
const app = require('../../src/app');
const { resetDatabase, closeDatabase } = require('../setup');

describe('CRUD produse /api/products (teste de integrare)', () => {

  // doi utilizatori distincti pentru a testa autorizarea
  let tokenUserA;
  let tokenUserB;

  beforeEach(async () => {
    await resetDatabase();

    // inregistram utilizatorul A
    const resA = await request(app).post('/api/auth/register').send({
      name: 'User A',
      email: 'usera@example.com',
      password: 'parola123',
    });
    tokenUserA = resA.body.data.token;

    // inregistram utilizatorul B
    const resB = await request(app).post('/api/auth/register').send({
      name: 'User B',
      email: 'userb@example.com',
      password: 'parola123',
    });
    tokenUserB = resB.body.data.token;
  });

  afterAll(async () => {
    await closeDatabase();
  });

  // helper: creeaza un produs cu un anumit token
  async function createProduct(token, overrides = {}) {
    return request(app)
      .post('/api/products')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Cafea Test',
        description: 'Descriere test',
        price: 5.0,
        category: 'coffee',
        ...overrides,
      });
  }

  // ============ CREARE ============
  describe('POST /api/products - creare', () => {
    test('creeaza un produs cu date valide', async () => {
      const res = await createProduct(tokenUserA);

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Cafea Test');
      expect(res.body.data.id).toBeDefined();
    });

    test('respinge crearea fara autentificare', async () => {
      const res = await request(app)
        .post('/api/products')
        .send({ name: 'Fara Token', price: 5.0, category: 'coffee' });

      expect(res.statusCode).toBe(401);
    });

    test('respinge crearea fara campuri obligatorii', async () => {
      const res = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ description: 'Lipseste numele si pretul' });

      expect(res.statusCode).toBe(400);
    });

    test('respinge crearea cu pret negativ', async () => {
      const res = await createProduct(tokenUserA, { price: -3 });
      expect(res.statusCode).toBe(400);
    });

    test('respinge crearea cu categorie invalida', async () => {
      const res = await createProduct(tokenUserA, { category: 'pizza' });
      expect(res.statusCode).toBe(400);
    });
  });

  // ============ CITIRE ============
  describe('GET /api/products - citire', () => {
    test('listeaza toate produsele (acces public)', async () => {
      await createProduct(tokenUserA);
      await createProduct(tokenUserA, { name: 'Al doilea produs' });

      const res = await request(app).get('/api/products');

      expect(res.statusCode).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBe(2);
    });

    test('returneaza un produs dupa id', async () => {
      const created = await createProduct(tokenUserA);
      const id = created.body.data.id;

      const res = await request(app).get(`/api/products/${id}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.id).toBe(id);
    });

    test('returneaza 404 pentru produs inexistent', async () => {
      const res = await request(app).get('/api/products/99999');
      expect(res.statusCode).toBe(404);
    });

    test('filtreaza produsele dupa categorie', async () => {
      await createProduct(tokenUserA, { category: 'coffee' });
      await createProduct(tokenUserA, { name: 'Ceai', category: 'tea' });

      const res = await request(app).get('/api/products?category=tea');

      expect(res.statusCode).toBe(200);
      expect(res.body.data.length).toBe(1);
      expect(res.body.data[0].category).toBe('tea');
    });
  });

  // ============ AUTORIZARE: editare doar resurse proprii ============
  describe('PUT /api/products/:id - autorizare la editare', () => {
    test('proprietarul isi poate edita propriul produs', async () => {
      const created = await createProduct(tokenUserA);
      const id = created.body.data.id;

      const res = await request(app)
        .put(`/api/products/${id}`)
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ price: 9.99 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.price).toBe(9.99);
    });

    test('un alt utilizator NU poate edita produsul altuia', async () => {
      // userA creeaza produsul
      const created = await createProduct(tokenUserA);
      const id = created.body.data.id;

      // userB incearca sa il editeze -> trebuie refuzat
      const res = await request(app)
        .put(`/api/products/${id}`)
        .set('Authorization', `Bearer ${tokenUserB}`)
        .send({ price: 1.0 });

      expect(res.statusCode).toBe(403);
      expect(res.body.success).toBe(false);
    });

    test('respinge editarea fara autentificare', async () => {
      const created = await createProduct(tokenUserA);
      const id = created.body.data.id;

      const res = await request(app)
        .put(`/api/products/${id}`)
        .send({ price: 1.0 });

      expect(res.statusCode).toBe(401);
    });

    test('returneaza 404 la editarea unui produs inexistent', async () => {
      const res = await request(app)
        .put('/api/products/99999')
        .set('Authorization', `Bearer ${tokenUserA}`)
        .send({ price: 5.0 });

      expect(res.statusCode).toBe(404);
    });
  });

  // ============ AUTORIZARE: stergere doar resurse proprii ============
  describe('DELETE /api/products/:id - autorizare la stergere', () => {
    test('proprietarul isi poate sterge propriul produs', async () => {
      const created = await createProduct(tokenUserA);
      const id = created.body.data.id;

      const res = await request(app)
        .delete(`/api/products/${id}`)
        .set('Authorization', `Bearer ${tokenUserA}`);

      expect(res.statusCode).toBe(200);

      // verificam ca produsul chiar a disparut
      const check = await request(app).get(`/api/products/${id}`);
      expect(check.statusCode).toBe(404);
    });

    test('un alt utilizator NU poate sterge produsul altuia', async () => {
      const created = await createProduct(tokenUserA);
      const id = created.body.data.id;

      const res = await request(app)
        .delete(`/api/products/${id}`)
        .set('Authorization', `Bearer ${tokenUserB}`);

      expect(res.statusCode).toBe(403);

      // produsul trebuie sa existe in continuare
      const check = await request(app).get(`/api/products/${id}`);
      expect(check.statusCode).toBe(200);
    });
  });
});
