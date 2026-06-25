import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getDashboard, getAnalytics, getInsights } from "../controllers/intelligenceController.js";

const router = express.Router();

router.get("/dashboard", authMiddleware, getDashboard);
router.get("/analytics", authMiddleware, getAnalytics);
router.get("/insights", authMiddleware, getInsights);

export default router;
