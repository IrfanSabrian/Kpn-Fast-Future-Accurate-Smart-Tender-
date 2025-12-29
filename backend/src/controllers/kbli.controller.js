/**
 * KBLI Controller
 *
 * Handles KBLI (Klasifikasi Baku Lapangan Usaha Indonesia) operations
 */

import googleSheetsService from "../services/googleSheets.service.js";

/**
 * Get all KBLI master data
 */
export const getAllKbli = async (req, res) => {
  try {
    const kbliData = await googleSheetsService.getKbliMasterData();

    res.json({
      success: true,
      message: "KBLI data retrieved successfully",
      data: kbliData,
    });
  } catch (error) {
    console.error("Error in getAllKbli:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get KBLI data",
      data: [],
    });
  }
};

/**
 * Get KBLI by company ID (with enriched descriptions)
 */
export const getKbliByCompanyId = async (req, res) => {
  try {
    const { id } = req.params;

    // Logic Updated: Get KBLI from db_nib instead of db_perusahaan_kbli
    const [nibData, masterKbli] = await Promise.all([
      googleSheetsService.getSheetData("db_nib"),
      googleSheetsService.getKbliMasterData(),
    ]);

    const companyNib = nibData.filter((item) => item.id_perusahaan === id);

    console.log("🔍 KBLI Debug:");
    console.log("  - Company NIB count:", companyNib.length);
    console.log("  - Master KBLI count:", masterKbli.length);

    // Extract KBLI codes from NIB
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

    console.log("  - Unique KBLI codes found:", kbliCodesSet.size);

    // Enrich with descriptions
    const enrichedKbli = Array.from(kbliCodesSet).map((code) => {
      const master = masterKbli.find((m) => m.kode_kbli === code);
      console.log(`  - Matching ${code}: ${master ? "FOUND" : "NOT FOUND"}`);
      return {
        id_perusahaan_kbli: code, // Backward compatibility
        id_perusahaan: id,
        kode_kbli: code,
        nama_klasifikasi: master ? master.nama_klasifikasi : "Unknown KBLI",
        judul_kbli: master ? master.nama_klasifikasi : "Unknown KBLI",
      };
    });

    res.json({
      success: true,
      message: `KBLI for company ${id} retrieved successfully`,
      data: enrichedKbli,
    });
  } catch (error) {
    console.error("Error in getKbliByCompanyId:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to get company KBLI",
      data: [],
    });
  }
};
