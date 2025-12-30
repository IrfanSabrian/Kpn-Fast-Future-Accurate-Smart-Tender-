<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 font-sans">
    <!-- Background Tech Grid Pattern -->
    <div
      class="fixed inset-0 z-0 pointer-events-none opacity-[0.03]"
      style="
        background-image: radial-gradient(#475569 1px, transparent 1px);
        background-size: 24px 24px;
      "
    ></div>

    <!-- Header Section -->
    <div class="relative z-10 max-w-7xl mx-auto mb-8">
      <div
        class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800"
      >
        <div>
          <h1
            class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight"
          >
            Database <span class="text-blue-600">Perusahaan</span>
          </h1>
          <p
            class="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium max-w-xl"
          >
            Sistem manajemen data legalitas & profil perusahaan terintegrasi.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <div class="hidden md:block text-right mr-2">
            <div
              class="text-xs font-bold text-slate-400 uppercase tracking-widest"
            >
              Total Data
            </div>
            <div
              class="text-xl font-mono font-bold text-slate-700 dark:text-slate-200"
            >
              {{ companies.length }}
            </div>
          </div>
          <!-- Add Company Button -->
          <button
            @click="isModalOpen = true"
            class="group relative px-6 py-3 bg-gradient-to-br from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-sm font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all duration-300 transform hover:-translate-y-0.5 overflow-hidden"
          >
            <div
              class="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 skew-y-12"
            ></div>
            <div class="relative flex items-center gap-3">
              <div
                class="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white/30 transition-colors"
              >
                <i class="fas fa-plus text-xs"></i>
              </div>
              <span class="tracking-wide">Tambah Perusahaan</span>
            </div>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <!-- Loading State Skeleton -->
    <div
      v-if="loading"
      class="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
    >
      <div
        v-for="i in 8"
        :key="i"
        class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 space-y-4"
      >
        <div class="flex items-center gap-4">
          <BaseSkeleton width="3rem" height="3rem" class-name="rounded-md" />
          <div class="space-y-2 flex-1">
            <BaseSkeleton width="20%" height="0.8rem" />
            <BaseSkeleton width="80%" height="1rem" />
          </div>
        </div>
        <div class="space-y-3 pt-2">
          <BaseSkeleton width="100%" height="0.8rem" />
          <BaseSkeleton width="70%" height="0.8rem" />
          <BaseSkeleton width="50%" height="0.8rem" />
        </div>
      </div>
    </div>

    <!-- Companies Grid (Compact Mode) -->
    <div
      v-else-if="companies.length > 0"
      class="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
    >
      <div
        v-for="company in companies"
        :key="company.id_perusahaan"
        class="group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden cursor-pointer"
        @click="navigateToDetail(company.id_perusahaan)"
      >
        <!-- Top Accent Line -->
        <div
          class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-800 group-hover:from-blue-500 group-hover:to-cyan-400 transition-all duration-300"
        ></div>

        <div class="p-5 flex flex-col h-full relative">
          <!-- Action Buttons (Top Right - Always Visible on Hover) -->
          <div
            class="absolute top-3 right-3 z-20 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all duration-200 transform translate-y-1 group-hover:translate-y-0"
          >
            <button
              @click.stop="openEditModal(company)"
              class="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 dark:bg-slate-700/90 text-blue-600 hover:bg-blue-50 dark:hover:bg-slate-600 shadow-sm backdrop-blur-sm border border-slate-200 dark:border-slate-600 hover:scale-105 transition-all duration-200"
              title="Edit Perusahaan"
            >
              <i class="fas fa-pen text-xs"></i>
            </button>
            <button
              @click.stop="openDeleteConfirm(company)"
              class="w-8 h-8 flex items-center justify-center rounded-full bg-white/90 dark:bg-slate-700/90 text-red-500 hover:bg-red-50 dark:hover:bg-slate-600 shadow-sm backdrop-blur-sm border border-slate-200 dark:border-slate-600 hover:scale-105 transition-all duration-200"
              title="Hapus Perusahaan"
            >
              <i class="fas fa-trash-alt text-xs"></i>
            </button>
          </div>

          <!-- Card Header layout -->
          <div class="flex items-start gap-4 mb-4">
            <!-- Compact Logo -->
            <div
              class="flex-shrink-0 w-14 h-14 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 flex items-center justify-center overflow-hidden shadow-sm p-1"
            >
              <img
                v-if="shouldShowLogo(company)"
                :src="getCompanyLogoUrl(company)"
                :alt="company.nama_perusahaan"
                class="w-full h-full object-contain"
                @error="(e) => handleImageError(e, company)"
              />
              <div
                v-else
                class="w-full h-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center rounded-lg"
              >
                <span
                  class="text-xs font-bold text-slate-400 tracking-tighter"
                  >{{ getInitials(company.nama_perusahaan) }}</span
                >
              </div>
            </div>

            <div class="flex-grow min-w-0 pt-0.5">
              <div class="flex items-center gap-2 mb-1">
                <span
                  class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border"
                  :class="
                    company.status === 'Pusat'
                      ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800'
                      : 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-700/30 dark:text-slate-400 dark:border-slate-600'
                  "
                >
                  {{ company.status || "PUSAT" }}
                </span>
              </div>
              <h3
                class="text-base font-bold text-slate-800 dark:text-gray-100 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors"
                :title="company.nama_perusahaan"
              >
                {{ company.nama_perusahaan }}
              </h3>
            </div>
          </div>

          <!-- Compact Details -->
          <div class="space-y-2.5 flex-grow">
            <!-- Email -->
            <div
              class="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400"
            >
              <div class="w-5 flex justify-center">
                <i class="fas fa-envelope text-slate-400"></i>
              </div>
              <span class="truncate font-medium">{{
                company.email || "-"
              }}</span>
            </div>
            <!-- Phone -->
            <div
              class="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400"
            >
              <div class="w-5 flex justify-center">
                <i class="fas fa-phone text-slate-400"></i>
              </div>
              <span class="truncate font-medium">{{
                company.no_telp || "-"
              }}</span>
            </div>
            <!-- Est -->
            <div
              class="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400"
            >
              <div class="w-5 flex justify-center">
                <i class="fas fa-history text-slate-400"></i>
              </div>
              <span class="truncate font-medium"
                >Est. {{ company.tahun_berdiri || "N/A" }}</span
              >
            </div>
          </div>

          <!-- Hover Indicator (Arrow) -->
          <div
            class="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0"
          >
            <i class="fas fa-arrow-right text-blue-500 text-lg"></i>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty Tech State -->
    <div
      v-else
      class="relative z-10 max-w-sm mx-auto mt-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-10"
    >
      <div
        class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400"
      >
        <i class="fas fa-database text-2xl"></i>
      </div>
      <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">
        Database Kosong
      </h3>
      <p class="text-sm text-slate-500 mb-6">
        Belum ada entitas perusahaan terdaftar dalam sistem.
      </p>
    </div>

    <!-- Add Company Modal -->
    <BaseModal
      :show="isModalOpen"
      title="Tambah Perusahaan"
      max-width="4xl"
      @close="closeModal"
    >
      <template #default>
        <div class="px-1">
          <!-- Info Block -->
          <div
            class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-start gap-4 mb-6 border border-blue-100 dark:border-blue-800"
          >
            <div
              class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-300"
            >
              <i class="fas fa-building text-lg"></i>
            </div>
            <div>
              <h4
                class="text-sm font-bold text-blue-800 dark:text-blue-300 mb-1"
              >
                Data Perusahaan
              </h4>
              <p
                class="text-xs text-blue-600 dark:text-blue-400 leading-relaxed"
              >
                Lengkapi profil perusahaan.
              </p>
            </div>
          </div>

          <div class="flex flex-col lg:flex-row gap-6">
            <!-- Left Column: Inputs (2/3 width) -->
            <div class="flex-1 space-y-5">
              <!-- Nama Perusahaan -->
              <div class="group">
                <label
                  class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors group-focus-within:text-blue-600"
                >
                  Nama Perusahaan
                  <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <div
                    class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                  >
                    <i
                      class="fas fa-building text-slate-400 group-focus-within:text-blue-500 transition-colors"
                    ></i>
                  </div>
                  <input
                    v-model="formData.nama_perusahaan"
                    type="text"
                    placeholder="Contoh: CV. Karya Profesional Nusantara"
                    class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>
              </div>

              <!-- Phone & Email Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="group">
                  <label
                    class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors group-focus-within:text-blue-600"
                    >No. Telepon</label
                  >
                  <div class="relative">
                    <div
                      class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                    >
                      <i
                        class="fas fa-phone text-slate-400 group-focus-within:text-blue-500 transition-colors"
                      ></i>
                    </div>
                    <input
                      v-model="formData.no_telp"
                      type="tel"
                      placeholder="08123456789"
                      class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                    />
                  </div>
                </div>
                <div class="group">
                  <label
                    class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors group-focus-within:text-blue-600"
                    >Email</label
                  >
                  <div class="relative">
                    <div
                      class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                    >
                      <i
                        class="fas fa-envelope text-slate-400 group-focus-within:text-blue-500 transition-colors"
                      ></i>
                    </div>
                    <input
                      v-model="formData.email"
                      type="email"
                      placeholder="info@perusahaan.com"
                      class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <!-- Year & Status Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="group">
                  <label
                    class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors group-focus-within:text-blue-600"
                    >Tahun Berdiri</label
                  >
                  <div class="relative">
                    <div
                      class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                    >
                      <i
                        class="fas fa-history text-slate-400 group-focus-within:text-blue-500 transition-colors"
                      ></i>
                    </div>
                    <input
                      v-model="formData.tahun_berdiri"
                      type="number"
                      min="1900"
                      :max="new Date().getFullYear()"
                      placeholder="2024"
                      class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                    />
                  </div>
                </div>
                <div class="group">
                  <label
                    class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors group-focus-within:text-blue-600"
                    >Status</label
                  >
                  <div class="relative">
                    <div
                      class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                    >
                      <i
                        class="fas fa-map-marker-alt text-slate-400 group-focus-within:text-blue-500 transition-colors"
                      ></i>
                    </div>
                    <select
                      v-model="formData.status"
                      class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm appearance-none"
                    >
                      <option value="Pusat">Pusat</option>
                      <option value="Cabang">Cabang</option>
                    </select>
                    <div
                      class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500"
                    >
                      <i class="fas fa-chevron-down text-xs"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column: Logo & Kop Upload (1/3 width) -->
            <div class="w-full lg:w-72 flex-shrink-0 space-y-5">
              <!-- Logo Upload -->
              <div class="group flex flex-col">
                <label
                  class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors group-focus-within:text-blue-600"
                >
                  Logo Perusahaan
                </label>
                <div
                  class="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 text-center hover:border-blue-500 transition-all cursor-pointer bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center h-[250px]"
                  @click="$refs.logoInput.click()"
                  @dragover.prevent="isDragging = true"
                  @dragleave.prevent="isDragging = false"
                  @drop.prevent="handleFileDrop"
                  :class="{
                    'border-blue-500 bg-blue-50 dark:bg-blue-900/10':
                      isDragging,
                  }"
                >
                  <input
                    ref="logoInput"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    @change="handleFileChange"
                    class="hidden"
                  />
                  <div v-if="!logoPreview" class="space-y-3">
                    <div
                      class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto text-blue-500"
                    >
                      <i class="fas fa-cloud-upload-alt text-xl"></i>
                    </div>
                    <div class="space-y-1">
                      <p
                        class="text-sm font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Upload Logo
                      </p>
                      <p class="text-[10px] text-slate-500">Max 50MB</p>
                    </div>
                  </div>
                  <div
                    v-else
                    class="w-full h-full flex flex-col items-center justify-between"
                  >
                    <div
                      class="relative flex-1 w-full rounded-lg border border-slate-200 dark:border-slate-600 p-2 bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden mb-2"
                    >
                      <img
                        :src="logoPreview"
                        alt="Logo Preview"
                        class="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div
                      class="w-full flex items-center justify-between gap-2 px-1"
                    >
                      <div class="flex-1 text-left min-w-0">
                        <p
                          class="text-xs font-bold text-slate-700 dark:text-slate-300 truncate"
                        >
                          {{ logoFile.name }}
                        </p>
                        <p class="text-[10px] text-slate-500">
                          {{ formatFileSize(logoFile.size) }}
                        </p>
                      </div>
                      <button
                        type="button"
                        @click.stop="clearLogo"
                        class="w-6 h-6 rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 flex items-center justify-center transition-colors shadow-sm"
                        title="Hapus Logo"
                      >
                        <i class="fas fa-trash-alt text-[10px]"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            @click="closeModal"
            class="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
            :disabled="isSubmitting"
          >
            Batal
          </button>
          <button
            @click="handleSubmit"
            :disabled="!formData.nama_perusahaan || isSubmitting"
            class="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform active:scale-95"
          >
            <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-save"></i>
            {{ isSubmitting ? "Menyimpan..." : "Simpan Perusahaan" }}
          </button>
        </div>
      </template>
    </BaseModal>

    <!-- Edit Company Modal -->
    <BaseModal
      :show="isEditModalOpen"
      title="Edit Perusahaan"
      max-width="4xl"
      @close="closeEditModal"
    >
      <template #default>
        <div class="px-1">
          <!-- Info Block -->
          <div
            class="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl flex items-start gap-4 mb-6 border border-amber-100 dark:border-amber-800"
          >
            <div
              class="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-800 flex items-center justify-center flex-shrink-0 text-amber-600 dark:text-amber-300"
            >
              <i class="fas fa-edit text-lg"></i>
            </div>
            <div>
              <h4
                class="text-sm font-bold text-amber-800 dark:text-amber-300 mb-1"
              >
                Update Data
              </h4>
              <p
                class="text-xs text-amber-600 dark:text-amber-400 leading-relaxed"
              >
                Data yang diubah akan langsung tersimpan.
              </p>
            </div>
          </div>

          <div class="flex flex-col lg:flex-row gap-6">
            <!-- Left Column: Inputs (2/3 width) -->
            <div class="flex-1 space-y-5">
              <!-- Nama Perusahaan -->
              <div class="group">
                <label
                  class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors group-focus-within:text-blue-600"
                >
                  Nama Perusahaan
                  <span class="text-red-500">*</span>
                </label>
                <div class="relative">
                  <div
                    class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                  >
                    <i
                      class="fas fa-building text-slate-400 group-focus-within:text-blue-500 transition-colors"
                    ></i>
                  </div>
                  <input
                    v-model="editFormData.nama_perusahaan"
                    type="text"
                    placeholder="Contoh: CV. Karya Profesional Nusantara"
                    class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                  />
                </div>
              </div>

              <!-- Phone & Email Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="group">
                  <label
                    class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors group-focus-within:text-blue-600"
                    >No. Telepon</label
                  >
                  <div class="relative">
                    <div
                      class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                    >
                      <i
                        class="fas fa-phone text-slate-400 group-focus-within:text-blue-500 transition-colors"
                      ></i>
                    </div>
                    <input
                      v-model="editFormData.no_telp"
                      type="tel"
                      placeholder="08123456789"
                      class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                    />
                  </div>
                </div>
                <div class="group">
                  <label
                    class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors group-focus-within:text-blue-600"
                    >Email</label
                  >
                  <div class="relative">
                    <div
                      class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                    >
                      <i
                        class="fas fa-envelope text-slate-400 group-focus-within:text-blue-500 transition-colors"
                      ></i>
                    </div>
                    <input
                      v-model="editFormData.email"
                      type="email"
                      placeholder="info@perusahaan.com"
                      class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                    />
                  </div>
                </div>
              </div>

              <!-- Year & Status Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="group">
                  <label
                    class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors group-focus-within:text-blue-600"
                    >Tahun Berdiri</label
                  >
                  <div class="relative">
                    <div
                      class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                    >
                      <i
                        class="fas fa-history text-slate-400 group-focus-within:text-blue-500 transition-colors"
                      ></i>
                    </div>
                    <input
                      v-model="editFormData.tahun_berdiri"
                      type="number"
                      min="1900"
                      :max="new Date().getFullYear()"
                      placeholder="2024"
                      class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                    />
                  </div>
                </div>
                <div class="group">
                  <label
                    class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors group-focus-within:text-blue-600"
                    >Status</label
                  >
                  <div class="relative">
                    <div
                      class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
                    >
                      <i
                        class="fas fa-map-marker-alt text-slate-400 group-focus-within:text-blue-500 transition-colors"
                      ></i>
                    </div>
                    <select
                      v-model="editFormData.status"
                      class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm appearance-none"
                    >
                      <option value="Pusat">Pusat</option>
                      <option value="Cabang">Cabang</option>
                    </select>
                    <div
                      class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-500"
                    >
                      <i class="fas fa-chevron-down text-xs"></i>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Column: Logo & Kop Upload (1/3 width) -->
            <div class="w-full lg:w-72 flex-shrink-0 space-y-5">
              <!-- Logo Upload -->
              <div class="group flex flex-col">
                <label
                  class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors group-focus-within:text-blue-600"
                >
                  Logo Perusahaan
                </label>
                <div
                  class="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-xl p-4 text-center hover:border-blue-500 transition-all cursor-pointer bg-slate-50 dark:bg-slate-800/50 flex flex-col items-center justify-center h-[250px]"
                  @click="$refs.logoInput.click()"
                  @dragover.prevent="isDragging = true"
                  @dragleave.prevent="isDragging = false"
                  @drop.prevent="handleFileDrop"
                  :class="{
                    'border-blue-500 bg-blue-50 dark:bg-blue-900/10':
                      isDragging,
                  }"
                >
                  <input
                    ref="logoInput"
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    @change="handleFileChange"
                    class="hidden"
                  />
                  <div v-if="!logoPreview" class="space-y-3">
                    <div
                      class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center mx-auto text-blue-500"
                    >
                      <i class="fas fa-cloud-upload-alt text-xl"></i>
                    </div>
                    <div class="space-y-1">
                      <p
                        class="text-sm font-semibold text-slate-700 dark:text-slate-300"
                      >
                        Upload Logo
                      </p>
                      <p class="text-[10px] text-slate-500">Max 50MB</p>
                    </div>
                  </div>
                  <div
                    v-else
                    class="w-full h-full flex flex-col items-center justify-between"
                  >
                    <div
                      class="relative flex-1 w-full rounded-lg border border-slate-200 dark:border-slate-600 p-2 bg-white dark:bg-slate-800 flex items-center justify-center overflow-hidden mb-2"
                    >
                      <img
                        :src="logoPreview"
                        alt="Logo Preview"
                        class="max-w-full max-h-full object-contain"
                      />
                    </div>
                    <div
                      class="w-full flex items-center justify-between gap-2 px-1"
                    >
                      <div class="flex-1 text-left min-w-0">
                        <p
                          v-if="logoFile"
                          class="text-xs font-bold text-slate-700 dark:text-slate-300 truncate"
                        >
                          {{ logoFile.name }}
                        </p>
                        <p
                          v-else
                          class="text-xs font-bold text-slate-700 dark:text-slate-300 truncate"
                        >
                          Logo Existing
                        </p>
                        <p v-if="logoFile" class="text-[10px] text-slate-500">
                          {{ formatFileSize(logoFile.size) }}
                        </p>
                        <p v-else class="text-[10px] text-slate-500">
                          Sudah terupload
                        </p>
                      </div>
                      <button
                        type="button"
                        @click.stop="clearLogo"
                        class="w-6 h-6 rounded-full bg-red-50 hover:bg-red-100 text-red-500 hover:text-red-600 flex items-center justify-center transition-colors shadow-sm"
                        :title="logoFile ? 'Hapus Logo' : 'Ganti Logo'"
                      >
                        <i
                          :class="
                            logoFile ? 'fas fa-trash-alt' : 'fas fa-sync-alt'
                          "
                          class="text-[10px]"
                        ></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3 pt-2">
          <button
            type="button"
            @click="closeEditModal"
            class="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
            :disabled="isSubmitting"
          >
            Batal
          </button>
          <button
            @click="handleEdit"
            :disabled="!editFormData.nama_perusahaan || isSubmitting"
            class="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform active:scale-95"
          >
            <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-save"></i>
            {{ isSubmitting ? "Menyimpan..." : "Simpan Perubahan" }}
          </button>
        </div>
      </template>
    </BaseModal>

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      :show="isDeleteModalOpen"
      title="Hapus Perusahaan?"
      :message="`Apakah Anda yakin ingin menghapus ${companyToDelete?.nama_perusahaan}? Data yang dihapus tidak dapat dikembalikan.`"
      confirm-text="Ya, Hapus"
      cancel-text="Batal"
      loading-text="Menghapus..."
      :loading="isDeleting"
      type="danger"
      @confirm="handleDelete"
      @cancel="closeDeleteModal"
    />

    <!-- Toast Notification -->
    <BaseToast
      :show="toast.show"
      :type="toast.type"
      :title="toast.title"
      :message="toast.message"
      :duration="toast.duration"
      @close="hideToast"
    />
  </div>
