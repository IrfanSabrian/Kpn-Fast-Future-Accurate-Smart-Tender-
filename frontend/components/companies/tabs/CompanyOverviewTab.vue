<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
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
          <!-- Only Edit button (always show) -->
          <button
            @click="$emit('edit-contact')"
            class="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center transition-all hover:scale-110"
            title="Edit Kontak & Kop"
          >
            <i class="fas fa-edit text-sm"></i>
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
                {{ company?.email || "-" }}
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
                {{ company?.no_telp || "-" }}
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
                {{ company?.alamat || "-" }}
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Pejabat Section -->
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
            >{{ pejabatList?.length || 0 }} Pejabat</span
          >
        </div>

        <!-- Scrollable Container -->
        <div class="max-h-[400px] overflow-y-auto pr-2 -mr-2">
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <!-- Existing Pejabat Cards -->
            <div
              v-for="item in pejabatList || []"
              :key="item.id_pejabat"
              @click="$emit('navigate-personnel', item.id_personel)"
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
                    {{ item.jenis_jabatan || item.jabatan_custom || "JABATAN" }}
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
              @click="$emit('add-pejabat')"
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
            <!-- Update Button -->
            <button
              v-if="company?.profil_perusahaan_url && !pendingProfileFile"
              @click="$refs.profileUpdateInput.click()"
              class="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-1"
              title="Perbarui PDF"
            >
              <i class="fas fa-sync-alt"></i>
              <span>Perbarui</span>
            </button>
            <input
              ref="profileUpdateInput"
              type="file"
              accept="application/pdf"
              @change="$emit('profile-select', $event)"
              class="hidden"
            />
            <a
              v-if="company?.profil_perusahaan_url && !pendingProfileFile"
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
            v-if="company?.profil_perusahaan_url && !pendingProfileFile"
            :src="getPreviewUrl(company.profil_perusahaan_url)"
            class="w-full h-full absolute inset-0 border-none"
          ></iframe>

          <!-- New PDF Preview (during upload) -->
          <div
            v-else-if="pendingProfileFile && pendingProfilePreview"
            class="w-full h-full flex flex-col"
          >
            <iframe
              :src="pendingProfilePreview"
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
                  {{ pendingProfileFile.name }}
                </p>
                <p class="text-xs text-slate-500">
                  {{ formatFileSize(pendingProfileFile.size) }}
                </p>
              </div>
              <div class="flex gap-2 ml-4">
                <button
                  @click="$emit('profile-cancel')"
                  :disabled="isUploadingProfile"
                  class="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
                >
                  Batal
                </button>
                <button
                  @click="$emit('profile-save')"
                  :disabled="isUploadingProfile"
                  class="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  <i
                    v-if="isUploadingProfile"
                    class="fas fa-spinner fa-spin"
                  ></i>
                  <i v-else class="fas fa-save"></i>
                  {{ isUploadingProfile ? "Menyimpan..." : "Simpan" }}
                </button>
              </div>
            </div>
          </div>

          <!-- Upload State (No PDF) -->
          <div
            v-else
            class="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            @click="$refs.profileUploadInput.click()"
          >
            <input
              ref="profileUploadInput"
              type="file"
              accept="application/pdf"
              @change="$emit('profile-select', $event)"
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
</template>

<script setup>
import { useCompanyData } from "~/composables/useCompanyData";

defineProps({
  company: Object,
  pejabatList: Array,
  pendingProfileFile: Object,
  pendingProfilePreview: String,
  isUploadingProfile: Boolean,
});

defineEmits([
  "edit-contact",
  "add-pejabat",
  "navigate-personnel",
  "profile-select",
  "profile-save",
  "profile-cancel",
]);

const { getInitials, formatFileSize, getPreviewUrl } = useCompanyData();
</script>
