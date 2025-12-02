<template>
  <div>
    <!-- Header -->
    <div class="mb-8 flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Database Perusahaan
        </h1>
        <p class="text-gray-600 dark:text-gray-400">
          Pilih perusahaan untuk melihat detail database - Klik untuk detail lengkap
        </p>
      </div>
      <button
        @click="openAddModal"
        class="px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 flex items-center gap-2"
      >
        <i class="fas fa-plus"></i>
        <span>Tambah Perusahaan</span>
      </button>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Companies Grid -->
    <div v-else-if="companies.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <div
        v-for="company in companies"
        :key="company.id_perusahaan"
        class="group h-full"
      >
        <div class="bg-white dark:bg-gray-800 rounded-xl p-5 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-lg transition-all duration-300 h-full flex flex-col relative">
          <!-- Action Buttons -->
          <div class="absolute top-4 right-4 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
            <button
              @click.stop="viewDetail(company)"
              class="w-8 h-8 rounded-lg bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-300 flex items-center justify-center transition-colors shadow-sm"
              title="Lihat Detail"
            >
              <i class="fas fa-eye text-sm"></i>
            </button>
            <button
              @click.stop="handleEdit(company)"
              class="w-8 h-8 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 flex items-center justify-center transition-colors shadow-sm"
              title="Edit"
            >
              <i class="fas fa-edit text-sm"></i>
            </button>
            <button
              @click.stop="confirmDelete(company)"
              class="w-8 h-8 rounded-lg bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 flex items-center justify-center transition-colors shadow-sm"
              title="Hapus"
            >
              <i class="fas fa-trash text-sm"></i>
            </button>
          </div>

          <!-- Company Icon -->
          <NuxtLink
            :to="`/database/companies/${company.id_perusahaan}`"
            class="flex flex-col h-full"
          >
            <div class="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
              <i class="fas fa-building text-xl text-white"></i>
            </div>

            <!-- Company Info -->
            <h3 class="text-lg font-bold text-gray-900 dark:text-white mb-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-2 min-h-[3.5rem]">
              {{ company.nama_perusahaan }}
            </h3>
            
            <div class="space-y-2 text-sm flex-grow">
              <!-- Row 1: ID & No Telp -->
              <div class="grid grid-cols-2 gap-2">
                <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <i class="fas fa-id-card w-4 flex-shrink-0"></i>
                  <span class="truncate text-xs">{{ company.id_perusahaan }}</span>
                </div>
                <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <i class="fas fa-phone w-4 flex-shrink-0"></i>
                  <span class="truncate text-xs">{{ company.no_telp || '-' }}</span>
                </div>
              </div>
              
              <!-- Row 2: Status & Fax -->
              <div class="grid grid-cols-2 gap-2">
                <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <i class="fas fa-tag w-4 flex-shrink-0"></i>
                  <span class="truncate text-xs">{{ company.status_perusahaan || '-' }}</span>
                </div>
                <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <i class="fas fa-fax w-4 flex-shrink-0"></i>
                  <span class="truncate text-xs">{{ company.no_fax || '-' }}</span>
                </div>
              </div>

              <!-- Row 3: Email (full width) -->
              <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <i class="fas fa-envelope w-4 flex-shrink-0"></i>
                <span class="truncate text-xs">{{ company.email || '-' }}</span>
              </div>
            </div>

            <!-- View Details Button -->
            <div class="mt-4 flex items-center justify-between pt-3 border-t border-gray-200 dark:border-gray-700 flex-shrink-0">
              <span class="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
                Lihat Detail
              </span>
              <i class="fas fa-arrow-right text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform"></i>
            </div>
          </NuxtLink>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
      <div class="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-6">
        <i class="fas fa-building text-4xl text-gray-400"></i>
      </div>
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Belum Ada Data Perusahaan
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Silakan tambahkan data perusahaan terlebih dahulu
      </p>
      <button
        @click="openAddModal"
        class="px-6 py-3 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 inline-flex items-center gap-2"
      >
        <i class="fas fa-plus"></i>
        <span>Tambah Perusahaan</span>
      </button>
    </div>

    <!-- Detail Modal -->
    <BaseModal :show="showDetailModal" @close="showDetailModal = false" max-width="3xl">
      <template #header>
        <div>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Detail Perusahaan</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">Informasi lengkap perusahaan</p>
        </div>
      </template>
      <template #body>
        <div v-if="selectedCompany" class="space-y-6">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div v-for="(value, key) in selectedCompany" :key="key" class="space-y-2">
              <label class="text-sm font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wide">
                {{ formatFieldName(key) }}
              </label>
              <div class="px-4 py-3 bg-gray-50 dark:bg-gray-700 rounded-lg border border-gray-200 dark:border-gray-600">
                <p class="text-gray-900 dark:text-white">
                  {{ value || '-' }}
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
    <BaseModal :show="showEditModal" @close="closeEditModal" max-width="3xl">
      <template #header>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
          {{ isEditMode ? 'Edit Perusahaan' : 'Tambah Perusahaan' }}
        </h3>
      </template>
      <template #body>
        <form @submit.prevent="saveEdit" class="space-y-4">
          <div v-if="isEditMode">
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">ID Perusahaan</label>
            <input
              v-model="editForm.id_perusahaan"
              type="text"
              disabled
              class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
            />
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nama Perusahaan *</label>
            <input
              v-model="editForm.nama_perusahaan"
              type="text"
              required
              class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Masukkan nama perusahaan"
            />
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Status</label>
              <input
                v-model="editForm.status_perusahaan"
                type="text"
                class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="e.g., PT, CV"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Email</label>
              <input
                v-model="editForm.email"
                type="email"
                class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="email@perusahaan.com"
              />
            </div>
          </div>

          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">No. Telepon</label>
              <input
                v-model="editForm.no_telp"
                type="text"
                class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="08xxx atau 021-xxx"
              />
            </div>

            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">No. Fax</label>
              <input
                v-model="editForm.no_fax"
                type="text"
                class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="021-xxx"
              />
            </div>
          </div>

          <div>
            <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Alamat</label>
            <textarea
              v-model="editForm.alamat_kantor_pusat"
              rows="3"
              class="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Masukkan alamat kantor pusat"
            ></textarea>
          </div>

          <div class="flex justify-end gap-3 pt-4">
            <button
              type="button"
              @click="closeEditModal"
              class="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
            >
              Batal
            </button>
            <button
              type="submit"
              :disabled="saving"
              class="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="saving">
                <i class="fas fa-spinner fa-spin mr-2"></i>Menyimpan...
              </span>
              <span v-else>
                <i class="fas fa-save mr-2"></i>{{ isEditMode ? 'Update' : 'Simpan' }}
              </span>
            </button>
          </div>
        </form>
      </template>
    </BaseModal>

    <!-- Confirm Dialog -->
    <ConfirmDialog
      :show="showConfirmDialog"
      type="danger"
      title="Konfirmasi Hapus"
      :message="`Apakah Anda yakin ingin menghapus perusahaan: ${companyToDelete?.nama_perusahaan}?`"
      confirm-text="Hapus"
      cancel-text="Batal"
      loading-text="Menghapus..."
      :loading="deleting"
      @confirm="handleDelete"
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
const companies = ref([])
const showEditModal = ref(false)
const showDetailModal = ref(false)
const showConfirmDialog = ref(false)
const selectedCompany = ref(null)
const editingCompany = ref(null)
const companyToDelete = ref(null)
const isEditMode = ref(false)
const saving = ref(false)
const deleting = ref(false)

