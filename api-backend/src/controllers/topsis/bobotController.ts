import { Request, Response } from "express";
import {
  getAllBobot,
  getPageBobot,
  createBobot,
  updateBobot,
  deleteBobot,
} from "../../models/topsis/bobotModel";

export const getBobot = async (req: Request, res: Response) => {
  try {
    const data = await getAllBobot();

    res.json({
      data,
    });
  } catch (err) {
    console.error("Error fetching Bobot:", err);
    return res.status(500).json({ error: "Failed to fetch Bobot", err });
  }
};

export const getPagenitionBobot = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
  const offset = (page - 1) * pageSize;
  try {
    const { data, totalRows, totalPages } = await getPageBobot(
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
    console.error("Error fetching Bobot:", err);
    return res.status(500).json({ error: "Failed to fetch Bobot", err });
  }
};

export const addBobot = async (req: Request, res: Response) => {
  const { id_criteria, min_value, max_value, score } = req.body;

  try {
    const result = await createBobot(id_criteria, min_value, max_value, score);
    res.status(201).json({ message: "Bobot created", result });
  } catch (err) {
    console.error("Error adding Bobot:", err);
    return res.status(500).json({ error: "Failed to add Bobot", err });
  }
};

export const editBobot = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { id_criteria, min_value, max_value, score } = req.body;

  try {
    const result = await updateBobot(
      parseInt(id),
      id_criteria,
      min_value,
      max_value,
      score
    );
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Bobot not found" });
    }

    res.json({ message: "Bobot updated", result });
  } catch (err) {
    console.error("Error editing Bobot:", err);
    return res.status(500).json({ error: "Failed to edit Bobot", err });
  }
};

export const removeBobot = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await deleteBobot(parseInt(id));
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Bobot not found" });
    }

    res.json({ message: "Bobot deleted", result });
  } catch (err) {
    console.error("Error deleting Bobot:", err);
    return res.status(500).json({ error: "Failed to deleted Bobot", err });
  }
};
