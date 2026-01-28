<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
    <!-- Left Column: Certificate List -->
    <div class="lg:col-span-7 space-y-4">
      <!-- Header & Add Button -->
      <div class="flex justify-between items-center mb-2">
        <h3 class="text-lg font-bold text-slate-700 dark:text-white">
          Daftar Sertifikat
        </h3>
        <button
          @click="openAddModal"
          class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm hover:shadow"
        >
          <i class="fas fa-plus"></i>
          Tambah Sertifikat
        </button>
      </div>

      <!-- Empty State -->
      <div
        v-if="!items || items.length === 0"
        class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-8 text-center"
      >
        <div
          class="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 mx-auto flex items-center justify-center mb-4"
        >
          <i class="fas fa-award text-2xl"></i>
        </div>
        <h4 class="text-slate-600 dark:text-slate-300 font-medium">
          Belum ada sertifikat
        </h4>
        <p class="text-slate-500 text-sm mt-1">
          Klik tombol tambah untuk menambahkan sertifikat baru.
        </p>
      </div>

      <!-- List Items -->
      <div
        v-else
        class="max-h-[calc(100vh-250px)] overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700"
      >
        <div
          v-for="item in items"
          :key="item[idKey]"
          class="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-6 cursor-pointer relative group transition-all hover:shadow-md"
          :class="{
            'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/10':
              selectedItem && selectedItem[idKey] === item[idKey],
          }"
          @click="$emit('select-item', item)"
        >
          <!-- Edit Mode -->
          <div
            v-if="editingId === item[idKey]"
            class="-m-6 p-6 bg-white dark:bg-slate-800 rounded-xl relative shadow-lg z-10 cursor-default"
            @click.stop
          >
            <!-- Header -->
            <div
              class="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-slate-700 pb-3"
            >
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 bg-blue-50 dark:bg-blue-900/20 text-blue-600"
                >
                  <i class="fas fa-edit"></i>
                </div>
                <div>
                  <div
                    class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                  >
                    EDIT DATA
                  </div>
                  <h4
                    class="font-bold text-slate-800 dark:text-white text-lg leading-none mt-1"
                  >
                    Sertifikat Standar
                  </h4>
                </div>
              </div>
            </div>

            <!-- Scrollable Content -->
            <div
              class="space-y-2 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar"
            >
              <!-- Nomor Sertifikat -->
              <div class="grid grid-cols-[140px_1fr] gap-2 py-1 items-start">
                <div
                  class="text-[10px] font-bold text-slate-400 uppercase pt-2"
                >
                  NOMOR SERTIFIKAT
                </div>
                <div class="flex gap-2 items-start">
                  <div class="flex-1 min-w-0">
                    <input
                      v-model="editFormData.nomor_sertifikat"
                      type="text"
                      :disabled="editFieldLocks.nomor_sertifikat"
                      class="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-white disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed"
                      placeholder="Contoh: 1216000..."
                    />
                  </div>
                  <button
                    @click="
                      editFieldLocks.nomor_sertifikat =
                        !editFieldLocks.nomor_sertifikat
                    "
                    type="button"
                    :class="[
                      'w-8 h-8 flex items-center justify-center rounded transition-all shrink-0',
                      editFieldLocks.nomor_sertifikat
                        ? 'bg-green-100 text-green-600 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-slate-100 text-slate-400 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-500 hover:text-blue-500',
                    ]"
                  >
                    <i class="fas fa-check text-xs"></i>
                  </button>
                </div>
              </div>

              <!-- Kode KBLI -->
              <div class="grid grid-cols-[140px_1fr] gap-2 py-1 items-start">
                <div
                  class="text-[10px] font-bold text-slate-400 uppercase pt-2"
                >
                  KODE KBLI
                </div>
                <div class="flex gap-2 items-start">
                  <div class="flex-1 min-w-0">
                    <input
                      v-model="editFormData.kode_kbli"
                      type="text"
                      :disabled="editFieldLocks.kode_kbli"
                      class="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-white disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed"
                      placeholder="Contoh: 41011"
                    />
                    <div
                      v-if="getKbliDescription(editFormData.kode_kbli)"
                      class="mt-1 text-[10px] text-slate-500 font-normal px-1"
                    >
                      {{ editFormData.kode_kbli }} -
                      {{ getKbliDescription(editFormData.kode_kbli) }}
                    </div>
                  </div>
                  <button
                    @click="toggleInlineLock('kode_kbli')"
                    type="button"
                    :class="[
                      'w-7 h-7 flex items-center justify-center rounded transition-all shrink-0',
                      editFieldLocks.kode_kbli
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30'
                        : 'bg-slate-100 text-slate-400 hover:text-blue-500 dark:bg-slate-800',
                    ]"
                  >
                    <i class="fas fa-check text-[10px]"></i>
                  </button>
                </div>
              </div>

              <!-- Klasifikasi Risiko -->
              <div class="grid grid-cols-[140px_1fr] gap-2 py-1 items-start">
                <div
                  class="text-[10px] font-bold text-slate-400 uppercase pt-2"
                >
                  KLASIFIKASI RISIKO
                </div>
                <div class="flex gap-2 items-start">
                  <div class="flex-1 min-w-0">
                    <input
                      v-model="editFormData.klasifikasi_risiko"
                      type="text"
                      :disabled="editFieldLocks.klasifikasi_risiko"
                      class="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-white disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed"
                      placeholder="Menengah Tinggi..."
                    />
                  </div>
                  <button
                    @click="toggleInlineLock('klasifikasi_risiko')"
                    type="button"
                    :class="[
                      'w-7 h-7 flex items-center justify-center rounded transition-all shrink-0',
                      editFieldLocks.klasifikasi_risiko
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30'
                        : 'bg-slate-100 text-slate-400 hover:text-blue-500 dark:bg-slate-800',
                    ]"
                  >
                    <i class="fas fa-check text-[10px]"></i>
                  </button>
                </div>
              </div>

              <!-- Status Pemenuhan -->
              <div class="grid grid-cols-[140px_1fr] gap-2 py-1 items-start">
                <div
                  class="text-[10px] font-bold text-slate-400 uppercase pt-2"
                >
                  STATUS PEMENUHAN
                </div>
                <div class="flex gap-2 items-start">
                  <div class="flex-1 min-w-0">
                    <input
                      v-model="editFormData.status_pemenuhan"
                      type="text"
                      :disabled="editFieldLocks.status_pemenuhan"
                      class="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-white disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed"
                      placeholder="Status pemenuhan..."
                    />
                  </div>
                  <button
                    @click="toggleInlineLock('status_pemenuhan')"
                    type="button"
                    :class="[
                      'w-7 h-7 flex items-center justify-center rounded transition-all shrink-0',
                      editFieldLocks.status_pemenuhan
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30'
                        : 'bg-slate-100 text-slate-400 hover:text-blue-500 dark:bg-slate-800',
                    ]"
                  >
                    <i class="fas fa-check text-[10px]"></i>
                  </button>
                </div>
              </div>

              <!-- Lembaga Verifikasi -->
              <div class="grid grid-cols-[140px_1fr] gap-2 py-1 items-start">
                <div
                  class="text-[10px] font-bold text-slate-400 uppercase pt-2"
                >
                  LEMBAGA VERIFIKASI
                </div>
                <div class="flex gap-2 items-start">
                  <div class="flex-1 min-w-0">
                    <input
                      v-model="editFormData.lembaga_verifikasi"
                      type="text"
                      :disabled="editFieldLocks.lembaga_verifikasi"
                      class="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-white disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed"
                      placeholder="Lembaga..."
                    />
                  </div>
                  <button
                    @click="toggleInlineLock('lembaga_verifikasi')"
                    type="button"
                    :class="[
                      'w-7 h-7 flex items-center justify-center rounded transition-all shrink-0',
                      editFieldLocks.lembaga_verifikasi
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30'
                        : 'bg-slate-100 text-slate-400 hover:text-blue-500 dark:bg-slate-800',
                    ]"
                  >
                    <i class="fas fa-check text-[10px]"></i>
                  </button>
                </div>
              </div>

              <!-- Tanggal Terbit -->
              <div class="grid grid-cols-[140px_1fr] gap-2 py-1 items-start">
                <div
                  class="text-[10px] font-bold text-slate-400 uppercase pt-2"
                >
                  TANGGAL TERBIT
                </div>
                <div class="flex gap-2 items-start">
                  <div class="flex-1 min-w-0">
                    <input
                      v-model="editFormData.tanggal_terbit"
                      type="date"
                      :disabled="editFieldLocks.tanggal_terbit"
                      class="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-white disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed"
                    />
                  </div>
                  <button
                    @click="toggleInlineLock('tanggal_terbit')"
                    type="button"
                    :class="[
                      'w-7 h-7 flex items-center justify-center rounded transition-all shrink-0',
                      editFieldLocks.tanggal_terbit
                        ? 'bg-green-100 text-green-600 dark:bg-green-900/30'
                        : 'bg-slate-100 text-slate-400 hover:text-blue-500 dark:bg-slate-800',
                    ]"
                  >
                    <i class="fas fa-check text-[10px]"></i>
                  </button>
                </div>
              </div>
            </div>

            <!-- Footer Actions -->
            <div
              class="sticky bottom-0 z-10 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 py-3 mt-4 flex justify-between items-center gap-2"
            >
              <!-- AI Scan -->
              <button
                @click="handleAiScanInline"
                :disabled="isScanningInline"
                class="px-3 py-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-500 rounded-lg shadow-sm transition-colors flex items-center gap-1"
                title="Scan ulang data"
              >
                <i
                  :class="
                    isScanningInline ? 'fas fa-spinner fa-spin' : 'fas fa-magic'
                  "
                ></i>
                {{ isScanningInline ? "Scanning..." : "Scan AI" }}
              </button>

              <div class="flex items-center gap-2">
                <span
                  v-if="!isAllInlineValidated"
                  class="text-[9px] text-orange-500 font-bold animate-pulse hidden sm:inline-block"
                >
                  <i class="fas fa-exclamation-circle mr-1"></i> Ceklis semua!
                </span>
                <button
                  @click="validateAllInline"
                  class="px-2 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1 bg-green-50 text-green-600 hover:bg-green-100 dark:bg-green-900/30 dark:text-green-400 border border-green-100 dark:border-green-800"
                  title="Validasi semua"
                >
                  <i class="fas fa-check-double"></i> All
                </button>
                <div class="h-4 w-px bg-slate-200 dark:bg-slate-700 mx-1"></div>
                <button
                  @click="cancelInlineEdit"
                  class="px-3 py-1.5 text-xs font-bold text-slate-500 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  @click="saveInlineEdit"
                  :disabled="!isAllInlineValidated || isSavingInline"
                  class="px-4 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <i v-if="isSavingInline" class="fas fa-spinner fa-spin"></i>
                  <i v-else class="fas fa-save"></i>
                  Simpan
                </button>
              </div>
            </div>
          </div>

          <!-- View Mode -->
          <div v-else>
            <!-- Hover Actions -->
            <div
              class="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
            >
              <button
                @click.stop="startInlineEdit(item)"
                class="w-8 h-8 flex items-center justify-center rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/10 dark:text-blue-400 dark:hover:bg-blue-900/20 transition-all border border-blue-100 dark:border-blue-900/30"
                title="Edit Data"
              >
                <i class="fas fa-pen text-xs"></i>
              </button>
              <button
                @click.stop="$emit('delete-item', item)"
                class="w-8 h-8 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20 transition-all border border-red-100 dark:border-red-900/30"
                title="Hapus Data"
              >
                <i class="fas fa-trash-alt text-xs"></i>
              </button>
            </div>

            <!-- Header -->
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div
                  class="w-10 h-10 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 flex items-center justify-center shrink-0"
                >
                  <i class="fas fa-award"></i>
                </div>
                <div>
                  <div
                    class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                  >
                    NOMOR SERTIFIKAT
                  </div>
                  <h4
                    class="font-bold text-slate-800 dark:text-white text-lg leading-none mt-1"
                  >
                    {{ item.nomor_sertifikat || "-" }}
                  </h4>
                </div>
              </div>
            </div>

            <!-- Fields Grid -->
            <div class="grid grid-cols-2 gap-x-4 gap-y-4 text-sm">
              <div class="col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <div
                    class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"
                  >
                    KODE KBLI
                  </div>
                  <div class="font-medium text-slate-700 dark:text-slate-200">
                    <div v-if="item.kode_kbli">
                      <span
                        class="text-base font-bold text-slate-800 dark:text-slate-100"
                      >
                        {{ item.kode_kbli }}
                      </span>
                      <span
                        v-if="getKbliDescription(item.kode_kbli)"
                        class="text-xs font-normal text-slate-600 dark:text-slate-400 uppercase ml-1"
                      >
                        - {{ getKbliDescription(item.kode_kbli) }}
                      </span>
                    </div>
                    <span v-else class="text-slate-400 italic"
                      >Belum ada data</span
                    >
                  </div>
                </div>
                <div>
                  <div
                    class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"
                  >
                    NIB
                  </div>
                  <div class="font-medium text-slate-700 dark:text-slate-200">
                    {{
                      item.nomor_nib ||
                      (nibItems && nibItems[0] ? nibItems[0].nomor_nib : "-")
                    }}
                  </div>
                </div>
              </div>

              <div class="col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <div
                    class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"
                  >
                    KLASIFIKASI RISIKO
                  </div>
                  <div class="font-medium text-slate-700 dark:text-slate-200">
                    {{ item.klasifikasi_risiko || "-" }}
                  </div>
                </div>
                <div>
                  <div
                    class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"
                  >
                    STATUS PEMENUHAN
                  </div>
                  <div class="font-medium text-slate-700 dark:text-slate-200">
                    {{ item.status_pemenuhan || "-" }}
                  </div>
                </div>
              </div>

              <div class="col-span-2 grid grid-cols-2 gap-4">
                <div>
                  <div
                    class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"
                  >
                    LEMBAGA VERIFIKASI
                  </div>
                  <div class="font-medium text-slate-700 dark:text-slate-200">
                    {{ item.lembaga_verifikasi || "-" }}
                  </div>
                </div>
                <div>
                  <div
                    class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1"
                  >
                    TANGGAL TERBIT
                  </div>
                  <div class="font-medium text-slate-700 dark:text-slate-200">
                    {{
                      item.tanggal_terbit
                        ? formatDate(item.tanggal_terbit)
                        : "-"
                    }}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Document Preview -->
    <div class="lg:col-span-5 flex flex-col h-full sticky top-4">
      <DocumentPdfPreview
        document-type="sertifikat"
        label="Sertifikat Standar"
        icon="fas fa-award"
        icon-color="indigo"
        :existing-pdf-url="selectedUrl"
        :pending-file="pendingFile"
        :pending-preview="pendingPreview"
        :is-uploading="isUploading"
        :disable-direct-upload="true"
        @upload-area-click="openAddModal"
        @file-selected="$emit('upload-select', $event)"
        @save="$emit('upload-save')"
        @cancel="$emit('upload-cancel')"
      />
    </div>

    <!-- Add/Edit Modal -->
    <CompanyDocumentModal
      ref="modalRef"
      :show="showModal"
      document-type="sertifikat"
      :company-name="companyName"
      :is-edit-mode="isEditing"
      :existing-file-url="formData.sertifikat_standar_url"
      :show-validation="showValidation"
      :is-all-validated="isAllValidated"
      @close="closeModal"
      @save="handleModalSave"
      @scan-complete="handleAiScanComplete"
      @validate-all="validateAllFields"
      @fileSelected="handleFileSelectedInModal"
    >
      <template #form-fields>
        <div class="grid grid-cols-1 gap-4">
          <FormInput
            v-model="formData.nomor_sertifikat"
            label="Nomor Sertifikat"
            placeholder="Nomor Sertifikat"
            required
            :showValidation="showValidation"
            :locked="fieldLocks.nomor_sertifikat"
            @update:locked="(val) => (fieldLocks.nomor_sertifikat = val)"
          />
          <FormInput
            v-model="formData.kode_kbli"
            label="Kode KBLI"
            placeholder="Contoh: 41112"
            :showValidation="showValidation"
            :locked="fieldLocks.kode_kbli"
            @update:locked="(val) => (fieldLocks.kode_kbli = val)"
          />
          <FormInput
            v-model="formData.lembaga_verifikasi"
            label="Lembaga Verifikasi"
            placeholder="Contoh: OSS / Kementerian"
            :showValidation="showValidation"
            :locked="fieldLocks.lembaga_verifikasi"
            @update:locked="(val) => (fieldLocks.lembaga_verifikasi = val)"
          />
          <FormInput
            v-model="formData.klasifikasi_risiko"
            label="Klasifikasi Risiko"
            placeholder="Contoh: Menengah Tinggi"
            :showValidation="showValidation"
            :locked="fieldLocks.klasifikasi_risiko"
            @update:locked="(val) => (fieldLocks.klasifikasi_risiko = val)"
          />
          <FormInput
            v-model="formData.status_pemenuhan"
            label="Status Pemenuhan"
            placeholder="Contoh: Memenuhi Syarat"
            :showValidation="showValidation"
            :locked="fieldLocks.status_pemenuhan"
            @update:locked="(val) => (fieldLocks.status_pemenuhan = val)"
          />
          <FormInput
            v-model="formData.tanggal_terbit"
            label="Tanggal Terbit"
            type="date"
            :showValidation="showValidation"
            :locked="fieldLocks.tanggal_terbit"
            @update:locked="(val) => (fieldLocks.tanggal_terbit = val)"
          />
        </div>
      </template>

      <template #validate-all-button>
        <div class="flex items-center gap-2">
          <span
            v-if="showValidation && !isAllValidated"
            class="text-[10px] text-orange-500 font-medium animate-pulse hidden sm:inline-block"
          >
            <i class="fas fa-exclamation-circle mr-1"></i>
            Ceklis semua data!
          </span>
          <button
            v-if="showValidation"
            @click="validateAllFields"
            class="px-2 py-1 text-[10px] font-bold rounded-lg transition-colors flex items-center gap-1 border"
            :class="
              isAllValidated
                ? 'text-white bg-green-500 border-green-600 hover:bg-green-600'
                : 'text-green-600 bg-green-50 hover:bg-green-100 dark:text-green-400 dark:bg-green-900/20 border-green-200 dark:border-green-800'
            "
          >
            <i
              class="fas"
              :class="isAllValidated ? 'fa-check' : 'fa-check-double'"
            ></i>
            {{ isAllValidated ? "Verified" : "All" }}
          </button>
        </div>
      </template>
    </CompanyDocumentModal>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import DocumentPdfPreview from "~/components/DocumentPdfPreview.vue";
