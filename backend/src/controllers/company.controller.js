/**
 * Company Profile Controller
 *
 * Handles HTTP requests untuk company profile management (multiple companies support)
 */

import { google } from "googleapis";
import googleSheetsService from "../services/googleSheets.service.js";
import cloudinaryService from "../services/cloudinary.service.js";
import oauth2GoogleService from "../services/oauth2Google.service.js";

export const getAllCompanies = async (req, res) => {
  try {
    const companies = await googleSheetsService.getAllProfilPerusahaan();

    // Return only summary fields for list view (performance optimization)
    const summary = companies.map((company) => ({
      id_perusahaan: company.id_perusahaan,
      nama_perusahaan: company.nama_perusahaan,
      no_telp: company.no_telp,
      email: company.email,
      tahun_berdiri: company.tahun_berdiri,
      status: company.status,
      logo_cloud: company.logo_cloud,
      logo_perusahaan: company.logo_perusahaan,
    }));

    res.json(summary);
  } catch (error) {
    console.error("Error in getAllCompanies:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get company profiles",
      error: error.stack,
    });
  }
};

// ========================================
// COMPANY OVERVIEW - Main Profile Only
// ========================================
export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    console.log("🔍 GET /api/companies/" + id + " (Overview Only)");

    const company = await googleSheetsService.getProfilPerusahaanById(id);

    if (!company) {
      return res.status(404).json({
        success: false,
        message: `Company with ID ${id} not found`,
      });
    }

    // Get document status/counts for UI indicators
    const documentCounts =
      await googleSheetsService.getCompanyDocumentCounts(id);

    // Return main company profile with document status
    res.json({ ...company, documentCounts });
  } catch (error) {
    console.error("Error in getCompanyById:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get company profile",
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
    const aktaData = await googleSheetsService.getSheetData("db_akta");
    const filtered = aktaData.filter((item) => item.id_perusahaan === id);
    res.json(filtered);
  } catch (error) {
    console.error("Error in getCompanyAkta:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/companies/:id/pejabat
export const getCompanyPejabat = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch pejabat and personel data in parallel
    const [pejabatData, personelData] = await Promise.all([
      googleSheetsService.getSheetData("db_pejabat"),
      googleSheetsService.getAllPersonil(),
    ]);

    // Filter pejabat for this company and join with personel data
    const filtered = pejabatData
      .filter((item) => item.id_perusahaan === id)
      .map((pejabat) => {
        // Find matching personel by id_personel
        const personel = personelData.find(
          (p) => p.id_personel === pejabat.id_personel,
        );

        return {
          ...pejabat,
          // Add only nama_lengkap from personel data
          nama_lengkap:
            personel?.nama_lengkap || pejabat.id_personel || "Unknown",
        };
      });

    res.json(filtered);
  } catch (error) {
    console.error("Error in getCompanyPejabat:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/companies/:id/nib (includes KBLI data)
export const getCompanyNib = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch NIB data
    const nibData = await googleSheetsService.getSheetData("db_nib");

    // Try to fetch KBLI Master data (graceful fallback if not available)
    let masterKbliData = [];
    try {
      masterKbliData = await googleSheetsService.getAllKBLI();
    } catch (kbliError) {
      console.warn("⚠️ KBLI master data not available:", kbliError.message);
      console.warn("   Continuing without KBLI classifications...");
    }

    // Filter NIB for this company
    const filteredNib = nibData.filter((item) => item.id_perusahaan === id);

    // Extract KBLI codes from NIB data (string comma separated)
    let enrichedKbli = [];
    const kbliCodesSet = new Set();

    filteredNib.forEach((nib) => {
      // Robust key checking
      const rawCodes =
        nib.kode_kbli || nib["Kode KBLI"] || nib["KBLI"] || nib["kbli"];

      if (rawCodes) {
        // Split by comma and trim
        const codes = rawCodes
          .split(",")
          .map((c) => c.trim())
          .filter((c) => c); // Remove empty strings
        codes.forEach((code) => kbliCodesSet.add(code));
      }
    });

    // Enrich KBLI data with Master Data (if available)
    enrichedKbli = Array.from(kbliCodesSet).map((code) => {
      const strCode = String(code).trim();

      // Note: KBLI master data uses 'kode_kbli' field (not 'kode_klbi')
      let master = masterKbliData.find(
        (m) =>
          String(m.kode_kbli).trim() == strCode ||
          String(m.kode_klbi).trim() == strCode,
      );

      // Fix: If not found, try stripping dot suffix (e.g. "71101.B" -> "71101")
      if (!master && strCode.includes(".")) {
        const baseCode = strCode.split(".")[0];
        master = masterKbliData.find(
          (m) =>
            String(m.kode_kbli).trim() == baseCode ||
            String(m.kode_klbi).trim() == baseCode,
        );
      }

      return {
        id_perusahaan: id,
        kode_kbli: strCode,
        judul_kbli: master ? master.nama_klasifikasi : `KBLI ${strCode}`,
        nama_klasifikasi: master ? master.nama_klasifikasi : `KBLI ${strCode}`,
        id_kbli: strCode, // Use code as ID
        id_perusahaan_kbli: strCode, // Backward compatibility
      };
    });

    // Return combined response
    res.json({
      nib: filteredNib,
      kbli: enrichedKbli,
    });
  } catch (error) {
    console.error("Error in getCompanyNib:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/companies/:id/sbu
export const getCompanySbu = async (req, res) => {
  try {
    const { id } = req.params;
    const sbuData = await googleSheetsService.getSheetData("db_sbu");
    const filtered = sbuData.filter((item) => item.id_perusahaan === id);
    res.json(filtered);
  } catch (error) {
    console.error("Error in getCompanySbu:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/companies/:id/kta
export const getCompanyKta = async (req, res) => {
  try {
    const { id } = req.params;
    const ktaData = await googleSheetsService.getSheetData("db_kta");
    const filtered = ktaData.filter((item) => item.id_perusahaan === id);
    res.json(filtered);
  } catch (error) {
    console.error("Error in getCompanyKta:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/companies/:id/sertifikat
export const getCompanySertifikat = async (req, res) => {
  try {
    const { id } = req.params;
    const sertifikatData = await googleSheetsService.getSheetData(
      "db_sertifikat_standar",
    );
    const filtered = sertifikatData.filter((item) => item.id_perusahaan === id);
    res.json(filtered);
  } catch (error) {
    console.error("Error in getCompanySertifikat:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/companies/:id/pajak - Combined tax data
export const getCompanyPajak = async (req, res) => {
  try {
    const { id } = req.params;
    const [npwpData, kswpData, sptData, pkpData] = await Promise.all([
      googleSheetsService.getSheetData("db_npwp_perusahaan"),
      googleSheetsService.getSheetData("db_kswp"),
      googleSheetsService.getSheetData("db_spt"),
      googleSheetsService.getSheetData("db_pkp"),
    ]);

    res.json({
      npwp: npwpData.filter((item) => item.id_perusahaan === id),
      kswp: kswpData.filter((item) => item.id_perusahaan === id),
      spt: sptData.filter((item) => item.id_perusahaan === id),
      pkp: pkpData.filter((item) => item.id_perusahaan === id),
    });
  } catch (error) {
    console.error("Error in getCompanyPajak:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/companies/:id/pengalaman
export const getCompanyPengalaman = async (req, res) => {
  try {
    const { id } = req.params;
    const kontrakData = await googleSheetsService.getSheetData(
      "db_kontrak_pengalaman",
    );
    const filtered = kontrakData.filter((item) => item.id_perusahaan === id);
    res.json(filtered);
  } catch (error) {
    console.error("Error in getCompanyPengalaman:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Create Pengalaman Record
 * POST /api/companies/:id/pengalaman
 */
export const createPengalaman = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📝 Creating Pengalaman for company ${id}`);

    // Verify company exists
    const company = await googleSheetsService.getCompanyById(id);
    if (!company) {
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Add company ID to data
    const pengalamanData = {
      id_perusahaan: id,
      ...req.body,
    };

    // Create pengalaman record
    const result =
      await googleSheetsService.addKontrakPengalaman(pengalamanData);

    console.log(`✅ Pengalaman created with ID: ${result.id_kontrak}`);
    console.log(`📦 Result object:`, JSON.stringify(result, null, 2));

    const response = {
      success: true,
      message: "Pengalaman created successfully",
      data: result,
    };
    console.log(`📤 Sending response:`, JSON.stringify(response, null, 2));

    res.status(201).json(response);
  } catch (error) {
    console.error("Error in createPengalaman:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/companies/:id/kbli
export const getCompanyKbli = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch NIB data
    const nibData = await googleSheetsService.getSheetData("db_nib");

    // Try to fetch KBLI Master data (graceful fallback if not available)
    let masterKbliData = [];
    try {
      masterKbliData = await googleSheetsService.getAllKBLI();
    } catch (kbliError) {
      console.warn("⚠️ KBLI master data not available:", kbliError.message);
      console.warn("   Continuing without KBLI classifications...");
    }

    const companyNib = nibData.filter((item) => item.id_perusahaan === id);

    // Extract unique codes
    const kbliCodesSet = new Set();
    companyNib.forEach((nib) => {
      // Robust key checking
      const rawCodes =
        nib.kode_kbli || nib["Kode KBLI"] || nib["KBLI"] || nib["kbli"];

      if (rawCodes) {
        const codes = rawCodes
          .split(",")
          .map((c) => c.trim())
          .filter((c) => c);
        codes.forEach((code) => kbliCodesSet.add(code));
      }
    });

    // Enrich
    const enrichedKbli = Array.from(kbliCodesSet).map((code) => {
      const strCode = String(code).trim();

      // Note: KBLI master data uses 'kode_kbli' field (not 'kode_klbi')
      let master = masterKbliData.find(
        (m) =>
          String(m.kode_kbli).trim() == strCode ||
          String(m.kode_klbi).trim() == strCode,
      );

      // Fix: If not found, try stripping dot suffix (e.g. "71101.B" -> "71101")
      if (!master && strCode.includes(".")) {
        const baseCode = strCode.split(".")[0];
        master = masterKbliData.find(
          (m) =>
            String(m.kode_kbli).trim() == baseCode ||
            String(m.kode_klbi).trim() == baseCode,
        );
      }

      return {
        id_perusahaan: id,
        kode_kbli: strCode,
        judul_kbli: master ? master.nama_klasifikasi : `KBLI ${strCode}`,
        nama_klasifikasi: master ? master.nama_klasifikasi : `KBLI ${strCode}`,
        id_kbli: strCode,
        id_perusahaan_kbli: strCode, // Backward compatibility
      };
    });

    res.json(enrichedKbli);
  } catch (error) {
    console.error("Error in getCompanyKbli:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/companies/:id/cek
export const getCompanyCek = async (req, res) => {
  try {
    const { id } = req.params;
    const cekData = await googleSheetsService.getSheetData("db_cek");
    const filtered = cekData.filter((item) => item.id_perusahaan === id);
    res.json(filtered);
  } catch (error) {
    console.error("Error in getCompanyCek:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/companies/:id/bpjs
export const getCompanyBpjs = async (req, res) => {
  try {
    const { id } = req.params;
    const bpjsData = await googleSheetsService.getSheetData("db_bpjs");
    const filtered = bpjsData.filter((item) => item.id_perusahaan === id);
    res.json(filtered);
  } catch (error) {
    console.error("Error in getCompanyBpjs:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addCompany = async (req, res) => {
  try {
    console.log("📝 Adding new company...");

    // Parse data from form-data (sent from frontend)
    const { nama_perusahaan, no_telp, email, tahun_berdiri, status } = req.body;

    // Handle multiple files
    const logoFile = req.files?.logo?.[0];
    const kopFile = req.files?.kop?.[0];

    console.log("📄 Request data:", {
      nama_perusahaan,
      no_telp,
      email,
      tahun_berdiri,
      status,
    });
    console.log(
      "📷 Logo file:",
      logoFile
        ? `${logoFile.originalname} (${logoFile.size} bytes)`
        : "No logo",
    );
    console.log(
      "🖼️  Kop file:",
      kopFile ? `${kopFile.originalname} (${kopFile.size} bytes)` : "No kop",
    );

    // Validation
    if (!nama_perusahaan) {
      return res.status(400).json({
        success: false,
        message: "Company name (nama_perusahaan) is required",
        data: null,
      });
    }

    let logoCloudUrl = "";
    let logoDriveUrl = "";
    let kopDriveUrl = "";

    // If logo file is provided, upload to Cloudinary AND Google Drive
    if (logoFile) {
      console.log(
        "📤 Logo file detected, uploading to Cloudinary and Google Drive...",
      );

      // Upload to Cloudinary
      try {
        console.log("☁️  Uploading to Cloudinary...");

        // Check if Cloudinary is configured
        if (!cloudinaryService.isConfigured()) {
          console.warn("⚠️  Cloudinary not configured, skipping...");
          console.warn(
            "   Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET in .env",
          );
        } else {
          // Resolve absolute path to avoid potential issues
          const path = await import("path");
          const absolutePath = path.resolve(logoFile.path);

          const cloudinaryResult = await cloudinaryService.uploadCompanyLogo(
            absolutePath,
            nama_perusahaan,
            `Logo ${nama_perusahaan}`,
          );
          logoCloudUrl = cloudinaryResult.url;
          console.log("✅ Cloudinary upload success:", logoCloudUrl);
        }
      } catch (cloudinaryError) {
        // Determine error type for better user feedback
        const isNetworkError =
          cloudinaryError.code === "NETWORK_ERROR" ||
          cloudinaryError.code === "ENOTFOUND" ||
          cloudinaryError.message.includes("Cannot connect to Cloudinary");

        if (isNetworkError) {
          console.error("❌ Cloudinary upload failed: NETWORK ERROR");
          console.error("   Reason: Cannot reach Cloudinary servers");
          console.error("   This is likely due to:");
          console.error("   • No internet connection");
          console.error("   • DNS resolution failure");
          console.error("   • Firewall/proxy blocking api.cloudinary.com");
          console.error("   ");
          console.error("   💡 To fix:");
          console.error("   1. Check your internet connection");
          console.error(
            "   2. Try accessing https://cloudinary.com in your browser",
          );
          console.error("   3. Check firewall/antivirus settings");
          console.error("   4. Try using a VPN or different network");
          console.error("   ");
          console.warn("⚠️  Continuing with Google Drive upload only...");
        } else if (cloudinaryError.code === "CLOUDINARY_NOT_CONFIGURED") {
          console.error("❌ Cloudinary upload failed: NOT CONFIGURED");
          console.error("   Please add Cloudinary credentials to .env file");
        } else {
          console.error(
            "❌ Cloudinary upload failed:",
            cloudinaryError.message,
          );
          console.error("   Stack:", cloudinaryError.stack);
        }

        // Continue without cloudinary URL - graceful degradation
      }

      // Note: DO NOT delete temporary file yet - Google Drive upload needs it!
    }

    // Get current companies count to determine folder number
    const existingCompanies = await googleSheetsService.getAllCompanies();
    const folderNumber = String(existingCompanies.length + 1).padStart(2, "0");

    // Upload to Google Drive with folder number
    if (logoFile && !logoDriveUrl) {
      try {
        console.log("📂 Uploading logo to Google Drive...");
        const driveResult = await uploadLogoToDrive(
          logoFile,
          nama_perusahaan,
          folderNumber,
        );
        logoDriveUrl = driveResult.webViewLink;
        console.log("✅ Google Drive logo upload success:", logoDriveUrl);
      } catch (driveError) {
        console.error(
          "❌ Google Drive logo upload failed:",
          driveError.message,
        );
        console.error("   Stack:", driveError.stack);
        // Continue without drive URL
      }
    }

    // Upload Kop to Google Drive (NO Cloudinary)
    if (kopFile) {
      try {
        console.log("📂 Uploading kop to Google Drive...");
        const kopResult = await uploadKopToDrive(
          kopFile,
          nama_perusahaan,
          folderNumber,
        );
        kopDriveUrl = kopResult.webViewLink;
        console.log("✅ Google Drive kop upload success:", kopDriveUrl);
      } catch (kopError) {
        console.error("❌ Google Drive kop upload failed:", kopError.message);
        console.error("   Stack:", kopError.stack);
        // Continue without kop URL
      }
    }

    // Clean up temporary files after ALL uploads complete
    const filesToCleanup = [logoFile, kopFile].filter(Boolean);
    for (const file of filesToCleanup) {
      if (file?.path) {
        try {
          const fs = await import("fs/promises");
          await fs.unlink(file.path);
          console.log("🗑️  Temporary file deleted:", file.path);
        } catch (cleanupError) {
          console.warn(
            "⚠️  Could not delete temporary file:",
            cleanupError.message,
          );
        }
      }
    }

    console.log("📊 Upload Summary:");
    console.log("   Logo Cloudinary:", logoCloudUrl || "NOT UPLOADED");
    console.log("   Logo Drive:", logoDriveUrl || "NOT UPLOADED");
    console.log("   Kop Drive:", kopDriveUrl || "NOT UPLOADED");

    // Get current date and time for tanggal_input
    const now = new Date();
    const tanggalInput = now.toISOString().slice(0, 19).replace("T", " ");

    // Get author from OAuth2 Google Service (logged in user)
    let author = "system";
    try {
      const userInfo = await oauth2GoogleService.getUserInfo();
      author = userInfo.name || userInfo.email || "system";
    } catch (error) {
      console.warn("⚠️  Could not get user info for author:", error.message);
    }

    // Save company profile to Google Sheets
    const companyData = {
      nama_perusahaan,
      no_telp: no_telp || "",
      email: email || "",
      tahun_berdiri: tahun_berdiri || "",
      status: status || "Pusat",
      logo_perusahaan: logoDriveUrl,
      logo_cloud: logoCloudUrl,
      kop_perusahaan: kopDriveUrl,
      tanggal_input: tanggalInput,
      author: author,
    };

    console.log("💾 Saving to database:", companyData);

    const result = await googleSheetsService.addProfilPerusahaan(companyData);

    console.log("✅ Company added successfully:", result.data);

    res.status(201).json({
      success: true,
      message: "Company profile added successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("❌ Error in addCompany:", error);
    console.error("   Stack:", error.stack);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add company profile",
      data: null,
    });
  }
};

/**
 * Helper function to get file extension from mimetype
 */
function getExtensionFromMimetype(mimetype) {
  const mimetypeMap = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/jpg": ".jpg",
    "image/gif": ".gif",
    "image/webp": ".webp",
    "image/svg+xml": ".svg",
  };
  return mimetypeMap[mimetype] || ".png"; // Default to .png
}

/**
 * Helper function to upload logo to Google Drive
 * Path: {GOOGLE_DRIVE_PERUSAHAAN_FOLDER_ID}/[folderNumber. nama_perusahaan]/[index].0 Logo & Kop/Logo [nama_perusahaan]
 * @param {Object} file - Multer file object
 * @param {string} namaPerusahaan - Company name
 * @param {string} folderNumber - Folder number (e.g., '01', '02')
 */
async function uploadLogoToDrive(file, namaPerusahaan, folderNumber) {
  const basePerusahaanFolderId = process.env.GOOGLE_DRIVE_PERUSAHAAN_FOLDER_ID;

  if (!basePerusahaanFolderId) {
    throw new Error("GOOGLE_DRIVE_PERUSAHAAN_FOLDER_ID not configured in .env");
  }

  // Folder structure: [folderNumber. nama_perusahaan]/[companyIndex].0 Logo & Kop/Logo [nama_perusahaan].ext
  // Example: 01. CV. VERUS CONSULTANT ENGINEERING/1.0 Logo & Kop/Logo CV. VERUS....png
  const companyIndex = parseInt(folderNumber, 10); // "01" -> 1
  const companyFolderName = `${folderNumber}. ${namaPerusahaan}`;
  const folderPath = [companyFolderName, `${companyIndex}.0 Logo & Kop`];

  // Get file extension from original filename or mimetype
  const path = await import("path");
  const fileExtension =
    path.extname(file.originalname) || getExtensionFromMimetype(file.mimetype);
  const fileName = `Logo ${namaPerusahaan}${fileExtension}`;

  // Read file as buffer
  const fs = await import("fs/promises");
  const fileBuffer = await fs.readFile(file.path);

  // Upload using oauth2GoogleService
  const result = await oauth2GoogleService.uploadPdfFile(
    fileBuffer,
    fileName,
    file.mimetype,
    folderPath,
    basePerusahaanFolderId,
  );

  // NOTE: File cleanup is handled by the controller after all uploads complete
  // Don't delete here because we're doing parallel uploads

  return result;
}

/**
 * Helper function to upload kop to Google Drive
 * Path: {GOOGLE_DRIVE_PERUSAHAAN_FOLDER_ID}/[folderNumber. nama_perusahaan]/[index].0 Logo & Kop/Kop [nama_perusahaan]
 * @param {Object} file - Multer file object
 * @param {string} namaPerusahaan - Company name
 * @param {string} folderNumber - Folder number (e.g., '01', '02')
 */
async function uploadKopToDrive(file, namaPerusahaan, folderNumber) {
  const basePerusahaanFolderId = process.env.GOOGLE_DRIVE_PERUSAHAAN_FOLDER_ID;

  if (!basePerusahaanFolderId) {
    throw new Error("GOOGLE_DRIVE_PERUSAHAAN_FOLDER_ID not configured in .env");
  }

  // Folder structure: [folderNumber. namaPerusahaan]/[companyIndex].0 Logo & Kop/Kop [nama_perusahaan].ext
  // Uses dynamic company index for subfolder
  const companyIndex = parseInt(folderNumber, 10); // "01" -> 1
  const companyFolderName = `${folderNumber}. ${namaPerusahaan}`;
  const folderPath = [companyFolderName, `${companyIndex}.0 Logo & Kop`];

  // Get file extension from original filename or mimetype
  const path = await import("path");
  const fileExtension =
    path.extname(file.originalname) || getExtensionFromMimetype(file.mimetype);
  const fileName = `Kop ${namaPerusahaan}${fileExtension}`;

  // Read file as buffer
  const fs = await import("fs/promises");
  const fileBuffer = await fs.readFile(file.path);

  // Upload using oauth2GoogleService
  const result = await oauth2GoogleService.uploadPdfFile(
    fileBuffer,
    fileName,
    file.mimetype,
    folderPath,
    basePerusahaanFolderId,
  );

  // NOTE: File cleanup is handled by the controller after all uploads complete
  return result;
}

/**
 * Helper function to upload company profile PDF to Google Drive
 * Path: {GOOGLE_DRIVE_PERUSAHAAN_FOLDER_ID}/[folderNumber. nama_perusahaan]/[index].1 Profil Perusahaan/Profil Perusahaan [nama_perusahaan].pdf
 * @param {Object} file - Multer file object
 * @param {string} namaPerusahaan - Company name
 * @param {string} folderNumber - Folder number (e.g., '01', '02')
 */
async function uploadCompanyProfileToDrive(file, namaPerusahaan, folderNumber) {
  const basePerusahaanFolderId = process.env.GOOGLE_DRIVE_PERUSAHAAN_FOLDER_ID;

  if (!basePerusahaanFolderId) {
    throw new Error("GOOGLE_DRIVE_PERUSAHAAN_FOLDER_ID not configured in .env");
  }

  // Folder structure: [folderNumber. namaPerusahaan]/[companyIndex].1 Profil Perusahaan/Profil Perusahaan [nama_perusahaan].pdf
  const companyIndex = parseInt(folderNumber, 10); // "01" -> 1
  const companyFolderName = `${folderNumber}. ${namaPerusahaan}`;
  const folderPath = [companyFolderName, `${companyIndex}.1 Profil Perusahaan`];

  const fileName = `Profil Perusahaan ${namaPerusahaan}.pdf`;

  // Read file as buffer
  const fs = await import("fs/promises");
  const fileBuffer = await fs.readFile(file.path);

  // Upload using oauth2GoogleService (supports PDF)
  const result = await oauth2GoogleService.uploadPdfFile(
    fileBuffer,
    fileName,
    "application/pdf",
    folderPath,
    basePerusahaanFolderId,
  );

  // NOTE: File cleanup is handled by the controller after all uploads complete
  return result;
}

/**
 * Generic helper function to upload company document to Google Drive
 * Handles: Akta, NIB, SBU, KTA, Sertifikat, Pajak (NEW), Kontrak (Pengalaman), Cek
 */
async function uploadDocumentToDrive(
  file,
  namaPerusahaan,
  folderNumber,
  documentType,
) {
  const basePerusahaanFolderId = process.env.GOOGLE_DRIVE_PERUSAHAAN_FOLDER_ID;

  if (!basePerusahaanFolderId) {
    throw new Error("GOOGLE_DRIVE_PERUSAHAAN_FOLDER_ID not configured in .env");
  }

  const companyIndex = parseInt(folderNumber, 10); // "01" -> 1, "02" -> 2

  // Document configuration map
  const docConfig = {
    akta: { index: "2", name: "Akta Perusahaan" },
    nib: { index: "3", name: "Nomor Induk Berusaha" },
    sbu: { index: "4", name: "Sertifikat Badan Usaha" },
    kta: { index: "5", name: "Kartu Tanda Anggota" },
    sertifikat: { index: "6", name: "Sertifikat Standar" },
    // Index 7: Data Perpajakan (Combined folder for NPWP, SKT, SPPKP, SPT)
    npwp: { index: "7", name: "Data Perpajakan", filePrefix: "NPWP" },
    spt: { index: "7", name: "Data Perpajakan", filePrefix: "SPT Tahunan" },
    pkp: { index: "7", name: "Data Perpajakan", filePrefix: "PKP" },
    kswp: { index: "7", name: "Data Perpajakan", filePrefix: "KSWP" },
    pajak: { index: "7", name: "Data Perpajakan" },
    kontrak: { index: "8", name: "Kontrak Pengalaman" },
    cek: { index: "9", name: "Surat Referensi Bank" },
    bpjs: { index: "10", name: "BPJS" },
  };

  const config = docConfig[documentType];
  if (!config) {
    throw new Error(`Unknown document type: ${documentType}`);
  }

  // Folder structure: [folderNumber. namaPerusahaan]/[companyIndex].[index] [name]/[fileName]
  const companyFolderName = `${folderNumber}. ${namaPerusahaan}`;
  const subfolderName = `${companyIndex}.${config.index} ${config.name}`;

  const filePrefix = config.filePrefix || config.name;
  const fileName = `${filePrefix} ${namaPerusahaan}.pdf`;
  const folderPath = [companyFolderName, subfolderName];

  // Read file as buffer
  const fs = await import("fs/promises");
  const fileBuffer = await fs.readFile(file.path);

  // Upload using oauth2GoogleService
  const result = await oauth2GoogleService.uploadPdfFile(
    fileBuffer,
    fileName,
    "application/pdf",
    folderPath,
    basePerusahaanFolderId,
  );

  return {
    ...result,
    meta: {
      folderPath: folderPath.join("/"),
      fileName,
      fullPath: `${folderPath.join("/")}/${fileName}`,
    },
  };
}

/**
 * Upload Pengalaman document (Daftar or Kontrak) to Google Drive
 * Uses custom naming: "{type} - {nama_pekerjaan} - {nama_perusahaan}.pdf"
 * Both go to the same folder: x.8 Kontrak Pengalaman
 *
 * @param {Object} file - Multer file object
 * @param {string} namaPerusahaan - Company name
 * @param {string} folderNumber - Company folder number (e.g., "01")
 * @param {string} type - "daftar" or "kontrak"
 * @param {string} namaPekerjaan - Job/project name for the file
 */
async function uploadPengalamanDocumentToDrive(
  file,
  namaPerusahaan,
  folderNumber,
  type,
  namaKegiatan,
) {
  const basePerusahaanFolderId = process.env.GOOGLE_DRIVE_PERUSAHAAN_FOLDER_ID;

  if (!basePerusahaanFolderId) {
    throw new Error("GOOGLE_DRIVE_PERUSAHAAN_FOLDER_ID not configured in .env");
  }

  const companyIndex = parseInt(folderNumber, 10);

  // Both daftar and kontrak go to the same folder
  const companyFolderName = `${folderNumber}. ${namaPerusahaan}`;
  const subfolderName = `${companyIndex}.8 Kontrak Pengalaman`;

  // Custom file naming based on type
  const typeLabel =
    type === "daftar" ? "Daftar Pengalaman" : "Kontrak Pengalaman";

  const sanitizedJob = (namaKegiatan || "")
    .replace(/[\/\\?%*:|"<>]/g, "-")
    .trim();

  const fileName = `${typeLabel} - ${sanitizedJob} - ${namaPerusahaan}.pdf`;
  const folderPath = [companyFolderName, subfolderName];

  // Read file as buffer
  const fs = await import("fs/promises");
  const fileBuffer = await fs.readFile(file.path);

  // Upload using oauth2GoogleService
  const result = await oauth2GoogleService.uploadPdfFile(
    fileBuffer,
    fileName,
    "application/pdf",
    folderPath,
    basePerusahaanFolderId,
  );

  return {
    ...result,
    meta: {
      folderPath: folderPath.join("/"),
      fileName,
      fullPath: `${folderPath.join("/")}/${fileName}`,
      type,
    },
  };
}

export const updateCompany = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🔄 UPDATE /api/companies/${id}`);

    // Parse data
    const { nama_perusahaan, no_telp, email, tahun_berdiri, status } = req.body;

    const uploadDetails = []; // Track upload details for frontend feedback

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
    const npwpFile = req.files?.npwp_perusahaan?.[0];
    const sptFile = req.files?.spt_perusahaan?.[0];
    const pkpFile = req.files?.sppkp_perusahaan?.[0];
    const kswpFile = req.files?.skt_perusahaan?.[0];

    console.log("📄 Update payload:", {
      nama_perusahaan,
      no_telp,
      email,
      year: tahun_berdiri,
      status,
    });
    console.log("📷 New logo:", logoFile ? "Yes" : "No");
    console.log("🖼️  New kop:", kopFile ? "Yes" : "No");
    console.log(
      "📋 New company profile PDF:",
      companyProfileFile ? "Yes" : "No",
    );
    console.log("📜 New documents:", {
      akta: aktaFile ? "Yes" : "No",
      nib: nibFile ? "Yes" : "No",
      sbu: sbuFile ? "Yes" : "No",
      kta: ktaFile ? "Yes" : "No",
      sertifikat: sertifikatFile ? "Yes" : "No",
      kontrak: kontrakFile ? "Yes" : "No",
      cek: cekFile ? "Yes" : "No",
      bpjs: bpjsFile ? "Yes" : "No",
      npwp: npwpFile ? "Yes" : "No",
      spt: sptFile ? "Yes" : "No",
      pkp: pkpFile ? "Yes" : "No",
      kswp: kswpFile ? "Yes" : "No",
    });

    // 1. Get all companies to find folder number (needed for Drive upload)
    // We need folder number to upload to correct Drive folder: "[No]. [Nama Perusahaan]"
    const allCompanies = await googleSheetsService.getAllProfilPerusahaan();
    const companyIndex = allCompanies.findIndex((c) => c.id_perusahaan === id);

    if (companyIndex === -1) {
      return res.status(404).json({
        success: false,
        message: `Company with ID ${id} not found`,
      });
    }

    const existingCompany = allCompanies[companyIndex];
    // Folder number is index + 1 (padded '01', '02', etc.)
    const folderNumber = String(companyIndex + 1).padStart(2, "0");

    console.log(
      `📂 Company Folder: ${folderNumber}. ${existingCompany.nama_perusahaan}`,
    );

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
    let npwpUrl = existingCompany.npwp_perusahaan_url;
    let sptUrl = existingCompany.spt_url;
    let pkpUrl = existingCompany.url_pkp;
    let kswpUrl = existingCompany.kswp_url;

    // 2. Upload New Logo if provided
    if (logoFile) {
      console.log("📤 Processing new Logo...");

      // Upload to Cloudinary
      try {
        if (cloudinaryService.isConfigured()) {
          const cloudinaryResult = await cloudinaryService.uploadCompanyLogo(
            logoFile.path,
            nama_perusahaan || existingCompany.nama_perusahaan,
            `Logo ${nama_perusahaan || existingCompany.nama_perusahaan}`,
          );
          logoCloudUrl = cloudinaryResult.url;
          console.log("✅ Cloudinary logo updated:", logoCloudUrl);
        }
      } catch (cloudinaryError) {
        console.error("❌ Cloudinary upload failed:", cloudinaryError.message);
      }

      // Upload to Drive
      try {
        const driveResult = await uploadLogoToDrive(
          logoFile,
          nama_perusahaan || existingCompany.nama_perusahaan,
          folderNumber,
        );
        logoDriveUrl = driveResult.webViewLink;
        console.log("✅ Google Drive logo updated:", logoDriveUrl);
      } catch (driveError) {
        console.error(
          "❌ Google Drive logo upload failed:",
          driveError.message,
        );
      }
    }

    // 3. Upload New Kop if provided
    if (kopFile) {
      console.log("📤 Processing new Kop...");
      try {
        const kopResult = await uploadKopToDrive(
          kopFile,
          nama_perusahaan || existingCompany.nama_perusahaan,
          folderNumber,
        );
        kopDriveUrl = kopResult.webViewLink;
        console.log("✅ Google Drive kop updated:", kopDriveUrl);
      } catch (kopError) {
        console.error("❌ Google Drive kop upload failed:", kopError.message);
      }
    }

    // 4. Upload New Company Profile PDF if provided
    if (companyProfileFile) {
      console.log("📤 Processing new Company Profile PDF...");
      try {
        const profileResult = await uploadCompanyProfileToDrive(
          companyProfileFile,
          nama_perusahaan || existingCompany.nama_perusahaan,
          folderNumber,
        );
        companyProfileUrl = profileResult.webViewLink;
        console.log(
          "✅ Google Drive company profile updated:",
          companyProfileUrl,
        );
      } catch (profileError) {
        console.error(
          "❌ Google Drive company profile upload failed:",
          profileError.message,
        );
      }
    }

    // 5. Upload All Other Documents if provided
    const documentTypes = [
      { file: aktaFile, type: "akta", urlVar: "aktaUrl", label: "Akta" },
      { file: nibFile, type: "nib", urlVar: "nibUrl", label: "NIB" },
      { file: sbuFile, type: "sbu", urlVar: "sbuUrl", label: "SBU" },
      { file: ktaFile, type: "kta", urlVar: "ktaUrl", label: "KTA" },
      {
        file: sertifikatFile,
        type: "sertifikat",
        urlVar: "sertifikatUrl",
        label: "Sertifikat",
      },
      {
        file: kontrakFile,
        type: "kontrak",
        urlVar: "kontrakUrl",
        label: "Kontrak",
      },
      { file: cekFile, type: "cek", urlVar: "cekUrl", label: "Cek" },
      { file: bpjsFile, type: "bpjs", urlVar: "bpjsUrl", label: "BPJS" },
      { file: npwpFile, type: "npwp", urlVar: "npwpUrl", label: "NPWP" },
      { file: sptFile, type: "spt", urlVar: "sptUrl", label: "SPT" },
      { file: pkpFile, type: "pkp", urlVar: "pkpUrl", label: "PKP" },
      { file: kswpFile, type: "kswp", urlVar: "kswpUrl", label: "KSWP" },
    ];

    for (const doc of documentTypes) {
      if (doc.file) {
        console.log(`📤 Processing new ${doc.label} document...`);
        try {
          const result = await uploadDocumentToDrive(
            doc.file,
            nama_perusahaan || existingCompany.nama_perusahaan,
            folderNumber,
            doc.type,
          );
          const pdfUrl = result.webViewLink;

          // Capture upload metadata
          if (result.meta) {
            uploadDetails.push({
              type: doc.type,
              label: doc.label,
              folderPath: result.meta.folderPath,
              fileName: result.meta.fileName,
              fullPath: result.meta.fullPath,
            });
          }

          // Dynamically set the URL variable
          if (doc.urlVar === "aktaUrl") aktaUrl = pdfUrl;
          else if (doc.urlVar === "nibUrl") nibUrl = pdfUrl;
          else if (doc.urlVar === "sbuUrl") sbuUrl = pdfUrl;
          else if (doc.urlVar === "ktaUrl") ktaUrl = pdfUrl;
          else if (doc.urlVar === "sertifikatUrl") sertifikatUrl = pdfUrl;
          else if (doc.urlVar === "kontrakUrl") kontrakUrl = pdfUrl;
          else if (doc.urlVar === "cekUrl") cekUrl = pdfUrl;
          else if (doc.urlVar === "bpjsUrl") bpjsUrl = pdfUrl;
          else if (doc.urlVar === "npwpUrl") npwpUrl = pdfUrl;
          else if (doc.urlVar === "sptUrl") sptUrl = pdfUrl;
          else if (doc.urlVar === "pkpUrl") pkpUrl = pdfUrl;
          else if (doc.urlVar === "kswpUrl") kswpUrl = pdfUrl;

          console.log(`✅ Google Drive ${doc.label} updated:`, pdfUrl);

          // 📊 NOW UPDATE/CREATE RECORD IN SPREADSHEET
          try {
            // Get current timestamp and author
            const now = new Date();
            const tanggalInput = now
              .toISOString()
              .slice(0, 19)
              .replace("T", " ");
            let author = "system";
            try {
              const userInfo = await oauth2GoogleService.getUserInfo();
              author = userInfo.name || userInfo.email || "system";
            } catch (e) {
              console.warn("Could not get user info:", e.message);
            }

            // Handle each document type differently
            if (doc.type === "akta") {
              // Check if company has any akta records
              const aktaData =
                await googleSheetsService.getSheetData("db_akta");
              const existingAkta = aktaData.filter(
                (item) => item.id_perusahaan === id,
              );

              // Define headers for db_akta - MUST match exact column order in spreadsheet!
              // Based on PDF_UPLOAD_STRUCTURE.md:
              // Kolom 1: id_akta, Kolom 2: id_perusahaan, Kolom 3-6: metadata, Kolom 7: URL, Kolom 8-9: timestamp & author
              const aktaHeaders = [
                "id_akta", // Column 1 (auto-generated, leave empty)
                "id_perusahaan", // Column 2
                "jenis_akta", // Column 3 (leave empty for now)
                "nomor_akta", // Column 4 (leave empty for now)
                "tanggal_akta", // Column 5 (leave empty for now)
                "notaris", // Column 6 (leave empty for now)
                "akta_perusahaan_url", // Column 7 (PDF URL)
                "tanggal_input", // Column 8 (timestamp)
                "author", // Column 9 (user who uploaded)
              ];

              if (existingAkta.length === 0) {
                // Generate new ID for akta
                const totalAktaCount = aktaData.length;
                const newAktaId = `AKTA${String(totalAktaCount + 1).padStart(
                  3,
                  "0",
                )}`;

                // Create new akta record
                console.log("📝 Creating new Akta record in spreadsheet...");
                console.log("   Generated ID:", newAktaId);

                await googleSheetsService.addSheetData("db_akta", aktaHeaders, {
                  id_akta: newAktaId, // Generated ID
                  id_perusahaan: id,
                  jenis_akta: "", // Empty - user will fill later
                  nomor_akta: "", // Empty - user will fill later
                  tanggal_akta: "", // Empty - user will fill later
                  notaris: "", // Empty - user will fill later
                  akta_perusahaan_url: pdfUrl,
                  tanggal_input: tanggalInput,
                  author: author,
                });
                console.log(
                  "✅ Akta record created in spreadsheet with ID:",
                  newAktaId,
                );
              } else {
                // Update first akta record's URL
                console.log("📝 Updating existing Akta record...");
                const firstAkta = existingAkta[0];
                await googleSheetsService.updateSheetData(
                  "db_akta",
                  aktaHeaders,
                  "id_akta",
                  firstAkta.id_akta,
                  {
                    akta_perusahaan_url: pdfUrl,
                    tanggal_input: tanggalInput,
                    author: author,
                  },
                );
                console.log("✅ Akta record updated in spreadsheet");
              }
            }
            // NIB - Same pattern as Akta
            else if (doc.type === "nib") {
              try {
                console.log("🔵 Processing NIB document upload...");
                const nibData =
                  await googleSheetsService.getSheetData("db_nib");
                console.log("   Current NIB records:", nibData.length);

                const existingNib = nibData.filter(
                  (item) => item.id_perusahaan === id,
                );
                console.log(
                  "   Existing NIB for this company:",
                  existingNib.length,
                );

                // TEMPORARY: Use simplified headers - we'll adjust based on actual spreadsheet
                // Common NIB columns (Updated with status_penanaman_modal and kbli)
                const nibHeaders = [
                  "id_nib",
                  "id_perusahaan",
                  "nomor_nib",
                  "tanggal_terbit",
                  "status_penanaman_modal", // Updated
                  "skala_usaha",
                  "kbli", // Updated
                  "nib_url",
                  "tanggal_input",
                  "author",
                ];

                if (existingNib.length === 0) {
                  // Generate new ID
                  const totalNibCount = nibData.length;
                  const newNibId = `NIB${String(totalNibCount + 1).padStart(
                    3,
                    "0",
                  )}`;

                  console.log("📝 Creating new NIB record...");
                  console.log("   New ID:", newNibId);
                  console.log("   PDF URL:", pdfUrl);

                  const nibRecord = {
                    id_nib: newNibId,
                    id_perusahaan: id,
                    nomor_nib: "",
                    tanggal_terbit: "",
                    status_penanaman_modal: "", // Updated
                    skala_usaha: "",
                    kbli: "", // Updated
                    nib_url: pdfUrl,
                    tanggal_input: tanggalInput,
                    author: author,
                  };

                  console.log("   Record to insert:", nibRecord);

                  await googleSheetsService.addSheetData(
                    "db_nib",
                    nibHeaders,
                    nibRecord,
                  );
                  console.log("✅ NIB record created successfully!");
                } else {
                  console.log("📝 Updating existing NIB record...");
                  const firstNib = existingNib[0];
                  console.log("   Updating ID:", firstNib.id_nib);

                  await googleSheetsService.updateSheetData(
                    "db_nib",
                    nibHeaders,
                    "id_nib",
                    firstNib.id_nib,
                    {
                      nib_url: pdfUrl,
                      tanggal_input: tanggalInput,
                      author: author,
                    },
                  );
                  console.log("✅ NIB record updated successfully!");
                }
              } catch (nibError) {
                console.error("❌ ERROR in NIB spreadsheet operation:");
                console.error("   Message:", nibError.message);
                console.error("   Stack:", nibError.stack);
                // Don't throw - at least file is in Drive
              }
            }
            // SBU - Same pattern as Akta and NIB
            else if (doc.type === "sbu") {
              try {
                console.log("🟢 Processing SBU document upload...");
                const sbuData =
                  await googleSheetsService.getSheetData("db_sbu");
                console.log("   Current SBU records:", sbuData.length);

                const existingSbu = sbuData.filter(
                  (item) => item.id_perusahaan === id,
                );
                console.log(
                  "   Existing SBU for this company:",
                  existingSbu.length,
                );

                // Define headers for db_sbu - Match with actual spreadsheet columns
                const sbuHeaders = [
                  "id_sbu",
                  "id_perusahaan",
                  "nomor_pb_umku",
                  "jenis_usaha",
                  "asosiasi",
                  "pjbu",
                  "pjtbu",
                  "nomor_registrasi_lpjk",
                  "tanggal_terbit",
                  "masa_berlaku",
                  "kualifikasi",
                  "kode_subklasifikasi",
                  "sifat",
                  "kode_kbli",
                  "nama_pjskbu",
                  "pelaksana_sertifikasi",
                  "sbu_url",
                  "tanggal_input",
                  "author",
                ];

                if (existingSbu.length === 0) {
                  // Generate new ID
                  const totalSbuCount = sbuData.length;
                  const newSbuId = `SBU${String(totalSbuCount + 1).padStart(
                    3,
                    "0",
                  )}`;

                  console.log("📝 Creating new SBU record...");
                  console.log("   New ID:", newSbuId);
                  console.log("   PDF URL:", pdfUrl);

                  await googleSheetsService.addSheetData("db_sbu", sbuHeaders, {
                    id_sbu: newSbuId,
                    id_perusahaan: id,
                    nomor_pb_umku: "",
                    jenis_usaha: "",
                    asosiasi: "",
                    pjbu: "",
                    pjtbu: "",
                    nomor_registrasi_lpjk: "",
                    tanggal_terbit: "",
                    masa_berlaku: "",
                    kualifikasi: "",
                    kode_subklasifikasi: "",
                    sifat: "",
                    kode_kbli: "",
                    nama_pjskbu: "",
                    pelaksana_sertifikasi: "",
                    sbu_url: pdfUrl,
                    tanggal_input: tanggalInput,
                    author: author,
                  });
                  console.log(
                    "✅ SBU record created in spreadsheet with ID:",
                    newSbuId,
                  );
                } else {
                  console.log("📝 Updating existing SBU record...");
                  const firstSbu = existingSbu[0];
                  console.log("   Updating ID:", firstSbu.id_sbu);

                  await googleSheetsService.updateSheetData(
                    "db_sbu",
                    sbuHeaders,
                    "id_sbu",
                    firstSbu.id_sbu,
                    {
                      sbu_url: pdfUrl,
                      tanggal_input: tanggalInput,
                      author: author,
                    },
                  );
                  console.log("✅ SBU record updated successfully!");
                }
              } catch (sbuError) {
                console.error("❌ ERROR in SBU spreadsheet operation:");
                console.error("   Message:", sbuError.message);
                console.error("   Stack:", sbuError.stack);
                // Don't throw - at least file is in Drive
              }
            }

            // KTA Document Upload
            else if (doc.type === "kta") {
              try {
                console.log("🔵 Processing KTA document upload...");
                const ktaData =
                  await googleSheetsService.getSheetData("db_kta");
                console.log("   Current KTA records:", ktaData.length);

                const existingKta = ktaData.filter(
                  (item) => item.id_perusahaan === id,
                );
                console.log(
                  "   Existing KTA for this company:",
                  existingKta.length,
                );

                // Define headers for db_kta - Match with actual spreadsheet columns
                const ktaHeaders = [
                  "id_kta",
                  "id_perusahaan",
                  "nomor_anggota",
                  "nama_asosiasi",
                  "penanggung_jawab",
                  "jenis_usaha",
                  "status_keanggotaan",
                  "tanggal_terbit",
                  "kta_url",
                  "status",
                  "tanggal_input",
                  "author",
                ];

                if (existingKta.length === 0) {
                  // Generate new ID
                  // Generate new ID
                  const newKtaId = googleSheetsService.generateNewId(
                    ktaData,
                    "id_kta",
                    "KTA",
                  );

                  console.log("📝 Creating new KTA record...");
                  console.log("   New ID:", newKtaId);
                  console.log("   PDF URL:", pdfUrl);

                  await googleSheetsService.addSheetData("db_kta", ktaHeaders, {
                    id_kta: newKtaId,
                    id_perusahaan: id,
                    nomor_anggota: "",
                    nama_asosiasi: "",
                    penanggung_jawab: "",
                    jenis_usaha: "",
                    status_keanggotaan: "",
                    tanggal_terbit: "",
                    kta_url: pdfUrl,
                    status: "",
                    tanggal_input: tanggalInput,
                    author: author,
                  });
                  console.log("✅ KTA record created successfully!");
                } else {
                  console.log("📝 Updating existing KTA record...");
                  const firstKta = existingKta[0];
                  console.log("   Updating ID:", firstKta.id_kta);

                  await googleSheetsService.updateSheetData(
                    "db_kta",
                    ktaHeaders,
                    "id_kta",
                    firstKta.id_kta,
                    {
                      kta_url: pdfUrl,
                      tanggal_input: tanggalInput,
                      author: author,
                    },
                  );
                  console.log("✅ KTA record updated successfully!");
                }
              } catch (ktaError) {
                console.error("❌ ERROR in KTA spreadsheet operation:");
                console.error("   Message:", ktaError.message);
                console.error("   Stack:", ktaError.stack);
              }
            }

            // Sertifikat Document Upload
            else if (doc.type === "sertifikat") {
              try {
                console.log("🔵 Processing Sertifikat document upload...");
                const sertifikatData = await googleSheetsService.getSheetData(
                  "db_sertifikat_standar",
                );
                console.log(
                  "   Current Sertifikat records:",
                  sertifikatData.length,
                );

                const existingSertifikat = sertifikatData.filter(
                  (item) => item.id_perusahaan === id,
                );
                console.log(
                  "   Existing Sertifikat for this company:",
                  existingSertifikat.length,
                );

                // Define headers for db_sertifikat_standar - Match with actual spreadsheet columns
                const sertifikatHeaders = [
                  "id_sertifikat_standar",
                  "id_perusahaan",
                  "id_nib",
                  "nomor_sertifikat",
                  "kode_kbli",
                  "klasifikasi_risiko",
                  "status_pemenuhan",
                  "lembaga_verifikasi",
                  "tanggal_terbit",
                  "sertifikat_standar_url",
                  "tanggal_input",
                  "author",
                ];

                if (existingSertifikat.length === 0) {
                  // Generate new ID
                  // Generate new ID
                  const newSertifikatId = googleSheetsService.generateNewId(
                    sertifikatData,
                    "id_sertifikat_standar",
                    "SERT",
                  );

                  console.log("📝 Creating new Sertifikat record...");
                  console.log("   New ID:", newSertifikatId);
                  console.log("   PDF URL:", pdfUrl);

                  await googleSheetsService.addSheetData(
                    "db_sertifikat_standar",
                    sertifikatHeaders,
                    {
                      id_sertifikat_standar: newSertifikatId,
                      id_perusahaan: id,
                      id_nib: "",
                      nomor_sertifikat: "",
                      kode_kbli: "",
                      klasifikasi_risiko: "",
                      status_pemenuhan: "",
                      lembaga_verifikasi: "",
                      tanggal_terbit: "",
                      sertifikat_standar_url: pdfUrl,
                      tanggal_input: tanggalInput,
                      author: author,
                    },
                  );
                  console.log("✅ Sertifikat record created successfully!");
                } else {
                  console.log("📝 Updating existing Sertifikat record...");
                  const firstSertifikat = existingSertifikat[0];
                  console.log(
                    "   Updating ID:",
                    firstSertifikat.id_sertifikat_standar,
                  );

                  await googleSheetsService.updateSheetData(
                    "db_sertifikat_standar",
                    sertifikatHeaders,
                    "id_sertifikat_standar",
                    firstSertifikat.id_sertifikat_standar,
                    {
                      sertifikat_standar_url: pdfUrl,
                      tanggal_input: tanggalInput,
                      author: author,
                    },
                  );
                  console.log("✅ Sertifikat record updated successfully!");
                }
              } catch (sertifikatError) {
                console.error("❌ ERROR in Sertifikat spreadsheet operation:");
                console.error("   Message:", sertifikatError.message);
                console.error("   Stack:", sertifikatError.stack);
              }
            }

            // Kontrak Document Upload
            else if (doc.type === "kontrak") {
              try {
                console.log("🔵 Processing Kontrak document upload...");
                const kontrakData = await googleSheetsService.getSheetData(
                  "db_kontrak_pengalaman",
                );
                console.log("   Current Kontrak records:", kontrakData.length);

                const existingKontrak = kontrakData.filter(
                  (item) => item.id_perusahaan === id,
                );
                console.log(
                  "   Existing Kontrak for this company:",
                  existingKontrak.length,
                );

                // NOTE: Headers are for documentation only.
                // Actual insert is handled by googleSheetsService.addKontrakPengalaman()
                // which uses the new 19-column schema with combined fields:
                // kegiatan (combined from program+kegiatan), sub_kegiatan, pekerjaan,
                // pemberi_tugas, kontak_pemberi_tugas (combined from address fields)

                if (existingKontrak.length === 0) {
                  // Generate new ID
                  // Generate new ID
                  const newKontrakId = googleSheetsService.generateNewId(
                    kontrakData,
                    "id_kontrak",
                    "KONTR",
                  );

                  console.log("📝 Creating new Kontrak record...");
                  console.log("   New ID:", newKontrakId);
                  console.log("   PDF URL:", pdfUrl);

                  await googleSheetsService.addSheetData(
                    "db_kontrak_pengalaman",
                    kontrakHeaders,
                    {
                      id_kontrak: newKontrakId,
                      id_perusahaan: id,
                      nama_pekerjaan: "",
                      bidang_pekerjaan: "",
                      sub_bidang_pekerjaan: "",
                      lokasi: "",
                      nama_pemberi_tugas: "",
                      alamat_pemberi_tugas: "",
                      telepon_pemberi_tugas: "",
                      fax_pemberi_tugas: "",
                      kode_pos_pemberi_tugas: "",
                      nomor_kontrak: "",
                      tanggal_kontrak: "",
                      nilai_kontrak: "",
                      waktu_pelaksanaan: "",
                      tanggal_selesai_kontrak: "",
                      tanggal_ba_serah_terima: "",
                      kontrak_url: pdfUrl,
                      tanggal_input: tanggalInput,
                      author: author,
                    },
                  );
                  console.log("✅ Kontrak record created successfully!");
                } else {
                  console.log("📝 Updating existing Kontrak record...");
                  const firstKontrak = existingKontrak[0];
                  console.log("   Updating ID:", firstKontrak.id_kontrak);

                  await googleSheetsService.updateSheetData(
                    "db_kontrak_pengalaman",
                    kontrakHeaders,
                    "id_kontrak",
                    firstKontrak.id_kontrak,
                    {
                      kontrak_url: pdfUrl,
                      tanggal_input: tanggalInput,
                      author: author,
                    },
                  );
                  console.log("✅ Kontrak record updated successfully!");
                }

                // Update kontrakUrl untuk disimpan ke db_profil_perusahaan
                kontrakUrl = pdfUrl;
                console.log(
                  "📌 Kontrak URL will be saved to company profile:",
                  kontrakUrl,
                );
              } catch (kontrakError) {
                console.error("❌ ERROR in Kontrak spreadsheet operation:");
                console.error("   Message:", kontrakError.message);
                console.error("   Stack:", kontrakError.stack);
              }
            }

            // Cek Document Upload
            else if (doc.type === "cek") {
              try {
                console.log("🔵 Processing Cek document upload...");
                const cekData =
                  await googleSheetsService.getSheetData("db_cek");
                console.log("   Current Cek records:", cekData.length);

                const existingCek = cekData.filter(
                  (item) => item.id_perusahaan === id,
                );
                console.log(
                  "   Existing Cek for this company:",
                  existingCek.length,
                );

                // Define headers for db_cek - Match with actual spreadsheet columns
                const cekHeaders = [
                  "id_cek",
                  "id_perusahaan",
                  "no_rekening",
                  "nama_bank",
                  "url_cek",
                  "tanggal_input",
                  "author",
                ];

                if (existingCek.length === 0) {
                  // Generate new ID
                  // Generate new ID
                  const newCekId = googleSheetsService.generateNewId(
                    cekData,
                    "id_cek",
                    "CEK",
                  );

                  console.log("📝 Creating new Cek record...");
                  console.log("   New ID:", newCekId);
                  console.log("   PDF URL:", pdfUrl);

                  await googleSheetsService.addSheetData("db_cek", cekHeaders, {
                    id_cek: newCekId,
                    id_perusahaan: id,
                    no_rekening: "",
                    nama_bank: "",
                    url_cek: pdfUrl,
                    tanggal_input: tanggalInput,
                    author: author,
                  });
                  console.log("✅ Cek record created successfully!");
                } else {
                  console.log("📝 Updating existing Cek record...");
                  const firstCek = existingCek[0];
                  console.log("   Updating ID:", firstCek.id_cek);

                  await googleSheetsService.updateSheetData(
                    "db_cek",
                    cekHeaders,
                    "id_cek",
                    firstCek.id_cek,
                    {
                      url_cek: pdfUrl,
                      tanggal_input: tanggalInput,
                      author: author,
                    },
                  );
                  console.log("✅ Cek record updated successfully!");
                }

                // Update cekUrl untuk disimpan ke db_profil_perusahaan
                cekUrl = pdfUrl;
                console.log(
                  "📌 Cek URL will be saved to company profile:",
                  cekUrl,
                );
              } catch (cekError) {
                console.error("❌ ERROR in Cek spreadsheet operation:");
                console.error("   Message:", cekError.message);
                console.error("   Stack:", cekError.stack);
              }
            }

            // BPJS Document Upload
            else if (doc.type === "bpjs") {
              try {
                console.log("🔵 Processing BPJS document upload...");
                const bpjsData =
                  await googleSheetsService.getSheetData("db_bpjs");
                console.log("   Current BPJS records:", bpjsData.length);

                const existingBpjs = bpjsData.filter(
                  (item) => item.id_perusahaan === id,
                );
                console.log(
                  "   Existing BPJS for this company:",
                  existingBpjs.length,
                );

                // Define headers for db_bpjs - Match with actual spreadsheet columns
                const bpjsHeaders = [
                  "id_bpjs",
                  "id_perusahaan",
                  "nomor_sertifikat",
                  "nomor_pendaftaran",
                  "tanggal_ditetapkan",
                  "lokasi_ditetapkan",
                  "url_bpjs",
                  "tanggal_input",
                  "author",
                ];

                if (existingBpjs.length === 0) {
                  // Generate new ID
                  // Generate new ID
                  const newBpjsId = googleSheetsService.generateNewId(
                    bpjsData,
                    "id_bpjs",
                    "BPJS",
                  );

                  console.log("📝 Creating new BPJS record...");
                  console.log("   New ID:", newBpjsId);
                  console.log("   PDF URL:", pdfUrl);

                  await googleSheetsService.addSheetData(
                    "db_bpjs",
                    bpjsHeaders,
                    {
                      id_bpjs: newBpjsId,
                      id_perusahaan: id,
                      nomor_sertifikat: "",
                      nomor_pendaftaran: "",
                      tanggal_ditetapkan: "",
                      lokasi_ditetapkan: "",
                      url_bpjs: pdfUrl,
                      tanggal_input: tanggalInput,
                      author: author,
                    },
                  );
                  console.log("✅ BPJS record created successfully!");
                } else {
                  console.log("📝 Updating existing BPJS record...");
                  const firstBpjs = existingBpjs[0];
                  console.log("   Updating ID:", firstBpjs.id_bpjs);

                  await googleSheetsService.updateSheetData(
                    "db_bpjs",
                    bpjsHeaders,
                    "id_bpjs",
                    firstBpjs.id_bpjs,
                    {
                      url_bpjs: pdfUrl,
                      tanggal_input: tanggalInput,
                      author: author,
                    },
                  );
                  console.log("✅ BPJS record updated successfully!");
                }

                // Update bpjsUrl untuk disimpan ke db_profil_perusahaan
                bpjsUrl = pdfUrl;
                console.log(
                  "📌 BPJS URL will be saved to company profile:",
                  bpjsUrl,
                );
              } catch (bpjsError) {
                console.error("❌ ERROR in BPJS spreadsheet operation:");
                console.error("   Message:", bpjsError.message);
                console.error("   Stack:", bpjsError.stack);
              }
            }

            // NPWP Document Upload
            else if (doc.type === "npwp") {
              try {
                console.log("🔵 Processing NPWP document upload...");
                const npwpData =
                  await googleSheetsService.getSheetData("db_npwp_perusahaan");
                const existingNpwp = npwpData.filter(
                  (item) => item.id_perusahaan === id,
                );

                const npwpHeaders = [
                  "id_npwp_perusahaan",
                  "id_perusahaan",
                  "nomor_npwp",
                  "nama_wajib_pajak",
                  "alamat_npwp",
                  "kpp",
                  "tanggal_terdaftar",
                  "npwp_perusahaan_url",
                  "tanggal_input",
                  "author",
                ];

                if (existingNpwp.length === 0) {
                  const newNpwpId = `NPWP${String(npwpData.length + 1).padStart(
                    3,
                    "0",
                  )}`;
                  await googleSheetsService.addSheetData(
                    "db_npwp_perusahaan",
                    npwpHeaders,
                    {
                      id_npwp_perusahaan: newNpwpId,
                      id_perusahaan: id,
                      nomor_npwp: req.body.nomor_npwp || "",
                      nama_wajib_pajak: req.body.nama_wp || "",
                      alamat_npwp: req.body.alamat_npwp || "",
                      kpp: req.body.kpp || "",
                      tanggal_terdaftar: req.body.tanggal_terdaftar || "",
                      npwp_perusahaan_url: pdfUrl,
                      tanggal_input: tanggalInput,
                      author: author,
                    },
                  );
                  console.log("✅ NPWP record created successfully!");
                } else {
                  const firstNpwp = existingNpwp[0];

                  // Delete old PDF from Google Drive if exists
                  if (firstNpwp.npwp_perusahaan_url) {
                    try {
                      const oldFileId =
                        oauth2GoogleService.extractFileIdFromUrl(
                          firstNpwp.npwp_perusahaan_url,
                        );
                      if (oldFileId) {
                        console.log(
                          "🗑️  Deleting old NPWP file from Drive:",
                          oldFileId,
                        );
                        await oauth2GoogleService.deleteFile(oldFileId);
                        console.log("✅ Old NPWP file deleted successfully");
                      }
                    } catch (deleteError) {
                      console.warn(
                        "⚠️  Failed to delete old NPWP file:",
                        deleteError.message,
                      );
                      // Continue even if delete fails
                    }
                  }

                  await googleSheetsService.updateSheetData(
                    "db_npwp_perusahaan",
                    npwpHeaders,
                    "id_npwp_perusahaan",
                    firstNpwp.id_npwp_perusahaan,
                    {
                      nomor_npwp: req.body.nomor_npwp || firstNpwp.nomor_npwp,
                      nama_wajib_pajak:
                        req.body.nama_wp || firstNpwp.nama_wajib_pajak,
                      alamat_npwp:
                        req.body.alamat_npwp || firstNpwp.alamat_npwp,
                      kpp: req.body.kpp || firstNpwp.kpp,
                      tanggal_terdaftar:
                        req.body.tanggal_terdaftar ||
                        firstNpwp.tanggal_terdaftar,
                      npwp_perusahaan_url: pdfUrl,
                      tanggal_input: tanggalInput,
                      author: author,
                    },
                  );
                  console.log("✅ NPWP record updated successfully!");
                }
                npwpUrl = pdfUrl;
              } catch (npwpError) {
                console.error(
                  "❌ ERROR in NPWP spreadsheet operation:",
                  npwpError.message,
                );
              }
            }

            // SPT Document Upload
            else if (doc.type === "spt") {
              try {
                console.log("🔵 Processing SPT document upload...");
                const sptData =
                  await googleSheetsService.getSheetData("db_spt");
                const existingSpt = sptData.filter(
                  (item) => item.id_perusahaan === id,
                );

                const sptHeaders = [
                  "id_spt",
                  "id_perusahaan",
                  "tahun_pajak",
                  "masa_pajak",
                  "jenis_spt",
                  "pembetulan_ke",
                  "nominal",
                  "tanggal_penyampaian",
                  "nomor_tanda_terima",
                  "nama_wp",
                  "npwp",
                  "nitku",
                  "status_spt",
                  "spt_url",
                  "tanggal_input",
                  "author",
                ];

                if (existingSpt.length === 0) {
                  // CREATE new SPT record
                  const newSptId = `SPT${String(sptData.length + 1).padStart(
                    3,
                    "0",
                  )}`;

                  await googleSheetsService.addSheetData("db_spt", sptHeaders, {
                    id_spt: newSptId,
                    id_perusahaan: id,
                    tahun_pajak: req.body.tahun_pajak || "",
                    masa_pajak: req.body.masa_pajak || "",
                    jenis_spt: req.body.jenis_spt || "",
                    pembetulan_ke: req.body.pembetulan_ke || "0",
                    nominal: req.body.nominal || "0",
                    tanggal_penyampaian: req.body.tanggal_penyampaian || "",
                    nomor_tanda_terima: req.body.nomor_tanda_terima || "",
                    nama_wp: req.body.nama_wp || "",
                    npwp: req.body.npwp || "",
                    nitku: req.body.nitku || "",
                    status_spt: req.body.status_spt || "Normal",
                    spt_url: pdfUrl,
                    tanggal_input: tanggalInput,
                    author: author,
                  });
                  console.log("✅ SPT record created successfully!");
                } else {
                  // UPDATE existing SPT record
                  const firstSpt = existingSpt[0];

                  // Delete old PDF from Google Drive if exists
                  if (firstSpt.spt_url) {
                    try {
                      const oldFileId =
                        oauth2GoogleService.extractFileIdFromUrl(
                          firstSpt.spt_url,
                        );
                      if (oldFileId) {
                        console.log(
                          "🗑️  Deleting old SPT file from Drive:",
                          oldFileId,
                        );
                        await oauth2GoogleService.deleteFile(oldFileId);
                        console.log("✅ Old SPT file deleted successfully");
                      }
                    } catch (deleteError) {
                      console.warn(
                        "⚠️  Failed to delete old SPT file:",
                        deleteError.message,
                      );
                      // Continue even if delete fails
                    }
                  }

                  await googleSheetsService.updateSheetData(
                    "db_spt",
                    sptHeaders,
                    "id_spt",
                    firstSpt.id_spt,
                    {
                      tahun_pajak: req.body.tahun_pajak || firstSpt.tahun_pajak,
                      masa_pajak: req.body.masa_pajak || firstSpt.masa_pajak,
                      jenis_spt: req.body.jenis_spt || firstSpt.jenis_spt,
                      pembetulan_ke:
                        req.body.pembetulan_ke || firstSpt.pembetulan_ke,
                      nominal: req.body.nominal || firstSpt.nominal,
                      tanggal_penyampaian:
                        req.body.tanggal_penyampaian ||
                        firstSpt.tanggal_penyampaian,
                      nomor_tanda_terima:
                        req.body.nomor_tanda_terima ||
                        firstSpt.nomor_tanda_terima,
                      nama_wp: req.body.nama_wp || firstSpt.nama_wp,
                      npwp: req.body.npwp || firstSpt.npwp,
                      nitku: req.body.nitku || firstSpt.nitku,
                      status_spt: req.body.status_spt || firstSpt.status_spt,
                      spt_url: pdfUrl,
                      tanggal_input: tanggalInput,
                      author: author,
                    },
                  );
                  console.log("✅ SPT record updated successfully!");
                }

                sptUrl = pdfUrl;
              } catch (sptError) {
                console.error(
                  "❌ ERROR in SPT spreadsheet operation:",
                  sptError.message,
                );
              }
            }

            // PKP Document Upload
            else if (doc.type === "pkp") {
              try {
                console.log("🔵 Processing PKP document upload...");
                const pkpData =
                  await googleSheetsService.getSheetData("db_pkp");
                const existingPkp = pkpData.filter(
                  (item) => item.id_perusahaan === id,
                );

                const pkpHeaders = [
                  "id_pkp",
                  "id_perusahaan",
                  "nomor_pkp",
                  "npwp",
                  "tanggal_pengukuhan",
                  "url_pkp",
                  "tanggal_input",
                  "author",
                ];

                if (existingPkp.length === 0) {
                  const newPkpId = `PKP${String(pkpData.length + 1).padStart(
                    3,
                    "0",
                  )}`;
                  await googleSheetsService.addSheetData("db_pkp", pkpHeaders, {
                    id_pkp: newPkpId,
                    id_perusahaan: id,
                    nomor_pkp: req.body.nomor_pkp || "",
                    npwp: req.body.npwp || "",
                    tanggal_pengukuhan: req.body.tanggal_pengukuhan || "",
                    url_pkp: pdfUrl,
                    tanggal_input: tanggalInput,
                    author: author,
                  });
                  console.log("✅ PKP record created successfully!");
                } else {
                  const firstPkp = existingPkp[0];

                  // Delete old PDF from Google Drive if exists
                  if (firstPkp.url_pkp) {
                    try {
                      const oldFileId =
                        oauth2GoogleService.extractFileIdFromUrl(
                          firstPkp.url_pkp,
                        );
                      if (oldFileId) {
                        console.log(
                          "🗑️  Deleting old PKP file from Drive:",
                          oldFileId,
                        );
                        await oauth2GoogleService.deleteFile(oldFileId);
                        console.log("✅ Old PKP file deleted successfully");
                      }
                    } catch (deleteError) {
                      console.warn(
                        "⚠️  Failed to delete old PKP file:",
                        deleteError.message,
                      );
                      // Continue even if delete fails
                    }
                  }

                  await googleSheetsService.updateSheetData(
                    "db_pkp",
                    pkpHeaders,
                    "id_pkp",
                    firstPkp.id_pkp,
                    {
                      nomor_pkp: req.body.nomor_pkp || firstPkp.nomor_pkp,
                      npwp: req.body.npwp || firstPkp.npwp,
                      tanggal_pengukuhan:
                        req.body.tanggal_pengukuhan ||
                        firstPkp.tanggal_pengukuhan,
                      url_pkp: pdfUrl,
                      tanggal_input: tanggalInput,
                      author: author,
                    },
                  );
                  console.log("✅ PKP record updated successfully!");
                }
                pkpUrl = pdfUrl;
              } catch (pkpError) {
                console.error(
                  "❌ ERROR in PKP spreadsheet operation:",
                  pkpError.message,
                );
              }
            }

            // KSWP Document Upload
            else if (doc.type === "kswp") {
              try {
                console.log("🔵 Processing KSWP document upload...");
                const kswpData =
                  await googleSheetsService.getSheetData("db_kswp");
                const existingKswp = kswpData.filter(
                  (item) => item.id_perusahaan === id,
                );

                const kswpHeaders = [
                  "id_kswp",
                  "id_perusahaan",
                  "nama_wp",
                  "npwp",
                  "tahun_kswp",
                  "status_kswp",
                  "tanggal_terbit",
                  "kswp_url",
                  "tanggal_input",
                  "author",
                ];

                if (existingKswp.length === 0) {
                  const newKswpId = `KSWP${String(kswpData.length + 1).padStart(
                    3,
                    "0",
                  )}`;
                  await googleSheetsService.addSheetData(
                    "db_kswp",
                    kswpHeaders,
                    {
                      id_kswp: newKswpId,
                      id_perusahaan: id,
                      nama_wp: req.body.nama_wp_kswp || "",
                      npwp: req.body.npwp_kswp || "",
                      tahun_kswp: req.body.tahun_kswp || "",
                      status_kswp: req.body.status_kswp || "",
                      tanggal_terbit: req.body.tanggal_terbit_kswp || "",
                      kswp_url: pdfUrl,
                      tanggal_input: tanggalInput,
                      author: author,
                    },
                  );
                  console.log("✅ KSWP record created successfully!");
                } else {
                  const firstKswp = existingKswp[0];

                  // Delete old PDF from Google Drive if exists
                  if (firstKswp.kswp_url) {
                    try {
                      const oldFileId =
                        oauth2GoogleService.extractFileIdFromUrl(
                          firstKswp.kswp_url,
                        );
                      if (oldFileId) {
                        console.log(
                          "🗑️  Deleting old KSWP file from Drive:",
                          oldFileId,
                        );
                        await oauth2GoogleService.deleteFile(oldFileId);
                        console.log("✅ Old KSWP file deleted successfully");
                      }
                    } catch (deleteError) {
                      console.warn(
                        "⚠️  Failed to delete old KSWP file:",
                        deleteError.message,
                      );
                      // Continue even if delete fails
                    }
                  }

                  await googleSheetsService.updateSheetData(
                    "db_kswp",
                    kswpHeaders,
                    "id_kswp",
                    firstKswp.id_kswp,
                    {
                      nama_wp: req.body.nama_wp || firstKswp.nama_wp,
                      npwp: req.body.npwp || firstKswp.npwp,
                      tahun_kswp: req.body.tahun_kswp || firstKswp.tahun_kswp,
                      status_kswp:
                        req.body.status_kswp || firstKswp.status_kswp,
                      tanggal_terbit:
                        req.body.tanggal_terbit || firstKswp.tanggal_terbit,
                      kswp_url: pdfUrl,
                      tanggal_input: tanggalInput,
                      author: author,
                    },
                  );
                  console.log("✅ KSWP record updated successfully!");
                }
                kswpUrl = pdfUrl;
              } catch (kswpError) {
                console.error(
                  "❌ ERROR in KSWP spreadsheet operation:",
                  kswpError.message,
                );
              }
            }
          } catch (sheetError) {
            console.error(
              `❌ Failed to update ${doc.label} in spreadsheet:`,
              sheetError.message,
            );
            console.error("   Stack:", sheetError.stack);
            // Continue anyway - at least the file is uploaded to Drive
          }
        } catch (docError) {
          console.error(
            `❌ Google Drive ${doc.label} upload failed:`,
            docError.message,
          );
        }
      }
    }

    // Clean up temporary files
    const filesToCleanup = [
      logoFile,
      kopFile,
      companyProfileFile,
      aktaFile,
      nibFile,
      sbuFile,
      ktaFile,
      sertifikatFile,
      kontrakFile,
      cekFile,
      bpjsFile,
    ].filter(Boolean);
    for (const file of filesToCleanup) {
      if (file?.path) {
        try {
          const fs = await import("fs/promises");
          await fs.unlink(file.path);
        } catch (e) {
          /* ignore */
        }
      }
    }

    // 3.5 Handle tax document data updates WITHOUT new PDF files
    // This allows editing tax document metadata without re-uploading PDF
    if (
      !pkpFile &&
      (req.body.nomor_pkp || req.body.npwp || req.body.tanggal_pengukuhan)
    ) {
      try {
        console.log("📝 Updating PKP data without new PDF...");
        const pkpData = await googleSheetsService.getSheetData("db_pkp");
        const existingPkp = pkpData.filter((item) => item.id_perusahaan === id);

        if (existingPkp.length > 0) {
          const firstPkp = existingPkp[0];
          const pkpHeaders = [
            "id_pkp",
            "id_perusahaan",
            "nomor_pkp",
            "npwp",
            "tanggal_pengukuhan",
            "url_pkp",
            "tanggal_input",
            "author",
          ];

          await googleSheetsService.updateSheetData(
            "db_pkp",
            pkpHeaders,
            "id_pkp",
            firstPkp.id_pkp,
            {
              nomor_pkp: req.body.nomor_pkp || firstPkp.nomor_pkp,
              npwp: req.body.npwp || firstPkp.npwp,
              tanggal_pengukuhan:
                req.body.tanggal_pengukuhan || firstPkp.tanggal_pengukuhan,
              // Keep existing URL and metadata
              url_pkp: firstPkp.url_pkp,
              tanggal_input: new Date().toISOString(),
              author: req.body.author || firstPkp.author,
            },
          );
          console.log("✅ PKP data updated successfully (no new PDF)");
        } else {
          console.log(
            "⚠️  No existing PKP record found - skipping data-only update",
          );
        }
      } catch (pkpDataError) {
        console.error("❌ Error updating PKP data:", pkpDataError.message);
        // Don't fail the entire request, just log the error
      }
    }

    // 4. Update Data in Sheets
    // 4. Update Data in Sheets
    const updateDataRaw = {
      nama_perusahaan,
      no_telp,
      email,
      tahun_berdiri,
      status,
      alamat: req.body.alamat,
      // URL variables are initialized with existing values, so they are safe
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
      url_bpjs: bpjsUrl,
      // Add missing tax URLs
      npwp_perusahaan_url: npwpUrl,
      spt_url: sptUrl,
      url_pkp: pkpUrl,
      kswp_url: kswpUrl,
    };

    // Remove keys with undefined values to prevent overwriting existing data with blank/undefined
    const updateData = Object.fromEntries(
      Object.entries(updateDataRaw).filter(([_, v]) => v !== undefined),
    );

    console.log("💾 Saving updates to database...");
    console.log("📊 Update data:", JSON.stringify(updateData, null, 2));

    const result = await googleSheetsService.updateProfilPerusahaan(
      id,
      updateData,
    );

    console.log("✅ Google Sheets updated successfully");

    res.json({
      success: true,
      message: "Company profile updated successfully",
      data: result,
      uploadDetails: uploadDetails,
    });
  } catch (error) {
    console.error("Error in updateCompany:", error);

    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to update company profile",
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
      message: "Company profile deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ Error in deleteCompany:", error);

    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete company profile",
      data: null,
    });
  }
};

/**
 * Step 1: Delete Company Assets (Logo & Drive Folder)
 * DELETE /api/companies/:id/assets
 */
export const deleteCompanyAssets = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️  DELETE /api/companies/${id}/assets`);
    const result = await googleSheetsService.deleteCompanyAssets(id);
    res.json({
      success: true,
      message: "Company assets deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ Error in deleteCompanyAssets:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete company assets",
    });
  }
};

/**
 * Step 2: Delete Related Data (Cascade delete)
 * DELETE /api/companies/:id/related-data
 */
export const deleteCompanyRelatedData = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️  DELETE /api/companies/${id}/related-data`);
    const result = await googleSheetsService.deleteCompanyRelatedData(id);
    res.json({
      success: true,
      message: "Company related data deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ Error in deleteCompanyRelatedData:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete company related data",
    });
  }
};

/**
 * Step 3: Delete Company Profile Record
 * DELETE /api/companies/:id/profile
 */
export const deleteCompanyProfile = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️  DELETE /api/companies/${id}/profile`);
    const result = await googleSheetsService.deleteCompanyProfile(id);
    res.json({
      success: true,
      message: "Company profile deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ Error in deleteCompanyProfile:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete company profile",
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
        message: "Company kop not available",
      });
    }

    // Extract file ID from Google Drive URL
    const fileId = oauth2GoogleService.extractFileIdFromUrl(
      company.kop_perusahaan,
    );

    if (!fileId) {
      return res.status(400).json({
        success: false,
        message: "Invalid kop URL format",
      });
    }

    console.log(`  📥 Downloading kop from Google Drive (ID: ${fileId})`);

    // Download file content from Google Drive using OAuth
    const fileBuffer = await oauth2GoogleService.downloadFile(fileId);

    // Set CORS headers to allow frontend access
    res.set({
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET",
      "Access-Control-Allow-Headers": "Content-Type",
      "Cross-Origin-Resource-Policy": "cross-origin", // Allow cross-origin image loading
      "Content-Type": "image/png", // Adjust based on actual file type
      "Content-Length": fileBuffer.length,
      "Cache-Control": "public, max-age=86400", // Cache for 1 day
    });

    console.log(
      `  ✅ Kop image served successfully (${fileBuffer.length} bytes)`,
    );
    res.send(fileBuffer);
  } catch (error) {
    console.error("❌ Error in getCompanyKop:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get company kop",
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
        message: "Please provide PDF file or PDF URL",
      });
    }

    let pdfBuffer;

    // If PDF file was uploaded
    if (pdfFile) {
      const fs = await import("fs/promises");
      pdfBuffer = await fs.readFile(pdfFile.path);

      // Clean up temp file
      try {
        await fs.unlink(pdfFile.path);
      } catch (e) {
        /* ignore */
      }
    }
    // If PDF URL provided (existing file in Drive)
    else if (pdfUrl) {
      const fileId = oauth2GoogleService.extractFileIdFromUrl(pdfUrl);
      if (!fileId) {
        return res.status(400).json({
          success: false,
          message: "Invalid PDF URL format",
        });
      }
      pdfBuffer = await oauth2GoogleService.downloadFile(fileId);
    }

    // Convert PDF buffer to base64 for Gemini API
    const base64PDF = pdfBuffer.toString("base64");

    // Call Gemini API to extract contact information
    const { GoogleGenerativeAI } = await import("@google/generative-ai");
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

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
          mimeType: "application/pdf",
          data: base64PDF,
        },
      },
      prompt,
    ]);

    const response = await result.response;
    const text = response.text();

    console.log("🤖 Gemini Response:", text);

    // Parse JSON response
    let extractedData;
    try {
      // Remove markdown code blocks if present
      const cleanText = text
        .replace(/```json\n?/g, "")
        .replace(/```\n?/g, "")
        .trim();
      extractedData = JSON.parse(cleanText);
    } catch (parseError) {
      console.error("❌ Failed to parse Gemini response:", parseError);
      return res.status(500).json({
        success: false,
        message: "Failed to parse AI response",
        rawResponse: text,
      });
    }

    console.log("✅ Extracted data:", extractedData);

    res.json({
      success: true,
      message: "Company profile scanned successfully",
      data: extractedData,
    });
  } catch (error) {
    console.error("❌ Error in scanCompanyProfile:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to scan company profile",
    });
  }
};

/* Update Company KBLI Batch */
export const updateCompanyKbliBatch = async (req, res) => {
  try {
    const { id } = req.params;
    const { kbliCodes } = req.body; // Expect array of string codes

    if (!Array.isArray(kbliCodes)) {
      return res.status(400).json({ error: "kbliCodes must be an array" });
    }

    const result = await googleSheetsService.batchUpdateKBLI(
      id,
      kbliCodes,
      "system",
    );
    res.json(result);
  } catch (error) {
    console.error("Error updating KBLI batch:", error);
    res.status(500).json({ error: error.message });
  }
};
// ========================================
// GENERIC DOCUMENT UPLOAD (STEP 1)
// ========================================

/**
 * Upload company document to Drive and return URL
 * Used for stepped upload process (Step 1)
 */
export const uploadCompanyDocument = async (req, res) => {
  try {
    const { id, type } = req.params;
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "File is required" });
    }

    const company = await googleSheetsService.getProfilPerusahaanById(id);
    if (!company) {
      return res
        .status(404)
        .json({ success: false, message: "Company not found" });
    }

    const namaPerusahaan = company.nama_perusahaan;
    const baseFolderId = process.env.GOOGLE_DRIVE_PERUSAHAAN_FOLDER_ID;

    // 1. Find company folder
    const companyFolders = await oauth2GoogleService.searchFolder(
      namaPerusahaan,
      baseFolderId,
    );
    let companyFolderId;
    let companyFolderName;
    let companyIndex = "01"; // Default

    if (companyFolders && companyFolders.length > 0) {
      companyFolderId = companyFolders[0].id;
      companyFolderName = companyFolders[0].name;

      // Extract index from folder name (e.g. "05. PT ABC" -> "05")
      const match = companyFolderName.match(/^(\d+)\./);
      if (match) {
        companyIndex = match[1];
      }
    } else {
      return res.status(404).json({
        success: false,
        message: `Google Drive folder for ${namaPerusahaan} not found`,
      });
    }

    // 2. Determine subfolder configuration
    const docConfig = {
      akta: { namePart: "Akta Perusahaan", index: "2" },
      nib: { namePart: "Nomor Induk Berusaha", index: "3" },
      sbu: { namePart: "Sertifikat Badan Usaha", index: "4" },
      kta: { namePart: "Kartu Tanda Anggota", index: "5" },
      sertifikat: { namePart: "Sertifikat Standar", index: "6" },
      kontrak: { namePart: "Kontrak Pengalaman", index: "8" },
      cek: { namePart: "Surat Referensi Bank", index: "9" },
      bpjs: { namePart: "BPJS", index: "10" },
      // Tax docs
      spt: {
        namePart: "Data Perpajakan",
        fileNamePart: "SPT Tahunan",
        index: "7",
      },
      npwp: { namePart: "Data Perpajakan", fileNamePart: "NPWP", index: "7" },
      pkp: { namePart: "Data Perpajakan", fileNamePart: "PKP", index: "7" },
      kswp: { namePart: "Data Perpajakan", fileNamePart: "KSWP", index: "7" },
      // Generic tax
      pajak: { namePart: "Data Perpajakan", index: "7" },
    };

    const config = docConfig[type];
    let subFolderId;

    if (config) {
      const parsedIndex = parseInt(companyIndex, 10);
      const targetSubfolderName = `${parsedIndex}.${config.index} ${config.namePart}`;

      // Search for EXACT subfolder first
      const subFolders = await oauth2GoogleService.listFolders(companyFolderId);
      const existingSub = subFolders.find(
        (f) => f.name === targetSubfolderName,
      );

      if (existingSub) {
        subFolderId = existingSub.id;
      } else {
        // Fallback: Search by partial name to be safe
        const partialSub = subFolders.find((f) =>
          f.name.includes(config.namePart),
        );

        if (partialSub) {
          subFolderId = partialSub.id;
        } else {
          // CREATE if missing
          console.log(`📁 Creating missing subfolder: ${targetSubfolderName}`);
          const newFolder = await oauth2GoogleService.createFolder(
            targetSubfolderName,
            companyFolderId,
          );
          subFolderId = newFolder.id;
        }
      }
    } else {
      // Fallback to strict company root
      subFolderId = companyFolderId;
    }

    // 3. Upload File with Standardized Name
    // Format: [DocName] [CompanyName].pdf
    const docName = config
      ? config.fileNamePart || config.namePart
      : type.toUpperCase();
    const fileName = `${docName} ${namaPerusahaan}.pdf`;

    // We use a lower level upload since we resolved IDs manually
    const fs = await import("fs/promises");
    const result = await oauth2GoogleService.uploadFileToFolder(
      file.path,
      fileName,
      file.mimetype,
      subFolderId,
    );

    // Cleanup
    await fs.unlink(file.path).catch(() => {});

    res.json({
      success: true,
      message: "File uploaded to Drive successfully",
      data: {
        fileUrl: result.webViewLink,
        fileId: result.fileId,
      },
    });
  } catch (error) {
    console.error("Error in uploadCompanyDocument:", error);
    // Cleanup
    if (req.file) {
      const fs = await import("fs/promises");
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Helper function to upload Pengalaman Document (Daftar or Kontrak) to Google Drive
 * Path: .../[index].8 Kontrak Pengalaman/{type} - {nama_kegiatan} - {nama_perusahaan}.pdf
 */
async function uploadPengalamanDocumentHelper(
  file,
  namaPerusahaan,
  folderNumber,
  type,
  namaKegiatan,
) {
  const basePerusahaanFolderId = process.env.GOOGLE_DRIVE_PERUSAHAAN_FOLDER_ID;

  if (!basePerusahaanFolderId) {
    throw new Error("GOOGLE_DRIVE_PERUSAHAAN_FOLDER_ID not configured in .env");
  }

  // Folder: 8. Kontrak Pengalaman
  const companyIndex = parseInt(folderNumber, 10);
  const companyFolderName = `${folderNumber}. ${namaPerusahaan}`;
  const folderPath = [
    companyFolderName,
    `${companyIndex}.8 Kontrak Pengalaman`,
  ];

  // Sanitize filename parts
  const safeKegiatan = namaKegiatan
    .replace(/[^a-zA-Z0-9 .-]/g, "_")
    .substring(0, 50);
  const safeType = type.charAt(0).toUpperCase() + type.slice(1); // Daftar or Kontrak

  const fileName = `${safeType} - ${safeKegiatan} - ${namaPerusahaan}.pdf`;

  // Create read stream for file
  const fs = await import("fs");
  const fileStream = fs.createReadStream(file.path);

  // Upload using oauth2GoogleService
  const result = await oauth2GoogleService.uploadPdfFile(
    fileStream,
    fileName,
    "application/pdf",
    folderPath,
    basePerusahaanFolderId,
  );

  return result;
}

/**
 * Upload Pengalaman Document (Daftar or Kontrak PDF)
 * POST /api/companies/:id/pengalaman/:itemId/:type/upload
 *
 * Uses custom naming: "{type} - {nama_pekerjaan} - {nama_perusahaan}.pdf"
 * Both daftar and kontrak go to the same folder: x.8 Kontrak Pengalaman
 */
export const uploadPengalamanDocument = async (req, res) => {
  try {
    const { id, itemId, type } = req.params;
    const file = req.file;

    console.log(
      `📤 Upload Pengalaman Document: ${type} for company ${id}, item ${itemId}`,
    );
    console.log("   Params:", req.params);
    console.log(
      "   File:",
      file ? `${file.originalname} (${file.size} bytes)` : "MISSING",
    );

    // Validate type (case-insensitive)
    const validTypes = ["daftar", "kontrak"];
    if (!validTypes.includes(type.toLowerCase())) {
      console.error(`❌ Invalid document type: ${type}`);
      if (file) {
        const fs = await import("fs/promises");
        await fs.unlink(file.path).catch(() => {});
      }
      return res.status(400).json({
        success: false,
        message: 'Type must be "daftar" or "kontrak"',
      });
    }

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    // Get company data
    const company = await googleSheetsService.getCompanyById(id);
    if (!company) {
      const fs = await import("fs/promises");
      await fs.unlink(file.path).catch(() => {});
      return res.status(404).json({
        success: false,
        message: "Company not found",
      });
    }

    // Get pengalaman data to get nama_kegiatan for file naming
    const allPengalaman = await googleSheetsService.getAllPengalaman(id);
    const pengalaman = allPengalaman.find((p) => p.id_kontrak === itemId);

    if (!pengalaman) {
      const fs = await import("fs/promises");
      await fs.unlink(file.path).catch(() => {});
      return res.status(404).json({
        success: false,
        message: "Pengalaman record not found",
      });
    }

    // Use new field names with fallback to old names
    const namaKegiatan =
      pengalaman.kegiatan ||
      pengalaman.nama_kegiatan ||
      pengalaman.pekerjaan ||
      pengalaman.nama_pekerjaan ||
      "Unknown Project";
    const namaPerusahaan = company.nama_perusahaan;

    // Get company folder number
    const allCompanies = await googleSheetsService.getAllCompanies();
    const companyIndex = allCompanies.findIndex((c) => c.id_perusahaan === id);
    const folderNumber = String(companyIndex + 1).padStart(2, "0");

    // Upload using helper function
    console.log(
      `🔍 [DEBUG] calling uploadPengalamanDocumentHelper for ${type}...`,
    );
    const result = await uploadPengalamanDocumentHelper(
      file,
      namaPerusahaan,
      folderNumber,
      type,
      namaKegiatan,
    );
    console.log(`✅ [DEBUG] helper finished. Result:`, result ? "OK" : "NULL");

    // Update the appropriate URL field in database
    const urlField = type === "daftar" ? "daftar_url" : "kontrak_url";
    console.log(
      `🔍 [DEBUG] Updating Sheet for item ${itemId}, field: ${urlField}`,
    );

    await googleSheetsService.updateKontrakPengalaman(itemId, {
      [urlField]: result.webViewLink,
    });
    console.log(`✅ [DEBUG] Sheet updated successfully`);

    // Cleanup temp file
    const fs = await import("fs/promises");
    await fs.unlink(file.path).catch(() => {});

    console.log(`✅ ${type} document uploaded successfully`);
    console.log(`   File: ${result.fileName}`);
    console.log(`   URL: ${result.webViewLink}`);

    res.json({
      success: true,
      message: `${
        type === "daftar" ? "Daftar" : "Kontrak"
      } Pengalaman uploaded successfully`,
      data: {
        fileUrl: result.webViewLink,
        fileId: result.fileId,
        fileName: result.fileName,
        type,
      },
    });
  } catch (error) {
    console.error("Error in uploadPengalamanDocument:", error);
    if (req.file) {
      const fs = await import("fs/promises");
      await fs.unlink(req.file.path).catch(() => {});
    }
    res.status(500).json({ success: false, message: error.message });
  }
};
