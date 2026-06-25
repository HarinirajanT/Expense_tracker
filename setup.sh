#!/bin/bash
set -e

echo "=== Expense Tracker — Full Stack Setup ==="

export PATH="/opt/homebrew/opt/postgresql@16/bin:$PATH"

# 1. PostgreSQL
if ! command -v psql &>/dev/null; then
  echo "→ Installing PostgreSQL 16..."
  brew install postgresql@16
fi

echo "→ Starting PostgreSQL..."
brew services start postgresql@16 2>/dev/null || true
sleep 2

echo "→ Creating database..."
createdb expense_tracker 2>/dev/null || echo "  (database already exists)"

echo "→ Running schema..."
psql -d expense_tracker -f backend/script.sql

# 2. Backend
echo "→ Installing backend..."
cd backend
if [ ! -f .env ]; then
  cp .env.example .env
  # macOS Homebrew postgres uses system user, no password
  sed -i '' "s|postgresql://postgres:password@localhost|postgresql://$(whoami)@localhost|" .env 2>/dev/null || \
  sed -i "s|postgresql://postgres:password@localhost|postgresql://$(whoami)@localhost|" .env
fi
npm install
cd ..

# 3. Frontend
echo "→ Installing frontend..."
cd frontend
cp -n .env.example .env 2>/dev/null || true
npm install
cd ..

chmod +x setup.sh 2>/dev/null || true

echo ""
echo "============================================"
echo "  SETUP COMPLETE"
echo "============================================"
echo ""
echo "  Terminal 1:  cd backend && npm run dev"
echo "  Terminal 2:  cd frontend && npm run dev"
echo ""
echo "  Backend:  http://localhost:8000/api-v1/health"
echo "  Frontend: http://localhost:5174"
echo ""
echo "  Sign up → Onboarding → Dashboard"
echo "============================================"
