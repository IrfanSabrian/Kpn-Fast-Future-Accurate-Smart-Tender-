/**
 * Google Drive Routes
 * 
 * API endpoints untuk Google Drive management
 */

import express from 'express';
import googleDriveService from '../services/googleDrive.service.js';

const router = express.Router();

/**
 * @route   POST /api/drive/create-folder
 * @desc    Create a single folder
 * @access  Protected
 */
router.post('/create-folder', async (req, res) => {
  try {
    const { folderName, parentId } = req.body;
    
    if (!folderName) {
      return res.status(400).json({ 
        success: false, 
        message: 'Folder name is required' 
      });
    }

    const folder = await googleDriveService.createFolder(folderName, parentId);
    
    res.json({
      success: true,
      message: 'Folder created successfully',
      data: folder,
    });
  } catch (error) {
    console.error('Error creating folder:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create folder',
    });
  }
});

/**
 * @route   POST /api/drive/create-nested
 * @desc    Create nested folder structure
 * @access  Protected
 */
router.post('/create-nested', async (req, res) => {
  try {
    const { folderPath, parentId } = req.body;
    
    if (!folderPath || !Array.isArray(folderPath)) {
      return res.status(400).json({ 
        success: false, 
        message: 'folderPath must be an array of folder names' 
      });
    }

    const lastFolder = await googleDriveService.createNestedFolders(folderPath, parentId);
    
    res.json({
      success: true,
      message: 'Nested folders created successfully',
      data: lastFolder,
    });
  } catch (error) {
    console.error('Error creating nested folders:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create nested folders',
    });
  }
});

/**
 * @route   POST /api/drive/create-project
 * @desc    Create project folder structure for KPN
 * @access  Protected
 */
router.post('/create-project', async (req, res) => {
  try {
    const { projectName, companyName, subfolders } = req.body;
    
    if (!projectName || !companyName) {
      return res.status(400).json({ 
        success: false, 
        message: 'projectName and companyName are required' 
      });
    }

    const result = await googleDriveService.createProjectStructure(
      projectName, 
      companyName, 
      subfolders || []
    );
    
    res.json({
      success: true,
      message: 'Project structure created successfully',
      data: result,
    });
  } catch (error) {
    console.error('Error creating project structure:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to create project structure',
    });
  }
});

/**
 * @route   GET /api/drive/list-folders
 * @desc    List all folders in parent directory
 * @access  Protected
 */
router.get('/list-folders', async (req, res) => {
  try {
    const { parentId } = req.query;
    const folders = await googleDriveService.listFolders(parentId);
    
    res.json({
      success: true,
      message: 'Folders retrieved successfully',
      data: folders,
      count: folders.length,
    });
  } catch (error) {
    console.error('Error listing folders:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to list folders',
    });
  }
});

export default router;
