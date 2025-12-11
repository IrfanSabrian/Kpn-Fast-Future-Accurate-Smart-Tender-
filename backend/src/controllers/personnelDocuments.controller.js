/**
 * Personnel Documents Controller
 * 
 * Handles HTTP requests untuk personnel documents management (KTP, NPWP, Ijazah, CV)
 */

import googleSheetsService from '../services/googleSheets.service.js';
import oauth2GoogleService from '../services/oauth2Google.service.js'; // Universal OAuth2 service for all Google APIs

// ==================== KTP ====================

export const addKtp = async (req, res) => {
  try {
    const { personelId } = req.params;
    const data = req.body;
    const file = req.file;

    // Validate required file
    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'File PDF KTP is required',
      });
    }

    // Get personnel data to get name for folder structure
    const personel = await googleSheetsService.getPersonilById(personelId);
    if (!personel) {
      return res.status(404).json({
        success: false,
        message: `Personnel with ID ${personelId} not found`,
      });
    }

    const namaPersonel = personel.nama_lengkap;

    // Upload PDF to Google Drive
    // Structure: Data/02. Personel/[nama personel]/01. Kartu Tanda Penduduk/KTP [nama personel].pdf
    const folderPath = ['02. Personel', namaPersonel, '01. Kartu Tanda Penduduk'];
    const fileName = `KTP ${namaPersonel}.pdf`;

    const uploadResult = await oauth2GoogleService.uploadPdfFile(
      file.buffer,
      fileName,
      file.mimetype,
      folderPath
    );

    // Add KTP data to Google Sheets (ALL fields to prevent column misalignment)
    const ktpData = {
      id_personel: personelId,
      nik: data.nik || '',
      nama_ktp: data.nama_ktp || namaPersonel,
      tempat_lahir_ktp: data.tempat_lahir_ktp || '',
      tanggal_lahir_ktp: data.tanggal_lahir_ktp || '',
      jenis_kelamin: data.jenis_kelamin || '',
      golongan_darah: data.golongan_darah || '',
      alamat_ktp: data.alamat_ktp || '',
      rt_rw: data.rt_rw || '',
      kelurahan_desa: data.kelurahan_desa || '',
      kecamatan: data.kecamatan || '',
      kota_kabupaten: data.kota_kabupaten || '',
      provinsi: data.provinsi || '',
      agama: data.agama || '',
      status_perkawinan: data.status_perkawinan || '',
      pekerjaan: data.pekerjaan || '',
      kewarganegaraan: data.kewarganegaraan || '',
      berlaku_hingga: data.berlaku_hingga || 'SEUMUR HIDUP',
      tanggal_terbit_ktp: data.tanggal_terbit_ktp || '',
      file_ktp_url: uploadResult.webViewLink || ''
    };

    const result = await googleSheetsService.addKtp(ktpData);

    res.status(201).json({
      success: true,
      message: 'KTP added successfully',
      data: {
        ...result,
        fileUrl: uploadResult.webViewLink
      }
    });
  } catch (error) {
    console.error('Error in addKtp:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add KTP',
    });
  }
};

export const updateKtp = async (req, res) => {
  try {
    const { personelId } = req.params;
    const data = req.body;
    const file = req.file;

    // Get current KTP data
    const personel = await googleSheetsService.getPersonilById(personelId);
    if (!personel || !personel.ktp) {
      return res.status(404).json({
        success: false,
        message: 'KTP data not found',
      });
    }

    const namaPersonel = personel.nama_lengkap;
    let fileUrl = personel.ktp.file_ktp_url;

    // If new file uploaded, delete old file and upload new one
    if (file) {
      // Delete old file if exists
      if (fileUrl) {
        const oldFileId = oauth2GoogleService.extractFileIdFromUrl(fileUrl);
        if (oldFileId) {
          try {
            await oauth2GoogleService.deleteFile(oldFileId);
          } catch (err) {
            console.warn('Could not delete old file:', err.message);
          }
        }
      }

      // Upload new file
      const folderPath = ['02. Personel', namaPersonel, '01. Kartu Tanda Penduduk'];
      const fileName = `KTP ${namaPersonel}.pdf`;

      const uploadResult = await oauth2GoogleService.uploadPdfFile(
        file.buffer,
        fileName,
        file.mimetype,
        folderPath
      );

      fileUrl = uploadResult.webViewLink;
    }

    // Update KTP data in Google Sheets
    const ktpData = {
      ...data,
      file_ktp_url: fileUrl
    };

    const result = await googleSheetsService.updateKtp(personelId, ktpData);

    res.json({
      success: true,
      message: 'KTP updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in updateKtp:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update KTP',
    });
  }
};

