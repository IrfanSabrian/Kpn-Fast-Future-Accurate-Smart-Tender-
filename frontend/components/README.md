# Reusable Components Documentation

## 1. TechnicalHeader.vue
Sticky header component untuk halaman detail perusahaan dan personel.

### Props:
- `title` (String, required): Nama entitas (perusahaan/personel)
- `initials` (String, required): Inisial untuk avatar
- `status` (String, default: 'Aktif'): Status entitas
- `entityId` (String, required): ID entitas
- `backRoute` (String, required): Route untuk tombol back
- `statusIcon` (String, default: 'fas fa-check-circle'): Icon untuk status badge

### Usage:
```vue
<TechnicalHeader
  :title="company.nama_perusahaan"
  :initials="getInitials(company.nama_perusahaan)"
  :status="company.status_perusahaan"
  :entity-id="company.id_perusahaan"
  back-route="/database/companies"
/>
```

---

## 2. DocumentPreview.vue
Panel preview dokumen PDF dengan header dan tombol external link.

### Props:
- `title` (String, default: 'Preview Dokumen'): Judul panel
- `documentUrl` (String, default: null): URL dokumen PDF
- `showPreview` (Boolean, default: true): Toggle preview
- `emptyIcon` (String, default: 'fas fa-file-pdf'): Icon untuk empty state
- `emptyMessage` (String, default: 'Tidak ada dokumen'): Pesan empty state
- `buttonColor` (String, default: 'blue'): Warna tombol (blue/orange/emerald/purple)
- `containerClass` (String): Custom class untuk container

### Usage:
```vue
<DocumentPreview
  title="Preview Dokumen KTP"
  :document-url="ktp.file_ktp_url"
  button-color="blue"
  empty-icon="far fa-id-card"
  empty-message="Dokumen KTP tidak tersedia"
/>
```

---

## 3. DetailRow.vue
Baris detail dengan pattern label-value yang konsisten.

### Props:
- `label` (String, required): Label/judul field
- `value` (String/Number, default: null): Value/isi field
- `spacing` (String, default: 'normal'): Jarak vertikal (tight/normal/relaxed)
- `bordered` (Boolean, default: true): Tampilkan border bawah

### Usage:
```vue
<!-- Basic usage -->
<DetailRow 
  label="Nama Lengkap" 
  :value="person.nama_lengkap" 
/>

<!-- With custom content via slot -->
<DetailRow label="Telepon">
  <a :href="`tel:${person.no_hp}`" class="text-blue-600 hover:underline">
    {{ person.no_hp }}
  </a>
</DetailRow>

<!-- Tight spacing, no border -->
<DetailRow 
  label="Status" 
  :value="person.status" 
  spacing="tight"
  :bordered="false"
/>
```

---

## Migration Guide

### Before (Companies):
```vue
<header class="sticky top-0 z-30 bg-gradient-to-r...">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex items-center gap-6 py-4">
      <!-- Back button, avatar, title, badges... -->
    </div>
  </div>
</header>
```

### After:
```vue
<TechnicalHeader
  :title="company.nama_perusahaan"
  :initials="getInitials(company.nama_perusahaan)"
  :status="company.status_perusahaan"
  :entity-id="company.id_perusahaan"
  back-route="/database/companies"
/>
```

### Benefits:
✅ Konsistensi UI/UX antar halaman
✅ Kode lebih bersih dan mudah maintain
✅ Lebih mudah untuk update styling global
✅ Reduce code duplication
