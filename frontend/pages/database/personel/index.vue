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
            Database <span class="text-blue-600">Personel</span>
          </h1>
          <p class="text-sm text-slate-500 dark:text-slate-400 mt-1 font-medium max-w-xl">
            Sistem manajemen data identitas & profil personel terintegrasi.
          </p>
        </div>
        
        <div class="flex items-center gap-3">
           <div class="hidden md:block text-right mr-2">
            <div class="text-xs font-bold text-slate-400 uppercase tracking-widest">Total Personel</div>
            <div class="text-xl font-mono font-bold text-slate-700 dark:text-slate-200">{{ personel.length }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex flex-col items-center justify-center py-20 relative z-10">
      <div class="w-12 h-12 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin"></div>
      <p class="mt-4 text-slate-400 text-xs font-mono animate-pulse">SYNCING DATABASE...</p>
    </div>

    <!-- Personel Grid (Consistent Style with Companies) -->
    <div v-else-if="filteredPersonel.length > 0" class="relative z-10 max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
      <div
        v-for="person in filteredPersonel"
        :key="person.id_personel"
        class="group relative bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 shadow-sm hover:shadow-lg transition-all duration-200 flex flex-col overflow-hidden cursor-pointer"
        @click="viewDetail(person)"
      >
        <!-- Top Accent Line -->
        <div class="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-slate-200 to-slate-100 dark:from-slate-700 dark:to-slate-800 group-hover:from-blue-500 group-hover:to-cyan-400 transition-all duration-300"></div>

        <div class="p-5 flex flex-col h-full relative">
          <!-- Card Header layout -->
          <div class="flex items-start gap-4 mb-4">
            <!-- Compact Avatar -->
            <div class="flex-shrink-0 w-14 h-14 rounded-xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 flex items-center justify-center overflow-hidden shadow-sm">
                <span class="text-lg font-bold text-slate-400 dark:text-slate-300 tracking-tighter">{{ getInitials(person.nama_lengkap) }}</span>
            </div>

            <div class="flex-grow min-w-0 pt-0.5">
               <div class="flex items-center gap-2 mb-1">
                  <span 
                    class="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-sm border"
                    :class="person.status_personel === 'Active' 
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-300 dark:border-emerald-800' 
                      : 'bg-slate-50 text-slate-600 border-slate-100 dark:bg-slate-700/30 dark:text-slate-400 dark:border-slate-600'"
                  >
                    {{ person.status_personel || 'UNKNOWN' }}
                  </span>
               </div>
               <h3 class="text-base font-bold text-slate-800 dark:text-gray-100 leading-snug line-clamp-2 group-hover:text-blue-600 transition-colors" :title="person.nama_lengkap">
                {{ person.nama_lengkap }}
              </h3>
            </div>
          </div>

          <!-- Compact Details (Clean List Style - Administrative Focus) -->
          <div class="space-y-3 flex-grow mt-2">
            <!-- NIK -->
            <div class="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 group/item">
               <div class="w-5 flex justify-center">
                 <i class="far fa-id-card text-lg text-slate-400 group-hover/item:text-blue-500 transition-colors"></i>
               </div>
               <div class="flex flex-col min-w-0">
                  <span class="text-[10px] font-bold text-slate-400 uppercase leading-none mb-0.5">NIK (KTP)</span>
                  <span class="font-mono font-bold text-slate-700 dark:text-slate-200 truncate">{{ getKtp(person) || '-' }}</span>
               </div>
            </div>
            
            <!-- NPWP -->
            <div class="flex items-center gap-3 text-xs text-slate-600 dark:text-slate-400 group/item">
               <div class="w-5 flex justify-center">
                 <i class="fas fa-credit-card text-lg text-slate-400 group-hover/item:text-orange-500 transition-colors"></i>
               </div>
               <div class="flex flex-col min-w-0">
                  <span class="text-[10px] font-bold text-slate-400 uppercase leading-none mb-0.5">NPWP</span>
                  <span class="font-mono font-medium text-slate-700 dark:text-slate-200 truncate">{{ getNpwp(person) || '-' }}</span>
               </div>
            </div>

            <!-- Alamat Domisili -->
            <div class="flex items-start gap-3 text-xs text-slate-600 dark:text-slate-400 group/item">
               <div class="w-5 flex justify-center mt-0.5">
                 <i class="fas fa-map-marker-alt text-lg text-slate-400 group-hover/item:text-red-500 transition-colors"></i>
               </div>
               <div class="flex flex-col min-w-0">
                  <span class="text-[10px] font-bold text-slate-400 uppercase leading-none mb-0.5">Domisili</span>
                  <span class="font-medium text-slate-700 dark:text-slate-200 line-clamp-2 leading-snug">{{ person.alamat_domisili || '-' }}</span>
               </div>
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
        <i class="fas fa-users-slash text-2xl"></i>
      </div>
      <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">Database Kosong</h3>
      <p class="text-sm text-slate-500 mb-6">Belum ada data personel terdaftar dalam sistem.</p>
    </div>

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
const { toast, success, error: showError, hideToast } = useToast()

const loading = ref(true)
const personel = ref([])
const searchQuery = ref('')

// === Computed Properties ===
const filteredPersonel = computed(() => {
  if (!searchQuery.value) return personel.value
  
  const query = searchQuery.value.toLowerCase()
  return personel.value.filter(person => {
    const name = person.nama_lengkap?.toLowerCase() || ''
    const nik = getKtp(person)?.toLowerCase() || ''
    const npwp = getNpwp(person)?.toLowerCase() || ''
    const id = person.id_personel?.toLowerCase() || ''
    
    return name.includes(query) || nik.includes(query) || npwp.includes(query) || id.includes(query)
  })
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

const getKtp = (person) => {
    return person.nik || person.ktp?.nik || ''
}

const getNpwp = (person) => {
    return person.nomor_npwp_personel || person.npwp?.nomor_npwp_personel || ''
}

// === Data Fetching ===
const fetchPersonil = async () => {
  try {
    loading.value = true
    const response = await fetch(`${apiBaseUrl}/personnel`)
    if (!response.ok) throw new Error('Failed to fetch personnel')
    
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.indexOf("application/json") !== -1) {
       const result = await response.json()
       personel.value = Array.isArray(result.data) ? result.data : (Array.isArray(result) ? result : [])
       console.log('📊 Personnel Data:', personel.value)
    } else {
       throw new Error('Invalid response format')
    }
  } catch (err) {
    console.error('Fetch error:', err)
    showError('Gagal memuat data personel: ' + err.message)
  } finally {
    loading.value = false
  }
}

// === View Detail (Navigate to Detail Page) ===
const viewDetail = (person) => {
  console.log('Navigating to detail for:', person)
  router.push(`/database/personel/${person.id_personel}`)
}

onMounted(() => {
  fetchPersonil()
})
</script>
