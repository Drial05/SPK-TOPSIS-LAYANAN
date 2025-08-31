import { db } from "../../utils/db";
import { ResultSetHeader } from "mysql2";

export interface Alternative {
  id: number;
  name: string;
  email: string;
}

export interface AlternativeType {
  name: string;
  email: string;
}

export const getAllAlternatives = async (): Promise<Alternative[]> => {
  const [rows] = await db.query(
    "SELECT * FROM alternative_saw WHERE created_at >= CURDATE() - INTERVAL 7 DAY ORDER BY created_at DESC"
  );
  return rows as Alternative[];
};

export const getAlternativesPage = async (
  pageSize: number,
  offset: number
): Promise<{
  data: Alternative[];
  totalRows: number;
  totalPages: number;
}> => {
  const [rows] = await db.query(
    "SELECT * FROM alternative_saw LIMIT ? OFFSET ?",
    [pageSize, offset]
  );

  const [countResult] = await db.query(
    "SELECT COUNT(*) as total from alternative_saw"
  );
  const totalRows = (countResult as any[])[0].total;
  const totalPages = Math.ceil(totalRows / pageSize);

  return {
    data: rows as Alternative[],
    totalRows,
    totalPages,
  };
};

export const createAlternative = async (alternative: AlternativeType) => {
  await db.query("INSERT INTO alternative_saw (name, email) VALUES (?, ?)", [
    alternative.name,
    alternative.email,
  ]);
};

export const updateAlternative = async (
  id: number,
  name: string,
  email: string
): Promise<ResultSetHeader> => {
  const [result] = await db.execute<ResultSetHeader>(
    "UPDATE alternative_saw SET name = ?, email = ? WHERE id = ?",
    [name, email, id]
  );
  return result;
};

export const deleteAlternative = async (ids: number[]) => {
  const conn = await db.getConnection();

  try {
    const result = await conn.query(
      `DELETE FROM alternative_saw WHERE id IN (?)`,
      [ids]
    );
    return result;
  } catch (err) {
    throw err;
  } finally {
    conn.release();
  }
};
