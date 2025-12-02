import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Load environment variables
dotenv.config();

// ES Module alternatives for __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(helmet()); // Security headers
app.use(cors()); // Enable CORS
app.use(compression()); // Compress responses
app.use(morgan('dev')); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'KPN FAST - Fast And Smart Technology API',
    version: '1.0.0',
    status: 'running',
    services: {
      database: {
        status: 'connected',
        type: 'Google Sheets',
        url: `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID}`
      },
      storage: {
        status: 'connected',
        type: 'Google Drive',
        url: `https://drive.google.com/drive/folders/${process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID}`
      }
    }
  });
});

// API root endpoint (same as /)
app.get('/api', (req, res) => {
  res.json({
    message: 'KPN FAST - Fast And Smart Technology API',
    version: '1.0.0',
    status: 'running',
    services: {
      database: {
        status: 'connected',
        type: 'Google Sheets',
        url: `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID}`
      },
      storage: {
        status: 'connected',
        type: 'Google Drive',
        url: `https://drive.google.com/drive/folders/${process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID}`
      }
    }
  });
});

// Import routes
import companyRoutes from './routes/company.routes.js';
import personnelRoutes from './routes/personnel.routes.js';
import databaseRoutes from './routes/database.routes.js';
import driveRoutes from './routes/drive.routes.js';

// Use routes
app.use('/api/companies', databaseRoutes); // New unified database routes
app.use('/api/company', companyRoutes); // Keep for backward compatibility
app.use('/api/personnel', personnelRoutes); // Keep for backward compatibility
app.use('/api/drive', driveRoutes); // Google Drive folder management

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: 'Route not found',
      status: 404
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 KPN FAST Backend running on port ${PORT}`);
  console.log(`📍 Environment: ${process.env.NODE_ENV}`);
  console.log(`🌐 API URL: http://localhost:${PORT}`);
});

export default app;
