# 🚀 KPN FAST - Setup Roadmap

Roadmap visual untuk setup dan development KPN FAST.

---

## 📊 Setup Progress Tracker

```
┌─────────────────────────────────────────────────────────────┐
│                    KPN FAST SETUP ROADMAP                   │
└─────────────────────────────────────────────────────────────┘

PHASE 1: GOOGLE CLOUD SETUP (Week 1 - Days 1-2)
═══════════════════════════════════════════════
┌─────────────────────────────────────────────┐
│ □ 1.1 Create Google Cloud Project          │
│ □ 1.2 Enable Google Gemini API             │
│ □ 1.3 Enable Google Sheets API             │
│ □ 1.4 Enable Google Docs API               │
│ □ 1.5 Enable Google Drive API              │
│ □ 1.6 Generate Gemini API Key              │
│ □ 1.7 Create Service Account               │
│ □ 1.8 Download Service Account JSON        │
│ □ 1.9 Save to backend/credentials/         │
└─────────────────────────────────────────────┘
📖 Panduan: GOOGLE_CLOUD_SETUP.md


PHASE 2: GOOGLE SHEETS DATABASE (Week 1 - Day 3)
═══════════════════════════════════════════════
┌─────────────────────────────────────────────┐
│ □ 2.1 Create Google Sheet: Profil          │
│      - Add headers (9 columns)             │
│      - Fill company data (1 row)           │
│                                             │
│ □ 2.2 Create Google Sheet: Personil        │
│      - Add headers (9 columns)             │
│      - Fill personnel data (3-5 rows)      │
│                                             │
│ □ 2.3 Share both sheets with SA email      │
│      - Permission: Editor                  │
│                                             │
│ □ 2.4 Copy Sheet IDs from URLs             │
└─────────────────────────────────────────────┘
📖 Panduan: GOOGLE_CLOUD_SETUP.md - Step 4


PHASE 3: ENVIRONMENT SETUP (Week 1 - Day 3)
═══════════════════════════════════════════════
┌─────────────────────────────────────────────┐
│ □ 3.1 Copy .env.example to .env            │
│                                             │
│ □ 3.2 Fill environment variables:          │
│      ✓ GOOGLE_GEMINI_API_KEY               │
│      ✓ GOOGLE_SHEET_ID_PROFIL              │
│      ✓ GOOGLE_SHEET_ID_PERSONIL            │
│      ✓ JWT_SECRET (generate)               │
│                                             │
│ □ 3.3 Install dependencies                 │
│      cd backend && npm install             │
│                                             │
│ □ 3.4 Test connection                      │
│      node test-google-sheets.js            │
└─────────────────────────────────────────────┘
📖 Panduan: backend/ENV_SETUP_GUIDE.md


PHASE 4: BACKEND SERVICES (Week 2)
═══════════════════════════════════════════════
┌─────────────────────────────────────────────┐
│ □ 4.1 Google Sheets Service                │
│      - Fetch profil perusahaan             │
│      - Fetch all personil                  │
│      - API endpoints                       │
│                                             │
│ □ 4.2 PDF Parser Service                   │
│      - Extract KAK metadata                │
│      - Extract project info                │
│                                             │
│ □ 4.3 Excel Parser Service                 │
│      - Parse HPS/RAB tables                │
│      - Calculate totals                    │
│                                             │
│ □ 4.4 Test parsers with sample files       │
└─────────────────────────────────────────────┘


PHASE 5: TEMPLATE ENGINE (Week 3)
═══════════════════════════════════════════════
┌─────────────────────────────────────────────┐
│ □ 5.1 Template data merger                 │
│      - Profil + HPS → JSON                 │
│                                             │
│ □ 5.2 Document templates                   │
│      - Surat Penawaran                     │
│      - Cover & SPK                         │
│      - Other static docs                   │
│                                             │
│ □ 5.3 Calculation utilities                │
│      - Price calculation                   │
│      - Terbilang function                  │
│                                             │
│ □ 5.4 Test generation                      │
└─────────────────────────────────────────────┘


PHASE 6: AI INTEGRATION (Week 4)
═══════════════════════════════════════════════
┌─────────────────────────────────────────────┐
│ □ 6.1 Gemini API Service                   │
│      - Prompt builder                      │
│      - API caller                          │
│      - Response parser                     │
│                                             │
│ □ 6.2 Usulan Teknis Generator              │
│      - Metodologi teknis                   │
│      - Role: Tenaga Ahli                   │
│                                             │
│ □ 6.3 Review & Revision Flow               │
│      - User can edit AI output             │
│      - Regenerate with feedback            │
│                                             │
│ □ 6.4 Test AI generation                   │
└─────────────────────────────────────────────┘


PHASE 7: GOOGLE DRIVE OUTPUT (Week 5)
═══════════════════════════════════════════════
┌─────────────────────────────────────────────┐
│ □ 7.1 Google Docs API Service              │
│      - Create document                     │
│      - Write content                       │
│      - Format text                         │
│                                             │
│ □ 7.2 Google Drive Folder Manager          │
│      - Create folder structure             │
│      - Organize files (00-14)              │
│                                             │
│ □ 7.3 Document Generator                   │
│      - Static docs (template)              │
│      - AI docs (usulan teknis)             │
│                                             │
│ □ 7.4 Test full workflow                   │
│      Upload → Process → Generate → Drive   │
└─────────────────────────────────────────────┘


PHASE 8: FRONTEND (Week 6)
═══════════════════════════════════════════════
┌─────────────────────────────────────────────┐
│ □ 8.1 Dashboard Layout                     │
│      - Navigation                          │
│      - Project list                        │
│                                             │
│ □ 8.2 Upload Interface                     │
│      - Upload PDF KAK                      │
│      - Upload Excel HPS                    │
│                                             │
│ □ 8.3 AI Review Interface                  │
│      - View AI draft                       │
│      - Edit & regenerate                   │
│      - Approve final                       │
│                                             │
│ □ 8.4 Output Viewer                        │
│      - List generated docs                 │
│      - Links to Google Drive               │
└─────────────────────────────────────────────┘


PHASE 9: POLISH & TESTING (Week 7)
═══════════════════════════════════════════════
┌─────────────────────────────────────────────┐
│ □ 9.1 Error Handling                       │
│ □ 9.2 Loading States                       │
│ □ 9.3 Validation                           │
│ □ 9.4 Responsive Design                    │
│ □ 9.5 End-to-End Testing                   │
│ □ 9.6 Documentation                        │
└─────────────────────────────────────────────┘
```

