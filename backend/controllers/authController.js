import { pool } from "../libs/database.js";
import { comparePassword, createJWT, hashPassword } from "../libs/index.js";

export const signupUser = async (req, res) => {
  try {
    const { firstName, email, password, confirmPassword } = req.body;

    if (!firstName || !email || !password) {
      return res.status(400).json({ status: "failed", message: "Provide required fields" });
    }

    if (confirmPassword && password !== confirmPassword) {
      return res.status(400).json({ status: "failed", message: "Passwords do not match" });
    }

    const userExist = await pool.query({
      text: "SELECT EXISTS (SELECT 1 FROM tbluser WHERE email = $1) AS email_exists",
      values: [email],
    });

    if (userExist.rows[0].email_exists) {
      return res.status(409).json({ status: "failed", message: "Email already exists" });
    }

    const hashedPassword = await hashPassword(password);

    const user = await pool.query({
      text: `INSERT INTO tbluser (firstname, email, password, onboarded) VALUES ($1, $2, $3, FALSE) RETURNING *`,
      values: [firstName, email, hashedPassword],
    });

    user.rows[0].password = undefined;

    res.status(201).json({
      status: "success",
      message: "User account created successfully",
      user: user.rows[0],
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};

export const signinUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ status: "failed", message: "Provide required fields" });
    }

    const result = await pool.query({
      text: `SELECT * FROM tbluser WHERE email = $1`,
      values: [email],
    });

    const user = result.rows[0];

    if (!user) {
      return res.status(401).json({ status: "failed", message: "Invalid email or password" });
    }

    const isMatch = await comparePassword(password, user.password);

    if (!isMatch) {
      return res.status(401).json({ status: "failed", message: "Invalid email or password" });
    }

    const token = createJWT(user.id);
    user.password = undefined;

    res.status(200).json({
      status: "success",
      message: "Login successful",
      user,
      token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ status: "failed", message: error.message });
  }
};
