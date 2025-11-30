/**
 * 🧪 Test Script - Google Sheets Connection
 * 
 * File ini untuk testing koneksi ke Google Sheets API
 * Jalankan setelah .env sudah terisi lengkap
 * 
 * Run: node test-google-sheets.js
 */

import dotenv from 'dotenv';
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// ANSI Colors untuk output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function testGoogleSheetsConnection() {
  log('\n🔍 Testing Google Sheets Connection...', 'cyan');
  log('='.repeat(50), 'cyan');

  // Step 1: Check .env variables
  log('\n1️⃣  Checking environment variables...', 'blue');
  
  const requiredEnvVars = {
    'GOOGLE_SHEET_ID_PROFIL': process.env.GOOGLE_SHEET_ID_PROFIL,
    'GOOGLE_SHEET_ID_PERSONIL': process.env.GOOGLE_SHEET_ID_PERSONIL,
    'GOOGLE_SERVICE_ACCOUNT_PATH': process.env.GOOGLE_SERVICE_ACCOUNT_PATH,
  };

  let hasError = false;

  for (const [key, value] of Object.entries(requiredEnvVars)) {
    if (!value) {
      log(`   ❌ ${key} is missing!`, 'red');
      hasError = true;
    } else {
      log(`   ✅ ${key}`, 'green');
    }
  }

  if (hasError) {
    log('\n❌ Please fill all required environment variables in .env file!', 'red');
    log('📖 Check: backend/ENV_SETUP_GUIDE.md', 'yellow');
    process.exit(1);
  }

  // Step 2: Check Service Account file
  log('\n2️⃣  Checking Service Account file...', 'blue');
  
  const serviceAccountPath = path.resolve(__dirname, process.env.GOOGLE_SERVICE_ACCOUNT_PATH);
  
  if (!fs.existsSync(serviceAccountPath)) {
    log(`   ❌ Service Account file not found!`, 'red');
    log(`   📁 Expected path: ${serviceAccountPath}`, 'yellow');
    log(`   📖 Download from: https://console.cloud.google.com`, 'yellow');
    process.exit(1);
  } else {
    log(`   ✅ Service Account file exists`, 'green');
    log(`   📄 Path: ${serviceAccountPath}`, 'cyan');
  }

  // Step 3: Read and validate Service Account JSON
  log('\n3️⃣  Validating Service Account JSON...', 'blue');
  
  let serviceAccountData;
  try {
    const fileContent = fs.readFileSync(serviceAccountPath, 'utf8');
    serviceAccountData = JSON.parse(fileContent);
    
    const requiredFields = ['type', 'project_id', 'private_key', 'client_email'];
    const missingFields = requiredFields.filter(field => !serviceAccountData[field]);
    
    if (missingFields.length > 0) {
      log(`   ❌ Invalid Service Account JSON! Missing fields:`, 'red');
      missingFields.forEach(field => log(`      - ${field}`, 'red'));
      process.exit(1);
    }
    
    log(`   ✅ Valid Service Account JSON`, 'green');
    log(`   📧 Service Account Email: ${serviceAccountData.client_email}`, 'cyan');
    log(`   📁 Project ID: ${serviceAccountData.project_id}`, 'cyan');
  } catch (error) {
    log(`   ❌ Error reading Service Account file:`, 'red');
    log(`   ${error.message}`, 'red');
    process.exit(1);
  }

  // Step 4: Initialize Google Sheets API
  log('\n4️⃣  Initializing Google Sheets API...', 'blue');
  
  let auth, sheets;
  try {
    auth = new google.auth.GoogleAuth({
      keyFile: serviceAccountPath,
      scopes: ['https://www.googleapis.com/auth/spreadsheets.readonly'],
    });
    
    sheets = google.sheets({ version: 'v4', auth });
    log(`   ✅ Google Sheets API initialized`, 'green');
  } catch (error) {
    log(`   ❌ Failed to initialize API:`, 'red');
    log(`   ${error.message}`, 'red');
    process.exit(1);
  }

  // Step 5: Test connection to Profil Sheet
  log('\n5️⃣  Testing connection to Profil Sheet...', 'blue');
  
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID_PROFIL,
    });
    
    log(`   ✅ Connected to Profil Sheet`, 'green');
    log(`   📊 Sheet Name: ${response.data.properties.title}`, 'cyan');
    log(`   📋 Number of sheets: ${response.data.sheets.length}`, 'cyan');
  } catch (error) {
    log(`   ❌ Failed to connect to Profil Sheet:`, 'red');
    
    if (error.code === 403) {
      log(`   🔐 Permission denied!`, 'yellow');
      log(`   Please share the Google Sheet with:`, 'yellow');
      log(`   📧 ${serviceAccountData.client_email}`, 'cyan');
      log(`   🔓 Permission: Editor`, 'yellow');
    } else if (error.code === 404) {
      log(`   🔍 Sheet not found! Please check GOOGLE_SHEET_ID_PROFIL`, 'yellow');
    } else {
      log(`   ${error.message}`, 'red');
    }
    
    process.exit(1);
  }

  // Step 6: Test reading data from Profil Sheet
  log('\n6️⃣  Reading data from Profil Sheet...', 'blue');
  
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID_PROFIL,
      range: 'Sheet1!A1:I2', // Header + first data row
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      log(`   ⚠️  Sheet is empty!`, 'yellow');
      log(`   Please add company profile data`, 'yellow');
    } else {
      log(`   ✅ Successfully read ${rows.length} rows`, 'green');
      log(`   📋 Headers:`, 'cyan');
      rows[0].forEach((header, index) => {
        log(`      ${index + 1}. ${header}`, 'cyan');
      });
      
      if (rows.length > 1) {
        log(`   📊 Sample data (row 2):`, 'cyan');
        rows[1].forEach((value, index) => {
          if (value) {
            log(`      ${rows[0][index]}: ${value}`, 'cyan');
          }
        });
      }
    }
  } catch (error) {
    log(`   ❌ Failed to read data:`, 'red');
    log(`   ${error.message}`, 'red');
    process.exit(1);
  }

  // Step 7: Test connection to Personil Sheet
  log('\n7️⃣  Testing connection to Personil Sheet...', 'blue');
  
  try {
    const response = await sheets.spreadsheets.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID_PERSONIL,
    });
    
    log(`   ✅ Connected to Personil Sheet`, 'green');
    log(`   📊 Sheet Name: ${response.data.properties.title}`, 'cyan');
  } catch (error) {
    log(`   ❌ Failed to connect to Personil Sheet:`, 'red');
    
    if (error.code === 403) {
      log(`   🔐 Permission denied!`, 'yellow');
      log(`   Please share the Google Sheet with:`, 'yellow');
      log(`   📧 ${serviceAccountData.client_email}`, 'cyan');
    } else if (error.code === 404) {
      log(`   🔍 Sheet not found! Please check GOOGLE_SHEET_ID_PERSONIL`, 'yellow');
    } else {
      log(`   ${error.message}`, 'red');
    }
    
    process.exit(1);
  }

  // Step 8: Test reading data from Personil Sheet
  log('\n8️⃣  Reading data from Personil Sheet...', 'blue');
  
  try {
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: process.env.GOOGLE_SHEET_ID_PERSONIL,
      range: 'Sheet1!A1:I', // All data
    });
    
    const rows = response.data.values;
    if (!rows || rows.length === 0) {
      log(`   ⚠️  Sheet is empty!`, 'yellow');
      log(`   Please add personnel data`, 'yellow');
    } else {
      log(`   ✅ Successfully read ${rows.length} rows (including header)`, 'green');
      log(`   📋 Headers:`, 'cyan');
      rows[0].forEach((header, index) => {
        log(`      ${index + 1}. ${header}`, 'cyan');
      });
      
      const dataRows = rows.length - 1;
      log(`   👥 Number of personnel: ${dataRows}`, 'cyan');
      
      if (dataRows > 0) {
        log(`   📊 Sample personnel:`, 'cyan');
        for (let i = 1; i <= Math.min(3, dataRows); i++) {
          const nama = rows[i][1] || 'N/A';
          const posisi = rows[i][2] || 'N/A';
          log(`      ${i}. ${nama} - ${posisi}`, 'cyan');
        }
      }
    }
  } catch (error) {
    log(`   ❌ Failed to read data:`, 'red');
    log(`   ${error.message}`, 'red');
    process.exit(1);
  }

  // Final Success
  log('\n' + '='.repeat(50), 'green');
  log('🎉 ALL TESTS PASSED!', 'green');
  log('='.repeat(50), 'green');
  
  log('\n✅ Your Google Sheets connection is working perfectly!', 'green');
  log('📚 Next steps:', 'cyan');
  log('   1. Ensure all data in sheets is complete', 'cyan');
  log('   2. Start implementing backend services', 'cyan');
  log('   3. Test PDF/Excel parsing', 'cyan');
  
  log('\n✨ Ready to continue development!\n', 'green');
}

// Run the test
testGoogleSheetsConnection().catch(error => {
  log('\n❌ Unexpected error:', 'red');
  console.error(error);
  process.exit(1);
});
