<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
    <!-- Technical Header (Full Width) -->
    <!-- Technical Header (Full Width) Using Component -->
    <CompanyDetailHeader
      :company="company"
      :active-tab="activeTab"
      :tabs="tabs"
      :logo-url="getCompanyLogoUrl(company)"
      :kop-url="getCompanyKopUrl(company)"
      :should-show-logo="shouldShowLogo(company)"
      :should-show-kop="shouldShowKop(company)"
      :initials="company ? getInitials(company.nama_perusahaan) : '?'"
      @back="router.push('/database/companies')"
      @tab-change="activeTab = $event"
      @logo-error="(e) => handleImageError(e, company)"
      @kop-error="(e) => handleKopImageError(e, company)"
    />

    <!-- Main Content Area (Full Width) -->
    <main class="max-w-[1800px] mx-auto px-4 md:px-6 py-6 min-h-[60vh]">
      <!-- Loading State -->
      <!-- Loading State Skeleton -->
      <div v-if="loadingTab" class="w-full">
        <div
          class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-6 relative overflow-hidden"
        >
          <!-- Header Area -->
          <div class="flex justify-between items-center mb-8">
            <div class="space-y-3">
              <BaseSkeleton width="200px" height="1.5rem" />
              <BaseSkeleton width="300px" height="1rem" />
            </div>
            <BaseSkeleton width="120px" height="40px" class-name="rounded-lg" />
          </div>

          <!-- Content Area (Split or Grid) -->
          <div class="grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
            <div class="space-y-3">
              <BaseSkeleton width="100%" height="2rem" />
              <BaseSkeleton width="100%" height="2rem" />
              <BaseSkeleton width="100%" height="2rem" />
              <BaseSkeleton width="100%" height="4rem" />
              <BaseSkeleton width="100%" height="2rem" />
            </div>
            <div class="hidden md:block h-full">
              <BaseSkeleton
                width="100%"
                height="200px"
                class-name="rounded-lg"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Content Views -->
      <div v-else class="animate-fade-in-up">
        <Transition name="tab-fade" mode="out-in">
          <div :key="activeTab" class="w-full">
            <!-- OVERVIEW TAB (Redesigned) -->
            <CompanyOverviewTab
              v-if="activeTab === 'overview' && company"
              :company="company"
              :pejabat-list="subModules.pejabat"
              :pending-profile-file="pendingCompanyProfileFile"
              :pending-profile-preview="pendingCompanyProfilePreview"
              :is-uploading-profile="isUploadingCompanyProfile"
              @edit-contact="openEditContactModal"
              @add-pejabat="openAddPejabatModal"
              @navigate-personnel="navigateToPersonnel"
              @profile-select="handleCompanyProfileSelect"
              @profile-save="saveCompanyProfile"
              @profile-cancel="cancelCompanyProfileUpload"
            />

            <!-- 1. AKTA TAB -->
            <!-- 1. AKTA TAB -->
            <CompanyDocumentTab
              ref="aktaTab"
              v-if="activeTab === 'akta'"
              :single-mode="true"
              label="Akta Perusahaan"
              document-type="akta"
              :items="subModules.akta"
              id-key="id_akta"
              title-key="jenis_akta"
              title-label="JENIS AKTA"
              :fields="[
                {
                  label: 'JENIS AKTA',
                  key: 'jenis_akta',
                  type: 'select',
                  options: ['Pendirian', 'Perubahan'],
                },
                { label: 'NOMOR AKTA', key: 'nomor_akta', type: 'text' },
                {
                  label: 'TANGGAL',
                  key: 'tanggal_akta',
                  type: 'date',
                  format: formatDate,
                },
                { label: 'NOTARIS', key: 'notaris', type: 'text' },
              ]"
              icon="fas fa-file-contract"
              color="orange"
              :selected-item="selectedItems.akta"
              :selected-url="getSelectedDocUrl('akta')"
              :pending-file="pendingUploads.akta?.file"
              :pending-preview="pendingUploads.akta?.preview"
              :is-uploading="uploadingState.akta"
              @select-item="(item) => selectItem('akta', item)"
              @upload-select="(file) => handleFileSelect('akta', file)"
              @upload-save="() => handleUploadSave('akta')"
              @upload-cancel="() => handleUploadCancel('akta')"
              @update-item="(data) => handleUpdateItem('akta', data)"
              @ai-scan="(data) => handleAiScan('akta', data)"
            />

            <!-- KONTRAK/PENGALAMAN TAB -->
            <CompanyDocumentTab
              v-if="activeTab === 'kontrak'"
              label="Kontrak"
              document-type="kontrak"
              :items="subModules.kontrak"
              id-key="id_kontrak"
              title-key="nama_pekerjaan"
              title-label="NAMA PEKERJAAN"
              :fields="[
                { label: 'BIDANG PEKERJAAN', key: 'bidang_pekerjaan' },
                { label: 'SUB BIDANG', key: 'sub_bidang_pekerjaan' },
                { label: 'LOKASI', key: 'lokasi' },
                { label: 'NAMA PEMBERI TUGAS', key: 'nama_pemberi_tugas' },
                { label: 'ALAMAT PEMBERI TUGAS', key: 'alamat_pemberi_tugas' },
                { label: 'TELP PEMBERI TUGAS', key: 'telepon_pemberi_tugas' },
                { label: 'FAX PEMBERI TUGAS', key: 'fax_pemberi_tugas' },
                { label: 'NOMOR KONTRAK', key: 'nomor_kontrak' },
                { label: 'TANGGAL KONTRAK', key: 'tanggal_kontrak' },
                {
                  label: 'BIDANG PEKERJAAN',
                  key: 'bidang_pekerjaan',
                  type: 'text',
                },
                {
                  label: 'SUB BIDANG',
                  key: 'sub_bidang_pekerjaan',
                  type: 'text',
                },
                { label: 'LOKASI', key: 'lokasi', type: 'text' },
                {
                  label: 'NAMA PEMBERI TUGAS',
                  key: 'nama_pemberi_tugas',
                  type: 'text',
                },
                {
                  label: 'ALAMAT PEMBERI TUGAS',
                  key: 'alamat_pemberi_tugas',
                  type: 'textarea',
                },
                {
                  label: 'TELP PEMBERI TUGAS',
                  key: 'telepon_pemberi_tugas',
                  type: 'text',
                },
                {
                  label: 'FAX PEMBERI TUGAS',
                  key: 'fax_pemberi_tugas',
                  type: 'text',
                },
                { label: 'NOMOR KONTRAK', key: 'nomor_kontrak', type: 'text' },
                {
                  label: 'TANGGAL KONTRAK',
                  key: 'tanggal_kontrak',
                  type: 'date',
                  format: formatDate,
                },
                {
                  label: 'NILAI KONTRAK',
                  key: 'nilai_kontrak',
                  type: 'number',
                  format: (val) =>
                    val ? `Rp ${Number(val).toLocaleString('id-ID')}` : '-',
                },
                {
                  label: 'WAKTU PELAKSANAAN',
                  key: 'waktu_pelaksanaan',
                  type: 'text',
                },
                {
                  label: 'TANGGAL SELESAI',
                  key: 'tanggal_selesai_kontrak',
                  type: 'date',
                  format: formatDate,
                },
                {
                  label: 'TGL BA SERAH TERIMA',
                  key: 'tanggal_ba_serah_terima',
                  type: 'date',
                  format: formatDate,
                },
              ]"
              icon="fas fa-briefcase"
              color="purple"
              :selected-item="selectedItems.kontrak"
              :selected-url="getSelectedDocUrl('kontrak')"
              :pending-file="pendingUploads.kontrak?.file"
              :pending-preview="pendingUploads.kontrak?.preview"
              :is-uploading="uploadingState.kontrak"
              @select-item="(item) => selectItem('kontrak', item)"
              @upload-select="(file) => handleFileSelect('kontrak', file)"
              @upload-save="() => handleUploadSave('kontrak')"
              @upload-cancel="() => handleUploadCancel('kontrak')"
              @update-item="(data) => handleUpdateItem('kontrak', data)"
            />

            <!-- CEK TAB -->
            <CompanyDocumentTab
              v-if="activeTab === 'cek'"
              :single-mode="true"
              label="Cek Referensi Bank"
              document-type="cek"
              :items="subModules.cek"
              id-key="id_cek"
              title-key="nama_bank"
              title-label="CEK REFERENSI BANK"
              :fields="[
                { label: 'NO REKENING', key: 'no_rekening', type: 'text' },
                { label: 'NAMA BANK', key: 'nama_bank', type: 'text' },
              ]"
              icon="fas fa-money-check"
              color="green"
              :selected-item="selectedItems.cek"
              :selected-url="getSelectedDocUrl('cek')"
              :pending-file="pendingUploads.cek?.file"
              :pending-preview="pendingUploads.cek?.preview"
              :is-uploading="uploadingState.cek"
              @select-item="(item) => selectItem('cek', item)"
              @upload-select="(file) => handleFileSelect('cek', file)"
              @upload-save="() => handleUploadSave('cek')"
              @upload-cancel="() => handleUploadCancel('cek')"
              @update-item="(data) => handleUpdateItem('cek', data)"
            />

            <!-- BPJS TAB -->
            <CompanyDocumentTab
              v-if="activeTab === 'bpjs'"
              :single-mode="true"
              label="BPJS"
              document-type="bpjs"
              :items="subModules.bpjs"
              id-key="id_bpjs"
              title-key="nomor_bpjs"
              title-label="BPJS"
              :fields="[
                {
                  label: 'NO. SERTIFIKAT',
                  key: 'nomor_sertifikat',
                  type: 'text',
                },
                {
                  label: 'NO. PENDAFTARAN',
                  key: 'nomor_pendaftaran',
                  type: 'text',
                },
                {
                  label: 'TGL DITETAPKAN',
                  key: 'tanggal_ditetapkan',
                  type: 'date',
                  format: formatDate,
                },
                {
                  label: 'LOKASI DITETAPKAN',
                  key: 'lokasi_ditetapkan',
                  type: 'text',
                },
              ]"
              icon="fas fa-heartbeat"
              color="pink"
              :selected-item="selectedItems.bpjs"
              :selected-url="getSelectedDocUrl('bpjs')"
              :pending-file="pendingUploads.bpjs?.file"
              :pending-preview="pendingUploads.bpjs?.preview"
              :is-uploading="uploadingState.bpjs"
              @select-item="(item) => selectItem('bpjs', item)"
              @upload-select="(file) => handleFileSelect('bpjs', file)"
              @upload-save="() => handleUploadSave('bpjs')"
              @upload-cancel="() => handleUploadCancel('bpjs')"
              @update-item="(data) => handleUpdateItem('bpjs', data)"
            />

            <!-- 2. NIB TAB (DISABLED - using original NIB tab at line 987 instead) -->
            <div
              v-if="false"
              class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              <!-- Left: NIB Details + KBLI (7 cols) -->
              <div class="lg:col-span-7 space-y-6">
                <div v-if="subModules.nib?.length > 0">
                  <div
                    v-for="(item, index) in subModules.nib"
                    :key="item.id_nib"
                    class="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-6 mb-4 last:mb-0"
                  >
                    <!-- Header -->
                    <div
                      class="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-700"
                    >
                      <div
                        class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0"
                      >
                        <i class="fas fa-id-badge"></i>
                      </div>
                      <div class="flex-1">
                        <div
                          class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                        >
                          NIB
                        </div>
                        <h4
                          class="font-bold text-slate-800 dark:text-white text-lg leading-none mt-1"
                        >
                          #{{ index + 1 }}
                        </h4>
                      </div>
                    </div>

                    <!-- NIB Details Grid -->
                    <div class="space-y-0.5">
                      <div
                        class="grid grid-cols-[130px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                      >
                        <div
                          class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                        >
                          Nomor NIB
                        </div>
                        <div
                          class="text-xs font-mono font-bold text-slate-700 dark:text-slate-200"
                        >
                          {{ item.nomor_nib || "-" }}
                        </div>
                      </div>

                      <div
                        class="grid grid-cols-[130px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                      >
                        <div
                          class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                        >
                          Tgl Terbit
                        </div>
                        <div
                          class="text-xs font-medium text-slate-700 dark:text-slate-200"
                        >
                          {{ item.tanggal_terbit || "-" }}
                        </div>
                      </div>

                      <div
                        class="grid grid-cols-[130px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                      >
                        <div
                          class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                        >
                          Status Modal
                        </div>
                        <div
                          class="text-xs font-medium text-slate-700 dark:text-slate-200"
                        >
                          {{ item.status || "-" }}
                        </div>
                      </div>

                      <div
                        class="grid grid-cols-[130px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                      >
                        <div
                          class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                        >
                          Skala Usaha
                        </div>
                        <div
                          class="text-xs font-medium text-slate-700 dark:text-slate-200"
                        >
                          {{ item.skala_usaha || "-" }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Empty State (if no NIB data) -->
                <div
                  v-else
                  class="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-6"
                >
                  <div
                    class="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0 opacity-50"
                    >
                      <i class="fas fa-id-badge"></i>
                    </div>
                    <div>
                      <div
                        class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                      >
                        NIB
                      </div>
                      <h4
                        class="font-bold text-slate-400 dark:text-slate-500 text-lg leading-none mt-1"
                      >
                        #1
                      </h4>
                    </div>
                  </div>

                  <div class="space-y-0.5">
                    <div
                      class="grid grid-cols-[130px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                    >
                      <div
                        class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                      >
                        Nomor NIB
                      </div>
                      <div
                        class="text-xs font-mono font-bold text-slate-400 dark:text-slate-500"
                      >
                        -
                      </div>
                    </div>
                    <div
                      class="grid grid-cols-[130px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                    >
                      <div
                        class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                      >
                        Tgl Terbit
                      </div>
                      <div
                        class="text-xs font-medium text-slate-400 dark:text-slate-500"
                      >
                        -
                      </div>
                    </div>
                    <div
                      class="grid grid-cols-[130px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                    >
                      <div
                        class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                      >
                        Status Modal
                      </div>
                      <div
                        class="text-xs font-medium text-slate-400 dark:text-slate-500"
                      >
                        -
                      </div>
                    </div>
                    <div
                      class="grid grid-cols-[130px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                    >
                      <div
                        class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                      >
                        Skala Usaha
                      </div>
                      <div
                        class="text-xs font-medium text-slate-400 dark:text-slate-500"
                      >
                        -
                      </div>
                    </div>
                  </div>
                </div>

                <!-- KBLI Section -->
                <div
                  class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6"
                >
                  <h4
                    class="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-4 flex items-center gap-2"
                  >
                    <i class="fas fa-sitemap text-xs"></i>
                    Kualifikasi KBLI
                    <span
                      v-if="subModules.kbli?.length"
                      class="ml-auto text-blue-600 dark:text-blue-400"
                      >({{ subModules.kbli.length }})</span
                    >
                  </h4>

                  <!-- KBLI Grid (if data exists) -->
                  <div
                    v-if="subModules.kbli?.length > 0"
                    class="grid grid-cols-2 gap-2"
                  >
                    <div
                      v-for="kbli in subModules.kbli"
                      :key="kbli.id_kbli"
                      class="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg p-3 hover:border-blue-300 dark:hover:border-blue-600 transition-all group"
                    >
                      <div
                        class="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 mb-1"
                      >
                        {{ kbli.kode_kbli }}
                      </div>
                      <div
                        class="text-xs text-slate-700 dark:text-slate-300 leading-tight line-clamp-2"
                      >
                        {{ kbli.judul_kbli || kbli.nama_klasifikasi }}
                      </div>
                    </div>
                  </div>

                  <!-- KBLI Empty State -->
                  <div v-else class="text-center py-6 text-slate-400">
                    <i class="fas fa-sitemap text-2xl mb-2 opacity-30"></i>
                    <p class="text-xs">Belum ada data KBLI terdaftar.</p>
                  </div>
                </div>
              </div>

              <!-- Right: PDF Preview (5 cols) -->
              <div class="lg:col-span-5 flex flex-col h-full">
                <DocumentPdfPreview
                  documentType="nib"
                  label="NIB"
                  :subtitle="
                    selectedItems.nib
                      ? `NIB: ${selectedItems.nib.nomor_nib || '-'}`
                      : ''
                  "
                  icon="fas fa-id-badge"
                  iconColor="blue"
                  :existingPdfUrl="getDocumentUrl('nib')"
                  :pendingFile="pendingDocuments.nib.file"
                  :pendingPreview="pendingDocuments.nib.preview"
                  :isUploading="pendingDocuments.nib.uploading"
                  @file-selected="(event) => handleDocumentSelect('nib', event)"
                  @save="saveDocument('nib')"
                  @cancel="cancelDocumentUpload('nib')"
                />
              </div>
            </div>

            <!-- 2.5 SBU TAB (DISABLED - using original SBU tab at line 1249 instead) -->
            <div
              v-if="false"
              class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
            >
              <!-- Left: Data List (7 cols) -->
              <div class="lg:col-span-7 space-y-4">
                <!-- Data Cards (when data exists) -->
                <div v-if="subModules.sbu?.length > 0" class="space-y-3">
                  <div
                    v-for="item in subModules.sbu"
                    :key="item.id_sbu"
                    class="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-6 transition-all group hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md"
                  >
                    <div
                      class="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-slate-700 pb-3"
                    >
                      <div class="flex items-center gap-3">
                        <div
                          class="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center shrink-0"
                        >
                          <i class="fas fa-certificate"></i>
                        </div>
                        <div>
                          <div
                            class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                          >
                            NOMOR SBU
                          </div>
                          <h4
                            class="font-bold text-slate-800 dark:text-white text-lg leading-none mt-1"
                          >
                            {{ item.nomor_sbu || "-" }}
                          </h4>
                        </div>
                      </div>
                    </div>

                    <div class="space-y-0.5 mt-4">
                      <div
                        class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                      >
                        <div
                          class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                        >
                          SUB BIDANG
                        </div>
                        <div
                          class="text-xs font-medium text-slate-700 dark:text-slate-200"
                        >
                          {{ item.sub_bidang || "-" }}
                        </div>
                      </div>

                      <div
                        class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                      >
                        <div
                          class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                        >
                          GRADE
                        </div>
                        <div
                          class="text-xs font-medium text-slate-700 dark:text-slate-200"
                        >
                          {{ item.grade || "-" }}
                        </div>
                      </div>

                      <div
                        class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                      >
                        <div
                          class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                        >
                          TGL TERBIT
                        </div>
                        <div
                          class="text-xs font-medium text-slate-700 dark:text-slate-200"
                        >
                          {{ item.tanggal_terbit || "-" }}
                        </div>
                      </div>

                      <div
                        class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                      >
                        <div
                          class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                        >
                          MASA BERLAKU
                        </div>
                        <div
                          class="text-xs font-medium text-slate-700 dark:text-slate-200"
                        >
                          {{ item.masa_berlaku || "-" }}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Empty State (when no data) -->
                <div
                  v-else
                  class="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-6"
                >
                  <div
                    class="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-slate-700 pb-3"
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center shrink-0 opacity-50"
                      >
                        <i class="fas fa-certificate"></i>
                      </div>
                      <div>
                        <div
                          class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                        >
                          NOMOR SBU
                        </div>
                        <h4
                          class="font-bold text-slate-400 dark:text-slate-500 text-lg leading-none mt-1"
                        >
                          -
                        </h4>
                      </div>
                    </div>
                  </div>

                  <div class="space-y-0.5 mt-4">
                    <div
                      class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                    >
                      <div
                        class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                      >
                        SUB BIDANG
                      </div>
                      <div
                        class="text-xs font-medium text-slate-400 dark:text-slate-500"
                      >
                        -
                      </div>
                    </div>
                    <div
                      class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                    >
                      <div
                        class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                      >
                        GRADE
                      </div>
                      <div
                        class="text-xs font-medium text-slate-400 dark:text-slate-500"
                      >
                        -
                      </div>
                    </div>
                    <div
                      class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                    >
                      <div
                        class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                      >
                        TGL TERBIT
                      </div>
                      <div
                        class="text-xs font-medium text-slate-400 dark:text-slate-500"
                      >
                        -
                      </div>
                    </div>
                    <div
                      class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                    >
                      <div
                        class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                      >
                        MASA BERLAKU
                      </div>
                      <div
                        class="text-xs font-medium text-slate-400 dark:text-slate-500"
                      >
                        -
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Right: PDF Preview (5 cols) -->
              <div class="lg:col-span-5 flex flex-col h-full">
                <DocumentPdfPreview
                  documentType="sbu"
                  label="SBU"
                  :subtitle="
                    selectedItems.sbu
                      ? `SBU: ${selectedItems.sbu.nomor_sbu || '-'}`
                      : ''
                  "
                  icon="fas fa-certificate"
                  iconColor="green"
                  :existingPdfUrl="getDocumentUrl('sbu')"
                  :pendingFile="pendingDocuments.sbu.file"
                  :pendingPreview="pendingDocuments.sbu.preview"
                  :isUploading="pendingDocuments.sbu.uploading"
                  @file-selected="(event) => handleDocumentSelect('sbu', event)"
                  @save="saveDocument('sbu')"
                  @cancel="cancelDocumentUpload('sbu')"
                />
              </div>
            </div>

            <!-- 3. PAJAK TAB (Style Dashboard) -->
            <!-- 3. PAJAK TAB (Compact Style) -->
            <CompanyTaxTab
              v-if="activeTab === 'pajak'"
              :tax-data="subModules"
              @open-modal="handleOpenTaxModal"
              @delete-spt="deleteSptEntry"
            />

            <!-- 5. NIB TAB -->
            <CompanyDocumentTab
              ref="nibTab"
              v-if="activeTab === 'nib'"
              :items="subModules.nib"
              document-type="nib"
              label="NIB"
              icon="fas fa-id-badge"
              color="blue"
              id-key="nomor_nib"
              title-key="nomor_nib"
              title-label="Nomor NIB"
              :fields="[
                { label: 'Nomor NIB', key: 'nomor_nib', type: 'text' },
                {
                  label: 'Tanggal Terbit',
                  key: 'tanggal_terbit',
                  type: 'date',
                  format: formatDate,
                },
                {
                  label: 'Status Modal',
                  key: 'status_penanaman_modal',
                  type: 'text',
                },
                { label: 'Skala Usaha', key: 'skala_usaha', type: 'text' },
              ]"
              :selected-item="selectedItems.nib"
              :selected-url="getSelectedDocUrl('nib')"
              :pending-file="pendingUploads.nib?.file"
              :pending-preview="pendingUploads.nib?.preview"
              :is-uploading="uploadingState.nib"
              single-mode
              @select-item="(item) => selectItem('nib', item)"
              @upload-select="(file) => handleFileSelect('nib', file)"
              @upload-save="() => handleUploadSave('nib')"
              @upload-cancel="() => handleUploadCancel('nib')"
              @update-item="(data) => handleUpdateItem('nib', data)"
              @ai-scan="(data) => handleAiScan('nib', data)"
            >
              <template #sidebar-extra="{ isEditing }">
                <!-- KBLI Qualifications Section -->

                <!-- VIEW MODE -->
                <div
                  v-if="!isEditing"
                  class="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden max-h-[275px]"
                >
                  <!-- Header -->
                  <div
                    class="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 shrink-0 flex justify-between items-center"
                  >
                    <div class="flex items-center gap-2">
                      <h4
                        class="text-xs font-bold text-slate-400 uppercase tracking-widest"
                      >
                        Kualifikasi KBLI
                      </h4>
                      <span
                        v-if="subModules.kbli?.length"
                        class="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-full"
                      >
                        {{ subModules.kbli.length }} ITEMS
                      </span>
                    </div>

                    <button
                      v-if="!isEditing"
                      @click.stop="
                        nibTab && subModules.nib
                          ? nibTab.startEditing(subModules.nib)
                          : null
                      "
                      class="text-[10px] font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 border border-blue-100 dark:border-blue-800 px-2 py-1 rounded transition-colors"
                    >
                      <i class="fas fa-edit mr-1"></i> Edit
                    </button>
                  </div>

                  <!-- Content (Scrollable) -->
                  <div class="flex-1 overflow-y-auto p-4">
                    <div
                      v-if="subModules.kbli?.length > 0"
                      class="grid grid-cols-1 md:grid-cols-2 gap-3 auto-rows-fr"
                    >
                      <div
                        v-for="kbli in subModules.kbli"
                        :key="kbli.id_perusahaan_kbli"
                        class="group relative p-3 rounded-lg border border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500/30 transition-all duration-300 min-h-[60px] flex items-center"
                      >
                        <div class="flex items-center gap-2 w-full">
                          <div
                            class="px-2 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded text-[10px] font-mono font-bold shrink-0 group-hover:text-blue-600 group-hover:border-blue-200 transition-colors"
                          >
                            {{ kbli.kode_kbli }}
                          </div>
                          <div class="flex-1 min-w-0">
                            <h5
                              class="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight transition-colors line-clamp-2"
                              :title="kbli.judul_kbli || kbli.nama_klasifikasi"
                            >
                              {{
                                kbli.judul_kbli ||
                                kbli.nama_klasifikasi ||
                                "Klasifikasi KBLI"
                              }}
                            </h5>
                          </div>
                        </div>
                      </div>
                    </div>

                    <!-- Empty State -->
                    <div
                      v-else
                      class="flex flex-col items-center justify-center h-full min-h-[50px] text-center"
                    >
                      <div
                        class="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3"
                      >
                        <i
                          class="fas fa-tags text-slate-300 dark:text-slate-500 text-2xl"
                        ></i>
                      </div>
                      <p
                        class="text-slate-500 dark:text-slate-400 text-sm font-medium"
                      >
                        Belum ada data KBLI terdaftar.
                      </p>
                    </div>
                  </div>
                </div>

                <!-- EDIT MODE -->
                <div
                  v-else
                  class="bg-white dark:bg-slate-800 rounded-xl border-2 border-blue-200 dark:border-blue-700 p-4 space-y-3"
                >
                  <div class="flex justify-between items-center">
                    <label
                      class="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase"
                    >
                      Edit Kode KBLI
                    </label>
                    <span
                      class="text-[10px] text-blue-600 font-bold bg-blue-50 px-2 py-0.5 rounded"
                    >
                      Mode Edit
                    </span>
                  </div>

                  <!-- KBLI Tags Input -->
                  <div
                    class="p-3 bg-slate-50 dark:bg-slate-900/50 rounded-lg border border-slate-200 dark:border-slate-700"
                  >
                    <div class="flex flex-wrap gap-2 mb-2 min-h-[30px]">
                      <div
                        v-for="(code, idx) in editKbliList"
                        :key="code"
                        class="bg-white dark:bg-slate-800 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 px-2 py-1 rounded-md flex items-center gap-1.5 text-xs font-mono font-bold shadow-sm animate-fadeIn"
                      >
                        {{ code }}
                        <button
                          @click="removeKbli(code)"
                          class="text-slate-400 hover:text-red-500 transition-colors w-4 h-4 flex items-center justify-center rounded-full hover:bg-red-50 dark:hover:bg-red-900/30"
                        >
                          <i class="fas fa-times text-[10px]"></i>
                        </button>
                      </div>
                    </div>
                    <input
                      v-model="newKbliInput"
                      @keydown.enter.prevent="addKbli"
                      @keydown.comma.prevent="addKbli"
                      @blur="addKbli"
                      type="text"
                      class="w-full text-sm bg-transparent border-none focus:ring-0 p-0 placeholder:text-slate-400 text-slate-700 dark:text-slate-200"
                      placeholder="Ketik kode KBLI (misal: 71102) lalu tekan Enter..."
                    />
                  </div>

                  <div
                    class="mt-4 flex justify-end gap-2 border-t border-slate-100 dark:border-slate-700 pt-3"
                  >
                    <div class="mr-auto flex items-center gap-2">
                      <button
                        @click.stop="handleAiScan('nib', subModules.nib?.[0])"
                        class="px-3 py-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-500 rounded-lg shadow-sm transition-colors flex items-center gap-1"
                        title="Scan KBLI dari dokumen NIB"
                      >
                        <i class="fas fa-magic"></i> Scan AI
                      </button>
                      <span class="text-[10px] text-slate-500 hidden sm:inline">
                        {{ editKbliList.length }} Kode
                      </span>
                    </div>

                    <button
                      @click.stop="nibTab?.cancelEditing()"
                      class="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg transition-colors"
                    >
                      Batal
                    </button>
                    <button
                      @click.stop="nibTab?.saveEditing()"
                      class="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors flex items-center gap-1"
                    >
                      <i class="fas fa-save"></i> Simpan
                    </button>
                  </div>
                </div>
              </template>
            </CompanyDocumentTab>
            <!-- SBU TAB -->
            <CompanyDocumentTab
              ref="sbuTab"
              v-if="activeTab === 'sbu'"
              :items="subModules.sbu"
              document-type="sbu"
              label="SBU"
              icon="fas fa-certificate"
              color="purple"
              id-key="id_sbu"
              title-key="nomor_pb_umku"
              title-label="Nomor PB-UMKU"
              :fields="[
                { label: 'No. PB UMKU', key: 'nomor_pb_umku', type: 'text' },
                { label: 'Jenis Usaha', key: 'jenis_usaha', type: 'text' },
                { label: 'Asosiasi', key: 'asosiasi', type: 'text' },
                { label: 'PJBU', key: 'pjbu', type: 'text' },
                { label: 'PJTBU', key: 'pjtbu', type: 'text' },
                {
                  label: 'Reg. LPJK',
                  key: 'nomor_registrasi_lpjk',
                  type: 'text',
                },
                {
                  label: 'Pelaksana',
                  key: 'pelaksana_sertifikasi',
                  type: 'text',
                },
                {
                  label: 'Tgl Terbit',
                  key: 'tanggal_terbit',
                  type: 'date',
                  format: formatDate,
                },
                {
                  label: 'Berlaku',
                  key: 'masa_berlaku',
                  type: 'date',
                  format: formatDate,
                },
                { label: 'Kualifikasi', key: 'kualifikasi', type: 'text' },
                { label: 'Subklas', key: 'kode_subklasifikasi', type: 'text' },
                { label: 'Sifat', key: 'sifat', type: 'text' },
                { label: 'KBLI', key: 'kode_kbli', type: 'text' },
                { label: 'PJSKBU', key: 'nama_pjskbu', type: 'text' },
              ]"
              :selected-item="selectedItems.sbu"
              :selected-url="getSelectedDocUrl('sbu')"
              :pending-file="pendingUploads.sbu?.file"
              :pending-preview="pendingUploads.sbu?.preview"
              :is-uploading="uploadingState.sbu"
              single-mode
              @select-item="(item) => selectItem('sbu', item)"
              @upload-select="(file) => handleFileSelect('sbu', file)"
              @upload-save="() => handleUploadSave('sbu')"
              @upload-cancel="() => handleUploadCancel('sbu')"
              @update-item="(data) => handleUpdateItem('sbu', data)"
              @ai-scan="(data) => handleAiScan('sbu', data)"
            />

            <!-- KTA TAB -->
            <CompanyDocumentTab
              ref="ktaTab"
              v-if="activeTab === 'kta'"
              :single-mode="true"
              label="KTA"
              document-type="kta"
              :items="subModules.kta"
              id-key="id_kta"
              title-key="nomor_anggota"
              title-label="KTA"
              :fields="[
                { label: 'No Anggota', key: 'nomor_anggota', type: 'text' },
                { label: 'Nama Asosiasi', key: 'nama_asosiasi', type: 'text' },
                {
                  label: 'Penanggung Jawab',
                  key: 'penanggung_jawab',
                  type: 'text',
                },
                { label: 'Jenis Usaha', key: 'jenis_usaha', type: 'text' },
                { label: 'Status', key: 'status_keanggotaan', type: 'text' },
                {
                  label: 'Tgl Terbit',
                  key: 'tanggal_terbit',
                  type: 'date',
                  format: formatDate,
                },
              ]"
              icon="fas fa-id-card-alt"
              color="teal"
              :selected-item="selectedItems.kta"
              :selected-url="getSelectedDocUrl('kta')"
              :pending-file="pendingUploads.kta?.file"
              :pending-preview="pendingUploads.kta?.preview"
              :is-uploading="uploadingState.kta"
              @select-item="(item) => selectItem('kta', item)"
              @upload-select="(file) => handleFileSelect('kta', file)"
              @upload-save="() => handleUploadSave('kta')"
              @upload-cancel="() => handleUploadCancel('kta')"
              @update-item="(data) => handleUpdateItem('kta', data)"
              @ai-scan="(data) => handleAiScan('kta', data)"
            />

            <!-- SERTIFIKAT TAB -->
            <CompanyDocumentTab
              v-if="activeTab === 'sertifikat'"
              :items="subModules.sertifikat"
              document-type="sertifikat"
              label="Sertifikat Standar"
              icon="fas fa-award"
              color="indigo"
              id-key="id_sertifikat_standar"
              title-key="nomor_sertifikat"
              title-label="Nomor Sertifikat"
              :fields="[
                {
                  label: 'Nomor Sertifikat',
                  key: 'nomor_sertifikat',
                  type: 'text',
                },
                { label: 'Kode KBLI', key: 'kode_kbli', type: 'text' },
                { label: 'Lembaga', key: 'lembaga_verifikasi', type: 'text' },
                {
                  label: 'Klasifikasi Risiko',
                  key: 'klasifikasi_risiko',
                  type: 'text',
                },
                { label: 'Status', key: 'status_pemenuhan', type: 'text' },
                {
                  label: 'Tanggal Terbit',
                  key: 'tanggal_terbit',
                  type: 'date',
                  format: formatDate,
                },
              ]"
              :selected-item="selectedItems.sertifikat"
              :selected-url="getSelectedDocUrl('sertifikat')"
              :pending-file="pendingUploads.sertifikat?.file"
              :pending-preview="pendingUploads.sertifikat?.preview"
              :is-uploading="uploadingState.sertifikat"
              @select-item="(item) => selectItem('sertifikat', item)"
              @upload-select="(file) => handleFileSelect('sertifikat', file)"
              @upload-save="() => handleUploadSave('sertifikat')"
              @upload-cancel="() => handleUploadCancel('sertifikat')"
              @update-item="(data) => handleUpdateItem('sertifikat', data)"
            />
          </div>
        </Transition>
      </div>
    </main>

    <!-- SPT Detail Modal -->
    <BaseModal
      :show="showSptModal"
      @close="showSptModal = false"
      maxWidth="5xl"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center"
          >
            <i class="fas fa-file-invoice"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">
              Detail SPT
            </h3>
            <p v-if="selectedSpt" class="text-xs text-slate-500 mt-0.5">
              Tahun {{ selectedSpt.tahun_pajak }} - {{ selectedSpt.masa_pajak }}
            </p>
          </div>
        </div>
      </template>

      <div
        v-if="selectedSpt"
        class="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[70vh]"
      >
        <!-- Left: Data Detail -->
        <div class="space-y-4 overflow-y-auto pr-2">
          <div
            class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800"
          >
            <div
              class="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase mb-2"
            >
              Informasi Wajib Pajak
            </div>
            <div class="space-y-2">
              <div class="grid grid-cols-[120px_1fr] gap-2 text-xs">
                <span class="font-bold text-slate-500">Nama WP</span>
                <span class="font-semibold text-slate-800 dark:text-white">{{
                  selectedSpt.nama_wp
                }}</span>
              </div>
              <div class="grid grid-cols-[120px_1fr] gap-2 text-xs">
                <span class="font-bold text-slate-500">NPWP</span>
                <span
                  class="font-mono font-bold text-slate-800 dark:text-white"
                  >{{ selectedSpt.npwp }}</span
                >
              </div>
              <div class="grid grid-cols-[120px_1fr] gap-2 text-xs">
                <span class="font-bold text-slate-500">NITKU</span>
                <span class="font-mono text-slate-700 dark:text-slate-200">{{
                  selectedSpt.nitku
                }}</span>
              </div>
            </div>
          </div>

          <div
            class="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700"
          >
            <div
              class="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-2"
            >
              Detail SPT
            </div>
            <div class="space-y-2">
              <div class="grid grid-cols-[120px_1fr] gap-2 text-xs">
                <span class="font-bold text-slate-500">Tahun Pajak</span>
                <span class="font-bold text-slate-800 dark:text-white">{{
                  selectedSpt.tahun_pajak
                }}</span>
              </div>
              <div class="grid grid-cols-[120px_1fr] gap-2 text-xs">
                <span class="font-bold text-slate-500">Masa Pajak</span>
                <span class="font-semibold text-slate-800 dark:text-white">{{
                  selectedSpt.masa_pajak
                }}</span>
              </div>
              <div class="grid grid-cols-[120px_1fr] gap-2 text-xs">
                <span class="font-bold text-slate-500">Jenis SPT</span>
                <span class="font-mono text-slate-800 dark:text-white">{{
                  selectedSpt.jenis_spt
                }}</span>
              </div>
              <div class="grid grid-cols-[120px_1fr] gap-2 text-xs">
                <span class="font-bold text-slate-500">Pembetulan Ke</span>
                <span class="text-slate-800 dark:text-white">{{
                  selectedSpt.pembetulan_ke
                }}</span>
              </div>
              <div class="grid grid-cols-[120px_1fr] gap-2 text-xs">
                <span class="font-bold text-slate-500">Status</span>
                <span
                  class="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-700 border border-green-200"
                  >{{ selectedSpt.status_spt }}</span
                >
              </div>
            </div>
          </div>

          <div
            class="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800"
          >
            <div
              class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-2"
            >
              Nominal & Penyampaian
            </div>
            <div class="space-y-2">
              <div class="grid grid-cols-[120px_1fr] gap-2 text-xs">
                <span class="font-bold text-slate-500">Nominal</span>
                <span
                  class="font-mono font-bold text-lg text-emerald-700 dark:text-emerald-400"
                  >Rp
                  {{
                    Number(selectedSpt.nominal).toLocaleString("id-ID")
                  }}</span
                >
              </div>
              <div class="grid grid-cols-[120px_1fr] gap-2 text-xs">
                <span class="font-bold text-slate-500">Tgl Penyampaian</span>
                <span class="font-semibold text-slate-800 dark:text-white">{{
                  selectedSpt.tanggal_penyampaian
                }}</span>
              </div>
              <div class="grid grid-cols-[120px_1fr] gap-2 text-xs">
                <span class="font-bold text-slate-500">No Tanda Terima</span>
                <span class="font-mono text-slate-700 dark:text-slate-200">{{
                  selectedSpt.nomor_tanda_terima
                }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: PDF Preview -->
        <div
          class="bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col"
        >
          <div
            class="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center"
          >
            <div class="text-xs font-bold text-slate-700 dark:text-slate-200">
              Dokumen SPT
            </div>
            <a
              v-if="selectedSpt.spt_url"
              :href="selectedSpt.spt_url"
              target="_blank"
              class="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100 transition-colors"
            >
              <i class="fas fa-external-link-alt mr-1"></i> Buka Tab Baru
            </a>
          </div>
          <div class="flex-1 relative min-h-[400px]">
            <iframe
              v-if="selectedSpt.spt_url"
              :key="selectedSpt.id_spt"
              :src="getPreviewUrl(selectedSpt.spt_url)"
              class="w-full h-full absolute inset-0 border-none"
            ></iframe>
            <div
              v-else
              class="w-full h-full flex flex-col items-center justify-center text-slate-400"
            >
              <i class="fas fa-file-pdf text-4xl mb-4 opacity-20"></i>
              <p class="text-sm">Dokumen tidak tersedia</p>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>

    <!-- NPWP Modal -->
    <BaseModal
      :show="showNpwpModal"
      @close="showNpwpModal = false"
      maxWidth="5xl"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"
          >
            <i class="fas fa-id-card"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">
              Dokumen NPWP Perusahaan
            </h3>
            <p v-if="selectedNpwp" class="text-xs text-slate-500 mt-0.5">
              {{ selectedNpwp.nomor_npwp }}
            </p>
          </div>
        </div>
      </template>

      <div v-if="selectedNpwp" class="w-full h-[60vh]">
        <div
          class="bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full"
        >
          <div
            class="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center"
          >
            <div class="text-xs font-bold text-slate-700 dark:text-slate-200">
              Preview Dokumen NPWP
            </div>
            <a
              v-if="selectedNpwp.npwp_perusahaan_url"
              :href="selectedNpwp.npwp_perusahaan_url"
              target="_blank"
              class="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100 transition-colors"
            >
              <i class="fas fa-external-link-alt mr-1"></i> Buka Tab Baru
            </a>
          </div>
          <div class="flex-1 relative">
            <iframe
              v-if="selectedNpwp.npwp_perusahaan_url"
              :key="selectedNpwp.id_npwp_perusahaan"
              :src="getPreviewUrl(selectedNpwp.npwp_perusahaan_url)"
              class="w-full h-full absolute inset-0 border-none"
            ></iframe>
            <div
              v-else
              class="w-full h-full flex flex-col items-center justify-center text-slate-400"
            >
              <i class="fas fa-file-pdf text-4xl mb-4 opacity-20"></i>
              <p class="text-sm">Dokumen tidak tersedia</p>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>

    <!-- PKP Modal -->
    <BaseModal
      :show="showPkpModal"
      @close="showPkpModal = false"
      maxWidth="5xl"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center"
          >
            <i class="fas fa-stamp"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">
              Dokumen PKP
            </h3>
            <p v-if="selectedPkp" class="text-xs text-slate-500 mt-0.5">
              {{ selectedPkp.nomor_pkp }}
            </p>
          </div>
        </div>
      </template>

      <div v-if="selectedPkp" class="w-full h-[60vh]">
        <div
          class="bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full"
        >
          <div
            class="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center"
          >
            <div class="text-xs font-bold text-slate-700 dark:text-slate-200">
              Preview Dokumen PKP
            </div>
            <a
              v-if="selectedPkp.url_pkp"
              :href="selectedPkp.url_pkp"
              target="_blank"
              class="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100 hover:bg-orange-100 transition-colors"
            >
              <i class="fas fa-external-link-alt mr-1"></i> Buka Tab Baru
            </a>
          </div>
          <div class="flex-1 relative">
            <iframe
              v-if="selectedPkp.url_pkp"
              :key="selectedPkp.id_pkp"
              :src="getPreviewUrl(selectedPkp.url_pkp)"
              class="w-full h-full absolute inset-0 border-none"
            ></iframe>
            <div
              v-else
              class="w-full h-full flex flex-col items-center justify-center text-slate-400"
            >
              <i class="fas fa-file-pdf text-4xl mb-4 opacity-20"></i>
              <p class="text-sm">Dokumen tidak tersedia</p>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>

    <!-- KSWP Modal -->
    <BaseModal
      :show="showKswpModal"
      @close="showKswpModal = false"
      maxWidth="5xl"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center"
          >
            <i class="fas fa-check-double"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">
              Dokumen KSWP
            </h3>
            <p v-if="selectedKswp" class="text-xs text-slate-500 mt-0.5">
              {{ selectedKswp.nama_wp }}
            </p>
          </div>
        </div>
      </template>

      <div v-if="selectedKswp" class="w-full h-[60vh]">
        <div
          class="bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full"
        >
          <div
            class="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center"
          >
            <div class="text-xs font-bold text-slate-700 dark:text-slate-200">
              Preview Dokumen KSWP
            </div>
            <a
              v-if="selectedKswp.kswp_url"
              :href="selectedKswp.kswp_url"
              target="_blank"
              class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 hover:bg-emerald-100 transition-colors"
            >
              <i class="fas fa-external-link-alt mr-1"></i> Buka Tab Baru
            </a>
          </div>
          <div class="flex-1 relative">
            <iframe
              v-if="selectedKswp.kswp_url"
              :key="selectedKswp.id_kswp"
              :src="getPreviewUrl(selectedKswp.kswp_url)"
              class="w-full h-full absolute inset-0 border-none"
            ></iframe>
            <div
              v-else
              class="w-full h-full flex flex-col items-center justify-center text-slate-400"
            >
              <i class="fas fa-file-pdf text-4xl mb-4 opacity-20"></i>
              <p class="text-sm">Dokumen tidak tersedia</p>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>

    <!-- Edit Contact & Kop Modal -->
    <BaseModal
      :show="showContactModal"
      @close="closeContactModal"
      maxWidth="5xl"
      title="Edit Kontak & Kop"
    >
      <template #default>
        <div class="space-y-6">
          <!-- Two Column Layout -->
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Left Column: Contact Form -->
            <div class="space-y-4">
              <!-- Email -->
              <div class="group">
                <label
                  class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2"
                >
                  <i class="fas fa-envelope text-slate-400 mr-2"></i>
                  Email Perusahaan
                </label>
                <input
                  v-model="contactFormData.email"
                  type="email"
                  placeholder="info@company.com"
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>

              <!-- No. Telepon -->
              <div class="group">
                <label
                  class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2"
                >
                  <i class="fas fa-phone text-slate-400 mr-2"></i>
                  No. Telepon
                </label>
                <input
                  v-model="contactFormData.no_telp"
                  type="tel"
                  placeholder="021-1234567"
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                />
              </div>

              <!-- Alamat -->
              <div class="group">
                <label
                  class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2"
                >
                  <i class="fas fa-map-marker-alt text-slate-400 mr-2"></i>
                  Alamat Lengkap
                </label>
                <textarea
                  v-model="contactFormData.alamat"
                  rows="6"
                  placeholder="Alamat lengkap perusahaan..."
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all resize-none"
                ></textarea>
              </div>
            </div>

            <!-- Right Column: Kop Upload -->
            <div>
              <label
                class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2"
              >
                <i class="fas fa-image text-slate-400 mr-2"></i>
                Kop (Letterhead) <span class="text-red-500">*</span>
              </label>
              <div
                class="border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 text-center hover:border-green-500 transition-all cursor-pointer bg-slate-50 dark:bg-slate-800/50 flex items-center justify-center h-[350px]"
                @click="$refs.kopInputModal.click()"
              >
                <input
                  ref="kopInputModal"
                  type="file"
                  accept="image/*"
                  @change="handleKopChange"
                  class="hidden"
                />

                <!-- Preview -->
                <div
                  v-if="kopPreview"
                  class="w-full h-full flex flex-col items-center justify-between"
                >
                  <div
                    class="flex-1 w-full rounded-lg border border-slate-200 dark:border-slate-600 p-2 bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden mb-3"
                  >
                    <img
                      :src="kopPreview"
                      alt="Kop Preview"
                      class="max-w-full max-h-full object-contain"
                    />
                  </div>
                  <div class="w-full flex items-center justify-between gap-2">
                    <div class="flex-1 text-left min-w-0">
                      <p
                        v-if="kopFile"
                        class="text-xs font-bold text-slate-700 dark:text-slate-300 truncate"
                      >
                        {{ kopFile.name }}
                      </p>
                      <p
                        v-else
                        class="text-xs font-bold text-slate-700 dark:text-slate-300"
                      >
                        Sudah Diunggah
                      </p>
                    </div>
                    <button
                      type="button"
                      @click.stop="clearKop"
                      class="w-8 h-8 rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 flex items-center justify-center transition-colors"
                      title="Hapus Kop"
                    >
                      <i class="fas fa-trash-alt text-xs"></i>
                    </button>
                  </div>
                </div>

                <!-- Empty State -->
                <div v-else class="space-y-3">
                  <div
                    class="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto text-green-500"
                  >
                    <i class="fas fa-image text-2xl"></i>
                  </div>
                  <div>
                    <p
                      class="text-sm font-semibold text-slate-700 dark:text-slate-300"
                    >
                      Upload Kop
                    </p>
                    <p class="text-xs text-slate-500 mt-1">
                      Landscape (Max 50MB)
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3">
          <button
            @click="closeContactModal"
            :disabled="isSubmittingContact"
            class="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
          >
            Batal
          </button>
          <button
            @click="saveContactData"
            :disabled="isSubmittingContact || !kopPreview"
            class="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <i v-if="isSubmittingContact" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-save"></i>
            {{ isSubmittingContact ? "Menyimpan..." : "Simpan" }}
          </button>
        </div>
      </template>
    </BaseModal>

    <!-- Add Pejabat Modal -->
    <BaseModal
      :show="showAddPejabatModal"
      @close="closeAddPejabatModal"
      maxWidth="2xl"
      title="Tambah Pejabat"
    >
      <template #default>
        <div class="space-y-6">
          <!-- Select Personil (Custom Dropdown) -->
          <div class="group">
            <label
              class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2"
            >
              <i class="fas fa-user text-slate-400 mr-2"></i>
              Pilih Personil <span class="text-red-500">*</span>
            </label>

            <!-- If no available personnel -->
            <div
              v-if="availablePersonilList.length === 0"
              class="w-full px-4 py-8 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl text-center"
            >
              <i
                class="fas fa-users-slash text-3xl text-slate-300 dark:text-slate-600 mb-2"
              ></i>
              <p class="text-sm text-slate-500 dark:text-slate-400">
                Semua personel sudah menjadi pejabat
              </p>
            </div>

            <!-- Custom Dropdown with Cards -->
            <div
              v-else
              class="w-full max-h-[300px] overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl bg-white dark:bg-slate-800 divide-y divide-slate-100 dark:divide-slate-700"
            >
              <label
                v-for="person in availablePersonilList"
                :key="person.id_personel"
                class="flex items-center gap-3 p-3 hover:bg-cyan-50 dark:hover:bg-cyan-900/20 cursor-pointer transition-all group/item"
                :class="
                  pejabatFormData.id_personel === person.id_personel
                    ? 'bg-cyan-50 dark:bg-cyan-900/20 border-l-4 border-cyan-500'
                    : ''
                "
              >
                <input
                  type="radio"
                  v-model="pejabatFormData.id_personel"
                  :value="person.id_personel"
                  class="sr-only"
                />

                <!-- Avatar/Initial -->
                <div
                  class="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shrink-0"
                  :class="
                    pejabatFormData.id_personel === person.id_personel
                      ? 'bg-cyan-600'
                      : 'bg-gradient-to-br from-slate-400 to-slate-600'
                  "
                >
                  {{ getInitials(person.nama_lengkap) }}
                </div>

                <!-- Info -->
                <div class="flex-1 min-w-0">
                  <p
                    class="font-bold text-sm text-slate-800 dark:text-white truncate"
                  >
                    {{ person.nama_lengkap }}
                  </p>
                  <p
                    class="text-xs text-slate-500 dark:text-slate-400 truncate"
                  >
                    {{ person.nik || person.id_personel || "Tidak ada NIK" }}
                  </p>
                </div>

                <!-- Check Icon (when selected) -->
                <div
                  v-if="pejabatFormData.id_personel === person.id_personel"
                  class="shrink-0"
                >
                  <i
                    class="fas fa-check-circle text-cyan-600 dark:text-cyan-400 text-lg"
                  ></i>
                </div>
                <div
                  v-else
                  class="shrink-0 opacity-0 group-hover/item:opacity-100 transition-opacity"
                >
                  <i
                    class="fas fa-circle text-slate-300 dark:text-slate-600 text-lg"
                  ></i>
                </div>
              </label>
            </div>
          </div>

          <!-- Jenis Jabatan (Radio Button) -->
          <div class="group">
            <label
              class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-3"
            >
              <i class="fas fa-briefcase text-slate-400 mr-2"></i>
              Jenis Jabatan <span class="text-red-500">*</span>
            </label>

            <div class="space-y-3">
              <!-- Radio: Direktur -->
              <label
                class="flex items-start gap-3 p-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-cyan-400 dark:hover:border-cyan-500 transition-all"
                :class="
                  jabatanType === 'direktur'
                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                    : 'bg-white dark:bg-slate-800'
                "
              >
                <input
                  type="radio"
                  v-model="jabatanType"
                  value="direktur"
                  class="mt-1 w-4 h-4 text-cyan-600 focus:ring-cyan-500"
                />
                <div class="flex-1">
                  <div class="font-bold text-slate-800 dark:text-white text-sm">
                    Direktur
                  </div>
                  <div
                    class="text-xs text-slate-500 dark:text-slate-400 mt-0.5"
                  >
                    Jabatan standar: Direktur
                  </div>
                </div>
              </label>

              <!-- Radio: Custom -->
              <label
                class="flex items-start gap-3 p-3 border-2 border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer hover:border-cyan-400 dark:hover:border-cyan-500 transition-all"
                :class="
                  jabatanType === 'custom'
                    ? 'border-cyan-500 bg-cyan-50 dark:bg-cyan-900/20'
                    : 'bg-white dark:bg-slate-800'
                "
              >
                <input
                  type="radio"
                  v-model="jabatanType"
                  value="custom"
                  class="mt-1 w-4 h-4 text-cyan-600 focus:ring-cyan-500"
                />
                <div class="flex-1">
                  <div class="font-bold text-slate-800 dark:text-white text-sm">
                    Jabatan Lainnya
                  </div>
                  <div
                    class="text-xs text-slate-500 dark:text-slate-400 mt-0.5"
                  >
                    Tentukan jabatan sendiri
                  </div>
                </div>
              </label>

              <!-- Custom Jabatan Input (shown when custom is selected) -->
              <div v-if="jabatanType === 'custom'" class="ml-7 mt-2">
                <input
                  v-model="pejabatFormData.jabatan_custom"
                  type="text"
                  placeholder="Contoh: Komisaris, Wakil Direktur, dll."
                  class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
                />
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex items-center justify-end gap-3">
          <button
            @click="closeAddPejabatModal"
            :disabled="isSubmittingPejabat"
            class="px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
          >
            Batal
          </button>
          <button
            @click="savePejabat"
            :disabled="isSubmittingPejabat || !canSavePejabat"
            class="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl shadow-md hover:shadow-lg hover:shadow-cyan-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
          >
            <i v-if="isSubmittingPejabat" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-save"></i>
            {{ isSubmittingPejabat ? "Menyimpan..." : "Simpan" }}
          </button>
        </div>
      </template>
    </BaseModal>

    <!-- Modals (Simplified for Layout Demo) -->

    <!-- Tax Document Upload Modals -->
    <CompanyTaxDocumentModal
      :show="showNpwpUploadModal"
      @close="showNpwpUploadModal = false"
      documentType="npwp"
      :companyName="company?.nama_perusahaan"
      :isEditMode="false"
      @save="saveNpwpDocument"
      @aiScanComplete="handleNpwpAIScan"
    >
      <template #form-fields="{ disabled }">
        <div class="space-y-3">
          <FormInput
            v-model="npwpUploadFormData.nomor_npwp"
            label="Nomor NPWP"
            placeholder="XX.XXX.XXX.X-XXX.XXX"
            :disabled="disabled"
            required
          />
          <FormInput
            v-model="npwpUploadFormData.nama_wp"
            label="Nama Wajib Pajak"
            placeholder="Nama perusahaan"
            :disabled="disabled"
            required
          />
          <FormInput
            v-model="npwpUploadFormData.alamat"
            label="Alamat"
            type="textarea"
            :rows="3"
            placeholder="Alamat lengkap"
            :disabled="disabled"
          />
          <FormInput
            v-model="npwpUploadFormData.kpp"
            label="KPP"
            placeholder="KPP Pratama ..."
            :disabled="disabled"
          />
          <FormInput
            v-model="npwpUploadFormData.tanggal_terdaftar"
            label="Tanggal Terdaftar"
            type="date"
            :disabled="disabled"
          />
        </div>
      </template>
    </CompanyTaxDocumentModal>

    <CompanyTaxDocumentModal
      :show="showSptUploadModal"
      @close="showSptUploadModal = false"
      documentType="spt"
      :companyName="company?.nama_perusahaan"
      :isEditMode="false"
      @save="saveSptDocument"
      @aiScanComplete="handleSptAIScan"
    >
      <template #form-fields="{ disabled }">
        <div class="space-y-3">
          <div class="grid grid-cols-2 gap-3">
            <FormInput
              v-model="sptUploadFormData.tahun_pajak"
              label="Tahun Pajak"
              placeholder="2023"
              :disabled="disabled"
              required
            />
            <FormInput
              v-model="sptUploadFormData.masa_pajak"
              label="Masa Pajak"
              placeholder="Januari-Desember"
              :disabled="disabled"
            />
          </div>
          <FormInput
            v-model="sptUploadFormData.jenis_spt"
            label="Jenis SPT"
            placeholder="SPT Tahunan PPh Badan"
            :disabled="disabled"
          />
          <div class="grid grid-cols-2 gap-3">
            <FormInput
              v-model="sptUploadFormData.pembetulan_ke"
              label="Pembetulan Ke"
              placeholder="0"
              type="number"
              :disabled="disabled"
            />
            <FormInput
              v-model="sptUploadFormData.nominal"
              label="Nominal"
              placeholder="0"
              type="number"
              :disabled="disabled"
            />
          </div>
          <FormInput
            v-model="sptUploadFormData.tanggal_penyampaian"
            label="Tanggal Penyampaian"
            type="date"
            :disabled="disabled"
          />
          <FormInput
            v-model="sptUploadFormData.nomor_tanda_terima"
            label="Nomor Tanda Terima"
            placeholder="NTTE-..."
            :disabled="disabled"
          />
          <FormInput
            v-model="sptUploadFormData.nama_wp"
            label="Nama Wajib Pajak"
            :disabled="disabled"
          />
          <div class="grid grid-cols-2 gap-3">
            <FormInput
              v-model="sptUploadFormData.npwp"
              label="NPWP"
              :disabled="disabled"
            />
            <FormInput
              v-model="sptUploadFormData.nitku"
              label="NITKU"
              :disabled="disabled"
            />
          </div>
          <FormInput
            v-model="sptUploadFormData.status_spt"
            label="Status SPT"
            placeholder="Normal"
            :disabled="disabled"
          />
        </div>
      </template>
    </CompanyTaxDocumentModal>

    <CompanyTaxDocumentModal
      :show="showPkpUploadModal"
      @close="showPkpUploadModal = false"
      documentType="pkp"
      :companyName="company?.nama_perusahaan"
      :isEditMode="false"
      @save="savePkpDocument"
      @aiScanComplete="handlePkpAIScan"
    >
      <template #form-fields="{ disabled }">
        <div class="space-y-3">
          <FormInput
            v-model="pkpUploadFormData.nomor_pkp"
            label="Nomor PKP"
            placeholder="Nomor pengukuhan"
            :disabled="disabled"
            required
          />
          <FormInput
            v-model="pkpUploadFormData.tanggal_pengukuhan"
            label="Tanggal Pengukuhan"
            type="date"
            :disabled="disabled"
          />
          <FormInput
            v-model="pkpUploadFormData.nama_pkp"
            label="Nama PKP"
            placeholder="Nama perusahaan"
            :disabled="disabled"
          />
          <FormInput
            v-model="pkpUploadFormData.alamat"
            label="Alamat"
            type="textarea"
            :rows="3"
            placeholder="Alamat lengkap"
            :disabled="disabled"
          />
        </div>
      </template>
    </CompanyTaxDocumentModal>

    <CompanyTaxDocumentModal
      :show="showKswpUploadModal"
      @close="showKswpUploadModal = false"
      documentType="kswp"
      :companyName="company?.nama_perusahaan"
      :isEditMode="false"
      @save="saveKswpDocument"
      @aiScanComplete="handleKswpAIScan"
    >
      <template #form-fields="{ disabled }">
        <div class="space-y-3">
          <FormInput
            v-model="kswpUploadFormData.nama_wp"
            label="Nama Wajib Pajak"
            placeholder="Nama perusahaan"
            :disabled="disabled"
            required
          />
          <FormInput
            v-model="kswpUploadFormData.npwp"
            label="NPWP"
            placeholder="XX.XXX.XXX.X-XXX.XXX"
            :disabled="disabled"
          />
          <FormInput
            v-model="kswpUploadFormData.tahun_kswp"
            label="Tahun KSWP"
            placeholder="2023"
            :disabled="disabled"
          />
          <FormInput
            v-model="kswpUploadFormData.status_kswp"
            label="Status KSWP"
            placeholder="Patuh / Tidak Patuh"
            :disabled="disabled"
          />
          <FormInput
            v-model="kswpUploadFormData.tanggal_terbit"
            label="Tanggal Terbit"
            type="date"
            :disabled="disabled"
          />
        </div>
      </template>
    </CompanyTaxDocumentModal>

    <ToastNotification />
  </div>
</template>

<script setup>
import BaseModal from "~/components/BaseModal.vue";
import BaseSkeleton from "~/components/BaseSkeleton.vue";
import ToastNotification from "~/components/ToastNotification.vue";
import FormInput from "~/components/FormInput.vue";
import DocumentPdfPreview from "~/components/DocumentPdfPreview.vue";
import CompanyTaxDocumentModal from "~/components/CompanyTaxDocumentModal.vue";
import CompanyTaxTab from "~/components/companies/tabs/CompanyTaxTab.vue";
import CompanyOverviewTab from "~/components/companies/tabs/CompanyOverviewTab.vue";
import CompanyDocumentTab from "~/components/companies/tabs/CompanyDocumentTab.vue";
import CompanyDetailHeader from "~/components/CompanyDetailHeader.vue";

definePageMeta({ layout: "dashboard" });

const route = useRoute();
const router = useRouter();
const toast = useToast();
const config = useRuntimeConfig();
const apiBaseUrl = config.public.apiBaseUrl;
const companyId = route.params.id;

// State
const company = ref(null);
const subModules = ref({
  akta: [],
  pejabat: [],
  nib: [],
  sbu: [],
  kta: [],
  sertifikat: [],
  npwp: [],
  kswp: [],
  spt: [],
  pkp: [],
  kontrak: [],
  kbli: [],
  cek: [],
  bpjs: [],
});
const activeTab = ref("overview");
const loadingTab = ref(false);
const imageErrors = ref({}); // Track logo image errors
const kopImageErrors = ref({}); // Track kop image errors

// SPT Modal state
const showSptModal = ref(false);
const selectedSpt = ref(null);

// NPWP Modal state
const showNpwpModal = ref(false);
const selectedNpwp = ref(null);

// PKP Modal state
const showPkpModal = ref(false);
const selectedPkp = ref(null);

// KSWP Modal state
const showKswpModal = ref(false);
const selectedKswp = ref(null);

// Add Pejabat Modal state
const showAddPejabatModal = ref(false);
const personilList = ref([]);
const jabatanType = ref("direktur"); // 'direktur' or 'custom'
const pejabatFormData = ref({
  id_personel: "",
  jabatan_custom: "",
});
const isSubmittingPejabat = ref(false);

// Selected items for PDF preview (per tab)
const selectedItems = ref({
  akta: null,
  nib: null,
  sbu: null,
  kta: null,
  sertifikat: null,
  kontrak: null,
  spt: null,
  cek: null,
  bpjs: null,
});

// Pending uploads for CompanyDocumentTab
const pendingUploads = ref({
  akta: null,
  nib: null,
  sbu: null,
  kta: null,
  sertifikat: null,
  kontrak: null,
  cek: null,
  bpjs: null,
});

// Uploading state for CompanyDocumentTab
const uploadingState = ref({
  akta: false,
  nib: false,
  sbu: false,
  kta: false,
  sertifikat: false,
  kontrak: false,
  cek: false,
  bpjs: false,
});

// Tax Document Upload Modals
const showNpwpUploadModal = ref(false);
const showSptUploadModal = ref(false);
const showPkpUploadModal = ref(false);
const showKswpUploadModal = ref(false);

// Tax Document Form Data
const npwpUploadFormData = ref({
  nomor_npwp: "",
  nama_wp: "",
  alamat: "",
  kpp: "",
  tanggal_terdaftar: "",
});

const sptUploadFormData = ref({
  tahun_pajak: "",
  masa_pajak: "",
  jenis_spt: "",
  pembetulan_ke: "0",
  nominal: 0,
  tanggal_penyampaian: "",
  nomor_tanda_terima: "",
  nama_wp: "",
  npwp: "",
  nitku: "",
  status_spt: "Normal",
});

const pkpUploadFormData = ref({
  nomor_pkp: "",
  tanggal_pengukuhan: "",
  nama_pkp: "",
  alamat: "",
});

const kswpUploadFormData = ref({
  nama_wp: "",
  npwp: "",
  tahun_kswp: "",
  status_kswp: "",
  tanggal_terbit: "",
});

// Tabs Configuration (Re-ordered & Renamed) - Pejabat removed, moved to Overview
// Tabs Configuration (Computed to track data availability)
const tabs = computed(() => [
  { id: "overview", label: "Overview", icon: "fas fa-th-large", hasData: true },
  {
    id: "akta",
    label: "Akta",
    icon: "fas fa-file-contract",
    hasData:
      company.value?.documentCounts?.akta > 0 ||
      (subModules.value.akta && subModules.value.akta.length > 0) ||
      !!selectedItems.value.akta,
  },
  {
    id: "nib",
    label: "NIB",
    icon: "fas fa-id-badge",
    hasData:
      company.value?.documentCounts?.nib > 0 ||
      (subModules.value.nib && subModules.value.nib.length > 0) ||
      !!selectedItems.value.nib,
  },
  {
    id: "sbu",
    label: "SBU",
    icon: "fas fa-certificate",
    hasData:
      company.value?.documentCounts?.sbu > 0 ||
      (subModules.value.sbu && subModules.value.sbu.length > 0) ||
      !!selectedItems.value.sbu,
  },
  {
    id: "kta",
    label: "KTA",
    icon: "fas fa-id-card-alt",
    hasData:
      company.value?.documentCounts?.kta > 0 ||
      (subModules.value.kta && subModules.value.kta.length > 0) ||
      !!selectedItems.value.kta,
  },
  {
    id: "sertifikat",
    label: "Sertifikat",
    icon: "fas fa-award",
    hasData:
      company.value?.documentCounts?.sertifikat > 0 ||
      (subModules.value.sertifikat && subModules.value.sertifikat.length > 0) ||
      !!selectedItems.value.sertifikat,
  },
  {
    id: "pajak",
    label: "Data Pajak",
    icon: "fas fa-wallet",
    hasData:
      company.value?.documentCounts?.pajak > 0 ||
      (subModules.value.npwp && subModules.value.npwp.length > 0) ||
      !!selectedItems.value.npwp ||
      (subModules.value.spt && subModules.value.spt.length > 0) ||
      !!selectedItems.value.spt ||
      (subModules.value.pkp && subModules.value.pkp.length > 0) ||
      !!selectedItems.value.pkp ||
      (subModules.value.kswp && subModules.value.kswp.length > 0) ||
      !!selectedItems.value.kswp,
  },
  {
    id: "kontrak",
    label: "Pengalaman",
    icon: "fas fa-briefcase",
    hasData:
      company.value?.documentCounts?.kontrak > 0 ||
      (subModules.value.kontrak && subModules.value.kontrak.length > 0) ||
      !!selectedItems.value.kontrak,
  },
  {
    id: "cek",
    label: "Cek",
    icon: "fas fa-money-check",
    hasData:
      company.value?.documentCounts?.cek > 0 ||
      (subModules.value.cek && subModules.value.cek.length > 0) ||
      !!selectedItems.value.cek,
  },
  {
    id: "bpjs",
    label: "BPJS",
    icon: "fas fa-hospital",
    hasData:
      company.value?.documentCounts?.bpjs > 0 ||
      (subModules.value.bpjs && subModules.value.bpjs.length > 0) ||
      !!selectedItems.value.bpjs,
  },
]);

// Helper Functions
const getInitials = (name) => {
  if (!name) return "?";
  const words = name
    .replace(/[^\w\s]/gi, "")
    .split(/\s+/)
    .filter((w) => w.length > 0);
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const formatDate = (dateString) => {
  if (!dateString) return "-";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  } catch (e) {
    console.error("Error formatting date:", dateString, e);
    return dateString; // Return original if invalid
  }
};

// === LOGO HANDLER (Complete Logic) ===
const getCompanyLogoUrl = (c) => {
  // PRIORITY 1: Cloudinary URL (logo_cloud) - Cloud-hosted, fast & reliable!
  if (c?.logo_cloud) return c.logo_cloud;

  // PRIORITY 2: Google Drive (logo_perusahaan) - Fallback
  const driveUrl = c?.logo_perusahaan || c?.logo_url;
  if (driveUrl?.includes("drive.google.com")) {
    let id = "";
    if (driveUrl.includes("/d/")) id = driveUrl.split("/d/")[1].split("/")[0];
    else if (driveUrl.includes("id="))
      id = driveUrl.split("id=")[1].split("&")[0];
    if (id) return `https://drive.google.com/uc?export=download&id=${id}`;
    return driveUrl;
  }

  // No valid source - will show initials
  return "";
};

const shouldShowLogo = (c) => {
  if (imageErrors.value[c?.id_perusahaan]) return false; // Show initials if error
  return !!(c?.logo_cloud || c?.logo_perusahaan || c?.logo_url);
};

const handleImageError = (e, c) => {
  console.error("❌ Image load error for", c.nama_perusahaan);
  console.log("  🔄 Falling back to initials display");
  // Mark as error - will show initials instead
  imageErrors.value[c.id_perusahaan] = true;
};

// === KOP (LETTERHEAD) HANDLER ===
const getCompanyKopUrl = (c) => {
  if (!c) return "";

  console.log("🔍 Getting kop URL for:", c.nama_perusahaan);
  console.log("  - kop_perusahaan field:", c.kop_perusahaan);

  // PRIORITY 1: Google Drive kop_perusahaan field
  if (c?.kop_perusahaan) {
    // Use backend proxy endpoint to serve kop image
    // Backend will fetch from Google Drive using OAuth credentials
    const kopProxyUrl = `${apiBaseUrl}/companies/${c.id_perusahaan}/kop`;
    console.log("  ✅ Using backend proxy for kop:", kopProxyUrl);
    return kopProxyUrl;
  }

  console.log("  ❌ No kop_perusahaan found");
  // No kop available
  return "";
};

const shouldShowKop = (c) => {
  if (!c) return false;
  if (kopImageErrors.value[c?.id_perusahaan]) return false;
  const kopUrl = getCompanyKopUrl(c);
  const shouldShow = !!kopUrl;
  console.log("🎯 Should show kop for", c.nama_perusahaan, ":", shouldShow);
  return shouldShow;
};

const handleKopImageError = (e, c) => {
  console.warn("⚠️ Kop image load error for", c.nama_perusahaan);
  console.log("  🔄 Hiding kop display");
  kopImageErrors.value[c.id_perusahaan] = true;
};

const getPreviewUrl = (url) => {
  if (!url) return "";
  if (url.includes("drive.google.com")) {
    // Convert view/edit/open link to preview link for iframe
    return url.replace(/\/(view|open|edit).*$/, "/preview");
  }
  return url;
};

// Format file size to human-readable format
const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

const getTabLabel = (id) => tabs.find((t) => t.id === id)?.label || "Data";
const getTabIcon = (id) =>
  tabs.find((t) => t.id === id)?.icon || "fas fa-folder";
const getTabData = (tabId) => subModules.value[tabId] || [];

// Get document URL from item (handles different field names per module)
const getSelectedDocUrl = (tabId) => {
  const item = selectedItems.value[tabId];
  console.log(`🔍 getSelectedDocUrl('${tabId}'):`, {
    hasItem: !!item,
    item: item,
    itemKeys: item ? Object.keys(item) : [],
  });

  if (!item) return "";

  const urlMap = {
    akta: item.akta_perusahaan_url,
    nib: item.nib_url,
    sbu: item.sbu_url,
    kta: item.kta_url,
    sertifikat: item.sertifikat_standar_url,
    kontrak: item.kontrak_url || item.url_dokumen,
    spt: item.spt_url,
    cek: item.url_cek,
    bpjs: item.url_bpjs,
  };

  const url = urlMap[tabId] || item.url_dokumen || item.kontrak_url || "";
  console.log(`📄 PDF URL for ${tabId}:`, url);

  return url;
};

// Select item for PDF preview
const selectItem = (tabId, item) => {
  selectedItems.value[tabId] = item;
};

// Handle file selection for upload
const handleFileSelect = (tabId, payload) => {
  const file = payload?.target?.files ? payload.target.files[0] : payload;

  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      pendingUploads.value[tabId] = {
        file: file,
        preview: e.target.result,
      };
    };
    reader.readAsDataURL(file);
  } else {
    pendingUploads.value[tabId] = null;
  }
};

