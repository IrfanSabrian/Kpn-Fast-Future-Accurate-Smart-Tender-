/**
 * Test Script - Create Folder Structure
 * 
 * Script ini akan membuat struktur folder seperti yang diminta:
 * 002. Perkim Pontianak 2025
 *   └── 01. (Pendataan Rumah Tinggal Berdasarkan Geospasial) Pontianak Barat (CV.URBAN EKOLOGI KONSULTAN)
 *       ├── 01. KONTRAK
 *       └── 02. PENAWARAN KONTRAK
 * 
 * Cara menggunakan:
 * 1. Pastikan backend sudah running
 * 2. Pastikan GOOGLE_DRIVE_PARENT_FOLDER_ID sudah diset di .env
 * 3. Jalankan: node backend/test-create-folders.js
 */

const API_URL = 'http://localhost:5000/api/drive/create-project';

const createFolderStructure = async () => {
  console.log('🚀 Starting folder creation...\n');

  const payload = {
    projectName: '002. Perkim Pontianak 2025',
    companyName: '01. (Pendataan Rumah Tinggal Berdasarkan Geospasial) Pontianak Barat (CV.URBAN EKOLOGI KONSULTAN)',
    subfolders: [
      '01. KONTRAK',
      '02. PENAWARAN KONTRAK'
    ]
  };

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const result = await response.json();

    if (result.success) {
      console.log('✅ Folder structure created successfully!\n');
      console.log('📁 Main Folder:');
      console.log(`   Name: ${result.data.mainFolder.name}`);
      console.log(`   ID: ${result.data.mainFolder.id}`);
      console.log(`   Link: ${result.data.mainFolder.webViewLink}\n`);

      console.log('📁 Company Folder:');
      console.log(`   Name: ${result.data.companyFolder.name}`);
      console.log(`   ID: ${result.data.companyFolder.id}`);
      console.log(`   Link: ${result.data.companyFolder.webViewLink}\n`);

      console.log('📁 Subfolders:');
      result.data.subfolders.forEach((folder, index) => {
        console.log(`   ${index + 1}. ${folder.name}`);
        console.log(`      ID: ${folder.id}`);
        console.log(`      Link: ${folder.webViewLink}`);
      });

      console.log('\n✨ Done! Check your Google Drive.');
    } else {
      console.error('❌ Error:', result.message);
    }
  } catch (error) {
    console.error('❌ Failed to create folder structure:', error.message);
    console.error('\n⚠️  Make sure:');
    console.error('   1. Backend server is running (npm start)');
    console.error('   2. GOOGLE_DRIVE_PARENT_FOLDER_ID is set in .env');
    console.error('   3. Google Drive API is enabled in Google Cloud Console');
  }
};

// Run the script
createFolderStructure();
