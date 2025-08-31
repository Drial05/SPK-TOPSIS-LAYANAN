"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const sawController_1 = require("../../controllers/saw/sawController");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const router = (0, express_1.Router)();
router.get("/", authMiddleware_1.authenticate, sawController_1.getSawRanking);
exports.default = router;
