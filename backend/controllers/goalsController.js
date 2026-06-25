import { pool } from "../libs/database.js";
import { mapGoal } from "../libs/helpers.js";

export const getGoals = async (req, res) => {
  try {
    const { userId } = req.body.user;
    const { rows } = await pool.query(
      `SELECT * FROM tblgoal WHERE user_id = $1 ORDER BY id DESC`,
      [userId]
    );
    res.status(200).json({ status: "success", data: rows.map(mapGoal) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const createGoal = async (req, res) => {
  try {
    const { userId } = req.body.user;
    const { name, target, current, icon, target_date } = req.body;

    if (!name || !target) {
      return res.status(400).json({ status: "failed", message: "Name and target are required" });
    }

    const { rows } = await pool.query(
      `INSERT INTO tblgoal (user_id, name, target_amount, current_amount, target_date, icon)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [userId, name, Number(target), Number(current || 0), target_date || null, icon || "🎯"]
    );

    res.status(201).json({ status: "success", data: mapGoal(rows[0]) });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};
