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
            Database <span class="text-blue-600">Personel</span>
          </h1>
          <p
            class="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium max-w-xl"
          >
            Sistem manajemen data identitas & profil personel terintegrasi.
          </p>
        </div>

        <div class="flex items-center gap-3">
          <div class="hidden md:block text-right mr-2">
            <div
              class="text-xs font-bold text-slate-400 uppercase tracking-widest"
            >
              Total Personel
            </div>
            <div
              class="text-xl font-mono font-bold text-slate-700 dark:text-slate-200"
            >
              {{ personel.length }}
            </div>
          </div>

          <!-- Tambah Personel Button -->
          <button
            @click="showAddModal = true"
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
              <span class="tracking-wide">Tambah Personel</span>
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
        class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 pl-4 flex items-center gap-4"
      >
        <BaseSkeleton
          width="3rem"
          height="3rem"
          class-name="rounded-xl flex-shrink-0"
        />
        <div class="space-y-2 flex-1 min-w-0">
          <BaseSkeleton width="60%" height="1rem" />
          <BaseSkeleton width="40%" height="0.8rem" />
        </div>
      </div>
    </div>

    <!-- Personel Grid (Consistent Style with Companies) -->
    <div
      v-else-if="filteredPersonel.length > 0"
      class="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      <div
        v-for="person in filteredPersonel"
        :key="person.id_personel"
        class="group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col hover:border-blue-400 dark:hover:border-blue-500 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
        @click="viewDetail(person)"
      >
        <!-- Main Info Section -->
        <div class="p-5 flex items-center gap-4">
          <!-- Avatar Icon -->
          <div
            class="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300 border border-blue-100 dark:border-blue-800"
          >
            <i class="fas fa-user text-lg"></i>
          </div>

          <!-- Info Text -->
          <div class="flex-1 min-w-0">
            <h3
              class="text-sm font-bold text-slate-800 dark:text-white truncate group-hover:text-blue-600 transition-colors mb-0.5"
              :title="person.nama_lengkap"
            >
              {{ person.nama_lengkap }}
            </h3>
            <p
              class="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1.5"
            >
              <i class="fas fa-briefcase text-[10px] opacity-70"></i>
              {{ person.keahlian || "Belum ada keahlian" }}
            </p>
          </div>

          <!-- Action Buttons (Hover Only) -->
          <div
            class="flex items-center gap-1 opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity duration-200"
          >
            <button
              @click.stop="openEditModal(person)"
              class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-all"
              title="Edit"
            >
              <i class="fas fa-pen text-xs"></i>
            </button>
            <button
              @click.stop="openDeleteConfirm(person)"
              class="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/30 transition-all"
              title="Hapus"
            >
              <i class="fas fa-trash-alt text-xs"></i>
            </button>
          </div>
        </div>

        <!-- Document Badges Row (If Available) -->
        <div
          v-if="getDocumentIcons(person).length > 0"
          class="px-4 pb-4 pt-0 flex flex-wrap gap-1"
        >
          <div
            v-for="doc in getDocumentIcons(person)"
            :key="doc.type"
            class="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold flex items-center gap-1 border transition-transform hover:scale-105"
            :class="doc.class"
            :title="doc.type + ' tersedia'"
          >
            <i :class="doc.icon"></i> {{ doc.type }}
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
        <i class="fas fa-users-slash text-2xl"></i>
      </div>
      <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">
        Database Kosong
      </h3>
      <p class="text-sm text-slate-500 mb-6">
        Belum ada data personel terdaftar dalam sistem.
      </p>
    </div>

    <!-- Add Personel Modal -->
    <BaseModal
      :show="showAddModal"
      title="Tambah Personel Baru"
      @close="closeAddModal"
    >
      <template #default>
        <div class="space-y-6 px-1">
          <div
            class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-xl flex items-start gap-4 mb-4 border border-blue-100 dark:border-blue-800"
          >
            <div
              class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center flex-shrink-0 text-blue-600 dark:text-blue-300"
            >
              <i class="fas fa-user-plus text-lg"></i>
            </div>
            <div>
              <h4
                class="text-sm font-bold text-blue-800 dark:text-blue-300 mb-1"
              >
                Data Identitas
              </h4>
              <p
                class="text-xs text-blue-600 dark:text-blue-400 leading-relaxed"
              >
                Masukkan nama lengkap sesuai KTP. Folder penyimpanan dokumen
                akan otomatis dibuat berdasarkan nama ini.
              </p>
            </div>
          </div>

          <div class="group">
            <label
              class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors group-focus-within:text-blue-600"
            >
              Nama Lengkap
              <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
              >
                <i
                  class="fas fa-user text-slate-400 group-focus-within:text-blue-500 transition-colors"
                ></i>
              </div>
              <input
                v-model="newPersonelName"
                type="text"
                placeholder="Contoh: Budi Santoso, S.T."
                class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                @keyup.enter="saveNewPersonel"
                autofocus
              />
            </div>
            <p
              class="mt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5"
            >
              <i class="fas fa-info-circle text-blue-500"></i>
              <span>Gunakan gelar lengkap jika diperlukan.</span>
            </p>
          </div>

          <!-- Input Keahlian -->
          <div class="group">
            <label
              class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors group-focus-within:text-blue-600"
            >
              Keahlian / Jabatan
            </label>
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
              >
                <i
                  class="fas fa-briefcase text-slate-400 group-focus-within:text-blue-500 transition-colors"
                ></i>
              </div>
              <input
                v-model="newPersonelKeahlian"
                type="text"
                placeholder="Contoh: Ahli Tehnik Sipil, Drafter, dll"
                class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3 pt-2">
          <button
            @click="closeAddModal"
            class="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
          >
            Batal
          </button>
          <button
            @click="saveNewPersonel"
            :disabled="!newPersonelName.trim() || saving"
            class="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform active:scale-95"
          >
            <i v-if="saving" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-save"></i>
            {{ saving ? "Menyimpan..." : "Simpan Personel" }}
          </button>
        </div>
      </template>
    </BaseModal>

    <!-- Edit Personel Modal -->
    <BaseModal
      :show="showEditModal"
      title="Edit Personel"
      @close="closeEditModal"
    >
      <template #default>
        <div class="space-y-6 px-1">
          <div
            class="bg-amber-50 dark:bg-amber-900/20 p-4 rounded-xl flex items-start gap-4 mb-4 border border-amber-100 dark:border-amber-800"
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
                Perubahan Data
              </h4>
              <p
                class="text-xs text-amber-600 dark:text-amber-400 leading-relaxed"
              >
                Mengubah nama personel akan otomatis mengubah nama folder
                dokumen di Google Drive.
              </p>
            </div>
          </div>

          <div class="group">
            <label
              class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors group-focus-within:text-blue-600"
            >
              Nama Lengkap
              <span class="text-red-500">*</span>
            </label>
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
              >
                <i
                  class="fas fa-user-edit text-slate-400 group-focus-within:text-blue-500 transition-colors"
                ></i>
              </div>
              <input
                v-model="editPersonelName"
                type="text"
                placeholder="Masukkan nama lengkap personel"
                class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
                @keyup.enter="saveEditPersonel"
              />
            </div>
          </div>

          <!-- Input Keahlian -->
          <div class="group">
            <label
              class="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2 transition-colors group-focus-within:text-blue-600"
            >
              Keahlian / Jabatan
            </label>
            <div class="relative">
              <div
                class="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none"
              >
                <i
                  class="fas fa-briefcase text-slate-400 group-focus-within:text-blue-500 transition-colors"
                ></i>
              </div>
              <input
                v-model="editPersonelKeahlian"
                type="text"
                placeholder="Contoh: Ahli Tehnik Sipil, Drafter, dll"
                class="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all shadow-sm"
              />
            </div>
          </div>
        </div>
      </template>

      <template #footer>
        <div class="flex justify-end gap-3 pt-2">
          <button
            @click="closeEditModal"
            class="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl transition-all"
          >
            Batal
          </button>
          <button
            @click="saveEditPersonel"
            :disabled="!editPersonelName.trim() || saving"
            class="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-xl shadow-md hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transform active:scale-95"
          >
            <i v-if="saving" class="fas fa-spinner fa-spin"></i>
            <i v-else class="fas fa-save"></i>
            {{ saving ? "Menyimpan..." : "Simpan Perubahan" }}
          </button>
        </div>
      </template>
    </BaseModal>

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog
      :show="showDeleteConfirm"
      title="Hapus Personel?"
      :message="`Apakah Anda yakin ingin menghapus personel ${deletePersonelData?.nama_lengkap}? Folder personel di Google Drive juga akan dihapus.`"
      confirm-text="Hapus"
      cancel-text="Batal"
      loading-text="Menghapus..."
      :loading="saving"
      type="danger"
      @confirm="confirmDelete"
      @cancel="closeDeleteConfirm"
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
const route = useRoute();
const router = useRouter();
const { toast, success, error: showError, hideToast, info } = useToast();

