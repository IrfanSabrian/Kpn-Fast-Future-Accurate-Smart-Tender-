/**
 * KBLI Controller
 * 
 * Handles KBLI (Klasifikasi Baku Lapangan Usaha Indonesia) operations
 */

import googleSheetsService from '../services/googleSheets.service.js';

/**
 * Get all KBLI master data
 */
export const getAllKbli = async (req, res) => {
  try {
    const kbliData = await googleSheetsService.getKbliMasterData();
    
    res.json({
      success: true,
      message: 'KBLI data retrieved successfully',
      data: kbliData,
    });
  } catch (error) {
    console.error('Error in getAllKbli:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get KBLI data',
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
    
    // Get company KBLI relations
    const companyKbliData = await googleSheetsService.getSheetData('db_perusahaan_kbli');
    const companyKbli = companyKbliData.filter(item => item.id_perusahaan === id);
    
    // Get master KBLI for descriptions
    const masterKbli = await googleSheetsService.getKbliMasterData();
    
    console.log('🔍 KBLI Debug:');
    console.log('  - Company KBLI count:', companyKbli.length);
    console.log('  - Master KBLI count:', masterKbli.length);
    if (companyKbli.length > 0) {
      console.log('  - Sample company KBLI:', companyKbli[0]);
    }
    if (masterKbli.length > 0) {
      console.log('  - Sample master KBLI:', masterKbli[0]);
    }
    
    // Enrich with descriptions
    const enrichedKbli = companyKbli.map(item => {
      const master = masterKbli.find(m => m.kode_kbli === item.kode_kbli);
      console.log(`  - Matching ${item.kode_kbli}: ${master ? 'FOUND' : 'NOT FOUND'}`);
      return {
        ...item,
        nama_klasifikasi: master ? master.nama_klasifikasi : 'Unknown KBLI'
      };
    });
    
    res.json({
      success: true,
      message: `KBLI for company ${id} retrieved successfully`,
      data: enrichedKbli,
    });
  } catch (error) {
    console.error('Error in getKbliByCompanyId:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get company KBLI',
      data: [],
    });
  }
};
