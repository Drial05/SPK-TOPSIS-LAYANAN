"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const topsisController_1 = require("../../controllers/topsis/topsisController");
const router = (0, express_1.Router)();
router.get("/", topsisController_1.getTopsisResults);
exports.default = router;
