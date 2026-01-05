<template>
  <BaseModal :show="show" @close="handleClose" maxWidth="7xl">
    <template #header>
      <div class="flex items-center gap-4">
        <div
          class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400"
        >
          <i class="fas fa-briefcase text-xl"></i>
        </div>
        <div>
          <h3
            class="text-xl font-bold text-slate-900 dark:text-white tracking-tight"
          >
            {{ isEditMode ? "Edit" : "Tambah" }} Pengalaman
          </h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">
            Formulir Data Kontrak & Dokumen Pendukung
          </p>
        </div>
      </div>
    </template>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Denser Form -->
      <div class="lg:col-span-2">
        <div
          class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col h-[400px] overflow-hidden"
        >
          <!-- Header -->
          <div
            class="px-4 py-3 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50"
          >
            <div class="flex items-center gap-2">
              <span class="w-1 h-3 bg-purple-500 rounded-full"></span>
              <h4
                class="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wide"
              >
                Data Pekerjaan
              </h4>
            </div>
            <!-- Manual Lock Button Removed -->
          </div>

          <!-- Content (Scrollable) -->
          <div
            class="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-2 bg-white dark:bg-slate-800"
          >
            <!-- Nama Pekerjaan -->
            <div class="group">
              <label
                class="block text-[10px] font-bold text-slate-500 uppercase mb-0.5"
                >Nama Pekerjaan</label
              >
              <textarea
                v-model="formData.nama_pekerjaan"
                :disabled="!isFormEnabled"
                rows="2"
                class="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded text-xs focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none disabled:opacity-60 disabled:cursor-not-allowed"
                placeholder="Nama Paket Pekerjaan..."
              ></textarea>
            </div>

            <!-- Row 1: Klasifikasi -->
            <div class="grid grid-cols-3 gap-2">
              <div class="group">
                <label
                  class="block text-[10px] font-bold text-slate-500 uppercase mb-0.5"
                  >Bidang</label
                >
                <input
                  v-model="formData.bidang_pekerjaan"
                  :disabled="!isFormEnabled"
                  type="text"
                  class="w-full px-2 py-1 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              <div class="group">
                <label
                  class="block text-[10px] font-bold text-slate-500 uppercase mb-0.5"
                  >Sub Bidang</label
                >
                <input
                  v-model="formData.sub_bidang_pekerjaan"
                  :disabled="!isFormEnabled"
                  type="text"
                  class="w-full px-2 py-1 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              <div class="group">
                <label
                  class="block text-[10px] font-bold text-slate-500 uppercase mb-0.5"
                  >Lokasi</label
                >
                <input
                  v-model="formData.lokasi"
                  :disabled="!isFormEnabled"
                  type="text"
                  class="w-full px-2 py-1 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            <div
              class="border-t border-dashed border-slate-100 dark:border-slate-700 my-1"
            ></div>

            <!-- Row 2: Pemberi Tugas -->
            <div class="grid grid-cols-12 gap-2">
              <div class="col-span-4 group">
                <label
                  class="block text-[10px] font-bold text-slate-500 uppercase mb-0.5"
                  >Pemberi Tugas</label
                >
                <input
                  v-model="formData.nama_pemberi_tugas"
                  :disabled="!isFormEnabled"
                  type="text"
                  class="w-full px-2 py-1 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded text-xs font-medium disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="Instansi"
                />
              </div>
              <div class="col-span-8 group">
                <label
                  class="block text-[10px] font-bold text-slate-500 uppercase mb-0.5"
                  >Alamat</label
                >
                <input
                  v-model="formData.alamat_pemberi_tugas"
                  :disabled="!isFormEnabled"
                  type="text"
                  class="w-full px-2 py-1 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="Jalan..."
                />
              </div>
            </div>

            <!-- Row 3: Kontrak Data -->
            <div class="grid grid-cols-3 gap-2">
              <div class="group">
                <label
                  class="block text-[10px] font-bold text-slate-500 uppercase mb-0.5"
                  >No. Kontrak</label
                >
                <input
                  v-model="formData.nomor_kontrak"
                  :disabled="!isFormEnabled"
                  type="text"
                  class="w-full px-2 py-1 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              <div class="group">
                <label
                  class="block text-[10px] font-bold text-slate-500 uppercase mb-0.5"
                  >Tanggal</label
                >
                <input
                  v-model="formData.tanggal_kontrak"
                  :disabled="!isFormEnabled"
                  type="date"
                  class="w-full px-2 py-1 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              <div class="group">
                <label
                  class="block text-[10px] font-bold text-slate-500 uppercase mb-0.5"
                  >Nilai (Rp)</label
                >
                <input
                  v-model="formData.nilai_kontrak"
                  :disabled="!isFormEnabled"
                  type="number"
                  class="w-full px-2 py-1 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded text-xs font-mono font-bold text-slate-700 disabled:opacity-60 disabled:cursor-not-allowed"
                  placeholder="0"
                />
              </div>
            </div>

            <!-- Row 4: Tanggal Selesai & Serah Terima -->
            <div class="grid grid-cols-2 gap-2">
              <div class="group">
                <label
                  class="block text-[10px] font-bold text-slate-500 uppercase mb-0.5"
                  >Selesai</label
                >
                <input
                  v-model="formData.tanggal_selesai_kontrak"
                  :disabled="!isFormEnabled"
                  type="date"
                  class="w-full px-2 py-1 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
              <div class="group">
                <label
                  class="block text-[10px] font-bold text-slate-500 uppercase mb-0.5"
                  >BA Serah Terima</label
                >
                <input
                  v-model="formData.tanggal_ba_serah_terima"
                  :disabled="!isFormEnabled"
                  type="date"
                  class="w-full px-2 py-1 bg-slate-50 dark:bg-slate-700/50 border border-slate-200 dark:border-slate-600 rounded text-xs disabled:opacity-60 disabled:cursor-not-allowed"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Column: DocumentPdfPreview Style -->
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
              Dokumen Kontrak
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

          <!-- Upload Placeholder (Replicating style) -->
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
              Upload Kontrak PDF
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
          class="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-sm"
        >
          Batal
        </button>
        <button
          @click="handleSave"
          :disabled="saving"
          type="button"
          class="px-6 py-2.5 rounded-xl font-bold text-white transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2 transform active:scale-95 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 shadow-purple-500/30 text-sm"
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

