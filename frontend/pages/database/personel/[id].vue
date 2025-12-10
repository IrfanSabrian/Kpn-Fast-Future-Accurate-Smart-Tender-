```html
<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
    <!-- Technical Header (Full Width & Sticky) -->
    <header class="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-200">
      <div class="max-w-[1800px] mx-auto px-4 md:px-6 h-16 md:h-24 flex items-center justify-between">
        <div class="flex items-center gap-4 md:gap-6 w-full">
          <!-- Back Button -->
          <button @click="router.push('/database/personel')" class="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-600 transition-colors border border-slate-100 dark:border-slate-700">
            <i class="fas fa-arrow-left"></i>
          </button>
          
          <div class="flex items-center gap-5 flex-1 min-w-0">
             <!-- Avatar Container -->
             <div class="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center p-1.5 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden text-2xl font-bold text-slate-400">
                {{ person ? getInitials(person.nama_lengkap) : '?' }}
             </div>
             
             <div class="flex-1 min-w-0">
               <div class="flex items-center gap-3 mb-1">
                 <h1 class="text-lg md:text-2xl font-black text-slate-900 dark:text-white leading-tight truncate">
                   {{ person?.nama_lengkap || 'Loading Personel...' }}
                 </h1>
                 <!-- Status Badge -->
                  <span v-if="person?.status_personel" class="hidden md:inline-flex items-center justify-center uppercase text-[10px] font-bold tracking-widest px-3 py-1 rounded-md border h-6 bg-emerald-50 border-emerald-100 text-emerald-700 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300">
                   {{ person.status_personel }}
                 </span>
               </div>
               
               <div class="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
                 <div class="flex items-center gap-2 font-mono">
                    <span class="text-slate-300">ID:</span>
                    <span class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">{{ person?.id_personel || '...' }}</span>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content Area -->
    <main class="max-w-[1800px] mx-auto px-4 md:px-6 py-6 min-h-[60vh]">
      <!-- Loading State -->
      <div v-if="loading" class="flex flex-col items-center justify-center py-20">
        <div class="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
        <p class="mt-4 text-slate-400 text-xs font-mono animate-pulse">LOADING PROFILE...</p>
      </div>

      <div v-else-if="person" class="space-y-6">
        
        <!-- Contact Info Card (Mirip Company Overview) -->
        <div class="relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm group">
             <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <i class="fas fa-user-circle text-9xl"></i>
             </div>
             
             <div class="grid grid-cols-1 md:grid-cols-3 gap-4 relative z-10">
                <!-- Phone -->
                <div class="flex items-start gap-4">
                   <div class="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-100 dark:border-emerald-900/50">
                      <i class="fas fa-phone"></i>
                   </div>
                   <div>
                      <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">No. Telepon</p>
                      <p class="font-medium text-slate-700 dark:text-slate-200">{{ person.no_hp || '-' }}</p>
                   </div>
                </div>

                <!-- Email -->
                <div class="flex items-start gap-4">
                   <div class="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center text-purple-600 dark:text-purple-400 shrink-0 border border-purple-100 dark:border-purple-900/50">
                      <i class="fas fa-envelope"></i>
                   </div>
                   <div>
                      <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email Personel</p>
                      <p class="font-medium text-slate-700 dark:text-slate-200 text-sm truncate">{{ person.email_personel || '-' }}</p>
                   </div>
                </div>

                <!-- Address -->
                <div class="flex items-start gap-4">
                   <div class="w-10 h-10 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center text-red-600 dark:text-red-400 shrink-0 border border-red-100 dark:border-red-900/50">
                      <i class="fas fa-map-marker-alt"></i>
                   </div>
                   <div>
                      <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Alamat Domisili</p>
                      <p class="font-medium text-slate-700 dark:text-slate-200 leading-relaxed text-sm">{{ person.alamat_domisili || '-' }}</p>
                   </div>
                </div>
             </div>
        </div>

        <!-- Documents Grid -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <!-- KTP Card -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col h-full">
            <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600">
                  <i class="far fa-id-card text-lg"></i>
                </div>
                <div>
                  <h2 class="text-lg font-bold text-slate-900 dark:text-white">KTP</h2>
                  <p class="text-xs text-slate-500">Identitas Diri</p>
                </div>
              </div>
               <button
                v-if="ktp && ktp.file_ktp_url"
                @click="openKtpModal"
                class="text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded border border-blue-100 hover:bg-blue-100 transition-colors uppercase tracking-wide flex items-center gap-1"
              >
                <i class="fas fa-file-pdf"></i>
                <span>View</span>
              </button>
            </div>

            <div v-if="ktp" class="space-y-0.5 flex-1">
              <!-- NIK Display -->
              <div class="grid grid-cols-[110px_1fr] gap-4 py-3 items-center bg-slate-50 dark:bg-slate-700/30 px-4 -mx-2 rounded-lg mb-4 border border-slate-100 dark:border-slate-700">
                   <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">NIK</div>
                   <div class="text-sm font-mono font-bold text-blue-600 dark:text-blue-400 tracking-wide">
                      {{ ktp.nik || '-' }}
                   </div>
              </div>
              
              <div class="space-y-2">
                  <div class="grid grid-cols-[110px_1fr] gap-2 py-1 border-b border-dashed border-slate-100 dark:border-slate-700">
                    <span class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Nama</span>
                    <span class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ ktp.nama_ktp || '-' }}</span>
                  </div>
                  <div class="grid grid-cols-[110px_1fr] gap-2 py-1 border-b border-dashed border-slate-100 dark:border-slate-700">
                    <span class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Tempat/Tgl Lahir</span>
                    <span class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ ktp.tempat_lahir_ktp || '-' }}, {{ ktp.tanggal_lahir_ktp || '-' }}</span>
                  </div>
                  <div class="grid grid-cols-[110px_1fr] gap-2 py-1 border-b border-dashed border-slate-100 dark:border-slate-700">
                    <span class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Jenis Kelamin</span>
                    <span class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ ktp.jenis_kelamin || '-' }}</span>
                  </div>
                  <div class="grid grid-cols-[110px_1fr] gap-2 py-1 border-b border-dashed border-slate-100 dark:border-slate-700">
                    <span class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Alamat</span>
                    <span class="text-xs font-medium text-slate-700 dark:text-slate-200 leading-snug">{{ ktp.alamat_ktp || '-' }}</span>
                  </div>
                  <div class="grid grid-cols-[110px_1fr] gap-2 py-1">
                    <span class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Berlaku Hingga</span>
                    <span class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ ktp.berlaku_hingga || '-' }}</span>
                  </div>
              </div>
            </div>
            <div v-else class="text-center py-12 text-slate-400">
              <i class="far fa-id-card text-4xl mb-3 opacity-20"></i>
              <p class="text-sm">Data KTP belum tersedia</p>
            </div>
          </div>

          <!-- NPWP Card -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex flex-col h-full">
            <div class="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/20 flex items-center justify-center text-orange-600">
                  <i class="fas fa-credit-card text-lg"></i>
                </div>
                <div>
                  <h2 class="text-lg font-bold text-slate-900 dark:text-white">NPWP</h2>
                  <p class="text-xs text-slate-500">Pajak Personel</p>
                </div>
              </div>
              <button
                v-if="npwp && npwp.file_npwp_personel_url"
                @click="openNpwpModal"
                class="text-[10px] font-bold text-orange-600 bg-orange-50 px-3 py-1.5 rounded border border-orange-100 hover:bg-orange-100 transition-colors uppercase tracking-wide flex items-center gap-1"
              >
                <i class="fas fa-file-pdf"></i>
                <span>View</span>
              </button>
            </div>

            <div v-if="npwp" class="space-y-0.5 flex-1">
              <!-- No NPWP Display -->
              <div class="grid grid-cols-[110px_1fr] gap-4 py-3 items-center bg-slate-50 dark:bg-slate-700/30 px-4 -mx-2 rounded-lg mb-4 border border-slate-100 dark:border-slate-700">
                   <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">NO. NPWP</div>
                   <div class="text-sm font-mono font-bold text-orange-600 dark:text-orange-400 tracking-wide">
                      {{ npwp.nomor_npwp_personel || '-' }}
                   </div>
              </div>

              <div class="space-y-2">
                  <div class="grid grid-cols-[110px_1fr] gap-2 py-1 border-b border-dashed border-slate-100 dark:border-slate-700">
                    <span class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">NIK NPWP</span>
                    <span class="text-xs font-mono font-medium text-slate-700 dark:text-slate-200">{{ npwp.nik_npwp_personel || '-' }}</span>
                  </div>
                  <div class="grid grid-cols-[110px_1fr] gap-2 py-1 border-b border-dashed border-slate-100 dark:border-slate-700">
                    <span class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Nama WP</span>
                    <span class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ npwp.nama_npwp_personel || '-' }}</span>
                  </div>
                  <div class="grid grid-cols-[110px_1fr] gap-2 py-1 border-b border-dashed border-slate-100 dark:border-slate-700">
                    <span class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Alamat</span>
                    <span class="text-xs font-medium text-slate-700 dark:text-slate-200 leading-snug">{{ npwp.alamat_npwp_personel || '-' }}</span>
                  </div>
                  <div class="grid grid-cols-[110px_1fr] gap-2 py-1 border-b border-dashed border-slate-100 dark:border-slate-700">
                    <span class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">KPP</span>
                    <span class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ npwp.kpp_npwp_personel || '-' }}</span>
                  </div>
                  <div class="grid grid-cols-[110px_1fr] gap-2 py-1">
                    <span class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Status</span>
                    <span class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ npwp.status_npwp_personel || '-' }}</span>
                  </div>
              </div>
            </div>
            <div v-else class="text-center py-12 text-slate-400">
              <i class="fas fa-credit-card text-4xl mb-3 opacity-20"></i>
              <p class="text-sm">Data NPWP belum tersedia</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Error State -->
      <div v-else class="max-w-sm mx-auto mt-20 text-center">
        <i class="fas fa-exclamation-triangle text-5xl text-slate-300 mb-4"></i>
        <h3 class="text-xl font-bold text-slate-900 dark:text-white mb-2">Data Tidak Ditemukan</h3>
        <p class="text-slate-500 mb-6">Personel dengan ID tersebut tidak ditemukan dalam sistem.</p>
        <button
          @click="router.push('/database/personel')"
          class="mt-4 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold transition-colors"
        >
          Kembali ke Database
        </button>
      </div>

    </main>
    
    <!-- Modal place needs to be preserved -->
    <BaseToast
      :show="toast.show"
      :type="toast.type"
      :title="toast.title"
      :message="toast.message"
      :duration="toast.duration"
      @close="hideToast"
    />

    <!-- MODALS -->
    
    <!-- KTP Modal -->
    <BaseModal :show="showKtpModal" @close="showKtpModal = false" maxWidth="5xl">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <i class="far fa-id-card"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Dokumen KTP</h3>
            <p v-if="ktp" class="text-xs text-slate-500 mt-0.5">{{ ktp.nik }} - {{ ktp.nama_ktp }}</p>
          </div>
        </div>
      </template>

      <div v-if="ktp" class="w-full h-[60vh]">
        <div class="bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full">
          <div class="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div class="text-xs font-bold text-slate-700 dark:text-slate-200">Preview Dokumen KTP</div>
            <a v-if="ktp.file_ktp_url" :href="ktp.file_ktp_url" target="_blank" class="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100 transition-colors">
              <i class="fas fa-external-link-alt mr-1"></i> Buka di Tab Baru
            </a>
          </div>
          <div class="flex-1 relative">
            <iframe 
              v-if="ktp.file_ktp_url"
              :src="getPreviewUrl(ktp.file_ktp_url)" 
              class="w-full h-full absolute inset-0 border-none"
            ></iframe>
            <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-400">
              <i class="fas fa-file-pdf text-4xl mb-4 opacity-20"></i>
              <p class="text-sm">Dokumen tidak tersedia</p>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>

    <!-- NPWP Modal -->
    <BaseModal :show="showNpwpModal" @close="showNpwpModal = false" maxWidth="5xl">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
            <i class="fas fa-credit-card"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Dokumen NPWP</h3>
            <p v-if="npwp" class="text-xs text-slate-500 mt-0.5">{{ npwp.nomor_npwp_personel }}</p>
          </div>
        </div>
      </template>

      <div v-if="npwp" class="w-full h-[60vh]">
        <div class="bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full">
          <div class="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div class="text-xs font-bold text-slate-700 dark:text-slate-200">Preview Dokumen NPWP</div>
            <a v-if="npwp.file_npwp_personel_url" :href="npwp.file_npwp_personel_url" target="_blank" class="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100 hover:bg-orange-100 transition-colors">
              <i class="fas fa-external-link-alt mr-1"></i> Buka di Tab Baru
            </a>
          </div>
          <div class="flex-1 relative">
            <iframe 
              v-if="npwp.file_npwp_personel_url"
              :src="getPreviewUrl(npwp.file_npwp_personel_url)" 
              class="w-full h-full absolute inset-0 border-none"
            ></iframe>
            <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-400">
              <i class="fas fa-file-pdf text-4xl mb-4 opacity-20"></i>
              <p class="text-sm">Dokumen tidak tersedia</p>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>
  </div>
</template>

<script setup>
import BaseModal from '~/components/BaseModal.vue'

definePageMeta({
  layout: 'dashboard'
})

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const apiBaseUrl = config.public.apiBaseUrl
const { toast, success, error: showError, hideToast } = useToast()

const personId = route.params.id
const loading = ref(true)
const person = ref(null)
const ktp = ref(null)
const npwp = ref(null)

// Modal States
const showKtpModal = ref(false)
const showNpwpModal = ref(false)

// Helper
const getInitials = (name) => {
  if (!name) return '?'
  const words = name.replace(/[^\w\s]/gi, '').split(/\s+/).filter(w => w.length > 0)
  if (words.length >= 2) {
      return (words[0][0] + words[1][0]).toUpperCase()
  }
  return name.slice(0, 2).toUpperCase()
}

// Preview URL Helper (Google Drive & Local)
const getPreviewUrl = (url) => {
  if (!url) return ''
  // If local file
  if (url.startsWith('http://localhost') || url.startsWith('/')) {
     return url
  }
  // If Google Drive view link, convert to preview
  if (url.includes('drive.google.com') && url.includes('/view')) {
      return url.replace('/view', '/preview')
  }
  return url
}

// Modal Handlers
const openKtpModal = () => {
  showKtpModal.value = true
}

const openNpwpModal = () => {
  showNpwpModal.value = true
}

// Fetch Data
const fetchPersonDetail = async () => {
  try {
    loading.value = true
    
    // Fetch person data
    const response = await fetch(`${apiBaseUrl}/personnel/${personId}`)
    if (!response.ok) throw new Error('Personnel not found')
    
    const result = await response.json()
    person.value = result.data || result
    
    // Set KTP and NPWP dari data yang sudah joined (jika backend sudah support)
    ktp.value = person.value.ktp || null
    npwp.value = person.value.npwp || null
    
    console.log('📊 Person Detail:', person.value)
    
  } catch (err) {
    console.error('Fetch error:', err)
    showError('Gagal memuat data personel: ' + err.message)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPersonDetail()
})
</script>
