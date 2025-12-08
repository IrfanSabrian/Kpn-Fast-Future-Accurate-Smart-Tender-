/**
 * Test Google Sheets API Connection
 * Quick test to verify if backend can fetch company data
 */

import dotenv from 'dotenv';
import googleSheetsService from './src/services/googleSheets.service.js';

// Load environment variables
dotenv.config();

async function testConnection() {
  console.log('\n🧪 Testing Google Sheets Connection...\n');
  
  try {
    console.log('📊 Fetching company profiles...');
    const companies = await googleSheetsService.getAllProfilPerusahaan();
    
    console.log(`✅ Success! Found ${companies.length} companies\n`);
    
    if (companies.length > 0) {
      console.log('📋 First company data:');
      console.log(JSON.stringify(companies[0], null, 2));
    }
    
    console.log('\n🎉 Test completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Test failed!');
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
}

testConnection();