import CompanyDocumentModal from "~/components/CompanyDocumentModal.vue";
import FormInput from "~/components/FormInput.vue";
import { useToast } from "~/composables/useToast"; // Assuming useToast is available globally or imported

const props = defineProps({
  items: Array,
  kbliItems: { type: Array, default: () => [] },
  nibItems: { type: Array, default: () => [] },
  idKey: { type: String, default: "id_sertifikat_standar" },
  selectedItem: Object,
  selectedUrl: String,
  pendingFile: Object,
  pendingPreview: String,
  isUploading: Boolean,
  companyName: String,
});

const emit = defineEmits([
  "select-item",
  "upload-select",
  "upload-save",
  "upload-cancel",
  "update-item",
  "delete-item",
  "save-item",
  "ai-scan",
]);

const showModal = ref(false);
const isEditing = ref(false);
// const editingId = ref(null); // Replaced by inline editingId
const showValidation = ref(false);

// Inline Editing State
const editingId = ref(null);
const editFormData = ref({});
const editFieldLocks = ref({});
const isSavingInline = ref(false);
const isScanningInline = ref(false);

// Debugging Props
console.log("CertificateTab Mounted");
console.log("KBLI Items:", props.kbliItems);
console.log("NIB Items:", props.nibItems);

const getKbliDescription = (code) => {
  if (!code || !props.kbliItems) return "";
  const cleanCode = String(code).trim();

  // Helper function to find KBLI
  const findMatch = (c) =>
    props.kbliItems.find((k) => String(k.kode_kbli).trim() == c);

  // 1. Try exact match
  let kbli = findMatch(cleanCode);

  // 2. If not found and code contains dot (e.g. "71101.B"), try base code "71101"
  if (!kbli && cleanCode.includes(".")) {
    const baseCode = cleanCode.split(".")[0];
    kbli = findMatch(baseCode);
  }

  // 3. Fallback: Reverse lookup (e.g. input "71102" matches list item "71102.B")
  if (!kbli) {
    kbli = props.kbliItems.find((k) =>
      String(k.kode_kbli)
        .trim()
        .startsWith(cleanCode + "."),
    );
  }

  // Log failure
  // if (!kbli) console.warn("KBLI not found for:", cleanCode);

  return kbli
    ? kbli.nama_klasifikasi ||
        kbli.judul_kbli ||
        kbli.judul ||
        kbli.name ||
        kbli.uraian ||
        ""
    : "";
};