// Handle upload save (Actual API Call)
// Update useToast destructuring to include "info"
const {
  toast: toastState,
  success: showSuccess,
  error: showError,
  info,
} = useToast();
// Use toastState for the predictive usage if needed, but existing code used "toast".
// Wait, existing code: `const toast = useToast();` then `toast.success(...)`.
// `useToast` returns `{ success, error, info, ... }` but also the reactive state?
// Let's check `frontend/composables/useToast.js`... typically it returns helper functions directly.
// In `personnel/[id].vue` I used `const { ... } = useToast()`.
// In `companies/[id].vue` line 2115: `const toast = useToast();`
// If I change it to destructuring, I need to update ALL usages like `toast.success` to just `success`.
// OR I keep `toast` and also destructure `info`.
// `const toast = useToast(); const { info } = toast;` -> This works if useToast returns an object with methods.
// Let's assume `useToast` returns the object containing methods.
// So: `const toast = useToast();` `toast.info(...)`?
// In `personnel/[id].vue` I saw `const { toast, success ... } = useToast()`.
// This implies `useToast()` returns an object where `toast` is the state?
// Let's check `companies/[id].vue` original usage.
// Line 2539: `toast.success(...)`.
// So `toast` variable currently holds the methods? Or `toast` IS the object?
// If `toast.success` works, then `toast.info` should work if it exists.
// I will just use `toast.info` and see. If `info` is not on `toast`, I'll fix it.
// The previous file I edited (`personnel/id.vue`) used `const { toast, success ... } = useToast()`.
// And `toast` there seemed to be the STATE (passed to BaseToast :show="toast.show").
// So `useToast()` returns `{ toast: state, success: fn, error: fn, info: fn }`.
// But `companies/[id].vue` assigns it to `const toast = useToast()`.
// So `toast` variable has `{ toast, success, error }`.
// So `toast.toast.show`?? No.
// Line 2095: `<ToastNotification />` component is used?
// Line 2115: `const toast = useToast()`.
// Checks line 2539: `toast.success(...)`.
// This implies `toast` has a `.success` method.
// So `toast` is the object returned by `useToast()`.
// Does it have `.info`?
// Personnel update added `info` to destructure list.
// So `useToast()` definitely returns `info`.
// So `toast.info(...)` should work!

