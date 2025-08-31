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
exports.importScoresFromFile = exports.removeScoresByCandidate = exports.editScore = exports.addScore = exports.getScores = void 0;
const scoreModel_1 = require("../../models/saw/scoreModel");
const xlsx_1 = __importDefault(require("xlsx"));
const db_1 = require("../../utils/db");
const getScores = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const offset = (page - 1) * pageSize;
    try {
        const { data, totalRows, totalPages } = yield (0, scoreModel_1.getScoresPage)(pageSize, offset);
        res.json({
            data,
            page,
            pageSize,
            totalRows,
            totalPages,
        });
    }
    catch (err) {
        console.error("Error fetching score", err);
        return res.status(500).json({ error: "Failed to fetch scores" });
    }
});
exports.getScores = getScores;
const addScore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    try {
        if (Array.isArray(data)) {
            for (const item of data) {
                yield (0, scoreModel_1.createScore)(item);
            }
            return res.status(201).json({ message: "Multiple scores created" });
        }
        yield (0, scoreModel_1.createScore)(data);
        return res.status(201).json({ message: "Score created" });
    }
    catch (err) {
        console.error("Failed to add score...", err);
        res.status(500).json({ error: "Failed to add score", err });
    }
});
exports.addScore = addScore;
const editScore = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const updates = req.body;
    if (!Array.isArray(updates)) {
        return res.status(400).json({ message: "Invalid request body" });
    }
    try {
        const result = yield (0, scoreModel_1.updateScore)(updates);
        res.json(result);
    }
    catch (err) {
        console.error("Updated error:", err);
        res.status(500).json({ message: "Updated err", err });
    }
});
exports.editScore = editScore;
const removeScoresByCandidate = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const ids = req.body;
    if (!Array.isArray(ids)) {
        return res.status(400).json({ message: "Invalid request body" });
    }
    try {
        yield (0, scoreModel_1.deleteScoresByCandidate)(ids);
        res.json({ message: "Scores deleted for candidate" });
    }
    catch (err) {
        console.error("Deleted scores error:", err);
        res.status(500).json({ message: "Deleted scores error:", err });
    }
});
exports.removeScoresByCandidate = removeScoresByCandidate;
const importScoresFromFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file)
            return res.status(400).json({ message: "No file uploaded" });
        const workbook = xlsx_1.default.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = xlsx_1.default.utils.sheet_to_json(sheet);
        if (!rows.length)
            return res.status(400).json({ message: "No data found in file" });
        // map data kandidat dari rows
        const criteriaMap = {
            "Typeng Test": 1,
            "Sosial Media Minded": 2,
            "Pemahaman Mengenai Customer Exprience": 3,
            "History Social Media Activity": 4,
        };
        // Ambil kolom kriteria yang ada di file Excel
        const criteriaKeys = Object.keys(rows[0]).filter((key) => Object.keys(criteriaMap).includes(key));
        // Ambil data kandidat dari file
        // const alternativeData = rows.map((row: any) => ({
        //   candidate_id: row.candidate_id,
        //   name: row.name,
        //   email: row.email || null,
        // }));
        // ambil semua candidate_id dari file
        // const alternativeIds = alternativeData.map((a) => a.candidate_id);
        // cek kandidat yang sudah ada di DB
        // const [existingAlternatives] = await db.query(
        //   "SELECT id FROM candidates WHERE id IN (?)",
        //   [alternativeIds]
        // );
        // extract alternative id yang sudah ada
        // const existingIds = new Set(
        //   (existingAlternatives as any[]).map((a) => a.candidate_id)
        // );
        // filter alternative id yang belum ada
        // const newAlternatives = alternativeData.filter(
        //   (a) => !existingIds.has(a.candidate_id)
        // );
        // insert candidates baru ke DB
        // if (newAlternatives.length) {
        //   const insertData = newAlternatives.map((a) => [
        //     // a.candidate_id,
        //     a.name,
        //     a.email,
        //   ]);
        //   await db.query("INSERT INTO candidates ( name, email) VALUES ?", [
        //     insertData,
        //   ]);
        // }
        const insertCandidates = rows.map((row) => [row.name, row.email || null]);
        const [insertResult] = yield db_1.db.query("INSERT INTO candidates (name, email) VALUES ?", [insertCandidates]);
        // karena semua kandidat baru dari file
        let insertId = insertResult.insertId;
        const nameIdMap = new Map();
        rows.forEach((row) => {
            nameIdMap.set(row.name, insertId++);
        });
        // Prepare data scores untuk insert ke scores
        const values = [];
        rows.forEach((row) => {
            const candidateId = nameIdMap.get(row.name);
            if (!candidateId)
                return;
            criteriaKeys.forEach((criteriaKey) => {
                const criteriaId = criteriaMap[criteriaKey];
                const value = row[criteriaKey];
                if (value !== undefined && value !== null && value !== "") {
                    values.push([candidateId, criteriaId, value]);
                }
            });
        });
        if (!values.length)
            return res.status(400).json({ message: "No scores data found" });
        // insert scores
        yield db_1.db.query("INSERT INTO scores (candidate_id, criteria_id, value) VALUES ?", [values]);
        res.json({
            message: "Scores imported  candidate successfully",
            rows: values.length,
            candidates: rows.length,
        });
    }
    catch (err) {
        console.error("Error importing scores from file:", err);
        return res
            .status(500)
            .json({ error: "Failed to import scores from file", err });
    }
});
exports.importScoresFromFile = importScoresFromFile;
