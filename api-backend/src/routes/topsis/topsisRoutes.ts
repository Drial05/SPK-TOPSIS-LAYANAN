import { Router } from "express";
import { getTopsisResults } from "../../controllers/topsis/topsisController";

const router = Router();
router.get("/", getTopsisResults);

export default router;
