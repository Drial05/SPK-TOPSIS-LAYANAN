import { Request, Response } from "express";
import {
  getAllCriteria,
  getCriteriaPage,
  createCreate,
  updateCriteria,
  deleteCriteria,
} from "../../models/saw/criteriaModel";

export const getCriteria = async (req: Request, res: Response) => {
  try {
    const [data] = await getAllCriteria();

    res.json({
      data,
    });
  } catch (err) {
    console.error("Error fetching criteria:", err);
    return res.status(500).json({ error: "Failed to fetch criteria", err });
  }
};

export const getCriteriaPaginition = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string, 10) || 1;
  const pageSize = parseInt(req.query.pageSize as string, 10) || 10;
  const offset = (page - 1) * pageSize;
  try {
    const { data, totalRows, totalPages } = await getCriteriaPage(
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
    console.error("Error fetching criteria:", err);
    return res.status(500).json({ error: "Failed to fetch criteria", err });
  }
};

export const addCriteria = async (req: Request, res: Response) => {
  const { name, weight, type } = req.body;

  try {
    const result = await createCreate(name, weight, type);
    res.status(201).json({ message: "Criteria created", result });
  } catch (err) {
    console.error("Error adding criteria:", err);
    return res.status(500).json({ error: "Failed to add criteria", err });
  }
};

export const editCriteria = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, weight, type } = req.body;

  try {
    const result = await updateCriteria(parseInt(id), name, weight, type);
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Criteria not found" });
    }

    res.json({ message: "Criteria updated", result });
  } catch (err) {
    console.error("Error editing criteria:", err);
    return res.status(500).json({ error: "Failed to edit criteria", err });
  }
};

export const removeCriteria = async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const result = await deleteCriteria(parseInt(id));
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Criteria not found" });
    }

    res.json({ message: "Criteria deleted", result });
  } catch (err) {
    console.error("Error deleting criteria:", err);
    return res.status(500).json({ error: "Failed to deleted criteria", err });
  }
};
