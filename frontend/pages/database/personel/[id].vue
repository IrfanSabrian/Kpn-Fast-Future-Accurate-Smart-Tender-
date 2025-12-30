<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
    <!-- Uniform Header Component (Matches Company Header) -->
    <PersonnelDetailHeader
      :person="person"
      :active-tab="selectedDocument"
      :tabs="documentTabs"
      :initials="person ? getInitials(person.nama_lengkap) : '?'"
      @back="router.push('/database/personel')"
      @tab-change="selectedDocument = $event"
    >
      <template #actions>
        <button
          @click="openEditContactInfo"
          class="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 rounded-lg transition-colors border border-slate-200 dark:border-slate-700 flex items-center gap-2"
        >
          <i class="fas fa-pen"></i> Edit Kontak
        </button>
        <button
          @click="openDeleteContactConfirm"
          class="w-9 h-9 flex items-center justify-center rounded-lg bg-red-50 text-red-500 hover:bg-red-100 dark:bg-red-900/10 dark:text-red-400 dark:hover:bg-red-900/20 transition-all border border-red-100 dark:border-red-900/30"
          title="Hapus Kontak"
        >
          <i class="fas fa-trash-alt"></i>
        </button>
      </template>
    </PersonnelDetailHeader>

    <!-- Main Content (Standard Container Matching Company Page) -->
    <main class="max-w-[1800px] mx-auto px-4 md:px-6 py-6 min-h-[60vh]">
      <!-- Loading State -->
      <div v-if="loading">
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div class="space-y-4">
            <BaseSkeleton width="100%" height="5rem" />
            <BaseSkeleton width="100%" height="3rem" />
            <BaseSkeleton width="100%" height="12rem" />
          </div>
          <div class="hidden lg:block">
            <BaseSkeleton
              width="100%"
              height="20rem"
              class-name="rounded-2xl"
            />
          </div>
        </div>
      </div>

      <!-- Content -->
      <div v-else class="animate-fade-in-up">
        <Transition name="fade" mode="out-in">
          <div :key="selectedDocument">
            <!-- Using Dedicated PersonnelDocumentTab for specific scrolling needs -->
            <PersonnelDocumentTab
              ref="activeTabComponent"
              v-if="selectedDocument === 'ktp'"
              :items="ktp ? [ktp] : []"
              :fields="ktpFields"
              id-key="id_ktp"
              title-key="nik"
              title-label="NIK"
              icon="far fa-id-card"
              color="blue"
              :single-mode="true"
              document-type="ktp"
              :pending-file="pendingUploads.ktp.file"
              :pending-preview="pendingUploads.ktp.preview"
              :is-uploading="uploadingState.ktp"
              :selected-url="ktp?.file_ktp_url"
              @upload-select="(f) => handleUploadSelect(f)"
              @upload-save="handleUploadSave"
              @upload-cancel="
                () => {
                  pendingUploads.ktp.file = null;
                  pendingUploads.ktp.preview = null;
                }
              "
              @update-item="handleUpdateItem"
            />
            <PersonnelDocumentTab
              ref="activeTabComponent"
              v-if="selectedDocument === 'npwp'"
              :items="npwp ? [npwp] : []"
              :fields="npwpFields"
              id-key="id_npwp"
              title-key="nomor_npwp_personel"
              title-label="Nomor NPWP"
              icon="fas fa-credit-card"
              color="orange"
              :single-mode="true"
              document-type="npwp"
              :pending-file="pendingUploads.npwp.file"
              :pending-preview="pendingUploads.npwp.preview"
              :is-uploading="uploadingState.npwp"
              :selected-url="npwp?.file_npwp_personel_url"
              @upload-select="(f) => handleUploadSelect(f)"
              @upload-save="handleUploadSave"
              @upload-cancel="
                () => {
                  pendingUploads.npwp.file = null;
                  pendingUploads.npwp.preview = null;
                }
              "
              @update-item="handleUpdateItem"
            />
            <PersonnelDocumentTab
              ref="activeTabComponent"
              v-if="selectedDocument === 'ijazah'"
              :items="ijazah ? [ijazah] : []"
              :fields="ijazahFields"
              id-key="id_ijazah"
              title-key="nomor_ijazah"
              title-label="No. Ijazah"
              icon="fas fa-graduation-cap"
              color="purple"
              :single-mode="true"
              document-type="ijazah"
              :pending-file="pendingUploads.ijazah.file"
              :pending-preview="pendingUploads.ijazah.preview"
              :is-uploading="uploadingState.ijazah"
              :selected-url="ijazah?.file_ijazah_url"
              @upload-select="(f) => handleUploadSelect(f)"
              @upload-save="handleUploadSave"
              @upload-cancel="
                () => {
                  pendingUploads.ijazah.file = null;
                  pendingUploads.ijazah.preview = null;
                }
              "
              @update-item="handleUpdateItem"
            />
            <PersonnelDocumentTab
              ref="activeTabComponent"
              v-if="selectedDocument === 'cv'"
              :items="cv ? [cv] : []"
              :fields="cvFields"
              id-key="id_cv"
              title-key="nama_lengkap_cv"
              title-label="Nama Lengkap"
              icon="fas fa-file-alt"
              color="emerald"
              :single-mode="true"
              document-type="cv"
              :pending-file="pendingUploads.cv.file"
              :pending-preview="pendingUploads.cv.preview"
              :is-uploading="uploadingState.cv"
              :selected-url="cv?.file_cv_url"
              @upload-select="(f) => handleUploadSelect(f)"
              @upload-save="handleUploadSave"
              @upload-cancel="
                () => {
                  pendingUploads.cv.file = null;
                  pendingUploads.cv.preview = null;
                }
              "
              @update-item="handleUpdateItem"
            />
            <PersonnelDocumentTab
              ref="activeTabComponent"
              v-if="selectedDocument === 'referensi'"
              :items="referensi"
              :fields="referensiFields"
              id-key="id_referensi"
              title-key="pengalaman"
              title-label="Pengalaman"
              icon="fas fa-briefcase"
              color="cyan"
              :single-mode="false"
              document-type="referensi"
              :pending-file="pendingUploads.referensi.file"
              :pending-preview="pendingUploads.referensi.preview"
              :is-uploading="uploadingState.referensi"
              :selected-item="selectedReferensiItem"
              :selected-url="selectedReferensiItem?.url_referensi"
              @select-item="(item) => (selectedReferensiId = item.id_referensi)"
              @upload-select="(f) => handleUploadSelect(f)"
              @upload-save="handleUploadSave"
              @upload-cancel="
                () => {
                  pendingUploads.referensi.file = null;
                  pendingUploads.referensi.preview = null;
                }
              "
              @update-item="handleUpdateItem"
            />
            <PersonnelDocumentTab
              ref="activeTabComponent"
              v-if="selectedDocument === 'stnk'"
              :items="stnk"
              :fields="stnkFields"
              id-key="id_stnk"
              title-key="no_polisi"
              title-label="No. Polisi"
              icon="fas fa-car"
              color="teal"
              :single-mode="false"
              document-type="stnk"
              :pending-file="pendingUploads.stnk.file"
              :pending-preview="pendingUploads.stnk.preview"
              :is-uploading="uploadingState.stnk"
              :selected-item="selectedStnkItem"
              :selected-url="selectedStnkItem?.url_stnk"
              @select-item="(item) => (selectedStnkId = item.id_stnk)"
              @upload-select="(f) => handleUploadSelect(f)"
              @upload-save="handleUploadSave"
              @upload-cancel="
                () => {
                  pendingUploads.stnk.file = null;
                  pendingUploads.stnk.preview = null;
                }
              "
              @update-item="handleUpdateItem"
            />
          </div>
        </Transition>
      </div>
    </main>

    <!-- Toast & Modals -->
    <BaseToast
      :show="toast.show"
      :type="toast.type"
      :title="toast.title"
      :message="toast.message"
      :duration="toast.duration"
      @close="hideToast"
    />

    <!-- Edit Contact Modal -->
    <BaseModal
      :show="showEditContactModal"
      @close="showEditContactModal = false"
      maxWidth="2xl"
    >
      <template #header>
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center"
          >
            <i class="fas fa-address-book"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">
              Edit Kontak
            </h3>
            <p class="text-xs text-slate-500">
              Update informasi kontak personel.
            </p>
          </div>
        </div>
      </template>
      <div class="space-y-4">
        <div>
          <label
            class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2"
            >No. Telepon</label
          ><input
            v-model="contactFormData.no_hp"
            type="text"
            class="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
          />
        </div>
        <div>
          <label
            class="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2"
            >Alamat Domisili</label
          ><textarea
            v-model="contactFormData.alamat_domisili"
            rows="3"
            class="w-full px-3 py-2 text-sm border border-slate-300 dark:border-slate-600 rounded-lg dark:bg-slate-700 dark:text-white"
          ></textarea>
        </div>
        <div class="flex justify-end gap-3 mt-4">
          <button
            @click="showEditContactModal = false"
            class="px-4 py-2 text-sm font-bold text-slate-500 hover:text-slate-700"
          >
            Batal
          </button>
          <button
            @click="saveContactInfo"
            :disabled="isSavingContact"
            class="px-4 py-2 text-sm font-bold bg-blue-600 text-white rounded-lg"
          >
            {{ isSavingContact ? "Menyimpan..." : "Simpan" }}
          </button>
        </div>
      </div>
    </BaseModal>

    <!-- Delete Contact Confirm -->
    <ConfirmDialog
      :show="showDeleteContactConfirm"
      title="Hapus Kontak?"
      message="Hapus nomor telepon dan alamat?"
      confirm-text="Hapus"
      cancel-text="Batal"
      :loading="isDeletingContact"
      type="danger"
      @confirm="handleDeleteContact"
      @cancel="showDeleteContactConfirm = false"
    />
  </div>
