import { db } from "../../utils/db";
import { ResultSetHeader } from "mysql2";
import { BobotTopsis } from "../../types";

export const getAllBobot = async (): Promise<BobotTopsis[]> => {
  const [rows] = await db.query(`
    SELECT
      b.id, b.id_criteria, b.min_value, b.max_value, b.score,
      c.name AS criteria_name, c.weight AS criteria_weight, c.attribute AS criteria_attribute
      FROM bobot_topsis b
      JOIN criteria_topsis c ON b.id_criteria = c.id`);
  return rows as BobotTopsis[];
};

export const getPageBobot = async (
  pageSize: number,
  offset: number
): Promise<{
  data: BobotTopsis[];
  totalRows: number;
  totalPages: number;
}> => {
  const [rows] = await db.query(
    `
    SELECT
      b.id, b.id_criteria, b.min_value, b.max_value, b.score,
      c.name AS criteria_name, c.weight AS criteria_weight, c.attribute AS criteria_attribute
      FROM bobot_topsis b
      JOIN criteria_topsis c ON b.id_criteria = c.id
      LIMIT ? OFFSET ?`,
    [pageSize, offset]
  );

  const [countResult] = await db.query(
    "SELECT COUNT(*) as total from bobot_topsis"
  );

  const totalRows = (countResult as any[])[0].total;
  const totalPages = Math.ceil(totalRows / pageSize);

  return {
    data: rows as BobotTopsis[],
    totalRows,
    totalPages,
  };
};

export const createBobot = async (
  id_criteria: number,
  min_value: number,
  max_value: number,
  score: number
): Promise<void> => {
  await db.query(
    "INSERT INTO bobot_topsis (id_criteria, min_value, max_value, score) VALUES (?, ?, ?, ?)",
    [id_criteria, min_value, max_value, score]
  );
};

export const updateBobot = async (
  id: number,
  id_criteria: number,
  min_value: number,
  max_value: number | null,
  score: number
): Promise<ResultSetHeader> => {
  const [result] = await db.execute<ResultSetHeader>(
    "UPDATE bobot_topsis SET id_criteria = ?, min_value = ?, max_value = ?, score = ? WHERE id = ?",
    [id_criteria, min_value, max_value, score, id]
  );
  return result;
};

export const deleteBobot = async (id: number) => {
  const [result] = await db.execute<ResultSetHeader>(
    "DELETE FROM bobot_topsis WHERE id = ?",
    [id]
  );
  return result;
};
