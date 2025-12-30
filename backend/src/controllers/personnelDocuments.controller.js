/**
 * Personnel Documents Controller
 *
 * Handles HTTP requests untuk personnel documents management (KTP, NPWP, Ijazah, CV)
 */

import googleSheetsService from "../services/googleSheets.service.js";
import oauth2GoogleService from "../services/oauth2Google.service.js"; // Universal OAuth2 service for all Google APIs

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
        message: "File PDF KTP is required",
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
    const folderPath = [
      "02. Personel",
      namaPersonel,
      "01. Kartu Tanda Penduduk",
    ];
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
      nik: data.nik || "-",
      nama_ktp: data.nama_ktp || namaPersonel,
      tempat_lahir_ktp: data.tempat_lahir_ktp || "-",
      tanggal_lahir_ktp: data.tanggal_lahir_ktp || "-",
      jenis_kelamin: data.jenis_kelamin || "-",
      golongan_darah: data.golongan_darah || "-",
      alamat_ktp: data.alamat_ktp || "-",
      rt_rw: data.rt_rw || "-",
      kelurahan_desa: data.kelurahan_desa || "-",
      kecamatan: data.kecamatan || "-",
      kota_kabupaten: data.kota_kabupaten || "-",
      provinsi: data.provinsi || "-",
      agama: data.agama || "-",
      status_perkawinan: data.status_perkawinan || "-",
      pekerjaan: data.pekerjaan || "-",
      kewarganegaraan: data.kewarganegaraan || "-",
      berlaku_hingga: data.berlaku_hingga || "SEUMUR HIDUP",
      tanggal_terbit_ktp: data.tanggal_terbit_ktp || "-",
      file_ktp_url: uploadResult.webViewLink || "",
    };

    const result = await googleSheetsService.addKtp(ktpData);

    res.status(201).json({
      success: true,
      message: "KTP added successfully",
      data: {
        ...result,
        fileUrl: uploadResult.webViewLink,
      },
    });
  } catch (error) {
    console.error("Error in addKtp:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add KTP",
    });
  }
};

