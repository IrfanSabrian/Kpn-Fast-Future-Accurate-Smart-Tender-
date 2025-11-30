import { GoogleSpreadsheet } from 'google-spreadsheet';
import { JWT } from 'google-auth-library';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function hardReset() {
  console.log('🔥 HARD RESET Google Sheets Data...');

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

    console.log(`Spreadsheet: ${doc.title}`);

    // 1. Create NEW Clean Tabs first
    console.log('   Creating NEW "Profil Perusahaan"...');
    const newProfil = await doc.addSheet({ title: `Profil Perusahaan ${Date.now()}` }); // Temp name to avoid collision
    
    console.log('   Creating NEW "Data Personil"...');
    const newPersonil = await doc.addSheet({ title: `Data Personil ${Date.now()}` }); // Temp name

    // 2. Populate Profil
    const headersProfil = [
      'id_perusahaan', 'nama_perusahaan', 'npwp', 'email', 'alamat', 
      'direktur', 'bidang_usaha', 'tahun_berdiri', 'sertifikat_sbu'
    ];
    await newProfil.setHeaderRow(headersProfil);
    await newProfil.addRow({
      id_perusahaan: 'C001',
      nama_perusahaan: 'CV Karya Profesional Nusantara',
      npwp: '12.345.678.9-012.000',
      email: 'info@kpn.co.id',
      alamat: 'Jl. Contoh No. 123, Pontianak',
      direktur: 'Budi Santoso',
      bidang_usaha: 'Konstruksi',
      tahun_berdiri: '2020',
      sertifikat_sbu: 'SBU-12345'
    });

    // 3. Populate Personil
    const headersPersonil = [
      'id_personil', 'nama', 'posisi', 'pendidikan', 'pengalaman_tahun', 
      'sertifikat', 'email', 'telepon'
    ];
    await newPersonil.setHeaderRow(headersPersonil);
    await newPersonil.addRow({
      id_personil: 'P001',
      nama: 'Ir. Ahmad Hidayat',
      posisi: 'Ahli Teknik Jalan',
      pendidikan: 'S1 Teknik Sipil',
      pengalaman_tahun: '5',
      sertifikat: 'SKA Ahli Madya',
      email: 'ahmad@example.com',
      telepon: '08123456789'
    });

    // 4. Rename and Cleanup
    // Delete ALL other sheets
    const sheetsToDelete = doc.sheetsByIndex.filter(s => s.sheetId !== newProfil.sheetId && s.sheetId !== newPersonil.sheetId);
    
    for (const sheet of sheetsToDelete) {
        console.log(`   Deleting old sheet: ${sheet.title}...`);
        await sheet.delete();
    }

    // Rename new sheets to final names
    await newProfil.updateProperties({ title: 'Profil Perusahaan' });
    await newPersonil.updateProperties({ title: 'Data Personil' });

    console.log('✅ HARD RESET COMPLETE! Clean tabs created.');

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

hardReset();
