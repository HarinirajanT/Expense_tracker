import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
import {
  getSubscriptions,
  createSubscription,
  deleteSubscription,
} from "../controllers/subscriptionsController.js";

const router = express.Router();

router.get("/", authMiddleware, getSubscriptions);
router.post("/", authMiddleware, createSubscription);
router.delete("/:id", authMiddleware, deleteSubscription);

export default router;
