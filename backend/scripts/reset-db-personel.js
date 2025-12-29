import googleSheetsService from "../src/services/googleSheets.service.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Setup env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

async function resetDbPersonel() {
  console.log("🔄 Starting DB Personel reset...");

  try {
    await googleSheetsService.initialize();

    // Get Spreadsheet ID
    const spreadsheetId =
      process.env.GOOGLE_SHEET_ID_PERSONEL ||
      process.env.GOOGLE_SHEET_ID_PERSONIL ||
      process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) throw new Error("Spreadsheet ID not found in env");

    const tabName = "db_personel";

    // 1. Read existing data
    console.log(`📖 Reading existing data from ${tabName}...`);
    // Note: readSheet returns array of objects based on *current* headers
    // If current headers are corrupted, this might fail or return weird data.
    // Assuming current headers are still old format: id, nama, alamat, hp, tgl, author.
    const existingData = await googleSheetsService.readSheet(
      spreadsheetId,
      tabName
    );
    console.log(`✅ Found ${existingData.length} existing records.`);

    // 2. Map to new structure
    // Old: id_personel, nama_lengkap, alamat_domisili, no_hp, tanggal_input, author
    // New: id_personel, nama_lengkap, keahlian, tanggal_input, author
    const newData = existingData.map((item) => ({
      id_personel: item.id_personel,
      nama_lengkap: item.nama_lengkap,
      keahlian: "", // Default empty as requested
      tanggal_input: item.tanggal_input,
      author: item.author,
    }));

    // 3. Clear Sheet
    console.log("🧹 Clearing sheet content...");
    await googleSheetsService.sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: tabName,
    });

    // 4. Write Header
    const newHeaders = [
      "id_personel",
      "nama_lengkap",
      "keahlian",
      "tanggal_input",
      "author",
    ];
    console.log("📝 Writing new headers:", newHeaders);

    await googleSheetsService.sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${tabName}!A1`,
      valueInputOption: "RAW",
      resource: { values: [newHeaders] },
    });

    // 5. Write Data
    if (newData.length > 0) {
      console.log(`📝 Writing ${newData.length} records back...`);
      const rows = newData.map((item) => [
        item.id_personel,
        item.nama_lengkap,
        item.keahlian,
        item.tanggal_input,
        item.author,
      ]);

      await googleSheetsService.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${tabName}!A2`,
        valueInputOption: "RAW",
        resource: { values: rows },
      });
    } else {
      console.log("ℹ️ No data to write back.");
    }

    console.log("✅ DB Personel reset complete successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error resetting DB:", error);
    process.exit(1);
  }
}

resetDbPersonel();
