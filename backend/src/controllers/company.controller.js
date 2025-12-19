/**
 * Company Profile Controller
 * 
 * Handles HTTP requests untuk company profile management (multiple companies support)
 */

import googleSheetsService from '../services/googleSheets.service.js';
import cloudinaryService from '../services/cloudinary.service.js';
import oauth2GoogleService from '../services/oauth2Google.service.js';

export const getAllCompanies = async (req, res) => {
  try {
    const companies = await googleSheetsService.getAllProfilPerusahaan();
    
    // Return only summary fields for list view (performance optimization)
    const summary = companies.map(company => ({
      id_perusahaan: company.id_perusahaan,
      nama_perusahaan: company.nama_perusahaan,
      no_telp: company.no_telp,
      email: company.email,
      tahun_berdiri: company.tahun_berdiri,
      status: company.status,
      logo_cloud: company.logo_cloud,
      logo_perusahaan: company.logo_perusahaan
    }));
    
    res.json(summary);
  } catch (error) {
    console.error('Error in getAllCompanies:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get company profiles',
      error: error.stack
    });
  }
};

// ========================================
// COMPANY OVERVIEW - Main Profile Only
// ========================================
export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log('🔍 GET /api/companies/' + id + ' (Overview Only)');
    
    const company = await googleSheetsService.getProfilPerusahaanById(id);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: `Company with ID ${id} not found`,
      });
    }

    // Return only main company profile (overview data)
    res.json(company);
  } catch (error) {
    console.error('Error in getCompanyById:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get company profile',
    });
  }
};

// ========================================
// SUB-MODULE ENDPOINTS - Lazy Loading
// ========================================

