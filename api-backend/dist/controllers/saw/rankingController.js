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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllDataResults = exports.getRankingPaginition = void 0;
const rankingModel_1 = require("../../models/saw/rankingModel");
const getRankingPaginition = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const offset = (page - 1) * pageSize;
    try {
        const { data, totalRows, totalPages } = yield (0, rankingModel_1.getRankingPage)(pageSize, offset);
        res.json({
            data,
            page,
            pageSize,
            totalRows,
            totalPages,
        });
    }
    catch (err) {
        console.error("Error fetching ranking", err);
        return res.status(500).json({ error: "Failed to fetching ranking:", err });
    }
});
exports.getRankingPaginition = getRankingPaginition;
const getAllDataResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { data } = yield (0, rankingModel_1.getAllResults)();
        res.json(data);
    }
    catch (err) {
        res.status(500).json({ error: "Failed to fetch all data results", err });
    }
});
exports.getAllDataResults = getAllDataResults;
