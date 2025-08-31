import { db } from "../../utils/db";
import { ResultSetHeader } from "mysql2";
import { AlternativeTopsis } from "../../types/";

export const getAlternatives = async (): Promise<AlternativeTopsis[]> => {
  const [rows] = await db.query("SELECT * FROM alternative_topsis");
  return rows as AlternativeTopsis[];
};

export const getAlternativePage = async (
  pageSize: number,
  offset: number
): Promise<{
  data: AlternativeTopsis[];
  totalRows: number;
  totalPages: number;
}> => {
  const [rows] = await db.query(
    "SELECT * FROM alternative_topsis LIMIT ? OFFSET ?",
    [pageSize, offset]
  );

  const [countResult] = await db.query(
    "SELECT COUNT(*) as total from alternative_topsis"
  );
  const totalRows = (countResult as any[])[0].total;
  const totalPages = Math.ceil(totalRows / pageSize);

  return {
    data: rows as AlternativeTopsis[],
    totalRows,
    totalPages,
  };
};

export const createAlternative = async (alternative: AlternativeTopsis) => {
  await db.query("INSERT INTO alternative_topsis (name) VALUES (?)", [
    alternative.name,
  ]);
};

export const updateAlternative = async (
  id: number,
  name: string
): Promise<ResultSetHeader> => {
  const [result] = await db.execute<ResultSetHeader>(
    "UPDATE alternative_topsis SET name = ? WHERE id = ?",
    [name, id]
  );
  return result;
};

export const deleteAlternative = async (ids: number[]) => {
  const conn = await db.getConnection();

  try {
    const result = await conn.query(
      `DELETE FROM alternative_topsis WHERE id IN (?)`,
      [ids]
    );

    return result;
  } catch (err) {
    throw err;
  } finally {
    conn.release();
  }
  // const [result] = await db.execute<ResultSetHeader>(
  //   "DELETE FROM alternative_topsis WHERE id = ?",
  //   [id]
  // );
  // return result;
};
