import { pool } from "../libs/database.js";
import { addNotification, mapSubscription } from "../libs/helpers.js";

export const getSubscriptions = async (req, res) => {
  try {
    const { userId } = req.body.user;
    const { rows } = await pool.query(
      `SELECT * FROM tblsubscription WHERE user_id = $1 ORDER BY id DESC`,
      [userId]
    );
    const data = rows.map(mapSubscription);
    const total = data.reduce((s, x) => s + x.amount, 0);
    res.status(200).json({ status: "success", data, total });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const createSubscription = async (req, res) => {
  try {
    const { userId } = req.body.user;
    const { name, amount, cycle, next_due } = req.body;

    if (!name || !amount) {
      return res.status(400).json({ status: "failed", message: "Name and amount are required" });
    }

    const { rows } = await pool.query(
      `INSERT INTO tblsubscription (user_id, name, amount, cycle, next_due)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [userId, name, Number(amount), cycle || "monthly", next_due || null]
    );

    await addNotification(userId, "Subscription added", `${name} — ₹${amount}/month`, "info");

    res.status(201).json({ status: "success", data: mapSubscription(rows[0]) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const deleteSubscription = async (req, res) => {
  try {
    const { userId } = req.body.user;
    const { id } = req.params;
    const result = await pool.query(
      `DELETE FROM tblsubscription WHERE id = $1 AND user_id = $2 RETURNING id`,
      [id, userId]
    );
    if (!result.rows.length) {
      return res.status(404).json({ status: "failed", message: "Subscription not found" });
    }
    res.status(200).json({ status: "success" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};
