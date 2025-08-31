"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const scoreController_1 = require("../../controllers/saw/scoreController");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = (0, express_1.Router)();
const storage = multer_1.default.diskStorage({
    destination: "./src/uploads",
    filename: (req, file, cb) => {
        cb(null, "import_" + Date.now() + path_1.default.extname(file.originalname));
    },
});
const upload = (0, multer_1.default)({ storage });
router.get("/", authMiddleware_1.authenticate, scoreController_1.getScores);
router.post("/", authMiddleware_1.authenticate, scoreController_1.addScore);
router.put("/", authMiddleware_1.authenticate, scoreController_1.editScore);
router.delete("/", authMiddleware_1.authenticate, scoreController_1.removeScoresByCandidate);
router.post("/import-scores-candidates", upload.single("file"), scoreController_1.importScoresFromFile);
exports.default = router;
