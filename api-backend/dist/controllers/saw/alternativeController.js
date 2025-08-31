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
exports.importAlternatives = exports.removeAlternative = exports.editAlternative = exports.addAlternative = exports.getAlternativePagenition = exports.getAlternatives = void 0;
const alternativeModel_1 = require("../../models/saw/alternativeModel");
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const csv_parser_1 = __importDefault(require("csv-parser"));
const getAlternatives = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allAlternatives = yield (0, alternativeModel_1.getAllAlternatives)();
        res.json(allAlternatives);
    }
    catch (err) {
        console.error("Failed get Alternative", err);
        res.status(500).json({ error: "Failed get Alternative", err });
    }
});
exports.getAlternatives = getAlternatives;
const getAlternativePagenition = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const offset = (page - 1) * pageSize;
    try {
        const { data, totalRows, totalPages } = yield (0, alternativeModel_1.getAlternativesPage)(pageSize, offset);
        res.json({
            data,
            page,
            pageSize,
            totalRows,
            totalPages,
        });
    }
    catch (err) {
        console.error("Error fetching Alternatives:", err);
        return res.status(500).json({ error: "Failed to fetch Alternatives" });
    }
});
exports.getAlternativePagenition = getAlternativePagenition;
const addAlternative = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, email } = req.body;
    try {
        const result = yield (0, alternativeModel_1.createAlternative)({ name, email });
        res.status(201).json({ message: "Alternative created", result });
    }
    catch (err) {
        console.error("Error adding Alternative:", err);
        return res.status(500).json({ error: "Failed to add Alternative" });
    }
});
exports.addAlternative = addAlternative;
const editAlternative = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name, email } = req.body;
    try {
        const result = yield (0, alternativeModel_1.updateAlternative)(parseInt(id), name, email);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Alternative not found" });
        }
        res.json({ messgae: "Alternative updates", result });
    }
    catch (err) {
        console.error("Error editing Alternative:", err);
        return res.status(500).json({ error: "Failed to edit Alternative" });
    }
});
exports.editAlternative = editAlternative;
const removeAlternative = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const ids = req.body;
    if (!Array.isArray(ids)) {
        return res.status(400).json({ message: "Invalid request body" });
    }
    try {
        yield (0, alternativeModel_1.deleteAlternative)(ids);
        res.json({ message: "Alternative deleted success" });
    }
    catch (err) {
        console.error("Error deleting Alternative:", err);
        return res.status(500).json({ error: "Failed to delete Alternative" });
    }
});
exports.removeAlternative = removeAlternative;
const importAlternatives = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const file = req.file;
    if (!file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    const filePath = path_1.default.join(__dirname, "../../uploads", file.filename);
    const Alternatives = [];
    fs_1.default.createReadStream(filePath)
        .pipe((0, csv_parser_1.default)())
        .on("data", (row) => {
        console.log("Row read:", row);
        Alternatives.push({
            name: row.name,
            email: row.email,
        });
    })
        .on("end", () => __awaiter(void 0, void 0, void 0, function* () {
        try {
            for (const Alternative of Alternatives) {
                yield (0, alternativeModel_1.createAlternative)(Alternative);
            }
            fs_1.default.unlinkSync(filePath);
            res.status(201).json({ message: "Alternatives imported successfully" });
        }
        catch (err) {
            res.status(500).json({ error: "Import failed", err });
        }
    }))
        .on("error", (err) => {
        res.status(500).json({ error: "error reading csv", err });
    });
});
exports.importAlternatives = importAlternatives;
