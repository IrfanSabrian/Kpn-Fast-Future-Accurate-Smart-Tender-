import cloudinary from 'cloudinary';
import fs from 'fs/promises';

const cloudinaryV2 = cloudinary.v2;

/**
 * Cloudinary Service
 * Handles image upload, delete, and management for company logos
 */

/**
 * Initialize Cloudinary config from environment variables
 * Called before each operation to ensure env vars are loaded
 */
function ensureConfigured() {
  cloudinaryV2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
}

/**
 * Verify Cloudinary configuration
 * @returns {boolean} True if configured properly
 */
function isConfigured() {
  ensureConfigured(); // Load config from env first
  const { cloud_name, api_key, api_secret } = cloudinaryV2.config();
  return !!(cloud_name && api_key && api_secret);
}

/**
 * Upload company logo to Cloudinary with retry logic
 * @param {string} filePath - Local file path to upload
 * @param {string} companyId - Company ID (used for folder/organization)
 * @param {string} customFilename - Optional custom filename (without extension)
 * @param {number} maxRetries - Maximum number of retry attempts (default: 3)
 * @returns {Promise<Object>} Upload result with URL and public_id
 */
async function uploadCompanyLogo(filePath, companyId, customFilename = null, maxRetries = 3) {
  if (!isConfigured()) {
    const error = new Error('Cloudinary is not configured. Please set CLOUDINARY_* environment variables in .env file');
    error.code = 'CLOUDINARY_NOT_CONFIGURED';
    throw error;
  }

  let lastError = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`📤 Uploading logo to Cloudinary (Attempt ${attempt}/${maxRetries})...`);
      console.log(`   File: ${filePath}`);
      console.log(`   Company ID: ${companyId}`);

      const uploadFolder = process.env.CLOUDINARY_UPLOAD_FOLDER || 'kpn-fast/company-logos';
      
      // Use custom filename if provided, otherwise extract from file path
      let publicId;
      if (customFilename) {
        publicId = customFilename;
      } else {
        // Extract filename without extension
        const path = await import('path');
        const filename = path.basename(filePath, path.extname(filePath));
        publicId = filename;
      }

      console.log(`   Public ID: ${publicId}`);

      // Upload with timeout
      const uploadPromise = cloudinaryV2.uploader.upload(filePath, {
        folder: uploadFolder,
        public_id: publicId,
        overwrite: true,
        resource_type: 'image',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
        transformation: [
          { 
            width: 800, 
            height: 800, 
            crop: 'limit',
            quality: 'auto:good' 
          }
        ],
        timeout: 15000 // 15 second timeout
      });

      const result = await uploadPromise;

      console.log('✅ Cloudinary upload successful!');
      console.log(`   URL: ${result.secure_url}`);

      return {
        success: true,
        url: result.secure_url,
        publicId: result.public_id,
        format: result.format,
        width: result.width,
        height: result.height,
        bytes: result.bytes
      };

    } catch (error) {
      lastError = error;
      
      // Check if it's a network/DNS error
      const isNetworkError = error.code === 'ENOTFOUND' || 
                            error.code === 'ECONNREFUSED' || 
                            error.code === 'ETIMEDOUT' ||
                            error.code === 'ECONNRESET' ||
                            error.errno === -3008;

      if (isNetworkError) {
        console.error(`⚠️  Network error on attempt ${attempt}/${maxRetries}:`);
        console.error(`   Error: ${error.code || error.errno} - Cannot reach api.cloudinary.com`);
        console.error(`   Message: ${error.message}`);
        
        if (attempt < maxRetries) {
          const waitTime = attempt * 2000; // Progressive backoff: 2s, 4s, 6s
          console.log(`   ⏳ Waiting ${waitTime/1000}s before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
          continue;
        } else {
          console.error('❌ All retry attempts failed - Network/DNS issue detected');
          console.error('   Possible causes:');
          console.error('   1. No internet connection');
          console.error('   2. DNS cannot resolve api.cloudinary.com');
          console.error('   3. Firewall/Proxy blocking Cloudinary');
          console.error('   4. ISP/Network blocking cloudinary.com');
          
          const networkError = new Error('Cannot connect to Cloudinary servers. Please check your internet connection and DNS settings.');
          networkError.code = 'NETWORK_ERROR';
          networkError.originalError = error;
          throw networkError;
        }
      } else {
        // Non-network error, don't retry
        console.error('❌ Cloudinary upload error:', error);
        throw new Error(`Failed to upload logo to Cloudinary: ${error.message}`);
      }
    }
  }

  // Should never reach here, but just in case
  throw lastError || new Error('Upload failed after all retries');
}

/**
 * Delete company logo from Cloudinary
 * @param {string} logoUrl - Full Cloudinary URL of the logo
 * @returns {Promise<Object>} Delete result
 */
async function deleteCompanyLogo(logoUrl) {
  if (!isConfigured()) {
    throw new Error('Cloudinary is not configured. Please set CLOUDINARY_* environment variables.');
  }

  if (!logoUrl || !logoUrl.includes('cloudinary.com')) {
    return { success: true, message: 'No Cloudinary logo to delete' };
  }

  try {
    // Extract public_id from URL
    // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/v{version}/{folder}/{public_id}.{format}
    const publicId = extractPublicId(logoUrl);
    
    if (!publicId) {
      throw new Error('Could not extract public_id from URL');
    }

    console.log('🗑️  Deleting logo from Cloudinary...');
    console.log(`   Public ID: ${publicId}`);

    const result = await cloudinaryV2.uploader.destroy(publicId);

    if (result.result === 'ok') {
      console.log('✅ Logo deleted successfully');
      return { success: true, result };
    } else if (result.result === 'not found') {
      console.log('⚠️  Logo not found (may already be deleted)');
      return { success: true, result: 'not found' };
    } else {
      throw new Error(`Unexpected result: ${result.result}`);
    }
  } catch (error) {
    console.error('❌ Cloudinary delete error:', error);
    throw new Error(`Failed to delete logo from Cloudinary: ${error.message}`);
  }
}

/**
 * Extract public_id from Cloudinary URL
 * @param {string} url - Cloudinary URL
 * @returns {string|null} Public ID or null if not found
 */
function extractPublicId(url) {
  try {
    // Example URL: https://res.cloudinary.com/demo/image/upload/v1234567890/kpn-fast/company-logos/logo_COMP001.png
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.\w+$/);
    return match ? match[1] : null;
  } catch (error) {
    return null;
  }
}

/**
 * Get Cloudinary configuration status
 * @returns {Object} Configuration status
 */
function getConfigStatus() {
  ensureConfigured(); // Load config from env first
  const config = cloudinaryV2.config();
  return {
    configured: isConfigured(),
    cloud_name: config.cloud_name ? '✓ Set' : '✗ Missing',
    api_key: config.api_key ? '✓ Set' : '✗ Missing',
    api_secret: config.api_secret ? '✓ Set' : '✗ Missing',
    upload_folder: process.env.CLOUDINARY_UPLOAD_FOLDER || 'kpn-fast/company-logos'
  };
}

export default {
  uploadCompanyLogo,
  deleteCompanyLogo,
  isConfigured,
  getConfigStatus
};
