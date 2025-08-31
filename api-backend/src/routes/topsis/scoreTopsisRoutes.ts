import { Router } from "express";
import multer from "multer";
import path from "path";
import {
  getScores,
  addScore,
  editScore,
  removeScores,
  importScoresFromFile,
  importScoresFromXlsx,
} from "../../controllers/topsis/scoreController";
import { authenticate } from "../../middleware/authMiddleware";

const router = Router();

const storage = multer.diskStorage({
  destination: "./src/uploads",
  filename: (req, file, cb) => {
    cb(null, "import_" + Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

router.get("/", getScores);
router.post("/", authenticate, addScore);
router.put("/", authenticate, editScore);
router.delete("/", removeScores);
router.post("/import-scores", upload.single("file"), importScoresFromFile);
router.post("/import-scores-xlsx", upload.single("file"), importScoresFromXlsx);

export default router;
