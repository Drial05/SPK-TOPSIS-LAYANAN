import { Request, Response } from "express";
import {
  getScoresPage,
  createScore,
  updateScore,
  deleteScoresByAlternative,
} from "../../models/saw/scoreModel";
import XLSX from "xlsx";
import { db } from "../../utils/db";

export const getScores = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
  const offset = (page - 1) * pageSize;

  try {
    const { data, totalRows, totalPages } = await getScoresPage(
      pageSize,
      offset
    );

    res.json({
      data,
      page,
      pageSize,
      totalRows,
      totalPages,
    });
  } catch (err) {
    console.error("Error fetching score", err);
    return res.status(500).json({ error: "Failed to fetch scores" });
  }
};

export const addScore = async (req: Request, res: Response) => {
  const data = req.body;
  try {
    if (Array.isArray(data)) {
      for (const item of data) {
        await createScore(item);
      }
      return res.status(201).json({ message: "Multiple scores created" });
    }

    await createScore(data);
    return res.status(201).json({ message: "Score created" });
  } catch (err) {
    console.error("Failed to add score...", err);
    res.status(500).json({ error: "Failed to add score", err });
  }
};

export const editScore = async (req: Request, res: Response) => {
  const updates = req.body;

  if (!Array.isArray(updates)) {
    return res.status(400).json({ message: "Invalid request body" });
  }

  try {
    const result = await updateScore(updates);
    res.json(result);
  } catch (err) {
    console.error("Updated error:", err);
    res.status(500).json({ message: "Updated err", err });
  }
};

export const removeScoresByAlternative = async (
  req: Request,
  res: Response
) => {
  const ids = req.body;

  if (!Array.isArray(ids)) {
    return res.status(400).json({ message: "Invalid request body" });
  }

  try {
    await deleteScoresByAlternative(ids);
    res.json({ message: "Scores deleted for alternatives" });
  } catch (err) {
    console.error("Deleted scores error:", err);
    res.status(500).json({ message: "Deleted scores error:", err });
  }
};

export const importScoresFromFile = async (req: Request, res: Response) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    const workbook = XLSX.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json<any>(sheet);

    if (!rows.length)
      return res.status(400).json({ message: "No data found in file" });

    // map data kandidat dari rows
    const criteriaMap: Record<string, number> = {
      "Typeng Test": 1,
      "Sosial Media Minded": 2,
      "Pemahaman Mengenai Customer Exprience": 3,
      "History Social Media Activity": 4,
    };

    // Ambil kolom kriteria yang ada di file Excel
    const criteriaKeys = Object.keys(rows[0]).filter((key) =>
      Object.keys(criteriaMap).includes(key)
    );

    // Ambil data kandidat dari file
    // const alternativeData = rows.map((row: any) => ({
    //   candidate_id: row.candidate_id,
    //   name: row.name,
    //   email: row.email || null,
    // }));

    // ambil semua candidate_id dari file
    // const alternativeIds = alternativeData.map((a) => a.candidate_id);

    // cek kandidat yang sudah ada di DB
    // const [existingAlternatives] = await db.query(
    //   "SELECT id FROM candidates WHERE id IN (?)",
    //   [alternativeIds]
    // );

    // extract alternative id yang sudah ada
    // const existingIds = new Set(
    //   (existingAlternatives as any[]).map((a) => a.candidate_id)
    // );

    // filter alternative id yang belum ada
    // const newAlternatives = alternativeData.filter(
    //   (a) => !existingIds.has(a.candidate_id)
    // );

    // insert candidates baru ke DB
    // if (newAlternatives.length) {
    //   const insertData = newAlternatives.map((a) => [
    //     // a.candidate_id,
    //     a.name,
    //     a.email,
    //   ]);
    //   await db.query("INSERT INTO candidates ( name, email) VALUES ?", [
    //     insertData,
    //   ]);
    // }

    const insertAlternartives = rows.map((row) => [
      row.name,
      row.email || null,
    ]);
    const [insertResult]: any = await db.query(
      "INSERT INTO alternative_saw (name, email) VALUES ?",
      [insertAlternartives]
    );

    // karena semua kandidat baru dari file
    let insertId = insertResult.insertId;
    const nameIdMap = new Map<string, number>();
    rows.forEach((row) => {
      nameIdMap.set(row.name, insertId++);
    });

    // Prepare data scores untuk insert ke scores
    const values: any[] = [];
    rows.forEach((row: any) => {
      const alternativeId = nameIdMap.get(row.name);
      if (!alternativeId) return;

      criteriaKeys.forEach((criteriaKey) => {
        const criteriaId = criteriaMap[criteriaKey];
        const value = row[criteriaKey];
        if (value !== undefined && value !== null && value !== "") {
          values.push([alternativeId, criteriaId, value]);
        }
      });
    });

    if (!values.length)
      return res.status(400).json({ message: "No scores data found" });

    // insert scores
    await db.query(
      "INSERT INTO scores_saw (alternative_id, criteria_id, value) VALUES ?",
      [values]
    );

    res.json({
      message: "Scores imported  alternative successfully",
      rows: values.length,
      alternatives: rows.length,
    });
  } catch (err) {
    console.error("Error importing scores from file:", err);
    return res
      .status(500)
      .json({ error: "Failed to import scores from file", err });
  }
};
