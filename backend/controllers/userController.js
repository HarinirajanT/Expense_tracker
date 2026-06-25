import { pool } from "../libs/database.js";
import { comparePassword, hashPassword } from "../libs/index.js";
import { addNotification } from "../libs/helpers.js";

export const getUser = async (req, res) => {
  try {
    const { userId } = req.body.user;
    const { rows } = await pool.query(`SELECT * FROM tbluser WHERE id = $1`, [userId]);
    const user = rows[0];
    if (!user) {
      return res.status(404).json({ status: "failed", message: "User not found" });
    }
    user.password = undefined;
    res.status(200).json({ status: "success", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const completeOnboarding = async (req, res) => {
  const client = await pool.connect();
  try {
    const { userId } = req.body.user;
    const { monthlyIncome, currentSavings, currency, goalName, goalTarget, targetDate } = req.body;

    await client.query("BEGIN");

    const { rows: userRows } = await client.query(
      `UPDATE tbluser SET
        onboarded = TRUE,
        monthly_income = $1,
        current_savings = $2,
        currency = $3,
        updatedat = CURRENT_TIMESTAMP
       WHERE id = $4 RETURNING *`,
      [Number(monthlyIncome || 0), Number(currentSavings || 0), currency || "INR", userId]
    );

    if (!userRows.length) {
      await client.query("ROLLBACK");
      return res.status(404).json({ status: "failed", message: "User not found" });
    }

    const { rows: existingAccounts } = await client.query(
      `SELECT id FROM tblaccount WHERE user_id = $1 LIMIT 1`,
      [userId]
    );

    if (!existingAccounts.length) {
      const balance = Number(currentSavings || 0);
      await client.query(
        `INSERT INTO tblaccount (user_id, account_name, account_number, account_balance, account_type)
         VALUES ($1, 'Primary Wallet', 'WAL-001', $2, 'Wallet')`,
        [userId, balance]
      );
    }

    if (Number(monthlyIncome) > 0) {
      await client.query(
        `INSERT INTO tbltransaction (user_id, description, type, status, amount, source, payment_method, notes)
         VALUES ($1, 'Monthly Income (Setup)', 'income', 'Completed', $2, 'Income', 'Bank', 'Recorded during onboarding')`,
        [userId, Number(monthlyIncome)]
      );
    }

    if (goalName && Number(goalTarget) > 0) {
      await client.query(
        `INSERT INTO tblgoal (user_id, name, target_amount, current_amount, target_date, icon)
         VALUES ($1, $2, $3, 0, $4, '🎯')`,
        [userId, goalName, Number(goalTarget), targetDate || null]
      );
    }

    await client.query("COMMIT");

    await addNotification(userId, "Welcome!", "Your account is set up. Start tracking expenses.", "success");

    const user = userRows[0];
    user.password = undefined;
    res.status(200).json({ status: "success", user });
  } catch (error) {
    await client.query("ROLLBACK");
    console.error(error);
    res.status(500).json({ status: "failed", message: error.message });
  } finally {
    client.release();
  }
};

export const changePassword = async (req, res) => {
  try {
    const { userId } = req.body.user;
    const { currentPassword, newPassword, confirmPassword } = req.body;

    const { rows } = await pool.query(`SELECT * FROM tbluser WHERE id = $1`, [userId]);
    const user = rows[0];
    if (!user) {
      return res.status(404).json({ status: "failed", message: "User not found" });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ status: "failed", message: "New passwords do not match" });
    }

    const isMatch = await comparePassword(currentPassword, user.password);
    if (!isMatch) {
      return res.status(401).json({ status: "failed", message: "Invalid current password" });
    }

    const hashedPassword = await hashPassword(newPassword);
    await pool.query(`UPDATE tbluser SET password = $1, updatedat = CURRENT_TIMESTAMP WHERE id = $2`, [
      hashedPassword,
      userId,
    ]);

    res.status(200).json({ status: "success", message: "Password changed successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const updateUser = async (req, res) => {
  try {
    const { userId } = req.body.user;
    const { firstname, lastname, country, currency, contact } = req.body;

    const { rows } = await pool.query(
      `UPDATE tbluser SET firstname = COALESCE($1, firstname), lastname = $2, country = $3,
       currency = COALESCE($4, currency), contact = $5, updatedat = CURRENT_TIMESTAMP
       WHERE id = $6 RETURNING *`,
      [firstname, lastname, country, currency, contact, userId]
    );

    if (!rows.length) {
      return res.status(404).json({ status: "failed", message: "User not found" });
    }

    rows[0].password = undefined;
    res.status(200).json({ status: "success", user: rows[0] });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};
