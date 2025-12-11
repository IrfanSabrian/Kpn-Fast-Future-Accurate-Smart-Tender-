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
        
        <!-- Google Auth Status Indicator (Read-only) -->
        <div class="flex items-center gap-3">
          <div 
            v-if="authStatus.isAuthenticated"
            class="flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-3 rounded-xl border border-emerald-100 dark:border-emerald-800">
            <div class="w-8 h-8 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <i class="fas fa-check-circle text-emerald-600 dark:text-emerald-400"></i>
            </div>
            <div class="text-left">
              <div class="text-xs font-bold text-emerald-700 dark:text-emerald-300">Google Connected</div>
              <div class="text-[10px] text-emerald-500">All services active</div>
            </div>
          </div>
          
          <div 
            v-else
            class="flex items-center gap-3 bg-amber-50 dark:bg-amber-900/20 px-4 py-3 rounded-xl border border-amber-100 dark:border-amber-800">
            <div class="w-8 h-8 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
              <i class="fas fa-exclamation-circle text-amber-600 dark:text-amber-400"></i>
            </div>
            <div class="text-left">
              <div class="text-xs font-bold text-amber-700 dark:text-amber-300">Not Connected</div>
              <div class="text-[10px] text-amber-500">Click profile to connect</div>
            </div>
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

        <!-- Right Column: Recent Activities (4 cols) -->
        <div class="lg:col-span-4 space-y-6">
          
          <!-- Activity Log (Real Data with Author) -->
          <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 p-5">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-sm font-bold text-slate-700 dark:text-slate-300">Aktivitas Terbaru</h3>
            </div>
            
            <!-- Loading State -->
            <div v-if="loadingActivities" class="space-y-4">
              <div v-for="i in 4" :key="i" class="flex gap-3 animate-pulse">
                <div class="flex-shrink-0 w-2 h-2 mt-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></div>
                <div class="flex-1">
                  <div class="h-3 bg-slate-200 dark:bg-slate-700 rounded w-3/4 mb-2"></div>
                  <div class="h-2 bg-slate-100 dark:bg-slate-800 rounded w-1/2"></div>
                </div>
              </div>
            </div>

            <!-- Activities List -->
            <div v-else-if="recentActivities.length > 0" class="space-y-4">
              <div v-for="(activity, index) in recentActivities" :key="index" class="flex gap-3 group hover:bg-slate-50 dark:hover:bg-slate-700/30 -mx-2 px-2 py-1 rounded-lg transition-colors">
                <div :class="['flex-shrink-0 w-6 h-6 mt-0.5 rounded-lg flex items-center justify-center', 
                              activity.color.replace('text-', 'bg-').replace('500', '50 dark:bg-').replace('500', '900/20')]">
                  <i :class="['fas', activity.icon, 'text-xs', activity.color]"></i>
                </div>
                <div class="flex-1 min-w-0">
                  <p class="text-xs font-medium text-slate-700 dark:text-slate-300">
                    <span class="font-bold text-blue-600 dark:text-blue-400">{{ activity.author }}</span>
                    {{ activity.action.toLowerCase() }} 
                    <span class="font-semibold truncate inline-block max-w-[150px] align-bottom">{{ activity.target }}</span>
                  </p>
                  <p class="text-[10px] text-slate-400 font-mono mt-0.5">
                    {{ formatTime(activity.timestamp) }}
                  </p>
                </div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="text-center py-8">
              <i class="fas fa-inbox text-3xl text-slate-200 dark:text-slate-700 mb-2"></i>
              <p class="text-xs text-slate-400">Belum ada aktivitas</p>
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

// Real-time Clock (removed from UI but kept for potential future use)
const currentTime = ref('')
const companiesCount = ref(0)
const personilCount = ref(0)
const recentActivities = ref([])
const loadingActivities = ref(true)

// Google Auth Status
const authStatus = ref({
  isAuthenticated: false,
  loading: true
})

let timer

onMounted(async () => {
  // Timer setup (for potential future use)
  const updateTime = () => {
    const now = new Date()
    currentTime.value = now.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }
  updateTime()
  timer = setInterval(updateTime, 1000)

  // Check Google Auth Status
  checkAuthStatus()

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

  // Fetch recent activities
  fetchRecentActivities()
})

onUnmounted(() => {
  if (timer) clearInterval(timer)
})

// Check Google OAuth authentication status
const checkAuthStatus = async () => {
  authStatus.value.loading = true
  try {
    const response = await fetch(`${apiUrl}/auth/status`)
    if (response.ok) {
      const result = await response.json()
      authStatus.value.isAuthenticated = result.isAuthenticated || false
    }
  } catch (error) {
    console.warn('Failed to check auth status:', error)
  } finally {
    authStatus.value.loading = false
  }
}

// Handle Google Auth - Open in popup window
const handleGoogleAuth = async () => {
  try {
    const response = await fetch(`${apiUrl}/auth/google/url`)
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.authUrl) {
        // Open Google OAuth in popup window (centered, small)
        const width = 700
        const height = 500
        const left = (window.screen.width / 2) - (width / 2)
        const top = (window.screen.height / 2) - (height / 2)
        
        const popup = window.open(
          result.authUrl,
          'Google OAuth',
          `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
        )
        
        if (popup) {
          // Poll to check if popup is closed
          const checkPopupClosed = setInterval(() => {
            if (popup.closed) {
              clearInterval(checkPopupClosed)
              console.log('OAuth popup closed, refreshing status...')
              
              // Wait 1 second for backend to save token
              setTimeout(() => {
                // Refresh auth status after popup closes
                checkAuthStatus()
                // Trigger custom event to refresh sidebar profile
                console.log('🔄 Dispatching oauth-completed event...')
                window.dispatchEvent(new CustomEvent('oauth-completed'))
                
                // Force reload page to ensure everything updates
                setTimeout(() => {
                  console.log('🔄 Force refreshing page...')
                  window.location.reload()
                }, 500)
              }, 1000)
            }
          }, 500)
        } else {
          alert('Popup blocked! Please allow popups for this site.')
        }
      } else {
        alert('Failed to get Google authentication URL')
      }
    }
  } catch (error) {
    console.error('Error getting auth URL:', error)
    alert('Failed to connect to authentication service')
  }
}

// Fetch recent activities from backend
const fetchRecentActivities = async () => {
  loadingActivities.value = true
  try {
    const response = await fetch(`${apiUrl}/activities/recent?limit=7`)
    if (response.ok) {
      const result = await response.json()
      recentActivities.value = result.data || []
    }
  } catch (error) {
    console.warn('Failed to fetch recent activities:', error)
    recentActivities.value = []
  } finally {
    loadingActivities.value = false
  }
}

// Format timestamp to human-readable format
const formatTime = (timestamp) => {
  if (!timestamp) return ''
  
  try {
    const date = new Date(timestamp)
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    const days = Math.floor(diff / 86400000)

    if (minutes < 1) return 'Baru saja'
    if (minutes < 60) return `${minutes} menit lalu`
    if (hours < 24) return `${hours} jam lalu`
    if (days < 7) return `${days} hari lalu`
    
    return date.toLocaleDateString('id-ID', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    })
  } catch (e) {
    return timestamp
  }
}

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
