import { Router } from "express";
import multer from "multer";
import path from "path";
import {
  getScores,
  addScore,
  editScore,
  removeScoresByAlternative,
  importScoresFromFile,
} from "../../controllers/saw/scoreController";
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
router.post("/", addScore);
router.put("/", editScore);
router.delete("/", removeScoresByAlternative);
router.post(
  "/import-scores-alternatives",
  upload.single("file"),
  importScoresFromFile
);

export default router;