const handleUploadSave = async (tabId) => {
  console.log(`Saving upload for ${tabId}`);
  uploadingState.value[tabId] = true;

  try {
    const file = pendingUploads.value[tabId]?.file;
    if (!file) throw new Error("Tidak ada file yang dipilih");

    // Step 1: Upload to Google Drive
    toast.info(`Mengunggah dokumen ${tabId.toUpperCase()} ke Drive...`, 5000);

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    const uploadRes = await fetch(
      `${apiBaseUrl}/companies/${companyId}/${tabId}/upload`,
      { method: "POST", body: uploadFormData }
    );

    if (!uploadRes.ok) throw new Error("Gagal mengunggah ke Drive");
    const uploadResult = await uploadRes.json();
    const fileUrl = uploadResult.data.fileUrl;

    // Step 2: Update Data
    toast.info("Menyimpan data...", 3000);

    // Identify if updating existing or adding new
    const selectedItem = selectedItems.value[tabId];
    let method = "POST";
    let url = `${apiBaseUrl}/companies/${companyId}/${tabId}`;
    let body = {};

    // Map tabId to URL field name
    const urlFieldMap = {
      akta: "akta_perusahaan_url",
      nib: "nib_url",
      sbu: "sbu_url",
      kta: "kta_url",
      sertifikat: "sertifikat_standar_url",
      kontrak: "kontrak_url",
      cek: "url_cek",
      bpjs: "url_bpjs",
    };
    const urlKey = urlFieldMap[tabId] || "url_dokumen";

    if (selectedItem) {
      // Update Existing
      method = "PUT";

      // Find ID
      const idMap = {
        akta: "id_akta",
        nib: "id_nib", // Verify ID key
        sbu: "id_sbu",
        kta: "id_kta",
        sertifikat: "id_sertifikat_standar",
        kontrak: "id_kontrak",
        cek: "id_cek",
        bpjs: "id_bpjs",
      };

      let itemId = selectedItem[idMap[tabId]];
      // Fallbacks
      if (!itemId && tabId === "nib")
        itemId = selectedItem.id_nib || selectedItem.id_perusahaan_nib; // Check possibilities
      if (!itemId) itemId = selectedItem.id; // generic catch

      if (itemId) {
        // Encode if needed
        // Check route: /:id/akta/:itemId
        url = `${apiBaseUrl}/companies/${companyId}/${tabId}/${encodeURIComponent(
          itemId
        )}`;
        body = { [urlKey]: fileUrl };
      } else {
        // Fallback to POST if no ID found despite selection (shouldn't happen)
        console.warn("No ID found for selected item, falling back to create");
        method = "POST";
        body = { [urlKey]: fileUrl };
      }
    } else {
      // Create New
      method = "POST";
      body = { [urlKey]: fileUrl, tanggal_input: new Date().toISOString() };
      // Add minimal required fields to avoid errors?
      // e.g. nomor_akta?
      // hoping backend handles partials.
    }

    const metaRes = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (!metaRes.ok) {
      const err = await metaRes.json();
      throw new Error(err.error || err.message || "Gagal menyimpan data");
    }

    toast.success(`Dokumen ${tabId.toUpperCase()} berhasil diunggah.`);
    pendingUploads.value[tabId] = null;

    // Refresh data
    switch (tabId) {
      case "akta":
        await fetchAkta();
        break;
      case "nib":
        await fetchNIB();
        break;
      case "sbu":
        await fetchSBU();
        break;
      case "kta":
        await fetchKTA();
        break;
      case "sertifikat":
        await fetchSertifikat();
        break;
      case "kontrak":
        await fetchPengalaman();
        break; // kontrak -> fetchPengalaman
      case "cek":
        await fetchCek();
        break;
      case "bpjs":
        await fetchBPJS();
        break;
    }
  } catch (error) {
    console.error("Upload failed:", error);
    toast.error(`Gagal upload: ${error.message}`);
  } finally {
    uploadingState.value[tabId] = false;
  }
};

