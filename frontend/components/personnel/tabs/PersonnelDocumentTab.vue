<template>
  <div class="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start h-full">
    <!-- Left Column: Data List (Constrained Height) -->
    <div class="lg:col-span-7 space-y-4 h-full flex flex-col">
      <!-- Empty State -->
      <div
        v-if="!items || items.length === 0"
        class="bg-white dark:bg-slate-800 rounded-xl border-2 border-slate-200 dark:border-slate-700 p-6"
      >
        <!-- Header -->
        <div
          class="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-slate-700 pb-3"
        >
          <div class="flex items-center gap-3">
            <div
              class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0 opacity-50"
              :class="iconBgClass"
            >
              <i :class="icon"></i>
            </div>
            <div>
              <div
                class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
              >
                {{ titleLabel }}
              </div>
              <h4
                class="font-bold text-slate-400 dark:text-slate-500 text-lg leading-none mt-1"
              >
                -
              </h4>
            </div>
          </div>
        </div>

        <!-- Fields with placeholder values -->
        <div class="space-y-0.5 mt-4">
          <div
            v-for="(field, index) in fields"
            :key="index"
            class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700"
          >
            <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">
              {{ field.label }}
            </div>
            <div
              class="text-xs font-medium text-slate-400 dark:text-slate-500 break-all"
            >
              -
            </div>
          </div>
        </div>
      </div>

      <!-- Item List (Single Item typically) -->
      <div v-else class="space-y-3 flex-1 flex flex-col min-h-0">
        <div
          v-for="item in items"
          :key="item[idKey]"
          @click="$emit('select-item', item)"
          class="bg-white dark:bg-slate-800 rounded-xl border-2 p-6 transition-all group flex flex-col max-h-full border-slate-200 dark:border-slate-700"
        >
          <!-- Header (Always visible) -->
          <div
            class="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-slate-700 pb-3 shrink-0"
          >
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
                :class="[iconBgClass, !selectedUrl ? 'opacity-50' : '']"
              >
                <i :class="icon"></i>
              </div>
              <div>
                <div
                  class="text-[10px] font-bold text-slate-400 uppercase tracking-wider"
                >
                  {{ titleLabel }}
                </div>
                <h4
                  class="font-bold text-slate-800 dark:text-white text-lg leading-none mt-1"
                >
                  {{ item[titleKey] }}
                </h4>
              </div>
            </div>

            <!-- Edit Button (Show if PDF exists OR pending file exists) -->
            <button
              v-if="!isEditing && selectedUrl"
              @click.stop="startEditing(item)"
              class="text-xs font-bold text-blue-600 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 px-3 py-1.5 rounded-lg transition-colors border border-blue-100 dark:border-blue-800"
            >
              <i class="fas fa-edit mr-1"></i> Edit Data
            </button>
          </div>

          <!-- Fields Container (Always Scrollable for Personnel) -->
          <div
            class="mt-0 space-y-0.5 overflow-y-auto pr-2 custom-scrollbar flex-1"
            style="max-height: calc(100vh - 350px)"
          >
            <div
              v-for="(field, index) in fields"
              :key="index"
              class="grid grid-cols-[140px_1fr] gap-2 py-1 border-b border-dashed border-slate-100 dark:border-slate-700 items-center"
            >
              <div
                class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
              >
                {{ field.label }}
              </div>

              <!-- View Mode -->
              <div
                v-if="!isEditing || editingId !== item[idKey]"
                class="text-xs font-medium text-slate-700 dark:text-slate-200 break-all leading-relaxed"
              >
                {{
                  field.format
                    ? field.format(item[field.key])
                    : item[field.key] || "-"
                }}
              </div>

              <!-- Edit Mode -->
              <div v-else class="flex gap-2 items-start w-full">
                <div class="flex-1 min-w-0">
                  <input
                    v-if="
                      !field.type ||
                      field.type === 'text' ||
                      field.type === 'date' ||
                      field.type === 'number'
                    "
                    v-model="editFormData[field.key]"
                    :type="field.type || 'text'"
                    :placeholder="field.label"
                    :disabled="validatedFields[field.key]"
                    class="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
                    :class="{
                      'border-green-500 ring-1 ring-green-500/20':
                        validatedFields[field.key],
                    }"
                  />
                  <textarea
                    v-else-if="field.type === 'textarea'"
                    v-model="editFormData[field.key]"
                    rows="2"
                    :placeholder="field.label"
                    :disabled="validatedFields[field.key]"
                    class="w-full px-2 py-1 text-xs border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-white resize-none disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
                    :class="{
                      'border-green-500 ring-1 ring-green-500/20':
                        validatedFields[field.key],
                    }"
                  ></textarea>
                  <select
                    v-else-if="field.type === 'select'"
                    v-model="editFormData[field.key]"
                    :disabled="validatedFields[field.key]"
                    class="w-full px-2 py-1.5 text-xs border border-slate-300 dark:border-slate-600 rounded focus:outline-none focus:border-blue-500 bg-white dark:bg-slate-900 dark:text-white disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
                    :class="{
                      'border-green-500 ring-1 ring-green-500/20':
                        validatedFields[field.key],
                    }"
                  >
                    <option value="" disabled>Pilih {{ field.label }}</option>
                    <option
                      v-for="opt in field.options"
                      :key="opt"
                      :value="opt"
                    >
                      {{ opt }}
                    </option>
                  </select>
                </div>

                <!-- Validation Button -->
                <button
                  @click.stop="toggleValidation(field.key)"
                  class="w-7 h-7 flex items-center justify-center rounded-lg transition-all shrink-0 mt-0.5"
                  :class="[
                    validatedFields[field.key]
                      ? 'bg-green-50 text-green-600 hover:bg-green-100 border border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
                      : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700 hover:text-blue-500 hover:border-blue-200',
                  ]"
                  :title="
                    validatedFields[field.key]
                      ? 'Batalkan validasi (Edit kembali)'
                      : 'Validasi data ini (Kunci)'
                  "
                >
                  <i
                    class="fas"
                    :class="
                      validatedFields[field.key] ? 'fa-check' : 'fa-check'
                    "
                    style="font-size: 0.7rem"
                  ></i>
                </button>
              </div>
            </div>

            <!-- Edit Footer Actions -->
            <div
              v-if="isEditing && editingId === item[idKey]"
              class="sticky bottom-0 z-10 bg-white dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 py-3 mt-2 flex justify-end gap-2 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]"
            >
              <button
                @click.stop="triggerAiScan"
                class="px-3 py-1.5 text-xs font-bold text-white bg-green-600 hover:bg-green-500 rounded-lg shadow-sm transition-colors flex items-center gap-1 mr-auto"
                title="Scan data dari dokumen PDF dengan AI"
              >
                <i class="fas fa-magic"></i> Scan AI
              </button>

              <div class="flex items-center gap-2">
                <span
                  v-if="!isAllValidated"
                  class="text-[10px] text-orange-500 font-medium animate-pulse"
                >
                  <i class="fas fa-exclamation-circle mr-1"></i>
                  Ceklis semua data!
                </span>

                <button
                  @click.stop="validateAll"
                  v-if="!isAllValidated"
                  class="px-2 py-1.5 text-xs font-bold text-green-600 bg-green-50 hover:bg-green-100 dark:text-green-400 dark:bg-green-900/20 rounded-lg transition-colors flex items-center gap-1 border border-green-200 dark:border-green-800"
                  title="Ceklis (Validasi) Semua Input"
                >
                  <i class="fas fa-check-double"></i> All
                </button>

                <button
                  @click.stop="cancelEditing"
                  class="px-3 py-1.5 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-700 rounded-lg transition-colors"
                >
                  Batal
                </button>
                <button
                  @click.stop="saveEditing"
                  :disabled="!isAllValidated"
                  class="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 rounded-lg shadow-sm transition-colors flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-slate-400"
                  :title="
                    !isAllValidated
                      ? 'Validasi semua kolom terlebih dahulu'
                      : 'Simpan Perubahan'
                  "
                >
                  <i class="fas fa-save"></i> Simpan
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Column: Document Preview (Full Height) -->
    <div class="lg:col-span-5 flex flex-col h-full">
      <DocumentPdfPreview
        :document-type="documentType"
        :label="label"
        :icon="icon"
        :icon-color="color"
        :existing-pdf-url="selectedUrl"
        :pending-file="pendingFile"
        :pending-preview="pendingPreview"
        :is-uploading="isUploading"
        @file-selected="$emit('upload-select', $event)"
        @save="$emit('upload-save')"
        @cancel="$emit('upload-cancel')"
      />
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import DocumentPdfPreview from "~/components/DocumentPdfPreview.vue";

