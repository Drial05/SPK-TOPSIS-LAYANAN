"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const rankingController_1 = require("../../controllers/topsis/rankingController");
const router = (0, express_1.Router)();
router.get("/", rankingController_1.getRankingPaginition);
router.get("/all-data-results", rankingController_1.getAllDataResults);
router.get("/export-topsis-results", rankingController_1.exportTopsisResults);
exports.default = router;
