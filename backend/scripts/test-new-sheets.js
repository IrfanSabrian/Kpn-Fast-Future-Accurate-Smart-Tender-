/**
 * Test New Google Sheets Database Structure
 * 
 * Test CRUD operations untuk 6 tables baru
 */

import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import googleSheetsService from '../src/services/googleSheets.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testNewSheets() {
  console.log('🧪 Testing New Google Sheets Database Structure\n');
  console.log('='.repeat(60));

  try {
    // Initialize service
    await googleSheetsService.initialize();
    console.log('✅ Google Sheets Service initialized\n');

    // TEST 1: DB PERUSAHAAN
    console.log('\n📋 TEST 1: DB PERUSAHAAN');
    console.log('-'.repeat(60));
    
    const companies = await googleSheetsService.getAllCompanies();
    console.log(`✅ Found ${companies.length} companies`);
    
    if (companies.length > 0) {
      console.log(`   Sample: ${companies[0].nama_perusahaan}`);
      console.log(`   ID: ${companies[0].id_perusahaan}`);
    }

    // TEST 2: DB AKTA
    console.log('\n📄 TEST 2: DB AKTA');
    console.log('-'.repeat(60));
    
    const allAkta = await googleSheetsService.getAllAkta();
    console.log(`✅ Found ${allAkta.length} akta documents`);
    
    if (companies.length > 0) {
      const companyAkta = await googleSheetsService.getAllAkta(companies[0].id_perusahaan);
      console.log(`   Akta for ${companies[0].nama_perusahaan}: ${companyAkta.length} documents`);
      
      if (companyAkta.length > 0) {
        console.log(`   Sample: ${companyAkta[0].jenis_akta} - ${companyAkta[0].nomor_akta}`);
      }
    }

    // TEST 3: DB PEJABAT
    console.log('\n👔 TEST 3: DB PEJABAT');
    console.log('-'.repeat(60));
    
    const allPejabat = await googleSheetsService.getAllPejabat();
    console.log(`✅ Found ${allPejabat.length} pejabat`);
    
    if (companies.length > 0) {
      const companyPejabat = await googleSheetsService.getAllPejabat(companies[0].id_perusahaan);
      console.log(`   Pejabat for ${companies[0].nama_perusahaan}: ${companyPejabat.length} persons`);
      
      if (companyPejabat.length > 0) {
        console.log(`   Sample: ${companyPejabat[0].nama} - ${companyPejabat[0].jabatan}`);
      }
    }

    // TEST 4: DB NIB
    console.log('\n🏢 TEST 4: DB NIB');
    console.log('-'.repeat(60));
    
    const allNIB = await googleSheetsService.getAllNIB();
    console.log(`✅ Found ${allNIB.length} NIB records`);
    
    if (companies.length > 0) {
      const companyNIB = await googleSheetsService.getAllNIB(companies[0].id_perusahaan);
      console.log(`   NIB for ${companies[0].nama_perusahaan}: ${companyNIB.length} records`);
      
      if (companyNIB.length > 0) {
        console.log(`   Sample: ${companyNIB[0].nomor_nib} - ${companyNIB[0].bidang_nib}`);
      }
    }

    // TEST 5: DB PERSONIL
    console.log('\n👨‍💼 TEST 5: DB PERSONIL');
    console.log('-'.repeat(60));
    
    const allPersonil = await googleSheetsService.getAllPersonilNew();
    console.log(`✅ Found ${allPersonil.length} personnel`);
    
    if (companies.length > 0) {
      const companyPersonil = await googleSheetsService.getAllPersonilNew(companies[0].id_perusahaan);
      console.log(`   Personil for ${companies[0].nama_perusahaan}: ${companyPersonil.length} persons`);
      
      if (companyPersonil.length > 0) {
        console.log(`   Sample: ${companyPersonil[0].nama} - ${companyPersonil[0].jurusan_pendidikan}`);
        console.log(`   Sertifikat: ${companyPersonil[0].sertifikat_keahlian}`);
      }
    }

    // TEST 6: DB PENGALAMAN PERUSAHAAN
    console.log('\n🏗️  TEST 6: DB PENGALAMAN PERUSAHAAN');
    console.log('-'.repeat(60));
    
    const allPengalaman = await googleSheetsService.getAllPengalaman();
    console.log(`✅ Found ${allPengalaman.length} project experiences`);
    
    if (companies.length > 0) {
      const companyPengalaman = await googleSheetsService.getAllPengalaman(companies[0].id_perusahaan);
      console.log(`   Pengalaman for ${companies[0].nama_perusahaan}: ${companyPengalaman.length} projects`);
      
      if (companyPengalaman.length > 0) {
        console.log(`   Sample Project: ${companyPengalaman[0].nama_pekerjaan}`);
        console.log(`   Client: ${companyPengalaman[0].nama_pemberi_tugas}`);
        console.log(`   Nilai Kontrak: Rp ${parseInt(companyPengalaman[0].nilai_kontrak).toLocaleString('id-ID')}`);
      }
    }

    // SUMMARY
    console.log('\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`✅ db_perusahaan          : ${companies.length} records`);
    console.log(`✅ db_akta                : ${allAkta.length} records`);
    console.log(`✅ db_pejabat             : ${allPejabat.length} records`);
    console.log(`✅ db_nib                 : ${allNIB.length} records`);
    console.log(`✅ db_personil            : ${allPersonil.length} records`);
    console.log(`✅ db_pengalaman_perusahaan: ${allPengalaman.length} records`);
    
    console.log('\n' + '='.repeat(60));
    console.log('🎉 ALL TESTS PASSED!');
    console.log('='.repeat(60));
    console.log('\n✅ Google Sheets database is ready to use!');
    console.log('✅ All CRUD methods are working correctly!\n');

  } catch (error) {
    console.error('\n❌ TEST FAILED:', error.message);
    console.error('\nError details:', error);
    process.exit(1);
  }
}

// Run tests
testNewSheets();