const editForm = ref({
  id_perusahaan: '',
  nama_perusahaan: '',
  status_perusahaan: '',
  email: '',
  no_telp: '',
  no_fax: '',
  alamat_kantor_pusat: ''
})

// Format field name
const formatFieldName = (key) => {
  return key.replace(/_/g, ' ')
}

// View detail
const viewDetail = (company) => {
  selectedCompany.value = company
  showDetailModal.value = true
}

// Fetch companies on mount
const fetchCompanies = async (silent = false) => {
  try {
    if (!silent) loading.value = true
    const response = await fetch(`${apiBaseUrl}/companies`)
    if (response.ok) {
      companies.value = await response.json()
    } else {
      console.error('Failed to fetch companies:', response.status)
      if (!silent) showError('Gagal!', 'Tidak dapat memuat data perusahaan')
    }
  } catch (error) {
    console.error('Error fetching companies:', error)
    if (!silent) showError('Error!', error.message || 'Terjadi kesalahan')
  } finally {
    if (!silent) loading.value = false
  }
}

// Open add modal
const openAddModal = () => {
  isEditMode.value = false
  editForm.value = {
    id_perusahaan: '',
    nama_perusahaan: '',
    status_perusahaan: '',
    email: '',
    no_telp: '',
    no_fax: '',
    alamat_kantor_pusat: ''
  }
  showEditModal.value = true
}

