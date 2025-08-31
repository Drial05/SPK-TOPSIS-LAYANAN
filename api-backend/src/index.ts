import app from "./app";
import dotenv from "dotenv";
import { db } from "./utils/db";

dotenv.config();

const PORT = process.env.PORT || "3000";

async function checkDatabaseConnection() {
  try {
    const [rows] = await db.query("SELECT 1");
    console.log("Database connection successful:", rows);
  } catch (err) {
    console.error("Database connection failed:", err);
  }
}

app.listen(PORT, async () => {
  checkDatabaseConnection();
  console.log(`Server is running on http://localhost:${PORT}`);
});
