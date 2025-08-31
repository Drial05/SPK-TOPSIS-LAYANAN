import { Router } from "express";
import {
  getAlternative,
  getAlternativePagenition,
  addAlternative,
  editAlternative,
  removeAlternative,
} from "../../controllers/topsis/alternativeController";
import { authenticate } from "../../middleware/authMiddleware";

const router = Router();

router.get("/all", getAlternative);
router.get("/", getAlternativePagenition);
router.post("/", addAlternative);
router.put("/:id", editAlternative);
router.delete("/", removeAlternative);

export default router;
