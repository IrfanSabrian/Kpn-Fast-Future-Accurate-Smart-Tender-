/**
 * Update db_kontrak_pengalaman Schema
 *
 * This script updates the db_kontrak_pengalaman sheet based on SPK structure.
 * Uses OAuth2 authentication (same as main app).
 */

import { google } from "googleapis";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import oauth2GoogleService from "../src/services/oauth2Google.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

async function updatePengalamanSchema() {
  console.log("🚀 Updating db_kontrak_pengalaman Schema...\n");

  try {
    // Use OAuth2 authentication (same as main application)
    console.log("🔐 Initializing OAuth2...");
    await oauth2GoogleService.initialize();

    if (!oauth2GoogleService.isAuthenticated()) {
      throw new Error(
        "❌ Not authenticated! Please ensure:\n" +
          "1. The backend server is running\n" +
          "2. You have logged in via Google OAuth in the app\n" +
          "3. oauth2-token.json exists in backend/credentials/"
      );
    }

    const authClient = oauth2GoogleService.getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERUSAHAAN;

    console.log(`📊 Spreadsheet ID: ${spreadsheetId}\n`);

    const sheetName = "db_kontrak_pengalaman";

    // Define NEW column structure based on SPK (Surat Perintah Kerja) - 24 columns total
    const newHeaders = [
      "id_kontrak",
      "id_perusahaan",
      "nama_program", // From SPK: PROGRAM
      "nama_kegiatan", // From SPK: KEGIATAN (was: bidang_pekerjaan)
      "nama_sub_kegiatan", // From SPK: SUB KEGIATAN (was: sub_bidang_pekerjaan)
      "nama_pekerjaan", // From SPK: PEKERJAAN
      "lokasi", // From SPK: LOKASI
      "nama_pemberi_tugas",
      "alamat_pemberi_tugas",
      "telepon_pemberi_tugas",
      "fax_pemberi_tugas",
      "kode_pos_pemberi_tugas", // NEW
      "sumber_dana", // From SPK: SUMBER DANA (NEW)
      "nomor_kontrak",
      "tanggal_kontrak",
      "nilai_kontrak",
      "waktu_pelaksanaan", // From SPK: "30 HARI KALENDER"
      "tanggal_mulai", // From SPK: WAKTU PELAKSANAAN - MULAI (NEW)
      "tanggal_selesai_kontrak", // From SPK: WAKTU PELAKSANAAN - S/D
      "tanggal_ba_serah_terima",
      "daftar_url",
      "kontrak_url",
      "tanggal_input", // NEW - auto timestamp
      "author", // NEW - auto from auth
    ];

    console.log(`✨ New schema will have ${newHeaders.length} columns\n`);

    // Read existing data
    console.log("📖 Reading existing data...");
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:Z1000`,
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      console.log("⚠️  Sheet is empty. Creating new structure...");
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: "RAW",
        resource: { values: [newHeaders] },
      });
      console.log("✅ New headers created");
      console.log("\n🎉 Schema update completed!");
      return;
    }

    const oldHeaders = rows[0];
    const dataRows = rows.slice(1);

    console.log(`   Found ${dataRows.length} data rows`);
    console.log(`   Old structure has ${oldHeaders.length} columns`);

    // Create mapping from old to new
    const columnMapping = {};
    oldHeaders.forEach((header, index) => {
      const newIndex = newHeaders.indexOf(header);
      if (newIndex !== -1) {
        columnMapping[index] = newIndex;
      }
    });

    console.log("\n🔄 Mapping old data to new structure...");

    // Transform data rows
    const newDataRows = dataRows.map((row, rowIndex) => {
      const newRow = new Array(newHeaders.length).fill("");

      // Map existing data to new positions
      row.forEach((value, oldIndex) => {
        const newIndex = columnMapping[oldIndex];
        if (newIndex !== undefined) {
          newRow[newIndex] = value || "";
        }
      });

      // Fill new columns with defaults
      // kode_pos_pemberi_tugas (index 10) - empty for now
      // tanggal_input (index 19) - empty or current timestamp
      // author (index 20) - empty or 'system'

      if (rowIndex < 5) {
        console.log(
          `   Row ${rowIndex + 1}: Mapped ${row.length} -> ${
            newRow.length
          } columns`
        );
      }

      return newRow;
    });

    if (dataRows.length > 5) {
      console.log(`   ... ${dataRows.length - 5} more rows mapped`);
    }

    // Prepare final data with new headers
    const finalData = [newHeaders, ...newDataRows];

    console.log("\n💾 Writing updated data back to sheet...");

    // Clear existing data first
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: `${sheetName}!A1:Z1000`,
    });

    // Write new data
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${sheetName}!A1`,
      valueInputOption: "RAW",
      resource: { values: finalData },
    });

    console.log("✅ Data written successfully");

    // Format headers
    console.log("\n🎨 Formatting headers...");
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
      console.log("✅ Headers formatted");
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("🎉 SCHEMA UPDATE COMPLETED!");
    console.log("=".repeat(60));
    console.log("\n📊 New Structure:");
    console.log(`   Total Columns: ${newHeaders.length}`);
    console.log(`   Data Rows: ${dataRows.length}`);
    console.log("\n🆕 Columns Updated/Added:");
    console.log("   • nama_program (NEW - from SPK PROGRAM)");
    console.log("   • nama_kegiatan (RENAMED from bidang_pekerjaan)");
    console.log("   • nama_sub_kegiatan (RENAMED from sub_bidang_pekerjaan)");
    console.log("   • kode_pos_pemberi_tugas (NEW)");
    console.log("   • sumber_dana (NEW - from SPK SUMBER DANA)");
    console.log("   • tanggal_mulai (NEW - from SPK WAKTU PELAKSANAAN)");
    console.log("   • tanggal_input (NEW - auto timestamp)");
    console.log("   • author (NEW - auto from auth)");
    console.log(
      `\n🔗 Open spreadsheet: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit#gid=0\n`
    );
  } catch (error) {
    console.error("\n❌ Error updating schema:", error.message);
    if (error.response) {
      console.error("Response:", error.response.data);
    }
    process.exit(1);
  }
}

// Run the script
updatePengalamanSchema();
