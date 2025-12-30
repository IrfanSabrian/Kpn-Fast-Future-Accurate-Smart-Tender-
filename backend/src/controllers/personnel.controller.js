/**
 * Personnel Controller
 *
 * Handles HTTP requests untuk personnel/tenaga ahli management
 */

import googleSheetsService from "../services/googleSheets.service.js";

export const getAllPersonnel = async (req, res) => {
  try {
    const personnel = await googleSheetsService.getAllPersonil();

    res.json({
      success: true,
      message: "Personnel list retrieved successfully",
      data: personnel,
      count: personnel.length,
    });
  } catch (error) {
    console.error("Error in getAllPersonnel:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get personnel list",
      data: null,
    });
  }
};

export const getPersonnelById = async (req, res) => {
  try {
    const { id } = req.params;
    const personel = await googleSheetsService.getPersonilById(id);

    if (!personel) {
      return res.status(404).json({
        success: false,
        message: `Personnel with ID ${id} not found`,
        data: null,
      });
    }

    res.json({
      success: true,
      message: "Personnel retrieved successfully",
      data: personel,
    });
  } catch (error) {
    console.error("Error in getPersonnelById:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get personnel",
      data: null,
    });
  }
};

export const addPersonnel = async (req, res) => {
  try {
    const data = req.body;

    // Basic validation - support both 'nama' and 'nama_lengkap'
    const namaValue = data.nama || data.nama_lengkap;
    if (!namaValue || !namaValue.trim()) {
      return res.status(400).json({
        success: false,
        message: "Name is required",
        data: null,
      });
    }

    // Ensure nama_lengkap is set for the service
    if (!data.nama_lengkap && data.nama) {
      data.nama_lengkap = data.nama;
    }

    const result = await googleSheetsService.addPersonil(data);

    res.status(201).json({
      success: true,
      message: "Personnel added successfully",
      data: result.data,
    });
  } catch (error) {
    console.error("Error in addPersonnel:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add personnel",
      data: null,
    });
  }
};

