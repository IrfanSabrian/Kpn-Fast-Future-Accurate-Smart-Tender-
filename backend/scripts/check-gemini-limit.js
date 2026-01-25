/**
 * Script untuk mengecek status & ketersediaan Model Gemini AI
 * Run: node scripts/check-gemini-limit.js
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function checkModels() {
  console.log("🔍 Mengecek Ketersediaan & Limit Model Gemini...\n");

  // 1. Load API Key
  let apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  try {
    const configPath = path.join(__dirname, "../config/api-settings.json");
    if (fs.existsSync(configPath)) {
      const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
      if (config.gemini_api_key) apiKey = config.gemini_api_key;
    }
  } catch (e) {}

  if (!apiKey) {
    console.error("❌ API Key tidak ditemukan!");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  // Daftar model yang akan dicheck
  const modelsToCheck = [
    { id: "gemini-1.5-flash", name: "Gemini 1.5 Flash (Standard)" },
    {
      id: "gemini-2.5-flash-lite",
      name: "Gemini 2.5 Flash Lite (New/Limited)",
    },
    { id: "gemini-pro", name: "Gemini Pro (Legacy 1.0)" },
  ];

  console.log("---------------------------------------------------");
  console.log("| Model ID | Status | Response / Error |");
  console.log("---------------------------------------------------");

  for (const modelInfo of modelsToCheck) {
    const model = genAI.getGenerativeModel({ model: modelInfo.id });
    process.stdout.write(`| ${modelInfo.id.padEnd(20)} | `);

    try {
      // Test request pendek
      const result = await model.generateContent("Test. Reply 'OK'.");
      const response = await result.response;
      const text = response.text();

      process.stdout.write(`✅ AVAILABLE | ${text.trim().substring(0, 20)}\n`);
    } catch (error) {
      if (error.message.includes("429")) {
        process.stdout.write(`⚠️ LIMIT 429 | Quota Exceeded\n`);
      } else if (
        error.message.includes("404") ||
        error.message.includes("not found")
      ) {
        process.stdout.write(`❌ NOT FOUND | Model tidak ada\n`);
      } else {
        process.stdout.write(
          `❌ ERROR     | ${error.message.substring(0, 20)}...\n`
        );
      }
    }
  }
  console.log("---------------------------------------------------\n");
  console.log("💡 REKOMENDASI:");
  console.log(
    "- Jika 'gemini-1.5-flash' AVAILABLE, gunakan itu sebagai PRIORITAS untuk Teks/Analisis."
  );
  console.log(
    "- 'gemini-2.5-flash-lite' kemungkinan besar LIMIT karena kuota 20/hari."
  );
}

checkModels();
