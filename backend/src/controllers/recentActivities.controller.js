/**
 * Recent Activities Controller
 * Get recent activities from PERSONEL and PERUSAHAAN spreadsheets
 */

import googleSheetsService from '../services/googleSheets.service.js';

/**
 * Get recent activities (combined from multiple sheets)
 * Returns last 10 activities sorted by timestamp
 */
export const getRecentActivities = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const activities = [];

    // Fetch recent data from PERSONEL sheets
    try {
      // Get spreadsheet ID for PERSONEL
      const spreadsheetId = process.env.GOOGLE_SHEET_ID_PERSONEL || process.env.GOOGLE_SHEET_ID_PERSONIL;
      
      const [personelData, ktpData, npwpData, ijazahData, cvData] = await Promise.all([
        googleSheetsService.getAllPersonil().catch(() => []),
        googleSheetsService.readSheet(spreadsheetId, 'db_ktp').catch(() => []),
        googleSheetsService.readSheet(spreadsheetId, 'db_npwp_personel').catch(() => []),
        googleSheetsService.readSheet(spreadsheetId, 'db_ijazah').catch(() => []),
        googleSheetsService.readSheet(spreadsheetId, 'db_cv').catch(() => [])
      ]);

      // Add PERSONEL activities
      personelData.slice(-5).forEach(item => {
        if (item.tanggal_input) {
          activities.push({
            type: 'personel',
            action: 'Menambah Personel',
            target: item.nama_lengkap || 'Unknown',
            timestamp: item.tanggal_input,
            author: item.author || 'system',
            icon: 'fa-user-plus',
            color: 'text-blue-500'
          });
        }
      });

      // Add KTP activities
      ktpData.slice(-5).forEach(item => {
        if (item.tanggal_input) {
          activities.push({
            type: 'ktp',
            action: 'Upload KTP',
            target: item.nama_ktp || 'Unknown',
            timestamp: item.tanggal_input,
            author: item.author || 'system',
            icon: 'fa-id-card',
            color: 'text-cyan-500'
          });
        }
      });

      // Add NPWP activities
      npwpData.slice(-5).forEach(item => {
        if (item.tanggal_input) {
          activities.push({
            type: 'npwp',
            action: 'Upload NPWP',
            target: item.nama_npwp_personel || 'Unknown',
            timestamp: item.tanggal_input,
            author: item.author || 'system',
            icon: 'fa-file-invoice',
            color: 'text-orange-500'
          });
        }
      });

      // Add Ijazah activities
      ijazahData.slice(-5).forEach(item => {
        if (item.tanggal_input) {
          activities.push({
            type: 'ijazah',
            action: 'Upload Ijazah',
            target: `${item.jenjang_pendidikan || ''} - ${item.program_studi || 'Unknown'}`,
            timestamp: item.tanggal_input,
            author: item.author || 'system',
            icon: 'fa-graduation-cap',
            color: 'text-purple-500'
          });
        }
      });

      // Add CV activities
      cvData.slice(-5).forEach(item => {
        if (item.tanggal_input) {
          activities.push({
            type: 'cv',
            action: 'Upload CV',
            target: item.nama_lengkap_cv || 'Unknown',
            timestamp: item.tanggal_input,
            author: item.author || 'system',
            icon: 'fa-file-alt',
            color: 'text-emerald-500'
          });
        }
      });
    } catch (error) {
      console.warn('Failed to fetch PERSONEL activities:', error.message);
    }

    // Fetch recent data from PERUSAHAAN sheets
    try {
      const [companiesData, aktaData] = await Promise.all([
        googleSheetsService.getAllCompanies().catch(() => []),
        googleSheetsService.getSheetData('db_akta').catch(() => [])
      ]);

      // Add Company activities
      companiesData.slice(-5).forEach(item => {
        if (item.tanggal_input) {
          activities.push({
            type: 'company',
            action: 'Menambah Perusahaan',
            target: item.nama_perusahaan || 'Unknown',
            timestamp: item.tanggal_input,
            author: item.author || 'system',
            icon: 'fa-building',
            color: 'text-indigo-500'
          });
        }
      });

      // Add Akta activities
      aktaData.slice(-5).forEach(item => {
        if (item.tanggal_input) {
          activities.push({
            type: 'akta',
            action: 'Upload Akta',
            target: `${item.jenis_akta || ''} ${item.nomor_akta || ''}`,
            timestamp: item.tanggal_input,
            author: item.author || 'system',
            icon: 'fa-file-contract',
            color: 'text-amber-500'
          });
        }
      });
    } catch (error) {
      console.warn('Failed to fetch PERUSAHAAN activities:', error.message);
    }

    // Sort by timestamp (newest first) and limit
    activities.sort((a, b) => {
      const timeA = new Date(a.timestamp).getTime();
      const timeB = new Date(b.timestamp).getTime();
      return timeB - timeA; // Descending
    });

    const recentActivities = activities.slice(0, limit);

    res.json({
      success: true,
      count: recentActivities.length,
      data: recentActivities
    });

  } catch (error) {
    console.error('Error in getRecentActivities:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to get recent activities',
      data: []
    });
  }
};
