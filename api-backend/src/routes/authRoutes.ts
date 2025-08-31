import { Router } from "express";
import * as authController from "../controllers/authController";
import { authenticate } from "../middleware/authMiddleware";

const router = Router();

router.post("/login", authController.authUser);
router.post("/register", authController.registerUser);
router.get("/check", authenticate, authController.checkUserByToken);

router.get("/test", (req, res) => {
  res.send("This is a test route");
});

export default router;
