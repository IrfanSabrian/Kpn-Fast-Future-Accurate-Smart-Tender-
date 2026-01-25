import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { convertPdfToImage } from "../src/utils/pdfConverter.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testConversion() {
  console.log("🧪 Testing PDF Conversion...");

  // Create a dummy PDF file for testing if one doesn't exist
  const dummyPdfPath = path.join(__dirname, "test.pdf");

  // Simple PDF header/footer ensuring it looks like a PDF to parsers
  // This is a minimal valid PDF
  const pdfContent = `%PDF-1.7
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << >> >>
endobj
xref
0 4
0000000000 65535 f 
0000000010 00000 n 
0000000060 00000 n 
0000000117 00000 n 
trailer
<< /Size 4 /Root 1 0 R >>
startxref
223
%%EOF`;

  fs.writeFileSync(dummyPdfPath, Buffer.from(pdfContent));

  try {
    const pdfBuffer = fs.readFileSync(dummyPdfPath);
    console.log(`📄 Dummy PDF created (${pdfBuffer.length} bytes)`);

    console.log("🔄 Attempting conversion...");
    const pngBuffer = await convertPdfToImage(pdfBuffer);

    if (pngBuffer && pngBuffer.length > 0) {
      console.log(
        `✅ SUCCESS! PDF converted to PNG (${pngBuffer.length} bytes)`
      );
    } else {
      console.error("❌ FAILED: No output buffer");
    }
  } catch (error) {
    console.error("❌ CONVERSION FAILED:", error.message);
    console.log(
      "\n⚠️ NOTE: This failure confirms we need the Pure JS library instead."
    );
  } finally {
    // Cleanup
    if (fs.existsSync(dummyPdfPath)) fs.unlinkSync(dummyPdfPath);
  }
}

testConversion();
