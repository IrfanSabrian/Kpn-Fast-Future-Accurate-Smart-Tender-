/**
 * OAuth2 Authentication Controller
 */

import oauth2GoogleService from '../services/oauth2Google.service.js';
import googleSheetsPermissionService from '../services/googleSheetsPermission.service.js';
import googleSheetsService from '../services/googleSheets.service.js';

/**
 * Check authentication status
 */
export const checkAuthStatus = async (req, res) => {
  try {
    await oauth2GoogleService.initialize();
    const isAuthenticated = oauth2GoogleService.isAuthenticated();

    res.json({
      success: true,
      isAuthenticated,
      message: isAuthenticated ? 'User is authenticated' : 'User needs to login'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Get Google OAuth2 login URL
 */
export const getAuthUrl = async (req, res) => {
  try {
    await oauth2GoogleService.initialize();
    const authUrl = oauth2GoogleService.getAuthUrl();

    res.json({
      success: true,
      authUrl
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Handle Google OAuth2 callback and auto-share sheets
 */
export const handleCallback = async (req, res) => {
  try {
    const { code } = req.query;

    if (!code) {
      return res.status(400).send('Authorization code is required');
    }

    await oauth2GoogleService.initialize();
    await oauth2GoogleService.handleCallback(code);
    
    // IMPORTANT: Force reload services to use new token
    await oauth2GoogleService.forceReload();
    await googleSheetsService.forceReload();  // ← CRITICAL: Reload Sheets service!

    // Get user info to share sheets with them
    try {
      const userInfo = await oauth2GoogleService.getCurrentUser();
      const userEmail = userInfo.email;

      // Auto-share all spreadsheets with this user
      console.log(`📤 Auto-sharing spreadsheets with ${userEmail}...`);
      await googleSheetsPermissionService.shareWithUser(userEmail, 'writer');
      console.log(`✅ Spreadsheets shared with ${userEmail}`);
    } catch (shareError) {
      // Don't fail OAuth if share fails, just log it
      console.error('⚠️ Failed to auto-share sheets:', shareError.message);
    }

    // Send success HTML page (Simple - No buttons)
    res.send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Berhasil Terhubung</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
          <style>
            :root {
              --bg-slate-50: #f8fafc;
              --emerald-500: #10b981;
              --emerald-600: #059669;
            }
            body {
              font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background-color: var(--bg-slate-50);
              color: #1e293b;
            }
            .card {
              background: white;
              padding: 64px 48px;
              border-radius: 24px;
              box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
              text-align: center;
              max-width: 480px;
              width: 90%;
              animation: slideUp 0.5s ease-out;
              border: 1px solid #e2e8f0;
            }
            @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
            
            .icon-circle {
              width: 120px;
              height: 120px;
              border-radius: 50%;
              background: linear-gradient(135deg, var(--emerald-500), var(--emerald-600));
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 40px;
              color: white;
              font-size: 64px;
              box-shadow: 0 20px 25px -5px rgba(16, 185, 129, 0.4);
              animation: popIn 0.6s cubic-bezier(0.175, 0.885, 0.32, 1.275);
            }
            @keyframes popIn { 0% { transform: scale(0); } 100% { transform: scale(1); } }

            h1 { 
              font-size: 32px; 
              font-weight: 900; 
              margin: 0 0 16px; 
              color: #0f172a; 
              letter-spacing: -0.02em;
            }
            p { 
              font-size: 16px; 
              color: #64748b; 
              margin: 0; 
              line-height: 1.6; 
            }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="icon-circle">
              <i class="fas fa-check"></i>
            </div>
            
            <h1>Berhasil Terhubung!</h1>
            <p>Akun Google Anda telah berhasil terhubung dengan KPN FAST.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error) {
    console.error('Error handling OAuth2 callback:', error);
    
    // Determine if this is a 403 access denied error
    const is403 = error.message && (
      error.message.includes('403') || 
      error.message.includes('Forbidden') ||
      error.message.includes('Access Not Configured') ||
      error.message.includes('access_denied')
    );
    
    const errorTitle = is403 ? 'Access Denied (403)' : 'Authentication Failed';
    const errorMessage = is403 
      ? 'Email Anda belum terdaftar sebagai Test User. Hubungi administrator atau tambahkan email Anda di Google Cloud Console → OAuth consent screen → Test users.'
      : error.message;
    
    res.status(is403 ? 403 : 500).send(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${errorTitle}</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
          <style>
            body {
              font-family: ui-sans-serif, system-ui, -apple-system, sans-serif;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              background: #f8fafc;
              padding: 20px;
            }
            .error-card {
              background: white;
              padding: 48px;
              border-radius: 24px;
              box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1);
              text-align: center;
              max-width: 480px;
              border: 1px solid #e2e8f0;
            }
            .icon-circle {
              width: 96px;
              height: 96px;
              border-radius: 50%;
              background: linear-gradient(135deg, #ef4444, #dc2626);
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 0 auto 24px;
              color: white;
              font-size: 48px;
              box-shadow: 0 10px 15px -3px rgba(239, 68, 68, 0.4);
            }
            h1 {
              color: #1e293b;
              margin: 0 0 16px;
              font-size: 24px;
              font-weight: 900;
            }
            p {
              color: #64748b;
              line-height: 1.6;
              margin: 0 0 24px;
              font-size: 14px;
            }
            .details {
              background: #fef2f2;
              border: 1px solid #fecaca;
              border-radius: 12px;
              padding: 16px;
              margin: 24px 0;
              text-align: left;
            }
            .details-title {
              font-size: 10px;
              font-weight: 700;
              color: #991b1b;
              text-transform: uppercase;
              letter-spacing: 0.05em;
              margin-bottom: 8px;
            }
            .details-text {
              font-size: 12px;
              color: #7f1d1d;
              font-family: 'Courier New', monospace;
              word-break: break-word;
            }
            .btn {
              background: linear-gradient(135deg, #3b82f6, #2563eb);
              color: white;
              border: none;
              padding: 14px 32px;
              border-radius: 12px;
              cursor: pointer;
              font-weight: 700;
              font-size: 14px;
              transition: all 0.2s;
              width: 100%;
            }
            .btn:hover {
              transform: translateY(-2px);
              box-shadow: 0 10px 15px -3px rgba(59, 130, 246, 0.4);
            }
          </style>
        </head>
        <body>
          <div class="error-card">
            <div class="icon-circle">
              <i class="fas fa-exclamation-triangle"></i>
            </div>
            
            <h1>${errorTitle}</h1>
            <p>${errorMessage}</p>
            
            ${is403 ? `
            <div class="details">
              <div class="details-title">📋 Cara Mengatasi:</div>
              <div class="details-text">
                1. Buka Google Cloud Console<br>
                2. Pilih project Anda<br>
                3. APIs & Services → OAuth consent screen<br>
                4. Scroll ke "Test users"<br>
                5. Klik "+ ADD USERS"<br>
                6. Tambahkan email Anda<br>
                7. Coba login lagi
              </div>
            </div>
            ` : ''}
            
            <button class="btn" onclick="window.close(); window.opener && window.opener.location.reload();">
              <i class="fas fa-times-circle" style="margin-right: 8px;"></i>
              Tutup Jendela
            </button>
          </div>
        </body>
      </html>
    `);
  }
};

/**
 * Get current authenticated user info
 * GET /api/auth/me
 */
export const getCurrentUser = async (req, res) => {
  try {
    await oauth2GoogleService.initialize();
    
    if (!oauth2GoogleService.isAuthenticated()) {
      return res.status(401).json({
        success: false,
        message: 'User not authenticated'
      });
    }

    const userInfo = await oauth2GoogleService.getUserInfo();

    res.json({
      success: true,
      data: {
        username: userInfo.username,
        name: userInfo.name,
        email: userInfo.email,
        picture: userInfo.picture,
        role: userInfo.role
      }
    });
  } catch (error) {
    console.error('Error getting current user:', error);
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

/**
 * Logout user (delete OAuth2 token)
 * POST /api/auth/logout
 */
export const logout = async (req, res) => {
  try {
    await oauth2GoogleService.logout();
    res.json({ 
      success: true, 
      message: 'Logged out successfully' 
    });
  } catch (error) {
    console.error('Error in logout:', error);
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
};
