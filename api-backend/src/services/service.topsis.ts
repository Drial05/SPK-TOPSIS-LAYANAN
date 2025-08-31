import { AlternativeTopsis, CriteriaTopsis, ScoreTopsis } from "../types";
import { db } from "../utils/db";

// konversi nilai range (0-100) ke rating (1-5)
function convertScore(value: number, name: string): number {
  name = name.toLowerCase().trim();
  // gunakan batas konsisten >=
  if (name == "frekuensi penggunaan") {
    if (value >= 400) return 5;
    if (value >= 300) return 4;
    if (value >= 200) return 3;
    if (value >= 100) return 2;
    return 1;
  } else if (name == "jumlah pengguna") {
    if (value >= 300) return 5;
    if (value >= 225) return 4;
    if (value >= 150) return 3;
    if (value >= 75) return 2;
    return 1;
  } else if (name == "rata-rata nominal transaksi") {
    if (value >= 1000000) return 5;
    if (value >= 750000) return 4;
    if (value >= 500000) return 3;
    if (value >= 250000) return 2;
    return 1;
  } else if (name == "biaya transaksi") {
    // cost di balik
    if (value <= 1000) return 5;
    if (value <= 2000) return 4;
    if (value <= 3000) return 3;
    if (value <= 4000) return 2;
    return 1;
  }
  // default kalo tidak ada yang cocok
  return 1;
}

export const topsis = async (
  alternatives: AlternativeTopsis[],
  criteria: CriteriaTopsis[],
  scores: ScoreTopsis[]
) => {
  const nAlt = alternatives.length;
  const nCrit = criteria.length;

  // 1. Normalisasi bobot agar total = 1
  const totalWeight = criteria.reduce((sum, c) => sum + c.weight, 0);
  criteria = criteria.map((c) => ({
    ...c,
    weight: c.weight / totalWeight,
  }));

  // 2. matriks keputusan
  const matrix: number[][] = alternatives.map((alt) => {
    return criteria.map((crit) => {
      const score = scores.find(
        (s) => s.alternative_id === alt.id && s.criteria_id === crit.id
      );
      // rumus untuk range
      // return score ? score.value : 0;
      // rumus untuk konversi ke rating
      return score ? convertScore(score.value, crit.name.toLowerCase()) : 0;
    });
  });

  //console.log("hasil matriks keputusan:", matrix);

  // 3. normalisasi matriks
  const norm: number[][] = Array.from({ length: nAlt }, () => []);
  for (let j = 0; j < nCrit; j++) {
    const col = matrix.map((row) => row[j]);
    const denom = Math.sqrt(col.reduce((sum, val) => sum + val ** 2, 0));
    for (let i = 0; i < nAlt; i++) {
      norm[i][j] = denom === 0 ? 0 : matrix[i][j] / denom;
    }
  }

  //console.log("Hasil normalisasi matriks:", norm);

  // 4. matriks terbobot
  const weighted: number[][] = norm.map((row) =>
    row.map((val, j) => val * criteria[j].weight)
  );

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
      // score,
      score: parseFloat(score.toFixed(4)),
    };
  });

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

  return results;
};
