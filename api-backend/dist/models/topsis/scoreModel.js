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
exports.createScore = exports.getScoresPage = exports.getScores = void 0;
exports.updateScore = updateScore;
exports.deleteScores = deleteScores;
const db_1 = require("../../utils/db");
const getScores = () => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.db.query("SELECT * FROM scores_topsis");
    return rows;
});
exports.getScores = getScores;
const getScoresPage = (pageSize, offset) => __awaiter(void 0, void 0, void 0, function* () {
    // ambil data candidate berdasarkan limit dan offset
    const [alternativeRows] = yield db_1.db.query(`SELECT id, name FROM alternative_topsis ORDER BY id LIMIT ? OFFSET ?`, [pageSize, offset]);
    //console.log("Alternative hasil query", alternativeRows);
    const alternatives = alternativeRows;
    const alternativeIds = alternatives.map((c) => c.id);
    if (alternativeIds.length === 0) {
        return {
            data: [],
            totalRows: 0,
            totalPages: 0,
        };
    }
    // buat placefolder untuk IN
    const placeholders = alternativeIds.map(() => "?").join(",");
    const query = `
        SELECT s.id, s.alternative_id, c.name AS alternative_name,
              s.criteria_id, cr.name AS criteria_name, s.value
        FROM scores_topsis s
        JOIN alternative_topsis c ON s.alternative_id = c.id
        JOIN criteria_topsis cr ON s.criteria_id = cr.id 
        WHERE s.alternative_id IN (${placeholders})
        ORDER BY s.alternative_id, s.criteria_id
  `;
    //console.log("SQL", query);
    //console.log("Params", alternativeIds);
    const [rows] = yield db_1.db.query(query, alternativeIds);
    const [countResult] = yield db_1.db.query("SELECT COUNT(*) as total from alternative_topsis");
    const totalRows = countResult[0].total;
    const totalPages = Math.ceil(totalRows / pageSize);
    return {
        data: rows,
        totalRows,
        totalPages,
    };
});
exports.getScoresPage = getScoresPage;
const createScore = (data) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.db.query("INSERT INTO scores_topsis (alternative_id, criteria_id, value) VALUES (?, ?, ?)", [data.alternative_id, data.criteria_id, data.value]);
});
exports.createScore = createScore;
function updateScore(updates) {
    return __awaiter(this, void 0, void 0, function* () {
        const conn = yield db_1.db.getConnection();
        try {
            yield conn.beginTransaction();
            for (const score of updates) {
                const sql = `UPDATE scores SET candidate_id = ?, criteria_id = ?, value = ? WHERE id = ?`;
                const value = [
                    score.candidate_id,
                    score.criteria_id,
                    score.value,
                    score.id,
                ];
                yield db_1.db.execute(sql, value);
            }
            yield conn.commit();
            return { message: "Scores updated successfully" };
        }
        catch (err) {
            yield conn.rollback();
            throw err;
        }
        finally {
            conn.release();
        }
    });
}
function deleteScores(ids) {
    return __awaiter(this, void 0, void 0, function* () {
        const conn = yield db_1.db.getConnection();
        try {
            const result = yield conn.query(`DELETE FROM scores_topsis WHERE alternative_id IN (?)`, [ids]);
            return result;
        }
        catch (err) {
            throw err;
        }
        finally {
            conn.release();
        }
    });
}
