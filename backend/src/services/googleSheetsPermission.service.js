/**
 * Auto-share Google Sheets with authenticated user
 * Run this after successful OAuth login
 */

import { google } from 'googleapis';
import oauth2GoogleService from './oauth2Google.service.js';

class GoogleSheetsPermissionService {
  constructor() {
    this.SHEET_IDS = {
      perusahaan: process.env.GOOGLE_SHEET_ID_PERUSAHAAN,
      personil: process.env.GOOGLE_SHEET_ID_PERSONIL,
      kbli: process.env.GOOGLE_SHEET_ID_KBLI
    };
  }

  /**
   * Share all spreadsheets with a user email
   * @param {string} userEmail - Email to grant access
   * @param {string} role - 'reader' | 'writer' | 'owner' (default: 'writer')
   */
  async shareWithUser(userEmail, role = 'writer') {
    try {
      // Ensure OAuth2 service is initialized
      await oauth2GoogleService.initialize();
      
      if (!oauth2GoogleService.isAuthenticated()) {
        throw new Error('OAuth2 service not authenticated');
      }

      const auth = oauth2GoogleService.getAuthClient();
      const drive = google.drive({ version: 'v3', auth });

      const results = [];
      
      // Share each spreadsheet
      for (const [name, fileId] of Object.entries(this.SHEET_IDS)) {
        if (!fileId) {
          console.warn(`⚠️ Sheet ID for ${name} not found, skipping...`);
          continue;
        }

        try {
          // Check if user already has access
          const permissions = await drive.permissions.list({
            fileId,
            fields: 'permissions(id, emailAddress, role)'
          });

          const existingPermission = permissions.data.permissions?.find(
            p => p.emailAddress === userEmail
          );

          if (existingPermission) {
            console.log(`✅ ${userEmail} already has access to ${name} sheet`);
            results.push({ sheet: name, status: 'already_shared', fileId });
            continue;
          }

          // Grant permission
          const permission = await drive.permissions.create({
            fileId,
            requestBody: {
              type: 'user',
              role: role, // 'reader', 'writer', or 'owner'
              emailAddress: userEmail
            },
            sendNotificationEmail: false // Don't spam user
          });

          console.log(`✅ Shared ${name} sheet with ${userEmail} (${role})`);
          results.push({ 
            sheet: name, 
            status: 'shared', 
            permissionId: permission.data.id,
            fileId 
          });

        } catch (error) {
          console.error(`❌ Failed to share ${name} sheet with ${userEmail}:`, error.message);
          results.push({ sheet: name, status: 'error', error: error.message, fileId });
        }
      }

      return {
        success: true,
        results,
        userEmail
      };
    } catch (error) {
      console.error('Error in shareWithUser:', error);
      throw error;
    }
  }

  /**
   * Make spreadsheets accessible to anyone with link
   * Useful for team environments
   */
  async makePublicWithLink(role = 'writer') {
    try {
      await oauth2GoogleService.initialize();
      
      if (!oauth2GoogleService.isAuthenticated()) {
        throw new Error('OAuth2 service not authenticated');
      }

      const auth = oauth2GoogleService.getAuthClient();
      const drive = google.drive({ version: 'v3', auth });

      const results = [];
      
      for (const [name, fileId] of Object.entries(this.SHEET_IDS)) {
        if (!fileId) continue;

        try {
          // Check if already public
          const permissions = await drive.permissions.list({
            fileId,
            fields: 'permissions(id, type, role)'
          });

          const publicPermission = permissions.data.permissions?.find(
            p => p.type === 'anyone'
          );

          if (publicPermission) {
            console.log(`✅ ${name} sheet is already public`);
            results.push({ sheet: name, status: 'already_public', fileId });
            continue;
          }

          // Make public
          await drive.permissions.create({
            fileId,
            requestBody: {
              type: 'anyone',
              role: role
            }
          });

          console.log(`✅ Made ${name} sheet public (anyone with link can ${role === 'writer' ? 'edit' : 'view'})`);
          results.push({ sheet: name, status: 'made_public', fileId });

        } catch (error) {
          console.error(`❌ Failed to make ${name} sheet public:`, error.message);
          results.push({ sheet: name, status: 'error', error: error.message, fileId });
        }
      }

      return {
        success: true,
        results
      };
    } catch (error) {
      console.error('Error in makePublicWithLink:', error);
      throw error;
    }
  }

  /**
   * Remove user access from all spreadsheets
   */
  async revokeUserAccess(userEmail) {
    try {
      await oauth2GoogleService.initialize();
      
      if (!oauth2GoogleService.isAuthenticated()) {
        throw new Error('OAuth2 service not authenticated');
      }

      const auth = oauth2GoogleService.getAuthClient();
      const drive = google.drive({ version: 'v3', auth });

      const results = [];
      
      for (const [name, fileId] of Object.entries(this.SHEET_IDS)) {
        if (!fileId) continue;

        try {
          const permissions = await drive.permissions.list({
            fileId,
            fields: 'permissions(id, emailAddress)'
          });

          const userPermission = permissions.data.permissions?.find(
            p => p.emailAddress === userEmail
          );

          if (!userPermission) {
            console.log(`⚠️ ${userEmail} doesn't have access to ${name} sheet`);
            results.push({ sheet: name, status: 'no_access', fileId });
            continue;
          }

          await drive.permissions.delete({
            fileId,
            permissionId: userPermission.id
          });

          console.log(`✅ Revoked ${userEmail} access to ${name} sheet`);
          results.push({ sheet: name, status: 'revoked', fileId });

        } catch (error) {
          console.error(`❌ Failed to revoke access to ${name} sheet:`, error.message);
          results.push({ sheet: name, status: 'error', error: error.message, fileId });
        }
      }

      return {
        success: true,
        results,
        userEmail
      };
    } catch (error) {
      console.error('Error in revokeUserAccess:', error);
      throw error;
    }
  }
}

// Singleton instance
const googleSheetsPermissionService = new GoogleSheetsPermissionService();
export default googleSheetsPermissionService;
