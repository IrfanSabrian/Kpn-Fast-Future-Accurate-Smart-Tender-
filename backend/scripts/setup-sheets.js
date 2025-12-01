/**
 * Setup Google Sheets - Create New Sheet Structure
 * 
 * Script ini akan membuat 6 sheets baru dengan struktur kolom yang sesuai:
 * 1. db_perusahaan
 * 2. db_akta
 * 3. db_pejabat
 * 4. db_nib
 * 5. db_personil
 * 6. db_pengalaman_perusahaan
 */

import { google } from 'googleapis';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// Define sheet structures
const SHEETS_STRUCTURE = {
  db_perusahaan: [
    'id_perusahaan',
    'nama_perusahaan',
    'status_perusahaan',
    'alamat_kantor_pusat',
    'no_telp',
    'no_fax',
    'email'
  ],
  db_akta: [
    'id_perusahaan',
    'jenis_akta',
    'nomor_akta',
    'tanggal_akta',
    'nama_notaris'
  ],
  db_pejabat: [
    'id_perusahaan',
    'nama',
    'nik',
    'jabatan',
    'alamat',
    'no_telp'
  ],
  db_nib: [
    'id_perusahaan',
    'nomor_nib',
    'tanggal_nib',
    'bidang_nib'
  ],
  db_personil: [
    'id_perusahaan',
    'nama',
    'tempat_lahir',
    'tanggal_lahir',
    'strata',
    'jurusan_pendidikan',
    'sertifikat_keahlian',
    'pengalaman_kerja'
  ],
  db_pengalaman_perusahaan: [
    'id_perusahaan',
    'nama_pekerjaan',
    'bidang_pekerjaan',
    'lokasi',
    'nama_pemberi_tugas',
    'alamat_pemberi_tugas',
    'nomor_kontrak',
    'nilai_kontrak',
    'tanggal_selesai_kontrak',
    'tanggal_BA_selesai_serah_terima'
  ]
};

async function setupSheets() {
  console.log('🚀 Setting up Google Sheets structure...\n');

  try {
    // Initialize Google Sheets API
    const serviceAccountPath = path.join(__dirname, '../', process.env.GOOGLE_SERVICE_ACCOUNT_PATH);
    const auth = new google.auth.GoogleAuth({
      keyFile: serviceAccountPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const sheets = google.sheets({ version: 'v4', auth });
    const spreadsheetId = process.env.GOOGLE_SHEET_ID;

    console.log(`📊 Spreadsheet ID: ${spreadsheetId}\n`);

    // 1. Get existing sheets
    console.log('1️⃣ Getting existing sheets...');
    const spreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const existingSheets = spreadsheet.data.sheets.map(s => ({
      title: s.properties.title,
      sheetId: s.properties.sheetId
    }));
    console.log(`   Found ${existingSheets.length} existing sheets:`, existingSheets.map(s => s.title).join(', '));

    // 2. Create new sheets
    console.log('\n2️⃣ Creating new sheets...');
    const requests = [];
    
    for (const [sheetName, headers] of Object.entries(SHEETS_STRUCTURE)) {
      const exists = existingSheets.find(s => s.title === sheetName);
      
      if (exists) {
        console.log(`   ⚠️  Sheet "${sheetName}" already exists, skipping creation`);
      } else {
        console.log(`   ✨ Creating sheet: ${sheetName}`);
        requests.push({
          addSheet: {
            properties: {
              title: sheetName,
              gridProperties: {
                rowCount: 1000,
                columnCount: headers.length
              }
            }
          }
        });
      }
    }

    if (requests.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: { requests }
      });
      console.log(`   ✅ Created ${requests.length} new sheets`);
    } else {
      console.log('   ℹ️  All sheets already exist');
    }

    // 3. Add headers to each sheet
    console.log('\n3️⃣ Adding headers to sheets...');
    const headerUpdates = [];

    for (const [sheetName, headers] of Object.entries(SHEETS_STRUCTURE)) {
      headerUpdates.push({
        range: `${sheetName}!A1`,
        values: [headers]
      });
      console.log(`   📝 Adding headers to: ${sheetName}`);
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId,
      resource: {
        valueInputOption: 'RAW',
        data: headerUpdates
      }
    });
    console.log('   ✅ Headers added successfully');

    // 4. Format headers (bold + background color)
    console.log('\n4️⃣ Formatting headers...');
    const formatRequests = [];

    // Get updated sheet info with new sheetIds
    const updatedSpreadsheet = await sheets.spreadsheets.get({ spreadsheetId });
    const allSheets = updatedSpreadsheet.data.sheets;

    for (const [sheetName, headers] of Object.entries(SHEETS_STRUCTURE)) {
      const sheet = allSheets.find(s => s.properties.title === sheetName);
      if (!sheet) continue;

      formatRequests.push({
        repeatCell: {
          range: {
            sheetId: sheet.properties.sheetId,
            startRowIndex: 0,
            endRowIndex: 1,
            startColumnIndex: 0,
            endColumnIndex: headers.length
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
      });

      // Auto-resize columns
      formatRequests.push({
        autoResizeDimensions: {
          dimensions: {
            sheetId: sheet.properties.sheetId,
            dimension: 'COLUMNS',
            startIndex: 0,
            endIndex: headers.length
          }
        }
      });
    }

    if (formatRequests.length > 0) {
      await sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: { requests: formatRequests }
      });
      console.log('   ✅ Headers formatted successfully');
    }

    // 5. Summary
    console.log('\n' + '='.repeat(50));
    console.log('🎉 SETUP COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log('\n📊 Created Sheets:');
    
    for (const [sheetName, headers] of Object.entries(SHEETS_STRUCTURE)) {
      console.log(`\n   ${sheetName}:`);
      console.log(`   - Columns: ${headers.length}`);
      console.log(`   - Fields: ${headers.join(', ')}`);
    }

    console.log('\n✅ You can now use these sheets in your application!');
    console.log(`\n🔗 Open spreadsheet: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit\n`);

  } catch (error) {
    console.error('\n❌ Error setting up sheets:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the setup
setupSheets();
