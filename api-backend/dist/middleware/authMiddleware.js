"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const SECRET_KEY = process.env.JWT_SECRET;
if (!SECRET_KEY)
    throw new Error("JWT_SECRET is not defined in environment variables");
const authenticate = (req, res, next) => {
    var _a;
    const token = (_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.split(" ")[1];
    if (!token)
        return res.status(401).json({ message: "Unauthorized" });
    jsonwebtoken_1.default.verify(token, SECRET_KEY, (err, decode) => {
        if (err)
            return res.status(403).json({ mesaage: "Token is invalid" });
        req.userId = decode.id;
        next();
    });
};
exports.authenticate = authenticate;
