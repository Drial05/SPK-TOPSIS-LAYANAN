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
exports.calculateSaw = void 0;
const db_1 = require("../utils/db");
// konversi nilai range (0-100) ke rating (1-5)
function convertScore(value, type) {
    // gunakan batas konsisten >=
    if (type == "benefit") {
        if (value >= 80)
            return 5;
        if (value >= 70)
            return 4;
        if (value >= 60)
            return 3;
        if (value >= 50)
            return 2;
        return 1;
    }
    else {
        // cost di balik
        if (value >= 80)
            return 1;
        if (value >= 70)
            return 2;
        if (value >= 60)
            return 3;
        if (value >= 50)
            return 4;
        return 5;
    }
}
// ambil semua data
const calculateSaw = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    // ambil semua candidate
    const [candidates] = yield db_1.db.query(`SELECT * FROM candidates`);
    // ambil semua criteria
    const [criteria] = yield db_1.db.query(`SELECT * FROM criteria`);
    // ambil semua score
    let [scores] = yield db_1.db.query(`SELECT * FROM scores`);
    // 1. ubah nilai range -> rating sesuai kriteria
    // scores = (scores as any[]).map((s) => {
    //   const crit = (criteria as any[]).find((c) => c.id === s.criteria_id);
    //   if (crit) {
    //     return {
    //       ...s,
    //       value: convertScore(s.value, crit.type),
    //       // value: (s.value, crit.type),
    //     };
    //   }
    //   return s;
    // });
    //console.log("Scores after conversion:", scores);
    // 2. normalisasi nilai
    const normalized = {};
    for (const c of criteria) {
        const relatedScores = scores.filter((s) => s.criteria_id === c.id);
        const values = relatedScores.map((s) => s.value);
        const max = Math.max(...values);
        const min = Math.min(...values);
        for (const s of relatedScores) {
            if (!normalized[s.candidate_id])
                normalized[s.candidate_id] = {};
            // normalisai berdasarkan jenis kriteria
            if (c.type === "benefit") {
                normalized[s.candidate_id][s.criteria_id] = s.value / max;
            }
            else {
                normalized[s.candidate_id][s.criteria_id] = min / s.value;
            }
        }
    }
    //console.log("Hasil normalisasi:", normalized);
    // 3. hitung skor akhir (SAW score)
    const result = [];
    for (const candidate of candidates) {
        let total = 0;
        for (const c of criteria) {
            const normValue = ((_a = normalized[candidate.id]) === null || _a === void 0 ? void 0 : _a[c.id]) || 0;
            total += normValue * c.weight;
        }
        result.push({
            candidate_id: candidate.id,
            candidate_name: candidate.name,
            score: parseFloat(total.toFixed(4)),
            // score: total,
        });
    }
    // 4. urutkan berdasarkan skor tertinggi
    result.sort((a, b) => b.score - a.score);
    // kosongkan data hasil ranking sebelum di isi ulang
    yield db_1.db.query(`DELETE FROM results`);
    // 5. masukan data hasil ranking ke tabel 'results'
    for (let i = 0; i < result.length; i++) {
        const r = result[i];
        const ranking = i + 1;
        yield db_1.db.query(`INSERT INTO results (candidate_id, total_score, ranking) VALUES (?, ?, ?)`, [r.candidate_id, r.score, ranking]);
    }
    return result;
});
exports.calculateSaw = calculateSaw;
