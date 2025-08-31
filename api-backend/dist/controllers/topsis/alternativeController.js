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
exports.removeAlternative = exports.editAlternative = exports.addAlternative = exports.getAlternativePagenition = exports.getAlternative = void 0;
const alternativeModel_1 = require("../../models/topsis/alternativeModel");
// import csv from "csv-parser";
const getAlternative = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const allAlternative = yield (0, alternativeModel_1.getAlternatives)();
        res.json(allAlternative);
    }
    catch (err) {
        console.error("Failed Get Alternative", err);
        res.status(500).json({ error: "Failed Get Alternative", err });
    }
});
exports.getAlternative = getAlternative;
const getAlternativePagenition = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const page = parseInt(req.query.page, 10) || 1;
    const pageSize = parseInt(req.query.pageSize, 10) || 10;
    const offset = (page - 1) * pageSize;
    try {
        const { data, totalRows, totalPages } = yield (0, alternativeModel_1.getAlternativePage)(pageSize, offset);
        res.json({
            data,
            page,
            pageSize,
            totalRows,
            totalPages,
        });
    }
    catch (err) {
        console.error("Error fetching candidates:", err);
        return res.status(500).json({ error: "Failed to fetch candidates" });
    }
});
exports.getAlternativePagenition = getAlternativePagenition;
const addAlternative = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name } = req.body;
    if (!name) {
        return res.status(400).json({ error: "Name is required" });
    }
    try {
        const result = yield (0, alternativeModel_1.createAlternative)({ name });
        res.status(201).json({ message: "alternative created", result });
    }
    catch (err) {
        console.error("Error adding alternative:", err);
        return res.status(500).json({ error: "Failed to add alternative" });
    }
});
exports.addAlternative = addAlternative;
const editAlternative = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { name } = req.body;
    try {
        const result = yield (0, alternativeModel_1.updateAlternative)(parseInt(id), name);
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Alternative not found" });
        }
        res.json({ messgae: "Alternative updates", result });
    }
    catch (err) {
        console.error("Error editing alternative:", err);
        return res.status(500).json({ error: "Failed to edit alternative" });
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
        console.error("Error deleting alternative:", err);
        return res.status(500).json({ error: "Failed to delete candidate" });
    }
});
exports.removeAlternative = removeAlternative;
// export const importCandidates: RequestHandler = async (
//   req: Request,
//   res: Response
// ) => {
//   const file = req.file;
//   if (!file) {
//     return res.status(400).json({ error: "No file uploaded" });
//   }
//   const filePath = path.join(__dirname, "../../uploads", file.filename);
//   const candidates: CandidateType[] = [];
//   fs.createReadStream(filePath)
//     .pipe(csv())
//     .on("data", (row) => {
//       console.log("Row read:", row);
//       candidates.push({
//         name: row.name,
//         email: row.email,
//       });
//     })
//     .on("end", async () => {
//       try {
//         for (const candidate of candidates) {
//           await createCandidate(candidate);
//         }
//         fs.unlinkSync(filePath);
//         res.status(201).json({ message: "Candidates imported successfully" });
//       } catch (err) {
//         res.status(500).json({ error: "Import failed", err });
//       }
//     })
//     .on("error", (err) => {
//       res.status(500).json({ error: "error reading csv", err });
//     });
// };
