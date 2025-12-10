/**
 * Company Profile Controller
 * 
 * Handles HTTP requests untuk company profile management (multiple companies support)
 */

import googleSheetsService from '../services/googleSheets.service.js';

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
      lokal_logo: company.lokal_logo,
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
