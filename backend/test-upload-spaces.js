import "dotenv/config";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import cloudinaryService from "./src/services/cloudinary.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testUpload() {
  console.log("🧪 Testing Cloudinary Upload with SPACES...\n");

  // Use existing file
  const logoPath = path.resolve(__dirname, "../frontend/public/Logo.png");
  const testCompanyId = "TEST_COMPANY_SPACES";
  const customName = "Logo CV. TEST WITH SPACES"; // Similar to "Logo CV. KPN"

  try {
    if (!fs.existsSync(logoPath)) {
      throw new Error(`Test file not found at: ${logoPath}`);
    }

    console.log(
      `⏳ Uploading to Cloudinary with public_id: "${customName}"...`
    );
    const result = await cloudinaryService.uploadCompanyLogo(
      logoPath,
      testCompanyId,
      customName
    );

    console.log("\n✅ Upload Successful!");
    console.log("URL:", result.url);

    // Cleanup
    await cloudinaryService.deleteCompanyLogo(result.url);
    console.log("✅ Cleaned up (deleted) test logo");
  } catch (error) {
    console.error("\n❌ Upload Failed:", error);
  }
}

testUpload();
