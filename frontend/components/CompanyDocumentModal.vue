<template>
  <BaseModal :show="show" @close="handleClose" maxWidth="5xl">
    <template #header>
      <div class="flex items-center gap-4">
        <div
          class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm"
          :class="iconBackgroundClass"
        >
          <i :class="iconClass" class="text-xl"></i>
        </div>
        <div>
          <h3
            class="text-xl font-bold text-slate-900 dark:text-white tracking-tight"
          >
            {{
              isEditMode && isViewOnly
                ? "Detail"
                : isEditMode
                  ? "Edit"
                  : "Tambah"
            }}
            {{ documentLabel }}
          </h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {{ companyName }}
          </p>
        </div>
      </div>
    </template>

    <div
      class="grid grid-cols-1 lg:grid-cols-2 gap-6"
      @keydown.enter="handleEnterKey"
    >
      <!-- Left Column: Form Fields (1 col) - Scrollable -->
      <div class="lg:col-span-1">
        <div
          class="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col h-[400px]"
        >
          <!-- Header with Validate All Button -->
          <div class="px-4 pt-4 pb-3 flex items-center flex-shrink-0 relative">
            <h4
              class="text-xs font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2"
            >
              <span class="w-1 h-3 bg-blue-500 rounded-full"></span>
              Informasi Dokumen
            </h4>

            <!-- Top Right Action Area -->
            <div class="absolute right-4 top-4 flex items-center gap-2">
              <!-- Edit Toggle (Only in Edit Mode / Existing Data) -->
              <button
                v-if="isEditMode && isViewOnly"
                @click="handleEditClick"
                class="text-[10px] font-bold text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors flex items-center gap-1.5"
              >
                <i class="fas fa-edit"></i> Edit Data
              </button>

              <!-- Validate All Button Slot -->
              <slot name="validate-all-button"></slot>
            </div>
          </div>

          <!-- Scrollable Form Container -->
          <div class="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4">
            <slot
              name="form-fields"
              :isViewOnly="isViewOnly"
              :hasFileUpload="hasFileUpload"
            ></slot>
          </div>
        </div>
      </div>

      <!-- Right Column: Upload/Preview (1 col) -->
      <div
        class="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden h-[400px]"
      >
        <!-- Header -->
        <div
          class="px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 shrink-0"
        >
          <div>
            <h3
              class="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 text-xs"
            >
              <i class="fas fa-file-pdf text-red-500"></i>
              Dokumen {{ documentLabel }}
            </h3>
          </div>
          <div class="flex gap-2">
            <!-- AI Scan Button (Visible if file exists & NOT View Only) -->
            <button
              v-if="(selectedFile || existingFileUrl) && !isViewOnly"
              @click="scanWithAI"
              :disabled="isScanning"
              class="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors flex items-center gap-1"
            >
              <i
                :class="isScanning ? 'fas fa-spinner fa-spin' : 'fas fa-magic'"
              ></i>
              <span>AI Scan</span>
            </button>

            <!-- Change/Upload Button (NOT View Only) -->
            <button
              v-if="!isViewOnly"
              @click="$refs.fileInput.click()"
              class="px-2 py-1 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-[10px] text-slate-600 hover:text-blue-600 text-center"
              title="Ganti File"
            >
              <i class="fas fa-sync-alt"></i>
            </button>
          </div>
        </div>

        <!-- Content -->
        <div class="flex-1 bg-slate-100 dark:bg-slate-900 relative">
          <iframe
            v-if="previewUrl"
            :src="previewUrl"
            class="w-full h-full absolute inset-0 border-none"
          ></iframe>

          <!-- Upload Placeholder -->
          <div
            v-else
            @click="!isViewOnly ? $refs.fileInput.click() : null"
            class="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 transition-colors"
            :class="
              !isViewOnly
                ? 'cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800'
                : 'cursor-default'
            "
          >
            <div
              class="w-16 h-16 rounded-full flex items-center justify-center mb-3 bg-red-50 dark:bg-red-900/20 text-red-500"
            >
              <i class="fas fa-file-pdf text-2xl"></i>
            </div>
            <p class="text-xs font-bold text-slate-700 dark:text-slate-300">
              Upload {{ documentLabel }} PDF
            </p>
            <p class="text-[10px] text-slate-500">
              {{
                isViewOnly ? "Dokumen tidak tersedia" : "Klik untuk pilih file"
              }}
            </p>
          </div>
        </div>

        <input
          ref="fileInput"
          type="file"
          accept=".pdf,application/pdf"
          @change="handleFileSelect"
          class="hidden"
        />
      </div>
    </div>

    <template #footer>
      <!-- Custom Footer from Parent (if provided via slot) -->
      <slot
        name="footer-actions"
        :isViewOnly="isViewOnly"
        :isEditing="!isViewOnly"
        :cancelEdit="cancelEdit"
      >
        <!-- Default Footer (if no custom footer provided) -->
        <div
          v-if="!isViewOnly"
          class="flex items-center justify-end gap-3 w-full"
        >
          <button
            @click="handleClose"
            type="button"
            class="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            Batal
          </button>
          <button
            @click="handleSave"
            :disabled="
              !canSave || saving || (showValidation && !isAllValidated)
            "
            type="button"
            class="px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2 transform active:scale-95"
            :class="buttonClasses"
            :title="
              showValidation && !isAllValidated
                ? 'Validasi semua kolom terlebih dahulu'
                : 'Simpan Dokumen'
            "
          >
            <i v-if="saving" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-save"></i>
            {{ saving ? "Menyimpan..." : "Simpan Dokumen" }}
          </button>
        </div>
      </slot>
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from "~/components/BaseModal.vue";

