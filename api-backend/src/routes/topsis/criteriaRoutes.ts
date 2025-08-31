import { Router } from "express";
import {
  getCriteria,
  getPagenitionCriteria,
  addCriteria,
  editCriteria,
  removeCriteria,
} from "../../controllers/topsis/criteriaController";
import { authenticate } from "../../middleware/authMiddleware";

const router = Router();

router.get("/all", getCriteria);
router.get("/", getPagenitionCriteria);
router.post("/", addCriteria);
router.put("/:id", editCriteria);
router.delete("/:id", removeCriteria);

export default router;
