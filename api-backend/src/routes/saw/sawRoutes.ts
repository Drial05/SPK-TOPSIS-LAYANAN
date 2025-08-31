import { Router } from "express";
import { getSawRanking } from "../../controllers/saw/sawController";
import { authenticate } from "../../middleware/authMiddleware";

const router = Router();

router.get("/", getSawRanking);

export default router;