</template>

<script setup>
import BaseSkeleton from "~/components/BaseSkeleton.vue";
import BaseModal from "~/components/BaseModal.vue";
import BaseToast from "~/components/BaseToast.vue";
import ConfirmDialog from "~/components/ConfirmDialog.vue";
import PersonnelDetailHeader from "~/components/PersonnelDetailHeader.vue";
// Import dedicated Personnel Component
import PersonnelDocumentTab from "~/components/personnel/tabs/PersonnelDocumentTab.vue";

definePageMeta({ layout: "dashboard" });

const route = useRoute();
const router = useRouter();
const config = useRuntimeConfig();
const apiBaseUrl = config.public.apiBaseUrl;
const { toast, success, error: showError, hideToast, info } = useToast();

const loading = ref(true);
const person = ref(null);

const ktp = ref(null);
const npwp = ref(null);
const ijazah = ref(null);
const cv = ref(null);
const referensi = ref([]);
const stnk = ref([]);

const selectedReferensiId = ref(null);
const selectedStnkId = ref(null);

const selectedReferensiItem = computed(() =>
  referensi.value.find((r) => r.id_referensi === selectedReferensiId.value)
);
const selectedStnkItem = computed(() =>
  stnk.value.find((s) => s.id_stnk === selectedStnkId.value)
);

