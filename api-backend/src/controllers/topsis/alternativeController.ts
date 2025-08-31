import { Request, Response, RequestHandler } from "express";
import {
  getAlternatives,
  getAlternativePage,
  createAlternative,
  updateAlternative,
  deleteAlternative,
} from "../../models/topsis/alternativeModel";
import fs from "fs";
import path from "path";
// import csv from "csv-parser";

export const getAlternative = async (req: Request, res: Response) => {
  try {
    const allAlternative = await getAlternatives();
    res.json(allAlternative);
  } catch (err) {
    console.error("Failed Get Alternative", err);
    res.status(500).json({ error: "Failed Get Alternative", err });
  }
};

export const getAlternativePagenition = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
  const offset = (page - 1) * pageSize;
  try {
    const { data, totalRows, totalPages } = await getAlternativePage(
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
    console.error("Error fetching candidates:", err);
    return res.status(500).json({ error: "Failed to fetch candidates" });
  }
};

export const addAlternative = async (req: Request, res: Response) => {
  const { name } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  try {
    const result = await createAlternative({ name });
    res.status(201).json({ message: "alternative created", result });
  } catch (err) {
    console.error("Error adding alternative:", err);
    return res.status(500).json({ error: "Failed to add alternative" });
  }
};

export const editAlternative = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const result = await updateAlternative(parseInt(id), name);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Alternative not found" });
    }

    res.json({ messgae: "Alternative updates", result });
  } catch (err) {
    console.error("Error editing alternative:", err);
    return res.status(500).json({ error: "Failed to edit alternative" });
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
    console.error("Error deleting alternative:", err);
    return res.status(500).json({ error: "Failed to delete candidate" });
  }
};

// export const importCandidates: RequestHandler = async (
//   req: Request,
//   res: Response
// ) => {
//   const file = req.file;

//   if (!file) {
//     return res.status(400).json({ error: "No file uploaded" });
//   }
//   const filePath = path.join(__dirname, "../../uploads", file.filename);
//   const candidates: CandidateType[] = [];

//   fs.createReadStream(filePath)
//     .pipe(csv())
//     .on("data", (row) => {
//       console.log("Row read:", row);
//       candidates.push({
//         name: row.name,
//         email: row.email,
//       });
//     })
//     .on("end", async () => {
//       try {
//         for (const candidate of candidates) {
//           await createCandidate(candidate);
//         }

//         fs.unlinkSync(filePath);
//         res.status(201).json({ message: "Candidates imported successfully" });
//       } catch (err) {
//         res.status(500).json({ error: "Import failed", err });
//       }
//     })
//     .on("error", (err) => {
//       res.status(500).json({ error: "error reading csv", err });
//     });
// };
