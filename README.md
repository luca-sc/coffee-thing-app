# ☕ BrewMaster Cafe

BrewMaster Cafe este o platformă full-stack pentru gestionarea in timp real a fluxului unei cafenele. Interfața oferă un meniu interactiv, rezervări de mese și urmărirea comenzilor. Dashboardul de admin oferă control complet asupra produselor, comenzilor și veniturilor, protejat prin autentificare JWT.
<br><br>

 <img width="1484" height="763" alt="image" src="https://github.com/user-attachments/assets/282dfb69-1036-4f67-a550-d782282366d0" /> <img width="1458" height="756" alt="image" src="https://github.com/user-attachments/assets/bbbd6503-6ca2-43ba-9233-40efa6639eaf" /> <img width="1435" height="649" alt="image" src="https://github.com/user-attachments/assets/5578b353-c5de-41bc-83dc-dd1dabe5af43" />



<br><br>

**Stack:** Next.js · Tailwind v4 · Framer Motion · Node.js · Express · MySQL ·

<br>


## Rulare 

### Backend
```bash
cd backend
npm install
cp .env.example .env        # completează credențialele MySQL
npm run init-db             # inițializează DB (admin@brewmaster.com / admin123)
npm run dev                 # pornește pe portul 3000
```

### Frontend
```bash
cd frontend
npm install
# .env.local → NEXT_PUBLIC_API_URL=http://localhost:3000
npm run dev                 # http://localhost:3001
```

### Teste
```bash
npm test                    # toate testele
npm run test:unit           # logică business (orderService)
npm run test:integration    # auth + CRUD produse
```

<br>

## Funcționalități principale

- **Autentificare** — register/login cu JWT, parole hash-uite cu bcrypt
- **Comenzi** — tranzacții SQL atomice, flux de status: `pending → preparing → ready → delivered → paid`
- **Produse** — CRUD protejat prin `owner_id` + rol `admin`
- **Floor Plan** — stări mese în timp real (`free / occupied / reserved`)
- **Dashboard Admin** — grafice venituri (recharts), comenzi recente, rute protejate prin `AdminAuthGuard`
- **Teme Light/Dark** — variabile OKLCH, tranziții fluide, animații ambient pe hero

<br>

## Securitate

Rutele sensibile sunt protejate prin middleware JWT (`Authorization: Bearer <token>`). Fișierele `.env` și `.env.local` sunt excluse din Git.
