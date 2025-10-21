import express from "express";
import { getProbability } from "../controllers/probabilityController.js";
import { verifyToken } from "../server.js";

const router = express.Router();
router.post("/", verifyToken, getProbability);
export default router;
