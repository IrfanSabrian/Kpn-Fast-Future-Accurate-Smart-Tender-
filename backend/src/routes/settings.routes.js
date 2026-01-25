import express from "express";
import {
  getAiKeys,
  updateAiKeys,
  testAiKey,
} from "../controllers/settings.controller.js";

const router = express.Router();

router.get("/ai-keys", getAiKeys);
router.post("/ai-keys", updateAiKeys);
router.post("/test-ai-key", testAiKey);

// Legacy support (optional, can be removed if frontend is fully updated)
// router.get("/gemini-key", getGeminiKey);

export default router;
