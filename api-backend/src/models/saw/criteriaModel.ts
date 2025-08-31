import { ResultSetHeader } from "mysql2";
import { db } from "../../utils/db";
export interface Criteria {
  id?: number;
  name: string;
  weight: number;
  type: "benefit" | "cost";
}

export const getAllCriteria = async (): Promise<Criteria[]> => {
  const [rows] = await db.query("SELECT * FROM criteria_saw");
  return rows as Criteria[];
};

export const getCriteriaPage = async (
  pageSize: number,
  offset: number
): Promise<{ data: Criteria[]; totalRows: number; totalPages: number }> => {
  const [rows] = await db.query("SELECT * FROM criteria_saw LIMIT ? OFFSET ?", [
    pageSize,
    offset,
  ]);

  const [countResult] = await db.query(
    "SELECT COUNT(*) as total from criteria_saw"
  );

  const totalRows = (countResult as any[])[0].total;
  const totalPages = Math.ceil(totalRows / pageSize);

  return {
    data: rows as Criteria[],
    totalRows,
    totalPages,
  };
};

export const createCreate = async (
  name: string,
  weight: string,
  type: string
): Promise<void> => {
  await db.query(
    "INSERT INTO criteria_saw (name, weight, type) VALUES (?, ?, ?)",
    [name, weight, type]
  );
};

export const updateCriteria = async (
  id: number,
  name: string,
  weight: string,
  type: string
): Promise<ResultSetHeader> => {
  const [result] = await db.execute<ResultSetHeader>(
    "UPDATE criteria_saw SET name = ?, weight = ?, type = ? WHERE id = ?",
    [name, weight, type, id]
  );
  return result;
};

export const deleteCriteria = async (id: number) => {
  const [result] = await db.execute<ResultSetHeader>(
    "DELETE FROM criteria_saw WHERE id = ?",
    [id]
  );
  return result;
};
