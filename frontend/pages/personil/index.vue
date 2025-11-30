<template>
  <div class="space-y-8 animate-fade-in">
    <!-- Header Section -->
    <div class="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div>
        <h1 class="text-4xl font-black tracking-tight text-gray-900 dark:text-white mb-2">
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-violet-600 to-fuchsia-600">
            Data Personil
          </span>
        </h1>
        <p class="text-gray-500 dark:text-gray-400 font-medium">Kelola data tenaga ahli dan staff perusahaan</p>
      </div>
      <button
        @click="openModal()"
        class="group relative inline-flex items-center justify-center px-8 py-3.5 text-base font-bold text-white bg-gray-900 dark:bg-white dark:text-gray-900 rounded-2xl hover:bg-gray-800 dark:hover:bg-gray-100 transition-all duration-300 shadow-xl hover:shadow-2xl hover:-translate-y-1 overflow-hidden"
      >
        <span class="absolute inset-0 w-full h-full bg-gradient-to-r from-violet-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
        <span class="relative flex items-center gap-3 group-hover:text-white">
          <i class="fas fa-user-plus text-lg"></i>
          Tambah Personil
        </span>
      </button>
    </div>

    <!-- Stats Cards (Bento Grid Style) -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="group relative bg-white dark:bg-gray-800 p-8 rounded-[2rem] border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
        <div class="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-violet-50 dark:bg-violet-900/20 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
        <div class="relative z-10">
          <div class="w-14 h-14 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-2xl flex items-center justify-center text-2xl mb-6 group-hover:rotate-12 transition-transform duration-300">
            <i class="fas fa-users"></i>
          </div>
          <p class="text-gray-500 dark:text-gray-400 font-medium mb-1">Total Personil</p>
          <h3 class="text-4xl font-black text-gray-900 dark:text-white">{{ personnel.length }}</h3>
        </div>
      </div>
    </div>

    <!-- Main Content Card -->
    <div class="bg-white dark:bg-gray-800 rounded-[2.5rem] shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden transition-colors duration-300">
      <!-- Loading State -->
      <div v-if="pending" class="p-20 flex flex-col items-center justify-center gap-4">
        <div class="w-12 h-12 border-4 border-violet-600 border-t-transparent rounded-full animate-spin"></div>
        <p class="text-gray-500 dark:text-gray-400 font-medium">Memuat data...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-12 text-center">
        <div class="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Gagal memuat data</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-6">{{ error.message }}</p>
        <button @click="fetchData" class="px-6 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white rounded-xl font-bold transition-colors">
          Coba Lagi
        </button>
      </div>

      <!-- Empty State -->
      <div v-else-if="personnel.length === 0" class="p-20 text-center">
        <div class="w-24 h-24 bg-gray-50 dark:bg-gray-700 text-gray-300 dark:text-gray-500 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
          <i class="fas fa-user-slash"></i>
        </div>
        <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">Belum ada data personil</h3>
        <p class="text-gray-500 dark:text-gray-400 mb-8 max-w-sm mx-auto">Mulai dengan menambahkan data tenaga ahli atau staff.</p>
        <button @click="openModal()" class="px-8 py-3 bg-violet-600 text-white rounded-xl font-bold hover:bg-violet-700 transition-colors shadow-lg shadow-violet-200 dark:shadow-none">
          Tambah Personil
        </button>
      </div>

      <!-- Data Table -->
      <div v-else class="overflow-x-auto">
        <table class="w-full text-left border-collapse">
          <thead>
            <tr class="bg-gray-50/50 dark:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700">
              <th class="px-8 py-6 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Nama Lengkap</th>
              <th class="px-8 py-6 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Posisi</th>
              <th class="px-8 py-6 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Kualifikasi</th>
              <th class="px-8 py-6 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Kontak</th>
              <th class="px-8 py-6 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-right">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-50 dark:divide-gray-700">
            <tr v-for="person in personnel" :key="person.id_personil" class="group hover:bg-violet-50/30 dark:hover:bg-violet-900/10 transition-colors duration-200">
              <td class="px-8 py-6">
                <div class="flex items-center gap-4">
                  <div class="w-12 h-12 rounded-full bg-gradient-to-br from-violet-100 to-fuchsia-100 dark:from-violet-900 dark:to-fuchsia-900 text-violet-600 dark:text-violet-300 flex items-center justify-center font-black text-xl shadow-sm group-hover:scale-110 transition-transform duration-300">
                    {{ person.nama?.charAt(0) || '?' }}
                  </div>
                  <div>
                    <div class="font-bold text-gray-900 dark:text-white text-lg">{{ person.nama }}</div>
                    <div class="text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2 mt-1">
                      <i class="fas fa-certificate text-xs opacity-50" :class="person.sertifikat ? 'text-green-500' : 'text-gray-400'"></i>
                      {{ person.sertifikat ? 'Bersertifikat' : 'Non-Sertifikat' }}
                    </div>
                  </div>
                </div>
              </td>
              <td class="px-8 py-6">
                <span class="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300">
                  <i class="fas fa-id-badge text-xs"></i>
                  {{ person.posisi }}
                </span>
              </td>
              <td class="px-8 py-6">
                <div class="space-y-1">
                  <div class="text-gray-900 dark:text-white font-semibold flex items-center gap-2">
                    <i class="fas fa-graduation-cap text-gray-400 text-xs"></i>
                    {{ person.pendidikan }}
                  </div>
                  <div class="text-sm text-gray-500 dark:text-gray-400 font-medium flex items-center gap-2">
                    <i class="fas fa-history text-gray-400 text-xs"></i>
                    {{ person.pengalaman_tahun }} Tahun Pengalaman
                  </div>
                </div>
              </td>
              <td class="px-8 py-6">
                <div class="space-y-1">
                  <div class="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2">
                    <i class="fas fa-envelope text-gray-400 text-xs w-4"></i>
                    {{ person.email }}
                  </div>
                  <div class="text-sm text-gray-600 dark:text-gray-400 font-medium flex items-center gap-2">
                    <i class="fas fa-phone text-gray-400 text-xs w-4"></i>
                    {{ person.telepon }}
                  </div>
                </div>
              </td>
              <td class="px-8 py-6 text-right">
                <div class="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-4 group-hover:translate-x-0">
                  <button 
                    @click="openModal(person)" 
                    class="w-10 h-10 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:text-violet-600 dark:hover:text-violet-400 hover:border-violet-200 dark:hover:border-violet-500 hover:bg-violet-50 dark:hover:bg-violet-900/30 flex items-center justify-center transition-all shadow-sm hover:shadow-md"
                    title="Edit"
                  >
                    <i class="fas fa-pen"></i>
                  </button>
                  <button 
                    @click="confirmDelete(person)" 
                    class="w-10 h-10 rounded-xl bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 flex items-center justify-center transition-all shadow-sm hover:shadow-md"
                    title="Hapus"
                  >
                    <i class="fas fa-trash"></i>
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Form Modal -->
    <BaseModal 
      :show="showModal" 
      :title="isEditing ? 'Edit Personil' : 'Tambah Personil'"
      subtitle="Lengkapi data personil di bawah ini"
      @close="closeModal"
    >
      <form @submit.prevent="savePerson" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="col-span-2">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Nama Lengkap <span class="text-red-500">*</span></label>
            <div class="relative">
              <i class="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input v-model="form.nama" type="text" class="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all outline-none font-medium text-gray-900 dark:text-white placeholder-gray-400" required placeholder="Contoh: Ir. Budi Santoso, MT" />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Posisi/Jabatan</label>
            <div class="relative">
              <i class="fas fa-id-badge absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input v-model="form.posisi" type="text" class="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all outline-none font-medium text-gray-900 dark:text-white placeholder-gray-400" placeholder="Contoh: Ahli Struktur" />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Pendidikan Terakhir</label>
            <div class="relative">
              <i class="fas fa-graduation-cap absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input v-model="form.pendidikan" type="text" class="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all outline-none font-medium text-gray-900 dark:text-white placeholder-gray-400" placeholder="Contoh: S2 Teknik Sipil" />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Pengalaman (Tahun)</label>
            <div class="relative">
              <i class="fas fa-history absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input v-model="form.pengalaman_tahun" type="number" class="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all outline-none font-medium text-gray-900 dark:text-white placeholder-gray-400" placeholder="0" />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Email</label>
            <div class="relative">
              <i class="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input v-model="form.email" type="email" class="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all outline-none font-medium text-gray-900 dark:text-white placeholder-gray-400" placeholder="email@contoh.com" />
            </div>
          </div>
          
          <div>
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">No. Telepon</label>
            <div class="relative">
              <i class="fas fa-phone absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
              <input v-model="form.telepon" type="tel" class="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all outline-none font-medium text-gray-900 dark:text-white placeholder-gray-400" placeholder="0812..." />
            </div>
          </div>
          
          <div class="col-span-2">
            <label class="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Sertifikat Keahlian (SKA/SKT)</label>
            <div class="relative">
              <i class="fas fa-certificate absolute left-4 top-4 text-gray-400"></i>
              <textarea v-model="form.sertifikat" class="w-full pl-12 pr-4 py-3.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border-transparent focus:bg-white dark:focus:bg-gray-700 focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all outline-none font-medium text-gray-900 dark:text-white placeholder-gray-400 min-h-[100px]" placeholder="Contoh: Ahli Madya Teknik Jalan, Ahli K3 Konstruksi"></textarea>
            </div>
          </div>
        </div>
      </form>

      <template #footer>
        <button type="button" @click="closeModal" class="px-6 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold transition-colors">Batal</button>
        <button @click="savePerson" class="px-8 py-3 rounded-xl bg-gray-900 dark:bg-violet-600 text-white hover:bg-gray-800 dark:hover:bg-violet-700 font-bold shadow-lg hover:shadow-xl transition-all flex items-center gap-2" :disabled="saving">
          <i v-if="saving" class="fas fa-spinner fa-spin"></i>
          {{ saving ? 'Menyimpan...' : 'Simpan Data' }}
        </button>
      </template>
    </BaseModal>

    <!-- Delete Confirmation Modal -->
    <BaseModal 
      :show="showDeleteModal" 
      title="Hapus Personil?" 
      maxWidth="md"
      @close="showDeleteModal = false"
    >
      <div class="text-center">
        <div class="w-20 h-20 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-3xl flex items-center justify-center text-3xl mx-auto mb-6 shadow-sm">
          <i class="fas fa-trash-alt"></i>
        </div>
        <p class="text-gray-500 dark:text-gray-400 mb-8 leading-relaxed">
          Apakah Anda yakin ingin menghapus <strong>{{ selectedPerson?.nama }}</strong>? <br>Tindakan ini tidak dapat dibatalkan.
        </p>
      </div>
      <template #footer>
        <div class="flex justify-center gap-4 w-full">
          <button @click="showDeleteModal = false" class="px-6 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-bold transition-colors">Batal</button>
          <button @click="deletePerson" class="px-8 py-3 rounded-xl bg-red-500 text-white hover:bg-red-600 font-bold shadow-lg shadow-red-500/30 transition-all flex items-center gap-2" :disabled="deleting">
            <i v-if="deleting" class="fas fa-spinner fa-spin"></i>
            {{ deleting ? 'Menghapus...' : 'Ya, Hapus' }}
          </button>
        </div>
      </template>
    </BaseModal>
  </div>