const startInlineEdit = (item) => {
  editingId.value = item[props.idKey];
  editFormData.value = { ...item };

  // Initialize locks (optimistic: assume existing data is valid)
  editFieldLocks.value = {
    nomor_sertifikat: !!item.nomor_sertifikat,
    kode_kbli: !!item.kode_kbli,
    lembaga_verifikasi: !!item.lembaga_verifikasi,
    klasifikasi_risiko: !!item.klasifikasi_risiko,
    status_pemenuhan: !!item.status_pemenuhan,
    tanggal_terbit: !!item.tanggal_terbit,
  };

  // Select item to show preview
  emit("select-item", item);
};

const cancelInlineEdit = () => {
  editingId.value = null;
  editFormData.value = {};
  editFieldLocks.value = {};
};

const saveInlineEdit = async () => {
  if (!isAllInlineValidated.value) return;

  isSavingInline.value = true;
  try {
    const data = { ...editFormData.value };
    // Pass existing file URL if available, though we primarily update data here
    // Verify if we need to pass 'file' if it was replaced?
    // For inline edit, we usually only update text data unless we allow file upload inline too.
    // The instructions implied "mirip kontrak" which has "Edit Data" and "AI Scan".
    // Kontrak inline doesn't usually have file upload, just data edit.
    // If user wants to replace file, they might need the modal or we add that later.
    // For now assuming data update only.
    emit("save-item", { data });
    editingId.value = null;
  } catch (e) {
    console.error("Error saving inline:", e);
  } finally {
    isSavingInline.value = false;
  }
};

