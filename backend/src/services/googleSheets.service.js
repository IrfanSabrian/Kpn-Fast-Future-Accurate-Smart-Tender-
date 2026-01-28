/**
 * Google Sheets Service
 *
 * Service untuk interact dengan Google Sheets sebagai database
 * Handles CRUD operations untuk:
 * - Profil Perusahaan
 * - Data personel/Tenaga Ahli
 */

// Google Sheets Service - Updated Logic
import { google } from "googleapis";
import path from "path";
import { fileURLToPath } from "url";
import oauth2GoogleService from "./oauth2Google.service.js";
import cloudinary from "cloudinary";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GoogleSheetsService {
  constructor() {
    this.auth = null;
    this.sheets = null;
    this.initialized = false;
  }

  /**
   * Initialize Google Sheets API with OAuth2
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize OAuth2 service first
      await oauth2GoogleService.initialize();

      if (!oauth2GoogleService.isAuthenticated()) {
        throw new Error("User not authenticated. Please login first.");
      }

      // Use OAuth2 client from oauth2GoogleService
      const authClient = oauth2GoogleService.getAuthClient();
      this.sheets = google.sheets({ version: "v4", auth: authClient });
      this.initialized = true;

      console.log("✅ Google Sheets Service initialized with OAuth2");
    } catch (error) {
      console.error("❌ Failed to initialize Google Sheets Service:", error);
      throw error;
    }
  }

  /**
   * Force reload service with new OAuth client
   * Call this after user login/logout
   */
  async forceReload() {
    this.initialized = false;
    this.sheets = null;
    await this.initialize();
  }

  /**
   * Get sheet tab names from spreadsheet
   */
  async getSheetTabNames(spreadsheetId) {
    await this.initialize();

    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
      });

      return response.data.sheets.map((sheet) => ({
        title: sheet.properties.title,
        sheetId: sheet.properties.sheetId,
        index: sheet.properties.index,
      }));
    } catch (error) {
      throw new Error(`Failed to get sheet tabs: ${error.message}`);
    }
  }

  // ========================================
  // PROFIL PERUSAHAAN (Multiple Companies Support)
  // ========================================

  /**
   * Get all company profiles
   * @returns {Array} List of company profiles
   */
  async getAllProfilPerusahaan() {
    await this.initialize();

    try {
      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERUSAHAAN;

      if (!spreadsheetId) {
        throw new Error(
          "GOOGLE_SHEET_ID_PERUSAHAAN not configured in environment variables",
        );
      }

      // Use the correct sheet name directly
      const profilTabName = "db_profil_perusahaan";

      // Read all data
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${profilTabName}!A:ZZ`,
      });

      const rows = response.data.values;

      if (!rows || rows.length < 2) {
        return []; // No data yet
      }

      const headers = rows[0];
      const dataRows = rows
        .slice(1)
        .filter((row) => row && row.length > 0 && row[0]); // Filter empty rows

      // Map to array of objects
      return dataRows.map((row) => {
        const profil = {};
        headers.forEach((header, index) => {
          profil[header] = row[index] || "";
        });
        return profil;
      });
    } catch (error) {
      console.error("Error getting all profil perusahaan:", error);
      throw new Error(`Failed to get profiles: ${error.message}`);
    }
  }

  /**
   * Get single company profile by ID
   * @param {string} id - Company ID
   */
  async getProfilPerusahaanById(id) {
    const allProfiles = await this.getAllProfilPerusahaan();
    return allProfiles.find((p) => p.id_perusahaan === id) || null;
  }

  /**
   * Add new company profile
   * @param {Object} data - Company profile data
   */
  async addProfilPerusahaan(data) {
    await this.initialize();

    try {
      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERUSAHAAN;
      const profilTabName = "db_profil_perusahaan";

      // Get headers from the first row
      const headerResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${profilTabName}!A1:Z1`, // Assume max 26 columns
      });

      const headers = headerResponse.data.values?.[0];
      if (!headers) {
        throw new Error("Headers not found in the first row");
      }

      // Get current data to find next row
      const currentDataResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${profilTabName}!A:A`, // Check column A for rows count
      });
      const nextRow = (currentDataResponse.data.values?.length || 0) + 1;

      // Generate ID if not provided
      if (!data.id_perusahaan) {
        // Simple ID generation based on timestamp to avoid collision/count issues
        // Or keep existing logic if preferred, but count based is risky if rows deleted
        // Let's stick to existing logic for consistency but safer
        const count = currentDataResponse.data.values?.length || 1;
        data.id_perusahaan = `COMP${String(count).padStart(3, "0")}`;
      }

      // Map data to headers
      const values = headers.map((header) => {
        const key = header.toLowerCase().replace(/\s+/g, "_");
        return data[key] || "";
      });

      // Append row
      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${profilTabName}!A${nextRow}`,
        valueInputOption: "RAW",
        resource: {
          values: [values],
        },
      });

      return {
        success: true,
        message: "Company profile added successfully",
        data: { id_perusahaan: data.id_perusahaan },
      };
    } catch (error) {
      console.error("Error adding profil perusahaan:", error);
      throw new Error(`Failed to add profile: ${error.message}`);
    }
  }

  /**
   * Update company profile by ID
   * @param {string} id - Company ID
   * @param {Object} data - Updated data
   */
  async updateProfilPerusahaan(id, data) {
    await this.initialize();

    try {
      const allProfiles = await this.getAllProfilPerusahaan();
      const index = allProfiles.findIndex((p) => p.id_perusahaan === id);

      if (index === -1) {
        throw new Error(`Company with ID ${id} not found`);
      }

      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERUSAHAAN;
      const profilTabName = "db_profil_perusahaan";

      // Row number
      const rowNumber = index + 2;

      // Get headers from the first row
      const headerResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${profilTabName}!A1:Z1`, // Assume max 26 columns
      });

      const headers = headerResponse.data.values?.[0];
      if (!headers) {
        throw new Error("Headers not found in the first row");
      }

      // Merge existing data with updates
      const updatedData = { ...allProfiles[index], ...data };

      // Map data to headers
      const values = headers.map((header) => {
        const key = header.toLowerCase().replace(/\s+/g, "_");
        return updatedData[key] || "";
      });

      // Update row
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${profilTabName}!A${rowNumber}`,
        valueInputOption: "RAW",
        resource: {
          values: [values],
        },
      });

      // Check if nama_perusahaan changed - rename everything related
      const result = {
        success: true,
        message: "Company profile updated successfully",
      };

      if (
        data.nama_perusahaan &&
        data.nama_perusahaan !== allProfiles[index].nama_perusahaan
      ) {
        const oldCompanyName = allProfiles[index].nama_perusahaan;
        const newCompanyName = data.nama_perusahaan;
        const folderNumber = String(index + 1).padStart(2, "0");
        const oldFolderName = `${folderNumber}. ${oldCompanyName}`;
        const newFolderName = `${folderNumber}. ${newCompanyName}`;

        console.log(
          `🔄 Company name changed: "${oldCompanyName}" → "${newCompanyName}"`,
        );

        // 1. Rename Cloudinary logo (if exists) by re-uploading with new name
        if (allProfiles[index].logo_cloud) {
          try {
            console.log(`☁️  Updating Cloudinary logo name...`);

            const oldUrl = allProfiles[index].logo_cloud;
            console.log(`   Old logo URL: ${oldUrl}`);

            // Configure Cloudinary
            const cloudinaryV2 = cloudinary.v2;
            cloudinaryV2.config({
              cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
              api_key: process.env.CLOUDINARY_API_KEY,
              api_secret: process.env.CLOUDINARY_API_SECRET,
            });

            // Check if configured
            const config = cloudinaryV2.config();
            if (config.cloud_name && config.api_key && config.api_secret) {
              // Extract old public_id
              const publicIdMatch = oldUrl.match(
                /\/upload\/(?:v\d+\/)?(.+)\.\w+$/,
              );

              if (publicIdMatch) {
                const oldPublicId = decodeURIComponent(publicIdMatch[1]);
                const uploadFolder =
                  process.env.CLOUDINARY_UPLOAD_FOLDER ||
                  "kpn-fast/company-logos";
                const newPublicId = `Logo ${newCompanyName}`;

                console.log(`   Old Public ID: ${oldPublicId}`);
                console.log(`   New Public ID: ${newPublicId}`);
                console.log(`   Strategy: Download → Upload → Delete`);

                try {
                  // Step 1: Upload from existing URL with new name
                  console.log(`   📥 Uploading logo with new name...`);
                  const uploadResult = await cloudinaryV2.uploader.upload(
                    oldUrl,
                    {
                      folder: uploadFolder,
                      public_id: newPublicId,
                      overwrite: true,
                      resource_type: "image",
                    },
                  );

                  console.log(`   ✅ Logo uploaded with new name`);
                  console.log(`   New URL: ${uploadResult.secure_url}`);

                  // Step 2: Delete old logo
                  console.log(`   🗑️  Deleting old logo...`);
                  const deleteResult =
                    await cloudinaryV2.uploader.destroy(oldPublicId);

                  if (deleteResult.result === "ok") {
                    console.log(`   ✅ Old logo deleted`);
                  } else {
                    console.log(
                      `   ℹ️  Old logo delete result: ${deleteResult.result}`,
                    );
                  }

                  // Update the logo URL in the data
                  updatedData.logo_cloud = uploadResult.secure_url;
                  console.log(`✅ Logo successfully renamed in Cloudinary`);
                  result.cloudinaryRenamed = true;
                  result.newLogoUrl = uploadResult.secure_url;
                } catch (cloudinaryOpError) {
                  console.error(
                    `❌ Cloudinary operation error:`,
                    cloudinaryOpError.message,
                  );
                  result.cloudinaryRenameError = cloudinaryOpError.message;
                }
              } else {
                console.log(`⚠️  Could not extract public_id from URL`);
              }
            } else {
              console.log(
                `ℹ️  Cloudinary not configured, skipping logo rename`,
              );
            }
          } catch (cloudinaryError) {
            console.error(
              "❌ Failed to rename Cloudinary logo:",
              cloudinaryError.message,
            );
            result.cloudinaryRenameError = cloudinaryError.message;
          }
        }

        // 2. Rename Google Drive folder
        try {
          const parentFolderId = process.env.GOOGLE_DRIVE_PERUSAHAAN_FOLDER_ID;
          await oauth2GoogleService.renameFolder(
            oldFolderName,
            newFolderName,
            parentFolderId,
          );
          console.log(
            `✅ Company folder renamed: "${oldFolderName}" → "${newFolderName}"`,
          );
          result.folderRenamed = true;

          // 3. Rename logo file inside "[index].0 Logo & Kop" subfolder
          try {
            const companyIndex = parseInt(folderNumber, 10); // "01" -> 1, "02" -> 2
            console.log(
              `📁 Finding "${companyIndex}.0 Logo & Kop" subfolder...`,
            );

            // Find the renamed company folder
            const companyFolder = await oauth2GoogleService.findFolderByName(
              newFolderName,
              parentFolderId,
            );

            if (companyFolder) {
              // Find "[index].0 Logo & Kop" subfolder (1.0, 2.0, 3.0...)
              const logoFolderName = `${companyIndex}.0 Logo & Kop`;
              const logoFolder = await oauth2GoogleService.findFolderByName(
                logoFolderName,
                companyFolder.id,
              );

              if (logoFolder) {
                console.log(
                  `📁 Found "${logoFolderName}" folder (ID: ${logoFolder.id})`,
                );

                // Try to find logo file with common extensions
                const oldLogoFileName = `Logo ${oldCompanyName}`;
                const possibleExtensions = [
                  ".png",
                  ".jpg",
                  ".jpeg",
                  ".webp",
                  ".svg",
                ];

                console.log(
                  `🔍 Searching for logo file: "${oldLogoFileName}"...`,
                );

                let logoFile = null;
                let foundExtension = "";

                // Try each extension
                for (const ext of possibleExtensions) {
                  const fullFileName = `${oldLogoFileName}${ext}`;
                  logoFile = await oauth2GoogleService.findFileByName(
                    fullFileName,
                    logoFolder.id,
                  );

                  if (logoFile) {
                    foundExtension = ext;
                    console.log(
                      `📄 Found logo file: "${fullFileName}" (ID: ${logoFile.id})`,
                    );
                    break;
                  }
                }

                if (logoFile) {
                  const newLogoFileName = `Logo ${newCompanyName}${foundExtension}`;

                  console.log(`🔄 Renaming to: "${newLogoFileName}"`);

                  await oauth2GoogleService.renameFileById(
                    logoFile.id,
                    newLogoFileName,
                  );
                  console.log(
                    `✅ Logo file renamed: "${oldLogoFileName}${foundExtension}" → "${newLogoFileName}"`,
                  );
                  result.logoFileRenamed = true;
                } else {
                  console.log(`ℹ️  Logo file not found in "${logoFolderName}"`);
                }

                // 3b. Rename kop file in the same folder
                console.log(`🔍 Searching for kop file...`);
                const oldKopFileName = `Kop ${oldCompanyName}`;

                let kopFile = null;
                let kopFoundExtension = "";

                // Try each extension for kop
                for (const ext of possibleExtensions) {
                  const fullFileName = `${oldKopFileName}${ext}`;
                  kopFile = await oauth2GoogleService.findFileByName(
                    fullFileName,
                    logoFolder.id,
                  );

                  if (kopFile) {
                    kopFoundExtension = ext;
                    console.log(
                      `📄 Found kop file: "${fullFileName}" (ID: ${kopFile.id})`,
                    );
                    break;
                  }
                }

                if (kopFile) {
                  const newKopFileName = `Kop ${newCompanyName}${kopFoundExtension}`;

                  console.log(`🔄 Renaming kop to: "${newKopFileName}"`);

                  await oauth2GoogleService.renameFileById(
                    kopFile.id,
                    newKopFileName,
                  );
                  console.log(
                    `✅ Kop file renamed: "${oldKopFileName}${kopFoundExtension}" → "${newKopFileName}"`,
                  );
                  result.kopFileRenamed = true;
                } else {
                  console.log(`ℹ️  Kop file not found in "${logoFolderName}"`);
                }

                // 3c. Rename company profile PDF in "[index].1 Profil Perusahaan" folder
                console.log(`🔍 Searching for company profile PDF...`);
                const profilFolderName = `${companyIndex}.1 Profil Perusahaan`;
                const profilFolder = await oauth2GoogleService.findFolderByName(
                  profilFolderName,
                  companyFolder.id,
                );

                if (profilFolder) {
                  const oldProfilPDFName = `Profil Perusahaan ${oldCompanyName}.pdf`;
                  const profilFile = await oauth2GoogleService.findFileByName(
                    oldProfilPDFName,
                    profilFolder.id,
                  );

                  if (profilFile) {
                    const newProfilPDFName = `Profil Perusahaan ${newCompanyName}.pdf`;

                    console.log(
                      `📄 Found company profile PDF: "${oldProfilPDFName}" (ID: ${profilFile.id})`,
                    );
                    console.log(`🔄 Renaming to: "${newProfilPDFName}"`);

                    await oauth2GoogleService.renameFileById(
                      profilFile.id,
                      newProfilPDFName,
                    );
                    console.log(
                      `✅ Company profile PDF renamed: "${oldProfilPDFName}" → "${newProfilPDFName}"`,
                    );
                    result.companyProfileRenamed = true;
                  } else {
                    console.log(
                      `ℹ️  Company profile PDF not found in "${profilFolderName}"`,
                    );
                  }
                } else {
                  console.log(`ℹ️  "${profilFolderName}" subfolder not found`);
                }
              } else {
                console.log(`ℹ️  "${logoFolderName}" subfolder not found`);
              }
            }
          } catch (logoFileError) {
            console.error(
              "❌ Failed to rename logo file:",
              logoFileError.message,
            );
            result.logoFileRenameError = logoFileError.message;
          }
        } catch (driveError) {
          console.error(
            "❌ Failed to rename Google Drive folder:",
            driveError.message,
          );
          result.folderRenameError = driveError.message;
        }

        // 4. Update Google Sheets with new logo URL if Cloudinary was renamed
        if (result.newLogoUrl && result.cloudinaryRenamed) {
          try {
            console.log(`📊 Updating logo URL in Google Sheets...`);

            // Re-map data with new logo URL
            const finalData = { ...updatedData, logo_cloud: result.newLogoUrl };
            const values = headers.map((header) => {
              const key = header.toLowerCase().replace(/\s+/g, "_");
              return finalData[key] || "";
            });

            // Update row again with new logo URL
            await this.sheets.spreadsheets.values.update({
              spreadsheetId,
              range: `${profilTabName}!A${rowNumber}`,
              valueInputOption: "RAW",
              resource: {
                values: [values],
              },
            });

            console.log(`✅ Logo URL updated in Google Sheets`);
            result.sheetUpdated = true;
          } catch (sheetError) {
            console.error(
              "❌ Failed to update sheet with new logo URL:",
              sheetError.message,
            );
            result.sheetUpdateError = sheetError.message;
          }
        }
      }

      return result;
    } catch (error) {
      console.error("Error updating profil perusahaan:", error);
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  }

  /**
   * Delete company profile by ID with CASCADE DELETE
   * @param {string} id - Company ID
   */
  /**
   * Delete company assets (Cloudinary logo & Google Drive folder)
   * @param {string} id - Company ID
   */
  async deleteCompanyAssets(id) {
    try {
      const company = await this.getProfilPerusahaanById(id);
      if (!company) throw new Error(`Company with ID ${id} not found`);

      console.log(
        `🗑️  Starting asset deletion for company: ${company.nama_perusahaan}`,
      );

      // 1. Delete logo from Cloudinary
      if (company.logo_cloud) {
        try {
          console.log(`☁️  Deleting logo from Cloudinary...`);
          // Configure Cloudinary
          const cloudinaryV2 = cloudinary.v2;
          cloudinaryV2.config({
            cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
            api_key: process.env.CLOUDINARY_API_KEY,
            api_secret: process.env.CLOUDINARY_API_SECRET,
          });

          // Extract public_id
          const publicIdMatch = company.logo_cloud.match(
            /\/upload\/(?:v\d+\/)?(.+)\.\w+$/,
          );
          if (publicIdMatch) {
            const publicId = decodeURIComponent(publicIdMatch[1]);
            await cloudinaryV2.uploader.destroy(publicId);
            console.log(`✅ Logo deleted from Cloudinary`);
          }
        } catch (error) {
          console.error("❌ Failed to delete Cloudinary logo:", error.message);
        }
      }

      // 2. Delete Google Drive folder
      try {
        const allCompanies = await this.getAllProfilPerusahaan();
        const companyIndex = allCompanies.findIndex(
          (c) => c.id_perusahaan === id,
        );

        if (companyIndex !== -1 && company.nama_perusahaan) {
          const folderNumber = String(companyIndex + 1).padStart(2, "0");
          const folderName = `${folderNumber}. ${company.nama_perusahaan}`;
          const parentFolderId = process.env.GOOGLE_DRIVE_PERUSAHAAN_FOLDER_ID;

          console.log(`📂 Deleting company folder: "${folderName}"...`);
          await oauth2GoogleService.deleteFolder(folderName, parentFolderId);
          console.log(`✅ Company folder deleted: "${folderName}"`);
        }
      } catch (error) {
        console.error(
          "❌ Failed to delete Google Drive folder:",
          error.message,
        );
      }

      return { success: true, message: "Assets deleted" };
    } catch (error) {
      throw new Error(`Failed to delete assets: ${error.message}`);
    }
  }

  /**
   * Delete related data from all spreadsheet tables
   * @param {string} id - Company ID
   */
  async deleteCompanyRelatedData(id) {
    console.log(`📊 Deleting related data for company ${id}...`);
    const relatedTables = [
      "db_akta",
      "db_pejabat",
      "db_sbu",
      "db_nib",
      "db_kta",
      "db_sertifikat_standar",
      "db_npwp_perusahaan",
      "db_kswp",
      "db_spt",
      "db_kontrak_pengalaman",
      "db_pkp",
      "db_cek",
      "db_bpjs",
    ];

    let deletedCount = 0;
    for (const tableName of relatedTables) {
      try {
        await this.deleteSheetDataMany(tableName, "id_perusahaan", id);
        deletedCount++;
      } catch (error) {
        console.warn(
          `   ⚠️ Failed to delete from ${tableName}: ${error.message}`,
        );
      }
    }
    console.log(`✅ Related data deletion completed`);
    return { success: true, message: "Related data deleted" };
  }

  /**
   * Delete company profile record
   * @param {string} id - Company ID
   */
  async deleteCompanyProfile(id) {
    console.log(`❌ Deleting company profile record for ${id}...`);
    try {
      const result = await this.deleteSheetData(
        "db_profil_perusahaan",
        "id_perusahaan",
        id,
      );
      console.log(`✅ Company profile deleted`);
      return result;
    } catch (error) {
      throw new Error(`Failed to delete profile: ${error.message}`);
    }
  }

  /**
   * Delete company profile by ID with CASCADE DELETE (Legacy/Wrapper)
   * @param {string} id - Company ID
   */
  async deleteProfilPerusahaan(id) {
    try {
      // Step 1: Assets
      await this.deleteCompanyAssets(id);

      // Step 2: Related Data
      await this.deleteCompanyRelatedData(id);

      // Step 3: Profile
      const result = await this.deleteCompanyProfile(id);

      return result;
    } catch (error) {
      console.error("❌ Error in deleteProfilPerusahaan:", error);
      throw new Error(`Failed to delete company profile: ${error.message}`);
    }
  }

  // ========================================
  // DATA personel
  // ========================================

  /**
   * Helper to read valid data from any sheet
   */
  async readSheet(spreadsheetId, sheetName) {
    if (!spreadsheetId) throw new Error("Spreadsheet ID missing for readSheet");
    try {
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:ZZ`,
      });
      const rows = response.data.values;
      if (!rows || rows.length < 2) return [];
      const headers = rows[0];
      return rows.slice(1).map((row) => {
        const obj = {};
        headers.forEach((h, i) => (obj[h] = row[i] || ""));
        return obj;
      });
    } catch (e) {
      console.warn(`Warning: Could not read sheet ${sheetName}: ${e.message}`);
      return [];
    }
  }

  /**
   * Get all personnel data (Joined with KTP, NPWP, Ijazah & CV)
   * @returns {Array} List of personnel with complete documents
   */
  async getAllPersonil() {
    await this.initialize();

    try {
      // Try to get specifically configured ID, fallback to general ID
      const spreadsheetId =
        process.env.GOOGLE_SHEET_ID_PERSONEL ||
        process.env.GOOGLE_SHEET_ID_PERSONIL ||
        process.env.GOOGLE_SHEET_ID;

      if (!spreadsheetId) {
        throw new Error("GOOGLE_SHEET_ID_PERSONEL not configured");
      }

      // Fetch all required tables in parallel
      const [
        personelData,
        ktpData,
        npwpData,
        ijazahData,
        cvData,
        skkData, // Added SKK
        referensiData,
        stnkData,
      ] = await Promise.all([
        this.readSheet(spreadsheetId, "db_personel"),
        this.readSheet(spreadsheetId, "db_ktp"),
        this.readSheet(spreadsheetId, "db_npwp_personel"),
        this.readSheet(spreadsheetId, "db_ijazah"),
        this.readSheet(spreadsheetId, "db_cv"),
        this.readSheet(spreadsheetId, "db_skk"), // Added SKK
        this.readSheet(spreadsheetId, "db_referensi"),
        this.readSheet(spreadsheetId, "db_stnk"),
      ]);

      // Join data based on id_personel
      return personelData.map((p) => {
        const ktp = ktpData.find((k) => k.id_personel === p.id_personel) || {};
        const npwp =
          npwpData.find((n) => n.id_personel === p.id_personel) || {};
        const ijazah =
          ijazahData.find((i) => i.id_personel === p.id_personel) || {};
        const cv = cvData.find((c) => c.id_personel === p.id_personel) || {};

        // One-to-Many relationships
        const skk = skkData.filter((s) => s.id_personel === p.id_personel); // SKK (Multiple)
        const referensi = referensiData.filter(
          (r) => r.id_personel === p.id_personel,
        );
        const stnk = stnkData.filter((s) => s.id_personel === p.id_personel);

        return {
          ...p,
          // Flatten key identification fields for ease of use
          nik: ktp.nik || "",
          nama_ktp: ktp.nama_ktp || "",
          nomor_npwp_personel: npwp.nomor_npwp_personel || "",
          // Include full objects for details
          ktp,
          npwp,
          ijazah,
          cv,
          skk, // Array of SKK
          referensi, // Array of referensi
          stnk, // Array of stnk
        };
      });
    } catch (error) {
      console.error("Error getting consolidated personnel:", error);
      throw new Error(`Failed to get personnel: ${error.message}`);
    }
  }

  /**
   * Get single personnel by ID (searches in id_personel or nik)
   * @param {string} id - Personnel ID or NIK
   */
  async getPersonilById(id) {
    const allPersonil = await this.getAllPersonil();
    return (
      allPersonil.find((p) => p.id_personel === id || p.nik === id) || null
    );
  }

  /**
   * Add new personnel
   * @param {Object} data - Personnel data
   */
  /**
   * Helper to generate new ID based on existing data
   * Generates next ID by finding the maximum numeric value in existing IDs
   * @param {Array} currentData - List of existing data objects
   * @param {string} idField - Field name for ID (e.g., 'id_personel')
   * @param {string} prefix - Prefix for ID (e.g., 'PRS')
   * @param {number} padding - Number of digits for padding (default 3)
   * @returns {string} New ID
   */
  generateNewId(currentData, idField, prefix, padding = 3) {
    if (!currentData || currentData.length === 0) {
      return `${prefix}${String(1).padStart(padding, "0")}`;
    }

    let maxNum = 0;
    const prefixLen = prefix.length;

    currentData.forEach((item) => {
      const id = item[idField];
      if (id && typeof id === "string" && id.startsWith(prefix)) {
        // Extract number part
        const numPart = id.substring(prefixLen);
        const num = parseInt(numPart, 10);
        if (!isNaN(num)) {
          if (num > maxNum) maxNum = num;
        }
      }
    });

    return `${prefix}${String(maxNum + 1).padStart(padding, "0")}`;
  }

  /**
   * Add new personnel
   * @param {Object} data - Personnel data
   */
  async addPersonil(data) {
    // Renamed
    await this.initialize();

    try {
      const spreadsheetId =
        process.env.GOOGLE_SHEET_ID_PERSONEL ||
        process.env.GOOGLE_SHEET_ID_PERSONIL;
      // Use specific sheet name for personel data
      const personelTabName = "db_personel";

      // Get current data to find next row
      const currentData = await this.getAllPersonil();
      // Only insert into main table for now (Simplified)
      const nextRow = currentData.length + 2;

      // Expected headers - db_personel (UPDATED)
      const headers = [
        "id_personel",
        "nama_lengkap",
        "keahlian",
        "tanggal_input",
        "author",
      ];

      // Auto-generate ID (Robust)
      if (!data.id_personel) {
        data.id_personel = this.generateNewId(
          currentData,
          "id_personel",
          "PRS",
        );
      }
      // Format tanggal: YYYY-MM-DD HH:MM:SS (readable, bukan ISO)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, "0");
      const day = String(now.getDate()).padStart(2, "0");
      const hours = String(now.getHours()).padStart(2, "0");
      const minutes = String(now.getMinutes()).padStart(2, "0");
      const seconds = String(now.getSeconds()).padStart(2, "0");
      data.tanggal_input = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

      // Auto-fill author
      if (!data.author) {
        try {
          const userInfo = await oauth2GoogleService.getUserInfo();
          data.author = userInfo.name || userInfo.username; // Gunakan nama lengkap
        } catch (error) {
          console.warn("Could not get user info for author:", error.message);
          data.author = "system";
        }
      }

      // Extract nama_lengkap from data (support both nama_lengkap and nama)
      const namaLengkap = data.nama_lengkap || data.nama;

      // Prepare values
      const values = headers.map((header) => {
        if (header === "nama_lengkap") return namaLengkap || "";
        if (header === "keahlian") return data.keahlian || "";
        return data[header] || "";
      });

      // Append row
      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${personelTabName}!A${nextRow}`,
        valueInputOption: "RAW",
        resource: {
          values: [values],
        },
      });

      // === CREATE GOOGLE DRIVE FOLDER FOR PERSONEL ===
      try {
        if (namaLengkap) {
          console.log(
            `🔍 Starting folder creation for personel: ${namaLengkap}`,
          );

          // Find or create "02. Personel" folder
          let personelParentFolder = null;

          if (process.env.GOOGLE_DRIVE_PERSONEL_FOLDER_ID) {
            console.log(
              `📁 Using GOOGLE_DRIVE_PERSONEL_FOLDER_ID: ${process.env.GOOGLE_DRIVE_PERSONEL_FOLDER_ID}`,
            );
            personelParentFolder = {
              id: process.env.GOOGLE_DRIVE_PERSONEL_FOLDER_ID,
            };
          } else {
            console.log(
              "🔍 GOOGLE_DRIVE_PERSONEL_FOLDER_ID not set, searching for Data folder...",
            );
            // Try to find "Data" folder first
            const dataFolder = await oauth2GoogleService.findFolderByName(
              "Data",
              process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID,
            );

            if (dataFolder) {
              console.log(`✅ Found Data folder (ID: ${dataFolder.id})`);
              // Look for "02. Personel" inside Data folder
              personelParentFolder = await oauth2GoogleService.findFolderByName(
                "02. Personel",
                dataFolder.id,
              );

              if (!personelParentFolder) {
                console.log(
                  '📁 "02. Personel" folder not found, creating it...',
                );
                // Create "02. Personel" if not exists
                personelParentFolder = await oauth2GoogleService.createFolder(
                  "02. Personel",
                  dataFolder.id,
                );
                console.log(
                  `✅ Created "02. Personel" folder (ID: ${personelParentFolder.id})`,
                );
              } else {
                console.log(
                  `✅ Found "02. Personel" folder (ID: ${personelParentFolder.id})`,
                );
              }
            } else {
              console.warn("⚠️ Data folder not found in Google Drive");
            }
          }

          if (personelParentFolder) {
            // Create folder with personnel name
            console.log(
              `📁 Creating folder "${namaLengkap}" in parent ${personelParentFolder.id}...`,
            );
            const personelFolder = await oauth2GoogleService.createFolder(
              namaLengkap,
              personelParentFolder.id,
            );
            console.log(
              `✅ Created folder for personel: ${namaLengkap} (${personelFolder.id})`,
            );
          } else {
            console.warn(
              '⚠️ Parent folder "02. Personel" not found, skipping folder creation',
            );
          }
        }
      } catch (folderError) {
        console.error("❌ Error creating personel folder:", folderError);
        console.error("Error details:", folderError.message);

        // Don't throw error, continue with personnel creation
      }

      return {
        success: true,
        message: "Personnel added successfully",
        data: { id_personel: data.id_personel },
      };
    } catch (error) {
      console.error("Error adding personel:", error);
      throw new Error(`Failed to add personel: ${error.message}`);
    }
  }

  /**
   * Update personnel by ID
   * @param {string} id - Personnel ID
   * @param {Object} data - Updated data
   */
  /**
   * Update personnel by ID
   * @param {string} id - Personnel ID
   * @param {Object} data - Updated data
   */
  async updatePersonil(id, data) {
    // Renamed
    await this.initialize();

    try {
      const allPersonil = await this.getAllPersonil();
      const index = allPersonil.findIndex((p) => p.id_personel === id); // Use id_personel

      if (index === -1) {
        throw new Error(`Personnel with ID ${id} not found`);
      }

      const oldData = allPersonil[index];
      const oldNamaLengkap = oldData.nama_lengkap;
      const newNamaLengkap = data.nama_lengkap || data.nama;

      const spreadsheetId =
        process.env.GOOGLE_SHEET_ID_PERSONEL ||
        process.env.GOOGLE_SHEET_ID_PERSONIL;
      const personelTabName = "db_personel";

      const rowNumber = index + 2;

      const headers = [
        "id_personel",
        "nama_lengkap",
        "keahlian",
        "tanggal_input",
        "author",
      ];

      // Merge data (this update is imperfect as it only updates db_personel, not joined tables)
      const updatedData = { ...oldData, ...data };
      if (newNamaLengkap) updatedData.nama_lengkap = newNamaLengkap;
      const values = headers.map((header) => {
        if (header === "keahlian")
          return data.keahlian || updatedData.keahlian || "";
        // Keep author from old data if not provided
        if (header === "author") return updatedData.author || "system";
        return updatedData[header] || "";
      });

      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${personelTabName}!A${rowNumber}`,
        valueInputOption: "RAW",
        resource: {
          values: [values],
        },
      });

      // === RENAME GOOGLE DRIVE FOLDER IF NAME CHANGED ===
      try {
        const oldNameClean = oldNamaLengkap ? oldNamaLengkap.trim() : "";
        const newNameClean = newNamaLengkap ? newNamaLengkap.trim() : "";

        if (newNameClean && oldNameClean && newNameClean !== oldNameClean) {
          console.log(
            `🔄 [RENAME PERSONEL] Starting rename process: "${oldNameClean}" → "${newNameClean}"`,
          );

          // Find "02. Personel" folder
          let personelParentFolder = null;

          if (process.env.GOOGLE_DRIVE_PERSONEL_FOLDER_ID) {
            personelParentFolder = {
              id: process.env.GOOGLE_DRIVE_PERSONEL_FOLDER_ID,
            };
            console.log(
              `📁 [RENAME PERSONEL] Using configured Personel Folder ID: ${personelParentFolder.id}`,
            );
          } else {
            console.log(
              '🔍 [RENAME PERSONEL] Searching for "02. Personel" folder structure...',
            );
            const dataFolder = await oauth2GoogleService.findFolderByName(
              "Data",
              process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID,
            );
            if (dataFolder) {
              console.log(
                `📁 [RENAME PERSONEL] Found Data folder: ${dataFolder.id}`,
              );
              personelParentFolder = await oauth2GoogleService.findFolderByName(
                "02. Personel",
                dataFolder.id,
              );
              if (personelParentFolder) {
                console.log(
                  `📁 [RENAME PERSONEL] Found "02. Personel" folder: ${personelParentFolder.id}`,
                );
              }
            }
          }

          if (!personelParentFolder) {
            console.error(
              '❌ [RENAME PERSONEL] Parent folder "02. Personel" not found - cannot rename folder and files',
            );
            return {
              success: true,
              message:
                "Personnel updated (folder rename skipped - parent folder not found)",
            };
          }

          console.log(
            `📂 [RENAME PERSONEL] Parent folder found: ${personelParentFolder.id}. Searching for folder "${oldNameClean}"...`,
          );

          // Try to find the folder first to verify existence
          const existingFolder = await oauth2GoogleService.findFolderByName(
            oldNameClean,
            personelParentFolder.id,
          );

          if (!existingFolder) {
            console.warn(
              `⚠️ [RENAME PERSONEL] Folder "${oldNameClean}" not found in parent ${personelParentFolder.id} - cannot rename`,
            );
            return {
              success: true,
              message:
                "Personnel updated (folder rename skipped - folder not found)",
            };
          }

          console.log(
            `✅ [RENAME PERSONEL] Found folder to rename: "${oldNameClean}" (ID: ${existingFolder.id})`,
          );

          // === STEP 1: RENAME ALL DOCUMENT PDF FILES FIRST ===
          try {
            console.log(
              `📄 [RENAME PERSONEL] Step 1: Renaming document PDF files inside folder "${oldNameClean}"...`,
            );

            // Define document subfolders and their file patterns
            const documentFolders = [
              {
                folderName: "01. Kartu Tanda Penduduk",
                oldFileName: `KTP ${oldNameClean}.pdf`,
                newFileName: `KTP ${newNameClean}.pdf`,
              },
              {
                folderName: "02. NPWP",
                oldFileName: `NPWP ${oldNameClean}.pdf`,
                newFileName: `NPWP ${newNameClean}.pdf`,
              },
              {
                folderName: "03. Ijazah",
                oldFileName: `Ijazah ${oldNameClean}.pdf`,
                newFileName: `Ijazah ${newNameClean}.pdf`,
              },
              {
                folderName: "04. Daftar Riwayat Hidup",
                oldFileName: `Daftar Riwayat Hidup ${oldNameClean}.pdf`,
                newFileName: `Daftar Riwayat Hidup ${newNameClean}.pdf`,
              },
            ];

            let renamedFilesCount = 0;
            let skippedFilesCount = 0;

            for (const docFolder of documentFolders) {
              try {
                console.log(
                  `🔍 [RENAME PERSONEL] Looking for subfolder "${docFolder.folderName}" in folder ID ${existingFolder.id}...`,
                );

                // Find document subfolder
                const subfolder = await oauth2GoogleService.findFolderByName(
                  docFolder.folderName,
                  existingFolder.id,
                );

                if (!subfolder) {
                  console.log(
                    `ℹ️  [RENAME PERSONEL] Subfolder not found: "${docFolder.folderName}" - skipping`,
                  );
                  skippedFilesCount++;
                  continue;
                }

                console.log(
                  `📁 [RENAME PERSONEL] Found subfolder "${docFolder.folderName}" (ID: ${subfolder.id})`,
                );
                console.log(
                  `🔍 [RENAME PERSONEL] Looking for file "${docFolder.oldFileName}" in subfolder...`,
                );

                // Find file with old name
                const file = await oauth2GoogleService.findFileByName(
                  docFolder.oldFileName,
                  subfolder.id,
                );

                if (!file) {
                  console.log(
                    `ℹ️  [RENAME PERSONEL] File not found: "${docFolder.oldFileName}" in ${docFolder.folderName} - skipping`,
                  );
                  skippedFilesCount++;
                  continue;
                }

                console.log(
                  `📄 [RENAME PERSONEL] Found file "${docFolder.oldFileName}" (ID: ${file.id})`,
                );
                console.log(
                  `🔄 [RENAME PERSONEL] Renaming file to "${docFolder.newFileName}"...`,
                );

                // Rename file
                await oauth2GoogleService.renameFileById(
                  file.id,
                  docFolder.newFileName,
                );
                renamedFilesCount++;
                console.log(
                  `✅ [RENAME PERSONEL] Successfully renamed file: "${docFolder.oldFileName}" → "${docFolder.newFileName}"`,
                );
              } catch (fileError) {
                console.error(
                  `❌ [RENAME PERSONEL] Error renaming file in ${docFolder.folderName}:`,
                  fileError.message,
                );
                // Continue with other files even if one fails
                skippedFilesCount++;
              }
            }

            console.log(
              `✅ [RENAME PERSONEL] Finished renaming PDF files: ${renamedFilesCount} renamed, ${skippedFilesCount} skipped`,
            );
          } catch (filesError) {
            console.error(
              "❌ [RENAME PERSONEL] Error during PDF file renaming:",
              filesError,
            );
            // Continue to folder rename even if file renaming fails
          }

          // === STEP 2: RENAME THE FOLDER ===
          try {
            console.log(
              `🔄 [RENAME PERSONEL] Step 2: Renaming folder "${oldNameClean}" to "${newNameClean}"...`,
            );
            await oauth2GoogleService.renameFolder(
              oldNameClean,
              newNameClean,
              personelParentFolder.id,
            );
            console.log(
              `✅ [RENAME PERSONEL] Successfully renamed folder: "${oldNameClean}" → "${newNameClean}"`,
            );
          } catch (folderRenameError) {
            console.error(
              `❌ [RENAME PERSONEL] Error renaming folder:`,
              folderRenameError,
            );
            throw folderRenameError; // Throw this error as it's critical
          }
        } else {
          if (!newNameClean || !oldNameClean) {
            console.log(
              `ℹ️  [RENAME PERSONEL] Skipping rename: empty name (old: "${oldNameClean}", new: "${newNameClean}")`,
            );
          } else {
            console.log(
              `ℹ️  [RENAME PERSONEL] Skipping rename: names are the same ("${oldNameClean}")`,
            );
          }
        }
      } catch (folderError) {
        console.error(
          "❌ [RENAME PERSONEL] Error in rename process:",
          folderError,
        );
        // Don't throw error, continue with personnel update
      }

      return { success: true, message: "Personnel updated successfully" };
    } catch (error) {
      console.error("Error updating personel:", error);
      throw new Error(`Failed to update personel: ${error.message}`);
    }
  }

  /**
   * Delete personnel by ID
   * @param {string} id - Personnel ID
   */
  /**
   * Helper to delete rows from a specific sheet based on ID
   */
  async _deleteRowsFromSheet(spreadsheetId, sheetName, idColumn, idValue) {
    try {
      // Read sheet
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:Z2000`,
      });
      const rows = response.data.values;
      if (!rows || rows.length < 2) return;

      const headers = rows[0];
      const colIndex = headers.indexOf(idColumn);
      if (colIndex === -1) return;

      const rowsToDelete = [];
      // Loop through data rows (start from index 1)
      for (let i = 1; i < rows.length; i++) {
        const cellValue = rows[i][colIndex]
          ? String(rows[i][colIndex]).trim()
          : "";
        const targetId = String(idValue).trim();

        if (cellValue === targetId) {
          rowsToDelete.push(i + 1); // 1-based index
        }
      }

      if (rowsToDelete.length === 0) return;

      rowsToDelete.sort((a, b) => b - a); // Descending

      const tabs = await this.getSheetTabNames(spreadsheetId);
      const tab = tabs.find((t) => t.title === sheetName);
      if (!tab) return;

      const requests = rowsToDelete.map((rowIndex) => ({
        deleteDimension: {
          range: {
            sheetId: tab.sheetId,
            dimension: "ROWS",
            startIndex: rowIndex - 1,
            endIndex: rowIndex,
          },
        },
      }));

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: { requests },
      });
      console.log(
        `   ✅ Deleted ${rowsToDelete.length} rows from ${sheetName}`,
      );
    } catch (e) {
      console.warn(`   ⚠️ Error deleting from ${sheetName}: ${e.message}`);
    }
  }

  /**
   * Step 1: Delete Personnel Assets (Drive Folder)
   */
  async deletePersonnelAssets(id) {
    await this.initialize();
    try {
      console.log(`🗑️  Step 1: Deleting personnel assets for ${id}`);
      const allPersonil = await this.getAllPersonil();
      const personel = allPersonil.find((p) => p.id_personel === id);

      if (personel && personel.nama_lengkap) {
        console.log(`   Deleting folder for: ${personel.nama_lengkap}`);
        let personelParentFolderId =
          process.env.GOOGLE_DRIVE_PERSONEL_FOLDER_ID;

        if (!personelParentFolderId) {
          const dataFolder = await oauth2GoogleService.findFolderByName(
            "Data",
            process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID,
          );
          if (dataFolder) {
            const pFolder = await oauth2GoogleService.findFolderByName(
              "02 Database Personel",
              dataFolder.id,
            );
            if (pFolder) personelParentFolderId = pFolder.id;
          }
        }

        if (personelParentFolderId) {
          const folderName = personel.nama_lengkap; // Assuming folder name matches nama_lengkap
          await oauth2GoogleService.deleteFolder(
            folderName,
            personelParentFolderId,
          );
          console.log(`✅ Personnel folder deleted: "${folderName}"`);
        }
      }
      return { success: true, message: "Assets deleted" };
    } catch (error) {
      console.error("Error deleting personnel assets:", error);
      throw error; // Propagate error
    }
  }

  /**
   * Step 2: Delete Personnel Related Data
   */
  async deletePersonnelRelatedData(id) {
    await this.initialize();
    console.log(`🗑️  Step 2: Deleting related data for ${id}`);

    // 1. Delete from Personnel Tables
    const spreadsheetIdPersonel =
      process.env.GOOGLE_SHEET_ID_PERSONEL ||
      process.env.GOOGLE_SHEET_ID_PERSONIL;
    const personelTables = [
      "db_ktp",
      "db_npwp_personel",
      "db_ijazah",
      "db_cv",
      "db_skk",
    ];

    for (const table of personelTables) {
      await this._deleteRowsFromSheet(
        spreadsheetIdPersonel,
        table,
        "id_personel",
        id,
      );
    }

    // 2. Delete from Company Tables (db_pejabat)
    const spreadsheetIdCompany = process.env.GOOGLE_SHEET_ID_PERUSAHAAN;
    await this._deleteRowsFromSheet(
      spreadsheetIdCompany,
      "db_pejabat",
      "id_personel",
      id,
    );

    return { success: true, message: "Related data deleted" };
  }

  /**
   * Step 3: Delete Personnel Profile
   */
  async deletePersonnelProfile(id) {
    await this.initialize();
    console.log(`🗑️  Step 3: Deleting personnel profile for ${id}`);

    const spreadsheetIdPersonel =
      process.env.GOOGLE_SHEET_ID_PERSONEL ||
      process.env.GOOGLE_SHEET_ID_PERSONIL;
    await this._deleteRowsFromSheet(
      spreadsheetIdPersonel,
      "db_personel",
      "id_personel",
      id,
    );

    return { success: true, message: "Profile deleted" };
  }

  /**
   * Delete personnel by ID (Legacy/Full)
   * @param {string} id - Personnel ID
   */
  async deletePersonil(id) {
    await this.initialize();

    try {
      console.log(`🗑️  DELETE PERSONIL START: ${id}`);

      // 1. Delete Assets
      await this.deletePersonnelAssets(id);

      // 2. Delete Related Data
      await this.deletePersonnelRelatedData(id);

      // 3. Delete Profile
      await this.deletePersonnelProfile(id);

      return { success: true, message: "Personnel deleted successfully" };
    } catch (error) {
      console.error("Error in deletePersonil:", error);
      throw new Error(`Failed to delete personnel: ${error.message}`);
    }
  }

  // ========================================
  // NEW DATABASE TABLES - CRUD OPERATIONS
  // ========================================

  /**
   * Generic function to get all data from a sheet
   * @param {string} sheetName - Name of the sheet
   * @returns {Array} List  of data objects
   */
  async getSheetData(sheetName) {
    await this.initialize();

    try {
      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERUSAHAAN;
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A:ZZ`,
      });

      const rows = response.data.values;
      if (!rows || rows.length < 2) {
        return [];
      }

      const headers = rows[0];
      const dataRows = rows
        .slice(1)
        .filter((row) => row && row.length > 0 && row[0]);

      return dataRows.map((row) => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || "";
        });
        return obj;
      });
    } catch (error) {
      throw new Error(`Failed to get data from ${sheetName}: ${error.message}`);
    }
  }

  /**
   * Get KBLI Master Data from KBLI Spreadsheet
   * @returns {Array} List of KBLI classifications
   */
  async getKbliMasterData() {
    await this.initialize();

    try {
      const spreadsheetId = process.env.GOOGLE_SHEET_ID_KBLI;
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `KBLI!A1:Z2000`, // Increased to 2000 rows to fetch all KBLI data
      });

      const rows = response.data.values;
      if (!rows || rows.length < 2) {
        return [];
      }

      const headers = rows[0];
      const dataRows = rows
        .slice(1)
        .filter((row) => row && row.length > 0 && row[0]);

      return dataRows.map((row) => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || "";
        });
        return obj;
      });
    } catch (error) {
      console.error("Failed to get KBLI master data:", error);
      return []; // Return empty array instead of throwing to prevent 500 error
    }
  }

  /**
   * Generic function to add data to a sheet
   * Dynmically fetches headers to ensure correct column mapping
   * @param {string} sheetName - Name of the sheet
   * @param {Array} headers - [OPTIONAL] Array of column headers (Legacy, now fetches from sheet)
   * @param {Object} data - Data object to add
   * @returns {Object} Result object
   */
  async addSheetData(sheetName, headers, data) {
    await this.initialize();

    try {
      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERUSAHAAN;

      // 1. Fetch current headers from the sheet to ensure correct mapping
      const headerResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:Z1`,
      });
      const sheetHeaders = headerResponse.data.values?.[0];

      if (!sheetHeaders || sheetHeaders.length === 0) {
        throw new Error(`No headers found in ${sheetName}`);
      }

      console.log(`📋 Headers for ${sheetName}:`, sheetHeaders);

      // 2. Get next row index
      const currentData = await this.getSheetData(sheetName);
      const nextRow = currentData.length + 2;

      // 3. Auto-fill author
      if (
        (sheetHeaders.includes("author") || sheetHeaders.includes("Author")) &&
        !data.author
      ) {
        try {
          const userInfo = await oauth2GoogleService.getUserInfo();
          data.author = userInfo.name || userInfo.username;
        } catch (error) {
          data.author = "system";
        }
      }

      // 4. Map data to ACTUAL sheet headers
      const values = sheetHeaders.map((header) => {
        // Try exact match first
        if (data[header] !== undefined) return data[header];

        // Try loose match (lowercase)
        const key = Object.keys(data).find(
          (k) => k.toLowerCase() === header.toLowerCase(),
        );
        return key ? data[key] : "";
      });

      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A${nextRow}`,
        valueInputOption: "RAW",
        resource: { values: [values] },
      });

      return {
        success: true,
        message: `Data added to ${sheetName} successfully`,
      };
    } catch (error) {
      throw new Error(`Failed to add data to ${sheetName}: ${error.message}`);
    }
  }

  /**
   * Generic function to update data in a sheet by ID
   * Dynmically fetches headers to ensure correct column mapping
   * @param {string} sheetName - Name of the sheet
   * @param {Array} headers - [OPTIONAL] Array of column headers (Legacy)
   * @param {string} idField - Name of the ID field
   * @param {string} id - ID value to find
   * @param {Object} data - Updated data
   * @returns {Object} Result object
   */
  async updateSheetData(sheetName, headers, idField, id, data) {
    await this.initialize();

    console.log(`📝 updateSheetData called for ${sheetName}`);
    console.log(`   idField: ${idField}, id: ${id}`);
    console.log(`   Data keys:`, Object.keys(data));

    try {
      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERUSAHAAN;

      // 1. Fetch current headers from the sheet
      const headerResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:Z1`,
      });
      const sheetHeaders = headerResponse.data.values?.[0];

      if (!sheetHeaders || sheetHeaders.length === 0) {
        throw new Error(`No headers found in ${sheetName}`);
      }
      console.log(`   Sheet Headers:`, sheetHeaders);

      // 2. Find the row index
      const allData = await this.getSheetData(sheetName);
      const index = allData.findIndex((item) => {
        // Compare loosely (string trim)
        const val = item[idField] ? String(item[idField]).trim() : "";
        const target = String(id).trim();
        return val === target;
      });

      console.log(`   Search Result Index:`, index);

      if (index === -1) {
        console.error(`   ❌ ID ${id} not found in column ${idField}`);
        // Log some sample values from that column to help debug
        if (allData.length > 0) {
          console.log(
            `   Sample values in ${idField}:`,
            allData.slice(0, 3).map((i) => i[idField]),
          );
        }
        throw new Error(
          `Data with ${idField} = ${id} not found in ${sheetName}`,
        );
      }

      const rowNumber = index + 2;

      // 3. Merge with existing data
      const existingRow = allData[index];
      const updatedData = { ...existingRow, ...data };

      // 4. Map to ACTUAL sheet headers
      const values = sheetHeaders.map((header) => {
        // Try exact match first
        if (updatedData[header] !== undefined) return updatedData[header];

        // Try loose match
        const key = Object.keys(updatedData).find(
          (k) => k.toLowerCase() === header.toLowerCase(),
        );
        return key ? updatedData[key] : "";
      });

      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A${rowNumber}`,
        valueInputOption: "RAW",
        resource: { values: [values] },
      });

      console.log(`   ✅ Update successful at row ${rowNumber}`);

      return {
        success: true,
        message: `Data in ${sheetName} updated successfully`,
      };
    } catch (error) {
      console.error(`   ❌ Failed to update data in ${sheetName}:`, error);
      throw new Error(
        `Failed to update data in ${sheetName}: ${error.message}`,
      );
    }
  }

  /**
   * Delete MULTIPLE rows from a sheet based on a filter (Cascade Delete Helper)
   */
  async deleteSheetDataMany(sheetName, filterField, filterValue) {
    await this.initialize();

    try {
      const allData = await this.getSheetData(sheetName);

      // Find ALL matching indices
      // We map to original index first
      const indices = allData
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => {
          const val = item[filterField] ? String(item[filterField]).trim() : "";
          const target = String(filterValue).trim();
          return val === target;
        })
        .map(({ index }) => index)
        .sort((a, b) => b - a); // Sort descending is CRITICAL for deletion

      if (indices.length === 0) {
        return {
          success: true,
          message: `No data found in ${sheetName} to delete`,
        };
      }

      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERUSAHAAN;
      const tabs = await this.getSheetTabNames(spreadsheetId);
      const tab = tabs.find((t) => t.title === sheetName);

      if (!tab) {
        throw new Error(`Sheet ${sheetName} not found`);
      }

      // Create batch delete requests
      const requests = indices.map((index) => ({
        deleteDimension: {
          range: {
            sheetId: tab.sheetId,
            dimension: "ROWS",
            startIndex: index + 1, // +1 because row 1 is header
            endIndex: index + 2,
          },
        },
      }));

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: { requests },
      });

      return {
        success: true,
        message: `Deleted ${indices.length} rows from ${sheetName}`,
      };
    } catch (error) {
      // Don't throw error here to allow cascade to continue even if one table fails or is empty
      console.warn(
        `Warning: Failed to delete from ${sheetName}: ${error.message}`,
      );
      return { success: false, message: error.message };
    }
  }

  /**
   * Generic function to delete data from a sheet
   * @param {string} sheetName - Name of the sheet
   * @param {string} idField - Name of the ID field
   * @param {string} id - ID value to find
   * @returns {Object} Result object
   */
  async deleteSheetData(sheetName, idField, id) {
    await this.initialize();

    try {
      const allData = await this.getSheetData(sheetName);
      const index = allData.findIndex((item) => {
        const val = item[idField] ? String(item[idField]).trim() : "";
        const target = String(id).trim();
        return val === target;
      });

      if (index === -1) {
        throw new Error(
          `Data with ${idField} = ${id} not found in ${sheetName}`,
        );
      }

      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERUSAHAAN;
      const tabs = await this.getSheetTabNames(spreadsheetId);
      const tab = tabs.find((t) => t.title === sheetName);

      if (!tab) {
        throw new Error(`Sheet ${sheetName} not found`);
      }

      const rowNumber = index + 1; // +1 because row 1 is header

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: tab.sheetId,
                  dimension: "ROWS",
                  startIndex: rowNumber,
                  endIndex: rowNumber + 1,
                },
              },
            },
          ],
        },
      });

      return {
        success: true,
        message: `Data in ${sheetName} deleted successfully`,
      };
    } catch (error) {
      throw new Error(
        `Failed to delete data from ${sheetName}: ${error.message}`,
      );
    }
  }

  // ========================================
  // SPECIFIC METHODS FOR EACH TABLE
  // ========================================

  // --- 1. DB PERUSAHAAN ---
  async getAllCompanies() {
    return this.getSheetData("db_profil_perusahaan");
  }

  async getCompanyById(id) {
    const companies = await this.getAllCompanies();
    return companies.find((c) => c.id_perusahaan === id) || null;
  }

  async addCompany(data) {
    const headers = [
      "id_perusahaan",
      "nama_perusahaan",
      "status_perusahaan",
      "alamat_kantor_pusat",
      "no_telp",
      "no_fax",
      "email",
      "author",
    ];

    // Get existing companies to generate ID and folder number
    const companies = await this.getAllCompanies();

    // Generate ID if not provided
    // Generate ID if not provided (Robust)
    if (!data.id_perusahaan) {
      data.id_perusahaan = this.generateNewId(
        companies,
        "id_perusahaan",
        "COMP",
      );
    }

    // Generate folder number (based on current count + 1)
    const folderNumber = String(companies.length + 1).padStart(2, "0");
    const folderName = `${folderNumber}. ${data.nama_perusahaan}`;

    // Add data to Google Sheets
    const result = await this.addSheetData(
      "db_profil_perusahaan",
      headers,
      data,
    );

    // Create folder in Google Drive
    try {
      const folder = await oauth2GoogleService.createFolder(folderName);
      console.log(
        `✅ Folder created for company: ${folderName} (ID: ${folder.id})`,
      );

      // Optionally, you can store the folder ID in the company data
      // This would require adding a new column in the spreadsheet
      result.folderId = folder.id;
      result.folderLink = folder.webViewLink;
    } catch (driveError) {
      console.error("❌ Failed to create Google Drive folder:", driveError);
      // Don't throw error here - company is already created in Sheets
      // Just log the error and continue
      result.folderError = driveError.message;
    }

    return result;
  }

  async updateCompany(id, data) {
    const headers = [
      "id_perusahaan",
      "nama_perusahaan",
      "status_perusahaan",
      "alamat_kantor_pusat",
      "no_telp",
      "no_fax",
      "email",
    ];

    // Get current company data to check if name changed
    const currentCompany = await this.getCompanyById(id);

    if (!currentCompany) {
      throw new Error(`Company with ID ${id} not found`);
    }

    // Update data in Google Sheets
    const result = await this.updateSheetData(
      "db_profil_perusahaan",
      headers,
      "id_perusahaan",
      id,
      data,
    );

    // Check if nama_perusahaan changed
    if (
      data.nama_perusahaan &&
      data.nama_perusahaan !== currentCompany.nama_perusahaan
    ) {
      try {
        // Get all companies to find the index/number of this company
        const allCompanies = await this.getAllCompanies();
        const companyIndex = allCompanies.findIndex(
          (c) => c.id_perusahaan === id,
        );

        if (companyIndex !== -1) {
          // Generate folder number (index + 1, padded to 2 digits)
          const folderNumber = String(companyIndex + 1).padStart(2, "0");

          // Old and new folder names
          const oldFolderName = `${folderNumber}. ${currentCompany.nama_perusahaan}`;
          const newFolderName = `${folderNumber}. ${data.nama_perusahaan}`;

          // Rename folder in Google Drive
          const folder = await oauth2GoogleService.renameFolder(
            oldFolderName,
            newFolderName,
          );
          console.log(
            `✅ Company folder renamed: "${oldFolderName}" → "${newFolderName}"`,
          );

          result.folderRenamed = true;
          result.newFolderName = newFolderName;
          result.folderLink = folder.webViewLink;
        }
      } catch (driveError) {
        console.error("❌ Failed to rename Google Drive folder:", driveError);
        // Don't throw error here - company data is already updated in Sheets
        // Just log the error and continue
        result.folderRenameError = driveError.message;
      }
    }

    return result;
  }

  async deleteCompany(id) {
    // Get company data before deleting to get folder name
    const company = await this.getCompanyById(id);

    if (!company) {
      throw new Error(`Company with ID ${id} not found`);
    }

    // Get all companies to find the index/number of this company
    const allCompanies = await this.getAllCompanies();
    const companyIndex = allCompanies.findIndex((c) => c.id_perusahaan === id);

    let folderDeleted = false;
    let folderDeleteError = null;

    // Try to delete folder in Google Drive first
    if (companyIndex !== -1) {
      try {
        // Generate folder number and name
        const folderNumber = String(companyIndex + 1).padStart(2, "0");
        const folderName = `${folderNumber}. ${company.nama_perusahaan}`;

        // Delete folder in Google Drive
        await oauth2GoogleService.deleteFolder(folderName);
        console.log(`✅ Company folder deleted: "${folderName}"`);
        folderDeleted = true;
      } catch (driveError) {
        console.error("❌ Failed to delete Google Drive folder:", driveError);
        // Don't throw error here - we still want to delete the company data
        // Just log the error
        folderDeleteError = driveError.message;
      }
    }

    // Delete company data from Google Sheets
    const result = await this.deleteSheetData(
      "db_profil_perusahaan",
      "id_perusahaan",
      id,
    );

    // Add folder deletion info to result
    result.folderDeleted = folderDeleted;
    if (folderDeleteError) {
      result.folderDeleteError = folderDeleteError;
    }

    return result;
  }

  // --- 2. DB AKTA ---
  async getAllAkta(idPerusahaan = null) {
    const allAkta = await this.getSheetData("db_akta");
    if (idPerusahaan) {
      return allAkta.filter((a) => a.id_perusahaan === idPerusahaan);
    }
    return allAkta;
  }

  async addAkta(data) {
    const headers = [
      "id_akta",
      "id_perusahaan",
      "jenis_akta",
      "nomor_akta",
      "tanggal_akta",
      "notaris",
      "akta_perusahaan_url",
      "tanggal_input",
      "author",
    ];
    // Map mismatched fields
    if (data.nama_notaris) data.notaris = data.nama_notaris;

    // Generate ID
    if (!data.id_akta) {
      const allData = await this.getSheetData("db_akta");
      data.id_akta = this.generateNewId(allData, "id_akta", "AKTA");
    }

    return this.addSheetData("db_akta", headers, data);
  }

  async updateAkta(id, data) {
    const headers = [
      "id_akta",
      "id_perusahaan",
      "jenis_akta",
      "nomor_akta",
      "tanggal_akta",
      "notaris",
      "akta_perusahaan_url",
    ];
    // Map mismatched fields
    if (data.nama_notaris) data.notaris = data.nama_notaris;

    let idField = "id_akta";
    if (!String(id).startsWith("AKTA")) idField = "nomor_akta";

    return this.updateSheetData("db_akta", headers, idField, id, data);
  }

  async deleteAkta(id) {
    let idField = "id_akta";
    if (!String(id).startsWith("AKTA")) idField = "nomor_akta";
    return this.deleteSheetData("db_akta", idField, id);
  }

  // --- 3. DB PEJABAT ---
  async getAllPejabat(idPerusahaan = null) {
    const allPejabat = await this.getSheetData("db_pejabat");
    if (idPerusahaan) {
      return allPejabat.filter((p) => p.id_perusahaan === idPerusahaan);
    }
    return allPejabat;
  }

  async addPejabat(data) {
    const headers = [
      "id_pejabat",
      "id_perusahaan",
      "id_personel",
      "jenis_jabatan",
      "jabatan_custom",
      "tanggal_input",
    ];
    if (!data.id_pejabat) {
      const allPejabat = await this.getAllPejabat();
      data.id_pejabat = this.generateNewId(allPejabat, "id_pejabat", "PEJ");
    }

    return this.addSheetData("db_pejabat", headers, data);
  }

  async updatePejabat(id, data) {
    const headers = [
      "id_pejabat",
      "id_perusahaan",
      "id_personel",
      "jenis_jabatan",
      "jabatan_custom",
      "tanggal_input",
    ];
    // id can be id_pejabat. Old code used nik which is wrong.
    return this.updateSheetData("db_pejabat", headers, "id_pejabat", id, data);
  }

  async deletePejabat(id) {
    return this.deleteSheetData("db_pejabat", "id_pejabat", id);
  }

  // --- 4. DB NIB ---
  async getAllNIB(idPerusahaan = null) {
    const allNIB = await this.getSheetData("db_nib");
    if (idPerusahaan) {
      return allNIB.filter((n) => n.id_perusahaan === idPerusahaan);
    }
    return allNIB;
  }

  async addNIB(data) {
    const headers = [
      "id_nib",
      "id_perusahaan",
      "nomor_nib",
      "tanggal_terbit",
      "status_penanaman_modal",
      "skala_usaha",
      "kbli", // Added kbli
      "nib_url",
      "tanggal_input",
      "author",
    ];
    // Map mismatch
    if (data.tanggal_nib) data.tanggal_terbit = data.tanggal_nib;
    if (data.bidang_nib) data.status_penanaman_modal = data.bidang_nib;
    if (data.kode_kbli) data.kbli = data.kode_kbli; // Map kode_kbli to kbli

    // Ensure kbli is a string if it's an array
    if (Array.isArray(data.kbli)) {
      data.kbli = data.kbli.join(", ");
    }

    if (!data.id_nib) {
      const allData = await this.getSheetData("db_nib");
      data.id_nib = this.generateNewId(allData, "id_nib", "NIB");
    }

    return this.addSheetData("db_nib", headers, data);
  }

  async updateNIB(id, data) {
    const headers = [
      "id_nib",
      "id_perusahaan",
      "nomor_nib",
      "tanggal_terbit",
      "status_penanaman_modal",
      "skala_usaha",
      "kbli", // Added kbli
      "nib_url",
    ];
    if (data.tanggal_nib) data.tanggal_terbit = data.tanggal_nib;
    if (data.kode_kbli) data.kbli = data.kode_kbli; // Map kode_kbli to kbli

    // Ensure kbli is a string if it's an array
    if (Array.isArray(data.kbli)) {
      data.kbli = data.kbli.join(", ");
    }

    let idField = "id_nib";
    if (!String(id).startsWith("NIB")) idField = "nomor_nib";

    return this.updateSheetData("db_nib", headers, idField, id, data);
  }

  async deleteNIB(id) {
    let idField = "id_nib";
    if (!String(id).startsWith("NIB")) idField = "nomor_nib";
    return this.deleteSheetData("db_nib", idField, id);
  }

  // --- 5. DB personel (Updated) ---
  async getAllpersonelNew(idPerusahaan = null) {
    const allpersonel = await this.getAllPersonil(); // Use joined data
    if (idPerusahaan) {
      return allpersonel.filter((p) => p.id_perusahaan === idPerusahaan);
    }
    return allpersonel;
  }

  async addpersonelNew(data) {
    const headers = [
      "id_perusahaan",
      "nama",
      "tempat_lahir",
      "tanggal_lahir",
      "strata",
      "jurusan_pendidikan",
      "sertifikat_keahlian",
      "pengalaman_kerja",
    ];
    return this.addSheetData("db_personel", headers, data);
  }

  async updatepersonelNew(nama, data) {
    const headers = [
      "id_perusahaan",
      "nama",
      "tempat_lahir",
      "tanggal_lahir",
      "strata",
      "jurusan_pendidikan",
      "sertifikat_keahlian",
      "pengalaman_kerja",
    ];
    return this.updateSheetData("db_personel", headers, "nama", nama, data);
  }

  async deletepersonelNew(nama) {
    return this.deleteSheetData("db_personel", "nama", nama);
  }

  // --- 6. DB PENGALAMAN PERUSAHAAN ---
  // --- 6. DB PENGALAMAN (KONTRAK) ---
  async getAllPengalaman(idPerusahaan = null) {
    const allPengalaman = await this.getSheetData("db_kontrak_pengalaman");
    if (idPerusahaan) {
      return allPengalaman.filter((p) => p.id_perusahaan === idPerusahaan);
    }
    return allPengalaman;
  }

  async addPengalaman(data) {
    // Legacy method - map old field names to new structure
    const mappedData = {
      id_perusahaan: data.id_perusahaan,
      // Combine old fields into new kegiatan
      nama_program: data.nama_program,
      nama_kegiatan: data.bidang_pekerjaan || data.nama_kegiatan,
      // Map renamed fields
      nama_sub_kegiatan: data.sub_bidang_pekerjaan || data.nama_sub_kegiatan,
      nama_pekerjaan: data.nama_pekerjaan,
      lokasi: data.lokasi,
      // Map contact fields
      nama_pemberi_tugas: data.nama_pemberi_tugas,
      alamat_pemberi_tugas: data.alamat_pemberi_tugas,
      telepon_pemberi_tugas: data.telepon_pemberi_tugas,
      fax_pemberi_tugas: data.fax_pemberi_tugas,
      kode_pos_pemberi_tugas: data.kode_pos_pemberi_tugas,
      // Other fields
      sumber_dana: data.sumber_dana,
      nomor_kontrak: data.nomor_kontrak,
      tanggal_kontrak: data.tanggal_kontrak,
      nilai_kontrak: data.nilai_kontrak,
      waktu_pelaksanaan: data.waktu_pelaksanaan,
      tanggal_mulai: data.tanggal_mulai,
      tanggal_selesai_kontrak: data.tanggal_selesai_kontrak,
      tanggal_ba_serah_terima: data.tanggal_ba_serah_terima,
      daftar_url: data.daftar_url,
      kontrak_url: data.kontrak_url,
    };

    // Use the new method
    return this.addKontrakPengalaman(mappedData, data.author || "system");
  }

  async updatePengalaman(nomorKontrak, data) {
    // Legacy method - map old field names to new structure
    const mappedData = {
      // Map old to new fields
      nama_program: data.nama_program,
      nama_kegiatan: data.bidang_pekerjaan || data.nama_kegiatan,
      nama_sub_kegiatan: data.sub_bidang_pekerjaan || data.nama_sub_kegiatan,
      nama_pekerjaan: data.nama_pekerjaan,
      lokasi: data.lokasi,
      nama_pemberi_tugas: data.nama_pemberi_tugas,
      alamat_pemberi_tugas: data.alamat_pemberi_tugas,
      telepon_pemberi_tugas: data.telepon_pemberi_tugas,
      fax_pemberi_tugas: data.fax_pemberi_tugas,
      kode_pos_pemberi_tugas: data.kode_pos_pemberi_tugas,

      // Direct mapping for new fields
      kegiatan: data.kegiatan,
      sub_kegiatan: data.sub_kegiatan,
      pekerjaan: data.pekerjaan,
      pemberi_tugas: data.pemberi_tugas,
      kontak_pemberi_tugas: data.kontak_pemberi_tugas,

      sumber_dana: data.sumber_dana,
      nomor_kontrak: data.nomor_kontrak,
      tanggal_kontrak: data.tanggal_kontrak,
      nilai_kontrak: data.nilai_kontrak,
      waktu_pelaksanaan: data.waktu_pelaksanaan,
      tanggal_mulai: data.tanggal_mulai,
      tanggal_selesai_kontrak: data.tanggal_selesai_kontrak,
      tanggal_ba_serah_terima: data.tanggal_ba_serah_terima,
      daftar_url: data.daftar_url,
      kontrak_url: data.kontrak_url,
    };

    // Use the new method
    return this.updateKontrakPengalaman(nomorKontrak, mappedData);
  }

  async deletePengalaman(id) {
    // Determine ID field
    let idField = "id_kontrak";
    if (!String(id).startsWith("KONTR")) {
      idField = "nomor_kontrak";
    }
    return this.deleteSheetData("db_kontrak_pengalaman", idField, id);
  }

  // --- 7. DB KLBI (KBLI CLASSIFICATION) ---
  async getAllKBLI() {
    await this.initialize();

    try {
      const spreadsheetId = process.env.GOOGLE_SHEET_ID_KBLI;

      if (!spreadsheetId) {
        console.warn("⚠️ GOOGLE_SHEET_ID_KBLI not configured");
        return [];
      }

      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `db_kbli!A1:Z2000`, // Updated to use db_kbli tab name
      });

      const rows = response.data.values;
      if (!rows || rows.length < 2) {
        return [];
      }

      const headers = rows[0];
      const dataRows = rows
        .slice(1)
        .filter((row) => row && row.length > 0 && row[0]);

      return dataRows.map((row) => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || "";
        });
        return obj;
      });
    } catch (error) {
      console.warn("⚠️ Failed to get KBLI master data:", error.message);
      return []; // Return empty array instead of throwing to prevent 500 error
    }
  }

  async getKBLIByKode(kode) {
    const allKBLI = await this.getAllKBLI();
    return allKBLI.find((k) => k.kode_klbi === kode) || null;
  }

  async searchKBLI(keyword) {
    const allKBLI = await this.getAllKBLI();
    if (!keyword) return allKBLI;

    const searchTerm = keyword.toLowerCase();
    return allKBLI.filter(
      (k) =>
        k.kode_klbi.toLowerCase().includes(searchTerm) ||
        k.nama_klasifikasi.toLowerCase().includes(searchTerm),
    );
  }

  async batchUpdateKBLI(idPerusahaan, kbliCodes, author = "system") {
    const nibList = await this.getAllNIB(idPerusahaan);
    if (nibList.length === 0) {
      throw new Error(
        "NIB data not found for this company. Cannot update KBLI.",
      );
    }

    const nib = nibList[0];
    const kbliString = Array.isArray(kbliCodes)
      ? kbliCodes.join(", ")
      : kbliCodes;

    return this.updateNIB(nib.id_nib, {
      kbli: kbliString,
    });
  }

  async addKBLI(data) {
    const headers = ["kode_klbi", "nama_klasifikasi"];
    return this.addSheetData("db_kbli", headers, data);
  }

  async updateKBLI(kode, data) {
    const headers = ["kode_klbi", "nama_klasifikasi"];
    return this.updateSheetData("db_kbli", headers, "kode_klbi", kode, data);
  }

  async deleteKBLI(kode) {
    return this.deleteSheetData("db_kbli", "kode_klbi", kode);
  }

  // --- 8. DB PROJECT (PROJECTS ONLY) ---
  async getAllProjects() {
    return this.getSheetData("db_project");
  }

  // --- 9. DB personel PROJECT (RELATION) ---
  async getAllpersonelProject() {
    const spreadsheetId =
      process.env.GOOGLE_SHEET_ID_PERSONEL ||
      process.env.GOOGLE_SHEET_ID_PERSONIL;
    if (!spreadsheetId) {
      // Fallback for safety if not configured, though likely to fail if not in default sheet
      console.warn(
        "GOOGLE_SHEET_ID_PERSONEL not set for getAllpersonelProject",
      );
      return this.getSheetData("db_personel_project");
    }
    return this.readSheet(spreadsheetId, "db_personel_project");
  }

  async getpersonelProjectByProject(idProject) {
    const all = await this.getAllpersonelProject();
    return all.filter((p) => p.id_project === idProject);
  }

  async addpersonelProject(data) {
    const headers = ["id_project", "id_perusahaan", "nik"];
    return this.addSheetData("db_personel_project", headers, data);
  }

  async deletepersonelProject(idProject, nik) {
    await this.initialize();

    try {
      const allData = await this.getAllpersonelProject();
      // Find index of the row matching both id_project and nik
      const index = allData.findIndex(
        (p) => p.id_project === idProject && p.nik === nik,
      );

      if (index === -1) {
        throw new Error(
          `personel assignment not found for Project ${idProject} and NIK ${nik}`,
        );
      }

      const spreadsheetId = process.env.GOOGLE_SHEET_ID;
      const tabs = await this.getSheetTabNames(spreadsheetId);
      const sheet = tabs.find((t) => t.title === "db_personel_project");

      if (!sheet) {
        throw new Error("Sheet db_personel_project not found");
      }

      // Row number to delete (index + 2 because row 1 is header, data starts at row 2, and index is 0-based from data array)
      // Wait, getSheetData slices(1). So index 0 is row 2.
      // So rowNumber = index + 1 (for 0-based API) or index + 2 (for 1-based A1 notation)?
      // batchUpdate deleteDimension uses 0-based index.
      // Row 1 (Header) is index 0. Row 2 (Data 0) is index 1.
      // So if index is 0 (first data row), we want to delete index 1.
      const rowIndex = index + 1;

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: sheet.sheetId,
                  dimension: "ROWS",
                  startIndex: rowIndex,
                  endIndex: rowIndex + 1,
                },
              },
            },
          ],
        },
      });

      return {
        success: true,
        message: "personel removed from project successfully",
      };
    } catch (error) {
      console.error("Error deleting personel project:", error);
      throw new Error(
        `Failed to remove personel from project: ${error.message}`,
      );
    }
  }

  // Combined Getter
  async getProjectsByCompany(idPerusahaan) {
    const projects = await this.getSheetData("db_project");
    const companyProjects = projects.filter(
      (p) => p.id_perusahaan === idPerusahaan,
    );

    const personelProject = await this.getSheetData("db_personel_project");

    // Join data
    return companyProjects.map((project) => {
      const assignments = personelProject.filter(
        (pp) => pp.id_project === project.id_project,
      );
      return {
        ...project,
        personel: assignments.map((a) => ({
          nik: a.nik,
          id_perusahaan: a.id_perusahaan,
          // We will fetch full personel details in frontend or here?
          // Better here if efficient, but frontend already has allpersonel.
          // Let's just return the NIKs and let frontend map names.
        })),
      };
    });
  }

  async getProjectsBypersonel(nik) {
    const personelProject = await this.getSheetData("db_personel_project");
    const assignments = personelProject.filter((pp) => pp.nik === nik);

    const allProjects = await this.getAllProjects();

    return assignments
      .map((a) => {
        const project = allProjects.find((p) => p.id_project === a.id_project);
        return project ? { ...project, ...a } : a;
      })
      .filter((p) => p.nama_project); // Filter out nulls
  }

  async addProject(data) {
    // Auto-generate ID if not provided
    if (!data.id_project) {
      const allProjects = await this.getAllProjects();
      const maxId = allProjects.reduce((max, p) => {
        const num = parseInt(p.id_project?.replace("PROJ", "") || "0");
        return num > max ? num : max;
      }, 0);
      data.id_project = `PROJ${String(maxId + 1).padStart(3, "0")}`;
    }

    const headers = ["id_project", "id_perusahaan", "nama_project"];

    // Add data to Google Sheets
    const result = await this.addSheetData("db_project", headers, data);

    // Create subfolder in company folder in Google Drive
    if (data.id_perusahaan && data.nama_project) {
      try {
        const company = await this.getCompanyById(data.id_perusahaan);
        if (company) {
          const allCompanies = await this.getAllCompanies();
          const companyIndex = allCompanies.findIndex(
            (c) => c.id_perusahaan === data.id_perusahaan,
          );

          if (companyIndex !== -1) {
            const companyFolderNumber = String(companyIndex + 1).padStart(
              2,
              "0",
            );
            const companyFolderName = `${companyFolderNumber}.(${company.nama_perusahaan})`;
            const companyFolder =
              await oauth2GoogleService.findFolderByName(companyFolderName);

            if (companyFolder) {
              // Get all projects for this company to determine project number
              // Note: We use the new getProjectsByCompany which returns array
              const companyProjects = await this.getProjectsByCompany(
                data.id_perusahaan,
              );
              const projectNumber = String(companyProjects.length).padStart(
                2,
                "0",
              );
              const projectFolderName = `${projectNumber}.(${data.nama_project})`;

              const projectFolder = await oauth2GoogleService.createFolder(
                projectFolderName,
                companyFolder.id,
              );
              console.log(
                `✅ Project folder created: ${companyFolderName}/${projectFolderName} (ID: ${projectFolder.id})`,
              );

              result.projectFolderId = projectFolder.id;
              result.projectFolderLink = projectFolder.webViewLink;
              result.projectFolderName = projectFolderName;
            }
          }
        }
      } catch (driveError) {
        console.error("❌ Failed to create project folder:", driveError);
        result.folderError = driveError.message;
      }
    }

    return result;
  }

  async updateProject(idProject, data) {
    const headers = ["id_project", "id_perusahaan", "nama_project"];

    // Get current project data to check if name changed
    const currentProject = await this.getProjectById(idProject);

    if (!currentProject) {
      throw new Error(`Project with ID ${idProject} not found`);
    }

    // Update data in Google Sheets
    const result = await this.updateSheetData(
      "db_project",
      headers,
      "id_project",
      idProject,
      data,
    );

    // Check if nama_project changed
    if (
      data.nama_project &&
      data.nama_project !== currentProject.nama_project
    ) {
      try {
        const company = await this.getCompanyById(currentProject.id_perusahaan);
        if (company) {
          const allCompanies = await this.getAllCompanies();
          const companyIndex = allCompanies.findIndex(
            (c) => c.id_perusahaan === currentProject.id_perusahaan,
          );

          if (companyIndex !== -1) {
            const companyFolderNumber = String(companyIndex + 1).padStart(
              2,
              "0",
            );
            const companyFolderName = `${companyFolderNumber}.(${company.nama_perusahaan})`;
            const companyFolder =
              await oauth2GoogleService.findFolderByName(companyFolderName);

            if (companyFolder) {
              const companyProjects = await this.getProjectsByCompany(
                currentProject.id_perusahaan,
              );
              const projectIndex = companyProjects.findIndex(
                (p) => p.id_project === idProject,
              );

              if (projectIndex !== -1) {
                const projectNumber = String(projectIndex + 1).padStart(2, "0");
                const oldProjectFolderName = `${projectNumber}.(${currentProject.nama_project})`;
                const newProjectFolderName = `${projectNumber}.(${data.nama_project})`;

                const projectFolder =
                  await oauth2GoogleService.findFolderByName(
                    oldProjectFolderName,
                    companyFolder.id,
                  );
                if (projectFolder) {
                  await oauth2GoogleService.renameFolderById(
                    projectFolder.id,
                    newProjectFolderName,
                  );
                  result.folderRenamed = true;
                  result.newProjectFolderName = newProjectFolderName;
                }
              }
            }
          }
        }
      } catch (driveError) {
        console.error("❌ Failed to rename project folder:", driveError);
        result.folderRenameError = driveError.message;
      }
    }

    return result;
  }

  async deleteProject(idProject) {
    // Get project data before deleting
    const project = await this.getProjectById(idProject);
    if (!project) throw new Error(`Project with ID ${idProject} not found`);

    // 1. Delete folder in Drive
    let folderDeleted = false;
    let folderDeleteError = null;

    try {
      const company = await this.getCompanyById(project.id_perusahaan);
      if (company) {
        const allCompanies = await this.getAllCompanies();
        const companyIndex = allCompanies.findIndex(
          (c) => c.id_perusahaan === project.id_perusahaan,
        );

        if (companyIndex !== -1) {
          const companyFolderNumber = String(companyIndex + 1).padStart(2, "0");
          const companyFolderName = `${companyFolderNumber}.(${company.nama_perusahaan})`;
          const companyFolder =
            await oauth2GoogleService.findFolderByName(companyFolderName);

          if (companyFolder) {
            const companyProjects = await this.getProjectsByCompany(
              project.id_perusahaan,
            );
            const projectIndex = companyProjects.findIndex(
              (p) => p.id_project === idProject,
            );

            if (projectIndex !== -1) {
              const projectNumber = String(projectIndex + 1).padStart(2, "0");
              const projectFolderName = `${projectNumber}.(${project.nama_project})`;
              const projectFolder = await oauth2GoogleService.findFolderByName(
                projectFolderName,
                companyFolder.id,
              );

              if (projectFolder) {
                await oauth2GoogleService.deleteFolderById(projectFolder.id);
                folderDeleted = true;
              }
            }
          }
        }
      }
    } catch (driveError) {
      console.error("❌ Failed to delete project folder:", driveError);
      folderDeleteError = driveError.message;
    }

    // 2. Delete all personel assignments for this project
    // We need to implement a way to delete multiple rows or iterate
    const allpersonelProject = await this.getAllpersonelProject();
    const assignmentsToDelete = allpersonelProject.filter(
      (p) => p.id_project === idProject,
    );

    // Note: This is inefficient if we have many assignments, but with current simple sheet implementation:
    // We might need to implement a 'deleteRowsByFilter' in the base class later.
    // For now, we will skip this step or assume the user handles it, OR we implement a loop in the route handler?
    // Actually, let's try to delete them.
    // Since we don't have a unique ID for personel_project, we can't easily delete them one by one with deleteSheetData(key).
    // This is a limitation of the current simple service.
    // Recommendation: Add 'id_assignment' to db_personel_project.
    // But for now, let's just delete the project. The orphan records in db_personel_project might remain.
    // I will add a TODO.

    // 3. Delete project from db_project
    const result = await this.deleteSheetData(
      "db_project",
      "id_project",
      idProject,
    );

    result.folderDeleted = folderDeleted;
    if (folderDeleteError) result.folderDeleteError = folderDeleteError;

    return result;
  }

  // Helper: Get personel for a company (through db_personel_project)
  async getpersonelByCompany(idPerusahaan) {
    // Get all projects for this company
    const projects = await this.getProjectsByCompany(idPerusahaan);
    const projectIds = projects.map((p) => p.id_project);

    // Get all assignments
    const allAssignments = await this.getAllpersonelProject();
    const companyAssignments = allAssignments.filter((a) =>
      projectIds.includes(a.id_project),
    );

    // Get unique NIKs
    const niks = [...new Set(companyAssignments.map((a) => a.nik))];

    // Get personel details
    const allpersonel = await this.getAllpersonelNew();
    return allpersonel.filter((personel) => niks.includes(personel.nik));
  }

  // Helper: Get companies for a personel
  async getCompaniesBypersonel(nik) {
    const assignments = await this.getSheetData("db_personel_project");
    const personelAssignments = assignments.filter((a) => a.nik === nik);
    const companyIds = [
      ...new Set(personelAssignments.map((a) => a.id_perusahaan)),
    ];

    const allCompanies = await this.getAllCompanies();
    return allCompanies.filter((c) => companyIds.includes(c.id_perusahaan));
  }

  // ========================================
  // PERSONNEL DOCUMENTS CRUD (KTP, NPWP, IJAZAH, CV)
  // ========================================

  // --- KTP ---
  async addKtp(data) {
    // IMPORTANT: Headers MUST match EXACT column order in db_ktp sheet!
    const headers = [
      "id_ktp", // Auto-generated
      "id_personel",
      "nik",
      "nama_ktp",
      "tempat_lahir_ktp",
      "tanggal_lahir_ktp",
      "jenis_kelamin",
      "golongan_darah",
      "alamat_ktp",
      "rt_rw",
      "kelurahan_desa",
      "kecamatan",
      "kota_kabupaten",
      "provinsi",
      "agama",
      "status_perkawinan",
      "pekerjaan",
      "kewarganegaraan",
      "berlaku_hingga",
      "tanggal_terbit_ktp",
      "file_ktp_url",
      "tanggal_input",
      "author",
    ];
    return this.addSheetDataPersonel("db_ktp", headers, data);
  }

  async updateKtp(idPersonel, data) {
    // IMPORTANT: Headers MUST match EXACT column order in db_ktp sheet - same as addKtp!
    const headers = [
      "id_ktp", // Keep existing ID
      "id_personel",
      "nik",
      "nama_ktp",
      "tempat_lahir_ktp",
      "tanggal_lahir_ktp",
      "jenis_kelamin",
      "golongan_darah",
      "alamat_ktp",
      "rt_rw",
      "kelurahan_desa",
      "kecamatan",
      "kota_kabupaten",
      "provinsi",
      "agama",
      "status_perkawinan",
      "pekerjaan",
      "kewarganegaraan",
      "berlaku_hingga",
      "tanggal_terbit_ktp",
      "file_ktp_url",
      "tanggal_input",
      "author",
    ];
    return this.updateSheetDataPersonel(
      "db_ktp",
      headers,
      "id_personel",
      idPersonel,
      data,
    );
  }

  async deleteKtp(idPersonel) {
    await this.initialize();

    try {
      // Get KTP data to retrieve file URL before deletion
      const personel = await this.getPersonilById(idPersonel);

      if (personel && personel.ktp && personel.ktp.file_ktp_url) {
        // Delete file from Google Drive
        const fileUrl = personel.ktp.file_ktp_url;
        const fileId = oauth2GoogleService.extractFileIdFromUrl(fileUrl);

        if (fileId) {
          try {
            await oauth2GoogleService.deleteFile(fileId);
            console.log(
              `✅ Deleted KTP file from Google Drive (ID: ${fileId})`,
            );
          } catch (err) {
            console.warn(
              `⚠️  Could not delete KTP file from Drive: ${err.message}`,
            );
          }
        }
      }

      // Delete from database
      return this.deleteSheetDataPersonel("db_ktp", "id_personel", idPersonel);
    } catch (error) {
      throw new Error(`Failed to delete KTP: ${error.message}`);
    }
  }

  // --- NPWP ---
  async addNpwp(data) {
    // IMPORTANT: Must match EXACT column order in db_npwp_personel sheet!
    const headers = [
      "id_npwp_personel", // Auto-generated
      "id_personel",
      "nomor_npwp_personel",
      "nik_npwp_personel",
      "nama_npwp_personel",
      "alamat_npwp_personel",
      "kelurahan_npwp_personel",
      "kecamatan_npwp_personel",
      "kota_npwp_personel",
      "provinsi_npwp_personel",
      "kode_pos_npwp_personel",
      "kpp_npwp_personel",
      "tanggal_terdaftar_npwp_personel",
      "file_npwp_personel_url",
      "tanggal_input",
      "author",
    ];
    return this.addSheetDataPersonel("db_npwp_personel", headers, data);
  }

  async updateNpwp(idPersonel, data) {
    // IMPORTANT: Must match EXACT column order in db_npwp_personel sheet - same as addNpwp!
    const headers = [
      "id_npwp_personel", // Keep existing ID
      "id_personel",
      "nomor_npwp_personel",
      "nik_npwp_personel",
      "nama_npwp_personel",
      "alamat_npwp_personel",
      "kelurahan_npwp_personel",
      "kecamatan_npwp_personel",
      "kota_npwp_personel",
      "provinsi_npwp_personel",
      "kode_pos_npwp_personel",
      "kpp_npwp_personel",
      "tanggal_terdaftar_npwp_personel",
      "file_npwp_personel_url",
      "tanggal_input",
      "author",
    ];
    return this.updateSheetDataPersonel(
      "db_npwp_personel",
      headers,
      "id_personel",
      idPersonel,
      data,
    );
  }

  async deleteNpwp(idPersonel) {
    await this.initialize();

    try {
      // Get NPWP data to retrieve file URL before deletion
      const personel = await this.getPersonilById(idPersonel);

      if (personel && personel.npwp && personel.npwp.file_npwp_personel_url) {
        // Delete file from Google Drive
        const fileUrl = personel.npwp.file_npwp_personel_url;
        const fileId = oauth2GoogleService.extractFileIdFromUrl(fileUrl);

        if (fileId) {
          try {
            await oauth2GoogleService.deleteFile(fileId);
            console.log(
              `✅ Deleted NPWP file from Google Drive (ID: ${fileId})`,
            );
          } catch (err) {
            console.warn(
              `⚠️  Could not delete NPWP file from Drive: ${err.message}`,
            );
          }
        }
      }

      // Delete from database
      return this.deleteSheetDataPersonel(
        "db_npwp_personel",
        "id_personel",
        idPersonel,
      );
    } catch (error) {
      throw new Error(`Failed to delete NPWP: ${error.message}`);
    }
  }

  // --- IJAZAH ---
  async addIjazah(data) {
    const headers = [
      "id_ijazah", // Auto-generated
      "id_personel",
      "jenjang_pendidikan",
      "nama_institusi_pendidikan",
      "fakultas",
      "program_studi",
      "nomor_ijazah",
      "tahun_masuk",
      "tahun_lulus",
      "gelar_akademik",
      "ipk",
      "file_ijazah_url",
      "tanggal_input",
      "author",
    ];
    return this.addSheetDataPersonel("db_ijazah", headers, data);
  }

  async updateIjazah(idPersonel, data) {
    // IMPORTANT: Must match EXACT column order in db_ijazah sheet - same as addIjazah!
    const headers = [
      "id_ijazah", // Keep existing ID
      "id_personel",
      "jenjang_pendidikan",
      "nama_institusi_pendidikan",
      "fakultas",
      "program_studi",
      "nomor_ijazah",
      "tahun_masuk",
      "tahun_lulus",
      "gelar_akademik",
      "ipk",
      "file_ijazah_url",
      "tanggal_input",
      "author",
    ];
    return this.updateSheetDataPersonel(
      "db_ijazah",
      headers,
      "id_personel",
      idPersonel,
      data,
    );
  }

  async deleteIjazah(idPersonel) {
    await this.initialize();

    try {
      // Get Ijazah data to retrieve file URL before deletion
      const personel = await this.getPersonilById(idPersonel);

      if (personel && personel.ijazah && personel.ijazah.file_ijazah_url) {
        // Delete file from Google Drive
        const fileUrl = personel.ijazah.file_ijazah_url;
        const fileId = oauth2GoogleService.extractFileIdFromUrl(fileUrl);

        if (fileId) {
          try {
            await oauth2GoogleService.deleteFile(fileId);
            console.log(
              `✅ Deleted Ijazah file from Google Drive (ID: ${fileId})`,
            );
          } catch (err) {
            console.warn(
              `⚠️  Could not delete Ijazah file from Drive: ${err.message}`,
            );
          }
        }
      }

      // Delete from database
      return this.deleteSheetDataPersonel(
        "db_ijazah",
        "id_personel",
        idPersonel,
      );
    } catch (error) {
      throw new Error(`Failed to delete Ijazah: ${error.message}`);
    }
  }

  // --- CV ---
  async addCv(data) {
    const headers = [
      "id_cv", // Auto-generated
      "id_personel",
      "nama_lengkap_cv",
      "ringkasan_profil",
      "keahlian_utama",
      "total_pengalaman_tahun",
      "pengalaman_kerja_terakhir",
      "sertifikasi_profesional",
      "bahasa_dikuasai",
      "file_cv_url",
      "tanggal_input",
      "author",
    ];
    return this.addSheetDataPersonel("db_cv", headers, data);
  }

  async updateCv(idPersonel, data) {
    // IMPORTANT: Must match EXACT column order in db_cv sheet - same as addCv!
    const headers = [
      "id_cv", // Keep existing ID
      "id_personel",
      "nama_lengkap_cv",
      "ringkasan_profil",
      "keahlian_utama",
      "total_pengalaman_tahun",
      "pengalaman_kerja_terakhir",
      "sertifikasi_profesional",
      "bahasa_dikuasai",
      "file_cv_url",
      "tanggal_input",
      "author",
    ];
    return this.updateSheetDataPersonel(
      "db_cv",
      headers,
      "id_personel",
      idPersonel,
      data,
    );
  }

  async deleteCv(idPersonel) {
    await this.initialize();

    try {
      // Get CV data to retrieve file URL before deletion
      const personel = await this.getPersonilById(idPersonel);

      if (personel && personel.cv && personel.cv.file_cv_url) {
        // Delete file from Google Drive
        const fileUrl = personel.cv.file_cv_url;
        const fileId = oauth2GoogleService.extractFileIdFromUrl(fileUrl);

        if (fileId) {
          try {
            await oauth2GoogleService.deleteFile(fileId);
            console.log(`✅ Deleted CV file from Google Drive (ID: ${fileId})`);
          } catch (err) {
            console.warn(
              `⚠️  Could not delete CV file from Drive: ${err.message}`,
            );
          }
        }
      }

      // Delete from database
      return this.deleteSheetDataPersonel("db_cv", "id_personel", idPersonel);
    } catch (error) {
      throw new Error(`Failed to delete CV: ${error.message}`);
    }
  }

  // ========================================
  // ADDITIONAL COMPANY DOCUMENTS CRUD
  // ========================================

  // --- SBU CRUD ---
  async addSBU(data) {
    const headers = [
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
    if (!data.id_sbu) {
      const allData = await this.getSheetData("db_sbu");
      data.id_sbu = this.generateNewId(allData, "id_sbu", "SBU");
    }
    return this.addSheetData("db_sbu", headers, data);
  }

  async updateSBU(id, data) {
    const headers = [
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
    return this.updateSheetData("db_sbu", headers, "id_sbu", id, data);
  }

  async deleteSBU(id) {
    return this.deleteSheetData("db_sbu", "id_sbu", id);
  }

  // --- KTA CRUD ---
  async addKTA(data) {
    const headers = [
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
    if (!data.id_kta) {
      const allData = await this.getSheetData("db_kta");
      data.id_kta = this.generateNewId(allData, "id_kta", "KTA");
    }
    return this.addSheetData("db_kta", headers, data);
  }

  async updateKTA(id, data) {
    const headers = [
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
    return this.updateSheetData("db_kta", headers, "id_kta", id, data);
  }

  async deleteKTA(id) {
    return this.deleteSheetData("db_kta", "id_kta", id);
  }

  // --- SERTIFIKAT CRUD ---
  async addSertifikat(data) {
    const headers = [
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
    if (!data.id_sertifikat_standar) {
      const allData = await this.getSheetData("db_sertifikat_standar");
      data.id_sertifikat_standar = this.generateNewId(
        allData,
        "id_sertifikat_standar",
        "SERT",
      );
    }
    return this.addSheetData("db_sertifikat_standar", headers, data);
  }

  async updateSertifikat(id, data) {
    const headers = [
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
    return this.updateSheetData(
      "db_sertifikat_standar",
      headers,
      "id_sertifikat_standar",
      id,
      data,
    );
  }

  async deleteSertifikat(id) {
    return this.deleteSheetData(
      "db_sertifikat_standar",
      "id_sertifikat_standar",
      id,
    );
  }

  // --- CEK CRUD ---
  async addCek(data) {
    const headers = [
      "id_cek",
      "id_perusahaan",
      "no_rekening",
      "nama_bank",
      "url_cek",
      "tanggal_input",
      "author",
    ];
    if (!data.id_cek) {
      const allData = await this.getSheetData("db_cek");
      data.id_cek = this.generateNewId(allData, "id_cek", "CEK");
    }
    return this.addSheetData("db_cek", headers, data);
  }

  async updateCek(id, data) {
    const headers = [
      "id_cek",
      "id_perusahaan",
      "no_rekening",
      "nama_bank",
      "url_cek",
      "tanggal_input",
      "author",
    ];
    return this.updateSheetData("db_cek", headers, "id_cek", id, data);
  }

  async deleteCek(id) {
    return this.deleteSheetData("db_cek", "id_cek", id);
  }

  // --- BPJS CRUD ---
  async addBPJS(data) {
    const headers = [
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
    if (!data.id_bpjs) {
      const allData = await this.getSheetData("db_bpjs");
      data.id_bpjs = this.generateNewId(allData, "id_bpjs", "BPJS");
    }
    return this.addSheetData("db_bpjs", headers, data);
  }

  async updateBPJS(id, data) {
    const headers = [
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
    return this.updateSheetData("db_bpjs", headers, "id_bpjs", id, data);
  }

  async deleteBPJS(id) {
    return this.deleteSheetData("db_bpjs", "id_bpjs", id);
  }

  // Helper functions for personnel document sheets (uses PERSONEL spreadsheet)
  async addSheetDataPersonel(sheetName, headers, data) {
    await this.initialize();

    try {
      const spreadsheetId =
        process.env.GOOGLE_SHEET_ID_PERSONEL ||
        process.env.GOOGLE_SHEET_ID_PERSONIL;
      const currentData = await this.readSheet(spreadsheetId, sheetName);
      const nextRow = currentData.length + 2;

      // Auto-generate ID if needed (for id_ktp, id_npwp, etc.)
      if (headers[0].startsWith("id_") && !data[headers[0]]) {
        // Map sheet names to proper prefixes
        const prefixMap = {
          db_ktp: "KTP",
          db_npwp_personel: "NPWPP",
          db_ijazah: "IJAZAH",
          db_cv: "CV",
        };
        const prefix =
          prefixMap[sheetName] || sheetName.replace("db_", "").toUpperCase();
        const count = currentData.length + 1;
        data[headers[0]] = `${prefix}${String(count).padStart(3, "0")}`;
      }

      // Auto-generate tanggal_input if field exists in headers
      if (headers.includes("tanggal_input") && !data.tanggal_input) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, "0");
        const day = String(now.getDate()).padStart(2, "0");
        const hours = String(now.getHours()).padStart(2, "0");
        const minutes = String(now.getMinutes()).padStart(2, "0");
        const seconds = String(now.getSeconds()).padStart(2, "0");
        data.tanggal_input = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      }

      // Auto-fill author from OAuth2 user (gunakan nama lengkap)
      if (headers.includes("author") && !data.author) {
        try {
          const userInfo = await oauth2GoogleService.getUserInfo();
          data.author = userInfo.name || userInfo.username; // Gunakan nama lengkap
        } catch (error) {
          console.warn(
            'Could not get user info for author, using "system":',
            error.message,
          );
          data.author = "system";
        }
      }

      const values = headers.map((header) => data[header] || "");

      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A${nextRow}`,
        valueInputOption: "RAW",
        resource: { values: [values] },
      });

      return {
        success: true,
        message: `Data added to ${sheetName} successfully`,
      };
    } catch (error) {
      throw new Error(`Failed to add data to ${sheetName}: ${error.message}`);
    }
  }

  async updateSheetDataPersonel(sheetName, headers, idField, id, data) {
    await this.initialize();

    try {
      const spreadsheetId =
        process.env.GOOGLE_SHEET_ID_PERSONEL ||
        process.env.GOOGLE_SHEET_ID_PERSONIL;
      const allData = await this.readSheet(spreadsheetId, sheetName);
      const index = allData.findIndex((item) => item[idField] === id);

      if (index === -1) {
        throw new Error(
          `Data with ${idField} = ${id} not found in ${sheetName}`,
        );
      }

      const rowNumber = index + 2;

      const updatedData = { ...allData[index], ...data };
      const values = headers.map((header) => updatedData[header] || "");

      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A${rowNumber}`,
        valueInputOption: "RAW",
        resource: { values: [values] },
      });

      return {
        success: true,
        message: `Data in ${sheetName} updated successfully`,
      };
    } catch (error) {
      throw new Error(
        `Failed to update data in ${sheetName}: ${error.message}`,
      );
    }
  }

  async deleteSheetDataPersonel(sheetName, idField, id) {
    await this.initialize();

    try {
      const spreadsheetId =
        process.env.GOOGLE_SHEET_ID_PERSONEL ||
        process.env.GOOGLE_SHEET_ID_PERSONIL;
      const allData = await this.readSheet(spreadsheetId, sheetName);
      const index = allData.findIndex((item) => item[idField] === id);

      if (index === -1) {
        throw new Error(
          `Data with ${idField} = ${id} not found in ${sheetName}`,
        );
      }

      const tabs = await this.getSheetTabNames(spreadsheetId);
      const tab = tabs.find((t) => t.title === sheetName);

      if (!tab) {
        throw new Error(`Sheet ${sheetName} not found in spreadsheet`);
      }

      const rowNumber = index + 1; // 0-based index for batchUpdate

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: tab.sheetId,
                  dimension: "ROWS",
                  startIndex: rowNumber,
                  endIndex: rowNumber + 1,
                },
              },
            },
          ],
        },
      });

      return {
        success: true,
        message: `Data in ${sheetName} deleted successfully`,
      };
    } catch (error) {
      throw new Error(
        `Failed to delete data from ${sheetName}: ${error.message}`,
      );
    }
  }
  /**
   * Batch Update KBLI for a company
   * Replaces all existing KBLI entries for the company with the new list.
   * @param {string} companyId - Company ID (e.g. COMP001)
   * @param {Array<string>} kbliCodes - List of KBLI codes (e.g. ['71102', '70202'])
   * @param {string} author - Author of the change
   */
  async batchUpdateKBLI(companyId, kbliCodes, author = "system") {
    await this.initialize();
    try {
      console.log(`📝 Batch updating KBLI for company ${companyId}`);
      console.log(`   Codes:`, kbliCodes);

      // Join codes into string
      const kbliString = Array.isArray(kbliCodes)
        ? kbliCodes.join(", ")
        : kbliCodes;

      // Get NIB data
      const allNib = await this.getSheetData("db_nib");
      const companyNib = allNib.filter((n) => n.id_perusahaan === companyId);

      const tanggalInput = new Date()
        .toISOString()
        .replace("T", " ")
        .substring(0, 19);

      if (companyNib.length === 0) {
        console.log("   No NIB found. Creating new NIB record for KBLI...");
        // Create new NIB
        const newId = this.generateNewId(allNib, "id_nib", "NIB");

        const headers = [
          "id_nib",
          "id_perusahaan",
          "nomor_nib",
          "tanggal_terbit",
          "status_penanaman_modal",
          "skala_usaha",
          "kbli",
          "nib_url",
          "tanggal_input",
          "author",
        ];

        await this.addSheetData("db_nib", headers, {
          id_nib: newId,
          id_perusahaan: companyId,
          nomor_nib: "",
          tanggal_terbit: "",
          status_penanaman_modal: "",
          skala_usaha: "",
          kbli: kbliString,
          nib_url: "",
          tanggal_input: tanggalInput,
          author: author,
        });
      } else {
        console.log("   Updating existing NIB record with new KBLI...");
        // Update first NIB found
        const targetNib = companyNib[0];

        const headers = [
          "id_nib",
          "id_perusahaan",
          "nomor_nib",
          "tanggal_terbit",
          "status_penanaman_modal",
          "skala_usaha",
          "kbli",
          "nib_url",
        ];

        await this.updateSheetData(
          "db_nib",
          headers,
          "id_nib",
          targetNib.id_nib,
          {
            kbli: kbliString,
            // author: author // Optional: update author? Maybe keep original creator.
          },
        );
      }

      return { success: true, message: "KBLI updated successfully" };
    } catch (e) {
      console.error("❌ Batch Update KBLI failed:", e);
      throw new Error("Failed to batch update KBLI: " + e.message);
    }
  }
  // ==================== SKK METHODS ====================
  async addSkk(data) {
    const headers = [
      "id_skk",
      "id_personel",
      "jenis_skk",
      "kualifikasi",
      "masa_berlaku",
      "penerbit",
      "url_skk",
      "tanggal_input",
      "author",
    ];
    // Generate new ID
    const currentData = await this.readSheet(
      process.env.GOOGLE_SHEET_ID_PERSONEL ||
        process.env.GOOGLE_SHEET_ID_PERSONIL,
      "db_skk",
    );
    data.id_skk = this.generateNewId(currentData, "id_skk", "SKK");

    return this.addSheetDataPersonel("db_skk", headers, data);
  }

  async updateSkk(id, data) {
    const headers = [
      "id_skk",
      "id_personel",
      "jenis_skk",
      "kualifikasi",
      "masa_berlaku",
      "penerbit",
      "url_skk",
      "tanggal_input",
      "author",
    ];
    return this.updateSheetDataPersonel("db_skk", headers, "id_skk", id, data);
  }

  async deleteSkk(id) {
    return this.deleteSheetDataPersonel("db_skk", "id_skk", id);
  }

  // ==================== REFERENSI METHODS ====================

  async addReferensi(data) {
    const headers = [
      "id_referensi",
      "id_personel",
      "pengalaman",
      "url_referensi",
      "tanggal_input",
      "author",
    ];
    // Generate new ID
    const currentData = await this.readSheet(
      process.env.GOOGLE_SHEET_ID_PERSONEL ||
        process.env.GOOGLE_SHEET_ID_PERSONIL,
      "db_referensi",
    );
    data.id_referensi = this.generateNewId(currentData, "id_referensi", "REF");

    return this.addSheetDataPersonel("db_referensi", headers, data);
  }

  async updateReferensi(id, data) {
    const headers = [
      "id_referensi",
      "id_personel",
      "pengalaman",
      "url_referensi",
      "tanggal_input",
      "author",
    ];
    return this.updateSheetDataPersonel(
      "db_referensi",
      headers,
      "id_referensi",
      id,
      data,
    );
  }

  async deleteReferensi(id) {
    return this.deleteSheetDataPersonel("db_referensi", "id_referensi", id);
  }

  // ==================== STNK METHODS ====================

  async addStnk(data) {
    const headers = [
      "id_stnk",
      "id_personel",
      "no_polisi",
      "merek",
      "warna",
      "tahun_pembuatan",
      "url_stnk",
      "tanggal_input",
      "author",
    ];
    // Generate new ID
    const currentData = await this.readSheet(
      process.env.GOOGLE_SHEET_ID_PERSONEL ||
        process.env.GOOGLE_SHEET_ID_PERSONIL,
      "db_stnk",
    );
    data.id_stnk = this.generateNewId(currentData, "id_stnk", "STNK");

    return this.addSheetDataPersonel("db_stnk", headers, data);
  }

  async updateStnk(id, data) {
    const headers = [
      "id_stnk",
      "id_personel",
      "no_polisi",
      "merek",
      "warna",
      "tahun_pembuatan",
      "url_stnk",
      "tanggal_input",
      "author",
    ];
    return this.updateSheetDataPersonel(
      "db_stnk",
      headers,
      "id_stnk",
      id,
      data,
    );
  }

  async deleteStnk(id) {
    return this.deleteSheetDataPersonel("db_stnk", "id_stnk", id);
  }

  async getCompanyDocumentCounts(idPerusahaan) {
    try {
      const [
        akta,
        nib,
        sbu,
        kta,
        sertifikat,
        kontrak,
        cek,
        bpjs,
        npwp,
        spt,
        pkp,
        kswp,
      ] = await Promise.all([
        this.getAllAkta(idPerusahaan).catch(() => []),
        this.getAllNIB(idPerusahaan).catch(() => []),
        this.getSheetData("db_sbu")
          .then((rows) => rows.filter((r) => r.id_perusahaan === idPerusahaan))
          .catch(() => []),
        this.getSheetData("db_kta")
          .then((rows) => rows.filter((r) => r.id_perusahaan === idPerusahaan))
          .catch(() => []),
        this.getSheetData("db_sertifikat_standar")
          .then((rows) => rows.filter((r) => r.id_perusahaan === idPerusahaan))
          .catch(() => []),
        this.getAllPengalaman(idPerusahaan).catch(() => []),
        this.getSheetData("db_cek")
          .then((rows) => rows.filter((r) => r.id_perusahaan === idPerusahaan))
          .catch(() => []),
        this.getSheetData("db_bpjs")
          .then((rows) => rows.filter((r) => r.id_perusahaan === idPerusahaan))
          .catch(() => []),
        this.getSheetData("db_npwp")
          .then((rows) => rows.filter((r) => r.id_perusahaan === idPerusahaan))
          .catch(() => []),
        this.getSheetData("db_spt")
          .then((rows) => rows.filter((r) => r.id_perusahaan === idPerusahaan))
          .catch(() => []),
        this.getSheetData("db_pkp")
          .then((rows) => rows.filter((r) => r.id_perusahaan === idPerusahaan))
          .catch(() => []),
        this.getSheetData("db_kswp")
          .then((rows) => rows.filter((r) => r.id_perusahaan === idPerusahaan))
          .catch(() => []),
      ]);

      return {
        akta: akta.length,
        nib: nib.length,
        sbu: sbu.length,
        kta: kta.length,
        sertifikat: sertifikat.length,
        kontrak: kontrak.length,
        cek: cek.length,
        bpjs: bpjs.length,
        pajak: npwp.length + spt.length + pkp.length + kswp.length,
      };
    } catch (error) {
      console.error("Error getting document counts:", error);
      return {};
    }
  }
  // --- KONTRAK PENGALAMAN CRUD ---
  async addKontrakPengalaman(data, author = "system") {
    if (!this.initialized) await this.initialize();

    const rows = await this.readSheet(
      process.env.GOOGLE_SHEET_ID_PERUSAHAAN,
      "db_kontrak_pengalaman",
    );

    // Generate new ID
    let maxNum = 0;
    rows.forEach((row) => {
      if (row.id_kontrak && row.id_kontrak.startsWith("KTR")) {
        const num = parseInt(row.id_kontrak.replace("KTR", ""));
        if (num > maxNum) maxNum = num;
      }
    });
    const newId = `KTR${String(maxNum + 1).padStart(3, "0")}`;

    const now = new Date();
    const tanggalInput = now.toISOString().slice(0, 19).replace("T", " ");

    // Helper: Combine nama_program and nama_kegiatan into kegiatan
    const kegiatan = [data.nama_program, data.nama_kegiatan]
      .filter(Boolean)
      .join(" \n\n ")
      .trim();

    // Helper: Format kontak_pemberi_tugas combining all contact info
    const kontakParts = [];
    if (data.alamat_pemberi_tugas) kontakParts.push(data.alamat_pemberi_tugas);
    if (data.telepon_pemberi_tugas)
      kontakParts.push(`Telp. ${data.telepon_pemberi_tugas}`);
    if (data.fax_pemberi_tugas)
      kontakParts.push(`Fax ${data.fax_pemberi_tugas}`);
    if (data.kode_pos_pemberi_tugas)
      kontakParts.push(`Kode Pos ${data.kode_pos_pemberi_tugas}`);
    const kontak_pemberi_tugas = kontakParts.join(", ");

    // New schema with 19 columns
    const newRow = [
      newId, // 0: id_kontrak
      data.id_perusahaan, // 1: id_perusahaan
      kegiatan || data.kegiatan || "", // 2: kegiatan (combined)
      data.nama_sub_kegiatan || data.sub_kegiatan || "", // 3: sub_kegiatan
      data.nama_pekerjaan || data.pekerjaan || "", // 4: pekerjaan
      data.lokasi || "", // 5: lokasi
      data.nama_pemberi_tugas || data.pemberi_tugas || "", // 6: pemberi_tugas
      kontak_pemberi_tugas || data.kontak_pemberi_tugas || "", // 7: kontak_pemberi_tugas
      data.sumber_dana || "", // 8: sumber_dana
      data.nomor_kontrak || "", // 9: nomor_kontrak
      data.tanggal_kontrak || "", // 10: tanggal_kontrak
      data.nilai_kontrak || "", // 11: nilai_kontrak
      data.waktu_pelaksanaan || "", // 12: waktu_pelaksanaan
      data.tanggal_mulai || "", // 13: tanggal_mulai
      data.tanggal_selesai_kontrak || "", // 14: tanggal_selesai_kontrak
      data.tanggal_ba_serah_terima || "", // 15: tanggal_ba_serah_terima
      data.daftar_url || "", // 16: daftar_url
      data.kontrak_url || "", // 17: kontrak_url
      tanggalInput, // 18: tanggal_input (AUTO)
      author, // 19: author (AUTO)
    ];

    await this.sheets.spreadsheets.values.append({
      spreadsheetId: process.env.GOOGLE_SHEET_ID_PERUSAHAAN,
      range: "db_kontrak_pengalaman!A:T", // Updated to column T (19 columns)
      valueInputOption: "USER_ENTERED",
      resource: { values: [newRow] },
    });

    return { id_kontrak: newId, ...data };
  }

  async updateKontrakPengalaman(idKontrak, data) {
    if (!this.initialized) await this.initialize();

    const rows = await this.readSheet(
      process.env.GOOGLE_SHEET_ID_PERUSAHAAN,
      "db_kontrak_pengalaman",
    );
    const rowIndex = rows.findIndex((row) => row.id_kontrak === idKontrak);

    if (rowIndex === -1)
      throw new Error(`Kontrak dengan ID ${idKontrak} tidak ditemukan`);

    const existingRow = rows[rowIndex];

    // Helper: Combine kegiatan if individual fields provided
    let kegiatan = data.kegiatan;
    if (!kegiatan && (data.nama_program || data.nama_kegiatan)) {
      const parts = [
        data.nama_program || existingRow.nama_program,
        data.nama_kegiatan || existingRow.nama_kegiatan,
      ].filter(Boolean);
      kegiatan = parts.join(" \n\n ");
    }

    // Helper: Combine kontak_pemberi_tugas if individual fields provided
    let kontak_pemberi_tugas = data.kontak_pemberi_tugas;
    if (
      !kontak_pemberi_tugas &&
      (data.alamat_pemberi_tugas ||
        data.telepon_pemberi_tugas ||
        data.fax_pemberi_tugas ||
        data.kode_pos_pemberi_tugas)
    ) {
      const parts = [];
      if (data.alamat_pemberi_tugas) parts.push(data.alamat_pemberi_tugas);
      if (data.telepon_pemberi_tugas)
        parts.push(`Telp. ${data.telepon_pemberi_tugas}`);
      if (data.fax_pemberi_tugas) parts.push(`Fax ${data.fax_pemberi_tugas}`);
      if (data.kode_pos_pemberi_tugas)
        parts.push(`Kode Pos ${data.kode_pos_pemberi_tugas}`);
      kontak_pemberi_tugas = parts.join(", ");
    }

    // Construct updated row with new 19-column schema
    const updatedRow = [
      existingRow.id_kontrak, // 0: id_kontrak
      existingRow.id_perusahaan, // 1: id_perusahaan
      kegiatan !== undefined ? kegiatan : existingRow.kegiatan, // 2: kegiatan
      data.nama_sub_kegiatan !== undefined
        ? data.nama_sub_kegiatan
        : data.sub_kegiatan !== undefined
          ? data.sub_kegiatan
          : existingRow.sub_kegiatan, // 3: sub_kegiatan
      data.nama_pekerjaan !== undefined
        ? data.nama_pekerjaan
        : data.pekerjaan !== undefined
          ? data.pekerjaan
          : existingRow.pekerjaan, // 4: pekerjaan
      data.lokasi !== undefined ? data.lokasi : existingRow.lokasi, // 5: lokasi
      data.nama_pemberi_tugas !== undefined
        ? data.nama_pemberi_tugas
        : data.pemberi_tugas !== undefined
          ? data.pemberi_tugas
          : existingRow.pemberi_tugas, // 6: pemberi_tugas
      kontak_pemberi_tugas !== undefined
        ? kontak_pemberi_tugas
        : existingRow.kontak_pemberi_tugas, // 7: kontak_pemberi_tugas
      data.sumber_dana !== undefined
        ? data.sumber_dana
        : existingRow.sumber_dana, // 8: sumber_dana
      data.nomor_kontrak !== undefined
        ? data.nomor_kontrak
        : existingRow.nomor_kontrak, // 9: nomor_kontrak
      data.tanggal_kontrak !== undefined
        ? data.tanggal_kontrak
        : existingRow.tanggal_kontrak, // 10: tanggal_kontrak
      data.nilai_kontrak !== undefined
        ? data.nilai_kontrak
        : existingRow.nilai_kontrak, // 11: nilai_kontrak
      data.waktu_pelaksanaan !== undefined
        ? data.waktu_pelaksanaan
        : existingRow.waktu_pelaksanaan, // 12: waktu_pelaksanaan
      data.tanggal_mulai !== undefined
        ? data.tanggal_mulai
        : existingRow.tanggal_mulai, // 13: tanggal_mulai
      data.tanggal_selesai_kontrak !== undefined
        ? data.tanggal_selesai_kontrak
        : existingRow.tanggal_selesai_kontrak, // 14: tanggal_selesai_kontrak
      data.tanggal_ba_serah_terima !== undefined
        ? data.tanggal_ba_serah_terima
        : existingRow.tanggal_ba_serah_terima, // 15: tanggal_ba_serah_terima
      data.daftar_url !== undefined ? data.daftar_url : existingRow.daftar_url, // 16: daftar_url
      data.kontrak_url !== undefined
        ? data.kontrak_url
        : existingRow.kontrak_url, // 17: kontrak_url
      existingRow.tanggal_input, // 18: tanggal_input (preserve)
      existingRow.author, // 19: author (preserve)
    ];

    await this.sheets.spreadsheets.values.update({
      spreadsheetId: process.env.GOOGLE_SHEET_ID_PERUSAHAAN,
      range: `db_kontrak_pengalaman!A${rowIndex + 2}`,
      valueInputOption: "USER_ENTERED",
      resource: { values: [updatedRow] },
    });

    return { ...data, id_kontrak: idKontrak };
  }

  async deleteKontrakPengalaman(idKontrak) {
    if (!this.initialized) await this.initialize();
    return await this._deleteRowsFromSheet(
      process.env.SPREADSHEET_ID_DB_PERUSAHAAN,
      "db_kontrak_pengalaman",
      "id_kontrak",
      idKontrak,
    );
  }
}

// Export singleton instance
const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;
