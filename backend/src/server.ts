
import app from "./app";
import { initDb, pool } from "./db";

const port = Number(process.env.PORT) || 5000;

async function start() {
  try {
    await initDb();

    app.listen(port, () => {
      console.log(`Server running on http://localhost:${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    await pool.end();
    process.exit(1);
  }
}

start();
