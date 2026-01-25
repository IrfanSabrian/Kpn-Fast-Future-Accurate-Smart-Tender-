import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import geminiAIService from "../services/geminiAI.service.js";
import groqAIService from "../services/groqAI.service.js";
import mistralAIService from "../services/mistralAI.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const configPath = path.join(__dirname, "../../config/api-settings.json");

const PROVIDER_KEYS = {
  gemini: "gemini_api_key",
  groq: "groq_api_key",
  mistral: "mistral_api_key",
};

const PROVIDER_SERVICES = {
  gemini: geminiAIService,
  groq: groqAIService,
  mistral: mistralAIService,
};

export const getAiKeys = async (req, res) => {
  try {
    let config = {};

    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    }

    const keysStatus = {};

    Object.keys(PROVIDER_KEYS).forEach((provider) => {
      const configKey = PROVIDER_KEYS[provider];
      const keyValue = config[configKey] || "";

      keysStatus[provider] = {
        exists: !!keyValue,
        masked: keyValue
          ? `${keyValue.substring(0, 4)}...${keyValue.substring(
              keyValue.length - 4,
            )}`
          : "",
      };
    });

    res.json({ keys: keysStatus });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateAiKeys = async (req, res) => {
  try {
    const { provider, apiKey } = req.body;

    if (!PROVIDER_KEYS[provider]) {
      return res.status(400).json({ error: "Invalid provider" });
    }

    // Ensure directory exists
    const dir = path.dirname(configPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    let config = {};
    if (fs.existsSync(configPath)) {
      config = JSON.parse(fs.readFileSync(configPath, "utf8"));
    }

    const configKey = PROVIDER_KEYS[provider];
    config[configKey] = apiKey || "";

    fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

    // Force reload for all services
    if (PROVIDER_SERVICES[provider]) {
      await PROVIDER_SERVICES[provider].forceReload();
    }

    res.json({ message: `${provider} API Key updated successfully` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const testAiKey = async (req, res) => {
  try {
    const { provider } = req.body;

    if (!PROVIDER_KEYS[provider]) {
      return res.status(400).json({
        success: false,
        error: "Invalid provider",
      });
    }

    const service = PROVIDER_SERVICES[provider];
    if (!service) {
      return res.status(400).json({
        success: false,
        error: "Service not available",
      });
    }

    // Call testConnection method
    const result = await service.testConnection();

    res.json({
      success: true,
      message: `${provider} API connection successful`,
      ...result,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
