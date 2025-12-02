/**
 * Google Drive Service
 * 
 * Service untuk interact dengan Google Drive untuk manajemen folder
 */

import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GoogleDriveService {
  constructor() {
    this.auth = null;
    this.drive = null;
    this.initialized = false;
  }

  /**
   * Initialize Google Drive API
   */
  async initialize() {
    if (this.initialized) return;

    try {
      const serviceAccountPath = path.resolve(
        __dirname,
        '../../',
        process.env.GOOGLE_SERVICE_ACCOUNT_PATH
      );

      this.auth = new google.auth.GoogleAuth({
        keyFile: serviceAccountPath,
        scopes: [
          'https://www.googleapis.com/auth/drive',
          'https://www.googleapis.com/auth/drive.file',
        ],
      });

      this.drive = google.drive({ version: 'v3', auth: this.auth });
      this.initialized = true;

      console.log('✅ Google Drive Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Google Drive Service:', error);
      throw error;
    }
  }

  /**
   * Create a folder in Google Drive
   * @param {string} folderName - Name of the folder
   * @param {string} parentId - Optional parent folder ID
   * @returns {Object} Folder metadata
   */
  async createFolder(folderName, parentId = null) {
    await this.initialize();

    try {
      const fileMetadata = {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
      };

      // Add parent folder if specified
      if (parentId) {
        fileMetadata.parents = [parentId];
      } else if (process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID) {
        fileMetadata.parents = [process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID];
      }

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        fields: 'id, name, webViewLink',
      });

      console.log(`✅ Folder created: ${folderName} (ID: ${response.data.id})`);
      return response.data;
    } catch (error) {
      console.error(`❌ Error creating folder ${folderName}:`, error);
      throw new Error(`Failed to create folder: ${error.message}`);
    }
  }

  /**
   * Create nested folder structure
   * @param {Array} folderPath - Array of folder names from root to leaf
   * @param {string} parentId - Optional parent folder ID (root)
   * @returns {Object} Last created folder metadata
   */
  async createNestedFolders(folderPath, parentId = null) {
    await this.initialize();

    let currentParentId = parentId;
    let lastFolder = null;

    for (const folderName of folderPath) {
      // Check if folder already exists
      const existingFolder = await this.findFolderByName(folderName, currentParentId);
      
      if (existingFolder) {
        console.log(`📁 Folder already exists: ${folderName} (ID: ${existingFolder.id})`);
        currentParentId = existingFolder.id;
        lastFolder = existingFolder;
      } else {
        // Create new folder
        lastFolder = await this.createFolder(folderName, currentParentId);
        currentParentId = lastFolder.id;
      }
    }

    return lastFolder;
  }

  /**
   * Find folder by name in a specific parent
   * @param {string} folderName - Name of the folder to find
   * @param {string} parentId - Parent folder ID
   * @returns {Object|null} Folder metadata or null
   */
  async findFolderByName(folderName, parentId = null) {
    await this.initialize();

    try {
      let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      
      if (parentId) {
        query += ` and '${parentId}' in parents`;
      } else if (process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID) {
        query += ` and '${process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID}' in parents`;
      }

      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id, name, webViewLink)',
        pageSize: 1,
      });

      return response.data.files?.[0] || null;
    } catch (error) {
      console.error(`Error finding folder ${folderName}:`, error);
      return null;
    }
  }

  /**
   * Create specific project folder structure for KPN
   * Example structure:
   * 002. Perkim Pontianak 2025
   *   └── 01. (Pendataan...) Pontianak Barat (CV.URBAN...)
   *       ├── 01. KONTRAK
   *       └── 02. PENAWARAN KONTRAK
   */
  async createProjectStructure(projectName, companyName, subfolders = []) {
    await this.initialize();

    try {
      // Create main project folder
      const mainFolder = await this.createFolder(projectName);
      console.log(`📁 Main folder created: ${projectName}`);

      // Create company subfolder inside project
      const companyFolder = await this.createFolder(companyName, mainFolder.id);
      console.log(`📁 Company folder created: ${companyName}`);

      // Create subfolders inside company folder
      const createdSubfolders = [];
      for (const subfolder of subfolders) {
        const created = await this.createFolder(subfolder, companyFolder.id);
        createdSubfolders.push(created);
        console.log(`📁 Subfolder created: ${subfolder}`);
      }

      return {
        success: true,
        mainFolder,
        companyFolder,
        subfolders: createdSubfolders,
      };
    } catch (error) {
      console.error('Error creating project structure:', error);
      throw error;
    }
  }

  /**
   * List all folders in parent directory
   * @param {string} parentId - Parent folder ID (optional)
   * @returns {Array} List of folders
   */
  async listFolders(parentId = null) {
    await this.initialize();

    try {
      let query = `mimeType='application/vnd.google-apps.folder' and trashed=false`;
      
      if (parentId) {
        query += ` and '${parentId}' in parents`;
      } else if (process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID) {
        query += ` and '${process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID}' in parents`;
      }

      const response = await this.drive.files.list({
        q: query,
        fields: 'files(id, name, createdTime, webViewLink)',
        orderBy: 'name',
      });

      return response.data.files || [];
    } catch (error) {
      console.error('Error listing folders:', error);
      throw new Error(`Failed to list folders: ${error.message}`);
    }
  }
}

// Export singleton instance
const googleDriveService = new GoogleDriveService();
export default googleDriveService;
