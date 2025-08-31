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
exports.exportTopsisResults = exports.getAllDataResults = exports.getRankingPaginition = void 0;
const xlsx_1 = __importDefault(require("xlsx"));
const rankingModel_1 = require("../../models/topsis/rankingModel");
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
        res.status(500).json({ message: "Failed to fetch results", error: err });
    }
});
exports.getAllDataResults = getAllDataResults;
const exportTopsisResults = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // ambil data result topsis dari tabel results
        const { data } = yield (0, rankingModel_1.getAllResults)();
        // ubah ke workshhet
        const worksheet = xlsx_1.default.utils.json_to_sheet(data, {
            header: [
                "id",
                "alternative_id",
                "alternative_name",
                "total_score",
                "ranking",
            ],
        });
        const workbook = xlsx_1.default.utils.book_new();
        xlsx_1.default.utils.book_append_sheet(workbook, worksheet, "Topsis Results");
        // simpan ke buffer
        const buffer = xlsx_1.default.write(workbook, { type: "buffer", bookType: "xlsx" });
        // kirim sebagai file donwload
        res.setHeader("Content-Disposition", "attachment; filename=topsis_results.xlsx");
        res.setHeader("Content-Type", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet");
        res.send(buffer);
    }
    catch (err) {
        res.status(500).json({ message: "Failed to export tosis", error: err });
    }
});
exports.exportTopsisResults = exportTopsisResults;
