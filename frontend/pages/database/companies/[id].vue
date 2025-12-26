<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
    <!-- Technical Header (Full Width) -->
    <header
      class="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-200"
    >
      <div
        class="max-w-[1800px] mx-auto px-4 md:px-6 h-16 md:h-24 flex items-center justify-between"
      >
        <div class="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
          <button
            @click="router.push('/database/companies')"
            class="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-600 transition-colors border border-slate-100 dark:border-slate-700"
          >
            <i class="fas fa-arrow-left"></i>
          </button>

          <div class="flex items-center gap-5 flex-1 min-w-0">
            <!-- Logo with better container -->
            <div
              class="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center p-1.5 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
            >
              <img
                v-if="shouldShowLogo(company)"
                :src="getCompanyLogoUrl(company)"
                class="w-full h-full object-contain"
                @error="(e) => handleImageError(e, company)"
              />
              <div
                v-else
                class="w-full h-full bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center"
              >
                <span class="text-sm font-bold text-slate-400 font-mono">{{
                  company ? getInitials(company.nama_perusahaan) : "..."
                }}</span>
              </div>
            </div>

            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-1">
                <h1
                  class="text-lg md:text-2xl font-black text-slate-900 dark:text-white leading-tight truncate"
                >
                  {{ company?.nama_perusahaan || "Loading Database..." }}
                </h1>
                <!-- Status Badge (Fixed Shape) -->
                <span
                  v-if="company?.status"
                  class="hidden md:inline-flex items-center justify-center uppercase text-[10px] font-bold tracking-widest px-3 py-1 rounded-md border h-6"
                  :class="
                    company.status === 'Pusat'
                      ? 'bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300'
                      : 'bg-slate-100 border-slate-200 text-slate-600'
                  "
                >
                  {{ company?.status }}
                </span>
              </div>

              <div
                class="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium"
              >
                <div class="flex items-center gap-2 font-mono">
                  <span class="text-slate-300">ID:</span>
                  <span
                    class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300"
                    >{{ company?.id_perusahaan || "ID-____" }}</span
                  >
                </div>
                <div class="flex items-center gap-2" v-if="company?.npwp">
                  <i class="fas fa-id-card text-slate-300"></i>
                  <span>NPWP: {{ company.npwp }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Kop (Letterhead) di sisi kanan -->
        <div
          v-if="shouldShowKop(company)"
          class="hidden md:flex items-center justify-end ml-4"
        >
          <div
            class="h-16 md:h-20 max-w-[200px] lg:max-w-[300px] flex items-center justify-end"
          >
            <img
              :src="getCompanyKopUrl(company)"
              class="h-full w-auto object-contain"
              @error="(e) => handleKopImageError(e, company)"
              alt="Company Letterhead"
            />
          </div>
        </div>
      </div>

      <!-- Horizontal Navigation Tabs (Sticky under header) -->
      <div
        class="max-w-[1800px] mx-auto px-4 md:px-6 overflow-x-auto no-scrollbar mask-gradient bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
      >
        <div class="flex items-center gap-1 md:gap-2 pb-0.5">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="relative px-3 py-3 text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 border-b-2"
            :class="
              activeTab === tab.id
                ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10'
                : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'
            "
          >
            <i :class="tab.icon" class="text-base opacity-75"></i>
            {{ tab.label }}
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content Area (Full Width) -->
    <main class="max-w-[1800px] mx-auto px-4 md:px-6 py-6 min-h-[60vh]">
      <!-- Loading State -->
      <div
        v-if="loadingTab"
        class="py-20 flex flex-col items-center justify-center text-slate-400"
      >
        <div
          class="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"
        ></div>
        <span class="text-xs font-mono animate-pulse">Syncing Database...</span>
      </div>

      <!-- Content Views -->
      <div v-else class="animate-fade-in-up">
        <!-- OVERVIEW TAB (Redesigned) -->
        <div
          v-if="activeTab === 'overview' && company"
          class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          <!-- Left Column: Company Info & KBLI (Wider: 7 cols) -->
          <div class="lg:col-span-7 space-y-6">
            <!-- Company Contacts Card -->
            <div
              class="relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm group"
            >
              <!-- Background Icon -->
              <div
                class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"
              >
                <i class="fas fa-building text-9xl"></i>
              </div>

              <!-- Action Buttons (Top Right) -->
              <div class="absolute top-4 right-4 z-20 flex items-center gap-2">
                <!-- Show Edit & Delete if data exists -->
                <template v-if="hasContactData(company)">
                  <button
                    @click="openEditContactModal"
                    class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-all hover:scale-110"
                    title="Edit Kontak & Kop"
                  >
                    <i class="fas fa-edit text-sm"></i>
                  </button>
                  <button
                    @click="clearContactData"
                    class="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 flex items-center justify-center transition-all hover:scale-110"
                    title="Hapus Kontak"
                  >
                    <i class="fas fa-trash-alt text-sm"></i>
                  </button>
                </template>
                <!-- Show Plus if no data -->
                <button
                  v-else
                  @click="openEditContactModal"
                  class="w-8 h-8 rounded-lg bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/40 text-green-600 dark:text-green-400 flex items-center justify-center transition-all hover:scale-110"
                  title="Tambah Kontak & Kop"
                >
                  <i class="fas fa-plus text-sm"></i>
                </button>
              </div>

              <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                <!-- Email -->
                <div class="flex items-start gap-4">
                  <div
                    class="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 border border-blue-100 dark:border-blue-900/50"
                  >
                    <i class="fas fa-envelope"></i>
                  </div>
                  <div>
                    <p
                      class="text-[10px] uppercase font-bold text-slate-400 tracking-wider"
                    >
                      Email Perusahaan
                    </p>
                    <p
                      class="font-medium text-slate-700 dark:text-slate-200 break-all"
                    >
                      {{ company.email || "-" }}
                    </p>
                  </div>
                </div>

                <!-- Phone -->
                <div class="flex items-start gap-4">
                  <div
                    class="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-100 dark:border-emerald-900/50"
                  >
                    <i class="fas fa-phone"></i>
                  </div>
                  <div>
                    <p
                      class="text-[10px] uppercase font-bold text-slate-400 tracking-wider"
                    >
                      No. Telepon
                    </p>
                    <p class="font-medium text-slate-700 dark:text-slate-200">
                      {{ company.no_telp || "-" }}
                    </p>
                  </div>
                </div>

                <!-- Address -->
                <div class="md:col-span-2 flex items-start gap-4">
                  <div
                    class="w-10 h-10 rounded-full bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0 border border-violet-100 dark:border-violet-900/50"
                  >
                    <i class="fas fa-map-marker-alt"></i>
                  </div>
                  <div>
                    <p
                      class="text-[10px] uppercase font-bold text-slate-400 tracking-wider"
                    >
                      Alamat Lengkap
                    </p>
                    <p
                      class="font-medium text-slate-700 dark:text-slate-200 leading-relaxed"
                    >
                      {{ company.alamat || "-" }}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Pejabat Section (Moved from tab) -->
            <div
              class="bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm"
            >
              <div class="flex items-center justify-between mb-6">
                <h3
                  class="font-bold text-slate-700 dark:text-slate-200 text-lg flex items-center gap-2"
                >
                  <i class="fas fa-user-tie text-cyan-500"></i>
                  Pejabat Perusahaan
                </h3>
                <span
                  class="text-xs font-bold text-slate-400 bg-slate-100 dark:bg-slate-700 px-3 py-1 rounded-full"
                  >{{ subModules.pejabat?.length || 0 }} Pejabat</span
                >
              </div>

              <!-- Scrollable Container -->
              <div class="max-h-[400px] overflow-y-auto pr-2 -mr-2">
                <div
                  class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                >
                  <!-- Existing Pejabat Cards -->
                  <div
                    v-for="item in subModules.pejabat || []"
                    :key="item.id_pejabat"
                    @click="navigateToPersonnel(item.id_personel)"
                    class="bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-700 p-4 hover:border-cyan-400 hover:shadow-md transition-all group relative overflow-hidden cursor-pointer"
                  >
                    <div class="absolute top-0 right-0 p-3 opacity-5">
                      <i class="fas fa-user-tie text-5xl"></i>
                    </div>
                    <div class="flex items-center gap-3 mb-3 relative z-10">
                      <div
                        class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-600 flex items-center justify-center font-bold text-slate-500 dark:text-slate-300 ring-2 ring-white dark:ring-slate-700 shadow-sm text-sm"
                      >
                        {{ getInitials(item.nama_lengkap || "Personel") }}
                      </div>
                      <div class="flex-1 min-w-0">
                        <div
                          class="text-[10px] font-bold text-cyan-600 uppercase bg-cyan-50 dark:bg-cyan-900/20 px-2 py-0.5 rounded inline-block mb-1"
                        >
                          {{
                            item.jenis_jabatan ||
                            item.jabatan_custom ||
                            "JABATAN"
                          }}
                        </div>
                        <h4
                          class="font-bold text-slate-800 dark:text-white truncate text-sm"
                          :title="item.nama_lengkap"
                        >
                          {{ item.nama_lengkap || "NAMA PERSONEL" }}
                        </h4>
                      </div>
                    </div>
                  </div>

                  <!-- Add Pejabat Card -->
                  <div
                    @click="openAddPejabatModal"
                    class="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl border-2 border-dashed border-green-300 dark:border-green-700 p-4 hover:border-green-500 dark:hover:border-green-500 hover:shadow-lg transition-all cursor-pointer group relative overflow-hidden min-h-[80px] flex items-center justify-center"
                  >
                    <div
                      class="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity"
                    >
                      <i class="fas fa-user-plus text-5xl text-green-600"></i>
                    </div>
                    <div class="flex items-center gap-3 relative z-10">
                      <div
                        class="w-10 h-10 rounded-full bg-green-100 dark:bg-green-900/40 flex items-center justify-center text-green-600 dark:text-green-400 group-hover:scale-110 transition-transform"
                      >
                        <i class="fas fa-plus text-lg"></i>
                      </div>
                      <div>
                        <h4
                          class="font-bold text-green-700 dark:text-green-400 text-sm"
                        >
                          Tambah Pejabat
                        </h4>
                        <p class="text-xs text-green-600 dark:text-green-500">
                          Klik untuk menambahkan
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Column: Profile Document Preview (Adjusted Height) -->
          <div class="lg:col-span-5 flex flex-col h-full">
            <div
              class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden h-[520px] sticky top-24"
            >
              <div
                class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 shrink-0"
              >
                <h3
                  class="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 text-sm"
                >
                  <i class="fas fa-file-pdf text-red-500"></i>
                  Company Profile
                </h3>
                <div class="flex gap-2">
                  <!-- Update Button (when PDF exists and not uploading) -->
                  <button
                    v-if="
                      company.profil_perusahaan_url &&
                      !pendingCompanyProfileFile
                    "
                    @click="$refs.companyProfileUpdateInput.click()"
                    class="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-1"
                    title="Perbarui PDF"
                  >
                    <i class="fas fa-sync-alt"></i>
                    <span>Perbarui</span>
                  </button>
                  <!-- Hidden file input for update -->
                  <input
                    ref="companyProfileUpdateInput"
                    type="file"
                    accept="application/pdf"
                    @change="handleCompanyProfileSelect"
                    class="hidden"
                  />
                  <a
                    v-if="
                      company.profil_perusahaan_url &&
                      !pendingCompanyProfileFile
                    "
                    :href="company.profil_perusahaan_url"
                    target="_blank"
                    class="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:border-blue-400 transition-colors"
                  >
                    <i class="fas fa-external-link-alt mr-1"></i> Buka Tab Baru
                  </a>
                </div>
              </div>

              <div class="flex-1 bg-slate-100 dark:bg-slate-900 relative">
                <!-- Existing PDF Preview -->
                <iframe
                  v-if="
                    company.profil_perusahaan_url && !pendingCompanyProfileFile
                  "
                  :src="getPreviewUrl(company.profil_perusahaan_url)"
                  class="w-full h-full absolute inset-0 border-none"
                ></iframe>

                <!-- New PDF Preview (during upload) -->
                <div
                  v-else-if="
                    pendingCompanyProfileFile && pendingCompanyProfilePreview
                  "
                  class="w-full h-full flex flex-col"
                >
                  <iframe
                    :src="pendingCompanyProfilePreview"
                    class="flex-1 w-full border-none"
                  ></iframe>
                  <!-- Footer with Save/Cancel -->
                  <div
                    class="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between"
                  >
                    <div class="flex-1 min-w-0">
                      <p
                        class="text-xs font-bold text-slate-700 dark:text-slate-300 truncate"
                      >
                        {{ pendingCompanyProfileFile.name }}
                      </p>
                      <p class="text-xs text-slate-500">
                        {{ formatFileSize(pendingCompanyProfileFile.size) }}
                      </p>
                    </div>
                    <div class="flex gap-2 ml-4">
                      <button
                        @click="cancelCompanyProfileUpload"
                        :disabled="isUploadingCompanyProfile"
                        class="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                      >
                        Batal
                      </button>
                      <button
                        @click="saveCompanyProfile"
                        :disabled="isUploadingCompanyProfile"
                        class="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <i
                          v-if="isUploadingCompanyProfile"
                          class="fas fa-spinner fa-spin"
                        ></i>
                        <i v-else class="fas fa-save"></i>
                        {{
                          isUploadingCompanyProfile ? "Menyimpan..." : "Simpan"
                        }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Upload State (No PDF) -->
                <div
                  v-else
                  class="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  @click="$refs.companyProfileUploadInput.click()"
                >
                  <input
                    ref="companyProfileUploadInput"
                    type="file"
                    accept="application/pdf"
                    @change="handleCompanyProfileSelect"
                    class="hidden"
                  />
                  <div
                    class="w-20 h-20 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center text-red-500 mb-4"
                  >
                    <i class="fas fa-file-pdf text-3xl"></i>
                  </div>
                  <p
                    class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Upload Company Profile
                  </p>
                  <p class="text-xs text-slate-500">
                    Klik untuk pilih file PDF (Max 50MB)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- GENERIC EMPTY STATE (Except Overview, Pajak, Kontrak, Cek, BPJS, Akta, NIB, SBU, KTA, Sertifikat) - 2 Column Layout -->
        <div
          v-else-if="
            activeTab !== 'overview' &&
            activeTab !== 'pajak' &&
            activeTab !== 'kontrak' &&
            activeTab !== 'cek' &&
            activeTab !== 'bpjs' &&
            activeTab !== 'akta' &&
            activeTab !== 'nib' &&
            activeTab !== 'sbu' &&
            activeTab !== 'kta' &&
            activeTab !== 'sertifikat' &&
            (!getTabData(activeTab) || getTabData(activeTab).length === 0)
          "
          class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          <!-- Left: Empty State Message (7 cols) -->
          <div class="lg:col-span-7">
            <div
              class="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center text-slate-400 bg-slate-50/50 dark:bg-slate-800/20"
            >
              <i
                :class="getTabIcon(activeTab)"
                class="text-4xl mb-3 opacity-30"
              ></i>
              <p class="text-sm font-medium">
                Belum ada data {{ getTabLabel(activeTab) }}.
              </p>
            </div>
          </div>

          <!-- Right: PDF Preview (5 cols) -->
          <div class="lg:col-span-5 flex flex-col h-full">
            <div
              class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden h-[520px] sticky top-24"
            >
              <div
                class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 shrink-0"
              >
                <div>
                  <h3
                    class="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 text-sm"
                  >
                    <i class="fas fa-file-pdf text-red-500"></i>
                    Dokumen {{ getTabLabel(activeTab) }}
                  </h3>
                </div>
              </div>

              <div class="flex-1 bg-slate-100 dark:bg-slate-900 relative">
                <div
                  class="w-full h-full flex flex-col items-center justify-center text-slate-400"
                >
                  <i class="fas fa-file-invoice text-4xl mb-4 opacity-20"></i>
                  <p class="text-sm">Pilih item untuk preview</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 1. AKTA TAB (Redesigned with Complete Info) -->
        <div
          v-if="activeTab === 'akta'"
          class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          <!-- Left: Data List (7 cols) -->
          <div class="lg:col-span-7 space-y-4">
            <!-- Data Cards (when data exists) -->
            <div v-if="subModules.akta?.length > 0" class="space-y-3">
              <div
                v-for="item in subModules.akta"
                :key="item.id_akta"
                class="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-6 transition-all group hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md"
              >
                <div
                  class="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-slate-700 pb-3"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center shrink-0"
                    >
                      <i class="fas fa-file-contract"></i>
                    </div>
                    <div>
                      <div
                        class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                      >
                        JENIS AKTA
                      </div>
                      <h4
                        class="font-bold text-slate-800 dark:text-white text-lg leading-none mt-1"
                      >
                        {{ item.jenis_akta }}
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
                      NOMOR AKTA
                    </div>
                    <div
                      class="text-xs font-mono font-bold text-slate-700 dark:text-slate-200"
                    >
                      {{ item.nomor_akta }}
                    </div>
                  </div>

                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      TANGGAL
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200"
                    >
                      {{ item.tanggal_akta || "-" }}
                    </div>
                  </div>

                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      NOTARIS
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200 truncate"
                    >
                      {{ item.notaris || "-" }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Empty State (when no data) - Show structure with "-" values -->
            <div
              v-else
              class="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-6"
            >
              <div
                class="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-slate-700 pb-3"
              >
                <div class="flex items-center gap-3">
                  <div
                    class="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center shrink-0 opacity-50"
                  >
                    <i class="fas fa-file-contract"></i>
                  </div>
                  <div>
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                    >
                      JENIS AKTA
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
                    NOMOR AKTA
                  </div>
                  <div
                    class="text-xs font-mono font-bold text-slate-400 dark:text-slate-500"
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
                    TANGGAL
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
                    NOTARIS
                  </div>
                  <div
                    class="text-xs font-medium text-slate-400 dark:text-slate-500 truncate"
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
              documentType="akta"
              label="Akta"
              :subtitle="
                selectedItems.akta
                  ? `${selectedItems.akta.jenis_akta} - ${selectedItems.akta.nomor_akta}`
                  : ''
              "
              icon="fas fa-file-contract"
              iconColor="orange"
              :existingPdfUrl="getDocumentUrl('akta')"
              :pendingFile="pendingDocuments.akta.file"
              :pendingPreview="pendingDocuments.akta.preview"
              :isUploading="pendingDocuments.akta.uploading"
              @file-selected="(event) => handleDocumentSelect('akta', event)"
              @save="saveDocument('akta')"
              @cancel="cancelDocumentUpload('akta')"
            />
          </div>
        </div>

        <!-- KONTRAK/PENGALAMAN TAB -->
        <div
          v-if="activeTab === 'kontrak'"
          class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          <!-- Left: Data List (7 cols) -->
          <div class="lg:col-span-7 space-y-4">
            <!-- Data Cards (when data exists) -->
            <div v-if="subModules.kontrak?.length > 0" class="space-y-3">
              <div
                v-for="item in subModules.kontrak"
                :key="item.id_kontrak"
                class="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-6 transition-all group hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md"
              >
                <div
                  class="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-slate-700 pb-3"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center shrink-0"
                    >
                      <i class="fas fa-briefcase"></i>
                    </div>
                    <div class="flex-1">
                      <div
                        class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                      >
                        NAMA PEKERJAAN
                      </div>
                      <h4
                        class="font-bold text-slate-800 dark:text-white text-base leading-tight mt-1"
                      >
                        {{ item.nama_pekerjaan || "-" }}
                      </h4>
                    </div>
                  </div>
                </div>

                <div class="space-y-0.5 mt-4">
                  <div
                    class="grid grid-cols-[150px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      Bidang Pekerjaan
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200"
                    >
                      {{ item.bidang_pekerjaan || "-" }}
                    </div>
                  </div>

                  <div
                    class="grid grid-cols-[150px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      Sub Bidang Pekerjaan
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200"
                    >
                      {{ item.sub_bidang_pekerjaan || "-" }}
                    </div>
                  </div>

                  <div
                    class="grid grid-cols-[150px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      Lokasi
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200"
                    >
                      {{ item.lokasi || "-" }}
                    </div>
                  </div>

                  <div
                    class="grid grid-cols-[150px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      Nama Pemberi Tugas
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200"
                    >
                      {{ item.nama_pemberi_tugas || "-" }}
                    </div>
                  </div>

                  <div
                    class="grid grid-cols-[150px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      Alamat Pemberi Tugas
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200"
                    >
                      {{ item.alamat_pemberi_tugas || "-" }}
                    </div>
                  </div>

                  <div
                    class="grid grid-cols-[150px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      Telepon Pemberi Tugas
                    </div>
                    <div
                      class="text-xs font-mono font-medium text-slate-700 dark:text-slate-200"
                    >
                      {{ item.telepon_pemberi_tugas || "-" }}
                    </div>
                  </div>

                  <div
                    class="grid grid-cols-[150px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      Fax Pemberi Tugas
                    </div>
                    <div
                      class="text-xs font-mono font-medium text-slate-700 dark:text-slate-200"
                    >
                      {{ item.fax_pemberi_tugas || "-" }}
                    </div>
                  </div>

                  <div
                    class="grid grid-cols-[150px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      Kode Pos
                    </div>
                    <div
                      class="text-xs font-mono font-medium text-slate-700 dark:text-slate-200"
                    >
                      {{ item.kode_pos_pemberi_tugas || "-" }}
                    </div>
                  </div>

                  <div
                    class="grid grid-cols-[150px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      Nomor Kontrak
                    </div>
                    <div
                      class="text-xs font-mono font-bold text-slate-700 dark:text-slate-200"
                    >
                      {{ item.nomor_kontrak || "-" }}
                    </div>
                  </div>

                  <div
                    class="grid grid-cols-[150px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      Tanggal Kontrak
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200"
                    >
                      {{ item.tanggal_kontrak || "-" }}
                    </div>
                  </div>

                  <div
                    class="grid grid-cols-[150px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      Nilai Kontrak
                    </div>
                    <div
                      class="text-xs font-bold text-green-600 dark:text-green-400"
                    >
                      {{
                        item.nilai_kontrak
                          ? `Rp ${Number(item.nilai_kontrak).toLocaleString(
                              "id-ID"
                            )}`
                          : "-"
                      }}
                    </div>
                  </div>

                  <div
                    class="grid grid-cols-[150px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      Waktu Pelaksanaan
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200"
                    >
                      {{ item.waktu_pelaksanaan || "-" }}
                    </div>
                  </div>

                  <div
                    class="grid grid-cols-[150px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      Tanggal Selesai
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200"
                    >
                      {{ item.tanggal_selesai_kontrak || "-" }}
                    </div>
                  </div>

                  <div
                    class="grid grid-cols-[150px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      Tgl BA Serah Terima
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200"
                    >
                      {{ item.tanggal_ba_serah_terima || "-" }}
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
                    class="w-10 h-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 flex items-center justify-center shrink-0 opacity-50"
                  >
                    <i class="fas fa-briefcase"></i>
                  </div>
                  <div class="flex-1">
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                    >
                      NAMA PEKERJAAN
                    </div>
                    <h4
                      class="font-bold text-slate-400 dark:text-slate-500 text-base leading-tight mt-1"
                    >
                      -
                    </h4>
                  </div>
                </div>
              </div>

              <div class="space-y-0.5 mt-4">
                <div
                  class="grid grid-cols-[150px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                >
                  <div
                    class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                  >
                    Bidang Pekerjaan
                  </div>
                  <div
                    class="text-xs font-medium text-slate-400 dark:text-slate-500"
                  >
                    -
                  </div>
                </div>

                <div
                  class="grid grid-cols-[150px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                >
                  <div
                    class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                  >
                    Sub Bidang Pekerjaan
                  </div>
                  <div
                    class="text-xs font-medium text-slate-400 dark:text-slate-500"
                  >
                    -
                  </div>
                </div>

                <div
                  class="grid grid-cols-[150px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                >
                  <div
                    class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                  >
                    Lokasi
                  </div>
                  <div
                    class="text-xs font-medium text-slate-400 dark:text-slate-500"
                  >
                    -
                  </div>
                </div>

                <div
                  class="grid grid-cols-[150px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                >
                  <div
                    class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                  >
                    Nama Pemberi Tugas
                  </div>
                  <div
                    class="text-xs font-medium text-slate-400 dark:text-slate-500"
                  >
                    -
                  </div>
                </div>

                <div
                  class="grid grid-cols-[150px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                >
                  <div
                    class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                  >
                    Alamat Pemberi Tugas
                  </div>
                  <div
                    class="text-xs font-medium text-slate-400 dark:text-slate-500"
                  >
                    -
                  </div>
                </div>

                <div
                  class="grid grid-cols-[150px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                >
                  <div
                    class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                  >
                    Telepon Pemberi Tugas
                  </div>
                  <div
                    class="text-xs font-mono font-medium text-slate-400 dark:text-slate-500"
                  >
                    -
                  </div>
                </div>

                <div
                  class="grid grid-cols-[150px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                >
                  <div
                    class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                  >
                    Fax Pemberi Tugas
                  </div>
                  <div
                    class="text-xs font-mono font-medium text-slate-400 dark:text-slate-500"
                  >
                    -
                  </div>
                </div>

                <div
                  class="grid grid-cols-[150px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                >
                  <div
                    class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                  >
                    Kode Pos
                  </div>
                  <div
                    class="text-xs font-mono font-medium text-slate-400 dark:text-slate-500"
                  >
                    -
                  </div>
                </div>

                <div
                  class="grid grid-cols-[150px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                >
                  <div
                    class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                  >
                    Nomor Kontrak
                  </div>
                  <div
                    class="text-xs font-mono font-bold text-slate-400 dark:text-slate-500"
                  >
                    -
                  </div>
                </div>

                <div
                  class="grid grid-cols-[150px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                >
                  <div
                    class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                  >
                    Tanggal Kontrak
                  </div>
                  <div
                    class="text-xs font-medium text-slate-400 dark:text-slate-500"
                  >
                    -
                  </div>
                </div>

                <div
                  class="grid grid-cols-[150px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                >
                  <div
                    class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                  >
                    Nilai Kontrak
                  </div>
                  <div
                    class="text-xs font-bold text-slate-400 dark:text-slate-500"
                  >
                    -
                  </div>
                </div>

                <div
                  class="grid grid-cols-[150px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                >
                  <div
                    class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                  >
                    Waktu Pelaksanaan
                  </div>
                  <div
                    class="text-xs font-medium text-slate-400 dark:text-slate-500"
                  >
                    -
                  </div>
                </div>

                <div
                  class="grid grid-cols-[150px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                >
                  <div
                    class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                  >
                    Tanggal Selesai
                  </div>
                  <div
                    class="text-xs font-medium text-slate-400 dark:text-slate-500"
                  >
                    -
                  </div>
                </div>

                <div
                  class="grid grid-cols-[150px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                >
                  <div
                    class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                  >
                    Tgl BA Serah Terima
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
              documentType="kontrak"
              label="Kontrak"
              :subtitle="
                selectedItems.kontrak
                  ? `${selectedItems.kontrak.lokasi || '-'}`
                  : ''
              "
              icon="fas fa-briefcase"
              iconColor="purple"
              :existingPdfUrl="getDocumentUrl('kontrak')"
              :pendingFile="pendingDocuments.kontrak.file"
              :pendingPreview="pendingDocuments.kontrak.preview"
              :isUploading="pendingDocuments.kontrak.uploading"
              @file-selected="(event) => handleDocumentSelect('kontrak', event)"
              @save="saveDocument('kontrak')"
              @cancel="cancelDocumentUpload('kontrak')"
            />
          </div>
        </div>

        <!-- CEK TAB -->
        <div
          v-if="activeTab === 'cek'"
          class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          <!-- Left: Data List (7 cols) -->
          <div class="lg:col-span-7 space-y-4">
            <!-- Data Cards (when data exists) -->
            <div v-if="subModules.cek?.length > 0" class="space-y-3">
              <div
                v-for="item in subModules.cek"
                :key="item.id_cek"
                class="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-6 transition-all group hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md"
              >
                <div
                  class="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-slate-700 pb-3"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 rounded-lg bg-green-50 dark:bg-green-900/20 text-green-600 flex items-center justify-center shrink-0"
                    >
                      <i class="fas fa-money-check"></i>
                    </div>
                    <div>
                      <div
                        class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                      >
                        CEK REFERENSI BANK
                      </div>
                      <h4
                        class="font-bold text-slate-800 dark:text-white text-lg leading-none mt-1"
                      >
                        {{ item.nama_bank || "-" }}
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
                      NO REKENING
                    </div>
                    <div
                      class="text-xs font-mono font-bold text-slate-700 dark:text-slate-200"
                    >
                      {{ item.no_rekening || "-" }}
                    </div>
                  </div>

                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      NAMA BANK
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200"
                    >
                      {{ item.nama_bank || "-" }}
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
                    <i class="fas fa-money-check"></i>
                  </div>
                  <div>
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                    >
                      CEK REFERENSI BANK
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
                    NO REKENING
                  </div>
                  <div
                    class="text-xs font-mono font-bold text-slate-400 dark:text-slate-500"
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
                    NAMA BANK
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
              documentType="cek"
              label="Cek"
              :subtitle="
                selectedItems.cek
                  ? `${selectedItems.cek.nama_bank} - ${selectedItems.cek.no_rekening}`
                  : ''
              "
              icon="fas fa-money-check"
              iconColor="green"
              :existingPdfUrl="getDocumentUrl('cek')"
              :pendingFile="pendingDocuments.cek.file"
              :pendingPreview="pendingDocuments.cek.preview"
              :isUploading="pendingDocuments.cek.uploading"
              @file-selected="(event) => handleDocumentSelect('cek', event)"
              @save="saveDocument('cek')"
              @cancel="cancelDocumentUpload('cek')"
            />
          </div>
        </div>

        <!-- BPJS TAB -->
        <div
          v-if="activeTab === 'bpjs'"
          class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          <!-- Left: Data List (7 cols) -->
          <div class="lg:col-span-7 space-y-4">
            <!-- Data Cards (when data exists) -->
            <div v-if="subModules.bpjs?.length > 0" class="space-y-3">
              <div
                v-for="item in subModules.bpjs"
                :key="item.id_bpjs"
                class="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-6 transition-all group hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md"
              >
                <div
                  class="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-slate-700 pb-3"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 rounded-lg bg-pink-50 dark:bg-pink-900/20 text-pink-600 flex items-center justify-center shrink-0"
                    >
                      <i class="fas fa-heartbeat"></i>
                    </div>
                    <div>
                      <div
                        class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                      >
                        BPJS KETENAGAKERJAAN
                      </div>
                      <h4
                        class="font-bold text-slate-800 dark:text-white text-lg leading-none mt-1"
                      >
                        {{ item.nomor_bpjs || "BPJS" }}
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
                      NO. SERTIFIKAT
                    </div>
                    <div
                      class="text-xs font-mono font-bold text-slate-700 dark:text-slate-200"
                    >
                      {{ item.nomor_sertifikat || "-" }}
                    </div>
                  </div>

                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      NO. PENDAFTARAN
                    </div>
                    <div
                      class="text-xs font-mono font-bold text-slate-700 dark:text-slate-200"
                    >
                      {{ item.nomor_pendaftaran || "-" }}
                    </div>
                  </div>

                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      TGL DITETAPKAN
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200"
                    >
                      {{ item.tanggal_ditetapkan || "-" }}
                    </div>
                  </div>

                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      LOKASI DITETAPKAN
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200"
                    >
                      {{ item.lokasi_ditetapkan || "-" }}
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
                    class="w-10 h-10 rounded-lg bg-pink-50 dark:bg-pink-900/20 text-pink-600 flex items-center justify-center shrink-0 opacity-50"
                  >
                    <i class="fas fa-heartbeat"></i>
                  </div>
                  <div>
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                    >
                      BPJS KETENAGAKERJAAN
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
                    NO. SERTIFIKAT
                  </div>
                  <div
                    class="text-xs font-mono font-bold text-slate-400 dark:text-slate-500"
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
                    NO. PENDAFTARAN
                  </div>
                  <div
                    class="text-xs font-mono font-bold text-slate-400 dark:text-slate-500"
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
                    TGL DITETAPKAN
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
                    LOKASI DITETAPKAN
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
              documentType="bpjs"
              label="BPJS"
              :subtitle="
                selectedItems.bpjs
                  ? `BPJS - ${selectedItems.bpjs.nomor_sertifikat || '-'}`
                  : ''
              "
              icon="fas fa-heartbeat"
              iconColor="pink"
              :existingPdfUrl="getDocumentUrl('bpjs')"
              :pendingFile="pendingDocuments.bpjs.file"
              :pendingPreview="pendingDocuments.bpjs.preview"
              :isUploading="pendingDocuments.bpjs.uploading"
              @file-selected="(event) => handleDocumentSelect('bpjs', event)"
              @save="saveDocument('bpjs')"
              @cancel="cancelDocumentUpload('bpjs')"
            />
          </div>
        </div>

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
        <div
          v-if="activeTab === 'pajak'"
          class="grid grid-cols-1 lg:grid-cols-2 gap-6"
        >
          <!-- Left: NPWP & PKP -->
          <div class="space-y-6">
            <!-- NPWP Compact -->
            <div
              class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5"
            >
              <div
                class="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700 pb-3"
              >
                <h3
                  class="font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-2"
                >
                  <i class="fas fa-id-card text-blue-500"></i> NPWP Perusahaan
                </h3>
                <button
                  v-if="subModules.npwp?.[0]?.npwp_perusahaan_url"
                  @click="openNpwpModal(subModules.npwp[0])"
                  class="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100 transition-colors"
                >
                  <i class="fas fa-file-pdf"></i> View
                </button>
              </div>
              <div v-if="subModules.npwp?.length > 0" class="space-y-2">
                <div
                  v-for="item in subModules.npwp"
                  :key="item.id_npwp_perusahaan"
                >
                  <div
                    class="grid grid-cols-[140px_1fr] gap-2 py-1 border-b border-dashed border-slate-50 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      NOMOR NPWP
                    </div>
                    <div
                      class="text-sm font-mono font-bold text-slate-800 dark:text-white"
                    >
                      {{ item.nomor_npwp }}
                    </div>
                  </div>
                  <div
                    class="grid grid-cols-[140px_1fr] gap-2 py-1 border-b border-dashed border-slate-50 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      NAMA WAJIB PAJAK
                    </div>
                    <div
                      class="text-xs font-bold text-slate-700 dark:text-slate-200"
                    >
                      {{ item.nama_wajib_pajak }}
                    </div>
                  </div>
                  <div
                    class="grid grid-cols-[140px_1fr] gap-2 py-1 border-b border-dashed border-slate-50 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      ALAMAT
                    </div>
                    <div class="text-xs text-slate-600 dark:text-slate-300">
                      {{ item.alamat_npwp }}
                    </div>
                  </div>
                  <div
                    class="grid grid-cols-[140px_1fr] gap-2 py-1 border-b border-dashed border-slate-50 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      KPP
                    </div>
                    <div class="text-xs text-slate-700 dark:text-slate-200">
                      {{ item.kpp || "-" }}
                    </div>
                  </div>
                  <div class="grid grid-cols-[140px_1fr] gap-2 py-1">
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      TGL TERDAFTAR
                    </div>
                    <div class="text-xs text-slate-700 dark:text-slate-200">
                      {{ item.tanggal_terdaftar || "-" }}
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="space-y-2">
                <div
                  class="grid grid-cols-[140px_1fr] gap-2 py-1 border-b border-dashed border-slate-50 dark:border-slate-700"
                >
                  <div
                    class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                  >
                    NOMOR NPWP
                  </div>
                  <div
                    class="text-sm font-mono font-bold text-slate-400 dark:text-slate-500"
                  >
                    -
                  </div>
                </div>
                <div
                  class="grid grid-cols-[140px_1fr] gap-2 py-1 border-b border-dashed border-slate-50 dark:border-slate-700"
                >
                  <div
                    class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                  >
                    NAMA WAJIB PAJAK
                  </div>
                  <div
                    class="text-xs font-bold text-slate-400 dark:text-slate-500"
                  >
                    -
                  </div>
                </div>
                <div
                  class="grid grid-cols-[140px_1fr] gap-2 py-1 border-b border-dashed border-slate-50 dark:border-slate-700"
                >
                  <div
                    class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                  >
                    ALAMAT
                  </div>
                  <div class="text-xs text-slate-400 dark:text-slate-500">
                    -
                  </div>
                </div>
                <div
                  class="grid grid-cols-[140px_1fr] gap-2 py-1 border-b border-dashed border-slate-50 dark:border-slate-700"
                >
                  <div
                    class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                  >
                    KPP
                  </div>
                  <div class="text-xs text-slate-400 dark:text-slate-500">
                    -
                  </div>
                </div>
                <div class="grid grid-cols-[140px_1fr] gap-2 py-1">
                  <div
                    class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                  >
                    TGL TERDAFTAR
                  </div>
                  <div class="text-xs text-slate-400 dark:text-slate-500">
                    -
                  </div>
                </div>
              </div>
            </div>

            <!-- PKP -->
            <div
              class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5"
            >
              <div
                class="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700 pb-3"
              >
                <h3
                  class="font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-2"
                >
                  <i class="fas fa-stamp text-orange-500"></i> Status PKP
                </h3>
                <button
                  v-if="subModules.pkp?.[0]?.url_pkp"
                  @click="openPkpModal(subModules.pkp[0])"
                  class="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100 hover:bg-orange-100 transition-colors"
                >
                  <i class="fas fa-file-pdf"></i> View
                </button>
              </div>
              <div v-if="subModules.pkp?.length > 0">
                <div
                  v-for="item in subModules.pkp"
                  :key="item.id_pkp"
                  class="space-y-4"
                >
                  <div class="flex items-center gap-3">
                    <div
                      class="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center"
                    >
                      <i class="fas fa-check"></i>
                    </div>
                    <div>
                      <div
                        class="text-[10px] font-bold text-slate-400 uppercase"
                      >
                        STATUS
                      </div>
                      <div
                        class="text-sm font-bold text-slate-800 dark:text-white"
                      >
                        {{ item.status || "PKP" }}
                      </div>
                    </div>
                  </div>
                  <div
                    class="space-y-2 mt-2 bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg border border-slate-100 dark:border-slate-700"
                  >
                    <div class="flex justify-between">
                      <span
                        class="text-[10px] font-bold text-slate-500 uppercase"
                        >Nomor PKP</span
                      >
                      <span
                        class="text-xs font-mono font-bold text-slate-700 dark:text-slate-200"
                        >{{ item.nomor_pkp }}</span
                      >
                    </div>
                    <div class="flex justify-between">
                      <span
                        class="text-[10px] font-bold text-slate-500 uppercase"
                        >Tgl Pengukuhan</span
                      >
                      <span
                        class="text-xs font-medium text-slate-700 dark:text-slate-200"
                        >{{ item.tanggal_pengukuhan }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>
              <div v-else>
                <div class="flex items-center gap-3 mb-3">
                  <div
                    class="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-400 flex items-center justify-center opacity-50"
                  >
                    <i class="fas fa-check"></i>
                  </div>
                  <div>
                    <div class="text-[10px] font-bold text-slate-400 uppercase">
                      STATUS
                    </div>
                    <div
                      class="text-sm font-bold text-slate-400 dark:text-slate-500"
                    >
                      -
                    </div>
                  </div>
                </div>
                <div
                  class="space-y-2 mt-2 bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg border border-slate-100 dark:border-slate-700"
                >
                  <div class="flex justify-between">
                    <span class="text-[10px] font-bold text-slate-400 uppercase"
                      >Nomor PKP</span
                    >
                    <span
                      class="text-xs font-mono font-bold text-slate-400 dark:text-slate-500"
                      >-</span
                    >
                  </div>
                  <div class="flex justify-between">
                    <span class="text-[10px] font-bold text-slate-400 uppercase"
                      >Tgl Pengukuhan</span
                    >
                    <span
                      class="text-xs font-medium text-slate-400 dark:text-slate-500"
                      >-</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right: SPT & KSWP -->
          <div class="space-y-6">
            <!-- SPT History Compact -->
            <div
              class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
            >
              <div
                class="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-200 dark:border-slate-700"
              >
                <h3
                  class="font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-2"
                >
                  <i class="fas fa-history text-purple-500"></i> Riwayat SPT
                </h3>
              </div>
              <div
                v-if="subModules.spt?.length > 0"
                class="max-h-[300px] overflow-y-auto"
              >
                <table class="w-full text-xs text-left">
                  <thead
                    class="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold sticky top-0 dark:text-slate-400"
                  >
                    <tr>
                      <th class="px-4 py-2 bg-slate-50 dark:bg-slate-800">
                        Tahun
                      </th>
                      <th class="px-4 py-2 bg-slate-50 dark:bg-slate-800">
                        Jenis
                      </th>
                      <th class="px-4 py-2 bg-slate-50 dark:bg-slate-800">
                        Status
                      </th>
                      <th
                        class="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-right"
                      >
                        #
                      </th>
                    </tr>
                  </thead>
                  <tbody
                    class="divide-y divide-slate-100 dark:divide-slate-700"
                  >
                    <tr
                      v-for="item in subModules.spt"
                      :key="item.id_spt"
                      @click="openSptModal(item)"
                      class="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
                    >
                      <td class="px-4 py-2 font-bold">
                        {{ item.tahun_pajak }}
                      </td>
                      <td class="px-4 py-2">{{ item.jenis_spt }}</td>
                      <td class="px-4 py-2">
                        <span
                          class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-700 border border-green-200"
                          >{{ item.status_spt }}</span
                        >
                      </td>
                      <td class="px-4 py-2 text-right">
                        <button
                          class="text-blue-600 hover:text-blue-700 font-bold"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div v-else>
                <table class="w-full text-xs text-left">
                  <thead
                    class="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold dark:text-slate-400"
                  >
                    <tr>
                      <th class="px-4 py-2 bg-slate-50 dark:bg-slate-800">
                        Tahun
                      </th>
                      <th class="px-4 py-2 bg-slate-50 dark:border-slate-800">
                        Jenis
                      </th>
                      <th class="px-4 py-2 bg-slate-50 dark:bg-slate-800">
                        Status
                      </th>
                      <th
                        class="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-right"
                      >
                        #
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr class="border-b border-slate-100 dark:border-slate-700">
                      <td class="px-4 py-3 font-bold text-slate-400">-</td>
                      <td class="px-4 py-3 text-slate-400">-</td>
                      <td class="px-4 py-3 text-slate-400">-</td>
                      <td class="px-4 py-3 text-right text-slate-400">-</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <!-- KSWP -->
            <div
              class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5"
            >
              <div
                class="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700 pb-3"
              >
                <h3
                  class="font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-2"
                >
                  <i class="fas fa-check-double text-emerald-500"></i> Status
                  KSWP
                </h3>
                <button
                  v-if="subModules.kswp?.[0]?.kswp_url"
                  @click="openKswpModal(subModules.kswp[0])"
                  class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 hover:bg-emerald-100 transition-colors"
                >
                  <i class="fas fa-file-pdf"></i> View
                </button>
              </div>
              <div v-if="subModules.kswp?.length > 0">
                <div
                  v-for="item in subModules.kswp"
                  :key="item.id_kswp"
                  class="space-y-3"
                >
                  <div class="text-center mb-3">
                    <div
                      class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 text-xs"
                    >
                      <i class="fas fa-check-circle"></i>
                      {{ item.status_kswp || "VALID" }}
                    </div>
                  </div>
                  <div
                    class="space-y-2 bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg border border-slate-100 dark:border-slate-700"
                  >
                    <div class="flex justify-between text-[10px]">
                      <span class="font-bold text-slate-500 uppercase"
                        >NIK/NPWP (15)</span
                      >
                      <span
                        class="font-mono font-bold text-slate-700 dark:text-slate-200"
                        >{{ item.nik_npwp15 }}</span
                      >
                    </div>
                    <div class="flex justify-between text-[10px]">
                      <span class="font-bold text-slate-500 uppercase"
                        >NPWP (16)</span
                      >
                      <span
                        class="font-mono font-bold text-slate-700 dark:text-slate-200"
                        >{{ item.npwp16 }}</span
                      >
                    </div>
                    <div class="flex justify-between text-[10px]">
                      <span class="font-bold text-slate-500 uppercase"
                        >Nama WP</span
                      >
                      <span
                        class="text-xs font-semibold text-slate-700 dark:text-slate-200"
                        >{{ item.nama_wp }}</span
                      >
                    </div>
                    <div
                      class="text-[10px] pt-2 border-t border-slate-200 dark:border-slate-600"
                    >
                      <span
                        class="font-bold text-slate-500 uppercase block mb-1"
                        >Alamat</span
                      >
                      <span
                        class="text-xs text-slate-600 dark:text-slate-300"
                        >{{ item.alamat }}</span
                      >
                    </div>
                  </div>
                </div>
              </div>
              <div v-else>
                <div class="text-center mb-3">
                  <div
                    class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 font-bold border border-slate-200 dark:border-slate-600 text-xs opacity-50"
                  >
                    <i class="fas fa-check-circle"></i> -
                  </div>
                </div>
                <div
                  class="space-y-2 bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg border border-slate-100 dark:border-slate-700"
                >
                  <div class="flex justify-between text-[10px]">
                    <span class="font-bold text-slate-400 uppercase"
                      >NIK/NPWP (15)</span
                    >
                    <span
                      class="font-mono font-bold text-slate-400 dark:text-slate-500"
                      >-</span
                    >
                  </div>
                  <div class="flex justify-between text-[10px]">
                    <span class="font-bold text-slate-400 uppercase"
                      >NPWP (16)</span
                    >
                    <span
                      class="font-mono font-bold text-slate-400 dark:text-slate-500"
                      >-</span
                    >
                  </div>
                  <div class="flex justify-between text-[10px]">
                    <span class="font-bold text-slate-400 uppercase"
                      >Nama WP</span
                    >
                    <span
                      class="text-xs font-semibold text-slate-400 dark:text-slate-500"
                      >-</span
                    >
                  </div>
                  <div
                    class="text-[10px] pt-2 border-t border-slate-200 dark:border-slate-600"
                  >
                    <span class="font-bold text-slate-400 uppercase block mb-1"
                      >Alamat</span
                    >
                    <span class="text-xs text-slate-400 dark:text-slate-500"
                      >-</span
                    >
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- 5. NIB TAB - Separate Layout with KBLI Section -->
        <div
          v-if="activeTab === 'nib'"
          class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          <!-- Left: NIB Data + KBLI (7 cols) -->
          <div class="lg:col-span-7 space-y-4">
            <!-- NIB Cards -->
            <div v-if="subModules.nib?.length > 0" class="space-y-3">
              <div
                v-for="(item, idx) in subModules.nib"
                :key="idx"
                class="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-6 transition-all group hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md"
              >
                <div
                  class="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-700"
                >
                  <div
                    class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0"
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
                      class="font-bold text-slate-800 dark:text-white text-lg font-mono leading-none mt-1"
                    >
                      {{ item.nomor_nib || "-" }}
                    </h4>
                  </div>
                </div>

                <!-- NIB Specific Fields -->
                <div class="space-y-0.5 mt-2">
                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
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
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      Status Modal
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200"
                    >
                      {{ item.status_penanaman_modal || "-" }}
                    </div>
                  </div>
                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
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

            <!-- Empty NIB Card -->
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
                    class="font-bold text-slate-400 dark:text-slate-500 text-lg font-mono leading-none mt-1"
                  >
                    -
                  </h4>
                </div>
              </div>

              <div class="space-y-0.5 mt-2">
                <div
                  class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
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
                  class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
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
                  class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
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

            <!-- KBLI Qualifications Section (Separate Card Below NIB) - Compact with Scroll -->
            <div
              class="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 flex flex-col overflow-hidden max-h-[300px]"
            >
              <!-- Header (Fixed) -->
              <div
                class="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 shrink-0"
              >
                <h4
                  class="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between"
                >
                  <span>Kualifikasi KBLI</span>
                  <span
                    v-if="subModules.kbli?.length"
                    class="text-[10px] font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-full"
                  >
                    {{ subModules.kbli.length }} ITEMS
                  </span>
                </h4>
              </div>

              <!-- Content (Scrollable) -->
              <div class="flex-1 overflow-y-auto p-4">
                <!-- Grid Layout (2 Columns) with Consistent Item Heights -->
                <div
                  v-if="subModules.kbli?.length > 0"
                  class="grid grid-cols-1 md:grid-cols-2 gap-3 auto-rows-fr"
                >
                  <div
                    v-for="kbli in subModules.kbli"
                    :key="kbli.id_perusahaan_kbli"
                    class="group relative p-3 rounded-lg border border-slate-100 dark:border-slate-700/50 bg-slate-50 dark:bg-slate-800/50 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500/30 transition-all duration-300 min-h-[60px] flex items-center"
                  >
                    <!-- Active/Primary Indicator -->
                    <div
                      v-if="kbli.is_primary === 'true'"
                      class="absolute -top-1 -right-1 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-white dark:border-slate-800 shadow-sm"
                      title="KBLI Utama"
                    ></div>

                    <div class="flex items-center gap-2 w-full">
                      <!-- Code Badge: Text becomes blue on card hover -->
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
                        <div
                          v-if="kbli.is_primary === 'true'"
                          class="inline-flex items-center gap-1 mt-1"
                        >
                          <i class="fas fa-star text-[8px] text-amber-400"></i>
                          <span
                            class="text-[9px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider"
                            >Primary</span
                          >
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Empty State -->
                <div
                  v-else
                  class="flex flex-col items-center justify-center h-full min-h-[200px] text-center"
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
          </div>

          <!-- Right: PDF Preview (5 cols) -->
          <div class="lg:col-span-5 flex flex-col h-full">
            <div
              class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden h-[520px] sticky top-24"
            >
              <div
                class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 shrink-0"
              >
                <div>
                  <h3
                    class="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 text-sm"
                  >
                    <i class="fas fa-file-pdf text-red-500"></i>
                    Dokumen NIB
                  </h3>
                  <p
                    v-if="selectedItems.nib"
                    class="text-xs text-slate-500 mt-1"
                  >
                    {{ selectedItems.nib.nomor_nib }}
                  </p>
                </div>
                <div class="flex gap-2">
                  <button
                    v-if="getDocumentUrl('nib') && !pendingDocuments.nib?.file"
                    @click="
                      $refs.nibUpdateInput && $refs.nibUpdateInput.click()
                    "
                    class="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-1"
                  >
                    <i class="fas fa-sync-alt"></i>
                    <span>Perbarui</span>
                  </button>
                  <input
                    ref="nibUpdateInput"
                    type="file"
                    accept="application/pdf"
                    @change="handleDocumentSelect('nib', $event)"
                    class="hidden"
                  />
                  <a
                    v-if="getDocumentUrl('nib') && !pendingDocuments.nib?.file"
                    :href="getDocumentUrl('nib')"
                    target="_blank"
                    class="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:border-blue-400 transition-colors"
                  >
                    <i class="fas fa-external-link-alt mr-1"></i> Buka Tab Baru
                  </a>
                </div>
              </div>

              <div class="flex-1 bg-slate-100 dark:bg-slate-900 relative">
                <!-- Existing PDF -->
                <iframe
                  v-if="getDocumentUrl('nib') && !pendingDocuments.nib?.file"
                  :key="'nib-doc'"
                  :src="getPreviewUrl(getDocumentUrl('nib'))"
                  class="w-full h-full absolute inset-0 border-none"
                >
                </iframe>

                <!-- Pending Upload Preview -->
                <div
                  v-else-if="
                    pendingDocuments.nib?.file && pendingDocuments.nib?.preview
                  "
                  class="w-full h-full flex flex-col"
                >
                  <iframe
                    :src="pendingDocuments.nib.preview"
                    class="flex-1 w-full border-none"
                  ></iframe>
                  <div
                    class="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between"
                  >
                    <div class="flex-1 min-w-0">
                      <p
                        class="text-xs font-bold text-slate-700 dark:text-slate-300 truncate"
                      >
                        {{ pendingDocuments.nib.file.name }}
                      </p>
                      <p class="text-xs text-slate-500">
                        {{ formatFileSize(pendingDocuments.nib.file.size) }}
                      </p>
                    </div>
                    <div class="flex gap-2 ml-4">
                      <button
                        @click="cancelDocumentUpload('nib')"
                        :disabled="pendingDocuments.nib.uploading"
                        class="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                      >
                        Batal
                      </button>
                      <button
                        @click="saveDocument('nib')"
                        :disabled="pendingDocuments.nib.uploading"
                        class="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <i
                          v-if="pendingDocuments.nib.uploading"
                          class="fas fa-spinner fa-spin"
                        ></i>
                        <i v-else class="fas fa-save"></i>
                        {{
                          pendingDocuments.nib.uploading
                            ? "Menyimpan..."
                            : "Simpan"
                        }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Upload State (No PDF) -->
                <div
                  v-else
                  class="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  @click="$refs.nibUploadInput && $refs.nibUploadInput.click()"
                >
                  <input
                    ref="nibUploadInput"
                    type="file"
                    accept="application/pdf"
                    @change="handleDocumentSelect('nib', $event)"
                    class="hidden"
                  />
                  <div
                    class="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-500 mb-4"
                  >
                    <i class="fas fa-id-badge text-3xl"></i>
                  </div>
                  <p
                    class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Upload Dokumen NIB
                  </p>
                  <p class="text-xs text-slate-500">
                    Klik untuk pilih file PDF (Max 50MB)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <!-- 6. SBU, KTA, SERTIFIKAT TABS - Redesigned with Complete Info -->
        <!-- Note: Kontrak, Cek, and BPJS now have their own dedicated sections above -->
        <div
          v-if="['sbu', 'kta', 'sertifikat'].includes(activeTab)"
          class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start"
        >
          <!-- Left: Data List (7 cols) -->
          <div class="lg:col-span-7 space-y-4">
            <!-- Data Cards -->
            <div v-if="subModules[activeTab]?.length > 0" class="space-y-3">
              <div
                v-for="(item, idx) in subModules[activeTab]"
                :key="idx"
                @click="
                  activeTab === 'sertifikat'
                    ? selectItem(activeTab, item)
                    : null
                "
                class="bg-white dark:bg-slate-800 rounded-xl border-2 group hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md p-6"
                :class="[
                  activeTab === 'sertifikat' &&
                  selectedItems[activeTab] === item
                    ? 'border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-500/20 cursor-pointer'
                    : 'border-slate-200 dark:border-slate-700',
                  activeTab === 'sertifikat' ? 'cursor-pointer' : '',
                ]"
              >
                <div
                  class="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-700"
                >
                  <div
                    class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0"
                  >
                    <i :class="getTabIcon(activeTab)"></i>
                  </div>
                  <div>
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                    >
                      {{ getTabLabel(activeTab) }}
                    </div>
                    <h4
                      class="font-bold text-slate-800 dark:text-white text-lg font-mono leading-none mt-1"
                    >
                      {{
                        item.nomor_registrasi_lpjk ||
                        item.nomor_anggota ||
                        item.nomor_sertifikat ||
                        "-"
                      }}
                    </h4>
                  </div>
                </div>

                <!-- SBU Specific Fields -->
                <div
                  v-if="activeTab === 'sbu'"
                  class="flex flex-col gap-0.5 mt-2"
                >
                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-50 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      No. PB UMKU
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200 truncate"
                      :title="item.nomor_pb_umku"
                    >
                      {{ item.nomor_pb_umku || "-" }}
                    </div>
                  </div>
                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-50 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      Jenis Usaha
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200 truncate"
                      :title="item.jenis_usaha"
                    >
                      {{ item.jenis_usaha || "-" }}
                    </div>
                  </div>
                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-50 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      Asosiasi
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200 truncate"
                      :title="item.asosiasi"
                    >
                      {{ item.asosiasi || "-" }}
                    </div>
                  </div>
                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-50 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      PJBU
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200 truncate"
                      :title="item.pjbu"
                    >
                      {{ item.pjbu || "-" }}
                    </div>
                  </div>
                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-50 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      PJTBU
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200 truncate"
                      :title="item.pjtbu"
                    >
                      {{ item.pjtbu || "-" }}
                    </div>
                  </div>
                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-50 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      Reg. LPJK
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200 truncate"
                      :title="item.nomor_registrasi_lpjk"
                    >
                      {{ item.nomor_registrasi_lpjk || "-" }}
                    </div>
                  </div>
                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-50 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      Pelaksana
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200 truncate"
                      :title="item.pelaksana_sertifikasi"
                    >
                      {{ item.pelaksana_sertifikasi || "-" }}
                    </div>
                  </div>
                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-50 dark:border-slate-700"
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
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-50 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      Berlaku
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200"
                    >
                      {{ item.masa_berlaku || "-" }}
                    </div>
                  </div>
                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-50 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      Kualifikasi
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200 truncate"
                      :title="item.kualifikasi"
                    >
                      {{ item.kualifikasi || "-" }}
                    </div>
                  </div>
                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-50 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      Subklas
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200 truncate"
                      :title="item.kode_subklasifikasi"
                    >
                      {{ item.kode_subklasifikasi || "-" }}
                    </div>
                  </div>
                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-50 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      Sifat
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200"
                    >
                      {{ item.sifat || "-" }}
                    </div>
                  </div>
                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-50 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      KBLI
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200 truncate"
                      :title="item.kode_kbli"
                    >
                      {{ item.kode_kbli || "-" }}
                    </div>
                  </div>
                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-50 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      PJSKBU
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200 truncate"
                      :title="item.nama_pjskbu"
                    >
                      {{ item.nama_pjskbu || "-" }}
                    </div>
                  </div>
                </div>

                <!-- KTA Specific Fields -->
                <!-- KTA Specific Fields -->
                <div v-else-if="activeTab === 'kta'" class="space-y-0.5 mt-2">
                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      No Anggota
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200"
                    >
                      {{ item.nomor_anggota || "-" }}
                    </div>
                  </div>
                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      Nama Asosiasi
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200"
                    >
                      {{ item.nama_asosiasi || "-" }}
                    </div>
                  </div>
                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      Penanggung Jawab
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200"
                    >
                      {{ item.penanggung_jawab || "-" }}
                    </div>
                  </div>
                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      Jenis Usaha
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200"
                    >
                      {{ item.jenis_usaha || "-" }}
                    </div>
                  </div>
                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      Status
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200"
                    >
                      {{ item.status_keanggotaan || "-" }}
                    </div>
                  </div>
                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
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
                </div>

                <!-- SERTIFIKAT Specific Fields -->
                <!-- SERTIFIKAT Specific Fields -->
                <div
                  v-else-if="activeTab === 'sertifikat'"
                  class="space-y-0.5 mt-2"
                >
                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      No Sertifikat
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200"
                    >
                      {{ item.nomor_sertifikat || "-" }}
                    </div>
                  </div>
                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      Kode KBLI
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200"
                    >
                      {{ item.kode_kbli || "-" }}
                    </div>
                  </div>
                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      Lembaga
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200"
                    >
                      {{ item.lembaga_verifikasi || "-" }}
                    </div>
                  </div>
                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      Klasifikasi Risiko
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200"
                    >
                      {{ item.klasifikasi_risiko || "-" }}
                    </div>
                  </div>
                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      Status
                    </div>
                    <div
                      class="text-xs font-medium text-slate-700 dark:text-slate-200"
                    >
                      {{ item.status_pemenuhan || "-" }}
                    </div>
                  </div>
                </div>

                <!-- Selection Indicator (Only for Sertifikat) -->
                <div
                  v-if="
                    activeTab === 'sertifikat' &&
                    selectedItems[activeTab] === item
                  "
                  class="mt-4 pt-3 border-t border-blue-100 dark:border-blue-900/30 flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold"
                >
                  <i class="fas fa-check-circle"></i>
                  <span>PREVIEWING DOCUMENT</span>
                </div>
              </div>
            </div>

            <!-- Empty State Card -->
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
                  <i :class="getTabIcon(activeTab)"></i>
                </div>
                <div>
                  <div
                    class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                  >
                    {{ getTabLabel(activeTab) }}
                  </div>
                  <h4
                    class="font-bold text-slate-400 dark:text-slate-500 text-lg font-mono leading-none mt-1"
                  >
                    -
                  </h4>
                </div>
              </div>

              <div class="space-y-0.5 mt-2">
                <template v-if="activeTab === 'sbu'">
                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      No. PB UMKU
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
                      Jenis Usaha
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
                      Asosiasi
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
                      PJBU
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
                      PJTBU
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
                      Reg. LPJK
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
                      Pelaksana
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
                      Tgl Terbit
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
                      Berlaku
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
                      Kualifikasi
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
                      Subklas
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
                      Sifat
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
                      KBLI
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
                      PJSKBU
                    </div>
                    <div
                      class="text-xs font-medium text-slate-400 dark:text-slate-500"
                    >
                      -
                    </div>
                  </div>
                </template>

                <template v-else-if="activeTab === 'kta'">
                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      No Anggota
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
                      Nama Asosiasi
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
                      Penanggung Jawab
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
                      Jenis Usaha
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
                      Status
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
                      Tgl Terbit
                    </div>
                    <div
                      class="text-xs font-medium text-slate-400 dark:text-slate-500"
                    >
                      -
                    </div>
                  </div>
                </template>

                <template v-else-if="activeTab === 'sertifikat'">
                  <div
                    class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
                  >
                    <div
                      class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
                    >
                      No Sertifikat
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
                      Kode KBLI
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
                      Lembaga
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
                      Klasifikasi Risiko
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
                      Status
                    </div>
                    <div
                      class="text-xs font-medium text-slate-400 dark:text-slate-500"
                    >
                      -
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- Right: PDF Preview (5 cols) -->
          <div class="lg:col-span-5 flex flex-col h-full">
            <div
              class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden h-[520px] sticky top-24"
            >
              <div
                class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 shrink-0"
              >
                <div>
                  <h3
                    class="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 text-sm"
                  >
                    <i class="fas fa-file-pdf text-red-500"></i>
                    Dokumen {{ getTabLabel(activeTab) }}
                  </h3>
                  <p
                    v-if="selectedItems[activeTab]"
                    class="text-xs text-slate-500 mt-1"
                  >
                    {{
                      selectedItems[activeTab].nomor_nib ||
                      selectedItems[activeTab].nomor_registrasi_lpjk ||
                      selectedItems[activeTab].nomor_anggota ||
                      selectedItems[activeTab].nomor_sertifikat
                    }}
                  </p>
                </div>
                <div class="flex gap-2">
                  <button
                    v-if="
                      getDocumentUrl(activeTab) &&
                      !pendingDocuments[activeTab]?.file
                    "
                    @click="
                      $refs[`${activeTab}UpdateInput`] &&
                        $refs[`${activeTab}UpdateInput`].click()
                    "
                    class="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-1"
                  >
                    <i class="fas fa-sync-alt"></i>
                    <span>Perbarui</span>
                  </button>
                  <input
                    :ref="`${activeTab}UpdateInput`"
                    type="file"
                    accept="application/pdf"
                    @change="handleDocumentSelect(activeTab, $event)"
                    class="hidden"
                  />
                  <a
                    v-if="
                      getDocumentUrl(activeTab) &&
                      !pendingDocuments[activeTab]?.file
                    "
                    :href="getDocumentUrl(activeTab)"
                    target="_blank"
                    class="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:border-blue-400 transition-colors"
                  >
                    <i class="fas fa-external-link-alt mr-1"></i> Buka Tab Baru
                  </a>
                </div>
              </div>

              <div class="flex-1 bg-slate-100 dark:bg-slate-900 relative">
                <!-- Existing PDF -->
                <iframe
                  v-if="
                    getDocumentUrl(activeTab) &&
                    !pendingDocuments[activeTab]?.file
                  "
                  :key="`${activeTab}-doc`"
                  :src="getPreviewUrl(getDocumentUrl(activeTab))"
                  class="w-full h-full absolute inset-0 border-none"
                ></iframe>

                <!-- Pending Upload Preview -->
                <div
                  v-else-if="
                    pendingDocuments[activeTab]?.file &&
                    pendingDocuments[activeTab]?.preview
                  "
                  class="w-full h-full flex flex-col"
                >
                  <iframe
                    :src="pendingDocuments[activeTab].preview"
                    class="flex-1 w-full border-none"
                  ></iframe>
                  <div
                    class="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between"
                  >
                    <div class="flex-1 min-w-0">
                      <p
                        class="text-xs font-bold text-slate-700 dark:text-slate-300 truncate"
                      >
                        {{ pendingDocuments[activeTab].file.name }}
                      </p>
                      <p class="text-xs text-slate-500">
                        {{
                          formatFileSize(pendingDocuments[activeTab].file.size)
                        }}
                      </p>
                    </div>
                    <div class="flex gap-2 ml-4">
                      <button
                        @click="cancelDocumentUpload(activeTab)"
                        :disabled="pendingDocuments[activeTab].uploading"
                        class="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                      >
                        Batal
                      </button>
                      <button
                        @click="saveDocument(activeTab)"
                        :disabled="pendingDocuments[activeTab].uploading"
                        class="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                      >
                        <i
                          v-if="pendingDocuments[activeTab].uploading"
                          class="fas fa-spinner fa-spin"
                        ></i>
                        <i v-else class="fas fa-save"></i>
                        {{
                          pendingDocuments[activeTab].uploading
                            ? "Menyimpan..."
                            : "Simpan"
                        }}
                      </button>
                    </div>
                  </div>
                </div>

                <!-- Upload State (No PDF) -->
                <div
                  v-else
                  class="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
                  @click="
                    $refs[`${activeTab}UploadInput`] &&
                      $refs[`${activeTab}UploadInput`].click()
                  "
                >
                  <input
                    :ref="`${activeTab}UploadInput`"
                    type="file"
                    accept="application/pdf"
                    @change="handleDocumentSelect(activeTab, $event)"
                    class="hidden"
                  />
                  <div
                    class="w-20 h-20 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-500 mb-4"
                  >
                    <i :class="getTabIcon(activeTab)" class="text-3xl"></i>
                  </div>
                  <p
                    class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1"
                  >
                    Upload Dokumen {{ getTabLabel(activeTab) }}
                  </p>
                  <p class="text-xs text-slate-500">
                    Klik untuk pilih file PDF (Max 50MB)
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
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
          <!-- Select Personil -->
          <div class="group">
            <label
              class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2"
            >
              <i class="fas fa-user text-slate-400 mr-2"></i>
              Pilih Personil <span class="text-red-500">*</span>
            </label>
            <select
              v-model="pejabatFormData.id_personel"
              class="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all"
              :class="
                pejabatFormData.id_personel
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-400'
              "
            >
              <option value="" disabled>-- Pilih Personil --</option>
              <option
                v-for="person in personilList"
                :key="person.id_personel"
                :value="person.id_personel"
              >
                {{ person.nama_lengkap }}
              </option>
            </select>
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

    <ToastNotification />
  </div>
</template>

<script setup>
import BaseModal from "~/components/BaseModal.vue";
import ToastNotification from "~/components/ToastNotification.vue";
import FormInput from "~/components/FormInput.vue";
import DocumentPdfPreview from "~/components/DocumentPdfPreview.vue";

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

// Tabs Configuration (Re-ordered & Renamed) - Pejabat removed, moved to Overview
const tabs = [
  { id: "overview", label: "Overview", icon: "fas fa-th-large", count: null },
  { id: "akta", label: "Akta", icon: "fas fa-file-contract", count: 0 },
  { id: "nib", label: "NIB", icon: "fas fa-id-badge", count: 0 },
  { id: "sbu", label: "SBU", icon: "fas fa-certificate", count: 0 },
  { id: "kta", label: "KTA", icon: "fas fa-id-card-alt", count: 0 },
  { id: "sertifikat", label: "Sertifikat", icon: "fas fa-award", count: 0 },
  { id: "pajak", label: "Data Pajak", icon: "fas fa-wallet", count: 0 }, // Grouped
  { id: "kontrak", label: "Pengalaman", icon: "fas fa-briefcase", count: 0 },
  { id: "cek", label: "Cek", icon: "fas fa-money-check", count: 0 }, // Bank checks
  { id: "bpjs", label: "BPJS", icon: "fas fa-hospital", count: 0 }, // BPJS
];

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
    // Convert view/edit link to preview link for iframe
    return url.replace(/\/view.*$/, "/preview");
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
  return urlMap[tabId] || item.url_dokumen || item.kontrak_url || "";
};

// Select item for PDF preview
const selectItem = (tabId, item) => {
  selectedItems.value[tabId] = item;
};

// Fetch Logic
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
      tabs.find((t) => t.id === "akta").count = subModules.value.akta.length;
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
      tabs.find((t) => t.id === "nib").count = subModules.value.nib.length;
      if (subModules.value.nib.length)
        selectedItems.value.nib = subModules.value.nib[0];
      console.log("✅ NIB Data loaded:", subModules.value.nib.length, "items");
      console.log(
        "✅ KBLI Data loaded from NIB:",
        subModules.value.kbli.length,
        "items"
      );
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
      tabs.find((t) => t.id === "sbu").count = subModules.value.sbu.length;
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
      tabs.find((t) => t.id === "kta").count = subModules.value.kta.length;
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
      tabs.find((t) => t.id === "sertifikat").count =
        subModules.value.sertifikat.length;
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
      tabs.find((t) => t.id === "kontrak").count =
        subModules.value.kontrak.length;
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
      tabs.find((t) => t.id === "cek").count = subModules.value.cek.length;
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
      tabs.find((t) => t.id === "bpjs").count = subModules.value.bpjs.length;
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

watch(activeTab, async (newTab) => {
  // Skip if already loaded
  if (loadedTabs.value.includes(newTab)) return;

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

    // Mark tab as loaded
    loadedTabs.value.push(newTab);
  } finally {
    loadingTab.value = false;
  }
});

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
      personilList.value = await res.json();
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

    // Close modal
    closeAddPejabatModal();

    // Refresh pejabat data
    await fetchPejabat();
  } catch (error) {
    console.error("❌ Error saving pejabat:", error);
    toast.error("Gagal menambahkan pejabat: " + error.message);
  } finally {
    isSubmittingPejabat.value = false;
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

    // Refresh company data
    await fetchCompanyDetail();
    closeContactModal();
  } catch (error) {
    console.error("Error saving contact:", error);
    toast.error("Gagal menyimpan data: " + error.message);
  } finally {
    isSubmittingContact.value = false;
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
</style>