const loading = ref(true);
const personel = ref([]);
const searchQuery = ref("");

// Add Personel Modal State
const showAddModal = ref(false);
const newPersonelName = ref("");
const newPersonelKeahlian = ref("");
const saving = ref(false);

// Edit Personel Modal State
const showEditModal = ref(false);
const editPersonelName = ref("");
const editPersonelKeahlian = ref("");
const editPersonelData = ref(null);

// Delete Confirmation State
const showDeleteConfirm = ref(false);
const deletePersonelData = ref(null);

// === Computed Properties ===
const filteredPersonel = computed(() => {
  if (!searchQuery.value) return personel.value;

  const query = searchQuery.value.toLowerCase();
  return personel.value.filter((person) => {
    const name = person.nama_lengkap?.toLowerCase() || "";
    const nik = getKtp(person)?.toLowerCase() || "";
    const npwp = getNpwp(person)?.toLowerCase() || "";
    const keahlian = person.keahlian?.toLowerCase() || ""; // Search by keahlian
    const id = person.id_personel?.toLowerCase() || "";

    return (
      name.includes(query) ||
      nik.includes(query) ||
      npwp.includes(query) ||
      keahlian.includes(query) || // Include keahlian in search
      id.includes(query)
    );
  });
});

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

const getKtp = (person) => {
  return person.nik || person.ktp?.nik || "";
};