// GET /api/companies/:id/akta
export const getCompanyAkta = async (req, res) => {
  try {
    const { id } = req.params;
    const aktaData = await googleSheetsService.getSheetData('db_akta');
    const filtered = aktaData.filter(item => item.id_perusahaan === id);
    res.json(filtered);
  } catch (error) {
    console.error('Error in getCompanyAkta:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/companies/:id/pejabat
export const getCompanyPejabat = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Fetch pejabat and personel data in parallel
    const [pejabatData, personelData] = await Promise.all([
      googleSheetsService.getSheetData('db_pejabat'),
      googleSheetsService.getAllPersonil()
    ]);
    
    // Filter pejabat for this company and join with personel data
    const filtered = pejabatData
      .filter(item => item.id_perusahaan === id)
      .map(pejabat => {
        // Find matching personel by id_personel
        const personel = personelData.find(p => p.id_personel === pejabat.id_personel);
        
        return {
          ...pejabat,
          // Add only nama_lengkap from personel data
          nama_lengkap: personel?.nama_lengkap || pejabat.id_personel || 'Unknown'
        };
      });
    
    res.json(filtered);
  } catch (error) {
    console.error('Error in getCompanyPejabat:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/companies/:id/nib
export const getCompanyNib = async (req, res) => {
  try {
    const { id } = req.params;
    const nibData = await googleSheetsService.getSheetData('db_nib');
    const filtered = nibData.filter(item => item.id_perusahaan === id);
    res.json(filtered);
  } catch (error) {
    console.error('Error in getCompanyNib:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/companies/:id/sbu
export const getCompanySbu = async (req, res) => {
  try {
    const { id } = req.params;
    const sbuData = await googleSheetsService.getSheetData('db_sbu');
    const filtered = sbuData.filter(item => item.id_perusahaan === id);
    res.json(filtered);
  } catch (error) {
    console.error('Error in getCompanySbu:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/companies/:id/kta
export const getCompanyKta = async (req, res) => {
  try {
    const { id } = req.params;
    const ktaData = await googleSheetsService.getSheetData('db_kta');
    const filtered = ktaData.filter(item => item.id_perusahaan === id);
    res.json(filtered);
  } catch (error) {
    console.error('Error in getCompanyKta:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/companies/:id/sertifikat
export const getCompanySertifikat = async (req, res) => {
  try {
    const { id } = req.params;
    const sertifikatData = await googleSheetsService.getSheetData('db_sertifikat_standar');
    const filtered = sertifikatData.filter(item => item.id_perusahaan === id);
    res.json(filtered);
  } catch (error) {
    console.error('Error in getCompanySertifikat:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/companies/:id/pajak - Combined tax data
export const getCompanyPajak = async (req, res) => {
  try {
    const { id } = req.params;
    const [npwpData, kswpData, sptData, pkpData] = await Promise.all([
      googleSheetsService.getSheetData('db_npwp_perusahaan'),
      googleSheetsService.getSheetData('db_kswp'),
      googleSheetsService.getSheetData('db_spt'),
      googleSheetsService.getSheetData('db_pkp')
    ]);
    
    res.json({
      npwp: npwpData.filter(item => item.id_perusahaan === id),
      kswp: kswpData.filter(item => item.id_perusahaan === id),
      spt: sptData.filter(item => item.id_perusahaan === id),
      pkp: pkpData.filter(item => item.id_perusahaan === id)
    });
  } catch (error) {
    console.error('Error in getCompanyPajak:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/companies/:id/pengalaman
export const getCompanyPengalaman = async (req, res) => {
  try {
    const { id } = req.params;
    const kontrakData = await googleSheetsService.getSheetData('db_kontrak_pengalaman');
    const filtered = kontrakData.filter(item => item.id_perusahaan === id);
    res.json(filtered);
  } catch (error) {
    console.error('Error in getCompanyPengalaman:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/companies/:id/kbli
export const getCompanyKbli = async (req, res) => {
  try {
    const { id } = req.params;
    const [kbliRelData, masterKbliData] = await Promise.all([
      googleSheetsService.getSheetData('db_perusahaan_kbli'),
      googleSheetsService.getKbliMasterData()
    ]);
    
    const companyKbli = kbliRelData.filter(item => item.id_perusahaan === id);
    const enrichedKbli = companyKbli.map(item => {
      const master = masterKbliData.find(m => m.kode_kbli === item.kode_kbli);
      return {
        ...item,
        nama_klasifikasi: master ? master.nama_klasifikasi : 'Unknown KBLI'
      };
    });
    
    res.json(enrichedKbli);
  } catch (error) {
    console.error('Error in getCompanyKbli:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/companies/:id/cek
export const getCompanyCek = async (req, res) => {
  try {
    const { id } = req.params;
    const cekData = await googleSheetsService.getSheetData('db_cek');
    const filtered = cekData.filter(item => item.id_perusahaan === id);
    res.json(filtered);
  } catch (error) {
    console.error('Error in getCompanyCek:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/companies/:id/bpjs
export const getCompanyBpjs = async (req, res) => {
  try {
    const { id } = req.params;
    const bpjsData = await googleSheetsService.getSheetData('db_bpjs');
    const filtered = bpjsData.filter(item => item.id_perusahaan === id);
    res.json(filtered);
  } catch (error) {
    console.error('Error in getCompanyBpjs:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addCompany = async (req, res) => {
  try {
    console.log('📝 Adding new company...');
    
    // Parse data from form-data (sent from frontend)
    const { nama_perusahaan, no_telp, email, tahun_berdiri, status } = req.body;
    
    // Handle multiple files
    const logoFile = req.files?.logo?.[0];
    const kopFile = req.files?.kop?.[0];

    console.log('📄 Request data:', { nama_perusahaan, no_telp, email, tahun_berdiri, status });
    console.log('📷 Logo file:', logoFile ? `${logoFile.originalname} (${logoFile.size} bytes)` : 'No logo');
    console.log('🖼️  Kop file:', kopFile ? `${kopFile.originalname} (${kopFile.size} bytes)` : 'No kop');

    // Validation
    if (!nama_perusahaan) {
      return res.status(400).json({
        success: false,
        message: 'Company name (nama_perusahaan) is required',
        data: null,
      });
    }

    let logoCloudUrl = '';
    let logoDriveUrl = '';
    let kopDriveUrl = '';

    // If logo file is provided, upload to Cloudinary AND Google Drive
    if (logoFile) {
      console.log('📤 Logo file detected, uploading to Cloudinary and Google Drive...');

      // Upload to Cloudinary
      try {
        console.log('☁️  Uploading to Cloudinary...');
        
        // Check if Cloudinary is configured
        if (!cloudinaryService.isConfigured()) {
          console.warn('⚠️  Cloudinary not configured, skipping...');
          console.warn('   Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env');
        } else {
          const cloudinaryResult = await cloudinaryService.uploadCompanyLogo(
            logoFile.path,
            nama_perusahaan,
            `Logo ${nama_perusahaan}`
          );
          logoCloudUrl = cloudinaryResult.url;
          console.log('✅ Cloudinary upload success:', logoCloudUrl);
        }
      } catch (cloudinaryError) {
        // Determine error type for better user feedback
        const isNetworkError = cloudinaryError.code === 'NETWORK_ERROR' || 
                               cloudinaryError.code === 'ENOTFOUND' ||
                               cloudinaryError.message.includes('Cannot connect to Cloudinary');
        
        if (isNetworkError) {
          console.error('❌ Cloudinary upload failed: NETWORK ERROR');
          console.error('   Reason: Cannot reach Cloudinary servers');
          console.error('   This is likely due to:');
          console.error('   • No internet connection');
          console.error('   • DNS resolution failure');
          console.error('   • Firewall/proxy blocking api.cloudinary.com');
          console.error('   ');
          console.error('   💡 To fix:');
          console.error('   1. Check your internet connection');
          console.error('   2. Try accessing https://cloudinary.com in your browser');
          console.error('   3. Check firewall/antivirus settings');
          console.error('   4. Try using a VPN or different network');
          console.error('   ');
          console.warn('⚠️  Continuing with Google Drive upload only...');
        } else if (cloudinaryError.code === 'CLOUDINARY_NOT_CONFIGURED') {
          console.error('❌ Cloudinary upload failed: NOT CONFIGURED');
          console.error('   Please add Cloudinary credentials to .env file');
        } else {
          console.error('❌ Cloudinary upload failed:', cloudinaryError.message);
          console.error('   Stack:', cloudinaryError.stack);
        }
        
        // Continue without cloudinary URL - graceful degradation
      }

      // Note: DO NOT delete temporary file yet - Google Drive upload needs it!
    }

    // Get current companies count to determine folder number
    const existingCompanies = await googleSheetsService.getAllCompanies();
    const folderNumber = String(existingCompanies.length + 1).padStart(2, '0');

    // Upload to Google Drive with folder number
    if (logoFile && !logoDriveUrl) {
      try {
        console.log('📂 Uploading logo to Google Drive...');
        const driveResult = await uploadLogoToDrive(logoFile, nama_perusahaan, folderNumber);
        logoDriveUrl = driveResult.webViewLink;
        console.log('✅ Google Drive logo upload success:', logoDriveUrl);
      } catch (driveError) {
        console.error('❌ Google Drive logo upload failed:', driveError.message);
        console.error('   Stack:', driveError.stack);
        // Continue without drive URL
      }
    }

    // Upload Kop to Google Drive (NO Cloudinary)
    if (kopFile) {
      try {
        console.log('📂 Uploading kop to Google Drive...');
        const kopResult = await uploadKopToDrive(kopFile, nama_perusahaan, folderNumber);
        kopDriveUrl = kopResult.webViewLink;
        console.log('✅ Google Drive kop upload success:', kopDriveUrl);
      } catch (kopError) {
        console.error('❌ Google Drive kop upload failed:', kopError.message);
        console.error('   Stack:', kopError.stack);
        // Continue without kop URL
      }
    }

    // Clean up temporary files after ALL uploads complete
    const filesToCleanup = [logoFile, kopFile].filter(Boolean);
    for (const file of filesToCleanup) {
      if (file?.path) {
        try {
          const fs = await import('fs/promises');
          await fs.unlink(file.path);
          console.log('🗑️  Temporary file deleted:', file.path);
        } catch (cleanupError) {
          console.warn('⚠️  Could not delete temporary file:', cleanupError.message);
        }
      }
    }

    console.log('📊 Upload Summary:');
    console.log('   Logo Cloudinary:', logoCloudUrl || 'NOT UPLOADED');
    console.log('   Logo Drive:', logoDriveUrl || 'NOT UPLOADED');
    console.log('   Kop Drive:', kopDriveUrl || 'NOT UPLOADED');

    // Get current date and time for tanggal_input
    const now = new Date();
    const tanggalInput = now.toISOString().slice(0, 19).replace('T', ' ');

    // Get author from OAuth2 Google Service (logged in user)
    let author = 'system';
    try {
      const userInfo = await oauth2GoogleService.getUserInfo();
      author = userInfo.name || userInfo.email || 'system';
    } catch (error) {
      console.warn('⚠️  Could not get user info for author:', error.message);
    }

    // Save company profile to Google Sheets
    const companyData = {
      nama_perusahaan,
      no_telp: no_telp || '',
      email: email || '',
      tahun_berdiri: tahun_berdiri || '',
      status: status || 'Pusat',
      logo_perusahaan: logoDriveUrl,
      logo_cloud: logoCloudUrl,
      kop_perusahaan: kopDriveUrl,
      tanggal_input: tanggalInput,
      author: author
    };

    console.log('💾 Saving to database:', companyData);

    const result = await googleSheetsService.addProfilPerusahaan(companyData);

    console.log('✅ Company added successfully:', result.data);

    res.status(201).json({
      success: true,
      message: 'Company profile added successfully',
      data: result.data,
    });
  } catch (error) {
    console.error('❌ Error in addCompany:', error);
    console.error('   Stack:', error.stack);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add company profile',
      data: null,
    });
  }
};

/**
 * Helper function to get file extension from mimetype
 */
function getExtensionFromMimetype(mimetype) {
  const mimetypeMap = {
    'image/png': '.png',
    'image/jpeg': '.jpg',
    'image/jpg': '.jpg',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg'
  };
  return mimetypeMap[mimetype] || '.png'; // Default to .png
}

/**
 * Helper function to upload logo to Google Drive
 * Path: {GOOGLE_DRIVE_PERUSAHAAN_FOLDER_ID}/[folderNumber. nama_perusahaan]/1.0 Logo & Kop/Logo [nama_perusahaan]
 * @param {Object} file - Multer file object
 * @param {string} namaPerusahaan - Company name
 * @param {string} folderNumber - Folder number (e.g., '01', '02')
 */
async function uploadLogoToDrive(file, namaPerusahaan, folderNumber) {
  const basePerusahaanFolderId = process.env.GOOGLE_DRIVE_PERUSAHAAN_FOLDER_ID;
  
  if (!basePerusahaanFolderId) {
    throw new Error('GOOGLE_DRIVE_PERUSAHAAN_FOLDER_ID not configured in .env');
  }

  // Folder structure: [folderNumber. nama_perusahaan]/1.0 Logo & Kop/Logo [nama_perusahaan].ext
  // Example: 01. CV. VERUS CONSULTANT ENGINEERING/1.0 Logo & Kop/Logo CV. VERUS....png
  const companyFolderName = `${folderNumber}. ${namaPerusahaan}`;
  const folderPath = [companyFolderName, '1.0 Logo & Kop'];
  
  // Get file extension from original filename or mimetype
  const path = await import('path');
  const fileExtension = path.extname(file.originalname) || getExtensionFromMimetype(file.mimetype);
  const fileName = `Logo ${namaPerusahaan}${fileExtension}`;


  // Read file as buffer
  const fs = await import('fs/promises');
  const fileBuffer = await fs.readFile(file.path);

  // Upload using oauth2GoogleService
  const result = await oauth2GoogleService.uploadPdfFile(
    fileBuffer,
    fileName,
    file.mimetype,
    folderPath,
    basePerusahaanFolderId
  );

  // NOTE: File cleanup is handled by the controller after all uploads complete
  // Don't delete here because we're doing parallel uploads

  return result;
}

/**
 * Helper function to upload kop to Google Drive
 * Path: {GOOGLE_DRIVE_PERUSAHAAN_FOLDER_ID}/[folderNumber. nama_perusahaan]/1.0 Logo & Kop/Kop [nama_perusahaan]
 * @param {Object} file - Multer file object
 * @param {string} namaPerusahaan - Company name
 * @param {string} folderNumber - Folder number (e.g., '01', '02')
 */
async function uploadKopToDrive(file, namaPerusahaan, folderNumber) {
  const basePerusahaanFolderId = process.env.GOOGLE_DRIVE_PERUSAHAAN_FOLDER_ID;
  
  if (!basePerusahaanFolderId) {
    throw new Error('GOOGLE_DRIVE_PERUSAHAAN_FOLDER_ID not configured in .env');
  }

  // Folder structure: [folderNumber. nama_perusahaan]/[index].0 Logo & Kop/Kop [nama_perusahaan].ext
  // folderNumber is like "01", "02" but subfolder uses just the index number (1, 2)
  const companyFolderName = `${folderNumber}. ${namaPerusahaan}`;
  const companyIndex = parseInt(folderNumber, 10); // Remove leading zero: "01" -> 1
  const folderPath = [companyFolderName, `${companyIndex}.0 Logo & Kop`];
  
  // Get file extension from original filename or mimetype
  const path = await import('path');
  const fileExtension = path.extname(file.originalname) || getExtensionFromMimetype(file.mimetype);
  const fileName = `Kop ${namaPerusahaan}${fileExtension}`;

  // Read file as buffer
  const fs = await import('fs/promises');
  const fileBuffer = await fs.readFile(file.path);

  // Upload using oauth2GoogleService
  const result = await oauth2GoogleService.uploadPdfFile(
    fileBuffer,
    fileName,
    file.mimetype,
    folderPath,
    basePerusahaanFolderId
  );

  // NOTE: File cleanup is handled by the controller after all uploads complete
  return result;
}

/**
 * Helper function to upload company profile PDF to Google Drive
 * Path: {GOOGLE_DRIVE_PERUSAHAAN_FOLDER_ID}/[folderNumber. nama_perusahaan]/1.1 Profil Perusahaan/Profil Perusahaan [nama_perusahaan].pdf
 * @param {Object} file - Multer file object
 * @param {string} namaPerusahaan - Company name
 * @param {string} folderNumber - Folder number (e.g., '01', '02')
 */
async function uploadCompanyProfileToDrive(file, namaPerusahaan, folderNumber) {
  const basePerusahaanFolderId = process.env.GOOGLE_DRIVE_PERUSAHAAN_FOLDER_ID;
  
  if (!basePerusahaanFolderId) {
    throw new Error('GOOGLE_DRIVE_PERUSAHAAN_FOLDER_ID not configured in .env');
  }

  // Folder structure: [folderNumber. nama_perusahaan]/[index].1 Profil Perusahaan/Profil Perusahaan [nama_perusahaan].pdf
  // folderNumber is like "01", "02" but subfolder uses just the index number (1, 2)
  const companyFolderName = `${folderNumber}. ${namaPerusahaan}`;
  const companyIndex = parseInt(folderNumber, 10); // Remove leading zero: "01" -> 1
  const folderPath = [companyFolderName, `${companyIndex}.1 Profil Perusahaan`];
  
  const fileName = `Profil Perusahaan ${namaPerusahaan}.pdf`;

  // Read file as buffer
  const fs = await import('fs/promises');
  const fileBuffer = await fs.readFile(file.path);

  // Upload using oauth2GoogleService (supports PDF)
  const result = await oauth2GoogleService.uploadPdfFile(
    fileBuffer,
    fileName,
    'application/pdf',
    folderPath,
    basePerusahaanFolderId
  );

  // NOTE: File cleanup is handled by the controller after all uploads complete
  return result;
}

/**
 * Generic helper function to upload company document to Google Drive
 * Handles: Akta, NIB, SBU, KTA, Sertifikat, Kontrak (Pengalaman), Cek
 */
async function uploadDocumentToDrive(file, namaPerusahaan, folderNumber, documentType) {
  const basePerusahaanFolderId = process.env.GOOGLE_DRIVE_PERUSAHAAN_FOLDER_ID;
  
  if (!basePerusahaanFolderId) {
    throw new Error('GOOGLE_DRIVE_PERUSAHAAN_FOLDER_ID not configured in .env');
  }

  const companyIndex = parseInt(folderNumber, 10); // "01" -> 1, "02" -> 2
  
  // Document configuration map
  const docConfig = {
    akta: { index: '2', name: 'Akta Perusahaan' },
    nib: { index: '3', name: 'Nomor Induk Berusaha' },
    sbu: { index: '4', name: 'Sertifikat Badan Usaha' },
    kta: { index: '5', name: 'Kartu Tanda Anggota' },
    sertifikat: { index: '6', name: 'Sertifikat Standar' },
    kontrak: { index: '8', name: 'Kontrak Pengalaman' },
    cek: { index: '9', name: 'Surat Referensi Bank' },
    bpjs: { index: '10', name: 'BPJS' }
  };

  const config = docConfig[documentType];
  if (!config) {
    throw new Error(`Unknown document type: ${documentType}`);
  }

  // Folder structure: [folderNumber. namaPerusahaan]/[companyIndex].[index] [name]/[fileName]
  const companyFolderName = `${folderNumber}. ${namaPerusahaan}`;
  const subfolderName = `${companyIndex}.${config.index} ${config.name}`;
  const fileName = `${config.name} ${namaPerusahaan}.pdf`;
  const folderPath = [companyFolderName, subfolderName];

  // Read file as buffer
  const fs = await import('fs/promises');
  const fileBuffer = await fs.readFile(file.path);

  // Upload using oauth2GoogleService
  const result = await oauth2GoogleService.uploadPdfFile(
    fileBuffer,
    fileName,
    'application/pdf',
    folderPath,
    basePerusahaanFolderId
  );

  return result;
}

export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔄 UPDATE /api/companies/${id}`);
    
    // Parse data
    const { nama_perusahaan, no_telp, email, tahun_berdiri, status } = req.body;
    
    // Handle files
    const logoFile = req.files?.logo?.[0];
    const kopFile = req.files?.kop?.[0];
    const companyProfileFile = req.files?.companyProfile?.[0];
    const aktaFile = req.files?.akta?.[0];
    const nibFile = req.files?.nib?.[0];
    const sbuFile = req.files?.sbu?.[0];
    const ktaFile = req.files?.kta?.[0];
    const sertifikatFile = req.files?.sertifikat?.[0];
    const kontrakFile = req.files?.kontrak?.[0];
    const cekFile = req.files?.cek?.[0];
    const bpjsFile = req.files?.bpjs?.[0];

    console.log('📄 Update payload:', { nama_perusahaan, no_telp, email, year: tahun_berdiri, status });
    console.log('📷 New logo:', logoFile ? 'Yes' : 'No');
    console.log('🖼️  New kop:', kopFile ? 'Yes' : 'No');
    console.log('📋 New company profile PDF:', companyProfileFile ? 'Yes' : 'No');
    console.log('📜 New documents:', {
      akta: aktaFile ? 'Yes' : 'No',
      nib: nibFile ? 'Yes' : 'No',
      sbu: sbuFile ? 'Yes' : 'No',
      kta: ktaFile ? 'Yes' : 'No',
      sertifikat: sertifikatFile ? 'Yes' : 'No',
      kontrak: kontrakFile ? 'Yes' : 'No',
      cek: cekFile ? 'Yes' : 'No',
      bpjs: bpjsFile ? 'Yes' : 'No'
    });

    // 1. Get all companies to find folder number (needed for Drive upload)
    // We need folder number to upload to correct Drive folder: "[No]. [Nama Perusahaan]"
    const allCompanies = await googleSheetsService.getAllProfilPerusahaan();
    const companyIndex = allCompanies.findIndex(c => c.id_perusahaan === id);

    if (companyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Company with ID ${id} not found`,
      });
    }

    const existingCompany = allCompanies[companyIndex];
    // Folder number is index + 1 (padded '01', '02', etc.)
    const folderNumber = String(companyIndex + 1).padStart(2, '0');
    
    console.log(`📂 Company Folder: ${folderNumber}. ${existingCompany.nama_perusahaan}`);

    // Prepare URL holders (keep existing if no new file)
    let logoCloudUrl = existingCompany.logo_cloud;
    let logoDriveUrl = existingCompany.logo_perusahaan;
    let kopDriveUrl = existingCompany.kop_perusahaan;
    let companyProfileUrl = existingCompany.profil_perusahaan_url;
    let aktaUrl = existingCompany.akta_perusahaan_url;
    let nibUrl = existingCompany.nib_url;
    let sbuUrl = existingCompany.sbu_url;
    let ktaUrl = existingCompany.kta_url;
    let sertifikatUrl = existingCompany.sertifikat_standar_url;
    let kontrakUrl = existingCompany.kontrak_url;
    let cekUrl = existingCompany.cek_url;
    let bpjsUrl = existingCompany.url_bpjs;

    // 2. Upload New Logo if provided
    if (logoFile) {
      console.log('📤 Processing new Logo...');
      
      // Upload to Cloudinary
      try {
        if (cloudinaryService.isConfigured()) {
          const cloudinaryResult = await cloudinaryService.uploadCompanyLogo(
            logoFile.path,
            nama_perusahaan || existingCompany.nama_perusahaan,
            `Logo ${nama_perusahaan || existingCompany.nama_perusahaan}`
          );
          logoCloudUrl = cloudinaryResult.url;
          console.log('✅ Cloudinary logo updated:', logoCloudUrl);
        }
      } catch (cloudinaryError) {
        console.error('❌ Cloudinary upload failed:', cloudinaryError.message);
      }

      // Upload to Drive
      try {
        const driveResult = await uploadLogoToDrive(
          logoFile, 
          nama_perusahaan || existingCompany.nama_perusahaan, 
          folderNumber
        );
        logoDriveUrl = driveResult.webViewLink;
        console.log('✅ Google Drive logo updated:', logoDriveUrl);
      } catch (driveError) {
        console.error('❌ Google Drive logo upload failed:', driveError.message);
      }
    }

    // 3. Upload New Kop if provided
    if (kopFile) {
      console.log('📤 Processing new Kop...');
      try {
        const kopResult = await uploadKopToDrive(
          kopFile,
          nama_perusahaan || existingCompany.nama_perusahaan,
          folderNumber
        );
        kopDriveUrl = kopResult.webViewLink;
        console.log('✅ Google Drive kop updated:', kopDriveUrl);
      } catch (kopError) {
        console.error('❌ Google Drive kop upload failed:', kopError.message);
      }
    }

    // 4. Upload New Company Profile PDF if provided
    if (companyProfileFile) {
      console.log('📤 Processing new Company Profile PDF...');
      try {
        const profileResult = await uploadCompanyProfileToDrive(
          companyProfileFile,
          nama_perusahaan || existingCompany.nama_perusahaan,
          folderNumber
        );
        companyProfileUrl = profileResult.webViewLink;
        console.log('✅ Google Drive company profile updated:', companyProfileUrl);
      } catch (profileError) {
        console.error('❌ Google Drive company profile upload failed:', profileError.message);
      }
    }

    // 5. Upload All Other Documents if provided
    const documentTypes = [
      { file: aktaFile, type: 'akta', urlVar: 'aktaUrl', label: 'Akta' },
      { file: nibFile, type: 'nib', urlVar: 'nibUrl', label: 'NIB' },
      { file: sbuFile, type: 'sbu', urlVar: 'sbuUrl', label: 'SBU' },
      { file: ktaFile, type: 'kta', urlVar: 'ktaUrl', label: 'KTA' },
      { file: sertifikatFile, type: 'sertifikat', urlVar: 'sertifikatUrl', label: 'Sertifikat' },
      { file: kontrakFile, type: 'kontrak', urlVar: 'kontrakUrl', label: 'Kontrak' },
      { file: cekFile, type: 'cek', urlVar: 'cekUrl', label: 'Cek' },
      { file: bpjsFile, type: 'bpjs', urlVar: 'bpjsUrl', label: 'BPJS' }
    ];

    for (const doc of documentTypes) {
      if (doc.file) {
        console.log(`📤 Processing new ${doc.label} document...`);
        try {
          const result = await uploadDocumentToDrive(
            doc.file,
            nama_perusahaan || existingCompany.nama_perusahaan,
            folderNumber,
            doc.type
          );
          // Dynamically set the URL variable
          if (doc.urlVar === 'aktaUrl') aktaUrl = result.webViewLink;
          else if (doc.urlVar === 'nibUrl') nibUrl = result.webViewLink;
          else if (doc.urlVar === 'sbuUrl') sbuUrl = result.webViewLink;
          else if (doc.urlVar === 'ktaUrl') ktaUrl = result.webViewLink;
          else if (doc.urlVar === 'sertifikatUrl') sertifikatUrl = result.webViewLink;
          else if (doc.urlVar === 'kontrakUrl') kontrakUrl = result.webViewLink;
          else if (doc.urlVar === 'cekUrl') cekUrl = result.webViewLink;
          else if (doc.urlVar === 'bpjsUrl') bpjsUrl = result.webViewLink;
          
          console.log(`✅ Google Drive ${doc.label} updated:`, result.webViewLink);
        } catch (docError) {
          console.error(`❌ Google Drive ${doc.label} upload failed:`, docError.message);
        }
      }
    }

    // Clean up temporary files
    const filesToCleanup = [logoFile, kopFile, companyProfileFile, aktaFile, nibFile, sbuFile, ktaFile, sertifikatFile, kontrakFile, cekFile, bpjsFile].filter(Boolean);
    for (const file of filesToCleanup) {
      if (file?.path) {
        try {
          const fs = await import('fs/promises');
          await fs.unlink(file.path);
        } catch (e) { /* ignore */ }
      }
    }

    // 4. Update Data in Sheets
    const updateData = {
      nama_perusahaan,
      no_telp,
      email,
      tahun_berdiri,
      status,
      alamat: req.body.alamat,
      // Only include URLs if they changed (though putting them all is safe)
      logo_cloud: logoCloudUrl,
      logo_perusahaan: logoDriveUrl,
      kop_perusahaan: kopDriveUrl,
      profil_perusahaan_url: companyProfileUrl,
      akta_perusahaan_url: aktaUrl,
      nib_url: nibUrl,
      sbu_url: sbuUrl,
      kta_url: ktaUrl,
      sertifikat_standar_url: sertifikatUrl,
      kontrak_url: kontrakUrl,
      cek_url: cekUrl,
      url_bpjs: bpjsUrl
    };

    console.log('💾 Saving updates to database...');
    console.log('📊 Update data:', JSON.stringify(updateData, null, 2));
    
    const result = await googleSheetsService.updateProfilPerusahaan(id, updateData);

    console.log('✅ Google Sheets updated successfully');
    
    res.json({
      success: true,
      message: 'Company profile updated successfully',
      data: result,
    });

  } catch (error) {
    console.error('Error in updateCompany:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update company profile',
      data: null,
    });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️  DELETE /api/companies/${id}`);

    const result = await googleSheetsService.deleteProfilPerusahaan(id);

    res.json({
      success: true,
      message: 'Company profile deleted successfully',
      data: result,
    });
  } catch (error) {
    console.error('❌ Error in deleteCompany:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete company profile',
      data: null,
    });
  }
};

/**
 * Proxy endpoint to serve company kop image from Google Drive
 * GET /api/companies/:id/kop
 */
export const getCompanyKop = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🖼️  GET /api/companies/${id}/kop - Fetching kop image`);

    // Get company data to extract kop URL
    const company = await googleSheetsService.getProfilPerusahaanById(id);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: `Company with ID ${id} not found`,
      });
    }

    if (!company.kop_perusahaan) {
      return res.status(404).json({
        success: false,
        message: 'Company kop not available',
      });
    }

    // Extract file ID from Google Drive URL
    const fileId = oauth2GoogleService.extractFileIdFromUrl(company.kop_perusahaan);
    
    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid kop URL format',
      });
    }

    console.log(`  📥 Downloading kop from Google Drive (ID: ${fileId})`);

    // Download file content from Google Drive using OAuth
    const fileBuffer = await oauth2GoogleService.downloadFile(fileId);

    // Set CORS headers to allow frontend access
    res.set({
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
      'Cross-Origin-Resource-Policy': 'cross-origin', // Allow cross-origin image loading
      'Content-Type': 'image/png', // Adjust based on actual file type
      'Content-Length': fileBuffer.length,
      'Cache-Control': 'public, max-age=86400', // Cache for 1 day
    });

    console.log(`  ✅ Kop image served successfully (${fileBuffer.length} bytes)`);
    res.send(fileBuffer);
  } catch (error) {
    console.error('❌ Error in getCompanyKop:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get company kop',
    });
  }
};

/**
 * AI Scan Company Profile PDF to extract contact information
 * POST /api/companies/:id/scan-profile
 */
export const scanCompanyProfile = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔍 POST /api/companies/${id}/scan-profile - AI Scanning PDF`);

    // Get PDF file (either uploaded or from URL)
    const pdfFile = req.file;
    const pdfUrl = req.body.pdfUrl;

    if (!pdfFile && !pdfUrl) {
      return res.status(400).json({
        success: false,
        message: 'Please provide PDF file or PDF URL',
      });
    }

    let pdfBuffer;

    // If PDF file was uploaded
    if (pdfFile) {
      const fs = await import('fs/promises');
      pdfBuffer = await fs.readFile(pdfFile.path);
      
      // Clean up temp file
      try {
        await fs.unlink(pdfFile.path);
      } catch (e) { /* ignore */ }
    } 
    // If PDF URL provided (existing file in Drive)
    else if (pdfUrl) {
      const fileId = oauth2GoogleService.extractFileIdFromUrl(pdfUrl);
      if (!fileId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid PDF URL format',
        });
      }
      pdfBuffer = await oauth2GoogleService.downloadFile(fileId);
    }

    // Convert PDF buffer to base64 for Gemini API
    const base64PDF = pdfBuffer.toString('base64');

    // Call Gemini API to extract contact information
    const { GoogleGenerativeAI } = await import('@google/generative-ai');
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const prompt = `
Analyze this company profile PDF and extract the following information in JSON format:
{
  "email": "company email address",
  "phone": "company phone number",
  "address": "company full address"
}

Only return the JSON object, no additional text. If any field is not found, use empty string "".
`;

    const result = await model.generateContent([
      {
        inlineData: {
          mimeType: 'application/pdf',
          data: base64PDF,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();
    
    console.log('🤖 Gemini Response:', text);

    // Parse JSON response
    let extractedData;
    try {
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      extractedData = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('❌ Failed to parse Gemini response:', parseError);
      return res.status(500).json({
        success: false,
        message: 'Failed to parse AI response',
        rawResponse: text,
      });
    }

    console.log('✅ Extracted data:', extractedData);

    res.json({
      success: true,
      message: 'Company profile scanned successfully',
      data: extractedData,
    });

  } catch (error) {
    console.error('❌ Error in scanCompanyProfile:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to scan company profile',
    });
  }
};
