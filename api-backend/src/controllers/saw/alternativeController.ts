import { Request, Response, RequestHandler } from "express";
import {
  getAllAlternatives,
  getAlternativesPage,
  createAlternative,
  updateAlternative,
  deleteAlternative,
  AlternativeType,
} from "../../models/saw/alternativeModel";
import fs from "fs";
import path from "path";
import csv from "csv-parser";

export const getAlternatives = async (req: Request, res: Response) => {
  try {
    const allAlternatives = await getAllAlternatives();
    res.json(allAlternatives);
  } catch (err) {
    console.error("Failed get Alternative", err);
    res.status(500).json({ error: "Failed get Alternative", err });
  }
};

export const getAlternativePagenition = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
  const offset = (page - 1) * pageSize;
  try {
    const { data, totalRows, totalPages } = await getAlternativesPage(
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
    console.error("Error fetching Alternatives:", err);
    return res.status(500).json({ error: "Failed to fetch Alternatives" });
  }
};

export const addAlternative = async (req: Request, res: Response) => {
  const { name, email } = req.body;

  try {
    const result = await createAlternative({ name, email });
    res.status(201).json({ message: "Alternative created", result });
  } catch (err) {
    console.error("Error adding Alternative:", err);
    return res.status(500).json({ error: "Failed to add Alternative" });
  }
};

export const editAlternative = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email } = req.body;

  try {
    const result = await updateAlternative(parseInt(id), name, email);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Alternative not found" });
    }

    res.json({ messgae: "Alternative updates", result });
  } catch (err) {
    console.error("Error editing Alternative:", err);
    return res.status(500).json({ error: "Failed to edit Alternative" });
  }
};

export const removeAlternative = async (req: Request, res: Response) => {
  const ids = req.body;

  if (!Array.isArray(ids)) {
    return res.status(400).json({ message: "Invalid request body" });
  }

  try {
    await deleteAlternative(ids);
    res.json({ message: "Alternative deleted success" });
  } catch (err) {
    console.error("Error deleting Alternative:", err);
    return res.status(500).json({ error: "Failed to delete Alternative" });
  }
};

export const importAlternatives: RequestHandler = async (
  req: Request,
  res: Response
) => {
  const file = req.file;

  if (!file) {
    return res.status(400).json({ error: "No file uploaded" });
  }
  const filePath = path.join(__dirname, "../../uploads", file.filename);
  const alternatives: AlternativeType[] = [];

  fs.createReadStream(filePath)
    .pipe(csv())
    .on("data", (row) => {
      console.log("Row read:", row);
      alternatives.push({
        name: row.name,
        email: row.email,
      });
    })
    .on("end", async () => {
      try {
        for (const alternative of alternatives) {
          await createAlternative(alternative);
        }

        fs.unlinkSync(filePath);
        res.status(201).json({ message: "Alternatives imported successfully" });
      } catch (err) {
        res.status(500).json({ error: "Import failed", err });
      }
    })
    .on("error", (err) => {
      res.status(500).json({ error: "error reading csv", err });
    });
};