const handleUploadCancel = (tabId) => {
  pendingUploads.value[tabId] = null;
};

// Fetch Logic
const handleUpdateItem = async (module, data) => {
  try {
    const idKeyMap = {
      akta: "id_akta",
      nib: "id_nib",
      pejabat: "id_pejabat",
      sbu: "id_sbu",
      kta: "id_kta",
      sertifikat: "id_sertifikat_standar",
      kontrak: "id_kontrak",
      cek: "id_cek",
      bpjs: "id_bpjs",
    };

    const idKey = idKeyMap[module];
    let itemId = data[idKey];

    // Fallback if id is missing
    if (!itemId) {
      if (module === "akta") itemId = data.nomor_akta;
      else if (module === "nib") itemId = data.nomor_nib;
      else if (module === "pejabat") itemId = data.nik;
      else if (module === "kontrak") itemId = data.nomor_kontrak;
    }

    if (!itemId) {
      throw new Error(`ID tidak ditemukan untuk update ${module}`);
    }

    const res = await fetch(
      `${apiBaseUrl}/companies/${companyId}/${module}/${itemId}`,
      {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }
    );

    const result = await res.json();
    if (!res.ok) {
      throw new Error(result.message || "Gagal menyimpan perubahan");
    }

    toast.success("Data berhasil diperbarui!");

    if (module === "nib") {
      try {
        const kbliCodes = [...editKbliList.value];

        await fetch(`${apiBaseUrl}/companies/${companyId}/kbli/batch`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kbliCodes }),
        });

        // Refresh KBLI list in UI (assuming fetchSubModules or fetchNIB handles it)
        // We will call fetchSubModules inside switch if needed
      } catch (e) {
        console.error("Failed to save KBLI:", e);
        toast.error("Gagal menyimpan KBLI: " + e.message);
      }
    }

    // Refresh
    switch (module) {
      case "akta":
        await fetchAkta();
        break;
      case "nib":
        await fetchNIB();
        break;
      case "pejabat":
        await fetchPejabat();
        break;
      case "sbu":
        await fetchSBU();
        break;
      case "kta":
        await fetchKTA();
        break;
      case "sertifikat":
        await fetchSertifikat();
        break;
      case "kontrak":
        await fetchPengalaman();
        break;
      case "cek":
        await fetchCek();
        break;
      case "bpjs":
        await fetchBPJS();
        break;
    }
  } catch (e) {
    console.error("Update Error:", e);
    toast.error(e.message);
  }
};

