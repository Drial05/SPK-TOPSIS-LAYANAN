"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.checkUserByToken = exports.authUser = exports.registerUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authModel_1 = require("../models/authModel");
const SECRET_KEY = process.env.JWT_SECRET || "met0de_skr1psi";
// Register a new user
const registerUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { username, telepon, email, password } = req.body;
        yield (0, authModel_1.createUser)(username, telepon, email, password);
        res.status(201).json({ message: "User registered successfully" });
    }
    catch (err) {
        res.status(500).json({ message: "Error registering user", err });
    }
});
exports.registerUser = registerUser;
// Login
const authUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const [rows] = yield (0, authModel_1.checkUsers)(email, password);
        if (rows.length === 0) {
            console.log("User not found");
            res.status(404).json({ message: "User not found" });
        }
        const user = rows[0];
        const match = yield bcrypt_1.default.compare(password, user.password);
        if (!match) {
            return res.status(401).json({ message: "Invalid credentials" });
        }
        const token = jsonwebtoken_1.default.sign({ id: user.id }, SECRET_KEY, { expiresIn: "1h" });
        res.json({ token });
    }
    catch (err) {
        console.error("Error during authentication:", err);
        res.status(500).json({ message: "Error during authentication", err });
    }
});
exports.authUser = authUser;
// Check user by token
const checkUserByToken = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userId = req.userId;
        const user = yield (0, authModel_1.getUserByToken)(userId);
        res.status(200).json({ user });
    }
    catch (err) {
        res.status(500).json({ message: "Error fetching user", err });
    }
});
exports.checkUserByToken = checkUserByToken;
