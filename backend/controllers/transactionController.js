import { pool } from "../libs/database.js";
import { getAccountForUser, mapTransaction } from "../libs/helpers.js";

export const getTransactions = async (req, res) => {
  try {
    const { userId } = req.body.user;
    const { df, dt, s } = req.query;

    const today = new Date();
    const sevenDaysAgo = new Date(today);
    sevenDaysAgo.setDate(today.getDate() - 30);
    const startDate = df || sevenDaysAgo.toISOString();
    const endDate = dt || today.toISOString();
    const search = s || "";

    const { rows } = await pool.query(
      `SELECT * FROM tbltransaction
       WHERE user_id = $1
         AND createdat BETWEEN $2 AND $3
         AND ($4 = '' OR description ILIKE '%' || $4 || '%' OR source ILIKE '%' || $4 || '%')
       ORDER BY createdat DESC`,
      [userId, startDate, endDate, search]
    );

    res.status(200).json({ status: "success", data: rows.map(mapTransaction) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const addTransaction = async (req, res) => {
  const client = await pool.connect();
  try {
    const { userId } = req.body.user;
    const { account_id } = req.params;
    const { description, source, amount, type, payment_method, notes, date } = req.body;

    if (!description || !source || !amount) {
      return res.status(400).json({ status: "failed", message: "Description, source, and amount are required" });
    }

    const numAmount = Number(amount);
    if (numAmount <= 0) {
      return res.status(400).json({ status: "failed", message: "Amount must be greater than 0" });
    }

    const account = await getAccountForUser(account_id, userId);
    if (!account) {
      return res.status(404).json({ status: "failed", message: "Account not found" });
    }

    const isIncome = type === "income";

    if (!isIncome && Number(account.account_balance) < numAmount) {
      return res.status(403).json({ status: "failed", message: "Insufficient balance" });
    }

    await client.query("BEGIN");

    if (isIncome) {
      await client.query(
        `UPDATE tblaccount SET account_balance = account_balance + $1, updatedat = CURRENT_TIMESTAMP WHERE id = $2`,
        [numAmount, account_id]
      );
    } else {
      await client.query(
        `UPDATE tblaccount SET account_balance = account_balance - $1, updatedat = CURRENT_TIMESTAMP WHERE id = $2`,
        [numAmount, account_id]
      );
    }

    await client.query(
      `INSERT INTO tbltransaction (user_id, description, type, status, amount, source, payment_method, notes, createdat)
       VALUES ($1, $2, $3, 'Completed', $4, $5, $6, $7, COALESCE($8, CURRENT_TIMESTAMP))`,
      [
        userId,
        description,
        isIncome ? "income" : "expense",
        numAmount,
        source,
        payment_method || "UPI",
        notes || "",
        date ? new Date(date).toISOString() : null,
      ]
    );

    await client.query("COMMIT");

    res.status(200).json({ status: "success", message: "Transaction recorded" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ status: "failed", message: error.message });
  } finally {
    client.release();
  }
};

export const deleteTransaction = async (req, res) => {
  try {
    const { userId } = req.body.user;
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM tbltransaction WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );
    if (!result.rows.length) {
      return res.status(404).json({ status: "failed", message: "Transaction not found" });
    }
    res.status(200).json({ status: "success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const transferMoneyToAccount = async (req, res) => {
  const client = await pool.connect();
  try {
    const { userId } = req.body.user;
    const { from_account, to_account, amount } = req.body;

    if (!from_account || !to_account || !amount) {
      return res.status(400).json({ status: "failed", message: "All fields are required" });
    }

    const newAmount = Number(amount);
    if (newAmount <= 0) {
      return res.status(400).json({ status: "failed", message: "Invalid amount" });
    }

    const fromAcc = await getAccountForUser(from_account, userId);
    const toAcc = await getAccountForUser(to_account, userId);

    if (!fromAcc || !toAcc) {
      return res.status(404).json({ status: "failed", message: "Account not found" });
    }

    if (newAmount > Number(fromAcc.account_balance)) {
      return res.status(403).json({ status: "failed", message: "Insufficient balance" });
    }

    await client.query("BEGIN");

    await client.query(`UPDATE tblaccount SET account_balance = account_balance - $1 WHERE id = $2`, [
      newAmount,
      from_account,
    ]);
    await client.query(`UPDATE tblaccount SET account_balance = account_balance + $1 WHERE id = $2`, [
      newAmount,
      to_account,
    ]);

    await client.query(
      `INSERT INTO tbltransaction (user_id, description, type, status, amount, source)
       VALUES ($1, $2, 'expense', 'Completed', $3, $4)`,
      [userId, `Transfer to ${toAcc.account_name}`, newAmount, fromAcc.account_name]
    );
    await client.query(
      `INSERT INTO tbltransaction (user_id, description, type, status, amount, source)
       VALUES ($1, $2, 'income', 'Completed', $3, $4)`,
      [userId, `Transfer from ${fromAcc.account_name}`, newAmount, toAcc.account_name]
    );

    await client.query("COMMIT");
    res.status(201).json({ status: "success", message: "Transfer completed" });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ status: "failed", message: error.message });
  } finally {
    client.release();
  }
};

// Legacy route — redirects to intelligence dashboard shape
export const getDashboardInformation = async (req, res) => {
  try {
    const { getDashboard } = await import("./intelligenceController.js");
    return getDashboard(req, res);
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};