const aktaTab = ref(null);
const nibTab = ref(null);
const sbuTab = ref(null);
const ktaTab = ref(null);

// KBLI Edit Logic
const editKbliList = ref([]);
const newKbliInput = ref("");

const addKbli = () => {
  const val = newKbliInput.value.trim().replace(/[^0-9]/g, ""); // Digits only
  if (val && val.length >= 2 && !editKbliList.value.includes(val)) {
    editKbliList.value.push(val);
  }
  newKbliInput.value = "";
};

const removeKbli = (code) => {
  editKbliList.value = editKbliList.value.filter((c) => c !== code);
};

watch(
  () => subModules.value.kbli,
  (newVal) => {
    if (newVal && Array.isArray(newVal)) {
      editKbliList.value = newVal.map((k) => k.kode_kbli).filter(Boolean);
    }
  },
  { immediate: true }
);

const handleAiScan = async (module, data) => {
  if (!data) {
    toast.error("Data dokumen tidak ditemukan via Scan.");
    return;
  }
  try {
    let url = "";

    if (module === "akta") {
      url = data.akta_perusahaan_url;
    } else if (module === "nib") {
      url = data.nib_url;
    } else if (module === "sbu") {
      url = data.sbu_url;
    } else if (module === "kta") {
      url = data.kta_url;
    }
    // Add other modules if needed

    if (!url) {
      toast.error("Tidak ada URL dokumen untuk di-scan.");
      return;
    }

    // Show persistent loading toast
    const loadingToastId = toast.info("Sedang melakukan scan AI...", 0);

    const res = await fetch(`${apiBaseUrl}/ai/scan-drive-file`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        fileUrl: url,
        documentType: module,
        category: "company",
      }),
    });

    const result = await res.json();

    // Remove loading toast
    toast.removeToast(loadingToastId);

    if (result.success) {
      toast.success("AI Scan Berhasil!");
      // Update the tab
      if (module === "akta" && aktaTab.value) {
        aktaTab.value.updateEditData(result.data);
      }
      if (module === "nib" && nibTab.value) {
        nibTab.value.updateEditData(result.data);
        if (result.data.kbli && Array.isArray(result.data.kbli)) {
          editKbliList.value = result.data.kbli;
          toast.info(`Ditemukan ${result.data.kbli.length} kode KBLI`);
        }
      }
      if (module === "sbu" && sbuTab.value) {
        sbuTab.value.updateEditData(result.data);
      }
      if (module === "kta" && ktaTab.value) {
        ktaTab.value.updateEditData(result.data);
      }
    } else {
      throw new Error(result.message);
    }
  } catch (e) {
    console.error("AI Scan Error:", e);
    toast.error("Gagal melakukan scan AI: " + e.message);
  }
};

