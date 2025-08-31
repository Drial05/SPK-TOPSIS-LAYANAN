import { db } from "../../utils/db";
import { Ranking, ExportTopsisResults } from "../../types/";

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
        r.total_score,
        r.ranking 
    FROM results_topsis r
    JOIN alternative_topsis c ON r.alternative_id = c.id
    ORDER BY r.ranking ASC
    LIMIT ? OFFSET ?`,
    [pageSize, offset]
  );

  const [countResult] = await db.query(
    "SELECT COUNT(*) as total FROM results_topsis"
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
    FROM results_topsis r
    JOIN alternative_topsis a ON r.alternative_id = a.id
    ORDER BY r.ranking ASC`
  );

  return {
    data: rows as ExportTopsisResults[],
  };
};
