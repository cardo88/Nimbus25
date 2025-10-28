import express from "express";
import healthRoutes from "./health.routes.js";
import statusRoutes from "./status.routes.js";
import probabilityRoutes from "./probability.routes.js";
import historyRoutes from "./history.routes.js";

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/status", statusRoutes);
router.use("/probability", probabilityRoutes);
router.use("/history", historyRoutes);

export default router;
