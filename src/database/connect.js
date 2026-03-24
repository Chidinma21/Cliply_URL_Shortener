import pkg from "pg";
const { Pool } = pkg;
import config from "../config.js";

const pool = new Pool({
  user: config.db.user,
  host: config.db.host,
  database: config.db.database,
  password: config.db.password,
  port: config.db.port,
});

export async function connectWithRetry(retries = 5, delay = 2000) {
  while (retries > 0) {
    try {
      const client = await pool.connect();
      console.log("Database connected successfully");
      client.release();
      return;
    } catch (err) {
      retries--;
      console.error(
        `DB Connection failed. Retries left: ${retries}. Waiting ${delay}ms...`,
      );

      if (retries === 0) {
        console.error(
          "FAILED to connect to DB after multiple attempts. Exiting...",
        );
        process.exit(1);
      }

      await new Promise((res) => setTimeout(res, delay));
      delay *= 2;
    }
  }
}

export { pool };