const toast = useToast();
const { loadingScan, successScan, removeToast } = toast;
const runtimeConfig = useRuntimeConfig();

const props = defineProps({
  show: Boolean,
  isEditMode: Boolean,
  existingFileUrl: String,
  initialData: {
    type: Object,
    default: () => ({}),
  },
  saving: Boolean,
});

const emit = defineEmits(["close", "save", "aiScanComplete"]);

// Form Data
const formData = ref({
  nama_pekerjaan: "",
  bidang_pekerjaan: "",
  sub_bidang_pekerjaan: "",
  lokasi: "",
  nama_pemberi_tugas: "",
  alamat_pemberi_tugas: "",
  nomor_kontrak: "",
  tanggal_kontrak: "",
  nilai_kontrak: "",
  tanggal_selesai_kontrak: "",
  tanggal_ba_serah_terima: "",
});

const fileInput = ref(null);
const selectedFile = ref(null);
const previewUrl = ref("");
const isScanning = ref(false);
const manualMode = ref(false);

const isFormEnabled = computed(() => {
  return props.isEditMode || selectedFile.value || manualMode.value;
});

// Watchers
watch(
  () => props.show,
  (newVal) => {
    if (newVal) {
      if (props.isEditMode && props.initialData) {
        formData.value = { ...props.initialData };
        previewUrl.value = props.existingFileUrl
          ? convertDriveUrl(props.existingFileUrl)
          : "";
      } else {
        resetForm();
      }
    } else {
      resetForm();
    }
  }
);

