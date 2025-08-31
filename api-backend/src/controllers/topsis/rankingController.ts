import { Request, Response } from "express";
import XLSX from "xlsx";
import {
  getRankingPage,
  getAllResults,
} from "../../models/topsis/rankingModel";

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
    res.status(500).json({ message: "Failed to fetch results", error: err });
  }
};

export const exportTopsisResults = async (req: Request, res: Response) => {
  try {
    // ambil data result topsis dari tabel results
    const { data } = await getAllResults();

    // ubah ke workshhet
    const worksheet = XLSX.utils.json_to_sheet(data, {
      header: [
        "id",
        "alternative_id",
        "alternative_name",
        "total_score",
        "ranking",
      ],
    });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Topsis Results");

    // simpan ke buffer
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" });

    // kirim sebagai file donwload
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=topsis_results.xlsx"
    );
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );

    res.send(buffer);
  } catch (err) {
    res.status(500).json({ message: "Failed to export tosis", error: err });
  }
};
