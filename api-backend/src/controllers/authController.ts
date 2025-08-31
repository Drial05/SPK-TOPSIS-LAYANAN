import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { checkUsers, createUser, getUserByToken } from "../models/authModel";

const SECRET_KEY = process.env.JWT_SECRET || "met0de_skr1psi";

// Register a new user
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { username, telepon, email, password } = req.body;
    await createUser(username, telepon, email, password);
    res.status(201).json({ message: "User registered successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error registering user", err });
  }
};

// Login
export const authUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const [rows] = await checkUsers(email, password);

    if (rows.length === 0) {
      console.log("User not found");
      res.status(404).json({ message: "User not found" });
    }

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign({ id: user.id }, SECRET_KEY, { expiresIn: "1h" });
    res.json({ token });
  } catch (err) {
    console.error("Error during authentication:", err);
    res.status(500).json({ message: "Error during authentication", err });
  }
};

// Check user by token
export const checkUserByToken = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const user = await getUserByToken(userId);
    res.status(200).json({ user });
  } catch (err) {
    res.status(500).json({ message: "Error fetching user", err });
  }
};
