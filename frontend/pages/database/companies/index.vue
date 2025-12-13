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
          <!-- Add Company Button -->
          <button
            @click="isModalOpen = true"
            class="group flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <i class="fas fa-plus text-sm group-hover:rotate-90 transition-transform duration-300"></i>
            <span>Tambah Perusahaan</span>
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
    </div>

    <!-- Add Company Modal -->
    <Teleport to="body">
      <Transition
        enter-active-class="transition-all duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition-all duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div
          v-if="isModalOpen"
          class="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          @click.self="closeModal"
        >
          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-4"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-4"
          >
            <div
              v-if="isModalOpen"
              class="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <!-- Modal Header -->
              <div class="sticky top-0 bg-gradient-to-r from-blue-600 to-cyan-500 px-6 py-5 flex justify-between items-center rounded-t-2xl z-10">
                <div>
                  <h2 class="text-xl font-bold text-white">Tambah Perusahaan Baru</h2>
                  <p class="text-blue-100 text-sm mt-1">Lengkapi data profil perusahaan</p>
                </div>
                <button
                  @click="closeModal"
                  class="text-white/80 hover:text-white hover:bg-white/20 p-2 rounded-lg transition-colors"
                >
                  <i class="fas fa-times text-xl"></i>
                </button>
              </div>

              <!-- Modal Body -->
              <form @submit.prevent="handleSubmit" class="p-6 space-y-6">
                <!-- Nama Perusahaan (Full Width) -->
                <div>
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Nama Perusahaan <span class="text-red-500">*</span>
                  </label>
                  <input
                    v-model="formData.nama_perusahaan"
                    type="text"
                    required
                    class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    placeholder="PT. Contoh Perusahaan"
                  />
                </div>

                <!-- No Telp & Email (2 Columns) -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      No. Telepon
                    </label>
                    <input
                      v-model="formData.no_telp"
                      type="tel"
                      class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="08123456789"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Email
                    </label>
                    <input
                      v-model="formData.email"
                      type="email"
                      class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="info@perusahaan.com"
                    />
                  </div>
                </div>

                <!-- Tahun Berdiri & Status (2 Columns) -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Tahun Berdiri
                    </label>
                    <input
                      v-model="formData.tahun_berdiri"
                      type="number"
                      min="1900"
                      :max="new Date().getFullYear()"
                      class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                      placeholder="2020"
                    />
                  </div>
                  <div>
                    <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      Status
                    </label>
                    <select
                      v-model="formData.status"
                      class="w-full px-4 py-3 bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                    >
                      <option value="Pusat">Pusat</option>
                      <option value="Cabang">Cabang</option>
                    </select>
                  </div>
                </div>

                <!-- Logo Upload -->
                <div>
                  <label class="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
                    Logo Perusahaan
                  </label>
                  <div class="flex flex-col gap-4">
                    <!-- File Input -->
                    <div
                      class="relative border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg p-6 text-center hover:border-blue-500 transition-colors cursor-pointer"
                      @click="$refs.logoInput.click()"
                      @dragover.prevent="isDragging = true"
                      @dragleave.prevent="isDragging = false"
                      @drop.prevent="handleFileDrop"
                      :class="{ 'border-blue-500 bg-blue-50 dark:bg-blue-900/10': isDragging }"
                    >
                      <input
                        ref="logoInput"
                        type="file"
                        accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                        @change="handleFileChange"
                        class="hidden"
                      />
                      <div v-if="!logoPreview">
                        <i class="fas fa-cloud-upload-alt text-4xl text-slate-400 mb-3"></i>
                        <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">
                          Klik atau drag & drop logo di sini
                        </p>
                        <p class="text-xs text-slate-500 mt-1">JPG, PNG, GIF, atau WEBP (Max 50MB)</p>
                      </div>
                      <div v-else class="flex items-center gap-4">
                        <img :src="logoPreview" alt="Logo Preview" class="w-24 h-24 object-contain rounded-lg border border-slate-200 dark:border-slate-600" />
                        <div class="flex-1 text-left">
                          <p class="text-sm font-semibold text-slate-700 dark:text-slate-300">{{ logoFile.name }}</p>
                          <p class="text-xs text-slate-500">{{ formatFileSize(logoFile.size) }}</p>
                        </div>
                        <button
                          type="button"
                          @click.stop="clearLogo"
                          class="text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 p-2 rounded-lg transition-colors"
                        >
                          <i class="fas fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Actions -->
                <div class="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    type="button"
                    @click="closeModal"
                    :disabled="isSubmitting"
                    class="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-semibold rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    :disabled="!formData.nama_perusahaan || isSubmitting"
                    class="px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-700 hover:to-cyan-600 text-white font-semibold rounded-lg shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    <i v-if="isSubmitting" class="fas fa-spinner fa-spin"></i>
                    <i v-else class="fas fa-save"></i>
                    <span>{{ isSubmitting ? 'Menyimpan...' : 'Simpan' }}</span>
                  </button>
                </div>
              </form>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>

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
import BaseToast from '~/components/BaseToast.vue'

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
const imageErrors = ref({})

// Modal state
const isModalOpen = ref(false)
const isSubmitting = ref(false)
const isDragging = ref(false)

// Form data
const formData = ref({
  nama_perusahaan: '',
  no_telp: '',
  email: '',
  tahun_berdiri: '',
  status: 'Pusat'
})

// Logo handling
const logoFile = ref(null)
const logoPreview = ref('')

// === Modal Functions ===

