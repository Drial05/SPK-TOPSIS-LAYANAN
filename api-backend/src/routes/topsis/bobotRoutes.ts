import { Router } from "express";
import {
  getBobot,
  getPagenitionBobot,
  addBobot,
  editBobot,
  removeBobot,
} from "../../controllers/topsis/bobotController";
import { authenticate } from "../../middleware/authMiddleware";

const router = Router();

router.get("/all", getBobot);
router.get("/", getPagenitionBobot);
router.post("/", addBobot);
router.put("/:id", editBobot);
router.delete("/:id", removeBobot);

export default router;
