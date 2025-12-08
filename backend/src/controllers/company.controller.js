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
    const company = await googleSheetsService.getProfilPerusahaanById(id);
    
    if (!company) {
      return res.status(404).json({
        success: false,
        message: `Company with ID ${id} not found`,
        data: null,
      });
    }

    res.json({
      success: true,
      message: 'Company profile retrieved successfully',
      data: company,
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
