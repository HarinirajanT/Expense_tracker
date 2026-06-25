import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import { getGoals, createGoal } from "../controllers/goalsController.js";

const router = express.Router();

router.get("/", authMiddleware, getGoals);
router.post("/", authMiddleware, createGoal);

export default router;
