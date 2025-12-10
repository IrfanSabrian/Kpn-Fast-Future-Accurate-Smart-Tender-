/**
 * Personnel Controller
 * 
 * Handles HTTP requests untuk personnel/tenaga ahli management
 */

import googleSheetsService from '../services/googleSheets.service.js';

export const getAllPersonnel = async (req, res) => {
  try {
    const personnel = await googleSheetsService.getAllPersonil();

    res.json({
      success: true,
      message: 'Personnel list retrieved successfully',
      data: personnel,
      count: personnel.length,
    });
  } catch (error) {
    console.error('Error in getAllPersonnel:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get personnel list',
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
      message: 'Personnel retrieved successfully',
      data: personel,
    });
  } catch (error) {
    console.error('Error in getPersonnelById:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get personnel',
      data: null,
    });
  }
};

export const addPersonnel = async (req, res) => {
  try {
    const data = req.body;

    // Basic validation
    if (!data.nama) {
      return res.status(400).json({
        success: false,
        message: 'Name (nama) is required',
        data: null,
      });
    }

    const result = await googleSheetsService.addPersonil(data);

    res.status(201).json({
      success: true,
      message: 'Personnel added successfully',
      data: result.data,
    });
  } catch (error) {
    console.error('Error in addPersonnel:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add personnel',
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
      message: 'Personnel updated successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error in updatePersonnel:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update personnel',
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
      message: 'Personnel deleted successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error in deletePersonnel:', error);
    
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        message: error.message,
        data: null,
      });
    }

    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete personnel',
      data: null,
    });
  }
};
