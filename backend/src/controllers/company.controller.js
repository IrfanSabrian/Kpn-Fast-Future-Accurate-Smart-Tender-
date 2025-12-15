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

export const addCompany = async (req, res) => {
  try {
    console.log('📝 Adding new company...');
    
    // Parse data from form-data (sent from frontend)
    const { nama_perusahaan, no_telp, email, tahun_berdiri, status } = req.body;
    const logoFile = req.file; // Multer middleware akan inject ini

    console.log('📄 Request data:', { nama_perusahaan, no_telp, email, tahun_berdiri, status });
    console.log('📷 Logo file:', logoFile ? `${logoFile.originalname} (${logoFile.size} bytes)` : 'No logo');

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
        console.log('📂 Uploading to Google Drive...');
        const driveResult = await uploadLogoToDrive(logoFile, nama_perusahaan, folderNumber);
        logoDriveUrl = driveResult.webViewLink;
        console.log('✅ Google Drive upload success:', logoDriveUrl);
      } catch (driveError) {
        console.error('❌ Google Drive upload failed:', driveError.message);
        console.error('   Stack:', driveError.stack);
        // Continue without drive URL
      }

      // Clean up temporary file after BOTH uploads complete
      if (logoFile && logoFile.path) {
        try {
          const fs = await import('fs/promises');
          await fs.unlink(logoFile.path);
          console.log('🗑️  Temporary file deleted:', logoFile.path);
        } catch (cleanupError) {
          console.warn('⚠️  Could not delete temporary file:', cleanupError.message);
        }
      }
    }

    console.log('📊 Upload Summary:');
    console.log('   Cloudinary URL:', logoCloudUrl || 'NOT UPLOADED');
    console.log('   Google Drive URL:', logoDriveUrl || 'NOT UPLOADED');

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

export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    const result = await googleSheetsService.updateProfilPerusahaan(id, data);

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
