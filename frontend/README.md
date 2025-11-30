# KPN FAST - Frontend Dashboard

Frontend web application untuk sistem automasi dokumen pengadaan KPN FAST (Fast And Smart Technology) menggunakan Nuxt.js 4.

## 🚀 Teknologi

- **Nuxt.js 4** - Vue.js framework
- **Vue 3** - Progressive JavaScript framework
- **Pinia** - State management
- **Tailwind CSS** - Utility-first CSS framework
- **Axios** - HTTP client
- **VueUse** - Collection of Vue composition utilities

## 📋 Prerequisites

- Node.js v18+
- NPM atau Yarn

## 🛠️ Installation

1. Install dependencies:
```bash
npm install
```

2. Setup environment variables:
```bash
cp .env.example .env
```

3. Edit `.env` dan sesuaikan dengan backend API URL Anda

## 🏃 Running

Development mode:
```bash
npm run dev
```

Build untuk production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## 📁 Struktur Folder

```
frontend/
├── app/
├── assets/
│   └── css/
│       └── main.css           # Global styles
├── components/                # Vue components (akan dibuat)
│   ├── layout/
│   ├── project/
│   ├── document/
│   └── common/
├── layouts/                   # Layout templates (akan dibuat)
│   ├── default.vue
│   └── dashboard.vue
├── pages/                     # Pages/Routes (akan dibuat)
│   ├── index.vue
│   ├── login.vue
│   ├── dashboard/
│   ├── projects/
│   └── documents/
├── stores/                    # Pinia stores
│   ├── auth.js               # Authentication store
│   └── project.js            # Project store
├── plugins/                   # Nuxt plugins (akan dibuat)
├── composables/              # Vue composables (akan dibuat)
├── middleware/               # Route middleware (akan dibuat)
├── public/                   # Static files
├── nuxt.config.ts           # Nuxt configuration
├── tailwind.config.js       # Tailwind configuration
└── package.json             # Dependencies
```

## 🎨 Design System

Frontend menggunakan design system yang sudah didefinisikan di `assets/css/main.css` dengan:

- **Colors**: Primary (blue) & Secondary (purple)
- **Components**: Cards, Buttons, Inputs, Badges
- **Utilities**: Glass effect, Gradients, Animations

## 🔌 API Integration

Frontend berkomunikasi dengan backend melalui REST API:
- Base URL dikonfigurasi di `.env` → `NUXT_PUBLIC_API_BASE_URL`
- Default: `http://localhost:5000/api`

## 📱 Features (akan diimplementasi)

- ✅ Authentication & Authorization
- ✅ Project Management Dashboard
- ✅ File Upload (PDF KAK & Excel HPS)
- ✅ Document Generation Interface
- ✅ AI Review & Editing Interface
- ✅ Google Drive Integration View
- ✅ Personnel & Company Data Management

## 🚧 Next Steps

Setelah setup selesai, akan dibuat:
1. Page layouts (default, dashboard)
2. Authentication pages (login, register)
3. Dashboard page
4. Project management pages
5. Document generation interface
6. Components library
