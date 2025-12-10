<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans relative overflow-hidden">
    <!-- Architectural Grid Background -->
    <div class="absolute inset-0 pointer-events-none opacity-[0.03]" 
         style="background-image: linear-gradient(to right, #64748b 1px, transparent 1px), linear-gradient(to bottom, #64748b 1px, transparent 1px); background-size: 24px 24px;">
    </div>

    <div class="relative z-10 p-6 md:p-8 max-w-7xl mx-auto">
      <!-- Header Section -->
      <header class="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <div class="inline-flex items-center gap-2 mb-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-full">
            <span class="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
            <span class="text-xs font-bold text-blue-700 dark:text-blue-300 tracking-wider">SYSTEM ONLINE</span>
          </div>
          <h1 class="text-4xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-2">
            KPN <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">FAST</span>
          </h1>
          <p class="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-2xl">
            Future Accurate Smart Tender — Integrated Engineering & Automation System.
          </p>
        </div>
        
        <div class="flex items-center gap-4 bg-white dark:bg-slate-800 p-2 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700">
          <div class="text-right px-4 border-r border-slate-100 dark:border-slate-700">
            <div class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">SERVER TIME</div>
            <div class="text-xl font-mono font-bold text-slate-700 dark:text-slate-200">
              <ClientOnly>{{ currentTime }}</ClientOnly>
            </div>
          </div>
          <div class="px-2">
            <i class="fas fa-robot text-2xl text-blue-500/80"></i>
          </div>
        </div>
      </header>

      <!-- Dashboard Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        <!-- Left Column: Key Metrics (8 cols) -->
        <div class="lg:col-span-8 space-y-8">
          
          <!-- Quick Stats Row -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div v-for="(stat, index) in stats" :key="index" 
                 class="bg-white dark:bg-slate-800 p-5 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
              <div class="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity transform group-hover:scale-110 duration-500">
                <i :class="['fas', stat.icon, 'text-4xl', stat.color]"></i>
              </div>
              <p class="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">{{ stat.label }}</p>
              <h3 class="text-3xl font-mono font-bold text-slate-900 dark:text-white mb-2">{{ stat.value }}</h3>
              <div class="flex items-center gap-1 text-xs font-medium" :class="stat.trendColor">
                <i :class="['fas', stat.trendIcon]"></i>
                <span>{{ stat.trend }}</span>
              </div>
            </div>
          </div>

          <!-- Main Modules Access -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
            <div class="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center bg-slate-50/50 dark:bg-slate-800/50">
              <h3 class="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <i class="fas fa-cubes text-slate-400"></i>
                MODUL UTAMA
              </h3>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x border-slate-100 dark:border-slate-700">
              
              <!-- Database Module -->
              <div class="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group cursor-pointer" @click="router.push('/database/companies')">
                <div class="flex items-start justify-between mb-4">
                  <div class="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform">
                    <i class="fas fa-database text-xl"></i>
                  </div>
                  <i class="fas fa-arrow-right text-slate-300 group-hover:text-blue-500 transition-colors -rotate-45 group-hover:rotate-0 transform duration-300"></i>
                </div>
                <h4 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Database Perusahaan</h4>
                <p class="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                  Sentralisasi data legalitas (Akta, NIB, SBU), profil, dan riwayat pengalaman perusahaan.
                </p>
                <div class="flex gap-2">
                   <span class="text-[10px] px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 font-mono">12 DOC TYPES</span>
                   <span class="text-[10px] px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-slate-600 font-mono">AUTO-SYNC</span>
                </div>
              </div>

              <!-- Projects Module (Coming Soon Concept) -->
              <div class="p-6 hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group cursor-not-allowed opacity-75">
                <div class="flex items-start justify-between mb-4">
                  <div class="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg text-purple-600 dark:text-purple-400">
                    <i class="fas fa-project-diagram text-xl"></i>
                  </div>
                  <span class="text-[10px] font-bold px-2 py-1 bg-purple-100 text-purple-700 rounded-full">DEV</span>
                </div>
                <h4 class="text-lg font-bold text-slate-900 dark:text-white mb-2">Manajemen Proyek</h4>
                <p class="text-sm text-slate-500 dark:text-slate-400 mb-4 leading-relaxed">
                  Monitoring progress tender, estimasi biaya, dan penjadwalan tim tenaga ahli.
                </p>
                <div class="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                  <div class="h-full bg-purple-500 w-1/3"></div>
                </div>
              </div>

            </div>
          </div>

          <!-- Shortcuts Grid -->
          <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
             <button class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:shadow-md transition-all text-left group">
                <i class="fas fa-file-invoice-dollar text-2xl text-emerald-500 mb-3 group-hover:scale-110 transition-transform origin-left"></i>
                <div class="font-bold text-slate-700 dark:text-slate-200 text-sm">Buat Invoice</div>
             </button>
             <button class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:shadow-md transition-all text-left group">
                <i class="fas fa-file-signature text-2xl text-amber-500 mb-3 group-hover:scale-110 transition-transform origin-left"></i>
                <div class="font-bold text-slate-700 dark:text-slate-200 text-sm">Surat Penawaran</div>
             </button>
             <button class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:shadow-md transition-all text-left group" @click="router.push('/database/personel')">
                <i class="fas fa-users-cog text-2xl text-cyan-500 mb-3 group-hover:scale-110 transition-transform origin-left"></i>
                <div class="font-bold text-slate-700 dark:text-slate-200 text-sm">Database Personel</div>
             </button>
             <button class="p-4 bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:shadow-md transition-all text-left group">
                <i class="fas fa-map-marked-alt text-2xl text-indigo-500 mb-3 group-hover:scale-110 transition-transform origin-left"></i>
                <div class="font-bold text-slate-700 dark:text-slate-200 text-sm">Peta Sebaran</div>
             </button>
          </div>

        </div>

        <!-- Right Column: System Status & AI (4 cols) -->
        <div class="lg:col-span-4 space-y-6">
          
          <!-- AI Assistant Card -->
          <div class="bg-gradient-to-br from-slate-900 to-slate-800 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group">
            <div class="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20"></div>
            <div class="absolute -right-10 -top-10 w-40 h-40 bg-blue-500 blur-[60px] opacity-20 group-hover:opacity-30 transition-opacity"></div>

            <div class="relative z-10">
              <div class="flex items-center gap-3 mb-4">
                <div class="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                   <i class="fas fa-brain text-cyan-300"></i>
                </div>
                <div>
                  <h3 class="font-bold">AI Assistant</h3>
                  <div class="flex items-center gap-1.5">
                    <span class="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></span>
                    <span class="text-[10px] text-slate-400 font-mono">GEMINI-PRO CONNECTED</span>
                  </div>
                </div>
              </div>
              <p class="text-sm text-slate-300 mb-6 leading-relaxed">
                Siap membantu automasi pembuatan dokumen teknis dan analisis data proyek Anda.
              </p>
              <button class="w-full py-2.5 bg-blue-600 hover:bg-blue-500 rounded-lg font-bold text-sm transition-colors shadow-lg shadow-blue-900/50 flex items-center justify-center gap-2">
                <i class="fas fa-comments"></i>
                Mulai Chat
              </button>
            </div>
          </div>

          <!-- Activity Log (Compact) -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">RECENT ACTIVITY</h3>
            <div class="space-y-4">
               <div v-for="i in 4" :key="i" class="flex gap-3">
                  <div class="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                  <div>
                    <p class="text-xs font-medium text-slate-700 dark:text-slate-300">Update status <span class="text-blue-600 font-bold">PT. Example</span> menjadi Valid.</p>
                    <p class="text-[10px] text-slate-400 font-mono mt-0.5">10:4{{i}} AM</p>
                  </div>
               </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'dashboard'
})