const handleAiScanInline = async () => {
  const fileUrl = editFormData.value.sertifikat_standar_url;
  if (!fileUrl) {
    console.warn("No file URL to scan");
    // We could show a toast here
    return;
  }

  isScanningInline.value = true;
  // Use toast to show progress if needed, but the button spin is good feedback

  try {
    const runtimeConfig = useRuntimeConfig();

    // specific for certificate
    const response = await fetch(
      `${runtimeConfig.public.apiBaseUrl}/ai/scan-drive-file`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          fileUrl: fileUrl,
          documentType: "sertifikat",
          instruction: "Extract sertifikat details",
        }),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || "Gagal memindai dokumen");
    }

    const result = await response.json();
    if (!result.success || !result.data) {
      throw new Error("Data tidak lengkap dari AI");
    }

    handleAiScanInlineComplete(result.data);
  } catch (e) {
    console.error("[INLINE SCAN] Error:", e);
    // alert(e.message); // Simple alert or rely on console
  } finally {
    isScanningInline.value = false;
  }
};

const handleAiScanInlineComplete = (data) => {
  console.log("🚀 [INLINE SCAN] Received Data:", data);

  let targetData = data;
  if (data[0]) targetData = data[0];
  else if (Array.isArray(data) && data.length > 0) targetData = data[0];

  // Fallbacks
  if (!targetData.nomor_sertifikat && targetData.sertifikat)
    targetData = targetData.sertifikat;
  else if (!targetData.nomor_sertifikat && targetData.data)
    targetData = targetData.data;

  try {
    console.log(
      "🔍 [INLINE SCAN] Target Data Structure:",
      JSON.stringify(targetData, null, 2),
    );
  } catch (e) {}

  editFormData.value = {
    ...editFormData.value,
    nomor_sertifikat: targetData.nomor_sertifikat || "",
    kode_kbli: targetData.kode_kbli || "",
    lembaga_verifikasi: targetData.lembaga_verifikasi || "",
    klasifikasi_risiko: targetData.klasifikasi_risiko || "",
    status_pemenuhan: targetData.status_pemenuhan || "",
    tanggal_terbit: targetData.tanggal_terbit || "",
  };

  // Reset locks to require validation
  Object.keys(editFieldLocks.value).forEach(
    (k) => (editFieldLocks.value[k] = false),
  );
};