const props = defineProps({
  items: Array,
  documentType: String,
  label: String,
  idKey: { type: String, default: "id" },
  titleKey: String,
  titleLabel: String,
  fields: Array,
  icon: String,
  color: { type: String, default: "orange" },
  selectedItem: Object,
  selectedUrl: String,
  pendingFile: Object,
  pendingPreview: String,
  isUploading: Boolean,
  singleMode: Boolean, // Kept for prop compatibility
});

const emit = defineEmits([
  "select-item",
  "upload-select",
  "upload-save",
  "upload-cancel",
  "update-item",
  // "ai-scan", // Handled internally now
]);

const config = useRuntimeConfig();
const apiBaseUrl = config.public.apiBaseUrl;
const { info, success, error, hideToast, loadingScan, successScan, errorScan } =
  useToast();

const isEditing = ref(false);
const editingId = ref(null);
const editFormData = ref({});
const validatedFields = ref({});

const startEditing = (item) => {
  isEditing.value = true;
  editingId.value = item[props.idKey];

  // Initialize with all fields keys to ensure reactivity
  const defaults = {};
  if (props.fields) {
    props.fields.forEach((f) => {
      defaults[f.key] = "";
    });
  }

  // Merge item data over defaults
  editFormData.value = { ...defaults, ...item };

  /*
    Initialize validation to FALSE (unchecked) so all fields are editable by default.
    The user must manually check (validate) each field, or use "Check All".
    Only when all are checked can they save.
  */
  const initialValidation = {};
  props.fields.forEach((f) => {
    initialValidation[f.key] = false;
  });
  validatedFields.value = initialValidation;
};

