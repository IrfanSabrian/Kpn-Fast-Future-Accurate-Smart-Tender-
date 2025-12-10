/**
 * Update db_project Structure
 * 
 * New Structure:
 * - id_project (primary key)
 * - id_perusahaan (company)
 * - nama_project (project name)
 * - nik (personel)
 */

import { google } from 'googleapis';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function updateProjectSheet() {
  console.log('🚀 Updating db_project Structure...\n');

  try {
    const serviceAccountPath = path.join(__dirname, '../', process.env.GOOGLE_SERVICE_ACCOUNT_PATH);
    const auth = new google.auth.GoogleAuth({
      keyFile: serviceAccountPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    console.log(`📊 Spreadsheet ID: ${spreadsheetId}\n`);

    // 1. Check if db_project exists
    console.log('1️⃣ Checking db_project sheet...');
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const existingSheets = spreadsheet.data.sheets.map(s => ({
      title: s.properties.title,
      sheetId: s.properties.sheetId
    }));

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
                  columnCount: 4
                }
              }
            }
          }]
        }
      });
      console.log('   ✅ db_project sheet created');
    } else {
      console.log('   ℹ️  db_project sheet already exists - will update headers');
    }

    // 2. Clear existing data and set new headers
    console.log('\n2️⃣ Setting up new db_project structure...');
    const projectHeaders = ['id_project', 'id_perusahaan', 'nama_project', 'nik'];
    
    // Clear all data first
    await sheets.spreadsheets.values.clear({
      spreadsheetId,
      range: 'db_project!A1:Z1000'
    });
    
    // Add new headers
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'db_project!A1:D1',
      valueInputOption: 'RAW',
      resource: {
        values: [projectHeaders]
      }
    });
    console.log('   ✅ New headers set: id_project, id_perusahaan, nama_project, nik');

    // 3. Format headers
    console.log('\n3️⃣ Formatting headers...');
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
                  endColumnIndex: 4
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
                  endIndex: 4
                }
              }
            }
          ]
        }
      });
      console.log('   ✅ Headers formatted');
    }

    // 4. Add sample data
    console.log('\n4️⃣ Adding sample project data...');
    const sampleProjects = [
      ['PROJ001', 'COMP001', 'Sistem Informasi Manajemen Tata Ruang (SIMANTAP)', '1234567890123456'],
      ['PROJ002', 'COMP001', 'Website Company Profile', '9876543210987654']
    ];

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'db_project!A2',
      valueInputOption: 'RAW',
      resource: {
        values: sampleProjects
      }
    });
    console.log(`   ✅ Added ${sampleProjects.length} sample projects`);

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('🎉 DB_PROJECT UPDATE COMPLETED!');
    console.log('='.repeat(60));
    console.log('\n📊 New Structure:');
    console.log('   • id_project       - Project ID (PRIMARY KEY)');
    console.log('   • id_perusahaan    - Company ID');
    console.log('   • nama_project     - Project Name');
    console.log('   • nik              - Personel NIK');
    console.log('\n💡 Concept:');
    console.log('   Each project belongs to a company and assigns personel');
    console.log('   Example: PROJ001 (SIMANTAP) by COMP001 with personel NIK:123...');
    console.log(`\n🔗 Open spreadsheet: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit\n`);

  } catch (error) {
    console.error('\n❌ Error updating db_project:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the update
updateProjectSheet();
