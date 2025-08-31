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
exports.getAllResults = exports.getRankingPage = void 0;
const db_1 = require("../../utils/db");
const getRankingPage = (pageSize, offset) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.db.query(`SELECT 
        r.id,
        r.alternative_id,
        c.name AS alternative_name,
        r.total_score,
        r.ranking 
    FROM results_topsis r
    JOIN alternative_topsis c ON r.alternative_id = c.id
    ORDER BY r.ranking ASC
    LIMIT ? OFFSET ?`, [pageSize, offset]);
    const [countResult] = yield db_1.db.query("SELECT COUNT(*) as total FROM results_topsis");
    const totalRows = countResult[0].total;
    const totalPages = Math.ceil(totalRows / pageSize);
    return {
        data: rows,
        totalRows,
        totalPages,
    };
});
exports.getRankingPage = getRankingPage;
const getAllResults = () => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.db.query(`SELECT 
        r.id,
        r.alternative_id,
        a.name AS alternative_name,
        r.total_score,
        r.ranking 
    FROM results_topsis r
    JOIN alternative_topsis a ON r.alternative_id = a.id
    ORDER BY r.ranking ASC`);
    return {
        data: rows,
    };
});
exports.getAllResults = getAllResults;