const pendingUploads = ref({
  ktp: { file: null, preview: null },
  npwp: { file: null, preview: null },
  ijazah: { file: null, preview: null },
  cv: { file: null, preview: null },
  referensi: { file: null, preview: null },
  stnk: { file: null, preview: null },
});
const uploadingState = ref({
  ktp: false,
  npwp: false,
  ijazah: false,
  cv: false,
  referensi: false,
  stnk: false,
});
const selectedDocument = ref("ktp");

const documentTabs = computed(() => [
  {
    id: "ktp",
    label: "KTP",
    icon: "far fa-id-card",
    hasData: !!(ktp.value && (ktp.value.id_ktp || ktp.value.file_ktp_url)),
  },
  {
    id: "npwp",
    label: "NPWP",
    icon: "fas fa-credit-card",
    hasData: !!(
      npwp.value &&
      (npwp.value.id_npwp || npwp.value.file_npwp_personel_url)
    ),
  },
  {
    id: "ijazah",
    label: "Ijazah",
    icon: "fas fa-graduation-cap",
    hasData: !!(
      ijazah.value &&
      (ijazah.value.id_ijazah || ijazah.value.file_ijazah_url)
    ),
  },
  {
    id: "cv",
    label: "CV",
    icon: "fas fa-file-alt",
    hasData: !!(cv.value && (cv.value.id_cv || cv.value.file_cv_url)),
  },
  {
    id: "referensi",
    label: "Referensi",
    icon: "fas fa-briefcase",
    hasData: referensi.value && referensi.value.length > 0,
  },
  {
    id: "stnk",
    label: "STNK",
    icon: "fas fa-car",
    hasData: stnk.value && stnk.value.length > 0,
  },
]);

