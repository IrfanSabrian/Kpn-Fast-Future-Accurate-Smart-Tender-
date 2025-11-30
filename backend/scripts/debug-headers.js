import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function debugHeaders() {
  console.log('🔍 Debugging Sheet Headers...');

  try {
    const creds = JSON.parse(fs.readFileSync(path.join(__dirname, '../credentials/service-account.json'), 'utf8'));

    const serviceAccountAuth = new JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID_PROFIL;
    const doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
    await doc.loadInfo();

    console.log(`Spreadsheet Title: ${doc.title}`);
    
    // Simulate Backend Logic for Profil
    const tabs = doc.sheetsByIndex.map(s => ({ title: s.title }));
    let profilTabName = tabs.find(t => t.title.toLowerCase().includes('profil') || t.title.toLowerCase().includes('company'))?.title;
    
    if (!profilTabName) {
      console.log('⚠️ Logic: Specific tab not found, falling back to first tab.');
      profilTabName = tabs[0].title;
    }
    
    console.log(`👉 Target Tab for Profil: "${profilTabName}"`);
    
    const sheet = doc.sheetsByTitle[profilTabName];
    await sheet.loadHeaderRow();
    console.log('📋 HEADERS FOUND:', sheet.headerValues);

    // Check match
    const expected = ['nama_perusahaan', 'email'];
    console.log('\n--- CHECKING MATCH ---');
    expected.forEach(key => {
        const found = sheet.headerValues.includes(key);
        console.log(`Key '${key}': ${found ? '✅ FOUND' : '❌ MISSING'}`);
    });

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugHeaders();