// Handle edit - Show modal
const handleEdit = (company) => {
  isEditMode.value = true
  editingCompany.value = company
  editForm.value = {
    id_perusahaan: company.id_perusahaan,
    nama_perusahaan: company.nama_perusahaan,
    status_perusahaan: company.status_perusahaan || '',
    email: company.email || '',
    no_telp: company.no_telp || '',
    no_fax: company.no_fax || '',
    alamat_kantor_pusat: company.alamat_kantor_pusat || ''
  }
  showEditModal.value = true
}

// Close edit modal
const closeEditModal = () => {
  showEditModal.value = false
  editingCompany.value = null
}

// Save edited company
const saveEdit = async () => {
  try {
    saving.value = true
    const url = isEditMode.value
      ? `${apiBaseUrl}/companies/${editForm.value.id_perusahaan}`
      : `${apiBaseUrl}/companies`
    
    const method = isEditMode.value ? 'PUT' : 'POST'
    
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editForm.value)
    })
    
    if (response.ok) {
      success(
        'Berhasil!',
        isEditMode.value ? 'Data perusahaan berhasil diupdate' : 'Data perusahaan berhasil ditambahkan'
      )
      closeEditModal()
      await fetchCompanies()
    } else {
      const error = await response.json()
      showError('Gagal!', error.message || 'Terjadi kesalahan saat menyimpan data')
    }
  } catch (error) {
    console.error('Error updating company:', error)
    showError('Error!', error.message || 'Terjadi kesalahan')
  } finally {
    saving.value = false
  }
}

// Confirm delete
const confirmDelete = (company) => {
  companyToDelete.value = company
  showConfirmDialog.value = true
}

// Handle delete with confirmation
const handleDelete = async () => {
  try {
    deleting.value = true
    const response = await fetch(`${apiBaseUrl}/companies/${companyToDelete.value.id_perusahaan}`, {
      method: 'DELETE'
    })
    
    if (response.ok) {
      success('Berhasil!', 'Data perusahaan berhasil dihapus')
      showConfirmDialog.value = false
      companyToDelete.value = null
      await fetchCompanies()
    } else {
      const error = await response.json()
      showError('Gagal!', error.message || 'Terjadi kesalahan saat menghapus data')
    }
  } catch (error) {
    console.error('Error deleting company:', error)
    showError('Error!', error.message || 'Terjadi kesalahan')
  } finally {
    deleting.value = false
  }
}

// Auto refresh interval
let refreshInterval = null

// Fetch on mount
onMounted(() => {
  fetchCompanies()
  
  // Auto refresh every 5 seconds
  refreshInterval = setInterval(() => {
    fetchCompanies(true)
  }, 5000)
})

// Clean up interval
onUnmounted(() => {
  if (refreshInterval) clearInterval(refreshInterval)
})
</script>
