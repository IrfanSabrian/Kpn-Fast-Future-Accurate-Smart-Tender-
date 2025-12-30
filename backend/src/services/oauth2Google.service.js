/**
 * OAuth2 Google Service
 *
 * Universal service untuk semua Google APIs menggunakan OAuth2 User Authentication:
 * - Google Drive (file upload/management)
 * - Google Sheets (spreadsheet read/write)
 * - Google Docs (document creation/editing)
 * - Google Gemini AI (future integration)
 */

import { google } from "googleapis";
import { Readable } from "stream";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class OAuth2GoogleService {
  constructor() {
    this.oauth2Client = null;
    this.drive = null;
    this.sheets = null;
    this.docs = null;
    this.isInitialized = false;
  }

  /**
   * Initialize OAuth2 client with all Google services
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Load OAuth2 credentials
      const credentialsPath = path.join(
        __dirname,
        "../../credentials/oauth2-credentials.json"
      );

      if (!fs.existsSync(credentialsPath)) {
        throw new Error("OAuth2 credentials file not found");
      }

      const credentials = JSON.parse(fs.readFileSync(credentialsPath, "utf8"));
      const { client_id, client_secret, redirect_uris } =
        credentials.web || credentials.installed;

      // Create OAuth2 client
      this.oauth2Client = new google.auth.OAuth2(
        client_id,
        client_secret,
        redirect_uris[0]
      );

      // Load token if exists
      const tokenPath = path.join(
        __dirname,
        "../../credentials/oauth2-token.json"
      );

      if (fs.existsSync(tokenPath)) {
        const token = JSON.parse(fs.readFileSync(tokenPath, "utf8"));
        this.oauth2Client.setCredentials(token);

        // Initialize all Google services
        this.drive = google.drive({ version: "v3", auth: this.oauth2Client });
        this.sheets = google.sheets({ version: "v4", auth: this.oauth2Client });
        this.docs = google.docs({ version: "v1", auth: this.oauth2Client });

        this.isInitialized = true;

        console.log(
          "✅ OAuth2 Google Service initialized (Drive, Sheets, Docs)"
        );
      } else {
        console.log("⚠️  OAuth2 token not found. User needs to authenticate.");
      }
    } catch (error) {
      console.error("❌ Error initializing OAuth2 Google Service:", error);
      throw error;
    }
  }

  /**
   * Force reload credentials from disk
   * Call this after new login to update active client
   */
  async forceReload() {
    this.isInitialized = false;
    this.oauth2Client = null;
    await this.initialize();
  }

  /**
   * Generate authentication URL with all required scopes
   */
  getAuthUrl() {
    const scopes = [
      // User Info scopes (untuk author detection)
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",

      // Google Drive scopes
      "https://www.googleapis.com/auth/drive",
      "https://www.googleapis.com/auth/drive.file",

      // Google Sheets scopes
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/spreadsheets.readonly",

      // Google Docs scopes
      "https://www.googleapis.com/auth/documents",
      "https://www.googleapis.com/auth/documents.readonly",

      // Future: Gemini AI (will be available via Google AI API)
      // For now, we prepare the structure
    ];

    return this.oauth2Client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent", // Force to get refresh token
    });
  }

  /**
   * Handle OAuth2 callback and save token
   */
  async handleCallback(code) {
    try {
      const { tokens } = await this.oauth2Client.getToken(code);
      this.oauth2Client.setCredentials(tokens);

      // Save token
      const tokenPath = path.join(
        __dirname,
        "../../credentials/oauth2-token.json"
      );
      fs.writeFileSync(tokenPath, JSON.stringify(tokens, null, 2));

      // Initialize all services
      this.drive = google.drive({ version: "v3", auth: this.oauth2Client });
      this.sheets = google.sheets({ version: "v4", auth: this.oauth2Client });
      this.docs = google.docs({ version: "v1", auth: this.oauth2Client });
      this.isInitialized = true;

      console.log("✅ OAuth2 token saved and all services initialized");
      return { success: true, message: "Authentication successful" };
    } catch (error) {
      console.error("❌ Error handling OAuth2 callback:", error);
      throw error;
    }
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated() {
    return (
      this.isInitialized && this.oauth2Client && this.oauth2Client.credentials
    );
  }

  /**
   * Get OAuth2 client (for other services to use)
   */
  getAuthClient() {
    if (!this.isAuthenticated()) {
      throw new Error("User not authenticated");
    }
    return this.oauth2Client;
  }

  /**
   * Get authenticated user info
   * @returns {Object} { email, username, name, picture } - username tanpa @domain
   */
  async getUserInfo() {
    await this.initialize();

    if (!this.isAuthenticated()) {
      throw new Error("User not authenticated");
    }

    try {
      // Get user info from Google API
      const oauth2 = google.oauth2({ version: "v2", auth: this.oauth2Client });
      const { data } = await oauth2.userinfo.get();

      // Extract username (tanpa @gmail.com atau @domain)
      const email = data.email || "";
      const username = email.split("@")[0];

      const userInfo = {
        email: email,
        username: username,
        name: data.name || username,
        picture: data.picture || null, // Google profile picture URL
        role: "Admin", // Auto-set role as Admin
      };

      console.log("📸 User info retrieved:", {
        email: userInfo.email,
        name: userInfo.name,
        hasPicture: !!userInfo.picture,
        pictureUrl: userInfo.picture,
      });

      return userInfo;
    } catch (error) {
      console.error("Error getting user info:", error);
      // Fallback: extract from token if API fails
      const tokenInfo = this.oauth2Client.credentials;
      if (tokenInfo && tokenInfo.scope) {
        return {
          email: "unknown",
          username: "system",
          name: "System",
          picture: null,
          role: "Admin",
        };
      }
      throw error;
    }
  }

  /**
   * Logout user by deleting the token file
   */
  async logout() {
    try {
      const tokenPath = path.join(
        __dirname,
        "../../credentials/oauth2-token.json"
      );
      if (fs.existsSync(tokenPath)) {
        fs.unlinkSync(tokenPath);
        console.log("✅ OAuth2 token deleted successfully");
      }
      this.oauth2Client.setCredentials({});
      this.isInitialized = false; // Force re-init on next request

      return true;
    } catch (error) {
      console.error("Error during logout:", error);
      throw error;
    }
  }

  // ==================== GOOGLE DRIVE METHODS ====================

  /**
   * Find folder by name in Drive
   */
  async findFolderByName(folderName, parentId = null) {
    await this.initialize();

    if (!this.isAuthenticated()) {
      throw new Error("User not authenticated. Please login first.");
    }

    try {
      let query = `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;

      if (parentId) {
        query += ` and '${parentId}' in parents`;
      }

      const response = await this.drive.files.list({
        q: query,
        fields: "files(id, name)",
        spaces: "drive",
      });

      if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0];
      }

      return null;
    } catch (error) {
      console.error(`Error finding folder ${folderName}:`, error);
      throw error;
    }
  }

  /**
   * Create folder in Drive
   */
  async createFolder(folderName, parentId = null) {
    await this.initialize();

    if (!this.isAuthenticated()) {
      throw new Error("User not authenticated. Please login first.");
    }

    try {
      const fileMetadata = {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
      };

      if (parentId) {
        fileMetadata.parents = [parentId];
      }

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        fields: "id, name",
      });

      console.log(`✅ Folder created: ${folderName} (ID: ${response.data.id})`);
      return response.data;
    } catch (error) {
      console.error(`Error creating folder ${folderName}:`, error);
      throw error;
    }
  }

  /**
   * Upload PDF file to Drive
   */
  async uploadPdfFile(
    fileBuffer,
    fileName,
    mimeType,
    folderPath = [],
    baseParentId = null
  ) {
    await this.initialize();

    if (!this.isAuthenticated()) {
      throw new Error("User not authenticated. Please login first.");
    }

    try {
      // Determine base parent ID
      let currentParentId =
        baseParentId || process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID;

      // Create nested folder structure
      if (folderPath && folderPath.length > 0) {
        console.log(`📁 Creating folder path: ${folderPath.join(" / ")}`);

        for (const folderName of folderPath) {
          const existingFolder = await this.findFolderByName(
            folderName,
            currentParentId
          );

          if (existingFolder) {
            console.log(
              `📁 Folder exists: ${folderName} (ID: ${existingFolder.id})`
            );
            currentParentId = existingFolder.id;
          } else {
            const newFolder = await this.createFolder(
              folderName,
              currentParentId
            );
            console.log(
              `✅ Folder created: ${folderName} (ID: ${newFolder.id})`
            );
            currentParentId = newFolder.id;
          }
        }
      }

      // Upload file
      const fileMetadata = {
        name: fileName,
        parents: [currentParentId],
      };

      const media = {
        mimeType: mimeType,
        body: Readable.from(fileBuffer),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id, name, webViewLink, webContentLink",
      });

      // Make file publicly accessible (view only)
      await this.drive.permissions.create({
        fileId: response.data.id,
        requestBody: {
          role: "reader",
          type: "anyone",
        },
      });

      console.log(`✅ File uploaded: ${fileName} (ID: ${response.data.id})`);

      return {
        success: true,
        fileId: response.data.id,
        fileName: response.data.name,
        webViewLink: response.data.webViewLink,
        webContentLink: response.data.webContentLink,
      };
    } catch (error) {
      console.error(`❌ Error uploading file ${fileName}:`, error);
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * Delete file from Drive
   */
  async deleteFile(fileId) {
    await this.initialize();

    if (!this.isAuthenticated()) {
      throw new Error("User not authenticated. Please login first.");
    }

    try {
      await this.drive.files.delete({
        fileId: fileId,
      });

      console.log(`✅ File deleted: ${fileId}`);
      return {
        success: true,
        message: `File deleted successfully`,
        fileId,
      };
    } catch (error) {
      console.error(`❌ Error deleting file ${fileId}:`, error);
      throw new Error(`Failed to delete file: ${error.message}`);
    }
  }

  /**
   * Extract file ID from Google Drive URL
   */
  extractFileIdFromUrl(url) {
    if (!url) return null;
    const match = url.match(/\/d\/([a-zA-Z0-9_-]+)/);
    return match ? match[1] : null;
  }

  /**
   * Delete folder by name from Drive
   * @param {string} folderName - Name of the folder to delete
   * @param {string} parentId - Parent folder ID where to search
   */
  async deleteFolder(folderName, parentId = null) {
    await this.initialize();

    if (!this.isAuthenticated()) {
      throw new Error("User not authenticated. Please login first.");
    }

    try {
      // Find the folder first
      const folder = await this.findFolderByName(folderName, parentId);

      if (!folder) {
        console.warn(`⚠️  Folder not found: ${folderName}`);
        return { success: false, message: "Folder not found" };
      }

      // Delete the folder
      await this.drive.files.delete({
        fileId: folder.id,
      });

      console.log(`✅ Folder deleted: ${folderName} (ID: ${folder.id})`);
      return {
        success: true,
        message: `Folder deleted successfully`,
        folderId: folder.id,
      };
    } catch (error) {
      console.error(`❌ Error deleting folder ${folderName}:`, error);
      throw new Error(`Failed to delete folder: ${error.message}`);
    }
  }

  /**
   * Delete folder by ID from Drive
   * @param {string} folderId - ID of the folder to delete
   */
  async deleteFolderById(folderId) {
    await this.initialize();

    if (!this.isAuthenticated()) {
      throw new Error("User not authenticated. Please login first.");
    }

    try {
      await this.drive.files.delete({
        fileId: folderId,
      });

      console.log(`✅ Folder deleted by ID: ${folderId}`);
      return {
        success: true,
        message: `Folder deleted successfully`,
        folderId,
      };
    } catch (error) {
      console.error(`❌ Error deleting folder by ID ${folderId}:`, error);
      throw new Error(`Failed to delete folder: ${error.message}`);
    }
  }

  /**
   * Rename folder in Drive
   * @param {string} oldName - Current folder name
   * @param {string} newName - New folder name
   * @param {string} parentId - Parent folder ID where to search
   */
  async renameFolder(oldName, newName, parentId = null) {
    await this.initialize();

    if (!this.isAuthenticated()) {
      throw new Error("User not authenticated. Please login first.");
    }

    try {
      // Find the folder
      const folder = await this.findFolderByName(oldName, parentId);

      if (!folder) {
        console.warn(`⚠️  Folder not found: ${oldName}`);
        throw new Error(`Folder "${oldName}" not found`);
      }

      // Rename the folder
      await this.drive.files.update({
        fileId: folder.id,
        requestBody: {
          name: newName,
        },
      });

      console.log(
        `✅ Folder renamed: "${oldName}" → "${newName}" (ID: ${folder.id})`
      );
      return {
        success: true,
        message: `Folder renamed successfully`,
        folderId: folder.id,
        oldName,
        newName,
      };
    } catch (error) {
      console.error(
        `❌ Error renaming folder "${oldName}" to "${newName}":`,
        error
      );
      throw new Error(`Failed to rename folder: ${error.message}`);
    }
  }

  /**
   * Find file by name in Drive
   * @param {string} fileName - Name of the file to find
   * @param {string} parentId - Parent folder ID where to search
   */
  async findFileByName(fileName, parentId = null) {
    await this.initialize();

    if (!this.isAuthenticated()) {
      throw new Error("User not authenticated. Please login first.");
    }

    try {
      let query = `name='${fileName}' and trashed=false`;

      if (parentId) {
        query += ` and '${parentId}' in parents`;
      }

      const response = await this.drive.files.list({
        q: query,
        fields: "files(id, name)",
        spaces: "drive",
      });

      if (response.data.files && response.data.files.length > 0) {
        return response.data.files[0];
      }

      return null;
    } catch (error) {
      console.error(`Error finding file ${fileName}:`, error);
      throw error;
    }
  }

  /**
   * Rename file by ID in Drive
   * @param {string} fileId - ID of the file to rename
   * @param {string} newFileName - New file name
   */
  async renameFileById(fileId, newFileName) {
    await this.initialize();

    if (!this.isAuthenticated()) {
      throw new Error("User not authenticated. Please login first.");
    }

    try {
      await this.drive.files.update({
        fileId: fileId,
        requestBody: {
          name: newFileName,
        },
      });

      console.log(`✅ File renamed to: ${newFileName} (ID: ${fileId})`);
      return {
        success: true,
        message: `File renamed successfully`,
        fileId,
        newFileName,
      };
    } catch (error) {
      console.error(
        `❌ Error renaming file ${fileId} to "${newFileName}":`,
        error
      );
      throw new Error(`Failed to rename file: ${error.message}`);
    }
  }

  /**
   * Download file content from Drive
   * @param {string} fileId - ID of the file to download
   * @returns {Promise<Buffer>} File content as buffer
   */
  async downloadFile(fileId) {
    await this.initialize();

    if (!this.isAuthenticated()) {
      throw new Error("User not authenticated. Please login first.");
    }

    try {
      const response = await this.drive.files.get(
        {
          fileId: fileId,
          alt: "media",
        },
        { responseType: "arraybuffer" }
      );

      console.log(`✅ File downloaded: ${fileId}`);
      return Buffer.from(response.data);
    } catch (error) {
      console.error(`❌ Error downloading file ${fileId}:`, error);
      throw new Error(`Failed to download file: ${error.message}`);
    }
  }

  // ==================== GOOGLE SHEETS METHODS ====================
  // Future: Add Sheets methods here if needed (read, write, etc.)
  // For now, googleSheets.service.js still uses Service Account (which works fine for Sheets)

  // ==================== GOOGLE DOCS METHODS ====================

  /**
   * Create a new Google Doc
   */
  async createDocument(title) {
    await this.initialize();

    if (!this.isAuthenticated()) {
      throw new Error("User not authenticated. Please login first.");
    }

    try {
      const response = await this.docs.documents.create({
        requestBody: {
          title: title,
        },
      });

      console.log(
        `✅ Document created: ${title} (ID: ${response.data.documentId})`
      );
      return response.data;
    } catch (error) {
      console.error(`Error creating document ${title}:`, error);
      throw error;
    }
  }

  /**
   * Get document content
   */
  async getDocument(documentId) {
    await this.initialize();

    if (!this.isAuthenticated()) {
      throw new Error("User not authenticated. Please login first.");
    }

    try {
      const response = await this.docs.documents.get({
        documentId: documentId,
      });

      return response.data;
    } catch (error) {
      console.error(`Error getting document ${documentId}:`, error);
      throw error;
    }
  }

  /**
   * Search for folders containing a specific name substring
   */
  async searchFolder(namePart, parentId = null) {
    await this.initialize();
    if (!this.isAuthenticated()) throw new Error("User not authenticated");

    try {
      let query = `name contains '${namePart}' and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      if (parentId) query += ` and '${parentId}' in parents`;

      const response = await this.drive.files.list({
        q: query,
        fields: "files(id, name)",
        spaces: "drive",
      });
      return response.data.files || [];
    } catch (error) {
      console.error(`Error searching folder ${namePart}:`, error);
      throw error;
    }
  }

  /**
   * List all subfolders within a parent folder
   */
  async listFolders(parentId) {
    await this.initialize();
    if (!this.isAuthenticated()) throw new Error("User not authenticated");

    try {
      const query = `'${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`;
      const response = await this.drive.files.list({
        q: query,
        fields: "files(id, name)",
        spaces: "drive",
      });
      return response.data.files || [];
    } catch (error) {
      console.error(`Error listing folders in ${parentId}:`, error);
      throw error;
    }
  }

  /**
   * Upload file directly to a specific folder ID
   */
  async uploadFileToFolder(filePath, fileName, mimeType, folderId) {
    await this.initialize();
    if (!this.isAuthenticated()) throw new Error("User not authenticated");

    try {
      const fs = await import("fs/promises");
      const fileBuffer = await fs.readFile(filePath);

      const fileMetadata = {
        name: fileName,
        parents: [folderId],
      };

      const media = {
        mimeType: mimeType,
        body: Readable.from(fileBuffer),
      };

      const response = await this.drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id, name, webViewLink, webContentLink",
      });

      // Permission
      await this.drive.permissions
        .create({
          fileId: response.data.id,
          requestBody: { role: "reader", type: "anyone" },
        })
        .catch((err) => console.warn("Permission set warning:", err.message));

      return {
        success: true,
        fileId: response.data.id,
        webViewLink: response.data.webViewLink,
        webContentLink: response.data.webContentLink,
      };
    } catch (error) {
      console.error(`Error uploading to folder ${folderId}:`, error);
      throw error;
    }
  }

  // ==================== FUTURE: GEMINI AI ====================
  // Gemini AI akan diintegrasikan menggunakan Google AI SDK
  // Token OAuth2 yang sama bisa dipakai untuk authentication
}

// Export singleton instance
const oauth2GoogleService = new OAuth2GoogleService();
export default oauth2GoogleService;
