# Expense Tracker — Full Stack

**React + Node.js + PostgreSQL** — complete personal finance app.

GitHub: https://github.com/HarinirajanT/Expense_tracker

---

## One-Command Setup

```bash
chmod +x setup.sh && ./setup.sh
```

Then open **two terminals**:

```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm run dev
```

Open **http://localhost:5174** → Sign up → Onboarding → Dashboard

---

## What's Included

| Feature | Frontend | Backend | Database |
|---------|----------|---------|----------|
| Auth (JWT + bcrypt) | ✅ | ✅ | tbluser |
| Onboarding | ✅ | ✅ | tbluser |
| Dashboard + insights | ✅ | ✅ | tbltransaction |
| Transactions (income/expense) | ✅ | ✅ | tbltransaction |
| Accounts | ✅ | ✅ | tblaccount |
| Analytics charts | ✅ | ✅ | — |
| Goals | ✅ | ✅ | tblgoal |
| Subscriptions | ✅ | ✅ | tblsubscription |

---

## Tech Stack

- **Frontend:** React, Vite, Tailwind, Recharts, Framer Motion
- **Backend:** Node.js, Express, jose (JWT), bcrypt
- **Database:** PostgreSQL 16

---

## Environment

### `backend/.env`
```
DATABASE_URI=postgresql://YOUR_USER@localhost:5432/expense_tracker
JWT_SECRET=your_long_random_secret
PORT=8000
CLIENT_URL=http://localhost:5174
```

### `frontend/.env`
```
VITE_DEMO_MODE=false
VITE_API_URL=http://localhost:8000/api-v1
```

Set `VITE_DEMO_MODE=true` to run without PostgreSQL (browser-only demo).

---

## API Health Check

```
GET http://localhost:8000/api-v1/health
→ { "status": "ok", "database": "connected" }
```

---

## Project Structure

```
Expense_tracker/
├── setup.sh              ← run this first
├── docker-compose.yml    ← optional Docker PostgreSQL
├── backend/
│   ├── script.sql        ← database schema
│   ├── controllers/
│   ├── routes/
│   └── index.js
└── frontend/
    └── src/pages/        ← Dashboard, Transactions, etc.
```

---

## Resume Line

> Developed a Financial Intelligence Platform using React, Node.js, PostgreSQL, and interactive data visualizations. Implemented secure JWT authentication, transaction management, spending analytics, goal tracking, subscription monitoring, and rule-based financial insights.