const resetForm = () => {
  formData.value = {
    nama_pekerjaan: "",
    bidang_pekerjaan: "",
    sub_bidang_pekerjaan: "",
    lokasi: "",
    nama_pemberi_tugas: "",
    alamat_pemberi_tugas: "",
    nomor_kontrak: "",
    tanggal_kontrak: "",
    nilai_kontrak: "",
    tanggal_selesai_kontrak: "",
    tanggal_ba_serah_terima: "",
  };
  selectedFile.value = null;
  previewUrl.value = "";
  manualMode.value = false;
};

const convertDriveUrl = (url) => {
  if (!url) return "";
  if (url.includes("drive.google.com") && url.includes("/view")) {
    return url.replace("/view", "/preview");
  }
  return url;
};

const handleFileSelect = (event) => {
  const file = event.target.files[0];
  if (!file) return;

  if (file.type !== "application/pdf") {
    toast.error("File harus berformat PDF");
    return;
  }

  if (file.size > 80 * 1024 * 1024) {
    toast.error("Ukuran file maksimal 80MB");
    return;
  }

  selectedFile.value = file;

  const reader = new FileReader();
  reader.onload = (e) => {
    previewUrl.value = e.target.result;
  };
  reader.readAsDataURL(file);
};

const handleClose = () => {
  emit("close");
};

const handleSave = () => {
  emit("save", { data: formData.value, file: selectedFile.value });
};

const scanWithAI = async () => {
  if (!selectedFile.value) return;
  isScanning.value = true;
  let loadId = null;

  try {
    loadId = loadingScan();

    const fdata = new FormData();
    fdata.append("file", selectedFile.value);
    fdata.append("documentType", "kontrak_pengalaman");

    const res = await fetch(
      `${runtimeConfig.public.apiBaseUrl}/ai/scan-generic`,
      {
        method: "POST",
        body: fdata,
      }
    );

    if (!res.ok) throw new Error("Gagal scan AI");
    const result = await res.json();
    const extracted = result.data;

    if (extracted) {
      if (extracted.nama_pekerjaan)
        formData.value.nama_pekerjaan = extracted.nama_pekerjaan;
      if (extracted.bidang_pekerjaan)
        formData.value.bidang_pekerjaan = extracted.bidang_pekerjaan;
      if (extracted.sub_bidang_pekerjaan)
        formData.value.sub_bidang_pekerjaan = extracted.sub_bidang_pekerjaan;
      if (extracted.lokasi) formData.value.lokasi = extracted.lokasi;
      if (extracted.nama_pemberi_tugas)
        formData.value.nama_pemberi_tugas = extracted.nama_pemberi_tugas;
      if (extracted.alamat_pemberi_tugas)
        formData.value.alamat_pemberi_tugas = extracted.alamat_pemberi_tugas;
      if (extracted.nomor_kontrak)
        formData.value.nomor_kontrak = extracted.nomor_kontrak;
      if (extracted.tanggal_kontrak)
        formData.value.tanggal_kontrak = extracted.tanggal_kontrak;
      if (extracted.nilai_kontrak)
        formData.value.nilai_kontrak = extracted.nilai_kontrak;
      if (extracted.tanggal_selesai_kontrak)
        formData.value.tanggal_selesai_kontrak =
          extracted.tanggal_selesai_kontrak;
      if (extracted.tanggal_ba_serah_terima)
        formData.value.tanggal_ba_serah_terima =
          extracted.tanggal_ba_serah_terima;

      successScan("Data berhasil diekstrak!");
    }
  } catch (e) {
    console.error(e);
    toast.error("Gagal melakukan AI Scan: " + e.message);
  } finally {
    isScanning.value = false;
    if (loadId) removeToast(loadId);
  }
};
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
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
