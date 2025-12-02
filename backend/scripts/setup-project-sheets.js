/**
 * Setup Project Sheets Structure
 * 
 * This script will:
 * 1. Recreate db_project sheet (since it was deleted)
 *    Columns: id_project, id_perusahaan, nama_project
 * 
 * 2. Create new db_personil_project sheet
 *    Columns: id_project, id_perusahaan, nik
 */

import { google } from 'googleapis';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function setupProjectSheets() {
  console.log('🚀 Setting up Project Sheets Structure...\n');

  try {
    const serviceAccountPath = path.join(__dirname, '../', process.env.GOOGLE_SERVICE_ACCOUNT_PATH);
    const auth = new google.auth.GoogleAuth({
      keyFile: serviceAccountPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    console.log(`📊 Spreadsheet ID: ${spreadsheetId}\n`);

    // Get existing sheets
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const existingSheets = spreadsheet.data.sheets.map(s => ({
      title: s.properties.title,
      sheetId: s.properties.sheetId
    }));

    // --- 1. SETUP db_project ---
    console.log('1️⃣ Setting up db_project...');
    let projectSheet = existingSheets.find(s => s.title === 'db_project');
    
    if (!projectSheet) {
      console.log('   ✨ Creating sheet: db_project');
      const response = await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: 'db_project',
                gridProperties: { rowCount: 1000, columnCount: 3 }
              }
            }
          }]
        }
      });
      projectSheet = response.data.replies[0].addSheet;
      console.log('   ✅ db_project sheet created');
    } else {
      console.log('   ℹ️  db_project sheet already exists - will update headers');
      // Clear existing data
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: 'db_project!A1:Z1000'
      });
    }

    // Set Headers for db_project
    const projectHeaders = ['id_project', 'id_perusahaan', 'nama_project'];
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'db_project!A1:C1',
      valueInputOption: 'RAW',
      resource: { values: [projectHeaders] }
    });
    console.log('   ✅ Headers set: id_project, id_perusahaan, nama_project');

    // Format Headers for db_project
    await formatHeaders(sheets, spreadsheetId, 'db_project', 3);


    // --- 2. SETUP db_personil_project ---
    console.log('\n2️⃣ Setting up db_personil_project...');
    let personilProjectSheet = existingSheets.find(s => s.title === 'db_personil_project');
    
    if (!personilProjectSheet) {
      console.log('   ✨ Creating sheet: db_personil_project');
      const response = await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: 'db_personil_project',
                gridProperties: { rowCount: 1000, columnCount: 3 }
              }
            }
          }]
        }
      });
      personilProjectSheet = response.data.replies[0].addSheet;
      console.log('   ✅ db_personil_project sheet created');
    } else {
      console.log('   ℹ️  db_personil_project sheet already exists - will update headers');
      // Clear existing data
      await sheets.spreadsheets.values.clear({
        spreadsheetId,
        range: 'db_personil_project!A1:Z1000'
      });
    }

    // Set Headers for db_personil_project
    const personilProjectHeaders = ['id_project', 'id_perusahaan', 'nik'];
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'db_personil_project!A1:C1',
      valueInputOption: 'RAW',
      resource: { values: [personilProjectHeaders] }
    });
    console.log('   ✅ Headers set: id_project, id_perusahaan, nik');

    // Format Headers for db_personil_project
    await formatHeaders(sheets, spreadsheetId, 'db_personil_project', 3);


    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 PROJECT SHEETS SETUP COMPLETED!');
    console.log('='.repeat(60));
    console.log('\n📊 Sheets Created/Updated:');
    console.log('   1. db_project');
    console.log('      • id_project (PK)');
    console.log('      • id_perusahaan');
    console.log('      • nama_project');
    console.log('\n   2. db_personil_project');
    console.log('      • id_project');
    console.log('      • id_perusahaan');
    console.log('      • nik');
    console.log(`\n🔗 Open spreadsheet: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit\n`);

  } catch (error) {
    console.error('\n❌ Error setting up sheets:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Helper to format headers
async function formatHeaders(sheets, spreadsheetId, sheetName, columnCount) {
  const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = spreadsheet.data.sheets.find(s => s.properties.title === sheetName);

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
                endColumnIndex: columnCount
              },
              cell: {
                userEnteredFormat: {
                  backgroundColor: { red: 0.2, green: 0.6, blue: 0.86 },
                  textFormat: {
                    bold: true,
                    foregroundColor: { red: 1, green: 1, blue: 1 }
                  },
                  horizontalAlignment: 'CENTER',
                  verticalAlignment: 'MIDDLE'
                }
              },
              fields: 'userEnteredFormat(backgroundColor,textFormat,horizontalAlignment,verticalAlignment)'
            }
          },
          {
            autoResizeDimensions: {
              dimensions: {
                sheetId: sheet.properties.sheetId,
                dimension: 'COLUMNS',
                startIndex: 0,
                endIndex: columnCount
              }
            }
          }
        ]
      }
    });
    console.log(`   ✅ Headers formatted for ${sheetName}`);
  }
}

// Run the script
setupProjectSheets();
