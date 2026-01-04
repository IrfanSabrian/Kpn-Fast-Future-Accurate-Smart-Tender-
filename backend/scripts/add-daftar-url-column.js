/**
 * Add daftar_url column to db_kontrak_pengalaman
 *
 * This script will:
 * 1. Read existing db_kontrak_pengalaman headers
 * 2. Insert 'daftar_url' column before 'kontrak_url'
 * 3. Preserve all existing data
 *
 * Run: node scripts/add-daftar-url-column.js
 */

import { google } from "googleapis";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

// Import the OAuth2 service
import oauth2GoogleService from "../src/services/oauth2Google.service.js";

async function addDaftarUrlColumn() {
  console.log("🚀 Adding daftar_url column to db_kontrak_pengalaman...\n");

  try {
    // Initialize OAuth2 service
    await oauth2GoogleService.initialize();

    if (!oauth2GoogleService.isAuthenticated()) {
      console.log("❌ Not authenticated. Please login via the web app first.");
      console.log(
        "   Open http://localhost:3000 and login with Google account."
      );
      return;
    }

    const authClient = oauth2GoogleService.getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERUSAHAAN;

    console.log(`📊 Spreadsheet ID: ${spreadsheetId}\n`);

    // Get current sheet data
    const sheetName = "db_kontrak_pengalaman";
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:Z1000`,
    });

    const data = response.data.values;
    if (!data || data.length === 0) {
      console.log("❌ No data found in db_kontrak_pengalaman");
      return;
    }

    const headers = data[0];
    console.log("📋 Current headers:", headers);

    // Check if daftar_url already exists
    if (headers.includes("daftar_url")) {
      console.log("ℹ️  daftar_url column already exists. No changes needed.");
      return;
    }

    // Find kontrak_url index
    const kontrakUrlIndex = headers.indexOf("kontrak_url");
    if (kontrakUrlIndex === -1) {
      console.log(
        "❌ kontrak_url column not found! Expected columns may be missing."
      );
      return;
    }

    console.log(`📍 kontrak_url found at index ${kontrakUrlIndex}`);
    console.log(`📍 Will insert daftar_url BEFORE kontrak_url`);

    // Insert daftar_url into headers
    const newHeaders = [
      ...headers.slice(0, kontrakUrlIndex),
      "daftar_url",
      ...headers.slice(kontrakUrlIndex),
    ];

    console.log("\n📋 New headers:", newHeaders);

    // Update all rows with new column (insert empty value for daftar_url)
    const newData = data.map((row, index) => {
      if (index === 0) {
        return newHeaders;
      }
      // Insert empty string for daftar_url at kontrakUrlIndex position
      return [
        ...row.slice(0, kontrakUrlIndex),
        "", // daftar_url (empty for existing data)
        ...row.slice(kontrakUrlIndex),
      ];
    });

    // Clear existing data first
    console.log("\n🗑️  Clearing existing data...");
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${sheetName}!A1:Z1000`,
    });

    // Write new data with updated structure
    console.log("📝 Writing updated data...");
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "RAW",
      resource: { values: newData },
    });

    // Format headers
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const sheet = spreadsheet.data.sheets.find(
      (s) => s.properties.title === sheetName
    );

    if (sheet) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [
            {
              repeatCell: {
                range: {
                  sheetId: sheet.properties.sheetId,
                  startRowIndex: 0,
                  endRowIndex: 1,
                  startColumnIndex: 0,
                  endColumnIndex: newHeaders.length,
                },
                cell: {
                  userEnteredFormat: {
                    backgroundColor: { red: 0.2, green: 0.6, blue: 0.86 },
                    textFormat: {
                      bold: true,
                      foregroundColor: { red: 1, green: 1, blue: 1 },
                    },
                    horizontalAlignment: "CENTER",
                    verticalAlignment: "MIDDLE",
                  },
                },
                fields:
                  "userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)",
              },
            },
            {
              autoResizeDimensions: {
                dimensions: {
                  sheetId: sheet.properties.sheetId,
                  dimension: "COLUMNS",
                  startIndex: 0,
                  endIndex: newHeaders.length,
                },
              },
            },
          ],
        },
      });
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("🎉 COLUMN ADDED SUCCESSFULLY!");
    console.log("=".repeat(60));
    console.log("\n📊 Updated db_kontrak_pengalaman structure:");
    console.log("   Column added: daftar_url (before kontrak_url)");
    console.log(`   Total columns: ${newHeaders.length}`);
    console.log(`   Total rows: ${newData.length}`);
    console.log(
      `\n🔗 Open spreadsheet: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit\n`
    );
  } catch (error) {
    console.error("\n❌ Error:", error.message);
    if (error.response) {
      console.error("Response:", error.response.data);
    }
    process.exit(1);
  }
}

// Run the script
addDaftarUrlColumn();
