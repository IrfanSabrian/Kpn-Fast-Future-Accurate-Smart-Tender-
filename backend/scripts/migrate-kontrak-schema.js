/**
 * Migrate db_kontrak_pengalaman Schema
 *
 * Restructure from 24 columns to 19 columns:
 * - Combine: nama_program + nama_kegiatan → kegiatan
 * - Rename: nama_sub_kegiatan → sub_kegiatan
 * - Rename: nama_pekerjaan → pekerjaan
 * - Rename: nama_pemberi_tugas → pemberi_tugas
 * - Combine: alamat + telepon + fax + kode_pos → kontak_pemberi_tugas
 */

import { google } from "googleapis";
import path from "path";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import oauth2GoogleService from "../src/services/oauth2Google.service.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "../.env") });

async function migrateKontrakSchema() {
  console.log("🚀 Migrating db_kontrak_pengalaman Schema...\n");

  try {
    // Use OAuth2 authentication
    console.log("🔐 Initializing OAuth2...");
    await oauth2GoogleService.initialize();

    if (!oauth2GoogleService.isAuthenticated()) {
      throw new Error(
        "❌ Not authenticated! Please ensure:\n" +
          "1. The backend server is running\n" +
          "2. You have logged in via Google OAuth in the app\n" +
          "3. oauth2-token.json exists in backend/credentials/",
      );
    }

    const authClient = oauth2GoogleService.getAuthClient();
    const sheets = google.sheets({ version: "v4", auth: authClient });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERUSAHAAN;

    console.log(`📊 Spreadsheet ID: ${spreadsheetId}\n`);

    const sheetName = "db_kontrak_pengalaman";

    // Define NEW column structure (19 columns)
    const newHeaders = [
      "id_kontrak",
      "id_perusahaan",
      "kegiatan", // Combined from nama_program + nama_kegiatan
      "sub_kegiatan", // Renamed from nama_sub_kegiatan
      "pekerjaan", // Renamed from nama_pekerjaan
      "lokasi",
      "pemberi_tugas", // Renamed from nama_pemberi_tugas
      "kontak_pemberi_tugas", // Combined from alamat/telepon/fax/kode_pos
      "sumber_dana",
      "nomor_kontrak",
      "tanggal_kontrak",
      "nilai_kontrak",
      "waktu_pelaksanaan",
      "tanggal_mulai",
      "tanggal_selesai_kontrak",
      "tanggal_ba_serah_terima",
      "daftar_url",
      "kontrak_url",
      "tanggal_input",
      "author",
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
      console.log("\n🎉 Schema migration completed!");
      return;
    }

    const oldHeaders = rows[0];
    const dataRows = rows.slice(1);

    console.log(`   Found ${dataRows.length} data rows`);
    console.log(`   Old structure has ${oldHeaders.length} columns`);

    // Create column index mapping for old headers
    const getOldIndex = (fieldName) => oldHeaders.indexOf(fieldName);

    // Helper function to combine contact information
    const combineContact = (row) => {
      const parts = [];

      const alamat = row[getOldIndex("alamat_pemberi_tugas")] || "";
      const telepon = row[getOldIndex("telepon_pemberi_tugas")] || "";
      const fax = row[getOldIndex("fax_pemberi_tugas")] || "";
      const kodePos = row[getOldIndex("kode_pos_pemberi_tugas")] || "";

      if (alamat) parts.push(alamat);
      if (telepon) parts.push(`Telp. ${telepon}`);
      if (fax) parts.push(`Fax ${fax}`);
      if (kodePos) parts.push(`Kode Pos ${kodePos}`);

      return parts.join(", ");
    };

    // Helper function to combine kegiatan
    const combineKegiatan = (row) => {
      const program = row[getOldIndex("nama_program")] || "";
      const kegiatan = row[getOldIndex("nama_kegiatan")] || "";

      const parts = [program, kegiatan].filter(Boolean);
      return parts.join(" \n\n ");
    };

    console.log("\n🔄 Transforming data to new structure...");

    // Transform data rows
    const newDataRows = dataRows.map((row, rowIndex) => {
      const newRow = [
        row[getOldIndex("id_kontrak")] || "", // id_kontrak
        row[getOldIndex("id_perusahaan")] || "", // id_perusahaan
        combineKegiatan(row), // kegiatan (combined)
        row[getOldIndex("nama_sub_kegiatan")] || "", // sub_kegiatan (renamed)
        row[getOldIndex("nama_pekerjaan")] || "", // pekerjaan (renamed)
        row[getOldIndex("lokasi")] || "", // lokasi
        row[getOldIndex("nama_pemberi_tugas")] || "", // pemberi_tugas (renamed)
        combineContact(row), // kontak_pemberi_tugas (combined)
        row[getOldIndex("sumber_dana")] || "", // sumber_dana
        row[getOldIndex("nomor_kontrak")] || "", // nomor_kontrak
        row[getOldIndex("tanggal_kontrak")] || "", // tanggal_kontrak
        row[getOldIndex("nilai_kontrak")] || "", // nilai_kontrak
        row[getOldIndex("waktu_pelaksanaan")] || "", // waktu_pelaksanaan
        row[getOldIndex("tanggal_mulai")] || "", // tanggal_mulai
        row[getOldIndex("tanggal_selesai_kontrak")] || "", // tanggal_selesai_kontrak
        row[getOldIndex("tanggal_ba_serah_terima")] || "", // tanggal_ba_serah_terima
        row[getOldIndex("daftar_url")] || "", // daftar_url
        row[getOldIndex("kontrak_url")] || "", // kontrak_url
        row[getOldIndex("tanggal_input")] || "", // tanggal_input
        row[getOldIndex("author")] || "", // author
      ];

      if (rowIndex < 3) {
        console.log(
          `   Row ${rowIndex + 1}: Transformed ${row.length} → ${
            newRow.length
          } columns`,
        );
      }

      return newRow;
    });

    if (dataRows.length > 3) {
      console.log(`   ... ${dataRows.length - 3} more rows transformed`);
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
      (s) => s.properties.title === sheetName,
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
    console.log("🎉 SCHEMA MIGRATION COMPLETED!");
    console.log("=".repeat(60));
    console.log("\n📊 New Structure:");
    console.log(`   Total Columns: ${newHeaders.length}`);
    console.log(`   Data Rows Migrated: ${dataRows.length}`);
    console.log("\n🔄 Column Changes:");
    console.log("   ✓ nama_program + nama_kegiatan → kegiatan");
    console.log("   ✓ nama_sub_kegiatan → sub_kegiatan");
    console.log("   ✓ nama_pekerjaan → pekerjaan");
    console.log("   ✓ nama_pemberi_tugas → pemberi_tugas");
    console.log("   ✓ alamat/telepon/fax/kode_pos → kontak_pemberi_tugas");
    console.log(
      `\n🔗 Open spreadsheet: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit\n`,
    );
  } catch (error) {
    console.error("\n❌ Error migrating schema:", error.message);
    if (error.response) {
      console.error("Response:", error.response.data);
    }
    process.exit(1);
  }
}

// Run the script
migrateKontrakSchema();