export const deleteKtp = async (req, res) => {
  try {
    const { personelId } = req.params;

    // Get current KTP data to get file URL
    const personel = await googleSheetsService.getPersonilById(personelId);
    if (!personel || !personel.ktp) {
      return res.status(404).json({
        success: false,
        message: 'KTP data not found',
      });
    }

    // Delete file from Google Drive
    const fileUrl = personel.ktp.file_ktp_url;
    if (fileUrl) {
      const fileId = oauth2GoogleService.extractFileIdFromUrl(fileUrl);
      if (fileId) {
        try {
          await oauth2GoogleService.deleteFile(fileId);
        } catch (err) {
          console.warn('Could not delete file:', err.message);
        }
      }
    }

    // Delete KTP data from Google Sheets
    const result = await googleSheetsService.deleteKtp(personelId);

    res.json({
      success: true,
      message: 'KTP deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in deleteKtp:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete KTP',
    });
  }
};

// ==================== NPWP ====================

export const addNpwp = async (req, res) => {
  try {
    const { personelId } = req.params;
    const data = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'File PDF NPWP is required',
      });
    }

    const personel = await googleSheetsService.getPersonilById(personelId);
    if (!personel) {
      return res.status(404).json({
        success: false,
        message: `Personnel with ID ${personelId} not found`,
      });
    }

    const namaPersonel = personel.nama_lengkap;

    // Upload PDF: Data/02. Personel/[nama]/02. NPWP/NPWP [nama].pdf
    const folderPath = ['02. Personel', namaPersonel, '02. NPWP'];
    const fileName = `NPWP ${namaPersonel}.pdf`;

    const uploadResult = await oauth2GoogleService.uploadPdfFile(
      file.buffer,
      fileName,
      file.mimetype,
      folderPath
    );

    const npwpData = {
      id_personel: personelId,
      nomor_npwp_personel: data.nomor_npwp_personel || '',
      nik_npwp_personel: data.nik_npwp_personel || '',
      nama_npwp_personel: data.nama_npwp_personel || namaPersonel,
      alamat_npwp_personel: data.alamat_npwp_personel || '',
      kpp_npwp_personel: data.kpp_npwp_personel || '',
      file_npwp_personel_url: uploadResult.webViewLink || ''
    };

    const result = await googleSheetsService.addNpwp(npwpData);

    res.status(201).json({
      success: true,
      message: 'NPWP added successfully',
      data: {
        ...result,
        fileUrl: uploadResult.webViewLink
      }
    });
  } catch (error) {
    console.error('Error in addNpwp:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add NPWP',
    });
  }
};

export const updateNpwp = async (req, res) => {
  try {
    const { personelId } = req.params;
    const data = req.body;
    const file = req.file;

    const personel = await googleSheetsService.getPersonilById(personelId);
    if (!personel || !personel.npwp) {
      return res.status(404).json({
        success: false,
        message: 'NPWP data not found',
      });
    }

    const namaPersonel = personel.nama_lengkap;
    let fileUrl = personel.npwp.file_npwp_personel_url;

    if (file) {
      if (fileUrl) {
        const oldFileId = oauth2GoogleService.extractFileIdFromUrl(fileUrl);
        if (oldFileId) {
          try {
            await oauth2GoogleService.deleteFile(oldFileId);
          } catch (err) {
            console.warn('Could not delete old file:', err.message);
          }
        }
      }

      const folderPath = ['02. Personel', namaPersonel, '02. NPWP'];
      const fileName = `NPWP ${namaPersonel}.pdf`;

      const uploadResult = await oauth2GoogleService.uploadPdfFile(
        file.buffer,
        fileName,
        file.mimetype,
        folderPath
      );

      fileUrl = uploadResult.webViewLink;
    }

    const npwpData = {
      ...data,
      file_npwp_personel_url: fileUrl
    };

    const result = await googleSheetsService.updateNpwp(personelId, npwpData);

    res.json({
      success: true,
      message: 'NPWP updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in updateNpwp:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update NPWP',
    });
  }
};

