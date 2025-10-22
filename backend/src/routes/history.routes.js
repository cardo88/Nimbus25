import express from "express";
import { getHistory } from "../controllers/historyController.js";
import { verifyToken } from "../server.js";

const router = express.Router();
router.get("/", verifyToken, getHistory);

export default router;
