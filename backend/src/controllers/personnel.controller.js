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

    const result = await googleSheetsService.updatePersonil(id, data);

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
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
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
    res
      .status(500)
      .json({
        success: false,
        message: error.message || "Failed to delete personnel profile",
      });
  }
};