const router = useRouter()
const config = useRuntimeConfig()
const apiUrl = config.public.apiBaseUrl || 'http://localhost:5000' // Fail-safe default

// Real-time Clock
const currentTime = ref('')
const companiesCount = ref(0)
const personilCount = ref(0)

let timer

onMounted(async () => {
  // Timer setup
  const updateTime = () => {
    const now = new Date()
    currentTime.value = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }
  updateTime()
  timer = setInterval(updateTime, 1000)

  // Fetch quick stats
  try {
     const [compRes, persRes] = await Promise.all([
        fetch(`${apiUrl}/companies`).then(r => r.ok ? r.json() : []),
        fetch(`${apiUrl}/personnel`).then(r => r.ok ? r.json() : []) // assuming personnel path
     ])
     
     // Handle array response directly for companies based on previous fixes
     companiesCount.value = Array.isArray(compRes) ? compRes.length : (compRes.data?.length || 0)
     // Ensure personnel fallback
     personilCount.value = Array.isArray(persRes) ? persRes.length : (persRes.data?.length || 0)

  } catch (e) {
    console.warn('Failed to fetch stats', e)
    // fallback data (only on failure)
    companiesCount.value = 0
    personilCount.value = 0
  }
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// Stats data (Computed so it updates when fetched)
const stats = computed(() => [
  { label: 'TOTAL PERUSAHAAN', value: companiesCount.value, icon: 'fa-building', color: 'text-blue-500', trend: '+ Active', trendIcon: 'fa-check', trendColor: 'text-emerald-500' },
  { label: 'TENAGA AHLI', value: personilCount.value, icon: 'fa-user-tie', color: 'text-cyan-500', trend: 'Available', trendIcon: 'fa-user-check', trendColor: 'text-emerald-500' },
  { label: 'PROYEK BERJALAN', value: '3', icon: 'fa-hard-hat', color: 'text-amber-500', trend: 'On Track', trendIcon: 'fa-minus', trendColor: 'text-slate-400' }, // Dummy for now
  { label: 'DOKUMEN EXPIRED', value: '2', icon: 'fa-exclamation-triangle', color: 'text-red-500', trend: 'Renewal Needed', trendIcon: 'fa-exclamation-circle', trendColor: 'text-red-500' }, // Dummy for now
])
</script>

<style scoped>
/* Technical Font settings */
.font-mono {
  font-family: 'JetBrains Mono', 'Fira Code', ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}
</style>
