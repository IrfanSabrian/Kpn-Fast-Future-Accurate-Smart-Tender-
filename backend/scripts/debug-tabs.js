import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function debugTabs() {
  console.log('🔍 Debugging Spreadsheet Tabs...');

  try {
    const creds = JSON.parse(fs.readFileSync(path.join(__dirname, '../credentials/service-account.json'), 'utf8'));

    const serviceAccountAuth = new JWT({
      email: creds.client_email,
      key: creds.private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    const spreadsheetId = process.env.GOOGLE_SHEET_ID_PROFIL;
    console.log(`Spreadsheet ID: ${spreadsheetId}`);

    const doc = new GoogleSpreadsheet(spreadsheetId, serviceAccountAuth);
    await doc.loadInfo();

    console.log('\n--- AVAILABLE TABS ---');
    doc.sheetsByIndex.forEach((sheet, index) => {
      console.log(`[${index}] Title: "${sheet.title}" (ID: ${sheet.sheetId})`);
    });

    console.log('\n--- SIMULATING BACKEND LOGIC ---');
    const tabs = doc.sheetsByIndex.map(s => ({ title: s.title }));
    
    let profilTabName = tabs.find(t => t.title.toLowerCase().includes('profil') || t.title.toLowerCase().includes('company'))?.title;
    console.log(`Logic 'Profil' found: "${profilTabName}"`);

    let personilTabName = tabs.find(t => t.title.toLowerCase().includes('personil') || t.title.toLowerCase().includes('personnel'))?.title;
    console.log(`Logic 'Personil' found: "${personilTabName}"`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

debugTabs();