export const updateKtp = async (req, res) => {
  try {
    const { personelId } = req.params;
    const data = req.body;
    const file = req.file;
    const fileUrlFromBody = data.file_ktp_url || data.fileUrl; // Accept URL from body

    // Get current KTP data
    const personel = await googleSheetsService.getPersonilById(personelId);
    if (!personel) {
      return res.status(404).json({
        success: false,
        message: `Personnel with ID ${personelId} not found`,
      });
    }

    // If KTP data doesn't exist yet OR has no id_personel, create it instead
    if (!personel.ktp || !personel.ktp.id_personel) {
      console.log("⚠️ KTP data not found in database, creating new entry...");

      let newFileUrl = fileUrlFromBody;

      if (!file && !newFileUrl) {
        return res.status(400).json({
          success: false,
          message: "File PDF KTP is required for first upload",
        });
      }

      const namaPersonel = personel.nama_lengkap;

      if (file) {
        const folderPath = [
          "02. Personel",
          namaPersonel,
          "01. Kartu Tanda Penduduk",
        ];
        const fileName = `KTP ${namaPersonel}.pdf`;
        const uploadResult = await oauth2GoogleService.uploadPdfFile(
          file.buffer,
          fileName,
          file.mimetype,
          folderPath
        );
        newFileUrl = uploadResult.webViewLink;
      }

      const ktpData = {
        id_personel: personelId,
        file_ktp_url: newFileUrl,
      };

      const result = await googleSheetsService.addKtp(ktpData);

      return res.status(201).json({
        success: true,
        message: "KTP added successfully",
        data: {
          ...result,
          fileUrl: newFileUrl,
        },
      });
    }

    // Update existing KTP
    const namaPersonel = personel.nama_lengkap;
    let fileUrl = personel.ktp.file_ktp_url;

    // 1. If physical file uploaded -> Delete old, Upload new
    if (file) {
      if (fileUrl) {
        const oldFileId = oauth2GoogleService.extractFileIdFromUrl(fileUrl);
        if (oldFileId)
          await oauth2GoogleService.deleteFile(oldFileId).catch(console.warn);
      }
      const folderPath = [
        "02. Personel",
        namaPersonel,
        "01. Kartu Tanda Penduduk",
      ];
      const fileName = `KTP ${namaPersonel}.pdf`;
      const uploadResult = await oauth2GoogleService.uploadPdfFile(
        file.buffer,
        fileName,
        file.mimetype,
        folderPath
      );
      fileUrl = uploadResult.webViewLink;
    }
    // 2. If NO physical file but URL provided in body -> Use that URL (stepped upload)
    else if (fileUrlFromBody) {
      // We assume the old file is handled or this is a direct replacement
      fileUrl = fileUrlFromBody;
    }

    // Update KTP data in Google Sheets
    const ktpData = {
      ...data,
      file_ktp_url: fileUrl,
    };

    const result = await googleSheetsService.updateKtp(personelId, ktpData);

    res.json({
      success: true,
      message: "KTP updated successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in updateKtp:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to update KTP",
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
        message: "KTP data not found",
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
          console.warn("Could not delete file:", err.message);
        }
      }
    }

    // Delete KTP data from Google Sheets
    const result = await googleSheetsService.deleteKtp(personelId);

    res.json({
      success: true,
      message: "KTP deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in deleteKtp:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete KTP",
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
        message: "File PDF NPWP is required",
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
    const folderPath = ["02. Personel", namaPersonel, "02. NPWP"];
    const fileName = `NPWP ${namaPersonel}.pdf`;

    const uploadResult = await oauth2GoogleService.uploadPdfFile(
      file.buffer,
      fileName,
      file.mimetype,
      folderPath
    );

    const npwpData = {
      id_personel: personelId,
      nomor_npwp_personel: data.nomor_npwp_personel || "-",
      nik_npwp_personel: data.nik_npwp_personel || "-",
      nama_npwp_personel: data.nama_npwp_personel || namaPersonel,
      alamat_npwp_personel: data.alamat_npwp_personel || "-",
      kpp_npwp_personel: data.kpp_npwp_personel || "-",
      file_npwp_personel_url: uploadResult.webViewLink || "",
    };

    const result = await googleSheetsService.addNpwp(npwpData);

    res.status(201).json({
      success: true,
      message: "NPWP added successfully",
      data: {
        ...result,
        fileUrl: uploadResult.webViewLink,
      },
    });
  } catch (error) {
    console.error("Error in addNpwp:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add NPWP",
    });
  }
};

