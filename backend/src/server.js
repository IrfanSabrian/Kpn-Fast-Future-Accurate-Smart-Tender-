import express from "express";
import cors from "cors";
import helmet from "helmet";
import compression from "compression";
import morgan from "morgan";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

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
app.use(morgan("dev")); // Logging
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Static files for uploads
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "KPN FAST - Fast And Smart Technology API",
    version: "1.0.0",
    status: "running",
    services: {
      database: {
        status: "connected",
        type: "Google Sheets (Multiple Spreadsheets)",
        spreadsheets: {
          perusahaan: {
            name: "PERUSAHAAN",
            description:
              "12 sheets (Perusahaan, Akta, Pejabat, NIB, Pengalaman, Project, dll)",
            url: process.env.GOOGLE_SHEET_ID_PERUSAHAAN
              ? `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID_PERUSAHAAN}`
              : "Not configured",
          },
          personel: {
            name: "PERSONEL",
            description: "2 sheets (Personel, Personil_Project)",
            url: process.env.GOOGLE_SHEET_ID_PERSONEL
              ? `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID_PERSONEL}`
              : "Not configured",
          },
          kbli: {
            name: "KBLI",
            description: "1 sheet (Klasifikasi Lapangan Usaha Indonesia)",
            url: process.env.GOOGLE_SHEET_ID_KBLI
              ? `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID_KBLI}`
              : "Not configured",
          },
          proyek: {
            name: "PROYEK",
            description: "Project management data",
            url: process.env.GOOGLE_SHEET_ID_PROYEK
              ? `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID_PROYEK}`
              : "Not configured",
          },
        },
      },
      storage: {
        status: "connected",
        type: "Google Drive",
        url: process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID
          ? `https://drive.google.com/drive/folders/${process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID}`
          : "Not configured",
      },
      ai: {
        status: process.env.GOOGLE_GEMINI_API_KEY
          ? "configured"
          : "not configured",
        type: "Google Gemini AI",
        model: "gemini-2.5-flash-lite",
        features: [
          "KTP Scanning",
          "NPWP Scanning",
          "Ijazah Scanning",
          "CV Scanning",
        ],
      },
    },
  });
});

// API root endpoint (same as /)
app.get("/api", (req, res) => {
  res.json({
    message: "KPN FAST - Fast And Smart Technology API",
    version: "1.0.0",
    status: "running",
    services: {
      database: {
        status: "connected",
        type: "Google Sheets (Multiple Spreadsheets)",
        spreadsheets: {
          perusahaan: {
            name: "PERUSAHAAN",
            description:
              "12 sheets (Perusahaan, Akta, Pejabat, NIB, Pengalaman, Project, dll)",
            url: process.env.GOOGLE_SHEET_ID_PERUSAHAAN
              ? `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID_PERUSAHAAN}`
              : "Not configured",
          },
          personel: {
            name: "PERSONEL",
            description: "2 sheets (Personel, Personil_Project)",
            url: process.env.GOOGLE_SHEET_ID_PERSONEL
              ? `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID_PERSONEL}`
              : "Not configured",
          },
          kbli: {
            name: "KBLI",
            description: "1 sheet (Klasifikasi Lapangan Usaha Indonesia)",
            url: process.env.GOOGLE_SHEET_ID_KBLI
              ? `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID_KBLI}`
              : "Not configured",
          },
          proyek: {
            name: "PROYEK",
            description: "Project management data",
            url: process.env.GOOGLE_SHEET_ID_PROYEK
              ? `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID_PROYEK}`
              : "Not configured",
          },
        },
      },
      storage: {
        status: "connected",
        type: "Google Drive",
        url: process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID
          ? `https://drive.google.com/drive/folders/${process.env.GOOGLE_DRIVE_PARENT_FOLDER_ID}`
          : "Not configured",
      },
      ai: {
        status: process.env.GOOGLE_GEMINI_API_KEY
          ? "configured"
          : "not configured",
        type: "Google Gemini AI",
        model: "gemini-2.5-flash-lite",
        features: [
          "KTP Scanning",
          "NPWP Scanning",
          "Ijazah Scanning",
          "CV Scanning",
        ],
      },
    },
  });
});

