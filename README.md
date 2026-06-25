# Smart Expense Tracker

Full-stack expense tracking application with accounts, transactions, dashboards, and data visualization.

**Live repo:** [github.com/HarinirajanT/Expense_tracker](https://github.com/HarinirajanT/Expense_tracker)

## Features

- User registration & JWT authentication
- Multiple accounts with balances
- Add expenses & deposit money
- Dashboard with income vs expense charts (Recharts)
- Transaction history with filtering
- PostgreSQL database

## Tech Stack

| Layer | Technologies |
|-------|-------------|
| Frontend | React, Vite, Tailwind CSS, Recharts, Zustand, React Router |
| Backend | Node.js, Express, PostgreSQL, JWT, bcrypt |
| Database | PostgreSQL |

## Project Structure

```
Expense_tracker/
├── backend/          # Express API
│   ├── controllers/
│   ├── routes/
│   ├── middleware/
│   ├── libs/
│   └── script.sql    # Database schema
└── frontend/         # React app
    └── src/
        ├── pages/
        ├── components/
        └── libs/
```

## Setup

### 1. Database

Create a PostgreSQL database and run the schema:

```bash
psql -U postgres -c "CREATE DATABASE expense_tracker;"
psql -U postgres -d expense_tracker -f backend/script.sql
```

### 2. Backend

```bash
cd backend
cp .env.example .env
# Edit .env with your DATABASE_URI and JWT_SECRET
npm install
npm start
```

API runs at **http://localhost:8000**

### 3. Frontend

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

App runs at **http://localhost:5173**

## API Routes

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api-v1/auth/sign-up` | Register |
| POST | `/api-v1/auth/sign-in` | Login |
| GET | `/api-v1/transaction/dashboard` | Dashboard stats |
| GET | `/api-v1/transaction/` | List transactions |
| POST | `/api-v1/transaction/add-transaction/:account_id` | Add expense |
| GET | `/api-v1/account/` | List accounts |
| POST | `/api-v1/account/create` | Create account |
| PUT | `/api-v1/account/add-money/:id` | Deposit money |

## Author

**Harini T** — [GitHub](https://github.com/HarinirajanT) · harinirajan2004t@gmail.com