export const updateNpwp = async (req, res) => {
  try {
    const { personelId } = req.params;
    const data = req.body;
    const file = req.file;
    const fileUrlFromBody = data.file_npwp_personel_url || data.fileUrl;

    const personel = await googleSheetsService.getPersonilById(personelId);
    if (!personel)
      return res
        .status(404)
        .json({ success: false, message: `Personnel not found` });

    if (!personel.npwp || !personel.npwp.id_personel) {
      let newFileUrl = fileUrlFromBody;
      if (!file && !newFileUrl)
        return res
          .status(400)
          .json({ success: false, message: "File is required" });

      const namaPersonel = personel.nama_lengkap;
      if (file) {
        const folderPath = ["02. Personel", namaPersonel, "02. NPWP"];
        const fileName = `NPWP ${namaPersonel}.pdf`;
        const uploadResult = await oauth2GoogleService.uploadPdfFile(
          file.buffer,
          fileName,
          file.mimetype,
          folderPath
        );
        newFileUrl = uploadResult.webViewLink;
      }

      const npwpData = {
        id_personel: personelId,
        file_npwp_personel_url: newFileUrl,
      };
      const result = await googleSheetsService.addNpwp(npwpData);
      return res.status(201).json({
        success: true,
        message: "NPWP added",
        data: { ...result, fileUrl: newFileUrl },
      });
    }

    const namaPersonel = personel.nama_lengkap;
    let fileUrl = personel.npwp.file_npwp_personel_url;

    if (file) {
      if (fileUrl) {
        const oldId = oauth2GoogleService.extractFileIdFromUrl(fileUrl);
        if (oldId)
          await oauth2GoogleService.deleteFile(oldId).catch(console.warn);
      }
      const folderPath = ["02. Personel", namaPersonel, "02. NPWP"];
      const fileName = `NPWP ${namaPersonel}.pdf`;
      const uploadResult = await oauth2GoogleService.uploadPdfFile(
        file.buffer,
        fileName,
        file.mimetype,
        folderPath
      );
      fileUrl = uploadResult.webViewLink;
    } else if (fileUrlFromBody) {
      fileUrl = fileUrlFromBody;
    }

    const npwpData = { ...data, file_npwp_personel_url: fileUrl };
    const result = await googleSheetsService.updateNpwp(personelId, npwpData);
    res.json({ success: true, message: "NPWP updated", data: result });
  } catch (error) {
    console.error("Error in updateNpwp:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteNpwp = async (req, res) => {
  try {
    const { personelId } = req.params;

    const personel = await googleSheetsService.getPersonilById(personelId);
    if (!personel || !personel.npwp) {
      return res.status(404).json({
        success: false,
        message: "NPWP data not found",
      });
    }

    const fileUrl = personel.npwp.file_npwp_personel_url;
    if (fileUrl) {
      const fileId = oauth2GoogleService.extractFileIdFromUrl(fileUrl);
      if (fileId) {
        try {
          await oauth2GoogleService.deleteFile(fileId);
        } catch (err) {
          console.warn("Could not delete file:", err.message);
        }
      }
    }

    const result = await googleSheetsService.deleteNpwp(personelId);

    res.json({
      success: true,
      message: "NPWP deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in deleteNpwp:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete NPWP",
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
        message: "File PDF Ijazah is required",
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
    const folderPath = ["02. Personel", namaPersonel, "03. Ijazah"];
    const fileName = `Ijazah ${namaPersonel}.pdf`;

    const uploadResult = await oauth2GoogleService.uploadPdfFile(
      file.buffer,
      fileName,
      file.mimetype,
      folderPath
    );

    const ijazahData = {
      id_personel: personelId,
      jenjang_pendidikan: data.jenjang_pendidikan || "-",
      nama_institusi_pendidikan: data.nama_institusi_pendidikan || "-",
      fakultas: data.fakultas || "-",
      program_studi: data.program_studi || "-",
      nomor_ijazah: data.nomor_ijazah || "-",
      tahun_masuk: data.tahun_masuk || "-",
      tahun_lulus: data.tahun_lulus || "-",
      gelar_akademik: data.gelar_akademik || "-",
      ipk: data.ipk || "-",
      file_ijazah_url: uploadResult.webViewLink || "",
    };

    const result = await googleSheetsService.addIjazah(ijazahData);

    res.status(201).json({
      success: true,
      message: "Ijazah added successfully",
      data: {
        ...result,
        fileUrl: uploadResult.webViewLink,
      },
    });
  } catch (error) {
    console.error("Error in addIjazah:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add Ijazah",
    });
  }
};

export const updateIjazah = async (req, res) => {
  try {
    const { personelId } = req.params;
    const data = req.body;
    const file = req.file;
    const fileUrlFromBody = data.file_ijazah_url || data.fileUrl;

    const personel = await googleSheetsService.getPersonilById(personelId);
    if (!personel)
      return res
        .status(404)
        .json({ success: false, message: `Personnel not found` });

    if (!personel.ijazah || !personel.ijazah.id_personel) {
      let newFileUrl = fileUrlFromBody;
      if (!file && !newFileUrl)
        return res
          .status(400)
          .json({ success: false, message: "File required" });

      const namaPersonel = personel.nama_lengkap;
      if (file) {
        const folderPath = ["02. Personel", namaPersonel, "03. Ijazah"];
        const fileName = `Ijazah ${namaPersonel}.pdf`;
        const uploadResult = await oauth2GoogleService.uploadPdfFile(
          file.buffer,
          fileName,
          file.mimetype,
          folderPath
        );
        newFileUrl = uploadResult.webViewLink;
      }

      const ijazahData = {
        id_personel: personelId,
        file_ijazah_url: newFileUrl,
      };
      const result = await googleSheetsService.addIjazah(ijazahData);
      return res.status(201).json({
        success: true,
        message: "Ijazah added",
        data: { ...result, fileUrl: newFileUrl },
      });
    }

    const namaPersonel = personel.nama_lengkap;
    let fileUrl = personel.ijazah.file_ijazah_url;

    if (file) {
      if (fileUrl) {
        const oldId = oauth2GoogleService.extractFileIdFromUrl(fileUrl);
        if (oldId)
          await oauth2GoogleService.deleteFile(oldId).catch(console.warn);
      }
      const folderPath = ["02. Personel", namaPersonel, "03. Ijazah"];
      const fileName = `Ijazah ${namaPersonel}.pdf`;
      const uploadResult = await oauth2GoogleService.uploadPdfFile(
        file.buffer,
        fileName,
        file.mimetype,
        folderPath
      );
      fileUrl = uploadResult.webViewLink;
    } else if (fileUrlFromBody) {
      fileUrl = fileUrlFromBody;
    }

    const ijazahData = { ...data, file_ijazah_url: fileUrl };
    const result = await googleSheetsService.updateIjazah(
      personelId,
      ijazahData
    );
    res.json({ success: true, message: "Ijazah updated", data: result });
  } catch (error) {
    console.error("Error in updateIjazah:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteIjazah = async (req, res) => {
  try {
    const { personelId } = req.params;

    const personel = await googleSheetsService.getPersonilById(personelId);
    if (!personel || !personel.ijazah) {
      return res.status(404).json({
        success: false,
        message: "Ijazah data not found",
      });
    }

    const fileUrl = personel.ijazah.file_ijazah_url;
    if (fileUrl) {
      const fileId = oauth2GoogleService.extractFileIdFromUrl(fileUrl);
      if (fileId) {
        try {
          await oauth2GoogleService.deleteFile(fileId);
        } catch (err) {
          console.warn("Could not delete file:", err.message);
        }
      }
    }

    const result = await googleSheetsService.deleteIjazah(personelId);

    res.json({
      success: true,
      message: "Ijazah deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in deleteIjazah:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete Ijazah",
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
        message: "File PDF CV is required",
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
    const folderPath = [
      "02. Personel",
      namaPersonel,
      "04. Daftar Riwayat Hidup",
    ];
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
      ringkasan_profil: data.ringkasan_profil || "-",
      keahlian_utama: data.keahlian_utama || "-",
      total_pengalaman_tahun: data.total_pengalaman_tahun || "-",
      pengalaman_kerja_terakhir: data.pengalaman_kerja_terakhir || "-",
      sertifikasi_profesional: data.sertifikasi_profesional || "-",
      bahasa_dikuasai: data.bahasa_dikuasai || "-",
      file_cv_url: uploadResult.webViewLink || "",
    };

    const result = await googleSheetsService.addCv(cvData);

    res.status(201).json({
      success: true,
      message: "CV added successfully",
      data: {
        ...result,
        fileUrl: uploadResult.webViewLink,
      },
    });
  } catch (error) {
    console.error("Error in addCv:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to add CV",
    });
  }
};

export const updateCv = async (req, res) => {
  try {
    const { personelId } = req.params;
    const data = req.body;
    const file = req.file;
    const fileUrlFromBody = data.file_cv_url || data.fileUrl;

    const personel = await googleSheetsService.getPersonilById(personelId);
    if (!personel)
      return res
        .status(404)
        .json({ success: false, message: `Personnel not found` });

    if (!personel.cv || !personel.cv.id_personel) {
      let newFileUrl = fileUrlFromBody;
      if (!file && !newFileUrl)
        return res
          .status(400)
          .json({ success: false, message: "File required" });

      const namaPersonel = personel.nama_lengkap;
      if (file) {
        const folderPath = [
          "02. Personel",
          namaPersonel,
          "04. Daftar Riwayat Hidup",
        ];
        const fileName = `Daftar Riwayat Hidup ${namaPersonel}.pdf`;
        const uploadResult = await oauth2GoogleService.uploadPdfFile(
          file.buffer,
          fileName,
          file.mimetype,
          folderPath
        );
        newFileUrl = uploadResult.webViewLink;
      }

      const cvData = { id_personel: personelId, file_cv_url: newFileUrl };
      const result = await googleSheetsService.addCv(cvData);
      return res.status(201).json({
        success: true,
        message: "CV added",
        data: { ...result, fileUrl: newFileUrl },
      });
    }

    const namaPersonel = personel.nama_lengkap;
    let fileUrl = personel.cv.file_cv_url;

    if (file) {
      if (fileUrl) {
        const oldId = oauth2GoogleService.extractFileIdFromUrl(fileUrl);
        if (oldId)
          await oauth2GoogleService.deleteFile(oldId).catch(console.warn);
      }
      const folderPath = [
        "02. Personel",
        namaPersonel,
        "04. Daftar Riwayat Hidup",
      ];
      const fileName = `Daftar Riwayat Hidup ${namaPersonel}.pdf`;
      const uploadResult = await oauth2GoogleService.uploadPdfFile(
        file.buffer,
        fileName,
        file.mimetype,
        folderPath
      );
      fileUrl = uploadResult.webViewLink;
    } else if (fileUrlFromBody) {
      fileUrl = fileUrlFromBody;
    }

    const cvData = { ...data, file_cv_url: fileUrl };
    const result = await googleSheetsService.updateCv(personelId, cvData);
    res.json({ success: true, message: "CV updated", data: result });
  } catch (error) {
    console.error("Error in updateCv:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteCv = async (req, res) => {
  try {
    const { personelId } = req.params;

    const personel = await googleSheetsService.getPersonilById(personelId);
    if (!personel || !personel.cv) {
      return res.status(404).json({
        success: false,
        message: "CV data not found",
      });
    }

    const fileUrl = personel.cv.file_cv_url;
    if (fileUrl) {
      const fileId = oauth2GoogleService.extractFileIdFromUrl(fileUrl);
      if (fileId) {
        try {
          await oauth2GoogleService.deleteFile(fileId);
        } catch (err) {
          console.warn("Could not delete file:", err.message);
        }
      }
    }

    const result = await googleSheetsService.deleteCv(personelId);

    res.json({
      success: true,
      message: "CV deleted successfully",
      data: result,
    });
  } catch (error) {
    console.error("Error in deleteCv:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to delete CV",
    });
  }
};

// ==================== SKK ====================

export const addSkk = async (req, res) => {
  try {
    const { personelId } = req.params;
    const data = req.body;
    const file = req.file;

    const personel = await googleSheetsService.getPersonilById(personelId);
    if (!personel) {
      return res
        .status(404)
        .json({ success: false, message: `Personnel ${personelId} not found` });
    }
    const namaPersonel = personel.nama_lengkap;

    let fileUrl = "";
    const fileUrlFromBody = data.url_skk || data.fileUrl;

    if (file) {
      const folderPath = [
        "02. Personel",
        namaPersonel,
        "05. Surat Keahlian Kerja",
      ];
      const fileName = `SKK ${namaPersonel}.pdf`;

      const uploadResult = await oauth2GoogleService.uploadPdfFile(
        file.buffer,
        fileName,
        file.mimetype,
        folderPath
      );
      fileUrl = uploadResult.webViewLink;
    } else if (fileUrlFromBody) {
      fileUrl = fileUrlFromBody;
    }

    const docData = {
      id_personel: personelId,
      jenis_skk: data.jenis_skk || "",
      kualifikasi: data.kualifikasi || "",
      masa_berlaku: data.masa_berlaku || "",
      penerbit: data.penerbit || "",
      url_skk: fileUrl,
    };

    const result = await googleSheetsService.addSkk(docData);
    res.status(201).json({
      success: true,
      message: "SKK added",
      data: { ...result, fileUrl },
    });
  } catch (error) {
    console.error("Error addSkk:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSkk = async (req, res) => {
  try {
    const { personelId } = req.params;
    const data = req.body;
    const file = req.file;
    const idSkk = data.id_skk;

    if (!idSkk)
      return res
        .status(400)
        .json({ success: false, message: "id_skk required" });

    const personel = await googleSheetsService.getPersonilById(personelId);
    if (!personel)
      return res
        .status(404)
        .json({ success: false, message: "Personnel not found" });

    const skkList = personel.skk || [];
    const item = skkList.find((s) => s.id_skk === idSkk);

    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "SKK item not found" });

    let fileUrl = item.url_skk;

    if (file) {
      if (fileUrl) {
        const oldId = oauth2GoogleService.extractFileIdFromUrl(fileUrl);
        if (oldId)
          await oauth2GoogleService
            .deleteFile(oldId)
            .catch((e) => console.warn(e));
      }

      const namaPersonel = personel.nama_lengkap;
      const folderPath = [
        "02. Personel",
        namaPersonel,
        "05. Surat Keahlian Kerja",
      ];
      const fileName = `SKK ${namaPersonel}.pdf`;

      const uploadResult = await oauth2GoogleService.uploadPdfFile(
        file.buffer,
        fileName,
        file.mimetype,
        folderPath
      );
      fileUrl = uploadResult.webViewLink;
    }

    const docData = {
      ...data,
      url_skk: fileUrl,
    };

    const result = await googleSheetsService.updateSkk(idSkk, docData);
    res.json({ success: true, message: "SKK updated", data: result });
  } catch (error) {
    console.error("Error updateSkk:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSkk = async (req, res) => {
  try {
    const { personelId, id } = req.params;
    const targetId = id || req.body.id_skk;

    if (!targetId)
      return res
        .status(400)
        .json({ success: false, message: "Target ID required" });

    const personel = await googleSheetsService.getPersonilById(personelId);
    const skkList = personel?.skk || [];
    const item = skkList.find((s) => s.id_skk === targetId);

    if (item && item.url_skk) {
      const oldId = oauth2GoogleService.extractFileIdFromUrl(item.url_skk);
      if (oldId)
        await oauth2GoogleService
          .deleteFile(oldId)
          .catch((e) => console.warn(e));
    }

    const result = await googleSheetsService.deleteSkk(targetId);
    res.json({ success: true, message: "SKK deleted", data: result });
  } catch (error) {
    console.error("Error deleteSkk:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== REFERENSI ====================

export const addReferensi = async (req, res) => {
  try {
    const { personelId } = req.params;
    const data = req.body;
    const file = req.file;

    // Optional file for Referensi
    // if (!file && !data.url_referensi) ...

    const personel = await googleSheetsService.getPersonilById(personelId);
    if (!personel) {
      return res
        .status(404)
        .json({ success: false, message: `Personnel ${personelId} not found` });
    }
    const namaPersonel = personel.nama_lengkap;

    let fileUrl = "";
    const fileUrlFromBody = data.url_referensi || data.fileUrl; // Support URL from body

    if (file) {
      // 06. Surat Referensi
      const folderPath = ["02. Personel", namaPersonel, "06. Surat Referensi"];
      // Clean name without timestamp
      const fileName = `Surat Referensi ${namaPersonel}.pdf`;

      const uploadResult = await oauth2GoogleService.uploadPdfFile(
        file.buffer,
        fileName,
        file.mimetype,
        folderPath
      );
      fileUrl = uploadResult.webViewLink;
    } else if (fileUrlFromBody) {
      fileUrl = fileUrlFromBody;
    }

    const docData = {
      id_personel: personelId,
      pengalaman: data.pengalaman || "",
      url_referensi: fileUrl,
    };

    const result = await googleSheetsService.addReferensi(docData);
    res.status(201).json({
      success: true,
      message: "Referensi added",
      data: { ...result, fileUrl },
    });
  } catch (error) {
    console.error("Error addReferensi:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateReferensi = async (req, res) => {
  try {
    const { personelId } = req.params;
    const data = req.body;
    const file = req.file;
    const idReferensi = data.id_referensi; // Must be provided in body

    if (!idReferensi)
      return res
        .status(400)
        .json({ success: false, message: "id_referensi required" });

    const personel = await googleSheetsService.getPersonilById(personelId);
    if (!personel)
      return res
        .status(404)
        .json({ success: false, message: "Personnel not found" });

    // Find existing item to get old URL
    // We need to fetch all referensi and find by ID
    // Since getPersonilById joins referensi, we might have it already if updated getAllPersonil (Step 219)
    // But getPersonilById calls getAllPersonil. Let's assume personel.referensi exists (array).

    const referensiList = personel.referensi || [];
    const item = referensiList.find((r) => r.id_referensi === idReferensi);

    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Referensi item not found" });

    let fileUrl = item.url_referensi;

    if (file) {
      // Delete old file if exists
      if (fileUrl) {
        const oldId = oauth2GoogleService.extractFileIdFromUrl(fileUrl);
        if (oldId)
          await oauth2GoogleService
            .deleteFile(oldId)
            .catch((e) => console.warn(e));
      }

      const namaPersonel = personel.nama_lengkap;
      const folderPath = ["02. Personel", namaPersonel, "06. Surat Referensi"];
      const fileName = `Surat Referensi ${namaPersonel}.pdf`;

      const uploadResult = await oauth2GoogleService.uploadPdfFile(
        file.buffer,
        fileName,
        file.mimetype,
        folderPath
      );
      fileUrl = uploadResult.webViewLink;
    }

    const docData = {
      ...data,
      url_referensi: fileUrl,
    };

    const result = await googleSheetsService.updateReferensi(
      idReferensi,
      docData
    );
    res.json({ success: true, message: "Referensi updated", data: result });
  } catch (error) {
    console.error("Error updateReferensi:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteReferensi = async (req, res) => {
  try {
    const { personelId, id } = req.params; // Expect route parameter /:personelId/referensi/:id
    // Alternatively check request body if param not set?
    const targetId = id || req.body.id_referensi;

    if (!targetId)
      return res
        .status(400)
        .json({ success: false, message: "Target ID required" });

    const personel = await googleSheetsService.getPersonilById(personelId);
    const referensiList = personel?.referensi || [];
    const item = referensiList.find((r) => r.id_referensi === targetId);

    if (item && item.url_referensi) {
      const oldId = oauth2GoogleService.extractFileIdFromUrl(
        item.url_referensi
      );
      if (oldId)
        await oauth2GoogleService
          .deleteFile(oldId)
          .catch((e) => console.warn(e));
    }

    const result = await googleSheetsService.deleteReferensi(targetId);
    res.json({ success: true, message: "Referensi deleted", data: result });
  } catch (error) {
    console.error("Error deleteReferensi:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==================== STNK ====================

export const addStnk = async (req, res) => {
  try {
    const { personelId } = req.params;
    const data = req.body;
    const file = req.file;

    const personel = await googleSheetsService.getPersonilById(personelId);
    if (!personel)
      return res
        .status(404)
        .json({ success: false, message: "Personnel not found" });
    const namaPersonel = personel.nama_lengkap;

    let fileUrl = "";
    const fileUrlFromBody = data.url_stnk || data.fileUrl; // Support URL from body

    if (file) {
      // 07. STNK
      const folderPath = ["02. Personel", namaPersonel, "07. STNK"];
      // Clean name
      const fileName = `STNK ${namaPersonel}.pdf`;

      const uploadResult = await oauth2GoogleService.uploadPdfFile(
        file.buffer,
        fileName,
        file.mimetype,
        folderPath
      );
      fileUrl = uploadResult.webViewLink;
    } else if (fileUrlFromBody) {
      fileUrl = fileUrlFromBody;
    }

    const docData = {
      id_personel: personelId,
      no_polisi: data.no_polisi || "",
      merek: data.merek || "",
      warna: data.warna || "",
      tahun_pembuatan: data.tahun_pembuatan || "",
      url_stnk: fileUrl,
    };

    const result = await googleSheetsService.addStnk(docData);
    res.status(201).json({
      success: true,
      message: "STNK added",
      data: { ...result, fileUrl },
    });
  } catch (error) {
    console.error("Error addStnk:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateStnk = async (req, res) => {
  try {
    const { personelId } = req.params;
    const data = req.body;
    const file = req.file;
    const idStnk = data.id_stnk;

    if (!idStnk)
      return res
        .status(400)
        .json({ success: false, message: "id_stnk required" });

    const personel = await googleSheetsService.getPersonilById(personelId);
    const stnkList = personel?.stnk || [];
    const item = stnkList.find((s) => s.id_stnk === idStnk);
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "STNK item not found" });

    let fileUrl = item.url_stnk;
    if (file) {
      if (fileUrl) {
        const oldId = oauth2GoogleService.extractFileIdFromUrl(fileUrl);
        if (oldId)
          await oauth2GoogleService
            .deleteFile(oldId)
            .catch((e) => console.warn(e));
      }
      const namaPersonel = personel.nama_lengkap;
      const folderPath = ["02. Personel", namaPersonel, "07. STNK"];
      const fileName = `STNK ${namaPersonel}.pdf`;
      const uploadResult = await oauth2GoogleService.uploadPdfFile(
        file.buffer,
        fileName,
        file.mimetype,
        folderPath
      );
      fileUrl = uploadResult.webViewLink;
    }

    const docData = { ...data, url_stnk: fileUrl };
    const result = await googleSheetsService.updateStnk(idStnk, docData);
    res.json({ success: true, message: "STNK updated", data: result });
  } catch (error) {
    console.error("Error updateStnk:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteStnk = async (req, res) => {
  try {
    const { personelId, id } = req.params;
    const targetId = id || req.body.id_stnk;

    if (!targetId)
      return res
        .status(400)
        .json({ success: false, message: "Target ID required" });

    const personel = await googleSheetsService.getPersonilById(personelId);
    const stnkList = personel?.stnk || [];
    const item = stnkList.find((s) => s.id_stnk === targetId);

    if (item && item.url_stnk) {
      const oldId = oauth2GoogleService.extractFileIdFromUrl(item.url_stnk);
      if (oldId)
        await oauth2GoogleService
          .deleteFile(oldId)
          .catch((e) => console.warn(e));
    }

    const result = await googleSheetsService.deleteStnk(targetId);
    res.json({ success: true, message: "STNK deleted", data: result });
  } catch (error) {
    console.error("Error deleteStnk:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
// ==================== GENERIC UPLOAD ====================

/**
 * Upload any personnel document to Drive and return URL
 * Used for stepped upload process (Step 1)
 */
export const uploadPersonnelDocument = async (req, res) => {
  try {
    const { personelId, type } = req.params;
    const file = req.file;

    if (!file) {
      return res
        .status(400)
        .json({ success: false, message: "File is required" });
    }

    const personel = await googleSheetsService.getPersonilById(personelId);
    if (!personel) {
      return res
        .status(404)
        .json({ success: false, message: "Personnel not found" });
    }

    const namaPersonel = personel.nama_lengkap;
    let folderName, subFolder;

    switch (type) {
      case "ktp":
        folderName = "01. Kartu Tanda Penduduk";
        subFolder = `KTP ${namaPersonel}.pdf`;
        break;
      case "npwp":
        folderName = "02. NPWP";
        subFolder = `NPWP ${namaPersonel}.pdf`;
        break;
      case "ijazah":
        folderName = "03. Ijazah";
        subFolder = `Ijazah ${namaPersonel}.pdf`;
        break;
      case "cv":
        folderName = "04. Daftar Riwayat Hidup";
        subFolder = `Daftar Riwayat Hidup ${namaPersonel}.pdf`;
        break;
      case "skk":
        folderName = "05. Surat Keahlian Kerja";
        subFolder = `SKK ${namaPersonel}.pdf`;
        break;
      case "referensi":
        folderName = "06. Surat Referensi";
        subFolder = `Referensi ${namaPersonel}.pdf`;
        break;
      case "stnk":
        folderName = "07. STNK";
        subFolder = `STNK ${namaPersonel}.pdf`;
        break;
      default:
        return res
          .status(400)
          .json({ success: false, message: "Invalid document type" });
    }

    const folderPath = ["02. Personel", namaPersonel, folderName];
    const uploadResult = await oauth2GoogleService.uploadPdfFile(
      file.buffer,
      subFolder,
      file.mimetype,
      folderPath
    );

    res.json({
      success: true,
      message: "File uploaded to Drive successfully",
      data: {
        fileUrl: uploadResult.webViewLink,
        fileId: uploadResult.fileId,
      },
    });
  } catch (error) {
    console.error("Error in uploadPersonnelDocument:", error);
    res.status(500).json({ success: false, message: error.message });
  }
};
