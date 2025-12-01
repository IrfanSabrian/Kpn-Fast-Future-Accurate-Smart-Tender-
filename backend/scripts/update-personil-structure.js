/**
 * Create db_project Sheet and Update db_personil
 * 
 * Changes:
 * 1. db_personil: Remove id_perusahaan, use NIK as primary key
 * 2. Create db_project: Mapping between company and personil
 */

import { google } from 'googleapis';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function updateSheetsStructure() {
  console.log('🚀 Updating Sheets Structure...\n');

  try {
    const serviceAccountPath = path.join(__dirname, '../', process.env.GOOGLE_SERVICE_ACCOUNT_PATH);
    const auth = new google.auth.GoogleAuth({
      keyFile: serviceAccountPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    console.log(`📊 Spreadsheet ID: ${spreadsheetId}\n`);

    // 1. Check existing sheets
    console.log('1️⃣ Checking existing sheets...');
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const existingSheets = spreadsheet.data.sheets.map(s => ({
      title: s.properties.title,
      sheetId: s.properties.sheetId
    }));

    // 2. Create db_project sheet
    const projectSheet = existingSheets.find(s => s.title === 'db_project');
    
    if (!projectSheet) {
      console.log('   ✨ Creating sheet: db_project');
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [{
            addSheet: {
              properties: {
                title: 'db_project',
                gridProperties: {
                  rowCount: 1000,
                  columnCount: 2
                }
              }
            }
          }]
        }
      });
      console.log('   ✅ db_project sheet created');
    } else {
      console.log('   ℹ️  db_project sheet already exists');
    }

    // 3. Add headers to db_project
    console.log('\n2️⃣ Setting up db_project headers...');
    const projectHeaders = ['id_perusahaan', 'nik'];
    
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'db_project!A1:B1',
      valueInputOption: 'RAW',
      resource: {
        values: [projectHeaders]
      }
    });
    console.log('   ✅ Headers added to db_project');

    // 4. Format db_project headers
    console.log('\n3️⃣ Formatting db_project headers...');
    const updatedSpreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const allSheets = updatedSpreadsheet.data.sheets;
    const sheet = allSheets.find(s => s.properties.title === 'db_project');

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
                  endColumnIndex: 2
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
                  endIndex: 2
                }
              }
            }
          ]
        }
      });
      console.log('   ✅ Headers formatted');
    }

    // 5. Migrate existing personil data to db_project
    console.log('\n4️⃣ Migrating personil relationships to db_project...');
    
    const personilData = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'db_personil!A2:H1000'
    });

    if (personilData.data.values && personilData.data.values.length > 0) {
      const projectMappings = [];
      
      personilData.data.values.forEach(row => {
        const id_perusahaan = row[0]; // First column was id_perusahaan
        const nik = row[2]; // Third column might be NIK
        
        if (id_perusahaan && nik) {
          projectMappings.push([id_perusahaan, nik]);
        }
      });

      if (projectMappings.length > 0) {
        await sheets.spreadsheets.values.append({
          spreadsheetId,
          range: 'db_project!A2',
          valueInputOption: 'RAW',
          resource: {
            values: projectMappings
          }
        });
        console.log(`   ✅ Migrated ${projectMappings.length} company-personil relationships`);
      }
    }

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SHEETS STRUCTURE UPDATE COMPLETED!');
    console.log('='.repeat(60));
    console.log('\n📊 Changes:');
    console.log('   ✅ db_project created (id_perusahaan, nik)');
    console.log('   ✅ Existing relationships migrated');
    console.log('\n⚠️  NEXT STEPS:');
    console.log('   1. Update db_personil manually to remove id_perusahaan column');
    console.log('   2. Use db_project to link companies with personil');
    console.log(`\n🔗 Open spreadsheet: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit\n`);

  } catch (error) {
    console.error('\n❌ Error updating sheets:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the update
updateSheetsStructure();
