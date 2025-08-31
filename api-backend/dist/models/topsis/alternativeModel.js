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
exports.deleteAlternative = exports.updateAlternative = exports.createAlternative = exports.getAlternativePage = exports.getAlternatives = void 0;
const db_1 = require("../../utils/db");
const getAlternatives = () => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.db.query("SELECT * FROM alternative_topsis");
    return rows;
});
exports.getAlternatives = getAlternatives;
const getAlternativePage = (pageSize, offset) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.db.query("SELECT * FROM alternative_topsis LIMIT ? OFFSET ?", [pageSize, offset]);
    const [countResult] = yield db_1.db.query("SELECT COUNT(*) as total from alternative_topsis");
    const totalRows = countResult[0].total;
    const totalPages = Math.ceil(totalRows / pageSize);
    return {
        data: rows,
        totalRows,
        totalPages,
    };
});
exports.getAlternativePage = getAlternativePage;
const createAlternative = (alternative) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.db.query("INSERT INTO alternative_topsis (name) VALUES (?)", [
        alternative.name,
    ]);
});
exports.createAlternative = createAlternative;
const updateAlternative = (id, name) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.db.execute("UPDATE alternative_topsis SET name = ? WHERE id = ?", [name, id]);
    return result;
});
exports.updateAlternative = updateAlternative;
const deleteAlternative = (ids) => __awaiter(void 0, void 0, void 0, function* () {
    const conn = yield db_1.db.getConnection();
    try {
        const result = yield conn.query(`DELETE FROM alternative_topsis WHERE id IN (?)`, [ids]);
        return result;
    }
    catch (err) {
        throw err;
    }
    finally {
        conn.release();
    }
    // const [result] = await db.execute<ResultSetHeader>(
    //   "DELETE FROM alternative_topsis WHERE id = ?",
    //   [id]
    // );
    // return result;
});
exports.deleteAlternative = deleteAlternative;