const fetchCompanyDetail = async () => {
  loadingTab.value = true;
  try {
    // Fetch company overview (main profile only)
    const companyRes = await fetch(`${apiBaseUrl}/companies/${companyId}`);

    if (companyRes.ok) {
      company.value = await companyRes.json();
      console.log("✅ Company profile loaded:", company.value);
      console.log("🔑 Company fields check:");
      console.log("  - logo_perusahaan:", company.value.logo_perusahaan);
      console.log("  - logo_cloud:", company.value.logo_cloud);
      console.log("  - kop_perusahaan:", company.value.kop_perusahaan);
      console.log("  - id_perusahaan:", company.value.id_perusahaan);
    }

    // Fetch KBLI for overview tab
    await fetchKBLI();

    // Fetch Pejabat for overview tab (moved from separate tab)
    await fetchPejabat();
  } catch (e) {
    console.error("Error fetching company:", e);
  } finally {
    loadingTab.value = false;
  }
};

// Fetch KBLI data
const fetchKBLI = async () => {
  try {
    const res = await fetch(`${apiBaseUrl}/companies/${companyId}/kbli`);
    if (res.ok) {
      subModules.value.kbli = await res.json();
      console.log(
        "✅ KBLI Data loaded:",
        subModules.value.kbli.length,
        "items"
      );
    }
  } catch (e) {
    console.error("Error fetching KBLI:", e);
  }
};

// Fetch Akta data
const fetchAkta = async () => {
  try {
    const res = await fetch(`${apiBaseUrl}/companies/${companyId}/akta`);
    if (res.ok) {
      subModules.value.akta = await res.json();
      if (subModules.value.akta.length)
        selectedItems.value.akta = subModules.value.akta[0];
      console.log(
        "✅ Akta Data loaded:",
        subModules.value.akta.length,
        "items"
      );
    }
  } catch (e) {
    console.error("Error fetching Akta:", e);
  }
};

// Fetch Pejabat data (now loaded with overview)
const fetchPejabat = async () => {
  try {
    const res = await fetch(`${apiBaseUrl}/companies/${companyId}/pejabat`);
    if (res.ok) {
      subModules.value.pejabat = await res.json();
      console.log(
        "✅ Pejabat Data loaded:",
        subModules.value.pejabat.length,
        "items"
      );
    }
  } catch (e) {
    console.error("Error fetching Pejabat:", e);
  }
};

// Fetch NIB data (now includes KBLI data)
const fetchNIB = async () => {
  try {
    const res = await fetch(`${apiBaseUrl}/companies/${companyId}/nib`);
    if (res.ok) {
      const data = await res.json();
      // The response now includes both nib and kbli data
      subModules.value.nib = data.nib || [];
      subModules.value.kbli = data.kbli || [];

      if (subModules.value.nib.length) {
        selectedItems.value.nib = subModules.value.nib[0];
        console.log(
          "✅ NIB Data loaded:",
          subModules.value.nib.length,
          "items"
        );
        console.log("📋 First NIB item:", subModules.value.nib[0]);
        console.log(
          "🔗 NIB URL from first item:",
          subModules.value.nib[0]?.nib_url
        );
      } else {
        console.warn("⚠️ NIB Data loaded but EMPTY");
      }

      console.log(
        "✅ KBLI Data loaded from NIB:",
        subModules.value.kbli.length,
        "items"
      );
    } else {
      console.error("❌ Failed to fetch NIB data:", res.status, res.statusText);
    }
  } catch (e) {
    console.error("Error fetching NIB:", e);
  }
};

// Fetch SBU data
const fetchSBU = async () => {
  try {
    const res = await fetch(`${apiBaseUrl}/companies/${companyId}/sbu`);
    if (res.ok) {
      subModules.value.sbu = await res.json();
      if (subModules.value.sbu.length)
        selectedItems.value.sbu = subModules.value.sbu[0];
      console.log("✅ SBU Data loaded:", subModules.value.sbu.length, "items");
    }
  } catch (e) {
    console.error("Error fetching SBU:", e);
  }
};

// Fetch KTA data
const fetchKTA = async () => {
  try {
    const res = await fetch(`${apiBaseUrl}/companies/${companyId}/kta`);
    if (res.ok) {
      subModules.value.kta = await res.json();
      if (subModules.value.kta.length)
        selectedItems.value.kta = subModules.value.kta[0];
      console.log("✅ KTA Data loaded:", subModules.value.kta.length, "items");
    }
  } catch (e) {
    console.error("Error fetching KTA:", e);
  }
};

// Fetch Sertifikat data
const fetchSertifikat = async () => {
  try {
    const res = await fetch(`${apiBaseUrl}/companies/${companyId}/sertifikat`);
    if (res.ok) {
      subModules.value.sertifikat = await res.json();
      if (subModules.value.sertifikat.length)
        selectedItems.value.sertifikat = subModules.value.sertifikat[0];
      console.log(
        "✅ Sertifikat Data loaded:",
        subModules.value.sertifikat.length,
        "items"
      );
    }
  } catch (e) {
    console.error("Error fetching Sertifikat:", e);
  }
};

// Fetch Pajak data (combined)
const fetchPajak = async () => {
  try {
    const res = await fetch(`${apiBaseUrl}/companies/${companyId}/pajak`);
    if (res.ok) {
      const pajakData = await res.json();
      subModules.value.npwp = pajakData.npwp || [];
      subModules.value.kswp = pajakData.kswp || [];
      subModules.value.spt = pajakData.spt || [];
      subModules.value.pkp = pajakData.pkp || [];

      const taxCount =
        subModules.value.npwp.length +
        subModules.value.kswp.length +
        subModules.value.spt.length +
        subModules.value.pkp.length;
      tabs.find((t) => t.id === "pajak").count = taxCount;

      if (subModules.value.spt.length)
        selectedItems.value.spt = subModules.value.spt[0];
      console.log(
        "✅ Pajak Data loaded - NPWP:",
        subModules.value.npwp.length,
        "KSWP:",
        subModules.value.kswp.length,
        "SPT:",
        subModules.value.spt.length,
        "PKP:",
        subModules.value.pkp.length
      );
    }
  } catch (e) {
    console.error("Error fetching Pajak:", e);
  }
};

