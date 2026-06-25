# Expense Tracker — Full Stack Setup

Personal finance app: **React + Node.js + PostgreSQL**

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React, Vite, Tailwind, Recharts |
| Backend | Node.js, Express, JWT, bcrypt |
| Database | PostgreSQL |

---

## Quick Start (with Docker)

### 1. Start PostgreSQL

```bash
cd Expense_tracker
docker compose up -d
```

This creates the database and runs `backend/script.sql` automatically.

### 2. Backend

```bash
cd backend
cp .env.example .env
npm install
npm start
```

Server runs at **http://localhost:8000**  
Health check: **http://localhost:8000/api-v1/health**

### 3. Frontend (production mode — uses real API)

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Open **http://localhost:5174**

> Set `VITE_DEMO_MODE=false` in `frontend/.env` to use PostgreSQL instead of browser storage.

---

## Manual PostgreSQL (no Docker)

```bash
createdb expense_tracker
psql -U postgres -d expense_tracker -f backend/script.sql
```

Update `DATABASE_URI` in `backend/.env`:

```
DATABASE_URI=postgresql://postgres:YOUR_PASSWORD@localhost:5432/expense_tracker
```

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Example |
|----------|---------|
| `DATABASE_URI` | `postgresql://postgres:password@localhost:5432/expense_tracker` |
| `JWT_SECRET` | long random string |
| `PORT` | `8000` |
| `CLIENT_URL` | `http://localhost:5174` |

### Frontend (`frontend/.env`)

| Variable | Example |
|----------|---------|
| `VITE_DEMO_MODE` | `false` for full stack, `true` for offline demo |
| `VITE_API_URL` | `http://localhost:8000/api-v1` |

---

## API Routes

| Method | Route | Description |
|--------|-------|-------------|
| POST | `/auth/sign-up` | Register |
| POST | `/auth/sign-in` | Login → JWT |
| POST | `/user/onboarding` | First-time setup |
| GET | `/intelligence/dashboard` | Dashboard data |
| GET | `/intelligence/analytics` | Charts |
| GET | `/intelligence/insights` | Spending insights |
| GET/POST | `/transaction/` | List / add transactions |
| GET/POST | `/account/` | Accounts |
| GET/POST | `/goals` | Savings goals |
| GET/POST/DELETE | `/subscriptions` | Subscriptions |

All routes except auth require header: `Authorization: Bearer <token>`

---

## User Flow

```
Sign up → Onboarding → Dashboard → Add accounts & transactions
```

Data is stored in **PostgreSQL** — each user only sees their own data.

---

## Demo Mode (no database)

Set `VITE_DEMO_MODE=true` in `frontend/.env` — runs entirely in browser localStorage. Useful for UI preview without PostgreSQL.

---

## Project Structure

```
Expense_tracker/
├── backend/
│   ├── controllers/    # API logic
│   ├── routes/         # Express routes
│   ├── libs/           # DB, JWT, finance engine
│   ├── script.sql      # Database schema
│   └── index.js
├── frontend/
│   └── src/
│       ├── pages/      # Dashboard, Transactions, etc.
│       └── libs/       # API client, demo mode
└── docker-compose.yml
```
