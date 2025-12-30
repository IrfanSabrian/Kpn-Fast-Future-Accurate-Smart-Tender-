import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, "../../config/api-settings.json");

export const getGeminiKey = async (req, res) => {
  try {
    let key = "";

    // Check config file
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      if (config.gemini_api_key) {
        key = config.gemini_api_key;
      }
    }

    // Mask the key
    const maskedKey = key
      ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}`
      : "";

    res.json({
      hasKey: !!key,
      maskedKey: maskedKey,
      isEnv: false, // Env variable support removed
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

import geminiAIService from "../services/geminiAI.service.js";

export const updateGeminiKey = async (req, res) => {
  try {
    const { apiKey } = req.body;

    // Ensure directory exists
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    }

    config.gemini_api_key = apiKey || "";

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    // Reload service
    await geminiAIService.forceReload();

    res.json({ message: "API Key updated successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
