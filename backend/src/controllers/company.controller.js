/**
 * Company Profile Controller
 * 
 * Handles HTTP requests untuk company profile management (multiple companies support)
 */

import googleSheetsService from '../services/googleSheets.service.js';

export const getAllCompanies = async (req, res) => {
  try {
    const companies = await googleSheetsService.getAllProfilPerusahaan();
    
    // Return array directly for frontend compatibility
    res.json(companies);
  } catch (error) {
    console.error('Error in getAllCompanies:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get company profiles',
      error: error.stack
    });
  }
};

export const getCompanyById = async (req, res) => {
  try {
    const { id } = req.params;
    
    // 1. Get Main Profile
    const company = await googleSheetsService.getProfilPerusahaanById(id);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: `Company with ID ${id} not found`,
        data: null,
      });
    }

    // 2. Fetch all related sub-modules in parallel for efficiency
    const [
      aktaData,
      pejabatData,
      nibData,
      sbuData,
      ktaData,
      sertifikatData,
      npwpData,
      kswpData,
      sptData,
      pkpData,
      kontrakData,
      kbliRelData,
      masterKbliData
    ] = await Promise.all([
      googleSheetsService.getSheetData('db_akta'),
      googleSheetsService.getSheetData('db_pejabat'),
      googleSheetsService.getSheetData('db_nib'),
      googleSheetsService.getSheetData('db_sbu'),
      googleSheetsService.getSheetData('db_kta'),
      googleSheetsService.getSheetData('db_sertifikat_standar'),
      googleSheetsService.getSheetData('db_npwp_perusahaan'),
      googleSheetsService.getSheetData('db_kswp'),
      googleSheetsService.getSheetData('db_spt'),
      googleSheetsService.getSheetData('db_pkp'),
      googleSheetsService.getSheetData('db_kontrak_pengalaman'),
      googleSheetsService.getSheetData('db_perusahaan_kbli'),
      googleSheetsService.getKbliMasterData() // Fetch Master KBLI from KBLI Spreadsheet
    ]);

    // 3. Attach filtered data to the response object
    // Note: We attach them as separate keys or a 'sub_modules' object. 
    // Attaching directly to root for easier access in frontend logic if preferred, 
    // or grouped under 'relations'. Let's group to keep it clean.
    
    // Map KBLI codes to descriptions
    const companyKbli = kbliRelData.filter(item => item.id_perusahaan === id);
    const enrichedKbli = companyKbli.map(item => {
        const master = masterKbliData.find(m => m.kode_kbli === item.kode_kbli);
        return {
            ...item,
            nama_klasifikasi: master ? master.nama_klasifikasi : 'Unknown KBLI'
        };
    });
    
    const fullData = {
      ...company,
      relations: {
        akta: aktaData.filter(item => item.id_perusahaan === id),
        pejabat: pejabatData.filter(item => item.id_perusahaan === id),
        nib: nibData.filter(item => item.id_perusahaan === id),
        sbu: sbuData.filter(item => item.id_perusahaan === id),
        kta: ktaData.filter(item => item.id_perusahaan === id),
        sertifikat: sertifikatData.filter(item => item.id_perusahaan === id),
        npwp: npwpData.filter(item => item.id_perusahaan === id),
        kswp: kswpData.filter(item => item.id_perusahaan === id),
        spt: sptData.filter(item => item.id_perusahaan === id),
        pkp: pkpData.filter(item => item.id_perusahaan === id),
        kontrak: kontrakData.filter(item => item.id_perusahaan === id),
        kbli: enrichedKbli // Searchable/Enriched KBLI
      }
    };

    res.json({
      success: true,
      message: 'Company profile and relations retrieved successfully',
      data: fullData,
    });
  } catch (error) {
    console.error('Error in getCompanyById:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get company profile',
      data: null,
    });
  }
};

export const addCompany = async (req, res) => {
  try {
    const data = req.body;

    // Basic validation
    if (!data.nama_perusahaan) {
      return res.status(400).json({
        success: false,
        message: 'Company name (nama_perusahaan) is required',
        data: null,
      });
    }

    const result = await googleSheetsService.addProfilPerusahaan(data);

    res.status(201).json({
      success: true,
      message: 'Company profile added successfully',
      data: result.data,
    });
  } catch (error) {
    console.error('Error in addCompany:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add company profile',
      data: null,
    });
  }
};

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

    const result = await googleSheetsService.deleteProfilPerusahaan(id);

    res.json({
      success: true,
      message: 'Company profile deleted successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error in deleteCompany:', error);
    
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
