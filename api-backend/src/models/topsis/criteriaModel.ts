import { db } from "../../utils/db";
import { ResultSetHeader } from "mysql2";
import { CriteriaTopsis } from "../../types";

export const getAllCriteria = async (): Promise<CriteriaTopsis[]> => {
  const [rows] = await db.query("SELECT * FROM criteria_topsis");
  return rows as CriteriaTopsis[];
};

export const getPageCriteria = async (
  pageSize: number,
  offset: number
): Promise<{
  data: CriteriaTopsis[];
  totalRows: number;
  totalPages: number;
}> => {
  const [rows] = await db.query(
    "SELECT * FROM criteria_topsis LIMIT ? OFFSET ?",
    [pageSize, offset]
  );

  const [countResult] = await db.query(
    "SELECT COUNT(*) as total from criteria_topsis"
  );

  const totalRows = (countResult as any[])[0].total;
  const totalPages = Math.ceil(totalRows / pageSize);

  return {
    data: rows as CriteriaTopsis[],
    totalRows,
    totalPages,
  };
};

export const createCreate = async (
  name: string,
  weight: string,
  attribute: string
): Promise<void> => {
  await db.query(
    "INSERT INTO criteria_topsis (name, weight, attribute) VALUES (?, ?, ?)",
    [name, weight, attribute]
  );
};

export const updateCriteria = async (
  id: number,
  name: string,
  weight: string,
  attribute: string
): Promise<ResultSetHeader> => {
  const [result] = await db.execute<ResultSetHeader>(
    "UPDATE criteria_topsis SET name = ?, weight = ?, attribute = ? WHERE id = ?",
    [name, weight, attribute, id]
  );
  return result;
};

export const deleteCriteria = async (id: number) => {
  const [result] = await db.execute<ResultSetHeader>(
    "DELETE FROM criteria_topsis WHERE id = ?",
    [id]
  );
  return result;
};
