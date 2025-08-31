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
exports.deleteCriteria = exports.updateCriteria = exports.createCreate = exports.getPageCriteria = exports.getAllCriteria = void 0;
const db_1 = require("../../utils/db");
const getAllCriteria = () => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.db.query("SELECT * FROM criteria_topsis");
    return rows;
});
exports.getAllCriteria = getAllCriteria;
const getPageCriteria = (pageSize, offset) => __awaiter(void 0, void 0, void 0, function* () {
    const [rows] = yield db_1.db.query("SELECT * FROM criteria_topsis LIMIT ? OFFSET ?", [pageSize, offset]);
    const [countResult] = yield db_1.db.query("SELECT COUNT(*) as total from criteria_topsis");
    const totalRows = countResult[0].total;
    const totalPages = Math.ceil(totalRows / pageSize);
    return {
        data: rows,
        totalRows,
        totalPages,
    };
});
exports.getPageCriteria = getPageCriteria;
const createCreate = (name, weight, attribute) => __awaiter(void 0, void 0, void 0, function* () {
    yield db_1.db.query("INSERT INTO criteria_topsis (name, weight, attribute) VALUES (?, ?, ?)", [name, weight, attribute]);
});
exports.createCreate = createCreate;
const updateCriteria = (id, name, weight, attribute) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.db.execute("UPDATE criteria_topsis SET name = ?, weight = ?, attribute = ? WHERE id = ?", [name, weight, attribute, id]);
    return result;
});
exports.updateCriteria = updateCriteria;
const deleteCriteria = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const [result] = yield db_1.db.execute("DELETE FROM criteria_topsis WHERE id = ?", [id]);
    return result;
});
exports.deleteCriteria = deleteCriteria;
