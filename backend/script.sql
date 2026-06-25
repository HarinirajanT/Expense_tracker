-- Expense Tracker — full database schema
-- Run: psql -U postgres -d expense_tracker -f script.sql

DROP TABLE IF EXISTS tblnotification CASCADE;
DROP TABLE IF EXISTS tblsubscription CASCADE;
DROP TABLE IF EXISTS tblgoal CASCADE;
DROP TABLE IF EXISTS tbltransaction CASCADE;
DROP TABLE IF EXISTS tblaccount CASCADE;
DROP TABLE IF EXISTS tbluser CASCADE;

CREATE TABLE tbluser (
  id SERIAL PRIMARY KEY,
  email VARCHAR(120) UNIQUE NOT NULL,
  firstname VARCHAR(50) NOT NULL,
  lastname VARCHAR(50),
  contact VARCHAR(15),
  accounts TEXT[],
  password TEXT NOT NULL,
  provider VARCHAR(10),
  country TEXT,
  currency VARCHAR(5) NOT NULL DEFAULT 'INR',
  onboarded BOOLEAN NOT NULL DEFAULT FALSE,
  monthly_income NUMERIC(12, 2) DEFAULT 0,
  current_savings NUMERIC(12, 2) DEFAULT 0,
  createdat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tblaccount (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES tbluser(id) ON DELETE CASCADE,
  account_name VARCHAR(50) NOT NULL,
  account_number VARCHAR(50) NOT NULL,
  account_balance NUMERIC(12, 2) NOT NULL DEFAULT 0,
  account_type VARCHAR(30) DEFAULT 'Wallet',
  createdat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tbltransaction (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES tbluser(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  status VARCHAR(10) NOT NULL DEFAULT 'Completed',
  source VARCHAR(100) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  type VARCHAR(10) NOT NULL DEFAULT 'expense',
  payment_method VARCHAR(30) DEFAULT 'UPI',
  notes TEXT DEFAULT '',
  createdat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tblgoal (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES tbluser(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  target_amount NUMERIC(12, 2) NOT NULL,
  current_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
  target_date DATE,
  icon VARCHAR(10) DEFAULT '🎯',
  createdat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tblsubscription (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES tbluser(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  amount NUMERIC(12, 2) NOT NULL,
  cycle VARCHAR(20) NOT NULL DEFAULT 'monthly',
  next_due DATE,
  createdat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE tblnotification (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES tbluser(id) ON DELETE CASCADE,
  title VARCHAR(150) NOT NULL,
  body TEXT NOT NULL,
  type VARCHAR(20) DEFAULT 'info',
  read BOOLEAN NOT NULL DEFAULT FALSE,
  createdat TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transaction_user ON tbltransaction(user_id);
CREATE INDEX idx_account_user ON tblaccount(user_id);
CREATE INDEX idx_goal_user ON tblgoal(user_id);
CREATE INDEX idx_subscription_user ON tblsubscription(user_id);