// Computed for inline validation
const isAllInlineValidated = computed(() => {
  // Only check keys present in editFieldLocks
  const keys = Object.keys(editFieldLocks.value);
  if (keys.length === 0) return false;
  return keys.every((k) => editFieldLocks.value[k] === true);
});

const toggleInlineLock = (field) => {
  if (editFieldLocks.value[field] !== undefined) {
    editFieldLocks.value[field] = !editFieldLocks.value[field];
  }
};

const validateAllInline = () => {
  Object.keys(editFieldLocks.value).forEach(
    (k) => (editFieldLocks.value[k] = true),
  );
};

const formData = ref({
  nomor_sertifikat: "",
  kode_kbli: "",
  lembaga_verifikasi: "",
  klasifikasi_risiko: "",
  status_pemenuhan: "",
  tanggal_terbit: "",
});

const fieldLocks = ref({
  nomor_sertifikat: false,
  kode_kbli: false,
  lembaga_verifikasi: false,
  klasifikasi_risiko: false,
  status_pemenuhan: false,
  tanggal_terbit: false,
});

const openAddModal = () => {
  isEditing.value = false;
  editingId.value = null;
  resetForm();
  showValidation.value = false; // Add new starts with no validation required initially?
  // Existing logic in generic modal: "showValidation" enables the validate checks.
  // We can default to false, and enable if a file is selected.
  showModal.value = true;
};

