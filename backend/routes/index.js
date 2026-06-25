import express from "express";
import authRoutes from "./authRoutes.js";
import accountRoutes from "./accountRoutes.js";
import transactionRoutes from "./transactionRoutes.js";
import userRoutes from "./userRoutes.js";
import intelligenceRoutes from "./intelligenceRoutes.js";
import goalsRoutes from "./goalsRoutes.js";
import subscriptionsRoutes from "./subscriptionsRoutes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/user", userRoutes);
router.use("/account", accountRoutes);
router.use("/transaction", transactionRoutes);
router.use("/intelligence", intelligenceRoutes);
router.use("/goals", goalsRoutes);
router.use("/subscriptions", subscriptionsRoutes);

export default router;
