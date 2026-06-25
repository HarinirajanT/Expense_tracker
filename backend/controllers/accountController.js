import { pool } from "../libs/database.js";
import { getAccountForUser } from "../libs/helpers.js";

export const getAccounts = async (req, res) => {
  try {
    const { userId } = req.body.user;
    const { rows } = await pool.query(`SELECT * FROM tblaccount WHERE user_id = $1 ORDER BY id DESC`, [userId]);
    res.status(200).json({ status: "success", data: rows });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const createAccount = async (req, res) => {
  const client = await pool.connect();
  try {
    const { userId } = req.body.user;
    const { name, amount, account_number, account_type } = req.body;

    if (!name || !account_number) {
      return res.status(400).json({ status: "failed", message: "Name and account number are required" });
    }

    const existing = await client.query(
      `SELECT id FROM tblaccount WHERE account_name = $1 AND user_id = $2`,
      [name, userId]
    );
    if (existing.rows.length) {
      return res.status(409).json({ status: "failed", message: "Account already exists" });
    }

    await client.query("BEGIN");

    const balance = Number(amount || 0);
    const { rows } = await client.query(
      `INSERT INTO tblaccount (user_id, account_name, account_number, account_balance, account_type)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, name, account_number, balance, account_type || "Wallet"]
    );
    const account = rows[0];

    if (balance > 0) {
      await client.query(
        `INSERT INTO tbltransaction (user_id, description, type, status, amount, source, payment_method)
         VALUES ($1, $2, 'income', 'Completed', $3, $4, 'Cash')`,
        [userId, `${name} (Opening Balance)`, balance, name]
      );
    }

    await client.query(
      `UPDATE tbluser SET accounts = array_append(COALESCE(accounts, '{}'), $1), updatedat = CURRENT_TIMESTAMP WHERE id = $2`,
      [name, userId]
    );

    await client.query("COMMIT");

    res.status(201).json({ status: "success", data: account });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ status: "failed", message: error.message });
  } finally {
    client.release();
  }
};

export const addMoneyToAccount = async (req, res) => {
  const client = await pool.connect();
  try {
    const { userId } = req.body.user;
    const { id } = req.params;
    const { amount, payment_method } = req.body;
    const newAmount = Number(amount);

    if (!newAmount || newAmount <= 0) {
      return res.status(400).json({ status: "failed", message: "Invalid amount" });
    }

    const account = await getAccountForUser(id, userId);
    if (!account) {
      return res.status(404).json({ status: "failed", message: "Account not found" });
    }

    await client.query("BEGIN");

    const { rows } = await client.query(
      `UPDATE tblaccount SET account_balance = account_balance + $1, updatedat = CURRENT_TIMESTAMP
       WHERE id = $2 AND user_id = $3 RETURNING *`,
      [newAmount, id, userId]
    );

    await client.query(
      `INSERT INTO tbltransaction (user_id, description, type, status, amount, source, payment_method)
       VALUES ($1, $2, 'income', 'Completed', $3, $4, $5)`,
      [userId, `${rows[0].account_name} (Deposit)`, newAmount, rows[0].account_name, payment_method || "UPI"]
    );

    await client.query("COMMIT");

    res.status(200).json({ status: "success", data: rows[0] });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ status: "failed", message: error.message });
  } finally {
    client.release();
  }
};