const cancelEditing = () => {
  isEditing.value = false;
  editingId.value = null;
  editFormData.value = {};
  validatedFields.value = {};
};

const saveEditing = () => {
  if (!isAllValidated.value) return;
  emit("update-item", { ...editFormData.value });
  cancelEditing();
};

const formatDateInput = (dateStr) => {
  if (!dateStr) return "";
  // Check if already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;

  // Try parsing DD-MM-YYYY or DD/MM/YYYY
  const parts = dateStr.match(/(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/);
  if (parts) {
    const day = parts[1].padStart(2, "0");
    const month = parts[2].padStart(2, "0");
    const year = parts[3];
    return `${year}-${month}-${day}`;
  }
  return dateStr;
};

const formatGender = (genderStr) => {
  if (!genderStr) return "";
  const upper = genderStr.toUpperCase();
  if (upper.includes("LAKI")) return "Laki-Laki";
  if (upper.includes("PEREMPUAN") || upper.includes("WANITA"))
    return "Perempuan";
  return genderStr;
};

const triggerAiScan = async () => {
  // Check pending file or existing URL
  if (!props.pendingFile && !props.selectedUrl) {
    error("Silakan upload dokumen terlebih dahulu untuk discan.");
    return;
  }

  const toastId = loadingScan();

  try {
    let result;

    if (props.pendingFile) {
      // Scan pending file
      const formData = new FormData();
      formData.append("file", props.pendingFile);
      formData.append("documentType", props.documentType);

      const res = await fetch(`${apiBaseUrl}/ai/scan-document`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal memindai dokumen");
      }
      result = await res.json();
    } else {
      // Scan existing file from Drive
      const res = await fetch(`${apiBaseUrl}/ai/scan-drive-file`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fileUrl: props.selectedUrl,
          documentType: props.documentType,
          category: "personnel", // Explicitly state category
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || "Gagal memindai dokumen dari Drive");
      }
      result = await res.json();
    }

    // Apply results
    let data = result.data;
    console.log("[Ai Scan] Received data:", data);

    // Key Mapping for NPWP (Fix mismatch)
    // AI returns: nomor_npwp, nama_wp, alamat, kpp
    // Frontend expects: nomor_npwp_personel, nama_npwp_personel, alamat_npwp_personel, kpp_npwp_personel
    if (props.documentType === "npwp") {
      const npwpMapping = {
        nomor_npwp: "nomor_npwp_personel",
        nama_wp: "nama_npwp_personel",
        nama: "nama_npwp_personel", // Fallback
        alamat: "alamat_npwp_personel",
        kpp: "kpp_npwp_personel",
        nik: "nik_npwp_personel",
      };

      const mappedData = {};
      for (const [key, value] of Object.entries(data)) {
        if (npwpMapping[key]) {
          mappedData[npwpMapping[key]] = value;
        } else {
          mappedData[key] = value; // Keep others as is
        }
      }

      // Ensure mapped keys exist even if source was missing (optional, but good for completeness)
      // If 'nomor_npwp' was missing in data, mappedData won't have it either, preventing overwrite of existing valid data with undefined?
      // No, we want to respect AI. If AI didn't find it, maybe don't overwrite? Or overwrite with empty?
      // Let's stick to mapping what exists.

      console.log("[Ai Scan] Mapped NPWP data:", mappedData);
      data = mappedData;
    }

    // Format Data
    if (data.jenis_kelamin) {
      data.jenis_kelamin = formatGender(data.jenis_kelamin);
    }

    // Format Date Fields
    const dateFields = [
      "tanggal_lahir_ktp",
      "tanggal_terbit_ktp",
      "tanggal_lahir",
      "tanggal_terbit",
      "tanggal_akta",
      "tanggal_input",
    ];

    dateFields.forEach((field) => {
      if (data[field]) {
        data[field] = formatDateInput(data[field]);
      }
    });

    // Special case for berlaku_hingga
    if (
      data.berlaku_hingga &&
      data.berlaku_hingga.toUpperCase() !== "SEUMUR HIDUP"
    ) {
      data.berlaku_hingga = formatDateInput(data.berlaku_hingga);
    }

    // Force reactivity update
    console.log("[Ai Scan] Merging into editFormData:", data);

    // Explicitly merge into editFormData
    const mergedData = { ...editFormData.value, ...data };
    editFormData.value = mergedData;

    // Debug result
    console.log("[Ai Scan] New editFormData:", editFormData.value);

    // Reset validation
    const newValidation = {};
    if (props.fields) {
      props.fields.forEach((f) => {
        newValidation[f.key] = false;
      });
    }
    validatedFields.value = newValidation;

    hideToast(toastId);
    successScan(
      `Data ${
        props.documentType ? props.documentType.toUpperCase() : ""
      } berhasil diekstrak. Silakan validasi.`
    );
  } catch (e) {
    console.error("[Ai Scan Error]", e);
    hideToast(toastId);
    errorScan(e.message);
  }
};

