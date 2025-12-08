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
        class="group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden cursor-pointer"
        @click="navigateToDetail(company.id_perusahaan)"
      >
        <!-- Top Accent Line -->
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-800 group-hover:from-blue-500 group-hover:to-cyan-400 transition-all duration-300"></div>

        <div class="p-5 flex flex-col h-full relative">
          <!-- Card Header layout -->
          <div class="flex items-start gap-4 mb-4">
            <!-- Compact Logo -->
            <div class="flex-shrink-0 w-14 h-14 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 flex items-center justify-center overflow-hidden shadow-sm p-1">
              <img 
                v-if="shouldShowLogo(company)"
                :src="getCompanyLogoUrl(company)" 
                :alt="company.nama_perusahaan"
                class="w-full h-full object-contain"
                @error="(e) => handleImageError(e, company)"
              />
              <div v-else class="w-full h-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center rounded-lg">
                 <span class="text-xs font-bold text-slate-400 tracking-tighter">{{ getInitials(company.nama_perusahaan) }}</span>
              </div>
            </div>

            <div class="flex-grow min-w-0 pt-0.5">
               <div class="flex items-center gap-2 mb-1">
                  <span 
                    class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border"
                    :class="company.status === 'Pusat' 
                      ? 'bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800' 
                      : 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-700/30 dark:text-slate-400 dark:border-slate-600'"
                  >
                    {{ company.status || 'PUSAT' }}
                  </span>
               </div>
               <h3 class="text-base font-bold text-slate-800 dark:text-gray-100 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors" :title="company.nama_perusahaan">
                {{ company.nama_perusahaan }}
              </h3>
            </div>
          </div>

          <!-- Compact Details -->
          <div class="space-y-2.5 flex-grow">
            <!-- Email -->
            <div class="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
               <div class="w-5 flex justify-center"><i class="fas fa-envelope text-slate-400"></i></div>
               <span class="truncate font-medium">{{ company.email || '-' }}</span>
            </div>
             <!-- Phone -->
            <div class="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
               <div class="w-5 flex justify-center"><i class="fas fa-phone text-slate-400"></i></div>
               <span class="truncate font-medium">{{ company.no_telp || '-' }}</span>
            </div>
             <!-- Est -->
            <div class="flex items-center gap-2.5 text-xs text-slate-500 dark:text-slate-400">
               <div class="w-5 flex justify-center"><i class="fas fa-history text-slate-400"></i></div>
               <span class="truncate font-medium">Est. {{ company.tahun_berdiri || 'N/A' }}</span>
            </div>
          </div>

          <!-- Hover Indicator (Arrow) -->
          <div class="absolute bottom-5 right-5 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
             <i class="fas fa-arrow-right text-blue-500 text-lg"></i>
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
  const words = name.replace(/[^\w\s]/gi, '').split(/\s+/).filter(w => w.length > 0)
  if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

// === LOGO HANDLER (Hybrid: Local First, Google Drive Fallback) ===
const getCompanyLogoUrl = (company) => {
  console.log('🔍 DEBUG Logo for', company.nama_perusahaan)
  console.log('  - lokal_logo:', company.lokal_logo)
  console.log('  - logo_perusahaan:', company.logo_perusahaan)
  console.log('  - logo_url:', company.logo_url)
  
  // PRIORITY 1: Local asset (fastest & most reliable)
  if (company.lokal_logo) {
    // Ensure path starts with /
    const localPath = company.lokal_logo.startsWith('/') 
      ? company.lokal_logo 
      : '/' + company.lokal_logo
    console.log('  ✅ Using local asset (Priority 1):', localPath)
    return localPath
  }
  
  // PRIORITY 2: Google Drive URL or logo_perusahaan
  const url = company.logo_perusahaan || company.logo_url
  
  if (!url) {
    console.log('  ❌ No URL found, trying default fallback')
    const localPath = `/assets/logos/${company.id_perusahaan}.svg`
    console.log('  🔄 Fallback to default:', localPath)
    return localPath
  }
  
  // If URL starts with /, it's a local path - use as is
  if (url.startsWith('/')) {
    console.log('  ✅ Using local path from logo_perusahaan:', url)
    return url
  }
  
  // If it's a Google Drive URL, convert it
  if (url.includes('drive.google.com')) {
    let id = ''
    const parts = url.split('/')
    const dIndex = parts.indexOf('d')
    if (dIndex !== -1 && parts[dIndex + 1]) {
      id = parts[dIndex + 1]
    } else if (url.includes('id=')) {
      id = url.split('id=')[1].split('&')[0]
    }
    
    if (id) {
      const finalUrl = `https://drive.google.com/uc?export=download&id=${id}`
      console.log('  ⚠️ Using Google Drive (Priority 2):', finalUrl)
      return finalUrl
    }
  }
  
  console.log('  ⚠️ Using original URL:', url)
  return url
}

const shouldShowLogo = (company) => {
  // Always try to show logo - we have fallback now
  if (imageErrors.value[company.id_perusahaan]) {
    console.log('  ⚠️ Image error cached for', company.nama_perusahaan, '- will try fallback')
    // Don't return false - let it try fallback
  }
  return true
}

const handleImageError = (e, company) => {
  console.error('❌ Image load error for', company.nama_perusahaan)
  
  // If current src is Google Drive, try local fallback
  const currentSrc = e.target.src
  if (currentSrc.includes('drive.google.com')) {
    console.log('  🔄 Google Drive failed, trying local fallback...')
    const localPath = `/assets/logos/${company.id_perusahaan}.svg`
    e.target.src = localPath
    // Don't mark as error yet, give local a chance
    return
  }
  
  // If local also failed, mark as error and show initials
  console.log('  ❌ All sources failed, showing initials')
  imageErrors.value[company.id_perusahaan] = true
}

// === Navigation ===

const navigateToDetail = (id) => {
  router.push(`/database/companies/${id}`)
}

// === Data Fetching ===

const fetchCompanies = async () => {
  loading.value = true
  imageErrors.value = {}
  try {
    const response = await fetch(`${apiBaseUrl}/companies`)
    if (!response.ok) throw new Error('Failed to fetch data')
    
    const result = await response.json()
    companies.value = Array.isArray(result) ? result : (result.data || [])
    
    console.log('📊 API Response:', result)
    console.log('📊 Total companies:', companies.value.length)
    
    // Log first company for debugging
    if (companies.value.length > 0) {
      console.log('📊 First company data:', companies.value[0])
      console.log('📊 Fields available:', Object.keys(companies.value[0]))
    }
    
  } catch (err) {
    showError('Gagal memuat data perusahaan: ' + err.message)
    console.error('❌ Fetch error:', err)
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
      headers: { 'Content-Type': 'application/json' },
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

onMounted(() => {
  fetchCompanies()
})
</script>
