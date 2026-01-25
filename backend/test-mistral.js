import { Mistral } from "@mistralai/mistralai";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- CONFIGURATION ---
// --- CONFIGURATION ---
const configPath = path.join(__dirname, "config/api-settings.json");
let API_KEY = "";

if (fs.existsSync(configPath)) {
  const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
  API_KEY = config.mistral_api_key;
} else {
  console.error("❌ Config file not found:", configPath);
  process.exit(1);
}

if (!API_KEY) {
  console.error("❌ Mistral API Key not found in config");
  process.exit(1);
}
// ---------------------
const PDF_FILENAME = "NIB VERUS (1).pdf";
// ---------------------

async function runTest() {
  const client = new Mistral({ apiKey: API_KEY });
  // PDF is in the SAME directory as this script (backend)
  const pdfPath = path.join(__dirname, PDF_FILENAME);

  if (!fs.existsSync(pdfPath)) {
    console.error(`❌ File not found: ${pdfPath}`);
    return;
  }

  console.log(`🚀 Starting Mistral OCR Test on: ${PDF_FILENAME}`);

  try {
    // 1. UPLOAD FILE
    console.log(`   (Step 1/3) Uploading PDF to Mistral...`);
    const fileContent = fs.readFileSync(pdfPath);

    // Upload file for OCR purpose
    const uploadResponse = await client.files.upload({
      file: {
        fileName: PDF_FILENAME,
        content: fileContent,
      },
      purpose: "ocr",
    });

    const fileId = uploadResponse.id;
    console.log(`      ✅ Uploaded! File ID: ${fileId}`);

    // 2. OCR PROCESSING
    console.log(`   (Step 2/3) Processing OCR...`);

    // Process using the uploaded file ID
    // ERROR FIX: SDK expects type: "file" and property "fileId"
    const ocrResponse = await client.ocr.process({
      model: "mistral-ocr-latest",
      document: {
        type: "file",
        fileId: fileId,
      },
      includeImageBase64: false,
    });

    const rawMarkdown = ocrResponse.pages.map((p) => p.markdown).join("\n\n");
    console.log(`✅ OCR Complete! Extracted ${rawMarkdown.length} characters.`);

    // 3. LLM EXTRACTION (JSON)
    console.log(`   (Step 3/3) Extracting specific JSON data...`);

    const extractionPrompt = `
        Analyze this Indonesian NIB (Nomor Induk Berusaha) content and extract information into JSON.
        
        DOCUMENT CONTENT:
        ${rawMarkdown}

        IMPORTANT INSTRUCTIONS:
        - Extract EXACTLY as written in the document
        - "nomor_nib": Extract the NIB number (usually 13 digits).
        - "tanggal_terbit": Extract the date of issuance in YYYY-MM-DD format. "Diterbitkan tanggal: ..."
        - "status_penanaman_modal": Extract investment status (e.g., "PMDN", "PMA").
        - "skala_usaha": Extract business scale (e.g., "Mikro", "Kecil", "Menengah", "Besar").
        - "kbli": Extract ALL KBLI codes found (usually 5-digit numbers). Return as an array of strings.

        Return ONLY valid JSON with this exact structure:
        {
          "nomor_nib": "...",
          "tanggal_terbit": "YYYY-MM-DD",
          "status_penanaman_modal": "...",
          "skala_usaha": "...",
          "kbli": ["...", "..."]
        }
        `;

    const chatResponse = await client.chat.complete({
      model: "mistral-small-latest",
      messages: [{ role: "user", content: extractionPrompt }],
      responseFormat: { type: "json_object" },
    });

    console.log(`\n🎉 RESULT:`);
    console.log(chatResponse.choices[0].message.content);
  } catch (error) {
    console.error("❌ Error during test:", JSON.stringify(error, null, 2));
  }
}

runTest();
