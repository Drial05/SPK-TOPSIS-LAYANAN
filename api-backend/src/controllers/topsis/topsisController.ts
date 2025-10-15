import { Request, Response } from "express";
import { getAlternatives } from "../../models/topsis/alternativeModel";
import { getAllCriteria } from "../../models/topsis/criteriaModel";
import { getScores } from "../../models/topsis/scoreModel";
import { loadBobotCache, topsis } from "../../services/service.topsis";

export const getTopsisResults = async (req: Request, res: Response) => {
  try {
    // 1. ambil data bobot ke cache dulu
    await loadBobotCache();

    const alternatives = await getAlternatives();
    const criteria = await getAllCriteria();
    const scores = await getScores();

    const results = await topsis(alternatives, criteria, scores);
    res.json(results);
  } catch (err) {
    console.error("Error in getTopsesResults:", err);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
