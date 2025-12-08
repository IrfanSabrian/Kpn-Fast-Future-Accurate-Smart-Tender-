<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 p-6 font-sans">
    <!-- Background Tech Grid Pattern -->
    <div class="fixed inset-0 z-0 pointer-events-none opacity-[0.03]" 
         style="background-image: radial-gradient(#475569 1px, transparent 1px); background-size: 24px 24px;">
    </div>

    <!-- Header Section -->
    <div class="relative z-10 max-w-7xl mx-auto mb-8">
      <div class="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-200 dark:border-slate-800">
        <div>
          <div class="flex items-center gap-2 mb-1">
            <span class="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold tracking-wider uppercase border border-blue-200 dark:border-blue-800">
              KPN-FAST SYSTEM
            </span>
          </div>
          <h1 class="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">
            Database <span class="text-blue-600">Perusahaan</span>
          </h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium max-w-xl">
            Sistem manajemen data legalitas & profil perusahaan terintegrasi.
          </p>
        </div>
        
        <div class="flex items-center gap-3">
           <div class="hidden md:block text-right mr-2">
            <div class="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Data</div>
            <div class="text-xl font-mono font-bold text-slate-700 dark:text-slate-200">{{ companies.length }}</div>
          </div>
          <button
            @click="openAddModal"
            class="group relative px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-sm font-bold rounded-lg shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 overflow-hidden flex items-center gap-2"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-blue-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300 mix-blend-overlay"></div>
            <i class="fas fa-plus text-xs"></i>
            <span>ENTRI BARU</span>
          </button>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 relative z-10">
      <div class="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
      <p class="mt-4 text-slate-400 text-xs font-mono animate-pulse">SYNCING DATABASE...</p>
    </div>

    <!-- Companies Grid (Compact Mode) -->
    <div v-else-if="companies.length > 0" class="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      <div
        v-for="company in companies"
        :key="company.id_perusahaan"
        class="group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden"
        @click="navigateToDetail(company.id_perusahaan)"
      >
        <!-- Top Accent Line -->
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-800 group-hover:from-blue-500 group-hover:to-cyan-400 transition-all duration-300"></div>

        <div class="p-5 flex flex-col h-full">
          <!-- Card Header layout -->
          <div class="flex items-start gap-3 mb-4">
            <!-- Compact Logo -->
            <div class="flex-shrink-0 w-12 h-12 rounded-lg bg-slate-50 dark:bg-slate-700/50 border border-slate-100 dark:border-slate-600 flex items-center justify-center overflow-hidden">
              <img 
                v-if="shouldShowLogo(company)"
                :src="getCompanyLogoUrl(company)" 
                :alt="company.nama_perusahaan"
                class="w-full h-full object-contain p-1"
                @error="(e) => handleImageError(e, company)"
              />
              <div v-else class="w-full h-full bg-slate-800 dark:bg-slate-700 flex items-center justify-center">
                 <span class="text-xs font-bold text-white tracking-tighter">{{ getInitials(company.nama_perusahaan) }}</span>
              </div>
            </div>

            <div class="flex-grow min-w-0">
               <div class="flex items-center justify-between mb-0.5">
                  <span 
                    class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border"
                    :class="company.status === 'Pusat' 
                      ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800' 
                      : 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-700/30 dark:text-slate-400 dark:border-slate-600'"
                  >
                    {{ company.status || 'PUSAT' }}
                  </span>
                  <div class="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 group-hover:bg-blue-500 transition-colors"></div>
               </div>
               <h3 class="text-sm font-bold text-slate-800 dark:text-gray-100 leading-tight line-clamp-2 group-hover:text-blue-600 transition-colors" :title="company.nama_perusahaan">
                {{ company.nama_perusahaan }}
              </h3>
            </div>
          </div>

          <!-- Compact Details -->
          <div class="space-y-2 mb-4 flex-grow">
            <!-- Email -->
            <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
               <i class="fas fa-envelope w-3 text-center text-slate-300 group-hover:text-blue-400 transition-colors"></i>
               <span class="truncate">{{ company.email || '-' }}</span>
            </div>
             <!-- Phone -->
            <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
               <i class="fas fa-phone w-3 text-center text-slate-300 group-hover:text-blue-400 transition-colors"></i>
               <span class="truncate">{{ company.no_telp || '-' }}</span>
            </div>
             <!-- Est -->
            <div class="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
               <i class="fas fa-history w-3 text-center text-slate-300 group-hover:text-blue-400 transition-colors"></i>
               <span class="truncate">Est. {{ company.tahun_berdiri || 'N/A' }}</span>
            </div>
          </div>

          <!-- Quick Actions Footer -->
          <div class="flex items-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-700/50">
             <button
              v-if="company.profile_perusahaan_url"
              @click.stop="viewProfileDocument(company)"
              class="flex-1 px-2 py-1.5 bg-slate-50 hover:bg-red-50 dark:bg-slate-700/30 dark:hover:bg-red-900/20 text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 text-[11px] font-bold rounded border border-slate-200 dark:border-slate-600/50 hover:border-red-200 transition-all flex items-center justify-center gap-1.5"
            >
              <i class="fas fa-file-pdf"></i>
              PROFIL
            </button>
             <button
              v-else
              disabled
              class="flex-1 px-2 py-1.5 bg-slate-50 dark:bg-slate-800 text-slate-300 text-[11px] font-bold rounded border border-slate-100 dark:border-slate-700 cursor-not-allowed flex items-center justify-center gap-1.5"
            >
              <i class="fas fa-times"></i>
              NO DATA
            </button>

            <button 
              class="px-2 py-1.5 text-slate-400 hover:text-blue-600 bg-transparent hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded transition-colors"
            >
              <i class="fas fa-arrow-right text-xs"></i>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty Tech State -->
    <div v-else class="relative z-10 max-w-sm mx-auto mt-20 text-center border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-10">
      <div class="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 text-slate-400">
        <i class="fas fa-database text-2xl"></i>
      </div>
      <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">Database Kosong</h3>
      <p class="text-sm text-slate-500 mb-6">Belum ada entitas perusahaan terdaftar dalam sistem.</p>
      <button
        @click="openAddModal"
        class="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-lg shadow-blue-500/20 transition-all flex items-center justify-center gap-2 w-full"
      >
        <i class="fas fa-plus"></i>
        Input Data
      </button>
    </div>

    <!-- Modals (Re-used) -->
    <BaseModal 
      :show="showEditModal" 
      @close="closeEditModal" 
      :title="isEditMode ? 'Edit Data Perusahaan' : 'Registrasi Perusahaan Baru'"
      subtitle="Pastikan data sesuai dengan dokumen legalitas."
      max-width="3xl"
    >
      <template #body>
        <form @submit.prevent="saveEdit" class="space-y-5">
           <!-- Form content similar but with updated styling -->
           <div class="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div class="space-y-4">
              <FormInput
                v-if="isEditMode"
                v-model="editForm.id_perusahaan"
                label="SYSTEM ID"
                disabled
                class="font-mono text-sm"
              />
              <FormInput
                v-model="editForm.nama_perusahaan"
                label="NAMA ENTITAS BADAN USAHA"
                placeholder="PT. / CV."
                required
                class="font-bold"
              />
               <div class="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-700">
                <label class="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                  Status Kantor
                </label>
                <div class="flex gap-4">
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" v-model="editForm.status" value="Pusat" class="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300">
                    <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Pusat</span>
                  </label>
                  <label class="flex items-center gap-2 cursor-pointer">
                    <input type="radio" v-model="editForm.status" value="Cabang" class="w-4 h-4 text-blue-600 focus:ring-blue-500 border-gray-300">
                    <span class="text-sm font-medium text-slate-700 dark:text-slate-300">Cabang</span>
                  </label>
                </div>
              </div>
            </div>

            <div class="space-y-4">
              <div class="grid grid-cols-2 gap-4">
                 <FormInput
                  v-model="editForm.tahun_berdiri"
                  label="TAHUN BERDIRI"
                  type="number"
                  placeholder="YYYY"
                />
                <FormInput
                  v-model="editForm.npwp"
                  label="NPWP"
                  placeholder="XX.XXX.XXX.X"
                />
              </div>
               <FormInput
                v-model="editForm.email"
                label="EMAIL RESMI"
                type="email"
              />
               <FormInput
                v-model="editForm.no_telp"
                label="NO. TELEPON"
              />
            </div>
           </div>
           
           <FormInput
              v-model="editForm.alamat"
              label="ALAMAT LENGKAP"
              type="textarea"
              rows="2"
            />
        </form>
      </template>

      <template #footer>
        <button 
          @click="closeEditModal"
          class="px-5 py-2 text-slate-600 hover:bg-slate-100 rounded-lg text-sm font-bold transition-colors"
        >
          BATAL
        </button>
        <button 
          @click="saveEdit" 
          :disabled="saving"
          class="px-6 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg text-sm font-bold shadow-md hover:shadow-lg transition-all disabled:opacity-50 flex items-center gap-2"
        >
          <i v-if="saving" class="fas fa-circle-notch animate-spin"></i>
          {{ saving ? 'SAVING...' : 'SIMPAN DATA' }}
        </button>
      </template>
    </BaseModal>

    <!-- Profile Viewer Modal (Clean) -->
    <BaseModal 
      :show="showProfileModal" 
      @close="showProfileModal = false" 
      max-width="5xl"
      :title="selectedCompany?.nama_perusahaan"
      subtitle="PREVIEW DOKUMEN PROFIL"
    >
      <template #body>
         <div v-if="selectedCompany?.profile_perusahaan_url" class="relative bg-slate-900 rounded-lg overflow-hidden shadow-inner w-full h-[70vh]">
          <iframe 
            :src="getGoogleDrivePreviewUrl(selectedCompany.profile_perusahaan_url)" 
            class="w-full h-full"
            frameborder="0"
          ></iframe>
        </div>
        <div v-else class="h-40 flex flex-col items-center justify-center text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
          <i class="fas fa-file-excel text-3xl mb-2 opacity-50"></i>
          <p class="text-sm font-medium">File offline / tidak tersedia</p>
        </div>
      </template>
      <template #footer>
          <div class="flex items-center gap-2">
             <span class="text-xs text-slate-400 mr-2">EXTERNAL VIEWER:</span>
             <a
              v-if="selectedCompany?.profile_perusahaan_url"
              :href="selectedCompany.profile_perusahaan_url"
              target="_blank"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded flex items-center gap-2 transition-colors"
            >
              <i class="fas fa-external-link-alt"></i>
              GOOGLE DRIVE
            </a>
          </div>
      </template>
    </BaseModal>

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
import BaseModal from '~/components/BaseModal.vue'
import BaseToast from '~/components/BaseToast.vue'
import FormInput from '~/components/FormInput.vue'