const closeModal = () => {
  if (!isSubmitting.value) {
    isModalOpen.value = false
    resetForm()
  }
}

const resetForm = () => {
  formData.value = {
    nama_perusahaan: '',
    no_telp: '',
    email: '',
    tahun_berdiri: '',
    status: 'Pusat'
  }
  logoFile.value = null
  logoPreview.value = ''
  isDragging.value = false
}

// === File Upload Functions ===

const handleFileChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    processLogoFile(file)
  }
}

const handleFileDrop = (event) => {
  isDragging.value = false
  const file = event.dataTransfer.files[0]
  if (file) {
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      showError('Format file tidak valid. Gunakan JPG, PNG, GIF, atau WEBP.')
      return
    }
    processLogoFile(file)
  }
}

const processLogoFile = (file) => {
  // Validate file size (50MB)
  const maxSize = 50 * 1024 * 1024
  if (file.size > maxSize) {
    showError('Ukuran file terlalu besar. Maksimal 50MB.')
    return
  }

  logoFile.value = file
  
  // Create preview
  const reader = new FileReader()
  reader.onload = (e) => {
    logoPreview.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const clearLogo = () => {
  logoFile.value = null
  logoPreview.value = ''
}

const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// === Form Submission ===

const handleSubmit = async () => {
  if (!formData.value.nama_perusahaan) {
    showError('Nama perusahaan wajib diisi!')
    return
  }

  isSubmitting.value = true

  try {
    // Prepare FormData for multipart/form-data
    const submitData = new FormData()
    submitData.append('nama_perusahaan', formData.value.nama_perusahaan)
    submitData.append('no_telp', formData.value.no_telp || '')
    submitData.append('email', formData.value.email || '')
    submitData.append('tahun_berdiri', formData.value.tahun_berdiri || '')
    submitData.append('status', formData.value.status)
    
    // Append logo file if exists
    if (logoFile.value) {
      submitData.append('logo', logoFile.value)
    }

    console.log('📤 Submitting company data...')
    console.log('📄 Form Data:', {
      nama_perusahaan: formData.value.nama_perusahaan,
      no_telp: formData.value.no_telp,
      email: formData.value.email,
      tahun_berdiri: formData.value.tahun_berdiri,
      status: formData.value.status,
      hasLogo: !!logoFile.value
    })

    const response = await fetch(`${apiBaseUrl}/companies`, {
      method: 'POST',
      body: submitData
      // Don't set Content-Type header - browser will set it automatically with boundary for FormData
    })

    const result = await response.json()

    if (!response.ok) {
      throw new Error(result.message || 'Gagal menambahkan perusahaan')
    }

    console.log('✅ Company added successfully:', result)
    success('Perusahaan berhasil ditambahkan!')
    
    // Close modal and refresh data
    closeModal()
    await fetchCompanies()

  } catch (err) {
    console.error('❌ Submit error:', err)
    showError('Gagal menambahkan perusahaan: ' + err.message)
  } finally {
    isSubmitting.value = false
  }
}

// === Helpers ===

const getInitials = (name) => {
  if (!name) return '?'
  const words = name.replace(/[^\w\s]/gi, '').split(/\s+/).filter(w => w.length > 0)
  if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

// === LOGO HANDLER (Cloudinary First, Google Drive as Fallback) ===
const getCompanyLogoUrl = (company) => {
  console.log('🔍 DEBUG Logo for', company.nama_perusahaan)
  console.log('  - logo_cloud:', company.logo_cloud)
  console.log('  - logo_perusahaan:', company.logo_perusahaan)
  console.log('  - logo_url:', company.logo_url)
  
  // PRIORITY 1: Cloudinary URL (logo_cloud) - Cloud-hosted, fast & reliable!
  if (company.logo_cloud) {
    console.log('  ✅ Using Cloudinary URL (Priority 1):', company.logo_cloud)
    return company.logo_cloud
  }
  
  // PRIORITY 2: Google Drive (logo_perusahaan) - Fallback
  const driveUrl = company.logo_perusahaan || company.logo_url
  
  if (driveUrl && driveUrl.includes('drive.google.com')) {
    let id = ''
    const parts = driveUrl.split('/')
    const dIndex = parts.indexOf('d')
    if (dIndex !== -1 && parts[dIndex + 1]) {
      id = parts[dIndex + 1]
    } else if (driveUrl.includes('id=')) {
      id = driveUrl.split('id=')[1].split('&')[0]
    }
    
    if (id) {
      const finalUrl = `https://drive.google.com/uc?export=download&id=${id}`
      console.log('  🔄 Using Google Drive (Priority 2 - Fallback):', finalUrl)
      return finalUrl
    }
  }
  
  // PRIORITY 3: Direct URL (if starts with /)
  if (driveUrl && driveUrl.startsWith('/')) {
    console.log('  ✅ Using local path from logo_perusahaan:', driveUrl)
    return driveUrl
  }
  
  // No valid source - will show initials instead
  console.log('  ℹ️ No valid logo source - will show initials')
  return ''
}

const shouldShowLogo = (company) => {
  // If error cached, show initials instead
  if (imageErrors.value[company.id_perusahaan]) return false
  // Check if valid logo source exists (prioritize local)
  return !!(company.logo_cloud || company.logo_perusahaan || company.logo_url)
}

const handleImageError = (e, company) => {
  console.error('❌ Image load error for', company.nama_perusahaan)
  console.log('  🔄 Falling back to initials display')
  
  // Mark as error - will show initials instead
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

onMounted(() => {
  fetchCompanies()
})
</script>
