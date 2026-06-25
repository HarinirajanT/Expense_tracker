import pg from "pg";
import dotenv from "dotenv";

dotenv.config();

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URI,
  ssl: process.env.DATABASE_URI?.includes('localhost')
    ? false
    : { rejectUnauthorized: false },
});