// Fetch Pengalaman/Kontrak data
const fetchPengalaman = async () => {
  try {
    const res = await fetch(`${apiBaseUrl}/companies/${companyId}/pengalaman`);
    if (res.ok) {
      subModules.value.kontrak = await res.json();
      if (subModules.value.kontrak.length)
        selectedItems.value.kontrak = subModules.value.kontrak[0];
      console.log(
        "✅ Pengalaman Data loaded:",
        subModules.value.kontrak.length,
        "items"
      );
    }
  } catch (e) {
    console.error("Error fetching Pengalaman:", e);
  }
};

// Fetch Cek data
const fetchCek = async () => {
  try {
    const res = await fetch(`${apiBaseUrl}/companies/${companyId}/cek`);
    if (res.ok) {
      subModules.value.cek = await res.json();
      if (subModules.value.cek.length)
        selectedItems.value.cek = subModules.value.cek[0];
      console.log("✅ Cek Data loaded:", subModules.value.cek.length, "items");
    }
  } catch (e) {
    console.error("Error fetching Cek:", e);
  }
};

// Fetch BPJS data
const fetchBPJS = async () => {
  try {
    const res = await fetch(`${apiBaseUrl}/companies/${companyId}/bpjs`);
    if (res.ok) {
      subModules.value.bpjs = await res.json();
      if (subModules.value.bpjs.length)
        selectedItems.value.bpjs = subModules.value.bpjs[0];
      console.log(
        "✅ BPJS Data loaded:",
        subModules.value.bpjs.length,
        "items"
      );
    }
  } catch (e) {
    console.error("Error fetching BPJS:", e);
  }
};

// Lazy load data when tab changes
const loadedTabs = ref(["overview"]); // Track which tabs have been loaded

watch(
  activeTab,
  async (newTab) => {
    // Basic check
    if (!newTab || newTab === "overview") return;

    // Check if data is essentially empty
    const data = subModules.value[newTab];
    const hasData = Array.isArray(data) ? data.length > 0 : !!data;

    // Skip only if loaded AND has data (prevent infinite retry on truly empty data? NO, loadedTabs handles that)
    // Retry logic: If loaded but empty, maybe we should try again?
    // Let's stick to loadedTabs flag, but push to loadedTabs only on SUCCESS.
    // The previous code pushed to loadedTabs in finally block, which marks failed attempts as loaded.

    if (loadedTabs.value.includes(newTab) && hasData) return;

    // Force fetch if not loaded OR (loaded but empty - optional, maybe user wants refresh)
    // For now, respect loadedTabs but ensure we only add to it on success
    if (loadedTabs.value.includes(newTab)) {
      // If it's empty, we might want to retry silently?
      // Let's trust the flag. If user wants refresh, they usually reload page.
      // But invalidating cache on error is better.
      return;
    }

    console.log(`🔄 Fetching data for tab: ${newTab}`);
    loadingTab.value = true;

    try {
      switch (newTab) {
        case "akta":
          await fetchAkta();
          break;
        case "nib":
          await fetchNIB();
          break;
        case "sbu":
          await fetchSBU();
          break;
        case "kta":
          await fetchKTA();
          break;
        case "sertifikat":
          await fetchSertifikat();
          break;
        case "pajak":
          await fetchPajak();
          break;
        case "kontrak":
          await fetchPengalaman();
          break;
        case "cek":
          await fetchCek();
          break;
        case "bpjs":
          await fetchBPJS();
          break;
      }

      // Mark tab as loaded ONLY if successful
      if (!loadedTabs.value.includes(newTab)) {
        loadedTabs.value.push(newTab);
      }
    } catch (e) {
      console.error(`❌ Error loading tab ${newTab}:`, e);
      // Do NOT mark as loaded, so next click tries again
    } finally {
      loadingTab.value = false;
    }
  },
  { immediate: true }
);

// Placeholder Actions
const openAddModal = (tab) => {
  console.log("Add", tab);
};

// Open SPT Modal
const openSptModal = (item) => {
  selectedSpt.value = item;
  showSptModal.value = true;
};

// Open NPWP Modal
const openNpwpModal = (item) => {
  selectedNpwp.value = item;
  showNpwpModal.value = true;
};

// Open PKP Modal
const openPkpModal = (item) => {
  selectedPkp.value = item;
  showPkpModal.value = true;
};

// Open KSWP Modal
const openKswpModal = (item) => {
  selectedKswp.value = item;
  showKswpModal.value = true;
};

// Unified Handler for CompanyTaxTab
const handleOpenTaxModal = (type, item) => {
  console.log("Opening Tax Modal:", type, item);

  if (item) {
    // VIEW Mode (Existing data)
    switch (type) {
      case "npwp":
        openNpwpModal(item);
        break;
      case "pkp":
        openPkpModal(item);
        break;
      case "spt":
        openSptModal(item);
        break;
      case "kswp":
        openKswpModal(item);
        break;
    }
  } else {
    // UPLOAD/ADD Mode (New data)
    switch (type) {
      case "npwp":
        showNpwpUploadModal.value = true;
        break;
      case "pkp":
        showPkpUploadModal.value = true;
        break;
      case "spt":
        showSptUploadModal.value = true;
        break;
      case "kswp":
        showKswpUploadModal.value = true;
        break;
    }
  }
};