// Import routes
import personnelRoutes from "./routes/personnel.routes.js";
import personnelDocumentsRoutes from "./routes/personnelDocuments.routes.js";
import oauth2AuthRoutes from "./routes/oauth2Auth.routes.js";
import databaseRoutes from "./routes/database.routes.js";
import driveRoutes from "./routes/drive.routes.js";
import kbliRoutes from "./routes/kbli.routes.js";
import recentActivitiesRoutes from "./routes/recentActivities.routes.js";
import sheetsPermissionRoutes from "./routes/sheetsPermission.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import settingsRoutes from "./routes/settings.routes.js";

// Use routes
app.use("/api/auth", oauth2AuthRoutes); // OAuth2 authentication
app.use("/api/companies", databaseRoutes); // Company management (GET, POST, PUT, DELETE) with file upload
app.use("/api/personnel", personnelRoutes); // Personnel management
app.use("/api/personnel-documents", personnelDocumentsRoutes); // Personnel documents (KTP, NPWP, Ijazah, CV)
app.use("/api/drive", driveRoutes); // Google Drive folder management
app.use("/api/kbli", kbliRoutes); // KBLI master data and company KBLI
app.use("/api/activities", recentActivitiesRoutes); // Recent activities with author
app.use("/api/sheets", sheetsPermissionRoutes); // Google Sheets permission management
app.use("/api/ai", aiRoutes); // AI-powered document scanning with Gemini
app.use("/api/settings", settingsRoutes); // Application settings

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    error: {
      message: err.message || "Internal Server Error",
      status: err.status || 500,
    },
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: {
      message: "Route not found",
      status: 404,
    },
  });
});

// Import Gemini AI service for verification
import geminiAIService from "./services/geminiAI.service.js";

// Helper to clean emoji for better HTA compatibility
// Set USE_CLEAN_LOGS=true in .env to enable
function cleanLog(text) {
  if (process.env.USE_CLEAN_LOGS !== "true") return text;

  const emojiMap = {
    "🚀": ">>",
    "📍": ">>",
    "🌐": ">>",
    "✅": "[OK]",
    "❌": "[X]",
    "⚠️": "[!]",
    "🔍": ">>",
    "✨": ">>",
  };

  let cleaned = text;
  for (const [emoji, replacement] of Object.entries(emojiMap)) {
    cleaned = cleaned.split(emoji).join(replacement);
  }
  return cleaned;
}

// Function to verify Gemini API
async function verifyGeminiAPI() {
  console.log(cleanLog("\n🔍 Checking Gemini AI API..."));

  try {
    await geminiAIService.initialize();
    console.log(cleanLog("✅ Gemini AI API: VERIFIED & READY"));
    console.log(`   Model: gemini-2.5-flash-lite`);
    return true;
  } catch (error) {
    if (!process.env.GOOGLE_GEMINI_API_KEY) {
      console.log(cleanLog("⚠️  Gemini API Key: NOT CONFIGURED"));
      console.log(
        "   Set GOOGLE_GEMINI_API_KEY in .env or Settings to enable AI document scanning",
      );
    } else {
      console.log(cleanLog("❌ Gemini AI API: VERIFICATION FAILED"));
      console.log(`   Error: ${error.message}`);
      console.log("   AI document scanning will not be available");
    }
    return false;
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(cleanLog(`🚀 KPN FAST Backend running on port ${PORT}`));
  console.log(cleanLog(`📍 Environment: ${process.env.NODE_ENV}`));
  console.log(cleanLog(`🌐 API URL: http://localhost:${PORT}`));

  // Ensure uploads directory exists
  try {
    const fs = await import("fs/promises");
    const uploadDir = path.join(__dirname, "../uploads");
    await fs.mkdir(uploadDir, { recursive: true });
    console.log(cleanLog(`✅ Uploads directory confirmed: ${uploadDir}`));
  } catch (err) {
    console.error(
      cleanLog(`❌ Failed to create uploads directory: ${err.message}`),
    );
  }

  // Verify Gemini API on startup
  await verifyGeminiAPI();

  console.log(cleanLog("\n✨ Server is ready to accept requests\n"));
});

export default app;
