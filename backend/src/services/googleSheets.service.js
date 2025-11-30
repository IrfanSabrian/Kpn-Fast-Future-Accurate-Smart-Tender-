/**
 * Google Sheets Service
 * 
 * Service untuk interact dengan Google Sheets sebagai database
 * Handles CRUD operations untuk:
 * - Profil Perusahaan
 * - Data Personil/Tenaga Ahli
 */

// Google Sheets Service - Updated Logic
import { google } from 'googleapis';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class GoogleSheetsService {
  constructor() {
    this.auth = null;
    this.sheets = null;
    this.initialized = false;
  }

  /**
   * Initialize Google Sheets API
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
          'https://www.googleapis.com/auth/spreadsheets',
          'https://www.googleapis.com/auth/drive.file',
        ],
      });

      this.sheets = google.sheets({ version: 'v4', auth: this.auth });
      this.initialized = true;

      console.log('✅ Google Sheets Service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Google Sheets Service:', error);
      throw error;
    }
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
      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PROFIL;
      
      // Find tab specific for Company Profile
      const tabs = await this.getSheetTabNames(spreadsheetId);
      let profilTabName = tabs.find(t => t.title.toLowerCase().includes('profil') || t.title.toLowerCase().includes('company'))?.title;
      
      // If not found, use the first one but log warning
      if (!profilTabName) {
        console.warn('⚠️ Specific "Profil" tab not found, using first tab:', tabs[0].title);
        profilTabName = tabs[0].title;
      }

      // Read all data
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${profilTabName}!A1:I1000`,
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
          // Normalize header: lowercase and replace spaces with underscores
          const key = header.toLowerCase().replace(/\s+/g, '_');
          profil[key] = row[index] || '';
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
      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PROFIL;
      const tabs = await this.getSheetTabNames(spreadsheetId);
      const profilTabName = tabs[0].title;

      // Get current data to find next row
      const currentData = await this.getAllProfilPerusahaan();
      const nextRow = currentData.length + 2;

      // Expected headers (with id_perusahaan first)
      const headers = [
        'id_perusahaan',
        'nama_perusahaan',
        'npwp',
        'email',
        'alamat',
        'direktur',
        'bidang_usaha',
        'tahun_berdiri',
        'sertifikat_sbu',
      ];

      // Generate ID if not provided
      if (!data.id_perusahaan) {
        data.id_perusahaan = `C${String(currentData.length + 1).padStart(3, '0')}`;
      }

      // Prepare values
      const values = headers.map(header => data[header] || '');

      // Append row
      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${profilTabName}!A${nextRow}:I${nextRow}`,
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

      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PROFIL;
      const tabs = await this.getSheetTabNames(spreadsheetId);
      let profilTabName = tabs.find(t => t.title.toLowerCase().includes('profil') || t.title.toLowerCase().includes('company'))?.title;
      
      if (!profilTabName) {
        profilTabName = tabs[0].title;
      }

      // Row number
      const rowNumber = index + 2;

      const headers = [
        'id_perusahaan',
        'nama_perusahaan',
        'npwp',
        'email',
        'alamat',
        'direktur',
        'bidang_usaha',
        'tahun_berdiri',
        'sertifikat_sbu',
      ];

      // Merge existing data with updates
      const updatedData = { ...allProfiles[index], ...data };
      const values = headers.map(header => updatedData[header] || '');

      // Update row
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${profilTabName}!A${rowNumber}:I${rowNumber}`,
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
   * Delete company profile by ID
   * @param {string} id - Company ID
   */
  async deleteProfilPerusahaan(id) {
    await this.initialize();

    try {
      const allProfiles = await this.getAllProfilPerusahaan();
      const index = allProfiles.findIndex(p => p.id_perusahaan === id);

      if (index === -1) {
        throw new Error(`Company with ID ${id} not found`);
      }

      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PROFIL;
      const tabs = await this.getSheetTabNames(spreadsheetId);
      const profilTab = tabs[0];

      // Row number to delete
      const rowNumber = index + 1;

      // Delete row
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: profilTab.sheetId,
                  dimension: 'ROWS',
                  startIndex: rowNumber,
                  endIndex: rowNumber + 1,
                },
              },
            },
          ],
        },
      });

      return { success: true, message: 'Company profile deleted successfully' };
    } catch (error) {
      console.error('Error deleting profil perusahaan:', error);
      throw new Error(`Failed to delete profile: ${error.message}`);
    }
  }

  // ========================================
  // DATA PERSONIL
  // ========================================

  /**
   * Get all personnel data
   * @returns {Array} List of personnel
   */
  async getAllPersonil() {
    await this.initialize();

    try {
      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERSONIL;
      const tabs = await this.getSheetTabNames(spreadsheetId);
      
      // Get second tab if exists, otherwise first
      const personilTabName = tabs.length > 1 ? tabs[1].title : tabs[0].title;

      // Read all data - using explicit row limit to ensure all data retrieved
      const response = await this.sheets.spreadsheets.values.get({
        spreadsheetId,
        range: `${personilTabName}!A1:H1000`, // Read up to 1000 rows
      });

      const rows = response.data.values;
      
      if (!rows || rows.length < 2) {
        return []; // No data yet
      }

      const headers = rows[0];
      const dataRows = rows.slice(1);

      // Map to array of objects, filter out empty rows
      return dataRows
        .filter(row => row && row.length > 0 && row[0]) // Filter empty rows
        .map(row => {
          const personil = {};
          headers.forEach((header, index) => {
            personil[header] = row[index] || '';
          });
          return personil;
        });
    } catch (error) {
      console.error('Error getting personil:', error);
      throw new Error(`Failed to get personil: ${error.message}`);
    }
  }

  /**
   * Get single personnel by ID
   * @param {string} id - Personnel ID
   */
  async getPersonilById(id) {
    const allPersonil = await this.getAllPersonil();
    return allPersonil.find(p => p.id_personil === id) || null;
  }

  /**
   * Add new personnel
   * @param {Object} data - Personnel data
   */
  async addPersonil(data) {
    await this.initialize();

    try {
      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERSONIL;
      const tabs = await this.getSheetTabNames(spreadsheetId);
      const personilTabName = tabs.length > 1 ? tabs[1].title : tabs[0].title;

      // Get current data to find next row
      const currentData = await this.getAllPersonil();
      const nextRow = currentData.length + 2; // +1 for header, +1 for next empty

      // Expected headers
      const headers = [
        'id_personil',
        'nama',
        'posisi',
        'pendidikan',
        'pengalaman_tahun',
        'sertifikat',
        'email',
        'telepon',
      ];

      // Generate ID if not provided
      if (!data.id_personil) {
        data.id_personil = `P${String(currentData.length + 1).padStart(3, '0')}`;
      }

      // Prepare values
      const values = headers.map(header => data[header] || '');

      // Append row
      await this.sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `${personilTabName}!A${nextRow}:H${nextRow}`,
        valueInputOption: 'RAW',
        resource: {
          values: [values],
        },
      });

      return { 
        success: true, 
        message: 'Personil added successfully',
        data: { id_personil: data.id_personil }
      };
    } catch (error) {
      console.error('Error adding personil:', error);
      throw new Error(`Failed to add personil: ${error.message}`);
    }
  }

  /**
   * Update personnel by ID
   * @param {string} id - Personnel ID
   * @param {Object} data - Updated data
   */
  async updatePersonil(id, data) {
    await this.initialize();

    try {
      const allPersonil = await this.getAllPersonil();
      const index = allPersonil.findIndex(p => p.id_personil === id);

      if (index === -1) {
        throw new Error(`Personil with ID ${id} not found`);
      }

      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERSONIL;
      const tabs = await this.getSheetTabNames(spreadsheetId);
      const personilTabName = tabs.length > 1 ? tabs[1].title : tabs[0].title;

      // Row number (index + 2, because index 0 = row 2)
      const rowNumber = index + 2;

      const headers = [
        'id_personil',
        'nama',
        'posisi',
        'pendidikan',
        'pengalaman_tahun',
        'sertifikat',
        'email',
        'telepon',
      ];

      // Merge existing data with updates
      const updatedData = { ...allPersonil[index], ...data };
      const values = headers.map(header => updatedData[header] || '');

      // Update row
      await this.sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${personilTabName}!A${rowNumber}:H${rowNumber}`,
        valueInputOption: 'RAW',
        resource: {
          values: [values],
        },
      });

      return { success: true, message: 'Personil updated successfully' };
    } catch (error) {
      console.error('Error updating personil:', error);
      throw new Error(`Failed to update personil: ${error.message}`);
    }
  }

  /**
   * Delete personnel by ID
   * @param {string} id - Personnel ID
   */
  async deletePersonil(id) {
    await this.initialize();

    try {
      const allPersonil = await this.getAllPersonil();
      const index = allPersonil.findIndex(p => p.id_personil === id);

      if (index === -1) {
        throw new Error(`Personil with ID ${id} not found`);
      }

      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERSONIL;
      const tabs = await this.getSheetTabNames(spreadsheetId);
      const personilTab = tabs.length > 1 ? tabs[1] : tabs[0];

      // Row number to delete
      const rowNumber = index + 1; // +1 because row 1 is header, data starts at row 2

      // Delete row using batchUpdate
      await this.sheets.spreadsheets.batchUpdate({
        spreadsheetId,
        resource: {
          requests: [
            {
              deleteDimension: {
                range: {
                  sheetId: personilTab.sheetId,
                  dimension: 'ROWS',
                  startIndex: rowNumber,
                  endIndex: rowNumber + 1,
                },
              },
            },
          ],
        },
      });

      return { success: true, message: 'Personil deleted successfully' };
    } catch (error) {
      console.error('Error deleting personil:', error);
      throw new Error(`Failed to delete personil: ${error.message}`);
    }
  }
}

// Export singleton instance
const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;
