/**
 * Google Sheets Permission Controller
 * Endpoints to manage spreadsheet permissions
 */

import googleSheetsPermissionService from '../services/googleSheetsPermission.service.js';
import oauth2GoogleService from '../services/oauth2Google.service.js';

/**
 * Share spreadsheets with current authenticated user
 * POST /api/sheets/share-with-me
 */
export const shareWithMe = async (req, res) => {
  try {
    // Get current user email
    const userInfo = await oauth2GoogleService.getCurrentUser();
    
    if (!userInfo || !userInfo.email) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    // Share all sheets with this user
    const result = await googleSheetsPermissionService.shareWithUser(userInfo.email, 'writer');

    res.json({
      success: true,
      message: `Spreadsheets shared with ${userInfo.email}`,
      data: result
    });
  } catch (error) {
    console.error('Error in shareWithMe:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Make all spreadsheets public (anyone with link)
 * POST /api/sheets/make-public
 * Admin only - requires authentication
 */
export const makePublic = async (req, res) => {
  try {
    const result = await googleSheetsPermissionService.makePublicWithLink('writer');

    res.json({
      success: true,
      message: 'All spreadsheets are now accessible to anyone with the link',
      data: result
    });
  } catch (error) {
    console.error('Error in makePublic:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Share spreadsheets with specific email
 * POST /api/sheets/share
 * Body: { email: 'user@example.com', role: 'writer' }
 */
export const shareWithEmail = async (req, res) => {
  try {
    const { email, role = 'writer' } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email is required'
      });
    }

    const result = await googleSheetsPermissionService.shareWithUser(email, role);

    res.json({
      success: true,
      message: `Spreadsheets shared with ${email}`,
      data: result
    });
  } catch (error) {
    console.error('Error in shareWithEmail:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};
