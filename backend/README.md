# Coffee Thing App — Backend (Node + Express + MySQL)

Backend pentru aplicatia `coffee-thing-app`, construit pentru cele 3 zone de
testare din cerinta:

| # | Functionalitate                  | Tip        | Acoperit de |
|---|----------------------------------|------------|-------------|
| 1 | Autentificare (register + login) | Integrare  | `tests/integration/auth.test.js` |
| 2 | Logica de business principala    | Unitar     | `tests/unit/orderService.test.js` |
| 3 | Operatii CRUD                    | Integrare  | `tests/integration/products.test.js` |

---

## 1. Cerinte preliminare

- **Node.js** 18+ si npm
- **MySQL** 8+ pornit local (pe portul 3306)

## 2. Instalare

```bash
cd backend
npm install
```

## 3. Configurare

Copiaza `.env.example` in `.env` si completeaza datele tale MySQL:

```bash
copy .env.example .env      # Windows
```

Editeaza `.env` — `DB_USER` si `DB_PASSWORD` trebuie sa fie un cont MySQL
valid. Backend-ul ruleaza pe **portul 3000** si accepta CORS de la
**localhost:5173** (Vite), conform listei de verificare integrare.

## 4. Initializarea bazei de date

Creeaza baza de date de productie (tabele, utilizator admin, produse):

```bash
npm run init-db
```

Creeaza baza de date de TEST (separata, folosita de teste):

```bash
npm run init-db:test
```

Ambele comenzi pot fi rulate de mai multe ori in siguranta (sterg si
recreeaza tabelele). Cont admin creat implicit:
`admin@brewmaster.com` / `admin123`

## 5. Pornirea serverului

```bash
npm start        # productie
npm run dev      # dezvoltare (reincarcare automata cu nodemon)
```

## 6. Rularea testelor

```bash
npm test                 # toate testele
npm run test:unit        # doar testele unitare (Task 2)
npm run test:integration # doar testele de integrare (Task 1 + 3)
```

Testele de integrare au nevoie de baza de date de test initializata
(`npm run init-db:test` din pasul 4).

---

## Structura proiectului

```
backend/
├── database/
│   └── schema.sql              schema MySQL (tabele + indecsi + seed mese)
├── src/
│   ├── config/db.js            pool de conexiuni MySQL
│   ├── controllers/
│   │   ├── authController.js   Task 1: register + login
│   │   ├── productController.js Task 3: CRUD + autorizare proprietar
│   │   └── orderController.js  Task 2 (integrat cu baza de date)
│   ├── middleware/
│   │   ├── authMiddleware.js   verificare token JWT + roluri
│   │   └── errorHandler.js     tratare erori + rute 404
│   ├── routes/                 definirea rutelor API
│   ├── services/
│   │   └── orderService.js     Task 2: logica de business PURA (testabila)
│   ├── scripts/init-db.js      initializarea bazei de date
│   ├── app.js                  configurarea aplicatiei Express
│   └── server.js               pornirea serverului
└── tests/
    ├── unit/                   teste unitare (logica de business)
    └── integration/            teste de integrare (API + baza de date)
```

## Rutele API

| Metoda | Ruta                       | Protejat | Descriere |
|--------|----------------------------|----------|-----------|
| POST   | `/api/auth/register`       | nu       | Inregistrare utilizator |
| POST   | `/api/auth/login`          | nu       | Autentificare |
| GET    | `/api/auth/me`             | da       | Date utilizator curent |
| GET    | `/api/products`            | nu       | Lista produse (`?category=`) |
| GET    | `/api/products/:id`        | nu       | Un produs |
| POST   | `/api/products`            | da       | Creare produs |
| PUT    | `/api/products/:id`        | da       | Editare (doar proprietar/admin) |
| DELETE | `/api/products/:id`        | da       | Stergere (doar proprietar/admin) |
| GET    | `/api/orders`              | da       | Lista comenzi |
| GET    | `/api/orders/:id`          | da       | O comanda cu liniile ei |
| POST   | `/api/orders`              | da       | Creare comanda (calcul total) |
| PUT    | `/api/orders/:id/status`   | da       | Schimbare stare comanda |
| GET    | `/api/health`              | nu       | Verificare stare server |

## Note de proiectare

- **Parolele** sunt stocate hash-uite cu `bcrypt` (cost 10), niciodata in clar.
- **Tokenul JWT** se trimite in antetul `Authorization: Bearer <token>` —
  exact ce adauga interceptorul de cerere Axios din frontend.
- **Autorizarea CRUD**: produsele au o coloana `owner_id`; doar proprietarul
  sau un `admin` poate edita/sterge un produs.
- **Logica de business** (`orderService.js`) este izolata in functii pure,
  fara dependinte de retea sau baza de date — usor de testat unitar.
- **Comenzile** se salveaza intr-o tranzactie MySQL (comanda + linii =
  totul sau nimic).
