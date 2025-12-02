<template>
  <div>
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Database Personil
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Kelola data personil perusahaan - Klik card untuk melihat aksi lebih lanjut
        </p>
      </div>
      <button
        @click="openAddModal"
        class="px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
      >
        <i class="fas fa-plus"></i>
        <span>Tambah Personil</span>
      </button>
    </div>

    <!-- Error State -->
    <div v-if="error" class="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 mb-6">
      <div class="flex items-center gap-3">
        <i class="fas fa-exclamation-circle text-red-600 dark:text-red-400 text-xl"></i>
        <div>
          <h3 class="font-semibold text-red-900 dark:text-red-100">Error</h3>
          <p class="text-sm text-red-700 dark:text-red-300">{{ error }}</p>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p class="text-gray-600 dark:text-gray-400">Memuat data personil...</p>
      </div>
    </div>

    <!-- Personil Grid (KTP Style) -->
    <div v-else-if="personil.length > 0">
      <!-- Grid Container -->
      <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 mb-6">
        <PersonilCard
          v-for="person in personil"
          :key="person.nik"
          :person="person"
          @view="viewDetail"
          @edit="openEditModal"
          @delete="confirmDelete"
        />
      </div>

      <!-- Footer Info -->
      <div class="bg-white dark:bg-gray-800 rounded-xl p-4 border border-gray-200 dark:border-gray-700">
        <p class="text-sm text-gray-600 dark:text-gray-400 text-center">
          Total: <span class="font-semibold text-gray-900 dark:text-white">{{ personil.length }}</span> personil
        </p>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700 shadow-lg">
      <div class="w-20 h-20 rounded-full bg-gradient-to-br from-blue-100 to-violet-100 dark:from-gray-700 dark:to-gray-700 flex items-center justify-center mx-auto mb-6">
        <i class="fas fa-users text-4xl text-blue-600 dark:text-blue-400"></i>
      </div>
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Belum Ada Data Personil
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Silakan tambahkan data personil terlebih dahulu
      </p>
      <button
        @click="openAddModal"
        class="px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2"
      >
        <i class="fas fa-plus"></i>
        <span>Tambah Personil</span>
      </button>
    </div>

    <!-- Detail Modal -->
    <BaseModal :show="showDetailModal" @close="showDetailModal = false" max-width="3xl">
      <template #header>
        <div>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Detail Personil</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Informasi lengkap personil</p>
        </div>
      </template>
      <template #body>
        <div v-if="selectedPerson" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="(value, key) in selectedPerson" :key="key" class="space-y-2">
              <label class="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                {{ formatFieldName(key) }}
              </label>
              <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <p class="text-gray-900 dark:text-white">
                  {{ formatFieldValue(key, value) || '-' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button
          @click="showDetailModal = false"
          class="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
        >
          Tutup
        </button>
      </template>
    </BaseModal>

    <!-- Add/Edit Modal -->
    <BaseModal :show="showModal" @close="closeModal" max-width="3xl">
      <template #header>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ isEditMode ? 'Edit Personil' : 'Tambah Personil' }}
        </h3>
      </template>
      <template #body>
        <form @submit.prevent="savePersonil" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">NIK *</label>
              <input
                v-model="formData.nik"
                type="text"
                required
                :disabled="isEditMode"
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none disabled:bg-gray-100 dark:disabled:bg-gray-800"
                placeholder="Masukkan NIK"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nama *</label>
              <input
                v-model="formData.nama"
                type="text"
                required
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                placeholder="Masukkan nama lengkap"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tempat Lahir</label>
              <input
                v-model="formData.tempat_lahir"
                type="text"
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                placeholder="Masukkan tempat lahir"
              />
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tanggal Lahir</label>
              <input
                v-model="formData.tanggal_lahir"
                type="date"
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              />
            </div>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Strata Pendidikan</label>
              <select
                v-model="formData.strata"
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              >
                <option value="">Pilih Strata</option>
                <option value="SD">SD</option>
                <option value="SMP">SMP</option>
                <option value="SMA">SMA</option>
                <option value="D3">D3</option>
                <option value="S1">S1</option>
                <option value="S2">S2</option>
                <option value="S3">S3</option>
              </select>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Jurusan Pendidikan</label>
              <input
                v-model="formData.jurusan_pendidikan"
                type="text"
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                placeholder="Masukkan jurusan"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Sertifikat Keahlian</label>
            <textarea
              v-model="formData.sertifikat_keahlian"
              rows="4"
              class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              placeholder="Masukkan sertifikat keahlian"
            ></textarea>
          </div>
        </form>
      </template>
      <template #footer>
        <button
          type="button"
          @click="closeModal"
          class="px-6 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-medium rounded-xl transition-colors"
        >
          Batal
        </button>
        <button
          @click="savePersonil"
          :disabled="saving"
          class="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="saving" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
          <span>{{ isEditMode ? 'Update' : 'Simpan' }}</span>
        </button>
      </template>
    </BaseModal>

    <!-- Confirm Dialog -->
    <ConfirmDialog
      :show="showConfirmDialog"
      type="danger"
      title="Konfirmasi Hapus"
      :message="`Apakah Anda yakin ingin menghapus personil: ${personilToDelete?.nama}?`"
      confirm-text="Hapus"
      cancel-text="Batal"
      loading-text="Menghapus..."
      :loading="deleting"
      @confirm="deletePersonil"
      @cancel="showConfirmDialog = false"
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
// Import components explicitly
import BaseModal from '~/components/BaseModal.vue'
import BaseToast from '~/components/BaseToast.vue'
import ConfirmDialog from '~/components/ConfirmDialog.vue'

definePageMeta({
  layout: 'dashboard'
})

const config = useRuntimeConfig()
const apiBaseUrl = config.public.apiBaseUrl

// Use toast composable
const { toast, success, error: showError, hideToast } = useToast()

const loading = ref(true)
const error = ref(null)
const personil = ref([])
const showModal = ref(false)
const showConfirmDialog = ref(false)
const showDetailModal = ref(false)
const selectedPerson = ref(null)
const isEditMode = ref(false)
const saving = ref(false)
const deleting = ref(false)
const personilToDelete = ref(null)

const formData = ref({
  nik: '',
  nama: '',
  tempat_lahir: '',
  tanggal_lahir: '',
  strata: '',
  jurusan_pendidikan: '',
  sertifikat_keahlian: ''
})

// Format field name
const formatFieldName = (key) => {
  return key.replace(/_/g, ' ')
}

// Format field value
const formatFieldValue = (key, value) => {
  if (key === 'tanggal_lahir' && value) {
    return formatDate(value)
  }
  return value
}

// View detail
const viewDetail = (person) => {
  selectedPerson.value = person
  showDetailModal.value = true
}

// Format date
const formatDate = (dateString) => {
  if (!dateString) return ''
  try {
    const date = new Date(dateString)
    return new Intl.DateFormat('id-ID', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    }).format(date)
  } catch (e) {
    return dateString
  }
}

// Fetch personil
const fetchPersonil = async () => {
  try {
    loading.value = true
    error.value = null
    
    const response = await fetch(`${apiBaseUrl}/personnel`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()
    
    if (result.success && result.data) {
      personil.value = result.data
    } else if (Array.isArray(result)) {
      personil.value = result
    } else {
      throw new Error('Invalid response structure')
    }
  } catch (err) {
    console.error('Error fetching personil:', err)
    error.value = `Gagal memuat data: ${err.message}`
    personil.value = []
  } finally {
    loading.value = false
  }
}

// Open add modal
const openAddModal = () => {
  isEditMode.value = false
  formData.value = {
    nik: '',
    nama: '',
    tempat_lahir: '',
    tanggal_lahir: '',
    strata: '',
    jurusan_pendidikan: '',
    sertifikat_keahlian: ''
  }
  showModal.value = true
}

// Open edit modal
const openEditModal = (person) => {
  isEditMode.value = true
  formData.value = { ...person }
  showModal.value = true
}

// Close modal
const closeModal = () => {
  showModal.value = false
}

// Save personil
const savePersonil = async () => {
  try {
    saving.value = true
    const url = isEditMode.value
      ? `${apiBaseUrl}/personnel/${formData.value.nik}`
      : `${apiBaseUrl}/personnel`
    
    const method = isEditMode.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData.value)
    })
    
    if (response.ok) {
      success(
        'Berhasil!',
        isEditMode.value ? 'Data personil berhasil diupdate' : 'Data personil berhasil ditambahkan'
      )
      closeModal()
      await fetchPersonil()
    } else {
      const errorData = await response.json()
      showError('Gagal!', errorData.message || 'Terjadi kesalahan saat menyimpan data')
    }
  } catch (err) {
    console.error('Error saving personil:', err)
    showError('Error!', err.message || 'Terjadi kesalahan')
  } finally {
    saving.value = false
  }
}

// Confirm delete
const confirmDelete = (person) => {
  personilToDelete.value = person
  showConfirmDialog.value = true
}

// Delete personil
const deletePersonil = async () => {
  try {
    deleting.value = true
    const response = await fetch(`${apiBaseUrl}/personnel/${personilToDelete.value.nik}`, {
      method: 'DELETE'
    })
    
    if (response.ok) {
      success('Berhasil!', 'Data personil berhasil dihapus')
      showConfirmDialog.value = false
      personilToDelete.value = null
      await fetchPersonil()
    } else {
      const errorData = await response.json()
      showError('Gagal!', errorData.message || 'Terjadi kesalahan saat menghapus data')
    }
  } catch (err) {
    console.error('Error deleting personil:', err)
    showError('Error!', err.message || 'Terjadi kesalahan')
  } finally {
    deleting.value = false
  }
}

// Fetch on mount
onMounted(() => {
  fetchPersonil()
})
</script>
