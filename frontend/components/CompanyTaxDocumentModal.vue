<template>
  <BaseModal :show="show" @close="handleClose" maxWidth="7xl">
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
            {{ isEditMode ? "Edit" : "Tambah" }} {{ documentLabel }}
          </h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">
            {{ companyName }}
          </p>
        </div>
      </div>
    </template>

    <div
      class="grid grid-cols-1 lg:grid-cols-3 gap-6"
      @keydown.enter="handleEnterKey"
    >
      <!-- Left Column: Form Fields (2 cols) - Scrollable -->
      <div class="lg:col-span-2">
        <div
          class="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col h-[400px]"
        >
          <h4
            class="text-xs font-bold text-slate-900 dark:text-slate-100 px-4 pt-4 pb-3 flex items-center gap-2 flex-shrink-0"
          >
            <span class="w-1 h-3 bg-blue-500 rounded-full"></span>
            Informasi Dokumen
          </h4>

          <!-- Scrollable Form Container -->
          <div class="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4">
            <slot
              name="form-fields"
              :disabled="!hasFileUpload && !isEditMode"
              :hasFileUpload="hasFileUpload"
            ></slot>

            <!-- Footer Actions Slot (for validation buttons) -->
            <div
              class="sticky bottom-0 z-10 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-200 dark:border-slate-700 py-3 mt-2"
            >
              <slot name="footer-actions"></slot>
            </div>
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
            <!-- AI Scan Button (Visible if file exists) -->
            <button
              v-if="selectedFile"
              @click="scanWithAI"
              :disabled="isScanning"
              class="px-3 py-1 bg-purple-100 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700 rounded text-[10px] font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors flex items-center gap-1"
            >
              <i
                :class="isScanning ? 'fas fa-spinner fa-spin' : 'fas fa-magic'"
              ></i>
              <span>AI Scan</span>
            </button>

            <!-- Change/Upload Button -->
            <button
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
            @click="$refs.fileInput.click()"
            class="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
          >
            <div
              class="w-16 h-16 rounded-full flex items-center justify-center mb-3 bg-red-50 dark:bg-red-900/20 text-red-500"
            >
              <i class="fas fa-file-pdf text-2xl"></i>
            </div>
            <p class="text-xs font-bold text-slate-700 dark:text-slate-300">
              Upload {{ documentLabel }} PDF
            </p>
            <p class="text-[10px] text-slate-500">Klik untuk pilih file</p>
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
      <div class="flex items-center justify-end gap-3 w-full">
        <button
          @click="handleClose"
          type="button"
          class="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          Batal
        </button>
        <button
          @click="handleSave"
          :disabled="!canSave || saving"
          type="button"
          class="px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2 transform active:scale-95"
          :class="buttonClasses"
        >
          <i v-if="saving" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-save"></i>
          {{ saving ? "Menyimpan..." : "Simpan Dokumen" }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from "~/components/BaseModal.vue";

const { error: showError, success: showSuccess, info: showInfo } = useToast();

const props = defineProps({
  show: Boolean,
  documentType: {
    type: String,
    required: true,
    validator: (value) => ["npwp", "spt", "pkp", "kswp"].includes(value),
  },
  companyName: String,
  isEditMode: Boolean,
  existingFileUrl: String,
});

const emit = defineEmits(["close", "save", "aiScanComplete"]);

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
  if (!selectedFile.value) {
    showError("Tidak ada file yang dipilih");
    return;
  }

  isScanning.value = true;

  // Show info toast that scanning has started
  showInfo(
    `Memindai dokumen ${props.documentType.toUpperCase()}...`,
    "Mohon tunggu sebentar"
  );

  try {
    // Create FormData to send PDF to backend
    const formData = new FormData();
    formData.append("file", selectedFile.value);
    formData.append("documentType", props.documentType);

    console.log(
      `[AI SCAN] Sending ${props.documentType.toUpperCase()} to AI for analysis...`
    );

    // Call backend API
    const response = await fetch(
      `${runtimeConfig.public.apiBaseUrl}/ai/scan-tax-document`,
      {
        method: "POST",
        body: formData,
      }
    );

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

      showError("Gagal Memindai Dokumen", userMessage);
      throw new Error(userMessage);
    }

    const result = await response.json();

    // Check if result has valid data
    if (!result.success || !result.data) {
      showError(
        "Data tidak lengkap. AI tidak dapat menemukan informasi yang cukup di dokumen. Silakan isi form secara manual."
      );
      throw new Error("Invalid or incomplete data from AI");
    }

    console.log("[AI SCAN] ✅ Success:", result.data);

    // Count extracted fields
    const extractedFields = Object.keys(result.data).filter(
      (key) => result.data[key] && result.data[key] !== ""
    ).length;

    // Show success toast with info about extracted fields
    showSuccess(
      `Data ${props.documentType.toUpperCase()} berhasil dipindai!`,
      `${extractedFields} field terisi otomatis. Silakan periksa dan edit jika diperlukan.`
    );

    // Emit scanned data to parent component
    emit("aiScanComplete", result.data);
  } catch (err) {
    console.error("[AI SCAN] ❌ Error:", err);

    // Only show error toast if not already shown above
    if (!err.message.includes("PDF tidak dapat dibaca")) {
      showError(
        "Gagal Memindai Dokumen",
        err.message ||
          "Terjadi kesalahan saat memindai dokumen. Silakan coba lagi atau isi form secara manual."
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
  }
);

// Reset state when modal closes
watch(
  () => props.show,
  (newShow) => {
    if (!newShow) {
      // Modal closed - reset everything
      saving.value = false;
      selectedFile.value = null;
      if (!props.existingFileUrl) {
        previewUrl.value = "";
      }
    }
  }
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
  const reader = new FileReader();
  reader.onload = (e) => {
    previewUrl.value = e.target.result;
  };
  reader.readAsDataURL(file);
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

// Expose methods
defineExpose({
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
