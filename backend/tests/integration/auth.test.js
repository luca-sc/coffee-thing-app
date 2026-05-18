/**
 * tests/integration/auth.test.js
 * ---------------------------------------------------------------------
 * TESTE DE INTEGRARE pentru autentificare (Task 1 din cerinta).
 *
 * Conform tabelului: "Succes, email duplicat, credentiale invalide,
 * campuri lipsa". Aceste teste pornesc aplicatia Express reala si
 * lovesc rutele /api/auth/register si /api/auth/login printr-un
 * client HTTP (supertest), folosind baza de date de TEST.
 * ---------------------------------------------------------------------
 */
const request = require('supertest');
const app = require('../../src/app');
const { resetDatabase, closeDatabase } = require('../setup');

describe('Autentificare /api/auth (teste de integrare)', () => {

  // curatam baza de date inainte de fiecare test
  beforeEach(async () => {
    await resetDatabase();
  });

  // inchidem conexiunile dupa toate testele
  afterAll(async () => {
    await closeDatabase();
  });

  // ============ REGISTER ============
  describe('POST /api/auth/register', () => {

    // --- caz: succes ---
    test('inregistreaza un utilizator nou cu succes', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'Ion Popescu',
          email: 'ion@example.com',
          password: 'parola123',
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('ion@example.com');
      expect(res.body.data.token).toBeDefined();
      // parola NU trebuie returnata niciodata
      expect(res.body.data.user.password).toBeUndefined();
      expect(res.body.data.user.password_hash).toBeUndefined();
    });

    // --- caz: email duplicat ---
    test('respinge inregistrarea cu email duplicat', async () => {
      const userData = {
        name: 'Primul User',
        email: 'duplicat@example.com',
        password: 'parola123',
      };
      // prima inregistrare reuseste
      await request(app).post('/api/auth/register').send(userData);

      // a doua cu acelasi email trebuie sa esueze
      const res = await request(app)
        .post('/api/auth/register')
        .send({ ...userData, name: 'Al doilea User' });

      expect(res.statusCode).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toMatch(/email/i);
    });

    // --- caz: campuri lipsa ---
    test('respinge inregistrarea fara email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Fara Email', password: 'parola123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('respinge inregistrarea fara parola', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Fara Parola', email: 'test@example.com' });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
    });

    test('respinge inregistrarea cu corp gol', async () => {
      const res = await request(app).post('/api/auth/register').send({});
      expect(res.statusCode).toBe(400);
    });

    // --- caz: validari suplimentare ---
    test('respinge formatul invalid de email', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'email-invalid', password: 'parola123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/email/i);
    });

    test('respinge parola prea scurta', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ name: 'Test', email: 'test@example.com', password: '123' });

      expect(res.statusCode).toBe(400);
      expect(res.body.error).toMatch(/parola/i);
    });
  });

  // ============ LOGIN ============
  describe('POST /api/auth/login', () => {

    // inregistram un utilizator inainte de testele de login
    beforeEach(async () => {
      await request(app).post('/api/auth/register').send({
        name: 'User Login',
        email: 'login@example.com',
        password: 'parolaCorecta',
      });
    });

    // --- caz: succes ---
    test('autentifica cu credentiale corecte', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'parolaCorecta' });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.user.email).toBe('login@example.com');
    });

    // --- caz: credentiale invalide (parola gresita) ---
    test('respinge parola gresita', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com', password: 'parolaGresita' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    // --- caz: credentiale invalide (email inexistent) ---
    test('respinge emailul inexistent', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'nuexista@example.com', password: 'parolaCorecta' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });

    // --- caz: campuri lipsa ---
    test('respinge login-ul fara parola', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'login@example.com' });

      expect(res.statusCode).toBe(400);
    });
  });

  // ============ RUTA PROTEJATA ============
  describe('GET /api/auth/me (ruta protejata)', () => {
    test('permite accesul cu token valid', async () => {
      const reg = await request(app).post('/api/auth/register').send({
        name: 'User Me',
        email: 'me@example.com',
        password: 'parola123',
      });
      const token = reg.body.data.token;

      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.email).toBe('me@example.com');
    });

    test('respinge accesul fara token', async () => {
      const res = await request(app).get('/api/auth/me');
      expect(res.statusCode).toBe(401);
    });

    test('respinge accesul cu token invalid', async () => {
      const res = await request(app)
        .get('/api/auth/me')
        .set('Authorization', 'Bearer token.fals.invalid');

      expect(res.statusCode).toBe(401);
    });
  });
});