</template>

<script setup>
import { useToast } from 'vue-toastification'

definePageMeta({
  layout: 'dashboard'
})

const config = useRuntimeConfig()
const apiUrl = config.public.apiBaseUrl
const toast = useToast()

// State
const personnel = ref([])
const pending = ref(true)
const error = ref(null)

// Modal State
const showModal = ref(false)
const showDeleteModal = ref(false)
const isEditing = ref(false)
const saving = ref(false)
const deleting = ref(false)
const selectedPerson = ref(null)

// Form Data
const form = reactive({
  id_personil: '',
  nama: '',
  posisi: '',
  pendidikan: '',
  pengalaman_tahun: '',
  sertifikat: '',
  email: '',
  telepon: ''
})

// Fetch Data
const fetchData = async () => {
  pending.value = true
  error.value = null
  try {
    const res = await $fetch(`${apiUrl}/personnel`)
    personnel.value = res.data || []
  } catch (err) {
    error.value = err
    console.error('Error fetching personnel:', err)
  } finally {
    pending.value = false
  }
}

// Initial fetch
onMounted(fetchData)

// Actions
const openModal = (person = null) => {
  if (person) {
    isEditing.value = true
    Object.assign(form, person)
  } else {
    isEditing.value = false
    // Reset form
    Object.keys(form).forEach(key => form[key] = '')
  }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  selectedPerson.value = null
}

