// Test Gemini API Key
// Run: node test-gemini-api.js

import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from "dotenv";

dotenv.config();

async function testGeminiAPI() {
  console.log("🔍 Testing Gemini API Key...\n");

  // Get API key from api-settings.json
  const configPath = "./config/api-settings.json";
  let apiKey = "";

  try {
    const fs = await import("fs");
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      apiKey = config.gemini_api_key;
    }
  } catch (e) {
    console.error("Error reading config:", e.message);
  }

  if (!apiKey) {
    console.error(
      "❌ ERROR: gemini_api_key not found in config/api-settings.json",
    );
    process.exit(1);
  }

  console.log(`✅ API Key found: ${apiKey.substring(0, 20)}...`);
  console.log("");

  try {
    // Initialize Gemini AI
    console.log("🚀 Initializing Gemini AI...");
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-lite" });

    // Test simple text generation
    console.log("📝 Testing with simple prompt...");
    const result = await model.generateContent(["Say hello in Indonesian"]);
    const response = await result.response;
    const text = response.text();

    console.log("\n✅ SUCCESS! API Key is working!");
    console.log("📄 Response from Gemini:");
    console.log("---");
    console.log(text);
    console.log("---\n");

    console.log("🎉 Your Gemini API is ready to use!");
  } catch (error) {
    console.error("\n❌ ERROR: Failed to connect to Gemini API");
    console.error("Error message:", error.message);
    console.error("\nPossible causes:");
    console.error("1. API Key is invalid or expired");
    console.error("2. Generative Language API is not enabled in Google Cloud");
    console.error("3. API quota exceeded");
    console.error("4. Network connection issues");

    console.error("\n🔧 Solutions:");
    console.error("1. Get new API key: https://aistudio.google.com/app/apikey");
    console.error(
      "2. Enable API: https://console.cloud.google.com/apis/library/generativelanguage.googleapis.com",
    );
    console.error(
      "3. Check quota: https://console.cloud.google.com/apis/dashboard",
    );

    process.exit(1);
  }
}

testGeminiAPI();