export const deleteNpwp = async (req, res) => {
  try {
    const { personelId } = req.params;

    const personel = await googleSheetsService.getPersonilById(personelId);
    if (!personel || !personel.npwp) {
      return res.status(404).json({
        success: false,
        message: 'NPWP data not found',
      });
    }

    const fileUrl = personel.npwp.file_npwp_personel_url;
    if (fileUrl) {
      const fileId = oauth2GoogleService.extractFileIdFromUrl(fileUrl);
      if (fileId) {
        try {
          await oauth2GoogleService.deleteFile(fileId);
        } catch (err) {
          console.warn('Could not delete file:', err.message);
        }
      }
    }

    const result = await googleSheetsService.deleteNpwp(personelId);

    res.json({
      success: true,
      message: 'NPWP deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in deleteNpwp:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete NPWP',
    });
  }
};

// ==================== IJAZAH ====================

export const addIjazah = async (req, res) => {
  try {
    const { personelId } = req.params;
    const data = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'File PDF Ijazah is required',
      });
    }

    const personel = await googleSheetsService.getPersonilById(personelId);
    if (!personel) {
      return res.status(404).json({
        success: false,
        message: `Personnel with ID ${personelId} not found`,
      });
    }

    const namaPersonel = personel.nama_lengkap;

    // Upload PDF: Data/02. Personel/[nama]/03. Ijazah/Ijazah [nama].pdf
    const folderPath = ['02. Personel', namaPersonel, '03. Ijazah'];
    const fileName = `Ijazah ${namaPersonel}.pdf`;

    const uploadResult = await oauth2GoogleService.uploadPdfFile(
      file.buffer,
      fileName,
      file.mimetype,
      folderPath
    );

    const ijazahData = {
      id_personel: personelId,
      jenjang_pendidikan: data.jenjang_pendidikan || '',
      nama_institusi_pendidikan: data.nama_institusi_pendidikan || '',
      fakultas: data.fakultas || '',
      program_studi: data.program_studi || '',
      nomor_ijazah: data.nomor_ijazah || '',
      tahun_masuk: data.tahun_masuk || '',
      tahun_lulus: data.tahun_lulus || '',
      gelar_akademik: data.gelar_akademik || '',
      ipk: data.ipk || '',
      file_ijazah_url: uploadResult.webViewLink || ''
    };

    const result = await googleSheetsService.addIjazah(ijazahData);

    res.status(201).json({
      success: true,
      message: 'Ijazah added successfully',
      data: {
        ...result,
        fileUrl: uploadResult.webViewLink
      }
    });
  } catch (error) {
    console.error('Error in addIjazah:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add Ijazah',
    });
  }
};

export const updateIjazah = async (req, res) => {
  try {
    const { personelId } = req.params;
    const data = req.body;
    const file = req.file;

    const personel = await googleSheetsService.getPersonilById(personelId);
    if (!personel || !personel.ijazah) {
      return res.status(404).json({
        success: false,
        message: 'Ijazah data not found',
      });
    }

    const namaPersonel = personel.nama_lengkap;
    let fileUrl = personel.ijazah.file_ijazah_url;

    if (file) {
      if (fileUrl) {
        const oldFileId = oauth2GoogleService.extractFileIdFromUrl(fileUrl);
        if (oldFileId) {
          try {
            await oauth2GoogleService.deleteFile(oldFileId);
          } catch (err) {
            console.warn('Could not delete old file:', err.message);
          }
        }
      }

      const folderPath = ['02. Personel', namaPersonel, '03. Ijazah'];
      const fileName = `Ijazah ${namaPersonel}.pdf`;

      const uploadResult = await oauth2GoogleService.uploadPdfFile(
        file.buffer,
        fileName,
        file.mimetype,
        folderPath
      );

      fileUrl = uploadResult.webViewLink;
    }

    const ijazahData = {
      ...data,
      file_ijazah_url: fileUrl
    };

    const result = await googleSheetsService.updateIjazah(personelId, ijazahData);

    res.json({
      success: true,
      message: 'Ijazah updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in updateIjazah:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update Ijazah',
    });
  }
};

export const deleteIjazah = async (req, res) => {
  try {
    const { personelId } = req.params;

    const personel = await googleSheetsService.getPersonilById(personelId);
    if (!personel || !personel.ijazah) {
      return res.status(404).json({
        success: false,
        message: 'Ijazah data not found',
      });
    }

    const fileUrl = personel.ijazah.file_ijazah_url;
    if (fileUrl) {
      const fileId = oauth2GoogleService.extractFileIdFromUrl(fileUrl);
      if (fileId) {
        try {
          await oauth2GoogleService.deleteFile(fileId);
        } catch (err) {
          console.warn('Could not delete file:', err.message);
        }
      }
    }

    const result = await googleSheetsService.deleteIjazah(personelId);

    res.json({
      success: true,
      message: 'Ijazah deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in deleteIjazah:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete Ijazah',
    });
  }
};

