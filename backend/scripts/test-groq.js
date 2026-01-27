/**
 * Test Script untuk Groq API
 * Test text generation (vision models sudah deprecated)
 */

import Groq from "groq-sdk";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load API settings from config file
const apiSettings = JSON.parse(
  fs.readFileSync(
    path.join(__dirname, "..", "config", "api-settings.json"),
    "utf-8",
  ),
);

const GROQ_API_KEY = apiSettings.groq_api_key;

async function testGroq() {
  console.log("\n🧪 Testing Groq API...");
  console.log("=".repeat(50));

  const client = new Groq({ apiKey: GROQ_API_KEY });

  // Test 1: Text Generation
  console.log("\n📝 Test 1: Text Generation (llama-3.3-70b-versatile)");
  try {
    const response = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "user",
          content: "Say hello in Indonesian",
        },
      ],
      max_tokens: 50,
    });

    console.log("✅ SUCCESS!");
    console.log("Response:", response.choices[0]?.message?.content);
  } catch (error) {
    console.error("❌ FAILED:", error.message);
  }

  // Test 2: List Available Models
  console.log("\n📋 Test 2: List Available Models");
  try {
    const models = await client.models.list();
    console.log("✅ Available Models:");

    // Filter vision models
    const visionModels = models.data.filter(
      (m) => m.id.includes("vision") || m.id.includes("llama-3.2"),
    );

    if (visionModels.length > 0) {
      console.log("\n🖼️  Vision Models Found:");
      visionModels.forEach((m) => {
        console.log(`  - ${m.id} (${m.active ? "Active" : "Inactive"})`);
      });
    } else {
      console.log("⚠️  No vision models available");
    }

    console.log("\n💬 Text Models (first 5):");
    models.data.slice(0, 5).forEach((m) => {
      console.log(`  - ${m.id}`);
    });
  } catch (error) {
    console.error("❌ FAILED:", error.message);
  }

  console.log("\n" + "=".repeat(50));
  console.log("✅ Groq API Test Complete\n");
}

testGroq();
