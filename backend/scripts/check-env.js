import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

console.log('Checking Environment Variables...');
console.log('SHEET ID:', process.env.GOOGLE_SHEET_ID);

if (process.env.GOOGLE_SHEET_ID) {
  console.log('✅ GOOGLE_SHEET_ID is set.');
} else {
  console.log('❌ GOOGLE_SHEET_ID is missing!');
}
