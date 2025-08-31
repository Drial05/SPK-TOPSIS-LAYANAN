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
exports.importScoresFromXlsx = exports.importScoresFromFile = exports.removeScores = exports.editScore = exports.addScore = exports.getScores = void 0;
const xlsx_1 = __importDefault(require("xlsx"));
const db_1 = require("../../utils/db");
const scoreModel_1 = require("../../models/topsis/scoreModel");
// konversi nilai range (0-100) ke rating (1-5)
function convertScore(value, name) {
    name = name.toLowerCase().trim();
    // gunakan batas konsisten >=
    if (name == "frekuensi penggunaan") {
        if (value >= 400)
            return 5;
        if (value >= 300)
            return 4;
        if (value >= 200)
            return 3;
        if (value >= 100)
            return 2;
        return 1;
    }
    else if (name == "jumlah pengguna") {
        if (value >= 300)
            return 5;
        if (value >= 225)
            return 4;
        if (value >= 150)
            return 3;
        if (value >= 75)
            return 2;
        return 1;
    }
    else if (name == "rata-rata nominal transaksi") {
        if (value >= 1000000)
            return 5;
        if (value >= 750000)
            return 4;
        if (value >= 500000)
            return 3;
        if (value >= 250000)
            return 2;
        return 1;
    }
    else if (name == "biaya transaksi") {
        // cost di balik
        if (value <= 1000)
            return 5;
        if (value <= 2000)
            return 4;
        if (value <= 3000)
            return 3;
        if (value <= 4000)
            return 2;
        return 1;
    }
    // default kalo tidak ada yang cocok
    return 1;
}
const getScores = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const offset = (page - 1) * pageSize;
    try {
        const { data, totalRows, totalPages } = yield (0, scoreModel_1.getScoresPage)(pageSize, offset);
        // konversi nilai ke matriks keputusan
        const convertedData = data.map((item) => {
            return Object.assign(Object.assign({}, item), { rating: convertScore(item.value, item.criteria_name) });
        });
        res.json({
            data: convertedData,
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
const removeScores = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const alternativeIds = req.body;
    if (!Array.isArray(alternativeIds)) {
        return res.status(400).json({ message: "Invalid request body" });
    }
    try {
        yield (0, scoreModel_1.deleteScores)(alternativeIds);
        res.json({ message: "Scores deleted for alternatives" });
    }
    catch (err) {
        console.error("Deleted scores error:", err);
        res.status(500).json({ message: "Deleted scores error:", err });
    }
});
exports.removeScores = removeScores;
const importScoresFromFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file)
            return res.status(400).json({ message: "No file uploaded" });
        const workbook = xlsx_1.default.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const rows = xlsx_1.default.utils.sheet_to_json(sheet);
        // format yang di harapkan : alternative_id, criteria_id, value
        const values = rows.map((row) => [
            row.alternative_id,
            row.criteria_id,
            row.value,
        ]);
        if (!values.length)
            return res.status(400).json({ message: "No data found" });
        // ambil unique alternative id dan name dari data import
        const alternativeData = Array.from(new Map(rows.map((r) => [r.alternative_id, r.name])).entries()).map(([id, name]) => ({ alternative_id: id, name }));
        const alternativeIds = alternativeData.map((a) => a.alternative_id);
        // cek alternative id yang belum ada di tabel alternative topsis
        const [existingAlternatives] = yield db_1.db.query("SELECT id from alternative_topsis WHERE id IN (?)", [alternativeIds]);
        // extract alternative id yang sudah ada
        const existingIds = new Set(existingAlternatives.map((alt) => alt.alternative_id));
        // filter alternative id yang belum ada
        const newAlternatives = alternativeData.filter((a) => !existingIds.has(a.alternative_id));
        // insert alternative baru ke tabel alternative_topsis
        if (newAlternatives.length) {
            const insertData = newAlternatives.map((a) => [a.alternative_id, a.name]);
            yield db_1.db.query("INSERT INTO alternative_topsis (id, name) VALUES ?", [
                insertData,
            ]);
        }
        // hapus dulu data scores lama
        //await db.query("DELETE FROM scores_topsis");
        // insert data skor yang sudah ada / baru
        yield db_1.db.query("INSERT INTO scores_topsis (alternative_id, criteria_id, value) VALUES ?", [values]);
        res.json({
            message: "Scores imported successfully",
            rows: values.length,
            newAlternatives: newAlternatives.length,
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
// function isSpecialChannel(name: string): boolean {
//   const normalized = name.toLowerCase().replace(/[\s-]/g, "");
//   return (
//     normalized.includes("ewallet") ||
//     normalized.includes("skn") ||
//     normalized.includes("online")
//   );
// }
function calculateAvgFee(data) {
    const filtered = data.filter((d) => Number(d.fee) > 0);
    if (filtered.length > 0) {
        return (filtered.reduce((sum, d) => sum + Number(d.fee || 0), 0) / filtered.length);
    }
    return 0;
}
const importScoresFromXlsx = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file)
            return res.status(400).json({ message: "No file uploaded" });
        // baca file excel
        const workbook = xlsx_1.default.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        let rows = xlsx_1.default.utils.sheet_to_json(sheet);
        if (!rows.length) {
            return res.status(400).json({ message: "No data found" });
        }
        // normalisasi header -> lowercase, spasi -> underscore
        rows = rows.map((row) => {
            const newRow = {};
            Object.keys(row).forEach((key) => {
                const newKey = key.trim().toLowerCase().replace(/\s+/g, "_");
                newRow[newKey] = row[key];
            });
            return newRow;
        });
        // ambil daftar criteria dari database
        const [criteriaRowsRaw] = yield db_1.db.query("SELECT id, name FROM criteria_topsis");
        const criteriaRows = criteriaRowsRaw;
        // mapping nama -> id (sesuai nama di database)
        const criteriaMap = {};
        criteriaRows.forEach((c) => {
            criteriaMap[c.name.toLowerCase().trim()] = c.id;
        });
        // Group berdasarkan Trx_name
        const grouped = {};
        rows.forEach((row) => {
            const trxName = row.trx_name ? String(row.trx_name).trim() : null;
            if (!trxName)
                return;
            if (!grouped[trxName])
                grouped[trxName] = [];
            grouped[trxName].push(row);
        });
        // format alternative data
        const alternativeNames = Object.keys(grouped);
        // cek alternative yang sudah ada
        // const [existingRaw] = await db.query(
        //   "SELECT id, name FROM alternative_topsis WHERE name IN (?)",
        //   [alternativeNames]
        // );
        // const existingAlternatives = existingRaw as { id: number; name: string }[];
        // const existingNameSet = new Set(existingAlternatives.map((a) => a.name));
        // insert alternative baru
        // const newNames = alternativeNames.map(
        //   (name) => !existingNameSet.has(name)
        // );
        const newNames = alternativeNames;
        if (newNames.length) {
            const insertData = newNames.map((name) => [name]);
            yield db_1.db.query("INSERT INTO alternative_topsis (name) VALUES ?", [
                insertData,
            ]);
        }
        // ambil ulang semua alternative
        const [allRaw] = yield db_1.db.query("SELECT id, name FROM alternative_topsis WHERE name IN (?)", [alternativeNames]);
        const allAlternative = allRaw;
        const nameToId = new Map(allAlternative.map((a) => [a.name, a.id]));
        const values = [];
        // hitung nilai untuk tiap alternative
        alternativeNames.forEach((name) => {
            const altId = nameToId.get(name);
            const data = grouped[name];
            if (!altId || !data || !data.length)
                return;
            // frekuensi pengguna = jumlah transaksi
            const frekuensi = data.length;
            // jumlah pengguna unik
            const uniqueUsers = new Set(data.map((d) => d.bank_customer_no)).size;
            // Rata - rata nominal transaksi
            const avgNominal = data.reduce((sum, d) => sum + Number(d.trx_amt || 0), 0) / frekuensi;
            // biaya rata-rata transaksi total
            const avgFee = calculateAvgFee(data);
            // let avgFee: 0;
            // if (isSpecialChannel(name)) {
            //   const filtered = data.filter((d) => Number(d.fee) > 0);
            //   avgFee =
            //     filtered.reduce((sum, d) => sum + Number(d.fee || 0), 0) /
            //     (filtered.length || 1);
            // } else {
            //   avgFee =
            //     data.reduce((sum, d) => sum + Number(d.fee || 0), 0) /
            //     (frekuensi || 1);
            // }
            // masukan ke values sesuai id criteria di database
            if (criteriaMap["frekuensi penggunaan"])
                values.push([altId, criteriaMap["frekuensi penggunaan"], frekuensi]);
            if (criteriaMap["jumlah pengguna"])
                values.push([altId, criteriaMap["jumlah pengguna"], uniqueUsers]);
            if (criteriaMap["rata-rata nominal transaksi"])
                values.push([
                    altId,
                    criteriaMap["rata-rata nominal transaksi"],
                    avgNominal,
                ]);
            if (criteriaMap["biaya transaksi"])
                values.push([altId, criteriaMap["biaya transaksi"], avgFee]);
        });
        // hapus data skor lama
        yield db_1.db.query("DELETE FROM scores_topsis");
        // insert skor baru
        if (values.length) {
            yield db_1.db.query("INSERT INTO scores_topsis (alternative_id, criteria_id, value) VALUES ?", [values]);
        }
        res.json({
            message: "Scores imported successfully",
            rows: values.length,
            newAlternatives: newNames.length,
        });
    }
    catch (err) {
        console.error("Error importing scores from file:", err);
        return res
            .status(500)
            .json({ error: "Failed to import scores from file", err });
    }
});
exports.importScoresFromXlsx = importScoresFromXlsx;