</template>

<script setup>
import BaseToast from "~/components/BaseToast.vue";
import BaseSkeleton from "~/components/BaseSkeleton.vue";
import BaseModal from "~/components/BaseModal.vue";
import ConfirmDialog from "~/components/ConfirmDialog.vue";

definePageMeta({
  layout: "dashboard",
});

const config = useRuntimeConfig();
const apiBaseUrl = config.public.apiBaseUrl;
const router = useRouter();

// Use toast composable
const { toast, success, error: showError, hideToast, info } = useToast();

const loading = ref(true);
const companies = ref([]);
const imageErrors = ref({});

// Modal state
const isModalOpen = ref(false);
const isEditModalOpen = ref(false);
const isDeleteModalOpen = ref(false);
const isSubmitting = ref(false);
const isDeleting = ref(false);
const isDragging = ref(false);
const companyToDelete = ref(null);
const companyToEdit = ref(null);

// Form data
const formData = ref({
  nama_perusahaan: "",
  no_telp: "",
  email: "",
  tahun_berdiri: "",
  status: "Pusat",
});

const editFormData = ref({
  nama_perusahaan: "",
  no_telp: "",
  email: "",
  tahun_berdiri: "",
  status: "Pusat",
});

// Logo handling
const logoFile = ref(null);
const logoPreview = ref("");

