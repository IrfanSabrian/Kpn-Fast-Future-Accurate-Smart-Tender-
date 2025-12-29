import googleSheetsService from "../src/services/googleSheets.service.js";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Setup env
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, "../.env") });

async function setupAdditionalTabs() {
  console.log(
    "🔄 Setting up additional personnel tabs (db_referensi, db_stnk)..."
  );

  try {
    await googleSheetsService.initialize();

    // Get Spreadsheet ID
    const spreadsheetId =
      process.env.GOOGLE_SHEET_ID_PERSONEL ||
      process.env.GOOGLE_SHEET_ID_PERSONIL ||
      process.env.GOOGLE_SHEET_ID;
    if (!spreadsheetId) throw new Error("Spreadsheet ID not found in env");

    // Define new tabs and headers
    const newTabs = [
      {
        title: "db_referensi",
        headers: [
          "id_referensi",
          "id_personel",
          "pengalaman",
          "url_referensi",
          "tanggal_input",
          "author",
        ],
      },
      {
        title: "db_stnk",
        headers: [
          "id_stnk",
          "id_personel",
          "no_polisi",
          "merek",
          "warna",
          "url_stnk",
          "tanggal_input",
          "author",
        ],
      },
    ];

    // Check existing sheets
    const spreadsheet = await googleSheetsService.sheets.spreadsheets.get({
      spreadsheetId,
    });
    const existingSheets = spreadsheet.data.sheets.map(
      (s) => s.properties.title
    );

    for (const tab of newTabs) {
      if (!existingSheets.includes(tab.title)) {
        console.log(`➕ Creating new sheet: ${tab.title}...`);
        await googleSheetsService.sheets.spreadsheets.batchUpdate({
          spreadsheetId,
          resource: {
            requests: [
              {
                addSheet: {
                  properties: { title: tab.title },
                },
              },
            ],
          },
        });
        console.log(`✅ Sheet ${tab.title} created.`);

        // Write Headers
        console.log(`📝 Writing headers for ${tab.title}...`);
        await googleSheetsService.sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${tab.title}!A1`,
          valueInputOption: "RAW",
          resource: { values: [tab.headers] },
        });
      } else {
        console.log(
          `ℹ️ Sheet ${tab.title} already exists. Checking/Updating headers...`
        );
        // Optional: Force update headers to ensure they are correct
        await googleSheetsService.sheets.spreadsheets.values.update({
          spreadsheetId,
          range: `${tab.title}!A1`,
          valueInputOption: "RAW",
          resource: { values: [tab.headers] },
        });
        console.log(`✅ Headers updated for ${tab.title}.`);
      }
    }

    console.log("✅ Setup additional tabs complete!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error setup additional tabs:", error);
    process.exit(1);
  }
}

setupAdditionalTabs();