const {
  error: showError,
  success: showSuccess,
  info: showInfo,
  hideToast, // Extract hideToast
} = useToast();

const props = defineProps({
  show: Boolean,
  documentType: {
    type: String,
    required: true,
    validator: (value) =>
      [
        "npwp",
        "spt",
        "pkp",
        "kswp",
        "pengalaman",
        "sertifikat",
        "kontrak",
      ].includes(value),
  },
  companyName: String,
  isEditMode: Boolean,
  existingFileUrl: String,
  // New Validation Props
  showValidation: {
    type: Boolean,
    default: false,
  },
  isAllValidated: {
    type: Boolean,
    default: true, // Default true so it doesn't block saving if validation feature isn't used
  },
});

const emit = defineEmits([
  "close",
  "close",
  "save",
  "scan-complete",
  "validate-all",
  "fileSelected",
]);

// Helper to prevent Enter key from submitting form (except Textarea)
const handleEnterKey = (e) => {
  if (e.target.tagName !== "TEXTAREA") {
    e.preventDefault();
  }
};

const documentConfig = {
  npwp: {
    label: "NPWP Perusahaan",
    icon: "fas fa-id-card",
    iconBg: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    button:
      "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/30",
  },
  spt: {
    label: "SPT (Surat Pemberitahuan Tahunan)",
    icon: "fas fa-file-invoice",
    iconBg:
      "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    button:
      "bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-purple-500/30",
  },
  pkp: {
    label: "PKP (Pengukuhan Kena Pajak)",
    icon: "fas fa-stamp",
    iconBg:
      "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    button:
      "bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-orange-500/30",
  },
  kswp: {
    label: "KSWP (Kepatuhan Wajib Pajak)",
    icon: "fas fa-check-double",
    iconBg:
      "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    button:
      "bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/30",
  },
  pengalaman: {
    label: "Daftar Pengalaman",
    icon: "fas fa-briefcase",
    iconBg:
      "bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400",
    button:
      "bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white shadow-indigo-500/30",
  },
  sertifikat: {
    label: "Sertifikat Standar",
    icon: "fas fa-award",
    iconBg: "bg-teal-50 dark:bg-teal-900/20 text-teal-600 dark:text-teal-400",
    button:
      "bg-gradient-to-r from-teal-600 to-green-600 hover:from-teal-500 hover:to-green-500 text-white shadow-teal-500/30",
  },
  kontrak: {
    label: "Kontrak Kerjasama",
    icon: "fas fa-file-contract",
    iconBg: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    button:
      "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/30",
  },
};

const config = computed(() => documentConfig[props.documentType]);
const documentLabel = computed(() => config.value.label);
const iconClass = computed(() => config.value.icon);
const iconBackgroundClass = computed(() => config.value.iconBg);
const buttonClasses = computed(() => config.value.button);

// File handling
const fileInput = ref(null);
const selectedFile = ref(null);
const previewUrl = ref(props.existingFileUrl || "");
const saving = ref(false);