export const updatePersonnel = async (req, res) => {
  try {
    const { id } = req.params;
    const data = req.body;

    // Get current personnel data to check if name changed
    const currentPersonnel = await googleSheetsService.getPersonilById(id);

    if (!currentPersonnel) {
      return res.status(404).json({
        success: false,
        message: `Personnel with ID ${id} not found`,
        data: null,
      });
    }

    const oldName = currentPersonnel.nama_lengkap;
    const newName = data.nama_lengkap || data.nama;

    // Update personnel data in sheets
    const result = await googleSheetsService.updatePersonil(id, data);

    // If name changed, rename all associated files in Google Drive
    if (newName && oldName !== newName) {
      console.log(
        `📝 Name changed from "${oldName}" to "${newName}". Renaming files...`
      );

      // Import oauth2GoogleService for file operations
      const oauth2GoogleService = (
        await import("../services/oauth2Google.service.js")
      ).default;

      const documentsToRename = [
        {
          docType: "KTP",
          oldFileName: `KTP ${oldName}.pdf`,
          newFileName: `KTP ${newName}.pdf`,
          url: currentPersonnel.ktp?.file_ktp_url,
        },
        {
          docType: "NPWP",
          oldFileName: `NPWP ${oldName}.pdf`,
          newFileName: `NPWP ${newName}.pdf`,
          url: currentPersonnel.npwp?.file_npwp_personel_url,
        },
        {
          docType: "Ijazah",
          oldFileName: `Ijazah ${oldName}.pdf`,
          newFileName: `Ijazah ${newName}.pdf`,
          url: currentPersonnel.ijazah?.file_ijazah_url,
        },
        {
          docType: "CV",
          oldFileName: `Daftar Riwayat Hidup ${oldName}.pdf`,
          newFileName: `Daftar Riwayat Hidup ${newName}.pdf`,
          url: currentPersonnel.cv?.file_cv_url,
        },
        {
          docType: "Referensi",
          oldFileName: `Surat Referensi ${oldName}.pdf`,
          newFileName: `Surat Referensi ${newName}.pdf`,
          url: null,
        }, // Multiple files
        {
          docType: "STNK",
          oldFileName: `STNK ${oldName}.pdf`,
          newFileName: `STNK ${newName}.pdf`,
          url: null,
        }, // Multiple files
      ];

      // Rename single document files (KTP, NPWP, Ijazah, CV)
      for (const doc of documentsToRename) {
        if (doc.url) {
          const fileId = oauth2GoogleService.extractFileIdFromUrl(doc.url);
          if (fileId) {
            try {
              await oauth2GoogleService.renameFile(fileId, doc.newFileName);
              console.log(
                `✅ Renamed ${doc.docType}: ${doc.oldFileName} → ${doc.newFileName}`
              );
            } catch (err) {
              console.warn(
                `⚠️ Failed to rename ${doc.docType}: ${err.message}`
              );
            }
          }
        }
      }

      // Rename multiple document files (Referensi, STNK)
      // For Referensi
      if (currentPersonnel.referensi && currentPersonnel.referensi.length > 0) {
        for (const ref of currentPersonnel.referensi) {
          if (ref.url_referensi) {
            const fileId = oauth2GoogleService.extractFileIdFromUrl(
              ref.url_referensi
            );
            if (fileId) {
              try {
                await oauth2GoogleService.renameFile(
                  fileId,
                  `Surat Referensi ${newName}.pdf`
                );
                console.log(`✅ Renamed Referensi: ${ref.url_referensi}`);
              } catch (err) {
                console.warn(`⚠️ Failed to rename Referensi: ${err.message}`);
              }
            }
          }
        }
      }

      // For SKK
      if (currentPersonnel.skk && currentPersonnel.skk.length > 0) {
        for (const s of currentPersonnel.skk) {
          if (s.url_skk) {
            const fileId = oauth2GoogleService.extractFileIdFromUrl(s.url_skk);
            if (fileId) {
              try {
                await oauth2GoogleService.renameFile(
                  fileId,
                  `SKK ${newName}.pdf`
                );
                console.log(`✅ Renamed SKK: ${s.url_skk}`);
              } catch (err) {
                console.warn(`⚠️ Failed to rename SKK: ${err.message}`);
              }
            }
          }
        }
      }

      // For STNK
      if (currentPersonnel.stnk && currentPersonnel.stnk.length > 0) {
        for (const stnk of currentPersonnel.stnk) {
          if (stnk.url_stnk) {
            const fileId = oauth2GoogleService.extractFileIdFromUrl(
              stnk.url_stnk
            );
            if (fileId) {
              try {
                await oauth2GoogleService.renameFile(
                  fileId,
                  `STNK ${newName}.pdf`
                );
                console.log(`✅ Renamed STNK: ${stnk.url_stnk}`);
              } catch (err) {
                console.warn(`⚠️ Failed to rename STNK: ${err.message}`);
              }
            }
          }
        }
      }

      console.log(`✅ File renaming complete for ${newName}`);
    }

    res.json({
      success: true,
      message: "Personnel updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in updatePersonnel:", error);

    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to update personnel",
      data: null,
    });
  }
};

export const deletePersonnel = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await googleSheetsService.deletePersonil(id);

    res.json({
      success: true,
      message: "Personnel deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in deletePersonnel:", error);

    if (error.message.includes("not found")) {
      return res.status(404).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete personnel",
      data: null,
    });
  }
};

/**
 * Step 1: Delete Personnel Assets (Folder)
 * DELETE /api/personnel/:id/assets
 */
export const deletePersonnelAssets = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️  DELETE /api/personnel/${id}/assets`);
    const result = await googleSheetsService.deletePersonnelAssets(id);
    res.json({
      success: true,
      message: "Personnel assets deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ Error in deletePersonnelAssets:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete personnel assets",
    });
  }
};

/**
 * Step 2: Delete Related Data
 * DELETE /api/personnel/:id/related-data
 */
export const deletePersonnelRelatedData = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️  DELETE /api/personnel/${id}/related-data`);
    const result = await googleSheetsService.deletePersonnelRelatedData(id);
    res.json({
      success: true,
      message: "Personnel related data deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ Error in deletePersonnelRelatedData:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete personnel related data",
    });
  }
};

/**
 * Step 3: Delete Personnel Profile
 * DELETE /api/personnel/:id/profile
 */
export const deletePersonnelProfile = async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`🗑️  DELETE /api/personnel/${id}/profile`);
    const result = await googleSheetsService.deletePersonnelProfile(id);
    res.json({
      success: true,
      message: "Personnel profile deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("❌ Error in deletePersonnelProfile:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete personnel profile",
    });
  }
};
