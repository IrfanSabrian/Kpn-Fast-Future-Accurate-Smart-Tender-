/**
 * Add Sample Data to Google Sheets
 * 
 * Script ini akan menambahkan sample data ke 6 sheets sebagai contoh
 */

import { google } from 'googleapis';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

// Sample data for all sheets
const SAMPLE_DATA = {
  db_perusahaan: [
    [
      'COMP001',
      'CV Karya Profesional Nusantara',
      'CV',
      'Jl. Parit Haji Husin 2 Gg. Dahlia No. 15 RT 01 RW 06, Pontianak Kota, Kalimantan Barat',
      '0561-12345678',
      '0561-87654321',
      'info@kpn.co.id'
    ]
  ],
  db_akta: [
    [
      'COMP001',
      'Akta Pendirian',
      'AHU-0012345.AH.01.01.Tahun 2020',
      '2020-01-15',
      'Dr. Budi Santoso, S.H., M.Kn'
    ],
    [
      'COMP001',
      'Perubahan Anggaran Dasar',
      'AHU-0067890.AH.01.01.Tahun 2023',
      '2023-05-20',
      'Dr. Budi Santoso, S.H., M.Kn'
    ]
  ],
  db_pejabat: [
    [
      'COMP001',
      'Irfan Sabrian Fadhillah',
      '3201234567890001',
      'Direktur Utama',
      'Jl. Parit Haji Husin 2 Gg. Dahlia No. 15, Pontianak',
      '08123456789'
    ],
    [
      'COMP001',
      'Anggi Nabila Sulistianingsih',
      '3201234567890002',
      'Komisaris',
      'Jl. Parit Haji Husin 2 Gg. Dahlia No. 15, Pontianak',
      '08129876543'
    ]
  ],
  db_nib: [
    [
      'COMP001',
      '1234567890123',
      '2021-03-20',
      'Konstruksi Bangunan Sipil'
    ]
  ],
  db_personil: [
    [
      'COMP001',
      'Anggi Nabila Sulistianingsih',
      'Pontianak',
      '1998-05-15',
      'S1',
      'Teknik Sipil',
      'SKA Ahli Muda Teknik Sipil',
      '5 tahun'
    ],
    [
      'COMP001',
      'Irfan Sabrian Fadhillah',
      'Jakarta',
      '1995-08-20',
      'S1',
      'Teknik Informatika',
      'Sertifikat Project Management',
      'Lebih dari 8 tahun'
    ]
  ],
  db_pengalaman_perusahaan: [
    [
      'COMP001',
      'Sistem Informasi Manajemen Tata Ruang dan Pertanahan (SIMANTAP)',
      'Teknologi Informasi - Web GIS',
      'Kubu Raya, Kalimantan Barat',
      'Dinas PUPR Kabupaten Kubu Raya',
      'Jl. Raya Sungai Raya, Kubu Raya, Kalimantan Barat',
      '027/SPK/PUPR/2024',
      '150000000',
      '2024-11-30',
      '2024-12-15'
    ],
    [
      'COMP001',
      'Pembangunan Website Company Profile',
      'Teknologi Informasi - Web Development',
      'Jakarta',
      'PT. Maju Bersama Indonesia',
      'Jl. Sudirman No. 100, Jakarta Pusat',
      '045/SPK/IT/2023',
      '75000000',
      '2023-12-31',
      '2024-01-10'
    ]
  ]
};

async function addSampleData() {
  console.log('🚀 Adding sample data to Google Sheets...\n');

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

    // Add data to each sheet
    for (const [sheetName, rows] of Object.entries(SAMPLE_DATA)) {
      console.log(`📝 Adding ${rows.length} row(s) to: ${sheetName}`);

      // Append data to sheet (starting from row 2, after headers)
      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A2`,
        valueInputOption: 'RAW',
        resource: {
          values: rows
        }
      });

      console.log(`   ✅ Added successfully`);
    }

    console.log('\n' + '='.repeat(50));
    console.log('🎉 SAMPLE DATA ADDED SUCCESSFULLY!');
    console.log('='.repeat(50));
    console.log('\n📊 Summary:');
    
    for (const [sheetName, rows] of Object.entries(SAMPLE_DATA)) {
      console.log(`   ${sheetName}: ${rows.length} row(s)`);
    }

    console.log('\n✅ You can now view the data in your spreadsheet!');
    console.log(`\n🔗 Open spreadsheet: https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit\n`);

  } catch (error) {
    console.error('\n❌ Error adding sample data:', error.message);
    if (error.response) {
      console.error('Response:', error.response.data);
    }
    process.exit(1);
  }
}

// Run the script
addSampleData();
