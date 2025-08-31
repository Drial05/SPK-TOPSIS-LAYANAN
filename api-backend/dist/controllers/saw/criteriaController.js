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
exports.removeCriteria = exports.editCriteria = exports.addCriteria = exports.getCriteria = void 0;
const criteriaModel_1 = require("../../models/saw/criteriaModel");
const getCriteria = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const offset = (page - 1) * pageSize;
    try {
        const { data, totalRows, totalPages } = yield (0, criteriaModel_1.getAllCriteria)(pageSize, offset);
        res.json({
            data,
            page,
            pageSize,
            totalRows,
            totalPages,
        });
    }
    catch (err) {
        console.error("Error fetching criteria:", err);
        return res.status(500).json({ error: "Failed to fetch criteria", err });
    }
});
exports.getCriteria = getCriteria;
const addCriteria = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, weight, type } = req.body;
    try {
        const result = yield (0, criteriaModel_1.createCreate)(name, weight, type);
        res.status(201).json({ message: "Criteria created", result });
    }
    catch (err) {
        console.error("Error adding criteria:", err);
        return res.status(500).json({ error: "Failed to add criteria", err });
    }
});
exports.addCriteria = addCriteria;
const editCriteria = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, weight, type } = req.body;
    try {
        const result = yield (0, criteriaModel_1.updateCriteria)(parseInt(id), name, weight, type);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Criteria not found" });
        }
        res.json({ message: "Criteria updated", result });
    }
    catch (err) {
        console.error("Error editing criteria:", err);
        return res.status(500).json({ error: "Failed to edit criteria", err });
    }
});
exports.editCriteria = editCriteria;
const removeCriteria = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const result = yield (0, criteriaModel_1.deleteCriteria)(parseInt(id));
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Criteria not found" });
        }
        res.json({ message: "Criteria deleted", result });
    }
    catch (err) {
        console.error("Error deleting criteria:", err);
        return res.status(500).json({ error: "Failed to deleted criteria", err });
    }
});
exports.removeCriteria = removeCriteria;