const updateEditData = (newData) => {
  editFormData.value = { ...editFormData.value, ...newData };

  // Reset validation for all fields to force review of AI data
  const newValidation = {};
  props.fields.forEach((f) => {
    newValidation[f.key] = false;
  });
  validatedFields.value = newValidation;
};

const toggleValidation = (key) => {
  validatedFields.value[key] = !validatedFields.value[key];
};

const validateAll = () => {
  const newValidation = {};
  props.fields.forEach((f) => {
    newValidation[f.key] = true;
  });
  validatedFields.value = newValidation;
};

const isAllValidated = computed(() => {
  if (!props.fields) return true;
  return props.fields.every((f) => validatedFields.value[f.key]);
});

defineExpose({ updateEditData, startEditing, cancelEditing, saveEditing });

const selectedId = computed(() =>
  props.selectedItem ? props.selectedItem[props.idKey] : null
);

const iconBgClass = computed(() => {
  const colorMap = {
    orange: "bg-orange-50 dark:bg-orange-900/20 text-orange-600",
    blue: "bg-blue-50 dark:bg-blue-900/20 text-blue-600",
    green: "bg-green-50 dark:bg-green-900/20 text-green-600",
    purple: "bg-purple-50 dark:bg-purple-900/20 text-purple-600",
    red: "bg-red-50 dark:bg-red-900/20 text-red-600",
    cyan: "bg-cyan-50 dark:bg-cyan-900/20 text-cyan-600",
    teal: "bg-teal-50 dark:bg-teal-900/20 text-teal-600",
    pink: "bg-pink-50 dark:bg-pink-900/20 text-pink-600",
  };
  return colorMap[props.color] || colorMap.orange;
});
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #475569;
}
</style>
