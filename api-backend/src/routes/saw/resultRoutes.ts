import { Router } from "express";
import { authenticate } from "../../middleware/authMiddleware";
import {
  getAllDataResults,
  getRankingPaginition,
} from "../../controllers/saw/rankingController";

const router = Router();

router.get("/", getRankingPaginition);
router.get("/all-data-results", getAllDataResults);

export default router;
