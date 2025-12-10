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
        type: 'Google Sheets (Multiple Spreadsheets)',
        spreadsheets: {
          perusahaan: {
            name: 'PERUSAHAAN',
            description: '12 sheets (Perusahaan, Akta, Pejabat, NIB, Pengalaman, Project, dll)',
            url: process.env.GOOGLE_SHEET_ID_PERUSAHAAN 
              ? `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID_PERUSAHAAN}`
              : 'Not configured'
          },
          personel: {
            name: 'PERSONEL',
            description: '2 sheets (Personel, Personil_Project)',
            url: process.env.GOOGLE_SHEET_ID_PERSONEL 
              ? `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID_PERSONEL}`
              : 'Not configured'
          },
          kbli: {
            name: 'KBLI',
            description: '1 sheet (Klasifikasi Lapangan Usaha Indonesia)',
            url: process.env.GOOGLE_SHEET_ID_KBLI 
              ? `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID_KBLI}`
              : 'Not configured'
          },
          proyek: {
            name: 'PROYEK',
            description: 'Project management data',
            url: process.env.GOOGLE_SHEET_ID_PROYEK 
              ? `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID_PROYEK}`
              : 'Not configured'
          }
        }
      },
      storage: {
        status: 'connected',
        type: 'Google Drive',
        url: process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID
          ? `https://drive.google.com/drive/folders/${process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID}`
          : 'Not configured'
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
        type: 'Google Sheets (Multiple Spreadsheets)',
        spreadsheets: {
          perusahaan: {
            name: 'PERUSAHAAN',
            description: '12 sheets (Perusahaan, Akta, Pejabat, NIB, Pengalaman, Project, dll)',
            url: process.env.GOOGLE_SHEET_ID_PERUSAHAAN 
              ? `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID_PERUSAHAAN}`
              : 'Not configured'
          },
          personel: {
            name: 'PERSONEL',
            description: '2 sheets (Personel, Personil_Project)',
            url: process.env.GOOGLE_SHEET_ID_PERSONEL 
              ? `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID_PERSONEL}`
              : 'Not configured'
          },
          kbli: {
            name: 'KBLI',
            description: '1 sheet (Klasifikasi Lapangan Usaha Indonesia)',
            url: process.env.GOOGLE_SHEET_ID_KBLI 
              ? `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID_KBLI}`
              : 'Not configured'
          },
          proyek: {
            name: 'PROYEK',
            description: 'Project management data',
            url: process.env.GOOGLE_SHEET_ID_PROYEK 
              ? `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID_PROYEK}`
              : 'Not configured'
          }
        }
      },
      storage: {
        status: 'connected',
        type: 'Google Drive',
        url: process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID
          ? `https://drive.google.com/drive/folders/${process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID}`
          : 'Not configured'
      }
    }
  });
});

// Import routes
import personnelRoutes from './routes/personnel.routes.js';
import databaseRoutes from './routes/database.routes.js';
import driveRoutes from './routes/drive.routes.js';
import kbliRoutes from './routes/kbli.routes.js';

// Use routes
app.use('/api/companies', databaseRoutes); // Unified database routes for companies
app.use('/api/personnel', personnelRoutes); // Personnel management
app.use('/api/drive', driveRoutes); // Google Drive folder management
app.use('/api/kbli', kbliRoutes); // KBLI master data and company KBLI

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