const ktpFields = [
  { label: "NIK", key: "nik", type: "text" },
  { label: "Nama Lengkap", key: "nama_ktp", type: "text" },
  { label: "Tempat Lahir", key: "tempat_lahir_ktp", type: "text" },
  { label: "Tanggal Lahir", key: "tanggal_lahir_ktp", type: "date" },
  {
    label: "Jenis Kelamin",
    key: "jenis_kelamin",
    type: "select",
    options: ["Laki-Laki", "Perempuan"],
  },
  { label: "Alamat", key: "alamat_ktp", type: "textarea" },
  { label: "RT/RW", key: "rt_rw", type: "text" },
  { label: "Kel/Desa", key: "kelurahan_desa", type: "text" },
  { label: "Kecamatan", key: "kecamatan", type: "text" },
  { label: "Kota/Kab", key: "kota_kabupaten", type: "text" },
  { label: "Provinsi", key: "provinsi", type: "text" },
  { label: "Agama", key: "agama", type: "text" },
  { label: "Status Kawin", key: "status_perkawinan", type: "text" },
  { label: "Pekerjaan", key: "pekerjaan", type: "text" },
  { label: "Kewarganegaraan", key: "kewarganegaraan", type: "text" },
  { label: "Berlaku Hingga", key: "berlaku_hingga", type: "text" },
  { label: "Tgl Terbit", key: "tanggal_terbit_ktp", type: "date" },
];

const npwpFields = [
  { label: "No. NPWP", key: "nomor_npwp_personel", type: "text" },
  { label: "NIK NPWP", key: "nik_npwp_personel", type: "text" },
  { label: "Nama WP", key: "nama_npwp_personel", type: "text" },
  { label: "Alamat NPWP", key: "alamat_npwp_personel", type: "textarea" },
  { label: "KPP", key: "kpp_npwp_personel", type: "text" },
];

const ijazahFields = [
  {
    label: "Jenjang",
    key: "jenjang_pendidikan",
    type: "select",
    options: ["SMA/SMK", "D3", "S1", "S2", "S3"],
  },
  { label: "Nama Institusi", key: "nama_institusi_pendidikan", type: "text" },
  { label: "Fakultas", key: "fakultas", type: "text" },
  { label: "Prodi", key: "program_studi", type: "text" },
  { label: "No. Ijazah", key: "nomor_ijazah", type: "text" },
  { label: "Thn Masuk", key: "tahun_masuk", type: "text" },
  { label: "Thn Lulus", key: "tahun_lulus", type: "text" },
  { label: "Gelar", key: "gelar_akademik", type: "text" },
  { label: "IPK", key: "ipk", type: "text" },
];

