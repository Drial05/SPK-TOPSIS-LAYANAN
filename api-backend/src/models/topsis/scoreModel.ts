import { db } from "../../utils/db";
import { ScoreTopsis } from "../../types/";

export const getScores = async (): Promise<ScoreTopsis[]> => {
  const [rows] = await db.query("SELECT * FROM scores_topsis");
  return rows as ScoreTopsis[];
};

export const getScoresPage = async (
  pageSize: number,
  offset: number
): Promise<{
  data: ScoreTopsis[];
  totalRows: number;
  totalPages: number;
}> => {
  // ambil data candidate berdasarkan limit dan offset
  const [alternativeRows] = await db.query(
    `SELECT id, name FROM alternative_topsis ORDER BY id LIMIT ? OFFSET ?`,
    [pageSize, offset]
  );

  //console.log("Alternative hasil query", alternativeRows);

  const alternatives = alternativeRows as { id: number; name: string }[];
  const alternativeIds = (alternatives as { id: number; name: string }[]).map(
    (c) => c.id
  );

  if (alternativeIds.length === 0) {
    return {
      data: [],
      totalRows: 0,
      totalPages: 0,
    };
  }

  // buat placefolder untuk IN
  const placeholders = alternativeIds.map(() => "?").join(",");
  const query = `
        SELECT s.id, s.alternative_id, c.name AS alternative_name,
              s.criteria_id, cr.name AS criteria_name, s.value
        FROM scores_topsis s
        JOIN alternative_topsis c ON s.alternative_id = c.id
        JOIN criteria_topsis cr ON s.criteria_id = cr.id 
        WHERE s.alternative_id IN (${placeholders})
        ORDER BY s.alternative_id, s.criteria_id
  `;

  //console.log("SQL", query);
  //console.log("Params", alternativeIds);

  const [rows] = await db.query(query, alternativeIds);

  const [countResult] = await db.query(
    "SELECT COUNT(*) as total from alternative_topsis"
  );
  const totalRows = (countResult as any[])[0].total;
  const totalPages = Math.ceil(totalRows / pageSize);

  return {
    data: rows as ScoreTopsis[],
    totalRows,
    totalPages,
  };
};

export const createScore = async (data: ScoreTopsis): Promise<void> => {
  await db.query(
    "INSERT INTO scores_topsis (alternative_id, criteria_id, value) VALUES (?, ?, ?)",
    [data.alternative_id, data.criteria_id, data.value]
  );
};

export async function updateScore(
  updates: {
    id: number;
    candidate_id: number;
    criteria_id: number;
    value: number;
  }[]
) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    for (const score of updates) {
      const sql = `UPDATE scores SET candidate_id = ?, criteria_id = ?, value = ? WHERE id = ?`;
      const value = [
        score.candidate_id,
        score.criteria_id,
        score.value,
        score.id,
      ];

      await db.execute(sql, value);
    }

    await conn.commit();
    return { message: "Scores updated successfully" };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export async function deleteScores(ids: number[]) {
  const conn = await db.getConnection();
  try {
    const result = await conn.query(
      `DELETE FROM scores_topsis WHERE alternative_id IN (?)`,
      [ids]
    );
    return result;
  } catch (err) {
    throw err;
  } finally {
    conn.release();
  }
}