const deleteSptEntry = async (id) => {
  if (!confirm("Apakah Anda yakin ingin menghapus data SPT ini?")) return;

  try {
    const res = await fetch(`${apiBaseUrl}/companies/${companyId}/spt/${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      toast.success("Data SPT berhasil dihapus");
      await fetchPajak();
    } else {
      const err = await res.json();
      toast.error(err.message || "Gagal menghapus data SPT");
    }
  } catch (e) {
    console.error("Error deleting SPT:", e);
    toast.error("Terjadi kesalahan saat menghapus data");
  }
};

// === CONTACT DATA MODAL (Email, Telp, Alamat, Kop only) ===
const showContactModal = ref(false);
const contactFormData = ref({
  email: "",
  no_telp: "",
  alamat: "",
});
const kopFile = ref(null);
const kopPreview = ref("");
const isSubmittingContact = ref(false);

// Check if company has contact data
const hasContactData = (company) => {
  if (!company) return false;
  return !!(company.email || company.no_telp || company.alamat);
};

// Open Edit Contact Modal
const openEditContactModal = () => {
  if (!company.value) return;

  // Populate form with existing data
  contactFormData.value = {
    email: company.value.email || "",
    no_telp: company.value.no_telp || "",
    alamat: company.value.alamat || "",
  };

  // Set kop preview if exists
  kopFile.value = null;
  if (company.value.kop_perusahaan && company.value.id_perusahaan) {
    kopPreview.value = `${apiBaseUrl}/companies/${company.value.id_perusahaan}/kop`;
  } else {
    kopPreview.value = "";
  }

  showContactModal.value = true;
};

// Close Contact Modal
const closeContactModal = () => {
  if (!isSubmittingContact.value) {
    showContactModal.value = false;
    contactFormData.value = { email: "", no_telp: "", alamat: "" };
    kopFile.value = null;
    kopPreview.value = "";
  }
};

// Handle Kop File Change
const handleKopChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      alert("Ukuran file kop terlalu besar. Maksimal 50MB.");
      return;
    }

    kopFile.value = file;

    const reader = new FileReader();
    reader.onload = (e) => {
      kopPreview.value = e.target.result;
    };
    reader.readAsDataURL(file);
  }
};

// Clear Kop
const clearKop = () => {
  kopFile.value = null;
  kopPreview.value = "";
};

// === COMPANY PROFILE PDF UPLOAD (Inline) ===
const pendingCompanyProfileFile = ref(null);
const pendingCompanyProfilePreview = ref("");
const isUploadingCompanyProfile = ref(false);

// Handle PDF file selection
const handleCompanyProfileSelect = (event) => {
  const file = event.target.files[0];
  if (file) {
    // Validate file type
    if (file.type !== "application/pdf") {
      toast.error("File harus berformat PDF");
      event.target.value = ""; // Reset input
      return;
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Ukuran file terlalu besar. Maksimal 50MB");
      event.target.value = ""; // Reset input
      return;
    }

    // Set pending file
    pendingCompanyProfileFile.value = file;

    // Create preview URL
    const fileURL = URL.createObjectURL(file);
    pendingCompanyProfilePreview.value = getPreviewUrl(fileURL);

    // Reset input so same file can be selected again
    event.target.value = "";
  }
};

// Save Company Profile PDF
const saveCompanyProfile = async () => {
  if (!pendingCompanyProfileFile.value) {
    toast.warning("Tidak ada file untuk disimpan");
    return;
  }

  console.log("📤 Starting PDF upload...");
  isUploadingCompanyProfile.value = true;

  try {
    const formData = new FormData();
    formData.append("companyProfile", pendingCompanyProfileFile.value);
    formData.append("nama_perusahaan", company.value.nama_perusahaan);
    formData.append("status", company.value.status || "Pusat");
    formData.append("tahun_berdiri", company.value.tahun_berdiri || "");
    formData.append("email", company.value.email || "");
    formData.append("no_telp", company.value.no_telp || "");
    formData.append("alamat", company.value.alamat || "");

    console.log("📋 FormData prepared:", {
      file: pendingCompanyProfileFile.value.name,
      size: pendingCompanyProfileFile.value.size,
      company: company.value.nama_perusahaan,
    });

    const url = `${apiBaseUrl}/companies/${companyId}`;
    console.log("🌐 Sending to:", url);

    const response = await fetch(url, {
      method: "PUT",
      body: formData,
    });

    console.log("📥 Response status:", response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Response error:", errorText);
      throw new Error(`Server error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log("✅ Response data:", result);

    toast.success("Company Profile PDF berhasil disimpan!");

    // Clear pending state
    pendingCompanyProfileFile.value = null;
    pendingCompanyProfilePreview.value = "";

    // Refresh company data
    console.log("🔄 Refreshing company data...");
    await fetchCompanyDetail();
    console.log("✅ Upload complete!");
  } catch (error) {
    console.error("❌ Error saving PDF:", error);
    toast.error("Gagal menyimpan PDF: " + error.message);
  } finally {
    isUploadingCompanyProfile.value = false;
  }
};

// Cancel PDF upload
const cancelCompanyProfileUpload = () => {
  if (!isUploadingCompanyProfile.value) {
    pendingCompanyProfileFile.value = null;
    pendingCompanyProfilePreview.value = "";
  }
};

// === ADD PEJABAT MODAL ===
// Fetch personil list for selection
const fetchPersonilList = async () => {
  try {
    const res = await fetch(`${apiBaseUrl}/personnel`);
    if (res.ok) {
      const response = await res.json();
      // Extract data from response object
      personilList.value = response.data || response || [];
      console.log(
        "✅ Personil list loaded:",
        personilList.value.length,
        "items"
      );
    } else {
      console.error("Failed to fetch personnel:", res.status, res.statusText);
      toast.error("Gagal memuat daftar personil");
    }
  } catch (e) {
    console.error("Error fetching personil list:", e);
    toast.error("Gagal memuat daftar personil");
  }
};

// Open Add Pejabat Modal
const openAddPejabatModal = async () => {
  // Fetch personil list if not loaded
  if (personilList.value.length === 0) {
    await fetchPersonilList();
  }

  // Reset form
  jabatanType.value = "direktur";
  pejabatFormData.value = {
    id_personel: "",
    jabatan_custom: "",
  };

  showAddPejabatModal.value = true;
};

// Close Add Pejabat Modal
const closeAddPejabatModal = () => {
  if (!isSubmittingPejabat.value) {
    showAddPejabatModal.value = false;
    jabatanType.value = "direktur";
    pejabatFormData.value = {
      id_personel: "",
      jabatan_custom: "",
    };
  }
};

// Computed: Filter personel yang belum menjadi pejabat
const availablePersonilList = computed(() => {
  // Get list of id_personel yang sudah menjadi pejabat
  const existingPejabatIds = (subModules.value.pejabat || []).map(
    (p) => p.id_personel
  );

  // Filter personil yang belum ada di daftar pejabat
  return personilList.value.filter(
    (person) => !existingPejabatIds.includes(person.id_personel)
  );
});

// Validation computed property
const canSavePejabat = computed(() => {
  if (!pejabatFormData.value.id_personel) return false;
  if (
    jabatanType.value === "custom" &&
    !pejabatFormData.value.jabatan_custom.trim()
  )
    return false;
  return true;
});

// Save Pejabat
const savePejabat = async () => {
  if (!canSavePejabat.value) {
    toast.warning("Mohon lengkapi semua field yang diperlukan");
    return;
  }

  isSubmittingPejabat.value = true;
  let saveSuccessful = false;

  try {
    // Prepare data
    const data = {
      id_perusahaan: companyId,
      id_personel: pejabatFormData.value.id_personel,
    };

    // Add jabatan based on type
    if (jabatanType.value === "direktur") {
      data.jenis_jabatan = "Direktur";
      data.jabatan_custom = "";
    } else {
      data.jenis_jabatan = "";
      data.jabatan_custom = pejabatFormData.value.jabatan_custom.trim();
    }

    console.log("📤 Saving pejabat:", data);

    const res = await fetch(`${apiBaseUrl}/companies/${companyId}/pejabat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const errData = await res.json();
      throw new Error(errData.message || "Gagal menyimpan pejabat");
    }

    toast.success("Pejabat berhasil ditambahkan!");
    saveSuccessful = true;

    // Refresh pejabat data
    await fetchPejabat();
  } catch (error) {
    console.error("❌ Error saving pejabat:", error);
    toast.error("Gagal menambahkan pejabat: " + error.message);
  } finally {
    isSubmittingPejabat.value = false;

    // Close modal only if save was successful
    if (saveSuccessful) {
      closeAddPejabatModal();
    }
  }
};

// === GENERIC DOCUMENT UPLOAD SYSTEM ===
// State for all document uploads (Akta, NIB, SBU, KTA, Sertifikat, Kontrak, Cek)
const pendingDocuments = ref({
  akta: { file: null, preview: "", uploading: false },
  nib: { file: null, preview: "", uploading: false },
  sbu: { file: null, preview: "", uploading: false },
  kta: { file: null, preview: "", uploading: false },
  sertifikat: { file: null, preview: "", uploading: false },
  kontrak: { file: null, preview: "", uploading: false },
  cek: { file: null, preview: "", uploading: false },
  bpjs: { file: null, preview: "", uploading: false },
});

// Handle document file selection
const handleDocumentSelect = (documentType, event) => {
  const file = event.target.files[0];
  if (file) {
    // Validate file type
    if (file.type !== "application/pdf") {
      toast.error("File harus berformat PDF");
      event.target.value = "";
      return;
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("Ukuran file terlalu besar. Maksimal 50MB");
      event.target.value = "";
      return;
    }

    // Set pending file
    pendingDocuments.value[documentType].file = file;

    // Create preview URL
    const fileURL = URL.createObjectURL(file);
    pendingDocuments.value[documentType].preview = getPreviewUrl(fileURL);

    // Reset input
    event.target.value = "";
  }
};

// Save document
const saveDocument = async (documentType) => {
  const doc = pendingDocuments.value[documentType];

  if (!doc.file) {
    toast.warning("Tidak ada file untuk disimpan");
    return;
  }

  console.log(`📤 Starting ${documentType} upload...`);
  doc.uploading = true;

  try {
    const formData = new FormData();
    formData.append(documentType, doc.file);
    formData.append("nama_perusahaan", company.value.nama_perusahaan);
    formData.append("status", company.value.status || "Pusat");
    formData.append("tahun_berdiri", company.value.tahun_berdiri || "");
    formData.append("email", company.value.email || "");
    formData.append("no_telp", company.value.no_telp || "");
    formData.append("alamat", company.value.alamat || "");

    console.log(`📋 Uploading ${documentType}:`, doc.file.name);

    const url = `${apiBaseUrl}/companies/${companyId}`;
    const response = await fetch(url, {
      method: "PUT",
      body: formData,
    });

    console.log(`📥 Response status:`, response.status);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("❌ Response error:", errorText);
      throw new Error(`Server error: ${response.status}`);
    }

    const result = await response.json();
    console.log("✅ Response data:", result);

    // 1. Notification: Drive Upload (if details available)
    // 1. Notification: Drive Upload (if details available)
    if (result.uploadDetails && result.uploadDetails.length > 0) {
      for (const detail of result.uploadDetails) {
        toast.info(
          `Upload Drive Berhasil:\n${detail.fullPath || detail.fileName}`,
          3000
        );
      }
    }

    // 2. Notification: Spreadsheet Update
    toast.success("Database Spreadsheet berhasil diperbarui", 2000);

    // 3. Notification: Final Success
    toast.success(`Dokumen ${documentType.toUpperCase()} berhasil disimpan!`);

    // Clear pending state
    doc.file = null;
    doc.preview = "";

    // Refresh data for specific tab
    console.log(`🔄 Refreshing ${documentType} data...`);

    // Call specific fetch function based on document type
    if (documentType === "akta") await fetchAkta();
    else if (documentType === "nib") await fetchNIB();
    else if (documentType === "sbu") await fetchSBU();
    else if (documentType === "kta") await fetchKTA();
    else if (documentType === "cek") await fetchCek();
    else if (documentType === "bpjs") await fetchBPJS();

    // Also refresh company profile (untuk update URL di db_profil_perusahaan)
    await fetchCompanyDetail();

    console.log("✅ Upload complete!");
  } catch (error) {
    console.error(`❌ Error saving ${documentType}:`, error);
    toast.error(`Gagal menyimpan ${documentType}: ` + error.message);
  } finally {
    doc.uploading = false;
  }
};

// Get document URL from company data or selected item
const getDocumentUrl = (documentType) => {
  // For tabs with multiple items, get URL from selected item
  const multiItemTabs = [
    "akta",
    "nib",
    "sbu",
    "kta",
    "sertifikat",
    "kontrak",
    "cek",
    "bpjs",
  ];

  if (multiItemTabs.includes(documentType)) {
    const item = selectedItems.value[documentType];
    if (item) {
      const itemUrlMap = {
        akta: item.akta_perusahaan_url,
        nib: item.nib_url,
        sbu: item.sbu_url,
        kta: item.kta_url,
        sertifikat: item.sertifikat_standar_url,
        kontrak: item.kontrak_url,
        cek: item.url_cek,
        bpjs: item.url_bpjs,
      };
      return itemUrlMap[documentType] || "";
    }
    return "";
  }

  // For other single-item tabs (if any), get from company data
  if (!company.value) return "";

  return "";
};

// Cancel document upload
const cancelDocumentUpload = (documentType) => {
  const doc = pendingDocuments.value[documentType];
  if (!doc.uploading) {
    doc.file = null;
    doc.preview = "";
  }
};

// Save Contact Data
const saveContactData = async () => {
  isSubmittingContact.value = true;
  let saveSuccessful = false;

  try {
    const submitData = new FormData();
    submitData.append("email", contactFormData.value.email || "");
    submitData.append("no_telp", contactFormData.value.no_telp || "");
    submitData.append("alamat", contactFormData.value.alamat || "");
    submitData.append("nama_perusahaan", company.value.nama_perusahaan);
    submitData.append("status", company.value.status || "Pusat");
    submitData.append("tahun_berdiri", company.value.tahun_berdiri || "");

    // Upload Kop if new
    if (kopFile.value) {
      submitData.append("kop", kopFile.value);
    }

    const response = await fetch(`${apiBaseUrl}/companies/${companyId}`, {
      method: "PUT",
      body: submitData,
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal menyimpan data");
    }

    toast.success("Data kontak berhasil disimpan!");
    saveSuccessful = true;

    // Refresh company data
    await fetchCompanyDetail();
  } catch (error) {
    console.error("Error saving contact:", error);
    toast.error("Gagal menyimpan data: " + error.message);
  } finally {
    isSubmittingContact.value = false;

    // Close modal only if save was successful
    if (saveSuccessful) {
      closeContactModal();
    }
  }
};

// Clear Contact Data
const clearContactData = async () => {
  if (
    !confirm(
      "Yakin ingin menghapus semua data kontak (Email, No. Telepon, Alamat) perusahaan ini?"
    )
  )
    return;

  try {
    const submitData = new FormData();
    submitData.append("email", "");
    submitData.append("no_telp", "");
    submitData.append("alamat", "");
    submitData.append("nama_perusahaan", company.value.nama_perusahaan);
    submitData.append("status", company.value.status || "Pusat");
    submitData.append("tahun_berdiri", company.value.tahun_berdiri || "");

    const response = await fetch(`${apiBaseUrl}/companies/${companyId}`, {
      method: "PUT",
      body: submitData,
    });

    if (response.ok) {
      await fetchCompanyDetail();
      alert("Data kontak berhasil dihapus");
    } else {
      throw new Error("Gagal menghapus data");
    }
  } catch (error) {
    console.error("Error clearing contact:", error);
    alert("Gagal menghapus data: " + error.message);
  }
};

// AI Scan Handlers for Tax Documents
const handleNpwpAIScan = (data) => {
  console.log("[AI SCAN] NPWP Perusahaan data:", data);
  Object.assign(npwpUploadFormData.value, data);
};

const handleSptAIScan = (data) => {
  console.log("[AI SCAN] SPT data:", data);
  Object.assign(sptUploadFormData.value, data);
};

const handlePkpAIScan = (data) => {
  console.log("[AI SCAN] PKP data:", data);
  Object.assign(pkpUploadFormData.value, data);
};

const handleKswpAIScan = (data) => {
  console.log("[AI SCAN] KSWP data:", data);
  Object.assign(kswpUploadFormData.value, data);
};

// Save Tax Document Handlers
const saveNpwpDocument = async (file) => {
  if (!file) {
    toast.error("File tidak tersedia");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("npwp_perusahaan", file);
    formData.append("nomor_npwp", npwpUploadFormData.value.nomor_npwp || "");
    formData.append("nama_wp", npwpUploadFormData.value.nama_wp || "");
    formData.append("alamat_npwp", npwpUploadFormData.value.alamat || "");
    formData.append("kpp", npwpUploadFormData.value.kpp || "");
    formData.append(
      "tanggal_terdaftar",
      npwpUploadFormData.value.tanggal_terdaftar || ""
    );
    formData.append("nama_perusahaan", company.value.nama_perusahaan);
    formData.append("status", company.value.status || "Pusat");
    formData.append("tahun_berdiri", company.value.tahun_berdiri || "");
    formData.append("email", company.value.email || "");
    formData.append("no_telp", company.value.no_telp || "");
    formData.append("alamat", company.value.alamat || "");

    const response = await fetch(`${apiBaseUrl}/companies/${companyId}`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Gagal menyimpan NPWP");
    }

    toast.success("Dokumen NPWP berhasil disimpan!");
    await fetchPajak();
    await fetchCompanyDetail();
    showNpwpUploadModal.value = false;
    npwpUploadFormData.value = {
      nomor_npwp: "",
      nama_wp: "",
      alamat: "",
      kpp: "",
      tanggal_terdaftar: "",
    };
  } catch (error) {
    console.error("❌ Error saving NPWP:", error);
    toast.error("Gagal menyimpan NPWP: " + error.message);
  }
};

const saveSptDocument = async (file) => {
  if (!file) {
    toast.error("File tidak tersedia");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("spt", file);
    formData.append("tahun_pajak", sptUploadFormData.value.tahun_pajak || "");
    formData.append("masa_pajak", sptUploadFormData.value.masa_pajak || "");
    formData.append("jenis_spt", sptUploadFormData.value.jenis_spt || "");
    formData.append(
      "pembetulan_ke",
      sptUploadFormData.value.pembetulan_ke || "0"
    );
    formData.append("nominal", sptUploadFormData.value.nominal || "0");
    formData.append(
      "tanggal_penyampaian",
      sptUploadFormData.value.tanggal_penyampaian || ""
    );
    formData.append(
      "nomor_tanda_terima",
      sptUploadFormData.value.nomor_tanda_terima || ""
    );
    formData.append("nama_wp_spt", sptUploadFormData.value.nama_wp || "");
    formData.append("npwp_spt", sptUploadFormData.value.npwp || "");
    formData.append("nitku", sptUploadFormData.value.nitku || "");
    formData.append(
      "status_spt",
      sptUploadFormData.value.status_spt || "Normal"
    );
    formData.append("nama_perusahaan", company.value.nama_perusahaan);
    formData.append("status", company.value.status || "Pusat");
    formData.append("tahun_berdiri", company.value.tahun_berdiri || "");
    formData.append("email", company.value.email || "");
    formData.append("no_telp", company.value.no_telp || "");
    formData.append("alamat", company.value.alamat || "");

    const response = await fetch(`${apiBaseUrl}/companies/${companyId}`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Gagal menyimpan SPT");
    }

    toast.success("Dokumen SPT berhasil disimpan!");
    await fetchPajak();
    await fetchCompanyDetail();
    showSptUploadModal.value = false;
    sptUploadFormData.value = {
      tahun_pajak: "",
      masa_pajak: "",
      jenis_spt: "",
      pembetulan_ke: "0",
      nominal: 0,
      tanggal_penyampaian: "",
      nomor_tanda_terima: "",
      nama_wp: "",
      npwp: "",
      nitku: "",
      status_spt: "Normal",
    };
  } catch (error) {
    console.error("❌ Error saving SPT:", error);
    toast.error("Gagal menyimpan SPT: " + error.message);
  }
};

const savePkpDocument = async (file) => {
  if (!file) {
    toast.error("File tidak tersedia");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("pkp", file);
    formData.append("nomor_pkp", pkpUploadFormData.value.nomor_pkp || "");
    formData.append(
      "tanggal_pengukuhan",
      pkpUploadFormData.value.tanggal_pengukuhan || ""
    );
    formData.append("nama_pkp", pkpUploadFormData.value.nama_pkp || "");
    formData.append("alamat_pkp", pkpUploadFormData.value.alamat || "");
    formData.append("nama_perusahaan", company.value.nama_perusahaan);
    formData.append("status", company.value.status || "Pusat");
    formData.append("tahun_berdiri", company.value.tahun_berdiri || "");
    formData.append("email", company.value.email || "");
    formData.append("no_telp", company.value.no_telp || "");
    formData.append("alamat", company.value.alamat || "");

    const response = await fetch(`${apiBaseUrl}/companies/${companyId}`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Gagal menyimpan PKP");
    }

    toast.success("Dokumen PKP berhasil disimpan!");
    await fetchPajak();
    await fetchCompanyDetail();
    showPkpUploadModal.value = false;
    pkpUploadFormData.value = {
      nomor_pkp: "",
      tanggal_pengukuhan: "",
      nama_pkp: "",
      alamat: "",
    };
  } catch (error) {
    console.error("❌ Error saving PKP:", error);
    toast.error("Gagal menyimpan PKP: " + error.message);
  }
};

const saveKswpDocument = async (file) => {
  if (!file) {
    toast.error("File tidak tersedia");
    return;
  }

  try {
    const formData = new FormData();
    formData.append("kswp", file);
    formData.append("nama_wp_kswp", kswpUploadFormData.value.nama_wp || "");
    formData.append("npwp_kswp", kswpUploadFormData.value.npwp || "");
    formData.append("tahun_kswp", kswpUploadFormData.value.tahun_kswp || "");
    formData.append("status_kswp", kswpUploadFormData.value.status_kswp || "");
    formData.append(
      "tanggal_terbit_kswp",
      kswpUploadFormData.value.tanggal_terbit || ""
    );
    formData.append("nama_perusahaan", company.value.nama_perusahaan);
    formData.append("status", company.value.status || "Pusat");
    formData.append("tahun_berdiri", company.value.tahun_berdiri || "");
    formData.append("email", company.value.email || "");
    formData.append("no_telp", company.value.no_telp || "");
    formData.append("alamat", company.value.alamat || "");

    const response = await fetch(`${apiBaseUrl}/companies/${companyId}`, {
      method: "PUT",
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Gagal menyimpan KSWP");
    }

    toast.success("Dokumen KSWP berhasil disimpan!");
    await fetchPajak();
    await fetchCompanyDetail();
    showKswpUploadModal.value = false;
    kswpUploadFormData.value = {
      nama_wp: "",
      npwp: "",
      tahun_kswp: "",
      status_kswp: "",
      tanggal_terbit: "",
    };
  } catch (error) {
    console.error("❌ Error saving KSWP:", error);
    toast.error("Gagal menyimpan KSWP: " + error.message);
  }
};

// Navigate to personnel detail
const navigateToPersonnel = (id) => {
  if (!id) return;
  // ID format typically PRSxxx. If it's a raw ID, we should handle it.
  // Assuming the route is /database/personel/:id
  // Try to use existing router instance
  try {
    router.push(`/database/personel/${id}`);
  } catch (e) {
    console.error("Router navigation failed:", e);
    // Fallback if router variable is not available in this scope but useRouter is
    try {
      const r = useRouter();
      r.push(`/database/personel/${id}`);
    } catch (err) {
      console.error("useRouter failed:", err);
      toast.error("Gagal navigasi ke halaman personel");
    }
  }
};

onMounted(() => {
  fetchCompanyDetail();
});
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar {
  display: none;
}
.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.mask-gradient {
  mask-image: linear-gradient(
    to right,
    transparent,
    black 20px,
    black 90%,
    transparent
  );
}

/* Tab Transitions */
.tab-fade-enter-active,
.tab-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.tab-fade-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.tab-fade-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