// === Modal Functions ===

const closeModal = () => {
  if (!isSubmitting.value) {
    isModalOpen.value = false;
    resetForm();
  }
};

const resetForm = () => {
  formData.value = {
    nama_perusahaan: "",
    no_telp: "",
    email: "",
    tahun_berdiri: "",
    status: "Pusat",
  };
  logoFile.value = null;
  logoPreview.value = "";
  isDragging.value = false;
};

// === File Upload Functions ===

const handleFileChange = (event) => {
  const file = event.target.files[0];
  if (file) {
    processLogoFile(file);
  }
};

const handleFileDrop = (event) => {
  isDragging.value = false;
  const file = event.dataTransfer.files[0];
  if (file) {
    // Validate file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/gif",
      "image/webp",
    ];
    if (!allowedTypes.includes(file.type)) {
      showError("Format file tidak valid. Gunakan JPG, PNG, GIF, atau WEBP.");
      return;
    }
    processLogoFile(file);
  }
};

const processLogoFile = (file) => {
  // Validate file size (50MB)
  const maxSize = 50 * 1024 * 1024;
  if (file.size > maxSize) {
    showError("Ukuran file terlalu besar. Maksimal 50MB.");
    return;
  }

  logoFile.value = file;

  // Create preview
  const reader = new FileReader();
  reader.onload = (e) => {
    logoPreview.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

const clearLogo = () => {
  logoFile.value = null;
  logoPreview.value = "";
};

const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

// === Form Submission ===

const handleSubmit = async () => {
  if (!formData.value.nama_perusahaan) {
    showError("Nama perusahaan wajib diisi!");
    return;
  }

  isSubmitting.value = true;
  info("Sedang memproses data perusahaan...", 5000);

  try {
    // Prepare FormData for multipart/form-data
    const submitData = new FormData();
    submitData.append("nama_perusahaan", formData.value.nama_perusahaan);
    submitData.append("no_telp", formData.value.no_telp || "");
    submitData.append("email", formData.value.email || "");
    submitData.append("tahun_berdiri", formData.value.tahun_berdiri || "");
    submitData.append("status", formData.value.status);

    // Append logo file if exists
    if (logoFile.value) {
      submitData.append("logo", logoFile.value);
    }

    console.log("📤 Submitting company data...");
    console.log("📄 Form Data:", {
      nama_perusahaan: formData.value.nama_perusahaan,
      no_telp: formData.value.no_telp,
      email: formData.value.email,
      tahun_berdiri: formData.value.tahun_berdiri,
      status: formData.value.status,
      hasLogo: !!logoFile.value,
    });

    const response = await fetch(`${apiBaseUrl}/companies`, {
      method: "POST",
      body: submitData,
      // Don't set Content-Type header - browser will set it automatically with boundary for FormData
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal menambahkan perusahaan");
    }

    console.log("✅ Company added successfully:", result);
    success("Perusahaan berhasil ditambahkan!");

    // Reset submitting state first to allow closing
    isSubmitting.value = false;

    // Close modal and refresh data
    closeModal();
    await fetchCompanies();
  } catch (err) {
    console.error("❌ Submit error:", err);
    showError("Gagal menambahkan perusahaan: " + err.message);
    isSubmitting.value = false;
  }
};

// === Helpers ===

const getInitials = (name) => {
  if (!name) return "?";
  const words = name
    .replace(/[^\w\s]/gi, "")
    .split(/\s+/)
    .filter((w) => w.length > 0);
  if (words.length >= 2) {
    return (words[0][0] + words[1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

// === LOGO HANDLER (Cloudinary First, Google Drive as Fallback) ===
const getCompanyLogoUrl = (company) => {
  console.log("🔍 DEBUG Logo for", company.nama_perusahaan);
  console.log("  - logo_cloud:", company.logo_cloud);
  console.log("  - logo_perusahaan:", company.logo_perusahaan);
  console.log("  - logo_url:", company.logo_url);

  // PRIORITY 1: Cloudinary URL (logo_cloud) - Cloud-hosted, fast & reliable!
  if (company.logo_cloud) {
    console.log("  ✅ Using Cloudinary URL (Priority 1):", company.logo_cloud);
    return company.logo_cloud;
  }

  // PRIORITY 2: Google Drive (logo_perusahaan) - Fallback
  const driveUrl = company.logo_perusahaan || company.logo_url;

  if (driveUrl && driveUrl.includes("drive.google.com")) {
    let id = "";
    const parts = driveUrl.split("/");
    const dIndex = parts.indexOf("d");
    if (dIndex !== -1 && parts[dIndex + 1]) {
      id = parts[dIndex + 1];
    } else if (driveUrl.includes("id=")) {
      id = driveUrl.split("id=")[1].split("&")[0];
    }

    if (id) {
      const finalUrl = `https://drive.google.com/uc?export=download&id=${id}`;
      console.log("  🔄 Using Google Drive (Priority 2 - Fallback):", finalUrl);
      return finalUrl;
    }
  }

  // PRIORITY 3: Direct URL (if starts with /)
  if (driveUrl && driveUrl.startsWith("/")) {
    console.log("  ✅ Using local path from logo_perusahaan:", driveUrl);
    return driveUrl;
  }

  // No valid source - will show initials instead
  console.log("  ℹ️ No valid logo source - will show initials");
  return "";
};

const shouldShowLogo = (company) => {
  // If error cached, show initials instead
  if (imageErrors.value[company.id_perusahaan]) return false;
  // Check if valid logo source exists (prioritize local)
  return !!(company.logo_cloud || company.logo_perusahaan || company.logo_url);
};

const handleImageError = (e, company) => {
  console.error("❌ Image load error for", company.nama_perusahaan);
  console.log("  🔄 Falling back to initials display");

  // Mark as error - will show initials instead
  imageErrors.value[company.id_perusahaan] = true;
};

// === Navigation ===

const navigateToDetail = (id) => {
  router.push(`/database/companies/${id}`);
};

// === Data Fetching ===

const fetchCompanies = async () => {
  loading.value = true;
  imageErrors.value = {};
  try {
    const response = await fetch(`${apiBaseUrl}/companies`);
    if (!response.ok) throw new Error("Failed to fetch data");

    const result = await response.json();
    companies.value = Array.isArray(result) ? result : result.data || [];

    console.log("📊 API Response:", result);
    console.log("📊 Total companies:", companies.value.length);

    // Log first company for debugging
    if (companies.value.length > 0) {
      console.log("📊 First company data:", companies.value[0]);
      console.log("📊 Fields available:", Object.keys(companies.value[0]));
    }
  } catch (err) {
    showError("Gagal memuat data perusahaan: " + err.message);
    console.error("❌ Fetch error:", err);
  } finally {
    loading.value = false;
  }
};

// === Edit Functions ===

const openEditModal = (company) => {
  companyToEdit.value = company;
  editFormData.value = {
    nama_perusahaan: company.nama_perusahaan || "",
    no_telp: company.no_telp || "",
    email: company.email || "",
    tahun_berdiri: company.tahun_berdiri || "",
    status: company.status || "Pusat",
  };

  // Set existing logo as preview
  logoFile.value = null; // Reset file input
  if (company.logo_cloud) {
    logoPreview.value = company.logo_cloud;
  } else if (company.logo_perusahaan) {
    logoPreview.value = company.logo_perusahaan;
  } else {
    logoPreview.value = "";
  }

  isEditModalOpen.value = true;
};

const closeEditModal = () => {
  if (!isSubmitting.value) {
    isEditModalOpen.value = false;
    companyToEdit.value = null;
    editFormData.value = {
      nama_perusahaan: "",
      no_telp: "",
      email: "",
      tahun_berdiri: "",
      status: "Pusat",
    };
    // Reset logo state
    logoFile.value = null;
    logoPreview.value = "";
    isDragging.value = false;
  }
};

const handleEdit = async () => {
  if (!editFormData.value.nama_perusahaan || !companyToEdit.value) {
    showError("Nama perusahaan wajib diisi!");
    return;
  }

  isSubmitting.value = true;

  try {
    console.log(` Updating company: ${companyToEdit.value.id_perusahaan}`);

    // Prepare FormData for multipart/form-data
    const submitData = new FormData();
    submitData.append("nama_perusahaan", editFormData.value.nama_perusahaan);
    submitData.append("no_telp", editFormData.value.no_telp || "");
    submitData.append("email", editFormData.value.email || "");
    submitData.append("tahun_berdiri", editFormData.value.tahun_berdiri || "");
    submitData.append("status", editFormData.value.status);

    // Append logo file if changed/new
    if (logoFile.value) {
      submitData.append("logo", logoFile.value);
    }

    const response = await fetch(
      `${apiBaseUrl}/companies/${companyToEdit.value.id_perusahaan}`,
      {
        method: "PUT",
        // Headers NOT needed for FormData - browser sets boundary automatically
        // headers: { 'Content-Type': 'application/json' },
        body: submitData,
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || "Gagal mengupdate perusahaan");
    }

    console.log("✅ Company updated successfully");
    success("Perusahaan berhasil diupdate!");

    isSubmitting.value = false;
    closeEditModal();
    await fetchCompanies();
  } catch (err) {
    console.error("❌ Update error:", err);
    showError("Gagal mengupdate perusahaan: " + err.message);
    isSubmitting.value = false;
  }
};

// === Delete Functions ===

const openDeleteConfirm = (company) => {
  companyToDelete.value = company;
  isDeleteModalOpen.value = true;
};

const closeDeleteModal = () => {
  if (!isDeleting.value) {
    isDeleteModalOpen.value = false;
    companyToDelete.value = null;
  }
};

const handleDelete = async () => {
  if (!companyToDelete.value) return;

  isDeleting.value = true;
  const id = companyToDelete.value.id_perusahaan;
  const name = companyToDelete.value.nama_perusahaan;

  try {
    console.log(`🗑️  Starting deletion for: ${name} (${id})`);

    // Step 1: Delete Assets (Folder & Logo)
    info(`Menghapus folder & aset perusahaan...`, 3000);
    const resAssets = await fetch(`${apiBaseUrl}/companies/${id}/assets`, {
      method: "DELETE",
    });
    if (!resAssets.ok) throw new Error("Gagal menghapus aset folder/logo");

    // Step 2: Delete Related Data
    info(`Menghapus data dokumen & relasi database...`, 3000);
    const resData = await fetch(`${apiBaseUrl}/companies/${id}/related-data`, {
      method: "DELETE",
    });
    if (!resData.ok) throw new Error("Gagal menghapus data terkait");

    // Step 3: Delete Company Profile
    info(`Menghapus profil perusahaan...`, 3000);
    const resProfile = await fetch(`${apiBaseUrl}/companies/${id}/profile`, {
      method: "DELETE",
    });
    if (!resProfile.ok) throw new Error("Gagal menghapus profil perusahaan");

    console.log("✅ Company deleted successfully");
    success(`Perusahaan ${name} berhasil dihapus permanen!`, 5000);

    // Reset deleting state
    isDeleting.value = false;
    closeDeleteModal();
    await fetchCompanies();
  } catch (err) {
    console.error("❌ Delete error:", err);
    showError("Gagal menghapus perusahaan: " + err.message);
    isDeleting.value = false;
  }
};

onMounted(() => {
  fetchCompanies();
});
</script>