const cvFields = [
  { label: "Nama Lengkap", key: "nama_lengkap_cv", type: "text" },
  { label: "Ringkasan", key: "ringkasan_profil", type: "textarea" },
  { label: "Keahlian", key: "keahlian_utama", type: "text" },
  { label: "Thn Pengalaman", key: "total_pengalaman_tahun", type: "text" },
  { label: "Posisi Terakhir", key: "pengalaman_kerja_terakhir", type: "text" },
  { label: "Sertifikasi", key: "sertifikasi_profesional", type: "textarea" },
  { label: "Bahasa", key: "bahasa_dikuasai", type: "text" },
];

const referensiFields = [
  { label: "Pengalaman", key: "pengalaman", type: "textarea" },
  { label: "Tgl Input", key: "tanggal_input", type: "text" },
];

const stnkFields = [
  { label: "No. Polisi", key: "no_polisi", type: "text" },
  { label: "Merek", key: "merek", type: "text" },
  { label: "Warna", key: "warna", type: "text" },
  { label: "Tahun Pembuatan", key: "tahun_pembuatan", type: "text" },
];

const handleUploadSelect = (eventOrFile) => {
  const type = selectedDocument.value;

  // Handle both event object and direct file
  const file = eventOrFile?.target?.files?.[0] || eventOrFile;

  if (!file) {
    console.error("No file selected");
    return;
  }

  pendingUploads.value[type].file = file;
  const reader = new FileReader();
  reader.onload = (e) => {
    pendingUploads.value[type].preview = e.target.result;
  };
  reader.readAsDataURL(file);
};

const handleUploadSave = async () => {
  const type = selectedDocument.value;
  const file = pendingUploads.value[type].file;
  if (!file) return;
  uploadingState.value[type] = true;

  try {
    // Step 1: Upload to Google Drive
    info("Mengunggah dokumen ke Google Drive...", 5000);

    const uploadFormData = new FormData();
    uploadFormData.append("file", file);

    const uploadRes = await fetch(
      `${apiBaseUrl}/personnel-documents/${route.params.id}/${type}/upload`,
      { method: "POST", body: uploadFormData }
    );

    if (!uploadRes.ok) throw new Error("Gagal mengunggah file ke Drive");

    const uploadResult = await uploadRes.json();
    const fileUrl = uploadResult.data.fileUrl;

    // Step 2: Update Metadata/Database
    info("Menyimpan data dokumen...", 3000);

    let method = "PUT";
    let bodyPayload = { fileUrl: fileUrl };

    // Determine method and payload based on document type
    if (type === "stnk") {
      if (selectedStnkId.value) {
        // Updating existing STNK
        method = "PUT";
        bodyPayload.id_stnk = selectedStnkId.value;
      } else {
        // Creating new STNK
        method = "POST";
      }
    } else if (type === "referensi") {
      if (selectedReferensiId.value) {
        // Updating existing Referensi
        method = "PUT";
        bodyPayload.id_referensi = selectedReferensiId.value;
      } else {
        // Creating new Referensi
        method = "POST";
      }
    } else {
      // Single items (KTP, NPWP, etc.) always use PUT to update/create the slot
      method = "PUT";
    }

    // We send the fileUrl in body, backend will use it instead of expecting a file
    const metaRes = await fetch(
      `${apiBaseUrl}/personnel-documents/${route.params.id}/${type}`,
      {
        method: method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyPayload),
      }
    );

    if (!metaRes.ok) {
      const err = await metaRes.json();
      throw new Error(err.message || "Gagal menyimpan data ke database");
    }

    success("Dokumen berhasil diupload & disimpan!");
    pendingUploads.value[type].file = null;
    pendingUploads.value[type].preview = null;
    await fetchPersonilDetail();
  } catch (e) {
    showError(e.message);
  } finally {
    uploadingState.value[type] = false;
  }
};

