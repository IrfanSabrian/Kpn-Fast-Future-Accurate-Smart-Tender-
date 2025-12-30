import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import cloudinaryService from "./src/services/cloudinary.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testUpload() {
  console.log("🧪 Testing Cloudinary Upload...\n");

  // Use existing file
  const logoPath = path.resolve(__dirname, "../frontend/public/Logo.png");
  const testCompanyId = "TEST_COMPANY_" + Date.now();

  try {
    if (!fs.existsSync(logoPath)) {
      throw new Error(`Test file not found at: ${logoPath}`);
    }

    console.log("⏳ Uploading to Cloudinary...");
    const result = await cloudinaryService.uploadCompanyLogo(
      logoPath,
      testCompanyId,
      `Test_Logo_${Date.now()}`
    );

    console.log("\n✅ Upload Successful!");
    console.log("URL:", result.url);

    // Cleanup
    await cloudinaryService.deleteCompanyLogo(result.url);
    console.log("✅ Cleaned up (deleted) test logo");
  } catch (error) {
    console.error("\n❌ Upload Failed:", error);
    if (error.code === "ENOTFOUND") {
      console.error("Network error: Check your internet connection.");
    }
  }
}

testUpload();
