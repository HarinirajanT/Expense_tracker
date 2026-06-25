import { pool } from "./libs/database.js";

export async function testConnection() {
  try {
    const result = await pool.query("SELECT NOW()");
    console.log("Database connected:", result.rows[0].now);
    return true;
  } catch (error) {
    console.error("Database connection failed:", error.message);
    return false;
  }
}

if (process.argv[1]?.includes("test.js")) {
  testConnection().then((ok) => process.exit(ok ? 0 : 1));
}