// ==================== CV ====================

export const addCv = async (req, res) => {
  try {
    const { personelId } = req.params;
    const data = req.body;
    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: 'File PDF CV is required',
      });
    }

    const personel = await googleSheetsService.getPersonilById(personelId);
    if (!personel) {
      return res.status(404).json({
        success: false,
        message: `Personnel with ID ${personelId} not found`,
      });
    }

    const namaPersonel = personel.nama_lengkap;

    // Upload PDF: Data/02. Personel/[nama]/04. Daftar Riwayat Hidup/Daftar Riwayat Hidup [nama].pdf
    const folderPath = ['02. Personel', namaPersonel, '04. Daftar Riwayat Hidup'];
    const fileName = `Daftar Riwayat Hidup ${namaPersonel}.pdf`;

    const uploadResult = await oauth2GoogleService.uploadPdfFile(
      file.buffer,
      fileName,
      file.mimetype,
      folderPath
    );

    const cvData = {
      id_personel: personelId,
      nama_lengkap_cv: data.nama_lengkap_cv || namaPersonel,
      ringkasan_profil: data.ringkasan_profil || '',
      keahlian_utama: data.keahlian_utama || '',
      total_pengalaman_tahun: data.total_pengalaman_tahun || '',
      pengalaman_kerja_terakhir: data.pengalaman_kerja_terakhir || '',
      sertifikasi_profesional: data.sertifikasi_profesional || '',
      bahasa_dikuasai: data.bahasa_dikuasai || '',
      file_cv_url: uploadResult.webViewLink || ''
    };

    const result = await googleSheetsService.addCv(cvData);

    res.status(201).json({
      success: true,
      message: 'CV added successfully',
      data: {
        ...result,
        fileUrl: uploadResult.webViewLink
      }
    });
  } catch (error) {
    console.error('Error in addCv:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to add CV',
    });
  }
};

export const updateCv = async (req, res) => {
  try {
    const { personelId } = req.params;
    const data = req.body;
    const file = req.file;

    const personel = await googleSheetsService.getPersonilById(personelId);
    if (!personel || !personel.cv) {
      return res.status(404).json({
        success: false,
        message: 'CV data not found',
      });
    }

    const namaPersonel = personel.nama_lengkap;
    let fileUrl = personel.cv.file_cv_url;

    if (file) {
      if (fileUrl) {
        const oldFileId = oauth2GoogleService.extractFileIdFromUrl(fileUrl);
        if (oldFileId) {
          try {
            await oauth2GoogleService.deleteFile(oldFileId);
          } catch (err) {
            console.warn('Could not delete old file:', err.message);
          }
        }
      }

      const folderPath = ['02. Personel', namaPersonel, '04. Daftar Riwayat Hidup'];
      const fileName = `Daftar Riwayat Hidup ${namaPersonel}.pdf`;

      const uploadResult = await oauth2GoogleService.uploadPdfFile(
        file.buffer,
        fileName,
        file.mimetype,
        folderPath
      );

      fileUrl = uploadResult.webViewLink;
    }

    const cvData = {
      ...data,
      file_cv_url: fileUrl
    };

    const result = await googleSheetsService.updateCv(personelId, cvData);

    res.json({
      success: true,
      message: 'CV updated successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in updateCv:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to update CV',
    });
  }
};

export const deleteCv = async (req, res) => {
  try {
    const { personelId } = req.params;

    const personel = await googleSheetsService.getPersonilById(personelId);
    if (!personel || !personel.cv) {
      return res.status(404).json({
        success: false,
        message: 'CV data not found',
      });
    }

    const fileUrl = personel.cv.file_cv_url;
    if (fileUrl) {
      const fileId = oauth2GoogleService.extractFileIdFromUrl(fileUrl);
      if (fileId) {
        try {
          await oauth2GoogleService.deleteFile(fileId);
        } catch (err) {
          console.warn('Could not delete file:', err.message);
        }
      }
    }

    const result = await googleSheetsService.deleteCv(personelId);

    res.json({
      success: true,
      message: 'CV deleted successfully',
      data: result
    });
  } catch (error) {
    console.error('Error in deleteCv:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Failed to delete CV',
    });
  }
};
