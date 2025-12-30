import "dotenv/config";
import path from "path";
import cloudinaryService from "./src/services/cloudinary.service.js";

async function testUpload() {
  console.log("🧪 Testing Cloudinary Upload with RELATIVE PATH...\n");

  // Relative path (like Multer might provide)
  const logoPath = "uploads\\test_relative.png";
  const testCompanyId = "TEST_COMPANY_RELATIVE";

  console.log(`📂 Using path: "${logoPath}"`);

  try {
    console.log("⏳ Uploading to Cloudinary...");
    const result = await cloudinaryService.uploadCompanyLogo(
      logoPath,
      testCompanyId,
      "Test_Logo_Relative"
    );

    console.log("\n✅ Upload Successful!");
    console.log("URL:", result.url);

    // Cleanup
    await cloudinaryService.deleteCompanyLogo(result.url);
  } catch (error) {
    console.error("\n❌ Upload Failed:", error);
  }
}

testUpload();
