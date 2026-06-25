import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { completeOnboarding, changePassword, getUser, updateUser } from "../controllers/userController.js";

const router = express.Router();

router.get("/profile", authMiddleware, getUser);
router.post("/onboarding", authMiddleware, completeOnboarding);
router.put("/change-password", authMiddleware, changePassword);
router.put("/", authMiddleware, updateUser);

export default router;
