/**
 * Test Cloudinary Upload
 * Script untuk test upload logo ke Cloudinary
 */

import 'dotenv/config';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import cloudinaryService from './src/services/cloudinary.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function testUpload() {
  console.log('🧪 Testing Cloudinary Upload...\n');

  // Check configuration
  console.log('📋 Cloudinary Configuration:');
  const configStatus = cloudinaryService.getConfigStatus();
  console.log(JSON.stringify(configStatus, null, 2));
  console.log('');

  if (!configStatus.configured) {
    console.error('❌ Cloudinary is not configured!');
    console.error('   Please check your .env file for:');
    console.error('   - CLOUDINARY_CLOUD_NAME');
    console.error('   - CLOUDINARY_API_KEY');
    console.error('   - CLOUDINARY_API_SECRET');
    process.exit(1);
  }

  // Path to test logo
  const logoPath = path.join(__dirname, '..', 'frontend', 'public', 'assets', 'logo', 'Logo CV. VERUS CONSULTANT ENGINEERING.png');
  const testCompanyId = 'VERUS_CONSULTANT';

  console.log('📁 Test File Info:');
  console.log(`   Path: ${logoPath}`);
  console.log(`   Company ID: ${testCompanyId}`);
  console.log('');

  try {
    // Check if file exists
    if (!fs.existsSync(logoPath)) {
      throw new Error(`File not found: ${logoPath}`);
    }

    const stats = fs.statSync(logoPath);
    console.log(`   File Size: ${(stats.size / 1024).toFixed(2)} KB`);
    console.log('');

    // Upload to Cloudinary
    console.log('⏳ Uploading to Cloudinary...');
    // Pass null as customFilename to use original filename
    const result = await cloudinaryService.uploadCompanyLogo(logoPath, testCompanyId, null);

    console.log('\n✅ Upload Successful!\n');
    console.log('📊 Upload Result:');
    console.log(JSON.stringify(result, null, 2));
    console.log('');
    console.log('🔗 Logo URL:');
    console.log(result.url);
    console.log('');
    console.log('✨ You can now use this URL in your application!');

  } catch (error) {
    console.error('\n❌ Upload Failed!');
    console.error('Error:', error.message);
    console.error('\nFull Error:', error);
    process.exit(1);
  }
}

// Run test
testUpload();
