import express from "express";
import {
  getGeminiKey,
  updateGeminiKey,
} from "../controllers/settings.controller.js";

const router = express.Router();

router.get("/gemini-key", getGeminiKey);
router.post("/gemini-key", updateGeminiKey);

export default router;