// AI Scanning state
const isScanning = ref(false);
const runtimeConfig = useRuntimeConfig();

// AI Scan function
const scanWithAI = async () => {
  if (!selectedFile.value && !props.existingFileUrl) {
    showError("Pilih atau upload file terlebih dahulu untuk dipindai");
    return;
  }

  isScanning.value = true;
  // Show persistent scanning toast
  const scanToastId = showInfo("Sedang memindai dokumen dengan AI...", 0); // 0 for persistent

  try {
    let response;

    if (selectedFile.value) {
      // Case 1: Scanning a local file (Upload)
      const formData = new FormData();
      formData.append("file", selectedFile.value);
      formData.append(
        "documentType",
        props.documentType === "pengalaman"
          ? "daftarPengalaman"
          : props.documentType,
      );

      console.log(
        `[AI SCAN] Sending ${props.documentType.toUpperCase()} (File) to AI for analysis...`,
      );

      // Determine endpoint based on type
      const endpoint =
        props.documentType === "pengalaman"
          ? `${runtimeConfig.public.apiBaseUrl}/ai/scan-document`
          : props.documentType === "sertifikat"
            ? `${runtimeConfig.public.apiBaseUrl}/ai/scan-document`
            : `${runtimeConfig.public.apiBaseUrl}/ai/scan-tax-document`;

      response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
    } else {
      // Case 2: Scanning an existing Drive file (URL)
      console.log(
        `[AI SCAN] Sending ${props.documentType.toUpperCase()} (URL) to AI for analysis...`,
      );

      // Extract fileId from Drive URL if possible, or send the full URL
      // Adjust endpoint/body based on your backend implementation for Drive scanning
      // This matches the logic usually found in 'handleAiScan' for drive files
      response = await fetch(
        `${runtimeConfig.public.apiBaseUrl}/ai/scan-drive-file`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileUrl: props.existingFileUrl,
            documentType:
              props.documentType === "pengalaman"
                ? "daftarPengalaman"
                : props.documentType, // Ensure backend supports this for context
            instruction: `Extract ${props.documentType} details`, // Generic fallback instruction
          }),
        },
      );
    }

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage =
        errorData.message || errorData.error || "Gagal memindai dokumen";

      // Provide specific error messages
      let userMessage = errorMessage;

      if (
        errorMessage.toLowerCase().includes("extract") ||
        errorMessage.toLowerCase().includes("json")
      ) {
        userMessage = `PDF tidak dapat dibaca oleh AI. Kemungkinan: dokumen berupa gambar/scan yang tidak jelas, file rusak, atau bukan dokumen ${props.documentType.toUpperCase()} yang valid. Silakan upload ulang dengan file yang lebih jelas atau isi form secara manual.`;
      } else if (
        errorMessage.toLowerCase().includes("file") ||
        errorMessage.toLowerCase().includes("pdf")
      ) {
        userMessage =
          "File PDF rusak atau tidak valid. Silakan upload file yang berbeda.";
      } else if (
        errorMessage.toLowerCase().includes("timeout") ||
        errorMessage.toLowerCase().includes("time out")
      ) {
        userMessage =
          "Waktu pemindaian habis. File mungkin terlalu besar atau kompleks. Silakan coba lagi atau isi manual.";
      }

      // showError("Gagal Memindai Dokumen", userMessage); // Removed to prevent double toast
      throw new Error(userMessage);
    }

    const result = await response.json();

    // Hide scanning toast
    if (scanToastId) {
      // Assuming useToast provides a hide function or using a way to clear it.
      // If useToast doesn't return an ID or hide function from showInfo, we might need a different approach.
      // Based on typical toast libraries used here (vue-toastification or similar wrapper):
      // The wrapper provided `error`, `success`, `info`. Check if they return an object/ID.
      // In [id].vue line 3521: const uploadToastId = toast.info(..., 0); toast.hideToast(uploadToastId);
      // So we need access to hideToast.
      // Let's assume we can get hideToast from useToast() if we destructure it.
    }

    // Check if result has valid data
    if (!result.success || !result.data) {
      showError(
        "Data tidak lengkap. AI tidak dapat menemukan informasi yang cukup di dokumen. Silakan isi form secara manual.",
      );
      throw new Error("Invalid or incomplete data from AI");
    }

    console.log("[AI SCAN] ✅ Success:", result.data);

    // Emit scanned data to parent component (parent will handle toast)
    emit("scan-complete", result.data);

    // Hide persistent scanning toast
    hideToast(scanToastId);
  } catch (err) {
    console.error("[AI SCAN] ❌ Error:", err);
    hideToast(scanToastId); // Hide loading toast on error

    // Only show error toast if not already shown above
    if (!err.message.includes("PDF tidak dapat dibaca")) {
      showError(
        "Gagal Memindai Dokumen",
        err.message ||
          "Terjadi kesalahan saat memindai dokumen. Silakan coba lagi atau isi form secara manual.",
      );
    }
  } finally {
    isScanning.value = false;
  }
};

