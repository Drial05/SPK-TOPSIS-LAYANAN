import { db } from "../utils/db";

// konversi nilai range (0-100) ke rating (1-5)
function convertScore(value: number, type: string): number {
  // gunakan batas konsisten >=
  if (type == "benefit") {
    if (value >= 80) return 5;
    if (value >= 70) return 4;
    if (value >= 60) return 3;
    if (value >= 50) return 2;
    return 1;
  } else {
    // cost di balik
    if (value >= 80) return 1;
    if (value >= 70) return 2;
    if (value >= 60) return 3;
    if (value >= 50) return 4;
    return 5;
  }
}

// ambil semua data
export const calculateSaw = async () => {
  // ambil semua candidate
  const [alternative] = await db.query(`SELECT * FROM alternative_saw`);
  // ambil semua criteria
  const [criteria] = await db.query(`SELECT * FROM criteria_saw`);
  // ambil semua score
  let [scores] = await db.query(`SELECT * FROM scores_saw`);

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
  const normalized: Record<number, Record<number, number>> = {};

  for (const c of criteria as any[]) {
    const relatedScores = (scores as any[]).filter(
      (s) => s.criteria_id === c.id
    );

    const values = relatedScores.map((s) => s.value);
    const max = Math.max(...values);
    const min = Math.min(...values);

    for (const s of relatedScores) {
      if (!normalized[s.alternative_id]) normalized[s.alternative_id] = {};

      // normalisai berdasarkan jenis kriteria
      if (c.type === "benefit") {
        normalized[s.alternative_id][s.criteria_id] = s.value / max;
      } else {
        normalized[s.alternative_id][s.criteria_id] = min / s.value;
      }
    }
  }

  //console.log("Hasil normalisasi:", normalized);

  // 3. hitung skor akhir (SAW score)
  const result: {
    alternative_id: number;
    alternative_name: string;
    score: number;
  }[] = [];

  for (const alternatives of alternative as any[]) {
    let total = 0;

    for (const c of criteria as any[]) {
      const normValue = normalized[alternatives.id]?.[c.id] || 0;
      total += normValue * c.weight;
    }

    result.push({
      alternative_id: alternatives.id,
      alternative_name: alternatives.name,
      score: parseFloat(total.toFixed(4)),
      // score: total,
    });
  }

  // 4. urutkan berdasarkan skor tertinggi
  result.sort((a, b) => b.score - a.score);

  // kosongkan data hasil ranking sebelum di isi ulang
  await db.query(`DELETE FROM results_saw`);

  // 5. masukan data hasil ranking ke tabel 'results'
  for (let i = 0; i < result.length; i++) {
    const r = result[i];
    const ranking = i + 1;

    await db.query(
      `INSERT INTO results_saw (alternative_id, total_score, ranking) VALUES (?, ?, ?)`,
      [r.alternative_id, r.score, ranking]
    );
  }
  return result;
};
