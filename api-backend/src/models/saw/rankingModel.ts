import { db } from "../../utils/db";

export interface Ranking {
  id: number;
  candidate_id: number;
  total_score: number;
  ranking: number;
}

export interface ExportResults {
  id: number;
  candidate_id: number;
  candidate_name: string;
  total_score: number;
  ranking: number;
}

export const getRankingPage = async (
  pageSize: number,
  offset: number
): Promise<{
  data: Ranking[];
  totalRows: number;
  totalPages: number;
}> => {
  const [rows] = await db.query(
    `SELECT 
        r.id,
        r.alternative_id,
        c.name AS alternative_name,
        c.email AS alternative_email,
        r.total_score,
        r.ranking 
    FROM results_saw r
    JOIN alternative_saw c ON r.alternative_id = c.id
    ORDER BY r.ranking ASC
    LIMIT ? OFFSET ?`,
    [pageSize, offset]
  );

  const [countResult] = await db.query(
    "SELECT COUNT(*) as total FROM results_saw"
  );

  const totalRows = (countResult as any[])[0].total;
  const totalPages = Math.ceil(totalRows / pageSize);

  return {
    data: rows as Ranking[],
    totalRows,
    totalPages,
  };
};

export const getAllResults = async () => {
  const [rows] = await db.query(
    `SELECT
      r.id,
      r.alternative_id,
      a.name AS alternative_name,
      r.total_score,
      r.ranking
    FROM results_saw r
    JOIN alternative_saw a ON r.alternative_id = a.id
    ORDER BY r.ranking ASC`
  );

  return {
    data: rows as ExportResults[],
  };
};