const openEditModal = (item) => {
  isEditing.value = true;
  editingId.value = item[props.idKey];
  formData.value = { ...item };

  // Mark all fields as validated for Edit (so user doesn't have to re-click everything unless they change it)
  // Or force re-validation? "Experience" forces re-validation on AI scan, but edit existing?
  // Let's mark all true to allow save immediately.
  validateAllFields();

  showModal.value = true;
};

const closeModal = () => {
  showModal.value = false;
  resetForm();
};

const resetForm = () => {
  formData.value = {
    nomor_sertifikat: "",
    kode_kbli: "",
    lembaga_verifikasi: "",
    klasifikasi_risiko: "",
    status_pemenuhan: "",
    tanggal_terbit: "",
  };
  fieldLocks.value = {
    nomor_sertifikat: false,
    kode_kbli: false,
    lembaga_verifikasi: false,
    klasifikasi_risiko: false,
    status_pemenuhan: false,
    tanggal_terbit: false,
  };
};

const handleModalSave = (file) => {
  // If editing, we need the ID from the item being edited
  const data = { ...formData.value };
  if (isEditing.value && editingId.value) {
    data[props.idKey] = editingId.value;
  }

  // Emit single save-item event with data and optional file
  // Parent will handle Upload + Create/Update
  emit("save-item", { data, file });

  closeModal();
};

