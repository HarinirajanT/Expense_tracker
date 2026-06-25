import { pool } from "./database.js";

export function mapTransaction(row) {
  if (!row) return null;
  return {
    id: row.id,
    user_id: row.user_id,
    description: row.description,
    source: row.source,
    amount: Number(row.amount),
    type: row.type,
    status: row.status,
    payment_method: row.payment_method,
    notes: row.notes,
    createdat: row.createdat,
  };
}

export function mapGoal(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    target: Number(row.target_amount),
    current: Number(row.current_amount),
    target_date: row.target_date,
    icon: row.icon || '🎯',
  };
}

export function mapSubscription(row) {
  if (!row) return null;
  return {
    id: row.id,
    name: row.name,
    amount: Number(row.amount),
    cycle: row.cycle,
    next_due: row.next_due,
  };
}

export async function getUserTransactions(userId) {
  const { rows } = await pool.query(
    `SELECT * FROM tbltransaction WHERE user_id = $1 ORDER BY createdat DESC`,
    [userId]
  );
  return rows.map(mapTransaction);
}

export async function getUserGoals(userId) {
  const { rows } = await pool.query(
    `SELECT * FROM tblgoal WHERE user_id = $1 ORDER BY id DESC`,
    [userId]
  );
  return rows.map(mapGoal);
}

export async function getUserSubscriptions(userId) {
  const { rows } = await pool.query(
    `SELECT * FROM tblsubscription WHERE user_id = $1 ORDER BY id DESC`,
    [userId]
  );
  return rows.map(mapSubscription);
}

export async function getUserAccounts(userId) {
  const { rows } = await pool.query(
    `SELECT * FROM tblaccount WHERE user_id = $1 ORDER BY id DESC`,
    [userId]
  );
  return rows;
}

export async function getNetBalance(userId) {
  const { rows } = await pool.query(
    `SELECT COALESCE(SUM(account_balance), 0) AS total FROM tblaccount WHERE user_id = $1`,
    [userId]
  );
  return Number(rows[0]?.total || 0);
}

export async function getAccountForUser(accountId, userId) {
  const { rows } = await pool.query(
    `SELECT * FROM tblaccount WHERE id = $1 AND user_id = $2`,
    [accountId, userId]
  );
  return rows[0] || null;
}

export async function addNotification(userId, title, body, type = 'info') {
  await pool.query(
    `INSERT INTO tblnotification (user_id, title, body, type) VALUES ($1, $2, $3, $4)`,
    [userId, title, body, type]
  );
}