const confirmDelete = (person) => {
  selectedPerson.value = person
  showDeleteModal.value = true
}

const savePerson = async () => {
  saving.value = true
  try {
    if (isEditing.value) {
      await $fetch(`${apiUrl}/personnel/${form.id_personil}`, {
        method: 'PUT',
        body: form
      })
      toast.success('Data personil berhasil diperbarui!')
    } else {
      await $fetch(`${apiUrl}/personnel`, {
        method: 'POST',
        body: form
      })
      toast.success('Data personil berhasil ditambahkan!')
    }
    
    // Refresh data
    await fetchData()
    closeModal()
  } catch (err) {
    console.error('Error saving person:', err)
    toast.error('Gagal menyimpan data: ' + (err.data?.message || err.message))
  } finally {
    saving.value = false
  }
}

const deletePerson = async () => {
  if (!selectedPerson.value) return
  
  deleting.value = true
  try {
    await $fetch(`${apiUrl}/personnel/${selectedPerson.value.id_personil}`, {
      method: 'DELETE'
    })
    
    toast.success('Data personil berhasil dihapus!')
    
    // Refresh data
    await fetchData()
    showDeleteModal.value = false
    selectedPerson.value = null
  } catch (err) {
    console.error('Error deleting person:', err)
    toast.error('Gagal menghapus data: ' + (err.data?.message || err.message))
  } finally {
    deleting.value = false
  }
}

useHead({
  title: 'Data Personil - KPN FAST'
})
</script>
