import { Router } from "express";
import {
  getCriteriaPaginition,
  getCriteria,
  addCriteria,
  editCriteria,
  removeCriteria,
} from "../../controllers/saw/criteriaController";
// import { authenticate } from "../../middleware/authMiddleware";

const router = Router();

// router.get("/all", getCriteria);
router.get("/all", getCriteria);
router.get("/", getCriteriaPaginition);
router.post("/", addCriteria);
router.put("/:id", editCriteria);
router.delete("/:id", removeCriteria);

export default router;