const getNpwp = (person) => {
  return person.nomor_npwp_personel || person.npwp?.nomor_npwp_personel || "";
};

// === Data Fetching ===
const fetchPersonil = async () => {
  try {
    loading.value = true;
    const response = await fetch(`${apiBaseUrl}/personnel`);
    if (!response.ok) throw new Error("Failed to fetch personnel");

    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
      const result = await response.json();
      personel.value = Array.isArray(result.data)
        ? result.data
        : Array.isArray(result)
        ? result
        : [];
      console.log("📊 Personnel Data:", personel.value);
    } else {
      throw new Error("Invalid response format");
    }
  } catch (err) {
    console.error("Fetch error:", err);
    showError("Gagal memuat data personel: " + err.message);
  } finally {
    loading.value = false;
  }
};

// === Add Personel Functions ===
const closeAddModal = () => {
  showAddModal.value = false;
  newPersonelName.value = "";
  newPersonelKeahlian.value = "";
};

const saveNewPersonel = async () => {
  if (!newPersonelName.value.trim()) return;

  let saveSuccessful = false;

  try {
    saving.value = true;
    const response = await fetch(`${apiBaseUrl}/personnel`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        nama_lengkap: newPersonelName.value.trim(),
        keahlian: newPersonelKeahlian.value.trim(),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Gagal menambah personel");
    }

    const result = await response.json();
    success("Personel berhasil ditambahkan");
    saveSuccessful = true;

    // Refresh data
    await fetchPersonil();

    // Navigate to detail if ID available
    if (result.data?.id_personel) {
      setTimeout(() => {
        router.push(`/database/personel/${result.data.id_personel}`);
      }, 500);
    }
  } catch (err) {
    console.error("Save error:", err);
    showError("Gagal menambah personel: " + err.message);
  } finally {
    saving.value = false;

    // Close modal only if save was successful
    if (saveSuccessful) {
      closeAddModal();
    }
  }
};

// === Edit Personel Functions ===
const openEditModal = (person) => {
  editPersonelData.value = person;
  editPersonelName.value = person.nama_lengkap;
  editPersonelKeahlian.value = person.keahlian || "";
  showEditModal.value = true;
};

const closeEditModal = () => {
  showEditModal.value = false;
  editPersonelName.value = "";
  editPersonelKeahlian.value = "";
  editPersonelData.value = null;
};