---

## 🎯 Current Priority: PHASE 1-3

**Status:** 📝 Setup & Configuration

**Next Actions:**
1. ✅ Follow `GOOGLE_CLOUD_SETUP.md`
2. ✅ Setup 2 Google Sheets
3. ✅ Fill `.env` file
4. ✅ Run `test-google-sheets.js`

**Estimated Time:** 2-3 hours

---

## 📅 Timeline Estimate

| Phase | Description | Duration |
|-------|-------------|----------|
| 1-3 | Setup & Configuration | 2-3 days |
| 4 | Backend Services | 5-7 days |
| 5 | Template Engine | 4-5 days |
| 6 | AI Integration | 5-6 days |
| 7 | Google Drive Output | 4-5 days |
| 8 | Frontend | 7-10 days |
| 9 | Polish & Testing | 3-5 days |
| **Total** | **Full Development** | **~6-7 weeks** |

---

## 🔄 Development Workflow

```
┌──────────────┐
│ 1. Upload    │  User uploads PDF KAK + Excel HPS
│   Files      │
└──────┬───────┘
       │
       v
┌──────────────┐
│ 2. Parse     │  Extract data from files
│   Documents  │  → Project info, budget, etc.
└──────┬───────┘
       │
       v
┌──────────────┐
│ 3. Fetch     │  Get from Google Sheets:
│   Database   │  → Company profile
└──────┬───────┘  → Personnel data
       │
       ├─────────────────────────────────┐
       │                                 │
       v                                 v
┌──────────────┐                  ┌──────────────┐
│ 4a. Static   │                  │ 4b. AI       │
│    Docs      │                  │    Docs      │
│              │                  │              │
│ • Penawaran  │                  │ • Metodologi │
│ • Cover      │                  │ • Teknis     │
│ • SPK        │                  │              │
└──────┬───────┘                  └──────┬───────┘
       │                                 │
       │         ┌─────────────┐         │
       │────────>│ 5. Review   │<────────│
       │         │    & Edit   │         │
       │         └──────┬──────┘         │
       │                │                │
       └────────────────┼────────────────┘
                        v
                ┌──────────────┐
                │ 6. Generate  │  Create docs in Google Drive
                │   to Drive   │  → Folder structure (00-14)
                └──────────────┘
```

---

## ✅ Success Criteria

Setup dianggap berhasil jika:

- [ ] Semua APIs di Google Cloud sudah enabled
- [ ] Service Account credentials sudah downloaded
- [ ] 2 Google Sheets sudah dibuat dan terisi data
- [ ] File `.env` terisi lengkap
- [ ] Test script passed: `node test-google-sheets.js` ✅
- [ ] Dependencies installed: `npm install` success
- [ ] No errors in console

---

## 📚 Quick Links

- 📖 [Setup Checklist](./SETUP_CHECKLIST.md)
- 🔐 [Google Cloud Setup](./GOOGLE_CLOUD_SETUP.md)
- ⚙️ [Environment Setup Guide](./backend/ENV_SETUP_GUIDE.md)
- 📗 [Quick Reference](./QUICK_REFERENCE.md)
- 🧪 [Test Script](./backend/test-google-sheets.js)

---

**Current Phase:** Setup & Configuration (Phase 1-3)  
**Next Milestone:** Backend Services (Phase 4)  
**Project Status:** 🟡 In Progress - Initial Setup
