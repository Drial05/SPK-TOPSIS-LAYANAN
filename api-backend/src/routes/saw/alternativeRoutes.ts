import { Router } from "express";
import {
  getAlternativePagenition,
  addAlternative,
  editAlternative,
  removeAlternative,
  importAlternatives,
  getAlternatives,
} from "../../controllers/saw/alternativeController";
import { authenticate } from "../../middleware/authMiddleware";
import { upload } from "../../middleware/upload";
const router = Router();

router.get("/all", getAlternatives);
router.get("/", getAlternativePagenition);
router.post("/", addAlternative);
router.post("/import", upload.single("file"), importAlternatives);
router.put("/:id", editAlternative);
router.delete("/", removeAlternative);

export default router;