definePageMeta({
  layout: 'dashboard'
})

const config = useRuntimeConfig()
const apiBaseUrl = config.public.apiBaseUrl
const router = useRouter()

// Use toast composable
const { toast, success, error: showError, hideToast } = useToast()

const loading = ref(true)
const companies = ref([])
const showEditModal = ref(false)
const showProfileModal = ref(false)
const selectedCompany = ref(null)
const editingCompany = ref(null)
const isEditMode = ref(false)
const saving = ref(false)
const imageErrors = ref({})

const editForm = ref({
  id_perusahaan: '',
  nama_perusahaan: '',
  status: 'Pusat',
  email: '',
  no_telp: '',
  no_fax: '',
  npwp: '',
  tahun_berdiri: '',
  alamat: ''
})

// === Helpers ===

const getInitials = (name) => {
  if (!name) return '?'
  // Ambil 2 huruf pertama dari 2 kata pertama
  const words = name.replace(/[^\w\s]/gi, '').split(/\s+/).filter(w => w.length > 0)
  if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

// === LOGO HANDLER (NEW FEATURE) ===
// Converts raw Google Drive links to usable image URLs
const getCompanyLogoUrl = (company) => {
  const url = company.logo_url
  if (!url) return '' // Return empty string to trigger fallback
  
  if (url.includes('drive.google.com')) {
    // Try to extract ID
    let id = ''
    const parts = url.split('/')
    
    // Case 1: .../d/ID/...
    const dIndex = parts.indexOf('d')
    if (dIndex !== -1 && parts[dIndex + 1]) {
      id = parts[dIndex + 1]
    } 
    // Case 2: ...id=ID...
    else if (url.includes('id=')) {
      id = url.split('id=')[1].split('&')[0]
    }

    if (id) {
      // Use Google Drive Export endpoint for images
      return `https://drive.google.com/uc?export=view&id=${id}`
    }
  }
  
  return url
}

const shouldShowLogo = (company) => {
  if (!company.logo_url) return false
  if (imageErrors.value[company.id_perusahaan]) return false
  return true
}

const handleImageError = (e, company) => {
  // Mark this company as having a broken image to show fallback
  imageErrors.value[company.id_perusahaan] = true
}

const getGoogleDrivePreviewUrl = (url) => {
  if (!url) return ''
  if (url.includes('/view')) return url.replace('/view', '/preview')
  return url
}

// === Navigation ===

const navigateToDetail = (id) => {
  router.push(`/database/companies/${id}`)
}

// === Data Fetching ===

const fetchCompanies = async () => {
  loading.value = true
  // Reset image errors on refresh
  imageErrors.value = {}
  
  try {
    const response = await fetch(`${apiBaseUrl}/companies`) // Update endpoint
    if (!response.ok) throw new Error('Failed to fetch data')
    
    const result = await response.json()
    // Handle wrapped response
    companies.value = Array.isArray(result) ? result : (result.data || [])
    
    // Check if we need to correct image URLs in memory
    companies.value.forEach(c => {
       // Debugging purposes
       if(c.logo_url) console.log(`Loaded logo for ${c.nama_perusahaan}:`, c.logo_url)
    })
    
  } catch (err) {
    showError('Gagal memuat data perusahaan: ' + err.message)
  } finally {
    loading.value = false
  }
}

// === CRUD Actions ===

const openAddModal = () => {
  isEditMode.value = false
  editForm.value = {
    id_perusahaan: '',
    nama_perusahaan: '',
    status: 'Pusat',
    email: '',
    no_telp: '',
    no_fax: '',
    npwp: '',
    tahun_berdiri: '',
    alamat: ''
  }
  showEditModal.value = true
}

const openEditModal = (company) => { // Currently not called from grid but ready
  isEditMode.value = true
  editingCompany.value = company
  editForm.value = { ...company }
  showEditModal.value = true
}

const closeEditModal = () => {
  showEditModal.value = false
  editingCompany.value = null
}

const saveEdit = async () => {
  saving.value = true
  try {
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

    if (!response.ok) throw new Error('Gagal menyimpan data')

    success(isEditMode.value ? 'Data berhasil diperbarui' : 'Perusahaan baru ditambahkan')
    closeEditModal()
    await fetchCompanies()
    
  } catch (err) {
    showError(err.message)
  } finally {
    saving.value = false
  }
}

const viewProfileDocument = (company) => {
  selectedCompany.value = company
  showProfileModal.value = true
}

onMounted(() => {
  fetchCompanies()
})
</script>
