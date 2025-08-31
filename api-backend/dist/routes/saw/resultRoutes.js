"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authMiddleware_1 = require("../../middleware/authMiddleware");
const rankingController_1 = require("../../controllers/saw/rankingController");
const router = (0, express_1.Router)();
router.get("/", authMiddleware_1.authenticate, rankingController_1.getRankingPaginition);
router.get("/all-data-results", rankingController_1.getAllDataResults);
exports.default = router;
