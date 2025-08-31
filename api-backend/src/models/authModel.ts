import { db } from "../utils/db";
import { RowDataPacket } from "mysql2";
import bcrypt from "bcrypt";

export const checkUsers = async (email: string, password: string) => {
  const result = await db.execute<RowDataPacket[]>(
    "SELECT * FROM users WHERE email = ?",
    [email]
  );
  return result;
};

export const createUser = async (
  username: string,
  telepon: string,
  email: string,
  password: string
) => {
  const hashedPassword = await bcrypt.hash(password, 10);
  const result = await db.execute(
    "INSERT INTO users (username, telepon, email, password) VALUES (?, ?, ?, ?)",
    [username, telepon, email, hashedPassword]
  );
  return result;
};

export const getUserByToken = async (id: number) => {
  const [rows] = await db.execute(
    "SELECT id, username, telepon, email, role FROM users WHERE id = ?",
    [id]
  );
  return rows;
};
