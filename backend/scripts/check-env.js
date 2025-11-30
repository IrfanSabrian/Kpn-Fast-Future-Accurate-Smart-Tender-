import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('Checking Environment Variables...');
console.log('PROFIL ID:', process.env.GOOGLE_SHEET_ID_PROFIL);
console.log('PERSONIL ID:', process.env.GOOGLE_SHEET_ID_PERSONIL);

if (process.env.GOOGLE_SHEET_ID_PROFIL === process.env.GOOGLE_SHEET_ID_PERSONIL) {
  console.log('⚠️ WARNING: Spreadsheet IDs are IDENTICAL!');
  console.log('You are using the same spreadsheet for both.');
  console.log('The code currently overwrites the first tab for both.');
} else {
  console.log('✅ Spreadsheet IDs are different.');
}
