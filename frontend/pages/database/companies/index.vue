<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Database Perusahaan
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Pilih perusahaan untuk melihat detail database
      </p>
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
              @click.stop="handleEdit(company)"
              class="w-8 h-8 rounded-lg bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 flex items-center justify-center transition-colors shadow-sm"
              title="Edit"
            >
              <i class="fas fa-edit text-sm"></i>
            </button>
            <button
              @click.stop="handleDelete(company)"
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
                <div v-if="company.no_telp" class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <i class="fas fa-phone w-4 flex-shrink-0"></i>
                  <span class="truncate text-xs">{{ company.no_telp }}</span>
                </div>
              </div>
              
              <!-- Row 2: Status & Fax -->
              <div class="grid grid-cols-2 gap-2">
                <div v-if="company.status_perusahaan" class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <i class="fas fa-tag w-4 flex-shrink-0"></i>
                  <span class="truncate text-xs">{{ company.status_perusahaan }}</span>
                </div>
                <div v-if="company.no_fax" class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <i class="fas fa-fax w-4 flex-shrink-0"></i>
                  <span class="truncate text-xs">{{ company.no_fax }}</span>
                </div>
              </div>

              <!-- Row 3: Email (full width) -->
              <div v-if="company.email" class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                <i class="fas fa-envelope w-4 flex-shrink-0"></i>
                <span class="truncate text-xs">{{ company.email }}</span>
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
    </div>

    <!-- Edit Modal -->
    <BaseModal v-if="showEditModal" @close="closeEditModal">
      <template #header>
        <h3 class="text-2xl font-bold text-gray-900 dark:text-white">
          Edit Perusahaan
        </h3>
      </template>
      <template #body>
        <form @submit.prevent="saveEdit" class="space-y-4">
          <div>
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
              class="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <i class="fas fa-save mr-2"></i>Update
            </button>
          </div>
        </form>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'dashboard'
})

const loading = ref(true)
const companies = ref([])
const showEditModal = ref(false)
const editingCompany = ref(null)
const editForm = ref({
  id_perusahaan: '',
  nama_perusahaan: '',
  status_perusahaan: '',
  email: '',
  no_telp: '',
  no_fax: ''
})

// Fetch companies on mount
onMounted(async () => {
  try {
    const response = await fetch('http://localhost:5000/api/companies')
    if (response.ok) {
      companies.value = await response.json()
    } else {
      console.error('Failed to fetch companies:', response.status)
    }
  } catch (error) {
    console.error('Error fetching companies:', error)
  } finally {
    loading.value = false
  }
})

// Handle edit - Show modal instead of navigate
const handleEdit = (company) => {
  editingCompany.value = company
  editForm.value = {
    id_perusahaan: company.id_perusahaan,
    nama_perusahaan: company.nama_perusahaan,
    status_perusahaan: company.status_perusahaan || '',
    email: company.email || '',
    no_telp: company.no_telp || '',
    no_fax: company.no_fax || ''
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
    const response = await fetch(`http://localhost:5000/api/companies/${editForm.value.id_perusahaan}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(editForm.value)
    })
    
    if (response.ok) {
      const updated = await response.json()
      // Update in local array
      const index = companies.value.findIndex(c => c.id_perusahaan === editForm.value.id_perusahaan)
      if (index !== -1) {
        companies.value[index] = { ...companies.value[index], ...editForm.value }
      }
      alert('Perusahaan berhasil diupdate!')
      closeEditModal()
    } else {
      const error = await response.json()
      alert(`Gagal update perusahaan: ${error.message || 'Unknown error'}`)
    }
  } catch (error) {
    console.error('Error updating company:', error)
    alert(`Terjadi kesalahan: ${error.message}`)
  }
}

// Handle delete with confirmation
const handleDelete = async (company) => {
  if (confirm(`Apakah Anda yakin ingin menghapus perusahaan "${company.nama_perusahaan}"?\n\nTindakan ini tidak dapat dibatalkan!`)) {
    try {
      const response = await fetch(`http://localhost:5000/api/companies/${company.id_perusahaan}`, {
        method: 'DELETE'
      })
      
      if (response.ok) {
        // Remove from local array
        companies.value = companies.value.filter(c => c.id_perusahaan !== company.id_perusahaan)
        alert(`Perusahaan "${company.nama_perusahaan}" berhasil dihapus!`)
      } else {
        const error = await response.json()
        alert(`Gagal menghapus perusahaan: ${error.message || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Error deleting company:', error)
      alert(`Terjadi kesalahan: ${error.message}`)
    }
  }
}
</script>
