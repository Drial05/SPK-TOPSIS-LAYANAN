import { Request, Response } from "express";
import { getAllResults, getRankingPage } from "../../models/saw/rankingModel";

export const getRankingPaginition = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
  const offset = (page - 1) * pageSize;

  try {
    const { data, totalRows, totalPages } = await getRankingPage(
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
    console.error("Error fetching ranking", err);
    return res.status(500).json({ error: "Failed to fetching ranking:", err });
  }
};

export const getAllDataResults = async (req: Request, res: Response) => {
  try {
    const { data } = await getAllResults();

    res.json(data);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch all data results", err });
  }
};
