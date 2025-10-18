import express from "express";
import { getProbability } from "../controllers/probabilityController.js";

const router = express.Router();
router.post("/", getProbability);
export default router;
