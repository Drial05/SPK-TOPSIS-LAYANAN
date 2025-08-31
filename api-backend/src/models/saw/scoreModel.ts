import { db } from "../../utils/db";
import { Request, Response } from "express";

export interface Score {
  id?: number;
  alternative_id: number;
  criteria_id: number;
  value: number;
}

interface deleteScoreBody {
  type: "all" | "selected";
  ids?: number[];
}

export const getScoresPage = async (
  pageSize: number,
  offset: number
): Promise<{
  data: Score[];
  totalRows: number;
  totalPages: number;
}> => {
  // ambil data alternative berdasarkan limit dan offset
  const [alternativesRows] = await db.query(
    `SELECT id, name FROM alternative_saw ORDER BY id LIMIT ? OFFSET ?`,
    [pageSize, offset]
  );

  //console.log("Candidate hasil query", candidatesRows);

  const alternatives = alternativesRows as { id: number; name: string }[];
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
        FROM scores_saw s
        JOIN alternative_saw c ON s.alternative_id = c.id
        JOIN criteria_saw cr ON s.criteria_id = cr.id 
        WHERE s.alternative_id IN (${placeholders})
        ORDER BY s.alternative_id, s.criteria_id
  `;

  //console.log("SQL", query);
  //console.log("Params", candidateIds);

  const [rows] = await db.query(query, alternativeIds);

  const [countResult] = await db.query(
    "SELECT COUNT(*) as total from alternative_saw"
  );
  const totalRows = (countResult as any[])[0].total;
  const totalPages = Math.ceil(totalRows / pageSize);

  return {
    data: rows as Score[],
    totalRows,
    totalPages,
  };
};

export const createScore = async (data: Score): Promise<void> => {
  await db.query(
    "INSERT INTO scores_saw (alternative_id, criteria_id, value) VALUES (?, ?, ?)",
    [data.alternative_id, data.criteria_id, data.value]
  );
};

export async function updateScore(
  updates: {
    id: number;
    alternative_id: number;
    criteria_id: number;
    value: number;
  }[]
) {
  const conn = await db.getConnection();
  try {
    await conn.beginTransaction();

    for (const score of updates) {
      const sql = `UPDATE scores_saw SET alternative_id = ?, criteria_id = ?, value = ? WHERE id = ?`;
      const value = [
        score.alternative_id,
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

export async function deleteScoresByAlternative(ids: number[]) {
  const conn = await db.getConnection();
  try {
    const result = await conn.query(
      `DELETE FROM scores_saw WHERE alternative_id IN (?)`,
      [ids]
    );
    return result;
  } catch (err) {
    throw err;
  } finally {
    conn.release();
  }
}
