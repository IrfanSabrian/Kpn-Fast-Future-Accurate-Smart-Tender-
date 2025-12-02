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
      const spreadsheetId = process.env.GOOGLE_SHEET_ID;
      
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
      const spreadsheetId = process.env.GOOGLE_SHEET_ID;
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

      const spreadsheetId = process.env.GOOGLE_SHEET_ID;
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

      const spreadsheetId = process.env.GOOGLE_SHEET_ID;
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
      const spreadsheetId = process.env.GOOGLE_SHEET_ID;
      
      // Use specific sheet name for personil data
      const personilTabName = 'db_personil';

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
      const spreadsheetId = process.env.GOOGLE_SHEET_ID;
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

      const spreadsheetId = process.env.GOOGLE_SHEET_ID;
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

      const spreadsheetId = process.env.GOOGLE_SHEET_ID;
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
      const spreadsheetId = process.env.GOOGLE_SHEET_ID;
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
   * Generic function to add data to a sheet
   * @param {string} sheetName - Name of the sheet
   * @param {Array} headers - Array of column headers
   * @param {Object} data - Data object to add
   * @returns {Object} Result object
   */
  async addSheetData(sheetName, headers, data) {
    await this.initialize();

    try {
      const spreadsheetId = process.env.GOOGLE_SHEET_ID;
      const currentData = await this.getSheetData(sheetName);
      const nextRow = currentData.length + 2;

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

      const spreadsheetId = process.env.GOOGLE_SHEET_ID;
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

      const spreadsheetId = process.env.GOOGLE_SHEET_ID;
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
    return this.getSheetData('db_perusahaan');
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
    ];
    
    // Generate ID if not provided
    if (!data.id_perusahaan) {
      const companies = await this.getAllCompanies();
      data.id_perusahaan = `COMP${String(companies.length + 1).padStart(3, '0')}`;
    }

    return this.addSheetData('db_perusahaan', headers, data);
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
    return this.updateSheetData('db_perusahaan', headers, 'id_perusahaan', id, data);
  }

  async deleteCompany(id) {
    return this.deleteSheetData('db_perusahaan', 'id_perusahaan', id);
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
      'id_perusahaan',
      'nama',
      'nik',
      'jabatan',
      'alamat',
      'no_telp',
    ];
    return this.addSheetData('db_pejabat', headers, data);
  }

  async updatePejabat(nik, data) {
    const headers = [
      'id_perusahaan',
      'nama',
      'nik',
      'jabatan',
      'alamat',
      'no_telp',
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

  // --- 5. DB PERSONIL (Updated) ---
  async getAllPersonilNew(idPerusahaan = null) {
    const allPersonil = await this.getSheetData('db_personil');
    if (idPerusahaan) {
      return allPersonil.filter(p => p.id_perusahaan === idPerusahaan);
    }
    return allPersonil;
  }

  async addPersonilNew(data) {
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
    return this.addSheetData('db_personil', headers, data);
  }

  async updatePersonilNew(nama, data) {
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
    return this.updateSheetData('db_personil', headers, 'nama', nama, data);
  }

  async deletePersonilNew(nama) {
    return this.deleteSheetData('db_personil', 'nama', nama);
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

  // --- 8. DB PROJECT (PROJECTS WITH COMPANY & PERSONIL) ---
  async getAllProjects() {
    return this.getSheetData('db_project');
  }

  async getProjectById(idProject) {
    const allProjects = await this.getAllProjects();
    return allProjects.find(p => p.id_project === idProject) || null;
  }

  async getProjectsByCompany(idPerusahaan) {
    const allProjects = await this.getAllProjects();
    return allProjects.filter(p => p.id_perusahaan === idPerusahaan);
  }

  async getProjectsByPersonil(nik) {
    const allProjects = await this.getAllProjects();
    return allProjects.filter(p => p.nik === nik);
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
      'nama_project',
      'nik'
    ];
    return this.addSheetData('db_project', headers, data);
  }

  async updateProject(idProject, data) {
    const headers = [
      'id_project',
      'id_perusahaan',
      'nama_project',
      'nik'
    ];
    return this.updateSheetData('db_project', headers, 'id_project', idProject, data);
  }

  async deleteProject(idProject) {
    return this.deleteSheetData('db_project', 'id_project', idProject);
  }

  // Helper: Get personil for a company (through db_project)
  async getPersonilByCompany(idPerusahaan) {
    const projects = await this.getProjectsByCompany(idPerusahaan);
    const allPersonil = await this.getAllPersonilNew();
    
    const niks = [...new Set(projects.map(p => p.nik))]; // Unique NIKs
    return allPersonil.filter(personil => niks.includes(personil.nik));
  }

  // Helper: Get companies for a personil (through db_project)
  async getCompaniesByPersonil(nik) {
    const projects = await this.getProjectsByPersonil(nik);
    const allCompanies = await this.getAllCompanies();
    
    const companyIds = [...new Set(projects.map(p => p.id_perusahaan))]; // Unique IDs
    return allCompanies.filter(company => companyIds.includes(company.id_perusahaan));
  }
}

// Export singleton instance
const googleSheetsService = new GoogleSheetsService();
export default googleSheetsService;