const handleUpdateItem = async (newData) => {
  const type = selectedDocument.value;
  uploadingState.value[type] = true;
  try {
    const formData = new FormData();
    Object.keys(newData).forEach((key) => {
      if (newData[key] != null) formData.append(key, newData[key]);
    });

    // Always use PUT for updates as data must exist to be edited
    // But double check just in case user edits before upload?
    // Actually the UI might allow editing "empty" forms?
    // If so, we need to create it (POST) but POST requires a file.
    // If we try to create (POST) without file, it fails.
    // So we can only update (PUT) if we are sending data without file.
    // Ensure we use PUT.

    const res = await fetch(
      `${apiBaseUrl}/personnel-documents/${route.params.id}/${type}`,
      { method: "PUT", body: formData }
    );

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}));
      throw new Error(errorData.message || "Gagal update data");
    }

    success("Data berhasil disimpan");
    await fetchPersonilDetail();
  } catch (e) {
    showError(e.message);
  } finally {
    uploadingState.value[type] = false;
  }
};

const activeTabComponent = ref(null);

const showEditContactModal = ref(false);
const showDeleteContactConfirm = ref(false);
const contactFormData = ref({ no_hp: "", alamat_domisili: "" });
const isSavingContact = ref(false);
const isDeletingContact = ref(false);

const getInitials = (name) => {
  if (!name) return "?";
  const words = name
    .replace(/[^\w\s]/gi, "")
    .split(/\s+/)
    .filter((w) => w.length > 0);
  return words.length >= 2
    ? (words[0][0] + words[1][0]).toUpperCase()
    : name.slice(0, 2).toUpperCase();
};

const openEditContactInfo = () => {
  contactFormData.value = {
    no_hp: person.value?.no_hp || "",
    alamat_domisili: person.value?.alamat_domisili || "",
  };
  showEditContactModal.value = true;
};

const saveContactInfo = async () => {
  isSavingContact.value = true;
  try {
    const res = await fetch(`${apiBaseUrl}/personnel/${route.params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(contactFormData.value),
    });
    if (!res.ok) throw new Error("Gagal update kontak");
    success("Kontak diperbarui");
    showEditContactModal.value = false;
    fetchPersonilDetail();
  } catch (e) {
    showError(e.message);
  } finally {
    isSavingContact.value = false;
  }
};

const handleDeleteContact = async () => {
  isDeletingContact.value = true;
  try {
    const res = await fetch(`${apiBaseUrl}/personnel/${route.params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ no_hp: "", alamat_domisili: "" }),
    });
    if (!res.ok) throw new Error("Gagal hapus kontak");
    success("Kontak dihapus");
    showDeleteContactConfirm.value = false;
    fetchPersonilDetail();
  } catch (e) {
    showError(e.message);
  } finally {
    isDeletingContact.value = false;
  }
};

const openDeleteContactConfirm = () => (showDeleteContactConfirm.value = true);

const fetchPersonilDetail = async () => {
  loading.value = true;
  try {
    const res = await fetch(`${apiBaseUrl}/personnel/${route.params.id}`);
    if (!res.ok) throw new Error("Error fetching data");
    const result = await res.json();
    person.value = result.data || result;
    ktp.value = person.value.ktp || null;
    npwp.value = person.value.npwp || null;
    ijazah.value = person.value.ijazah || null;
    cv.value = person.value.cv || null;
    referensi.value = person.value.referensi || [];
    stnk.value = person.value.stnk || [];

    // Auto select first item if available
    if (referensi.value.length > 0)
      selectedReferensiId.value = referensi.value[0].id_referensi;
    if (stnk.value.length > 0) selectedStnkId.value = stnk.value[0].id_stnk;
  } catch (e) {
    showError(e.message);
  } finally {
    loading.value = false;
  }
};

onMounted(() => fetchPersonilDetail());
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