// Watch for external file URL changes (for edit mode)
watch(
  () => props.existingFileUrl,
  (newUrl) => {
    if (newUrl && !selectedFile.value) {
      previewUrl.value =
        newUrl.includes("drive.google.com") && newUrl.includes("/view")
          ? newUrl.replace("/view", "/preview")
          : newUrl;
    }
  },
);

// View Only Logic
const isViewOnly = ref(false);

// Watch for show changes to reset state
watch(
  () => props.show,
  (newShow) => {
    if (newShow) {
      // Initialize view mode based on isEditMode (existing data)
      // If isEditMode is true, we start in View Only mode
      // If isEditMode is false (Add), we start in Edit mode (isViewOnly = false)
      isViewOnly.value = props.isEditMode;
    } else {
      // Modal closed - reset everything
      saving.value = false;
      selectedFile.value = null;
      if (!props.existingFileUrl) {
        previewUrl.value = "";
      }
      isViewOnly.value = false;
    }
  },
);

// Watch props.isEditMode change while open (rare but possible)
watch(
  () => props.isEditMode,
  (val) => {
    if (props.show) {
      isViewOnly.value = val;
    }
  },
);

// Set initial preview if editing
onMounted(() => {
  if (props.existingFileUrl) {
    previewUrl.value =
      props.existingFileUrl.includes("drive.google.com") &&
      props.existingFileUrl.includes("/view")
        ? props.existingFileUrl.replace("/view", "/preview")
        : props.existingFileUrl;
  }
});

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  // Validate file type
  if (file.type !== "application/pdf") {
    showError("File harus berformat PDF");
    return;
  }

  // Validate file size (80MB)
  if (file.size > 80 * 1024 * 1024) {
    showError("Ukuran file maksimal 80MB");
    return;
  }

  selectedFile.value = file;

  // Create preview URL
  if (previewUrl.value && previewUrl.value.startsWith("blob:")) {
    URL.revokeObjectURL(previewUrl.value);
  }
  previewUrl.value = URL.createObjectURL(file);

  // Emit event to parent to enable validation buttons
  emit("fileSelected", file);
};

const removeFile = () => {
  selectedFile.value = null;
  previewUrl.value = "";
  if (fileInput.value) {
    fileInput.value.value = "";
  }
};

const hasFileUpload = computed(() => {
  return selectedFile.value !== null || !!previewUrl.value;
});

const canSave = computed(() => {
  // In add mode: must have file
  // In edit mode: can save without new file (just updating data)
  return props.isEditMode ? true : selectedFile.value !== null;
});

const handleClose = () => {
  removeFile();
  saving.value = false;
  emit("close");
};

const handleSave = async () => {
  if (saving.value) return;

  saving.value = true;
  try {
    await emit("save", selectedFile.value);
  } finally {
    // Don't reset saving here - parent will close modal
  }
};

const cancelEdit = () => {
  if (props.isEditMode) {
    // If editing existing data, return to view only
    isViewOnly.value = true;
  } else {
    // If adding new, close modal
    handleClose();
  }
};

const handleEditClick = () => {
  isViewOnly.value = false;
  // Trigger fileSelected to enable validation in parent (as if a file was just selected)
  // We pass a dummy 'true' or null just to trigger the event listener logic
  emit("fileSelected", null);
};

// Expose methods and data
defineExpose({
  selectedFile,
  setSaving: (state) => {
    saving.value = state;
  },
  reset: () => {
    removeFile();
    saving.value = false;
  },
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
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(107, 114, 128, 0.6);
}
</style>
