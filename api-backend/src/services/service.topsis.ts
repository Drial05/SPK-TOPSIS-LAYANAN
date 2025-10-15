import { RowDataPacket } from "mysql2";
import { AlternativeTopsis, CriteriaTopsis, ScoreTopsis } from "../types";
import { db } from "../utils/db";

type BobotCacheItem = {
  min: number;
  max: number;
  score: number;
};

type BobotCache = {
  [criteria_name: string]: BobotCacheItem[];
};

const bobotCache: BobotCache = {};

// kosongkan cache lama agar tidak numpuk
for (const key in bobotCache) {
  delete bobotCache[key];
}

// load bobot dari db sekali
export async function loadBobotCache() {
  const [rows] = await db.query<RowDataPacket[]>(
    `SELECT c.name AS criteria_name, b.min_value AS min, b.max_value AS max, score
    FROM bobot_topsis b
    JOIN criteria_topsis c ON b.id_criteria = c.id`
  );

  rows.forEach((row) => {
    const name = row.criteria_name.toLowerCase().trim();
    if (!bobotCache[name]) bobotCache[name] = [];
    bobotCache[name].push({
      min: Number(row.min),
      max: Number(row.max),
      score: Number(row.score),
    });
  });

  // sort tiap range supaya konsisten
  for (const key in bobotCache) {
    bobotCache[key].sort((a, b) => a.min - b.min);
  }

  // tampilkan hasil cache
  // console.log("📌 Bobot Cache Loaded:");
  // for (const key in bobotCache) {
  //   console.log(`\nCriteria: ${key}`);
  //   console.table(bobotCache[key]);
  // }
}

// konversi nilai range (0-100) ke rating (1-5)
export function convertScore(value: number, name: string): number {
  const key = name.toLowerCase().trim();
  const ranges = bobotCache[key];

  if (!ranges) {
    console.warn(`Criteria ${key} tidak ditemukan di cache`);
    return 1;
  }

  for (const r of ranges) {
    if (r.min <= value && value <= r.max) {
      return r.score;
    }
  }

  // fallback kalau value di luar semua range
  return 1;
}

export const topsis = async (
  alternatives: AlternativeTopsis[],
  criteria: CriteriaTopsis[],
  scores: ScoreTopsis[]
) => {
  const nAlt = alternatives.length;
  const nCrit = criteria.length;

  // trace object untuk menyimpan log
  const trace: any = {};

  // 1. Normalisasi bobot agar total = 1
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  criteria = criteria.map((c) => ({
    ...c,
    weight: c.weight / totalWeight,
  }));
  trace.criteriaNormalized = criteria;

  // 2. matriks keputusan
  const matrix: number[][] = alternatives.map((alt) => {
    return criteria.map((crit) => {
      const score = scores.find(
        (s) => s.alternative_id === alt.id && s.criteria_id === crit.id
      );
      // rumus untuk range
      // return score ? score.value : 0;
      // rumus untuk konversi ke rating
      return score ? convertScore(score.value, crit.name) : 0;
    });
  });
  trace.decisionMatrix = matrix;

  // console.log("hasil matriks keputusan:", matrix);

  // 3. normalisasi matriks
  const norm: number[][] = Array.from({ length: nAlt }, () => []);
  for (let j = 0; j < nCrit; j++) {
    const col = matrix.map((row) => row[j]);
    const denom = Math.sqrt(col.reduce((sum, val) => sum + val ** 2, 0));
    for (let i = 0; i < nAlt; i++) {
      norm[i][j] = denom === 0 ? 0 : matrix[i][j] / denom;
    }
  }
  trace.normalizedMatrix = norm;

  // console.log("Hasil normalisasi matriks:", norm);

  // 4. matriks terbobot
  const weighted: number[][] = norm.map((row) =>
    row.map((val, j) => val * criteria[j].weight)
  );
  trace.weightedMatrix = weighted;

  //console.log("Hasil matriks terbobot:", weighted);

  // 5. solusi ideal positif dan negatif
  const idealPos: number[] = [];
  const idealNeg: number[] = [];

  for (let j = 0; j < nCrit; j++) {
    const col = weighted.map((row) => row[j]);
    if (criteria[j].attribute.toLowerCase() === "benefit") {
      idealPos[j] = Math.max(...col);
      idealNeg[j] = Math.min(...col);
    } else {
      // cost
      idealPos[j] = Math.min(...col);
      idealNeg[j] = Math.max(...col);
    }
  }
  trace.idealPositive = idealPos;
  trace.idealNegative = idealNeg;

  // console.log("Ideal+", idealPos);
  // console.log("Ideal-", idealNeg);

  // 6. Hitung D+ dan D-, dan skor preferensi
  const results = alternatives.map((alt, i) => {
    const Dpos = Math.sqrt(
      weighted[i].reduce(
        (sum, val, j) => sum + Math.pow(val - idealPos[j], 2),
        0
      )
    );
    const Dneg = Math.sqrt(
      weighted[i].reduce(
        (sum, val, j) => sum + Math.pow(val - idealNeg[j], 2),
        0
      )
    );
    const score = Dpos + Dneg === 0 ? 0 : Dneg / (Dpos + Dneg);

    return {
      id: alt.id,
      name: alt.name,
      Dpos: parseFloat(Dpos.toFixed(4)),
      Dneg: parseFloat(Dneg.toFixed(4)),
      score: parseFloat(score.toFixed(4)),
    };
  });
  trace.resultTopsis = results;
  //console.log("Hasil akhir TOPSIS:", results);

  // 7. urutkan berdasarkan skor tertinggi
  results.sort((a, b) => b.score - a.score);

  // 8. kosongkan data hasil ranking sebelum nya
  await db.query(`DELETE FROM results_topsis`);

  // 9. simpan hasil ke database
  for (let i = 0; i < results.length; i++) {
    const r = results[i];
    const ranking = i + 1;

    await db.query(
      `INSERT INTO results_topsis (alternative_id, total_score, ranking) VALUES (?, ?, ?)`,
      [r.id, r.score, ranking]
    );
  }

  return {
    results,
    trace,
  };
};
