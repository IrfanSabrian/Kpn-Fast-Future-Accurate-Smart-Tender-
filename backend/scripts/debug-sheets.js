import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function debugSheets() {
  console.log('🔍 Debugging Google Sheets Data...');

  try {
    const creds = JSON.parse(fs.readFileSync(path.join(__dirname, '../credentials/service-account.json'), 'utf8'));

    const serviceAccountAuth = new JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const docProfil = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID_PROFIL, serviceAccountAuth);
    await docProfil.loadInfo();
    const sheetProfil = docProfil.sheetsByIndex[0];
    
    // Load cells to see exactly what's in header
    await sheetProfil.loadCells('A1:I2'); 
    
    console.log('\n--- HEADERS (Row 1) ---');
    const headers = [];
    for (let i = 0; i < 9; i++) {
      const cell = sheetProfil.getCell(0, i);
      headers.push(`[${i}] "${cell.value}"`);
    }
    console.log(headers.join('\n'));

    console.log('\n--- DATA (Row 2) ---');
    const data = [];
    for (let i = 0; i < 9; i++) {
      const cell = sheetProfil.getCell(1, i);
      data.push(`[${i}] "${cell.value}"`);
    }
    console.log(data.join('\n'));

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugSheets();