const saveEditPersonel = async () => {
  if (!editPersonelName.value.trim() || !editPersonelData.value) return;

  let saveSuccessful = false;

  try {
    saving.value = true;
    const response = await fetch(
      `${apiBaseUrl}/personnel/${editPersonelData.value.id_personel}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          nama_lengkap: editPersonelName.value.trim(),
          keahlian: editPersonelKeahlian.value.trim(),
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Gagal mengupdate personel");
    }

    success("Personel berhasil diupdate");
    saveSuccessful = true;

    // Refresh data
    await fetchPersonil();
  } catch (err) {
    console.error("Update error:", err);
    showError("Gagal mengupdate personel: " + err.message);
  } finally {
    saving.value = false;

    // Close modal only if save was successful
    if (saveSuccessful) {
      closeEditModal();
    }
  }
};

// === Delete Personel Functions ===
const openDeleteConfirm = (person) => {
  deletePersonelData.value = person;
  showDeleteConfirm.value = true;
};

const closeDeleteConfirm = () => {
  showDeleteConfirm.value = false;
  deletePersonelData.value = null;
};

const confirmDelete = async () => {
  if (!deletePersonelData.value) return;

  const id = deletePersonelData.value.id_personel;
  const name = deletePersonelData.value.nama_lengkap;

  try {
    saving.value = true; // Set loading state
    console.log(`🗑️  Starting deletion for: ${name} (${id})`);

    // Step 1: Delete Assets (Folder)
    info(`Menghapus folder & dokumen personel...`, 3000);
    const resAssets = await fetch(`${apiBaseUrl}/personnel/${id}/assets`, {
      method: "DELETE",
    });
    if (!resAssets.ok) throw new Error("Gagal menghapus aset folder");

    // Step 2: Delete Related Data
    info(`Menghapus data dokumen & relasi database...`, 3000);
    const resData = await fetch(`${apiBaseUrl}/personnel/${id}/related-data`, {
      method: "DELETE",
    });
    if (!resData.ok) throw new Error("Gagal menghapus data terkait");

    // Step 3: Delete Profile
    info(`Menghapus profil personel...`, 3000);
    const resProfile = await fetch(`${apiBaseUrl}/personnel/${id}/profile`, {
      method: "DELETE",
    });
    if (!resProfile.ok) throw new Error("Gagal menghapus profil personel");

    success(`Personel ${name} berhasil dihapus permanen!`, 5000);

    // Refresh data
    await fetchPersonil();

    // Close dialog
    closeDeleteConfirm();
  } catch (err) {
    console.error("Delete error:", err);
    showError("Gagal menghapus personel: " + err.message);
  } finally {
    saving.value = false; // Reset loading state
  }
};

// === View Detail (Navigate to Detail Page) ===
const viewDetail = (person) => {
  console.log("Navigating to detail for:", person);
  router.push(`/database/personel/${person.id_personel}`);
};

// Helper for Document Icons
const getDocumentIcons = (person) => {
  const docs = [
    {
      type: "KTP",
      icon: "far fa-id-card",
      exists: !!(person.ktp && (person.ktp.id_ktp || person.ktp.file_ktp_url)),
      class:
        "text-blue-600 bg-blue-50 border-blue-100 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    },
    {
      type: "NPWP",
      icon: "fas fa-credit-card",
      exists: !!(
        person.npwp &&
        (person.npwp.id_npwp || person.npwp.file_npwp_personel_url)
      ),
      class:
        "text-emerald-600 bg-emerald-50 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
    },
    {
      type: "Ijazah",
      icon: "fas fa-graduation-cap",
      exists: !!(
        person.ijazah &&
        (person.ijazah.id_ijazah || person.ijazah.file_ijazah_url)
      ),
      class:
        "text-purple-600 bg-purple-50 border-purple-100 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
    },
    {
      type: "CV",
      icon: "fas fa-file-alt",
      exists: !!(person.cv && (person.cv.id_cv || person.cv.file_cv_url)),
      class:
        "text-orange-600 bg-orange-50 border-orange-100 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
    },
    {
      type: "SKK",
      icon: "fas fa-certificate",
      exists: person.skk && person.skk.length > 0,
      class:
        "text-teal-600 bg-teal-50 border-teal-100 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800",
    },
    {
      type: "Ref",
      icon: "fas fa-briefcase",
      exists: person.referensi && person.referensi.length > 0,
      class:
        "text-indigo-600 bg-indigo-50 border-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
    },
    {
      type: "STNK",
      icon: "fas fa-car",
      exists: person.stnk && person.stnk.length > 0,
      class:
        "text-pink-600 bg-pink-50 border-pink-100 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800",
    },
  ];
  return docs.filter((d) => d.exists);
};

onMounted(() => {
  fetchPersonil();
});
</script>
