/**
 * Google Sheets Service
 * 
 * Service untuk interact dengan Google Sheets sebagai database
 * Handles CRUD operations untuk:
 * - Profil Perusahaan
 * - Data personel/Tenaga Ahli
 */

// Google Sheets Service - Updated Logic
import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';
import oauth2GoogleService from './oauth2Google.service.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GoogleSheetsService {
  constructor() {
    this.auth = null;
    this.sheets = null;
    this.initialized = false;
  }

  /**
   * Initialize Google Sheets API with OAuth2
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Initialize OAuth2 service first
      await oauth2GoogleService.initialize();
      
      if (!oauth2GoogleService.isAuthenticated()) {
        throw new Error('User not authenticated. Please login first.');
      }

      // Use OAuth2 client from oauth2GoogleService
      const authClient = oauth2GoogleService.getAuthClient();
      this.sheets = google.sheets({ version: 'v4', auth: authClient });
      this.initialized = true;

      console.log('✅ Google Sheets Service initialized with OAuth2');
    } catch (error) {
      console.error('❌ Failed to initialize Google Sheets Service:', error);
      throw error;
    }
  }

  /**
   * Force reload service with new OAuth client
   * Call this after user login/logout
   */
  async forceReload() {
    this.initialized = false;
    this.sheets = null;
    await this.initialize();
  }

  /**
   * Get sheet tab names from spreadsheet
   */
  async getSheetTabNames(spreadsheetId) {
    await this.initialize();

    try {
      const response = await this.sheets.spreadsheets.get({
        spreadsheetId,
      });

      return response.data.sheets.map(sheet => ({
        title: sheet.properties.title,
        sheetId: sheet.properties.sheetId,
        index: sheet.properties.index,
      }));
    } catch (error) {
      throw new Error(`Failed to get sheet tabs: ${error.message}`);
    }
  }

  // ========================================
  // PROFIL PERUSAHAAN (Multiple Companies Support)
  // ========================================

  /**
   * Get all company profiles
   * @returns {Array} List of company profiles
   */
  async getAllProfilPerusahaan() {
    await this.initialize();

    try {
      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERUSAHAAN;
      
      if (!spreadsheetId) {
        throw new Error('GOOGLE_SHEET_ID_PERUSAHAAN not configured in environment variables');
      }

      // Use the correct sheet name directly
      const profilTabName = 'db_profil';

      // Read all data
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${profilTabName}!A1:Z1000`,
      });

      const rows = response.data.values;
      
      if (!rows || rows.length < 2) {
        return []; // No data yet
      }

      const headers = rows[0];
      const dataRows = rows.slice(1).filter(row => row && row.length > 0 && row[0]); // Filter empty rows

      // Map to array of objects
      return dataRows.map(row => {
        const profil = {};
        headers.forEach((header, index) => {
          profil[header] = row[index] || '';
        });
        return profil;
      });
    } catch (error) {
      console.error('Error getting all profil perusahaan:', error);
      throw new Error(`Failed to get profiles: ${error.message}`);
    }
  }

  /**
   * Get single company profile by ID
   * @param {string} id - Company ID
   */
  async getProfilPerusahaanById(id) {
    const allProfiles = await this.getAllProfilPerusahaan();
    return allProfiles.find(p => p.id_perusahaan === id) || null;
  }

  /**
   * Add new company profile
   * @param {Object} data - Company profile data
   */
  async addProfilPerusahaan(data) {
    await this.initialize();

    try {
      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERUSAHAAN;
      const profilTabName = 'db_profil';

      // Get headers from the first row
      const headerResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${profilTabName}!A1:Z1`, // Assume max 26 columns
      });

      const headers = headerResponse.data.values?.[0];
      if (!headers) {
        throw new Error('Headers not found in the first row');
      }

      // Get current data to find next row
      const currentDataResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${profilTabName}!A:A`, // Check column A for rows count
      });
      const nextRow = (currentDataResponse.data.values?.length || 0) + 1;

      // Generate ID if not provided
      if (!data.id_perusahaan) {
        // Simple ID generation based on timestamp to avoid collision/count issues
        // Or keep existing logic if preferred, but count based is risky if rows deleted
        // Let's stick to existing logic for consistency but safer
        const count = (currentDataResponse.data.values?.length || 1); 
        data.id_perusahaan = `C${String(count).padStart(3, '0')}`;
      }

      // Map data to headers
      const values = headers.map(header => {
        const key = header.toLowerCase().replace(/\s+/g, '_');
        return data[key] || '';
      });

      // Append row
      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${profilTabName}!A${nextRow}`,
        valueInputOption: 'RAW',
        resource: {
          values: [values],
        },
      });

      return { 
        success: true, 
        message: 'Company profile added successfully',
        data: { id_perusahaan: data.id_perusahaan }
      };
    } catch (error) {
      console.error('Error adding profil perusahaan:', error);
      throw new Error(`Failed to add profile: ${error.message}`);
    }
  }

  /**
   * Update company profile by ID
   * @param {string} id - Company ID
   * @param {Object} data - Updated data
   */
  async updateProfilPerusahaan(id, data) {
    await this.initialize();

    try {
      const allProfiles = await this.getAllProfilPerusahaan();
      const index = allProfiles.findIndex(p => p.id_perusahaan === id);

      if (index === -1) {
        throw new Error(`Company with ID ${id} not found`);
      }

      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERUSAHAAN;
      const profilTabName = 'db_profil';

      // Row number
      const rowNumber = index + 2;

      // Get headers from the first row
      const headerResponse = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${profilTabName}!A1:Z1`, // Assume max 26 columns
      });

      const headers = headerResponse.data.values?.[0];
      if (!headers) {
        throw new Error('Headers not found in the first row');
      }

      // Merge existing data with updates
      const updatedData = { ...allProfiles[index], ...data };
      
      // Map data to headers
      const values = headers.map(header => {
        const key = header.toLowerCase().replace(/\s+/g, '_');
        return updatedData[key] || '';
      });

      // Update row
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${profilTabName}!A${rowNumber}`,
        valueInputOption: 'RAW',
        resource: {
          values: [values],
        },
      });

      return { success: true, message: 'Company profile updated successfully' };
    } catch (error) {
      console.error('Error updating profil perusahaan:', error);
      throw new Error(`Failed to update profile: ${error.message}`);
    }
  }

  /**
   * Delete company profile by ID with CASCADE DELETE
   * @param {string} id - Company ID
   */
  async deleteProfilPerusahaan(id) {
    try {
      // Cascade delete related data from all dependent tables
      console.log(`Starting cascade delete for company ${id}...`);
      
      await this.deleteSheetDataMany('db_akta', 'id_perusahaan', id);
      await this.deleteSheetDataMany('db_pejabat', 'id_perusahaan', id);
      await this.deleteSheetDataMany('db_nib', 'id_perusahaan', id);
      await this.deleteSheetDataMany('db_pengalaman_perusahaan', 'id_perusahaan', id);
      await this.deleteSheetDataMany('db_project', 'id_perusahaan', id);
      await this.deleteSheetDataMany('db_personel', 'id_perusahaan', id);
      
      console.log(`Cascade delete completed, now deleting company profile ${id}...`);

      // Finally delete the company profile itself
      return await this.deleteSheetData('db_perusahaan', 'id_perusahaan', id);
    } catch (error) {
      console.error('Error in deleteProfilPerusahaan:', error);
      throw new Error(`Failed to delete company profile: ${error.message}`);
    }
  }

  // ========================================
  // DATA personel
  // ========================================

  /**
   * Helper to read valid data from any sheet
   */
  async readSheet(spreadsheetId, sheetName) {
      if (!spreadsheetId) throw new Error("Spreadsheet ID missing for readSheet");
      try {
        const response = await this.sheets.spreadsheets.values.get({
          spreadsheetId,
          range: `${sheetName}!A1:Z2000`,
        });
        const rows = response.data.values;
        if (!rows || rows.length < 2) return [];
        const headers = rows[0];
        return rows.slice(1).map(row => {
            const obj = {};
            headers.forEach((h, i) => obj[h] = row[i] || '');
            return obj;
        });
      } catch (e) {
        console.warn(`Warning: Could not read sheet ${sheetName}: ${e.message}`);
        return [];
      }
  }

  /**
   * Get all personnel data (Joined with KTP, NPWP, Ijazah & CV)
   * @returns {Array} List of personnel with complete documents
   */
  async getAllPersonil() {
    await this.initialize();

    try {
      // Try to get specifically configured ID, fallback to general ID
      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERSONEL || process.env.GOOGLE_SHEET_ID_PERSONIL || process.env.GOOGLE_SHEET_ID;
      
      if (!spreadsheetId) {
        throw new Error('GOOGLE_SHEET_ID_PERSONEL not configured');
      }

      // Fetch all required tables in parallel
      const [personelData, ktpData, npwpData, ijazahData, cvData] = await Promise.all([
        this.readSheet(spreadsheetId, 'db_personel'),
        this.readSheet(spreadsheetId, 'db_ktp'),
        this.readSheet(spreadsheetId, 'db_npwp_personel'),
        this.readSheet(spreadsheetId, 'db_ijazah'),
        this.readSheet(spreadsheetId, 'db_cv')
      ]);

      // Join data based on id_personel
      return personelData.map(p => {
        const ktp = ktpData.find(k => k.id_personel === p.id_personel) || {};
        const npwp = npwpData.find(n => n.id_personel === p.id_personel) || {};
        const ijazah = ijazahData.find(i => i.id_personel === p.id_personel) || {};
        const cv = cvData.find(c => c.id_personel === p.id_personel) || {};

        return {
          ...p,
          // Flatten key identification fields for ease of use
          nik: ktp.nik || '',
          nama_ktp: ktp.nama_ktp || '',
          nomor_npwp_personel: npwp.nomor_npwp_personel || '',
          // Include full objects for details
          ktp,
          npwp,
          ijazah,
          cv
        };
      });
    } catch (error) {
      console.error('Error getting consolidated personnel:', error);
      throw new Error(`Failed to get personnel: ${error.message}`);
    }
  }

  /**
   * Get single personnel by ID (searches in id_personel or nik)
   * @param {string} id - Personnel ID or NIK
   */
  async getPersonilById(id) {
    const allPersonil = await this.getAllPersonil();
    return allPersonil.find(p => p.id_personel === id || p.nik === id) || null;
  }

  /**
   * Add new personnel
   * @param {Object} data - Personnel data
   */
  /**
   * Add new personnel
   * @param {Object} data - Personnel data
   */
  async addPersonil(data) { // Renamed
    await this.initialize();

    try {
      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERSONEL || process.env.GOOGLE_SHEET_ID_PERSONIL;
      // Use specific sheet name for personel data  
      const personelTabName = 'db_personel';

      // Get current data to find next row
      const currentData = await this.getAllPersonil();
      // Only insert into main table for now (Simplified)
      const nextRow = currentData.length + 2; 

      // Expected headers - db_personel
      const headers = [
        'id_personel', 'nama_lengkap', 'tempat_lahir', 'tanggal_lahir', 'alamat_domisili', 'no_hp', 'tanggal_input', 'author'
      ];

      // Auto-generate ID (Basic)
      if (!data.id_personel) {
         const count = currentData.length + 1;
         data.id_personel = `PRS${String(count).padStart(3, '0')}`;
      }
      // Format tanggal: YYYY-MM-DD HH:MM:SS (readable, bukan ISO)
      const now = new Date();
      const year = now.getFullYear();
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const day = String(now.getDate()).padStart(2, '0');
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      data.tanggal_input = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

      // Auto-fill author
      if (!data.author) {
        try {
          const userInfo = await oauth2GoogleService.getUserInfo();
          data.author = userInfo.name || userInfo.username; // Gunakan nama lengkap
        } catch (error) {
          console.warn('Could not get user info for author:', error.message);
          data.author = 'system';
        }
      }

      // Extract nama_lengkap from data (support both nama_lengkap and nama)
      const namaLengkap = data.nama_lengkap || data.nama;

      // Prepare values
      const values = headers.map(header => {
        if (header === 'nama_lengkap') return namaLengkap || '';
        return data[header] || '';
      });

      // Append row
      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${personelTabName}!A${nextRow}`,
        valueInputOption: 'RAW',
        resource: {
          values: [values],
        },
      });

      // === CREATE GOOGLE DRIVE FOLDER FOR PERSONEL ===
      try {
        if (namaLengkap) {
          console.log(`🔍 Starting folder creation for personel: ${namaLengkap}`);
          
          // Find or create "02. Personel" folder
          let personelParentFolder = null;
          
          if (process.env.GOOGLE_DRIVE_PERSONEL_FOLDER_ID) {
            console.log(`📁 Using GOOGLE_DRIVE_PERSONEL_FOLDER_ID: ${process.env.GOOGLE_DRIVE_PERSONEL_FOLDER_ID}`);
            personelParentFolder = { id: process.env.GOOGLE_DRIVE_PERSONEL_FOLDER_ID };
          } else {
            console.log('🔍 GOOGLE_DRIVE_PERSONEL_FOLDER_ID not set, searching for Data folder...');
            // Try to find "Data" folder first
            const dataFolder = await oauth2GoogleService.findFolderByName('Data', process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID);
            
            if (dataFolder) {
              console.log(`✅ Found Data folder (ID: ${dataFolder.id})`);
              // Look for "02. Personel" inside Data folder
              personelParentFolder = await oauth2GoogleService.findFolderByName('02. Personel', dataFolder.id);
              
              if (!personelParentFolder) {
                console.log('📁 "02. Personel" folder not found, creating it...');
                // Create "02. Personel" if not exists
                personelParentFolder = await oauth2GoogleService.createFolder('02. Personel', dataFolder.id);
                console.log(`✅ Created "02. Personel" folder (ID: ${personelParentFolder.id})`);
              } else {
                console.log(`✅ Found "02. Personel" folder (ID: ${personelParentFolder.id})`);
              }
            } else {
              console.warn('⚠️ Data folder not found in Google Drive');
            }
          }

          if (personelParentFolder) {
            // Create folder with personnel name
            console.log(`📁 Creating folder "${namaLengkap}" in parent ${personelParentFolder.id}...`);
            const personelFolder = await oauth2GoogleService.createFolder(namaLengkap, personelParentFolder.id);
            console.log(`✅ Created folder for personel: ${namaLengkap} (${personelFolder.id})`);
          } else {
            console.warn('⚠️ Parent folder "02. Personel" not found, skipping folder creation');
          }
        }
      } catch (folderError) {
        console.error('❌ Error creating personel folder:', folderError);
        console.error('Error details:', folderError.message);

        // Don't throw error, continue with personnel creation
      }

      return { 
        success: true, 
        message: 'Personnel added successfully',
        data: { id_personel: data.id_personel }
      };
    } catch (error) {
      console.error('Error adding personel:', error);
      throw new Error(`Failed to add personel: ${error.message}`);
    }
  }

  /**
   * Update personnel by ID
   * @param {string} id - Personnel ID
   * @param {Object} data - Updated data
   */
  /**
   * Update personnel by ID
   * @param {string} id - Personnel ID
   * @param {Object} data - Updated data
   */
  async updatePersonil(id, data) { // Renamed
    await this.initialize();

    try {
      const allPersonil = await this.getAllPersonil();
      const index = allPersonil.findIndex(p => p.id_personel === id); // Use id_personel

      if (index === -1) {
        throw new Error(`Personnel with ID ${id} not found`);
      }

      const oldData = allPersonil[index];
      const oldNamaLengkap = oldData.nama_lengkap;
      const newNamaLengkap = data.nama_lengkap || data.nama;

      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERSONEL || process.env.GOOGLE_SHEET_ID_PERSONIL;
      const personelTabName = 'db_personel';

      const rowNumber = index + 2;

      const headers = [
        'id_personel', 'nama_lengkap', 'tempat_lahir', 'tanggal_lahir', 'alamat_domisili', 'no_hp', 'tanggal_input'
      ];

      // Merge data (this update is imperfect as it only updates db_personel, not joined tables)
      const updatedData = { ...oldData, ...data };
      if (newNamaLengkap) updatedData.nama_lengkap = newNamaLengkap;
      const values = headers.map(header => updatedData[header] || '');

      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${personelTabName}!A${rowNumber}`,
        valueInputOption: 'RAW',
        resource: {
          values: [values],
        },
      });

      // === RENAME GOOGLE DRIVE FOLDER IF NAME CHANGED ===
      try {
        if (newNamaLengkap && oldNamaLengkap && newNamaLengkap !== oldNamaLengkap) {
          // Find "02. Personel" folder
          let personelParentFolder = null;
          
          if (process.env.GOOGLE_DRIVE_PERSONEL_FOLDER_ID) {
            personelParentFolder = { id: process.env.GOOGLE_DRIVE_PERSONEL_FOLDER_ID };
          } else {
            const dataFolder = await oauth2GoogleService.findFolderByName('Data', process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID);
            if (dataFolder) {
              personelParentFolder = await oauth2GoogleService.findFolderByName('02. Personel', dataFolder.id);
            }
          }

          if (personelParentFolder) {
            // Rename folder from old name to new name
            await oauth2GoogleService.renameFolder(oldNamaLengkap, newNamaLengkap, personelParentFolder.id);
            console.log(`✅ Renamed folder: "${oldNamaLengkap}" → "${newNamaLengkap}"`);
          }
        }
      } catch (folderError) {
        console.error('❌ Error renaming personel folder:', folderError);
        // Don't throw error, continue with personnel update
      }

      return { success: true, message: 'Personnel updated successfully' };
    } catch (error) {
      console.error('Error updating personel:', error);
      throw new Error(`Failed to update personel: ${error.message}`);
    }
  }

  /**
   * Delete personnel by ID
   * @param {string} id - Personnel ID
   */
  /**
   * Delete personnel by ID
   * @param {string} id - Personnel ID
   */
  async deletePersonil(id) { // Renamed
    await this.initialize();

    try {
      const allPersonil = await this.getAllPersonil();
      const index = allPersonil.findIndex(p => p.id_personel === id); // Use id_personel

      if (index === -1) {
        throw new Error(`Personnel with ID ${id} not found`);
      }

      const personelData = allPersonil[index];
      const namaLengkap = personelData.nama_lengkap;

      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERSONEL || process.env.GOOGLE_SHEET_ID_PERSONIL;
      const tabs = await this.getSheetTabNames(spreadsheetId);
      const personelTab = tabs.find(t => t.title === 'db_personel') || tabs[0];

      const rowNumber = index + 1; // 0-based index for batchUpdate

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: personelTab.sheetId,
                  dimension: 'ROWS',
                  startIndex: rowNumber,
                  endIndex: rowNumber + 1,
                },
              },
            },
          ],
        },
      });

      // === CASCADE DELETE: Delete all related documents ===
      console.log(`🗑️  Cascade delete documents for ${id}...`);
      
      try {
        // Delete KTP
        try {
          await this.deleteKtp(id);
          console.log(`✅ Deleted KTP for ${id}`);
        } catch (err) {
          console.log(`ℹ️  No KTP found for ${id}`);
        }

        // Delete NPWP
        try {
          await this.deleteNpwp(id);
          console.log(`✅ Deleted NPWP for ${id}`);
        } catch (err) {
          console.log(`ℹ️  No NPWP found for ${id}`);
        }

        // Delete Ijazah
        try {
          await this.deleteIjazah(id);
          console.log(`✅ Deleted Ijazah for ${id}`);
        } catch (err) {
          console.log(`ℹ️  No Ijazah found for ${id}`);
        }

        // Delete CV
        try {
          await this.deleteCv(id);
          console.log(`✅ Deleted CV for ${id}`);
        } catch (err) {
          console.log(`ℹ️  No CV found for ${id}`);
        }
      } catch (docDeleteError) {
        console.error('⚠️  Error deleting documents:', docDeleteError);
        // Continue to delete folder even if document deletion fails
      }

      // === DELETE GOOGLE DRIVE FOLDER ===
      try {
        if (namaLengkap) {
          // Find "02. Personel" folder
          let personelParentFolder = null;
          
          if (process.env.GOOGLE_DRIVE_PERSONEL_FOLDER_ID) {
            personelParentFolder = { id: process.env.GOOGLE_DRIVE_PERSONEL_FOLDER_ID };
          } else {
            const dataFolder = await oauth2GoogleService.findFolderByName('Data', process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID);
            if (dataFolder) {
              personelParentFolder = await oauth2GoogleService.findFolderByName('02. Personel', dataFolder.id);
            }
          }

          if (personelParentFolder) {
            // Delete folder with personnel name
            await oauth2GoogleService.deleteFolder(namaLengkap, personelParentFolder.id);
            console.log(`✅ Deleted folder for personel: ${namaLengkap}`);
          }
        }
      } catch (folderError) {
        console.error('❌ Error deleting personel folder:', folderError);
        // Don't throw error, personnel is already deleted from sheet
      }

      return { success: true, message: 'Personnel deleted successfully' };
    } catch (error) {
      console.error('Error deleting personel:', error);
      throw new Error(`Failed to delete personel: ${error.message}`);
    }
  }

  // ========================================
  // NEW DATABASE TABLES - CRUD OPERATIONS
  // ========================================

  /**
   * Generic function to get all data from a sheet
   * @param {string} sheetName - Name of the sheet
   * @returns {Array} List of data objects
   */
  async getSheetData(sheetName) {
    await this.initialize();

    try {
      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERUSAHAAN;
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${sheetName}!A1:Z1000`,
      });

      const rows = response.data.values;
      if (!rows || rows.length < 2) {
        return [];
      }

      const headers = rows[0];
      const dataRows = rows.slice(1).filter(row => row && row.length > 0 && row[0]);

      return dataRows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });
    } catch (error) {
      throw new Error(`Failed to get data from ${sheetName}: ${error.message}`);
    }
  }

  /**
   * Get KBLI Master Data from KBLI Spreadsheet
   * @returns {Array} List of KBLI classifications
   */
  async getKbliMasterData() {
    await this.initialize();

    try {
      const spreadsheetId = process.env.GOOGLE_SHEET_ID_KBLI;
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `KBLI!A1:Z2000`, // Increased to 2000 rows to fetch all KBLI data
      });

      const rows = response.data.values;
      if (!rows || rows.length < 2) {
        return [];
      }

      const headers = rows[0];
      const dataRows = rows.slice(1).filter(row => row && row.length > 0 && row[0]);

      return dataRows.map(row => {
        const obj = {};
        headers.forEach((header, index) => {
          obj[header] = row[index] || '';
        });
        return obj;
      });
    } catch (error) {
      console.error('Failed to get KBLI master data:', error);
      return []; // Return empty array instead of throwing to prevent 500 error
    }
  }

  /**
   * Generic function to add data to a sheet
   * @param {string} sheetName - Name of the sheet
   * @param {Array} headers - Array of column headers
   * @param {Object} data - Data object to add
   * @returns {Object} Result object
   */
  async addSheetData(sheetName, headers, data) {
    await this.initialize();

    try {
      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERUSAHAAN;
      const currentData = await this.getSheetData(sheetName);
      const nextRow = currentData.length + 2;

      // Auto-fill author from OAuth2 user (if header includes 'author')
      if (headers.includes('author') && !data.author) {
        try {
          const userInfo = await oauth2GoogleService.getUserInfo();
          data.author = userInfo.name || userInfo.username; // Gunakan nama lengkap
        } catch (error) {
          console.warn('Could not get user info for author, using "system":', error.message);
          data.author = 'system';
        }
      }

      const values = headers.map(header => data[header] || '');

      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A${nextRow}`,
        valueInputOption: 'RAW',
        resource: { values: [values] },
      });

      return {
        success: true,
        message: `Data added to ${sheetName} successfully`,
      };
    } catch (error) {
      throw new Error(`Failed to add data to ${sheetName}: ${error.message}`);
    }
  }

  /**
   * Generic function to update data in a sheet by ID
   * @param {string} sheetName - Name of the sheet
   * @param {Array} headers - Array of column headers
   * @param {string} idField - Name of the ID field
   * @param {string} id - ID value to find
   * @param {Object} data - Updated data
   * @returns {Object} Result object
   */
  async updateSheetData(sheetName, headers, idField, id, data) {
    await this.initialize();

    try {
      const allData = await this.getSheetData(sheetName);
      const index = allData.findIndex(item => item[idField] === id);

      if (index === -1) {
        throw new Error(`Data with ${idField} = ${id} not found in ${sheetName}`);
      }

      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERUSAHAAN;
      const rowNumber = index + 2;

      const updatedData = { ...allData[index], ...data };
      const values = headers.map(header => updatedData[header] || '');

      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A${rowNumber}`,
        valueInputOption: 'RAW',
        resource: { values: [values] },
      });

      return {
        success: true,
        message: `Data in ${sheetName} updated successfully`,
      };
    } catch (error) {
      throw new Error(`Failed to update data in ${sheetName}: ${error.message}`);
    }
  }

  /**
   * Delete MULTIPLE rows from a sheet based on a filter (Cascade Delete Helper)
   */
  async deleteSheetDataMany(sheetName, filterField, filterValue) {
    await this.initialize();

    try {
      const allData = await this.getSheetData(sheetName);
      
      // Find ALL matching indices
      // We map to original index first
      const indices = allData
        .map((item, index) => ({ item, index }))
        .filter(({ item }) => item[filterField] === filterValue)
        .map(({ index }) => index)
        .sort((a, b) => b - a); // Sort descending is CRITICAL for deletion

      if (indices.length === 0) {
        return { success: true, message: `No data found in ${sheetName} to delete` };
      }

      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERUSAHAAN;
      const tabs = await this.getSheetTabNames(spreadsheetId);
      const tab = tabs.find(t => t.title === sheetName);

      if (!tab) {
        throw new Error(`Sheet ${sheetName} not found`);
      }

      // Create batch delete requests
      const requests = indices.map(index => ({
        deleteDimension: {
          range: {
            sheetId: tab.sheetId,
            dimension: 'ROWS',
            startIndex: index + 1, // +1 because row 1 is header
            endIndex: index + 2,
          },
        },
      }));

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: { requests },
      });

      return {
        success: true,
        message: `Deleted ${indices.length} rows from ${sheetName}`,
      };
    } catch (error) {
      // Don't throw error here to allow cascade to continue even if one table fails or is empty
      console.warn(`Warning: Failed to delete from ${sheetName}: ${error.message}`);
      return { success: false, message: error.message };
    }
  }

  /**
   * Generic function to delete data from a sheet
   * @param {string} sheetName - Name of the sheet
   * @param {string} idField - Name of the ID field
   * @param {string} id - ID value to find
   * @returns {Object} Result object
   */
  async deleteSheetData(sheetName, idField, id) {
    await this.initialize();

    try {
      const allData = await this.getSheetData(sheetName);
      const index = allData.findIndex(item => item[idField] === id);

      if (index === -1) {
        throw new Error(`Data with ${idField} = ${id} not found in ${sheetName}`);
      }

      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERUSAHAAN;
      const tabs = await this.getSheetTabNames(spreadsheetId);
      const tab = tabs.find(t => t.title === sheetName);

      if (!tab) {
        throw new Error(`Sheet ${sheetName} not found`);
      }

      const rowNumber = index + 1; // +1 because row 1 is header

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: tab.sheetId,
                  dimension: 'ROWS',
                  startIndex: rowNumber,
                  endIndex: rowNumber + 1,
                },
              },
            },
          ],
        },
      });

      return {
        success: true,
        message: `Data in ${sheetName} deleted successfully`,
      };
    } catch (error) {
      throw new Error(`Failed to delete data from ${sheetName}: ${error.message}`);
    }
  }

  // ========================================
  // SPECIFIC METHODS FOR EACH TABLE
  // ========================================

  // --- 1. DB PERUSAHAAN ---
  async getAllCompanies() {
    return this.getSheetData('db_profil');
  }

  async getCompanyById(id) {
    const companies = await this.getAllCompanies();
    return companies.find(c => c.id_perusahaan === id) || null;
  }

  async addCompany(data) {
    const headers = [
      'id_perusahaan',
      'nama_perusahaan',
      'status_perusahaan',
      'alamat_kantor_pusat',
      'no_telp',
      'no_fax',
      'email',
      'author'
    ];
    
    // Get existing companies to generate ID and folder number
    const companies = await this.getAllCompanies();
    
    // Generate ID if not provided
    if (!data.id_perusahaan) {
      data.id_perusahaan = `COMP${String(companies.length + 1).padStart(3, '0')}`;
    }

    // Generate folder number (based on current count + 1)
    const folderNumber = String(companies.length + 1).padStart(2, '0');
    const folderName = `${folderNumber}.(${data.nama_perusahaan})`;

    // Add data to Google Sheets
    const result = await this.addSheetData('db_profil', headers, data);

    // Create folder in Google Drive
    try {
      const folder = await oauth2GoogleService.createFolder(folderName);
      console.log(`✅ Folder created for company: ${folderName} (ID: ${folder.id})`);
      
      // Optionally, you can store the folder ID in the company data
      // This would require adding a new column in the spreadsheet
      result.folderId = folder.id;
      result.folderLink = folder.webViewLink;
    } catch (driveError) {
      console.error('❌ Failed to create Google Drive folder:', driveError);
      // Don't throw error here - company is already created in Sheets
      // Just log the error and continue
      result.folderError = driveError.message;
    }

    return result;
  }

  async updateCompany(id, data) {
    const headers = [
      'id_perusahaan',
      'nama_perusahaan',
      'status_perusahaan',
      'alamat_kantor_pusat',
      'no_telp',
      'no_fax',
      'email',
    ];
    
    // Get current company data to check if name changed
    const currentCompany = await this.getCompanyById(id);
    
    if (!currentCompany) {
      throw new Error(`Company with ID ${id} not found`);
    }

    // Update data in Google Sheets
    const result = await this.updateSheetData('db_profil', headers, 'id_perusahaan', id, data);

    // Check if nama_perusahaan changed
    if (data.nama_perusahaan && data.nama_perusahaan !== currentCompany.nama_perusahaan) {
      try {
        // Get all companies to find the index/number of this company
        const allCompanies = await this.getAllCompanies();
        const companyIndex = allCompanies.findIndex(c => c.id_perusahaan === id);
        
        if (companyIndex !== -1) {
          // Generate folder number (index + 1, padded to 2 digits)
          const folderNumber = String(companyIndex + 1).padStart(2, '0');
          
          // Old and new folder names
          const oldFolderName = `${folderNumber}.(${currentCompany.nama_perusahaan})`;
          const newFolderName = `${folderNumber}.(${data.nama_perusahaan})`;
          
          // Rename folder in Google Drive
          const folder = await oauth2GoogleService.renameFolder(oldFolderName, newFolderName);
          console.log(`✅ Company folder renamed: "${oldFolderName}" → "${newFolderName}"`);
          
          result.folderRenamed = true;
          result.newFolderName = newFolderName;
          result.folderLink = folder.webViewLink;
        }
      } catch (driveError) {
        console.error('❌ Failed to rename Google Drive folder:', driveError);
        // Don't throw error here - company data is already updated in Sheets
        // Just log the error and continue
        result.folderRenameError = driveError.message;
      }
    }

    return result;
  }

  async deleteCompany(id) {
    // Get company data before deleting to get folder name
    const company = await this.getCompanyById(id);
    
    if (!company) {
      throw new Error(`Company with ID ${id} not found`);
    }

    // Get all companies to find the index/number of this company
    const allCompanies = await this.getAllCompanies();
    const companyIndex = allCompanies.findIndex(c => c.id_perusahaan === id);

    let folderDeleted = false;
    let folderDeleteError = null;

    // Try to delete folder in Google Drive first
    if (companyIndex !== -1) {
      try {
        // Generate folder number and name
        const folderNumber = String(companyIndex + 1).padStart(2, '0');
        const folderName = `${folderNumber}.(${company.nama_perusahaan})`;
        
        // Delete folder in Google Drive
        await oauth2GoogleService.deleteFolder(folderName);
        console.log(`✅ Company folder deleted: "${folderName}"`);
        folderDeleted = true;
      } catch (driveError) {
        console.error('❌ Failed to delete Google Drive folder:', driveError);
        // Don't throw error here - we still want to delete the company data
        // Just log the error
        folderDeleteError = driveError.message;
      }
    }

    // Delete company data from Google Sheets
    const result = await this.deleteSheetData('db_profil', 'id_perusahaan', id);

    // Add folder deletion info to result
    result.folderDeleted = folderDeleted;
    if (folderDeleteError) {
      result.folderDeleteError = folderDeleteError;
    }

    return result;
  }

  // --- 2. DB AKTA ---
  async getAllAkta(idPerusahaan = null) {
    const allAkta = await this.getSheetData('db_akta');
    if (idPerusahaan) {
      return allAkta.filter(a => a.id_perusahaan === idPerusahaan);
    }
    return allAkta;
  }

  async addAkta(data) {
    const headers = [
      'id_perusahaan',
      'jenis_akta',
      'nomor_akta',
      'tanggal_akta',
      'nama_notaris',
      'author'
    ];
    return this.addSheetData('db_akta', headers, data);
  }

  async updateAkta(nomorAkta, data) {
    const headers = [
      'id_perusahaan',
      'jenis_akta',
      'nomor_akta',
      'tanggal_akta',
      'nama_notaris',
    ];
    return this.updateSheetData('db_akta', headers, 'nomor_akta', nomorAkta, data);
  }

  async deleteAkta(nomorAkta) {
    return this.deleteSheetData('db_akta', 'nomor_akta', nomorAkta);
  }

  // --- 3. DB PEJABAT ---
  async getAllPejabat(idPerusahaan = null) {
    const allPejabat = await this.getSheetData('db_pejabat');
    if (idPerusahaan) {
      return allPejabat.filter(p => p.id_perusahaan === idPerusahaan);
    }
    return allPejabat;
  }

  async addPejabat(data) {
    const headers = [
      'id_pejabat',
      'id_perusahaan',
      'id_personel',
      'jenis_jabatan',
      'jabatan_custom',
      'tanggal_input',
    ];
    return this.addSheetData('db_pejabat', headers, data);
  }

  async updatePejabat(nik, data) {
    const headers = [
      'id_pejabat',
      'id_perusahaan',
      'id_personel',
      'jenis_jabatan',
      'jabatan_custom',
      'tanggal_input',
    ];
    return this.updateSheetData('db_pejabat', headers, 'nik', nik, data);
  }

  async deletePejabat(nik) {
    return this.deleteSheetData('db_pejabat', 'nik', nik);
  }

  // --- 4. DB NIB ---
  async getAllNIB(idPerusahaan = null) {
    const allNIB = await this.getSheetData('db_nib');
    if (idPerusahaan) {
      return allNIB.filter(n => n.id_perusahaan === idPerusahaan);
    }
    return allNIB;
  }

  async addNIB(data) {
    const headers = [
      'id_perusahaan',
      'nomor_nib',
      'tanggal_nib',
      'bidang_nib',
    ];
    return this.addSheetData('db_nib', headers, data);
  }

  async updateNIB(nomorNib, data) {
    const headers = [
      'id_perusahaan',
      'nomor_nib',
      'tanggal_nib',
      'bidang_nib',
    ];
    return this.updateSheetData('db_nib', headers, 'nomor_nib', nomorNib, data);
  }

  async deleteNIB(nomorNib) {
    return this.deleteSheetData('db_nib', 'nomor_nib', nomorNib);
  }

  // --- 5. DB personel (Updated) ---
  async getAllpersonelNew(idPerusahaan = null) {
    const allpersonel = await this.getAllPersonil(); // Use joined data
    if (idPerusahaan) {
      return allpersonel.filter(p => p.id_perusahaan === idPerusahaan);
    }
    return allpersonel;
  }

  async addpersonelNew(data) {
    const headers = [
      'id_perusahaan',
      'nama',
      'tempat_lahir',
      'tanggal_lahir',
      'strata',
      'jurusan_pendidikan',
      'sertifikat_keahlian',
      'pengalaman_kerja',
    ];
    return this.addSheetData('db_personel', headers, data);
  }

  async updatepersonelNew(nama, data) {
    const headers = [
      'id_perusahaan',
      'nama',
      'tempat_lahir',
      'tanggal_lahir',
      'strata',
      'jurusan_pendidikan',
      'sertifikat_keahlian',
      'pengalaman_kerja',
    ];
    return this.updateSheetData('db_personel', headers, 'nama', nama, data);
  }

  async deletepersonelNew(nama) {
    return this.deleteSheetData('db_personel', 'nama', nama);
  }

  // --- 6. DB PENGALAMAN PERUSAHAAN ---
  async getAllPengalaman(idPerusahaan = null) {
    const allPengalaman = await this.getSheetData('db_pengalaman_perusahaan');
    if (idPerusahaan) {
      return allPengalaman.filter(p => p.id_perusahaan === idPerusahaan);
    }
    return allPengalaman;
  }

  async addPengalaman(data) {
    const headers = [
      'id_perusahaan',
      'nama_pekerjaan',
      'bidang_pekerjaan',
      'lokasi',
      'nama_pemberi_tugas',
      'alamat_pemberi_tugas',
      'nomor_kontrak',
      'nilai_kontrak',
      'tanggal_selesai_kontrak',
      'tanggal_BA_selesai_serah_terima',
    ];
    return this.addSheetData('db_pengalaman_perusahaan', headers, data);
  }

  async updatePengalaman(nomorKontrak, data) {
    const headers = [
      'id_perusahaan',
      'nama_pekerjaan',
      'bidang_pekerjaan',
      'lokasi',
      'nama_pemberi_tugas',
      'alamat_pemberi_tugas',
      'nomor_kontrak',
      'nilai_kontrak',
      'tanggal_selesai_kontrak',
      'tanggal_BA_selesai_serah_terima',
    ];
    return this.updateSheetData('db_pengalaman_perusahaan', headers, 'nomor_kontrak', nomorKontrak, data);
  }

  async deletePengalaman(nomorKontrak) {
    return this.deleteSheetData('db_pengalaman_perusahaan', 'nomor_kontrak', nomorKontrak);
  }

  // --- 7. DB KLBI (KBLI CLASSIFICATION) ---
  async getAllKBLI() {
    return this.getSheetData('db_klbi');
  }

  async getKBLIByKode(kode) {
    const allKBLI = await this.getAllKBLI();
    return allKBLI.find(k => k.kode_klbi === kode) || null;
  }

  async searchKBLI(keyword) {
    const allKBLI = await this.getAllKBLI();
    if (!keyword) return allKBLI;
    
    const searchTerm = keyword.toLowerCase();
    return allKBLI.filter(k => 
      k.kode_klbi.toLowerCase().includes(searchTerm) ||
      k.nama_klasifikasi.toLowerCase().includes(searchTerm)
    );
  }

  async addKBLI(data) {
    const headers = [
      'kode_klbi',
      'nama_klasifikasi'
    ];
    return this.addSheetData('db_klbi', headers, data);
  }

  async updateKBLI(kode, data) {
    const headers = [
      'kode_klbi',
      'nama_klasifikasi'
    ];
    return this.updateSheetData('db_klbi', headers, 'kode_klbi', kode, data);
  }

  async deleteKBLI(kode) {
    return this.deleteSheetData('db_klbi', 'kode_klbi', kode);
  }

  // --- 8. DB PROJECT (PROJECTS ONLY) ---
  async getAllProjects() {
    return this.getSheetData('db_project');
  }

  // --- 9. DB personel PROJECT (RELATION) ---
  async getAllpersonelProject() {
    const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERSONEL || process.env.GOOGLE_SHEET_ID_PERSONIL;
    if (!spreadsheetId) {
       // Fallback for safety if not configured, though likely to fail if not in default sheet
       console.warn('GOOGLE_SHEET_ID_PERSONEL not set for getAllpersonelProject');
       return this.getSheetData('db_personel_project');
    }
    return this.readSheet(spreadsheetId, 'db_personel_project');
  }

  async getpersonelProjectByProject(idProject) {
    const all = await this.getAllpersonelProject();
    return all.filter(p => p.id_project === idProject);
  }

  async addpersonelProject(data) {
    const headers = ['id_project', 'id_perusahaan', 'nik'];
    return this.addSheetData('db_personel_project', headers, data);
  }

  async deletepersonelProject(idProject, nik) {
    await this.initialize();

    try {
      const allData = await this.getAllpersonelProject();
      // Find index of the row matching both id_project and nik
      const index = allData.findIndex(p => p.id_project === idProject && p.nik === nik);

      if (index === -1) {
        throw new Error(`personel assignment not found for Project ${idProject} and NIK ${nik}`);
      }

      const spreadsheetId = process.env.GOOGLE_SHEET_ID;
      const tabs = await this.getSheetTabNames(spreadsheetId);
      const sheet = tabs.find(t => t.title === 'db_personel_project');
      
      if (!sheet) {
        throw new Error('Sheet db_personel_project not found');
      }

      // Row number to delete (index + 2 because row 1 is header, data starts at row 2, and index is 0-based from data array)
      // Wait, getSheetData slices(1). So index 0 is row 2.
      // So rowNumber = index + 1 (for 0-based API) or index + 2 (for 1-based A1 notation)?
      // batchUpdate deleteDimension uses 0-based index.
      // Row 1 (Header) is index 0. Row 2 (Data 0) is index 1.
      // So if index is 0 (first data row), we want to delete index 1.
      const rowIndex = index + 1;

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: sheet.sheetId,
                  dimension: 'ROWS',
                  startIndex: rowIndex,
                  endIndex: rowIndex + 1,
                },
              },
            },
          ],
        },
      });

      return { success: true, message: 'personel removed from project successfully' };
    } catch (error) {
      console.error('Error deleting personel project:', error);
      throw new Error(`Failed to remove personel from project: ${error.message}`);
    }
  }

  // Combined Getter
  async getProjectsByCompany(idPerusahaan) {
    const projects = await this.getSheetData('db_project');
    const companyProjects = projects.filter(p => p.id_perusahaan === idPerusahaan);
    
    const personelProject = await this.getSheetData('db_personel_project');
    
    // Join data
    return companyProjects.map(project => {
      const assignments = personelProject.filter(pp => pp.id_project === project.id_project);
      return {
        ...project,
        personel: assignments.map(a => ({
          nik: a.nik,
          id_perusahaan: a.id_perusahaan
          // We will fetch full personel details in frontend or here?
          // Better here if efficient, but frontend already has allpersonel.
          // Let's just return the NIKs and let frontend map names.
        }))
      };
    });
  }

  async getProjectsBypersonel(nik) {
    const personelProject = await this.getSheetData('db_personel_project');
    const assignments = personelProject.filter(pp => pp.nik === nik);
    
    const allProjects = await this.getAllProjects();
    
    return assignments.map(a => {
      const project = allProjects.find(p => p.id_project === a.id_project);
      return project ? { ...project, ...a } : a;
    }).filter(p => p.nama_project); // Filter out nulls
  }

  async addProject(data) {
    // Auto-generate ID if not provided
    if (!data.id_project) {
      const allProjects = await this.getAllProjects();
      const maxId = allProjects.reduce((max, p) => {
        const num = parseInt(p.id_project?.replace('PROJ', '') || '0');
        return num > max ? num : max;
      }, 0);
      data.id_project = `PROJ${String(maxId + 1).padStart(3, '0')}`;
    }

    const headers = [
      'id_project',
      'id_perusahaan',
      'nama_project'
    ];
    
    // Add data to Google Sheets
    const result = await this.addSheetData('db_project', headers, data);

    // Create subfolder in company folder in Google Drive
    if (data.id_perusahaan && data.nama_project) {
      try {
        const company = await this.getCompanyById(data.id_perusahaan);
        if (company) {
          const allCompanies = await this.getAllCompanies();
          const companyIndex = allCompanies.findIndex(c => c.id_perusahaan === data.id_perusahaan);
          
          if (companyIndex !== -1) {
            const companyFolderNumber = String(companyIndex + 1).padStart(2, '0');
            const companyFolderName = `${companyFolderNumber}.(${company.nama_perusahaan})`;
            const companyFolder = await oauth2GoogleService.findFolderByName(companyFolderName);
            
            if (companyFolder) {
              // Get all projects for this company to determine project number
              // Note: We use the new getProjectsByCompany which returns array
              const companyProjects = await this.getProjectsByCompany(data.id_perusahaan);
              const projectNumber = String(companyProjects.length).padStart(2, '0');
              const projectFolderName = `${projectNumber}.(${data.nama_project})`;
              
              const projectFolder = await oauth2GoogleService.createFolder(projectFolderName, companyFolder.id);
              console.log(`✅ Project folder created: ${companyFolderName}/${projectFolderName} (ID: ${projectFolder.id})`);
              
              result.projectFolderId = projectFolder.id;
              result.projectFolderLink = projectFolder.webViewLink;
              result.projectFolderName = projectFolderName;
            }
          }
        }
      } catch (driveError) {
        console.error('❌ Failed to create project folder:', driveError);
        result.folderError = driveError.message;
      }
    }

    return result;
  }

  async updateProject(idProject, data) {
    const headers = [
      'id_project',
      'id_perusahaan',
      'nama_project'
    ];
    
    // Get current project data to check if name changed
    const currentProject = await this.getProjectById(idProject);
    
    if (!currentProject) {
      throw new Error(`Project with ID ${idProject} not found`);
    }

    // Update data in Google Sheets
    const result = await this.updateSheetData('db_project', headers, 'id_project', idProject, data);

    // Check if nama_project changed
    if (data.nama_project && data.nama_project !== currentProject.nama_project) {
      try {
        const company = await this.getCompanyById(currentProject.id_perusahaan);
        if (company) {
          const allCompanies = await this.getAllCompanies();
          const companyIndex = allCompanies.findIndex(c => c.id_perusahaan === currentProject.id_perusahaan);
          
          if (companyIndex !== -1) {
            const companyFolderNumber = String(companyIndex + 1).padStart(2, '0');
            const companyFolderName = `${companyFolderNumber}.(${company.nama_perusahaan})`;
            const companyFolder = await oauth2GoogleService.findFolderByName(companyFolderName);
            
            if (companyFolder) {
              const companyProjects = await this.getProjectsByCompany(currentProject.id_perusahaan);
              const projectIndex = companyProjects.findIndex(p => p.id_project === idProject);
              
              if (projectIndex !== -1) {
                const projectNumber = String(projectIndex + 1).padStart(2, '0');
                const oldProjectFolderName = `${projectNumber}.(${currentProject.nama_project})`;
                const newProjectFolderName = `${projectNumber}.(${data.nama_project})`;
                
                const projectFolder = await oauth2GoogleService.findFolderByName(oldProjectFolderName, companyFolder.id);
                if (projectFolder) {
                  await oauth2GoogleService.renameFolderById(projectFolder.id, newProjectFolderName);
                  result.folderRenamed = true;
                  result.newProjectFolderName = newProjectFolderName;
                }
              }
            }
          }
        }
      } catch (driveError) {
        console.error('❌ Failed to rename project folder:', driveError);
        result.folderRenameError = driveError.message;
      }
    }

    return result;
  }

  async deleteProject(idProject) {
    // Get project data before deleting
    const project = await this.getProjectById(idProject);
    if (!project) throw new Error(`Project with ID ${idProject} not found`);

    // 1. Delete folder in Drive
    let folderDeleted = false;
    let folderDeleteError = null;
    
    try {
      const company = await this.getCompanyById(project.id_perusahaan);
      if (company) {
        const allCompanies = await this.getAllCompanies();
        const companyIndex = allCompanies.findIndex(c => c.id_perusahaan === project.id_perusahaan);
        
        if (companyIndex !== -1) {
          const companyFolderNumber = String(companyIndex + 1).padStart(2, '0');
          const companyFolderName = `${companyFolderNumber}.(${company.nama_perusahaan})`;
          const companyFolder = await oauth2GoogleService.findFolderByName(companyFolderName);
          
          if (companyFolder) {
            const companyProjects = await this.getProjectsByCompany(project.id_perusahaan);
            const projectIndex = companyProjects.findIndex(p => p.id_project === idProject);
            
            if (projectIndex !== -1) {
              const projectNumber = String(projectIndex + 1).padStart(2, '0');
              const projectFolderName = `${projectNumber}.(${project.nama_project})`;
              const projectFolder = await oauth2GoogleService.findFolderByName(projectFolderName, companyFolder.id);
              
              if (projectFolder) {
                await oauth2GoogleService.deleteFolderById(projectFolder.id);
                folderDeleted = true;
              }
            }
          }
        }
      }
    } catch (driveError) {
      console.error('❌ Failed to delete project folder:', driveError);
      folderDeleteError = driveError.message;
    }

    // 2. Delete all personel assignments for this project
    // We need to implement a way to delete multiple rows or iterate
    const allpersonelProject = await this.getAllpersonelProject();
    const assignmentsToDelete = allpersonelProject.filter(p => p.id_project === idProject);
    
    // Note: This is inefficient if we have many assignments, but with current simple sheet implementation:
    // We might need to implement a 'deleteRowsByFilter' in the base class later.
    // For now, we will skip this step or assume the user handles it, OR we implement a loop in the route handler?
    // Actually, let's try to delete them. 
    // Since we don't have a unique ID for personel_project, we can't easily delete them one by one with deleteSheetData(key).
    // This is a limitation of the current simple service.
    // Recommendation: Add 'id_assignment' to db_personel_project.
    // But for now, let's just delete the project. The orphan records in db_personel_project might remain.
    // I will add a TODO.
    
    // 3. Delete project from db_project
    const result = await this.deleteSheetData('db_project', 'id_project', idProject);

    result.folderDeleted = folderDeleted;
    if (folderDeleteError) result.folderDeleteError = folderDeleteError;

    return result;
  }

  // Helper: Get personel for a company (through db_personel_project)
  async getpersonelByCompany(idPerusahaan) {
    // Get all projects for this company
    const projects = await this.getProjectsByCompany(idPerusahaan);
    const projectIds = projects.map(p => p.id_project);
    
    // Get all assignments
    const allAssignments = await this.getAllpersonelProject();
    const companyAssignments = allAssignments.filter(a => projectIds.includes(a.id_project));
    
    // Get unique NIKs
    const niks = [...new Set(companyAssignments.map(a => a.nik))];
    
    // Get personel details
    const allpersonel = await this.getAllpersonelNew();
    return allpersonel.filter(personel => niks.includes(personel.nik));
  }

  // Helper: Get companies for a personel
  async getCompaniesBypersonel(nik) {
    const assignments = await this.getSheetData('db_personel_project');
    const personelAssignments = assignments.filter(a => a.nik === nik);
    const companyIds = [...new Set(personelAssignments.map(a => a.id_perusahaan))];
    
    const allCompanies = await this.getAllCompanies();
    return allCompanies.filter(c => companyIds.includes(c.id_perusahaan));
  }

  // ========================================
  // PERSONNEL DOCUMENTS CRUD (KTP, NPWP, IJAZAH, CV)
  // ========================================

  // --- KTP ---
  async addKtp(data) {
    // IMPORTANT: Headers MUST match EXACT column order in db_ktp sheet!
    const headers = [
      'id_ktp',                 // Auto-generated
      'id_personel',
      'nik',
      'nama_ktp',
      'tempat_lahir_ktp',
      'tanggal_lahir_ktp',
      'jenis_kelamin',
      'golongan_darah',
      'alamat_ktp',
      'rt_rw',
      'kelurahan_desa',
      'kecamatan',
      'kota_kabupaten',
      'provinsi',
      'agama',
      'status_perkawinan',
      'pekerjaan',
      'kewarganegaraan',
      'berlaku_hingga',
      'tanggal_terbit_ktp',
      'file_ktp_url',
      'tanggal_input',
      'author'
    ];
    return this.addSheetDataPersonel('db_ktp', headers, data);
  }

  async updateKtp(idPersonel, data) {
    const headers = [
      'id_personel',
      'nik',
      'nama_ktp',
      'tempat_lahir_ktp',
      'tanggal_lahir_ktp',
      'jenis_kelamin',
      'alamat_ktp',
      'berlaku_hingga',
      'file_ktp_url'
    ];
    return this.updateSheetDataPersonel('db_ktp', headers, 'id_personel', idPersonel, data);
  }

  async deleteKtp(idPersonel) {
    return this.deleteSheetDataPersonel('db_ktp', 'id_personel', idPersonel);
  }

  // --- NPWP ---
  async addNpwp(data) {
    // IMPORTANT: Must match EXACT column order in db_npwp_personel sheet!
    const headers = [
      'id_npwp_personel',               // Auto-generated
      'id_personel',
      'nomor_npwp_personel',
      'nik_npwp_personel',
      'nama_npwp_personel',
      'alamat_npwp_personel',
      'kelurahan_npwp_personel',
      'kecamatan_npwp_personel',
      'kota_npwp_personel',
      'provinsi_npwp_personel',
      'kode_pos_npwp_personel',
      'kpp_npwp_personel',
      'tanggal_terdaftar_npwp_personel',
      'file_npwp_personel_url',
      'tanggal_input',
      'author'
    ];
    return this.addSheetDataPersonel('db_npwp_personel', headers, data);
  }

  async updateNpwp(idPersonel, data) {
    const headers = [
      'id_personel',
      'nomor_npwp_personel',
      'nik_npwp_personel',
      'nama_npwp_personel',
      'alamat_npwp_personel',
      'kpp_npwp_personel',
      'file_npwp_personel_url'
    ];
    return this.updateSheetDataPersonel('db_npwp_personel', headers, 'id_personel', idPersonel, data);
  }

  async deleteNpwp(idPersonel) {
    return this.deleteSheetDataPersonel('db_npwp_personel', 'id_personel', idPersonel);
  }

  // --- IJAZAH ---
  async addIjazah(data) {
    const headers = [
      'id_ijazah',              // Auto-generated
      'id_personel',
      'jenjang_pendidikan',
      'nama_institusi_pendidikan',
      'fakultas',
      'program_studi',
      'nomor_ijazah',
      'tahun_masuk',
      'tahun_lulus',
      'gelar_akademik',
      'ipk',
      'file_ijazah_url',
      'tanggal_input',
      'author'
    ];
    return this.addSheetDataPersonel('db_ijazah', headers, data);
  }

  async updateIjazah(idPersonel, data) {
    const headers = [
      'id_personel',
      'jenjang_pendidikan',
      'nama_institusi_pendidikan',
      'fakultas',
      'program_studi',
      'nomor_ijazah',
      'tahun_masuk',
      'tahun_lulus',
      'gelar_akademik',
      'ipk',
      'file_ijazah_url'
    ];
    return this.updateSheetDataPersonel('db_ijazah', headers, 'id_personel', idPersonel, data);
  }

  async deleteIjazah(idPersonel) {
    return this.deleteSheetDataPersonel('db_ijazah', 'id_personel', idPersonel);
  }

  // --- CV ---
  async addCv(data) {
    const headers = [
      'id_cv',                  // Auto-generated
      'id_personel',
      'nama_lengkap_cv',
      'ringkasan_profil',
      'keahlian_utama',
      'total_pengalaman_tahun',
      'pengalaman_kerja_terakhir',
      'sertifikasi_profesional',
      'bahasa_dikuasai',
      'file_cv_url',
      'tanggal_input',
      'author'
    ];
    return this.addSheetDataPersonel('db_cv', headers, data);
  }

  async updateCv(idPersonel, data) {
    const headers = [
      'id_personel',
      'nama_lengkap_cv',
      'ringkasan_profil',
      'keahlian_utama',
      'total_pengalaman_tahun',
      'pengalaman_kerja_terakhir',
      'sertifikasi_profesional',
      'bahasa_dikuasai',
      'file_cv_url'
    ];
    return this.updateSheetDataPersonel('db_cv', headers, 'id_personel', idPersonel, data);
  }

  async deleteCv(idPersonel) {
    return this.deleteSheetDataPersonel('db_cv', 'id_personel', idPersonel);
  }

  // Helper functions for personnel document sheets (uses PERSONEL spreadsheet)
  async addSheetDataPersonel(sheetName, headers, data) {
    await this.initialize();

    try {
      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERSONEL || process.env.GOOGLE_SHEET_ID_PERSONIL;
      const currentData = await this.readSheet(spreadsheetId, sheetName);
      const nextRow = currentData.length + 2;

      // Auto-generate ID if needed (for id_ktp, id_npwp, etc.)
      if (headers[0].startsWith('id_') && !data[headers[0]]) {
        // Map sheet names to proper prefixes
        const prefixMap = {
          'db_ktp': 'KTP',
          'db_npwp_personel': 'NPWPP',
          'db_ijazah': 'IJAZAH',
          'db_cv': 'CV'
        };
        const prefix = prefixMap[sheetName] || sheetName.replace('db_', '').toUpperCase();
        const count = currentData.length + 1;
        data[headers[0]] = `${prefix}${String(count).padStart(3, '0')}`;
      }

      // Auto-generate tanggal_input if field exists in headers
      if (headers.includes('tanggal_input') && !data.tanggal_input) {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const hours = String(now.getHours()).padStart(2, '0');
        const minutes = String(now.getMinutes()).padStart(2, '0');
        const seconds = String(now.getSeconds()).padStart(2, '0');
        data.tanggal_input = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      }

      // Auto-fill author from OAuth2 user (username tanpa @domain)
      if (headers.includes('author') && !data.author) {
        try {
          const userInfo = await oauth2GoogleService.getUserInfo();
          data.author = userInfo.username; // Tanpa @gmail.com
        } catch (error) {
          console.warn('Could not get user info for author, using "system":', error.message);
          data.author = 'system';
        }
      }

      const values = headers.map(header => data[header] || '');

      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${sheetName}!A${nextRow}`,
        valueInputOption: 'RAW',
        resource: { values: [values] },
      });

      return {
        success: true,
        message: `Data added to ${sheetName} successfully`,
      };
    } catch (error) {
      throw new Error(`Failed to add data to ${sheetName}: ${error.message}`);
    }
  }

  async updateSheetDataPersonel(sheetName, headers, idField, id, data) {
    await this.initialize();

    try {
      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERSONEL || process.env.GOOGLE_SHEET_ID_PERSONIL;
      const allData = await this.readSheet(spreadsheetId, sheetName);
      const index = allData.findIndex(item => item[idField] === id);

      if (index === -1) {
        throw new Error(`Data with ${idField} = ${id} not found in ${sheetName}`);
      }

      const rowNumber = index + 2;

      const updatedData = { ...allData[index], ...data };
      const values = headers.map(header => updatedData[header] || '');

      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A${rowNumber}`,
        valueInputOption: 'RAW',
        resource: { values: [values] },
      });

      return {
        success: true,
        message: `Data in ${sheetName} updated successfully`,
      };
    } catch (error) {
      throw new Error(`Failed to update data in ${sheetName}: ${error.message}`);
    }
  }

  async deleteSheetDataPersonel(sheetName, idField, id) {
    await this.initialize();

    try {
      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERSONEL || process.env.GOOGLE_SHEET_ID_PERSONIL;
      const allData = await this.readSheet(spreadsheetId, sheetName);
      const index = allData.findIndex(item => item[idField] === id);

      if (index === -1) {
        throw new Error(`Data with ${idField} = ${id} not found in ${sheetName}`);
      }

      const tabs = await this.getSheetTabNames(spreadsheetId);
      const tab = tabs.find(t => t.title === sheetName);

      if (!tab) {
        throw new Error(`Sheet ${sheetName} not found in spreadsheet`);
      }

      const rowNumber = index + 1; // 0-based index for batchUpdate

      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: tab.sheetId,
                  dimension: 'ROWS',
                  startIndex: rowNumber,
                  endIndex: rowNumber + 1,
                },
              },
            },
          ],
        },
      });

      return {
        success: true,
        message: `Data in ${sheetName} deleted successfully`,
      };
    } catch (error) {
      throw new Error(`Failed to delete data from ${sheetName}: ${error.message}`);
    }
  }
}

// Export singleton instance
const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;