const handleAiScanComplete = (data) => {
  console.log("🚀 [CERT TAB] Received AI Scan Data:", data);

  if (!data) {
    console.warn("⚠️ [CERT TAB] No data received from AI Scan");
    return;
  }

  // Handle array or object
  let targetData = data;
  if (data[0]) {
    console.log("⚠️ [CERT TAB] access data[0] directly.");
    targetData = data[0];
  } else if (Array.isArray(data) && data.length > 0) {
    targetData = data[0];
  }

  // Deep inspection log
  try {
    console.log(
      "🔍 [CERT TAB] Target Data Structure:",
      JSON.stringify(targetData, null, 2),
    );
  } catch (e) {
    console.error("Error logging data structure", e);
  }

  // Fallback: Check if the keys are nested under a property like 'sertifikat' or 'data'
  if (!targetData.nomor_sertifikat && targetData.sertifikat) {
    console.log(
      "⚠️ [CERT TAB] Found nested 'sertifikat' object, unwrapping...",
    );
    targetData = targetData.sertifikat;
  } else if (!targetData.nomor_sertifikat && targetData.data) {
    console.log("⚠️ [CERT TAB] Found nested 'data' object, unwrapping...");
    targetData = targetData.data;
  }

  // Populate form data with specific mapping to ensure keys match
  // The backend returns keys: nomor_sertifikat, kode_kbli, lembaga_verifikasi, klasifikasi_risiko, status_pemenuhan, tanggal_terbit
  // We map them explicitly to avoid missing keys or typos
  formData.value = {
    ...formData.value,
    nomor_sertifikat: targetData.nomor_sertifikat || "",
    kode_kbli: targetData.kode_kbli || "",
    lembaga_verifikasi: targetData.lembaga_verifikasi || "",
    klasifikasi_risiko: targetData.klasifikasi_risiko || "",
    status_pemenuhan: targetData.status_pemenuhan || "",
    tanggal_terbit: targetData.tanggal_terbit || "",
  };

  console.log("✅ [CERT TAB] Form Data Updated:", formData.value);
  showValidation.value = true;

  // Reset locks to force review
  Object.keys(fieldLocks.value).forEach((k) => (fieldLocks.value[k] = false));
};

const handleFileSelectedInModal = (file) => {
  showValidation.value = true; // Enable validation requirements
};

const validateAllFields = () => {
  Object.keys(fieldLocks.value).forEach((k) => (fieldLocks.value[k] = true));
};

const isAllValidated = computed(() => {
  return Object.values(fieldLocks.value).every((v) => v === true);
});

const formatDate = (date) => {
  if (!date) return "-";
  return new Date(date).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
};
</script>

<style scoped>
/* Scrollbar styles same as others */
</style>
