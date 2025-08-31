import { Router } from "express";
import { authenticate } from "../../middleware/authMiddleware";
import {
  exportTopsisResults,
  getAllDataResults,
  getRankingPaginition,
} from "../../controllers/topsis/rankingController";

const router = Router();

router.get("/", getRankingPaginition);
router.get("/all-data-results", getAllDataResults);
router.get("/export-topsis-results", exportTopsisResults);

export default router;
