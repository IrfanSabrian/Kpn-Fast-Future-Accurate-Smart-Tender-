const { GoogleSpreadsheet } = require('google-spreadsheet');
const { JWT } = require('google-auth-library');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function fixHeaders() {
  console.log('🔧 Fixing Google Sheets Headers...');

  try {
    const serviceAccountAuth = new JWT({
      email: require('../credentials/service-account.json').client_email,
      key: require('../credentials/service-account.json').private_key,
      scopes: ['https://www.googleapis.com/auth/spreadsheets'],
    });

    // 1. Fix Company Profile Sheet
    console.log('Checking Company Profile Sheet...');
    const docProfil = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID_PROFIL, serviceAccountAuth);
    await docProfil.loadInfo();
    const sheetProfil = docProfil.sheetsByIndex[0];
    await sheetProfil.loadHeaderRow();
    
    const expectedHeadersProfil = [
      'id_perusahaan', 'nama_perusahaan', 'npwp', 'email', 'alamat', 
      'direktur', 'bidang_usaha', 'tahun_berdiri', 'sertifikat_sbu'
    ];

    console.log('Current headers:', sheetProfil.headerValues);
    
    // Check if headers match
    const missingHeaders = expectedHeadersProfil.filter(h => !sheetProfil.headerValues.includes(h));
    
    if (missingHeaders.length > 0) {
      console.log('⚠️ Missing headers:', missingHeaders);
      console.log('Updating headers...');
      await sheetProfil.setHeaderRow(expectedHeadersProfil);
      console.log('✅ Headers updated!');
    } else {
      console.log('✅ Headers look good!');
    }

    // 2. Fix Personnel Sheet
    console.log('\nChecking Personnel Sheet...');
    const docPersonil = new GoogleSpreadsheet(process.env.GOOGLE_SHEET_ID_PERSONIL, serviceAccountAuth);
    await docPersonil.loadInfo();
    const sheetPersonil = docPersonil.sheetsByIndex[0];
    await sheetPersonil.loadHeaderRow();

    const expectedHeadersPersonil = [
      'id_personil', 'nama', 'posisi', 'pendidikan', 'pengalaman_tahun', 
      'sertifikat', 'email', 'telepon'
    ];

    console.log('Current headers:', sheetPersonil.headerValues);

    const missingHeadersPersonil = expectedHeadersPersonil.filter(h => !sheetPersonil.headerValues.includes(h));

    if (missingHeadersPersonil.length > 0) {
      console.log('⚠️ Missing headers:', missingHeadersPersonil);
      console.log('Updating headers...');
      await sheetPersonil.setHeaderRow(expectedHeadersPersonil);
      console.log('✅ Headers updated!');
    } else {
      console.log('✅ Headers look good!');
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  }
}

fixHeaders();
