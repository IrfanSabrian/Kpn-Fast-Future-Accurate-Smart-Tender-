<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors duration-300 font-sans">
    
    <!-- ENGINEERING SIDEBAR (Control Panel) -->
    <aside class="fixed left-0 top-0 z-50 h-screen w-[280px] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col text-slate-600 dark:text-slate-300 shadow-xl transition-colors duration-300">
      
      <!-- Brand Header -->
      <div class="h-24 flex items-center px-6 border-b border-slate-100 dark:border-white/5 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div class="flex items-center gap-4">
          <div class="w-12 h-12 flex-shrink-0 bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-100 dark:border-slate-700 shadow-sm">
             <img src="/Logo.png" alt="KPN Logo" class="w-full h-full object-contain" />
          </div>
          <div>
            <h1 class="text-lg font-black text-slate-800 dark:text-white tracking-tight leading-none mb-1">KPN FAST</h1>
          </div>
        </div>
      </div>

      <!-- Main Navigation -->
      <nav class="flex-1 overflow-y-auto px-4 py-8 space-y-8 custom-scrollbar">
        
        <!-- Section: GENERAL -->
        <div>
          <h3 class="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-4 px-3">General</h3>
          <div class="space-y-1">
             <NuxtLink to="/" 
               class="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold transition-all group hover:bg-slate-50 dark:hover:bg-slate-800"
               active-class="bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/20 shadow-sm"
             >
               <i class="fas fa-th-large w-5 text-center group-hover:text-blue-500 transition-colors"></i>
               <span>Dashboard</span>
             </NuxtLink>
             <div class="opacity-50 pointer-events-none flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium">
               <i class="fas fa-chart-pie w-5 text-center"></i>
               <span>Analytics</span>
               <span class="ml-auto text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-mono">SOON</span>
             </div>
          </div>
        </div>

        <!-- Section: DATABASE -->
        <div>
          <h3 class="text-[10px] font-bold text-slate-400 dark:text-slate-600 uppercase tracking-widest mb-4 px-3">Master Data</h3>
          <div class="space-y-1">
             <NuxtLink to="/database/companies" 
               class="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold transition-all group hover:bg-slate-50 dark:hover:bg-slate-800"
               active-class="bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/20 shadow-sm"
             >
               <i class="fas fa-building w-5 text-center group-hover:text-blue-500 transition-colors"></i>
               <span>Perusahaan</span>
             </NuxtLink>
             <NuxtLink to="/database/personel" 
               class="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold transition-all group hover:bg-slate-50 dark:hover:bg-slate-800"
               active-class="bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/20 shadow-sm"
             >
               <i class="fas fa-users w-5 text-center group-hover:text-blue-500 transition-colors"></i>
               <span>Personel</span>
             </NuxtLink>
             <div class="opacity-50 pointer-events-none flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium">
               <i class="fas fa-folder-open w-5 text-center"></i>
               <span>Proyek</span>
               <span class="ml-auto text-[9px] bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-mono">DEV</span>
             </div>
          </div>
        </div>

      </nav>

      <!-- User Profile / Footer -->
      <div class="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
        <div class="flex items-center gap-3 group cursor-pointer" @click="showProfileModal = true" title="Lihat profil">
           <div class="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center overflow-hidden border-2 border-white dark:border-slate-700 shadow-lg relative">
             <!-- Loading State -->
             <div v-if="loadingProfile" class="absolute inset-0 bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
             
             <!-- Profile Picture from Google -->
             <img v-else-if="userProfile.picture" 
                  :src="userProfile.picture" 
                  :alt="userProfile.name"
                  class="w-full h-full object-cover"
                  crossorigin="anonymous"
                  referrerpolicy="no-referrer"
                  @error="userProfile.picture = null" />
             
             <!-- Initials Fallback -->
             <span v-else class="text-xs font-bold text-white">{{ getInitials(userProfile.name) }}</span>
             
             <!-- Eye icon overlay on hover -->
             <div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <i class="fas fa-eye text-white text-[10px]"></i>
             </div>
           </div>
           
           <div class="flex-1 min-w-0">
             <div class="flex items-center gap-2 mb-1">
               <h4 class="text-sm font-bold text-slate-800 dark:text-white truncate" :title="userProfile.name">
                 {{ userProfile.name }}
               </h4>
               <span class="text-[9px] bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-1.5 py-0.5 rounded font-mono border border-blue-100 dark:border-blue-800">
                 {{ userProfile.role }}
               </span>
             </div>
             <p class="text-[10px] text-slate-500 font-mono truncate" :title="userProfile.email">
               {{ loadingProfile ? 'Loading...' : userProfile.email }}
             </p>
           </div>
           
           <button @click.stop="toggleTheme" class="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition-colors">
              <i class="fas" :class="isDark ? 'fa-sun' : 'fa-moon'"></i>
           </button>
        </div>
      </div>

    </aside>

    <!-- Main Content Area -->
    <div class="ml-[280px] flex-1 flex flex-col min-h-screen transition-all duration-300">
       <main class="flex-1 relative">
          <!-- Optional top fade for seamless scroll feeling -->
          <div class="absolute top-0 left-0 w-full h-8 bg-gradient-to-b from-slate-50 to-transparent dark:from-slate-950 z-10 pointer-events-none"></div>
          <slot />
       </main>
    </div>

    <!-- Profile Modal (View Only) -->
    <div v-if="showProfileModal" 
         class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 transition-all duration-300"
         @click="showProfileModal = false">
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl max-w-sm w-full relative overflow-hidden group border border-slate-200 dark:border-slate-800"
           @click.stop>
        
        <!-- Top Gradient Line -->
        <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500"></div>

        <!-- CLOSE BUTTON -->
        <button @click="showProfileModal = false"
                class="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 hover:text-slate-600 dark:hover:text-slate-200 transition-colors z-10">
          <i class="fas fa-times text-sm"></i>
        </button>

        <div class="p-8 pb-6 text-center relative">
          <!-- Profile Picture -->
          <div class="w-24 h-24 rounded-full flex items-center justify-center p-1 mx-auto mb-4 shadow-lg ring-4"
               :class="isConnected ? 'bg-gradient-to-br from-blue-500 to-cyan-500 ring-blue-50 dark:ring-blue-900/20' : 'bg-slate-200 dark:bg-slate-700 ring-slate-100 dark:ring-slate-800'">
            <div class="w-full h-full rounded-full overflow-hidden bg-white dark:bg-slate-800 relative">
               <img v-if="isConnected && userProfile.picture" 
                    :src="userProfile.picture" 
                    :alt="userProfile.name"
                    class="w-full h-full object-cover"
                    crossorigin="anonymous"
                    referrerpolicy="no-referrer" />
               <div v-else class="w-full h-full flex items-center justify-center bg-slate-100 dark:bg-slate-800 text-slate-400">
                  <span class="text-2xl font-bold">{{ getInitials(userProfile.name) }}</span>
               </div>
            </div>
            <!-- Verified/Status Badge -->
             <div class="absolute bottom-8 right-[calc(50%-40px)] w-6 h-6 border-2 border-white dark:border-slate-900 rounded-full flex items-center justify-center text-white text-[10px] shadow-sm transform translate-x-1/2 translate-y-1/2"
                  :class="isConnected ? 'bg-emerald-500' : 'bg-slate-400'">
                <i class="fas" :class="isConnected ? 'fa-check' : 'fa-minus'"></i>
             </div>
          </div>
          
          <h3 class="text-xl font-black text-slate-800 dark:text-white tracking-tight mb-1">
             {{ userProfile.name }}
          </h3>
          <p class="text-xs font-mono px-3 py-1 rounded-full inline-block mb-4"
             :class="isConnected ? 'text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800' : 'text-slate-400 bg-slate-100 dark:bg-slate-800/50'">
             {{ userProfile.email }}
          </p>

           <div class="flex justify-center gap-2 mb-2">
             <span class="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-lg uppercase tracking-wider"
                   :class="isConnected ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'">
                <i class="fas fa-shield-alt"></i>
                {{ userProfile.role }}
             </span>
           </div>
        </div>

        <!-- Info Grid -->
        <div class="grid grid-cols-2 border-t border-slate-100 dark:border-slate-800 divide-x divide-slate-100 dark:divide-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
           <div class="p-4 text-center">
              <div class="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Status</div>
              <div class="text-sm font-bold flex items-center justify-center gap-1"
                   :class="isConnected ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-500'">
                 <span class="w-1.5 h-1.5 rounded-full animate-pulse" :class="isConnected ? 'bg-emerald-500' : 'bg-slate-400'"></span>
                 {{ isConnected ? 'Active' : 'Not Connected' }}
              </div>
           </div>
           <div class="p-4 text-center">
              <div class="text-[10px] uppercase tracking-widest text-slate-400 font-bold mb-1">Account</div>
              <div class="text-sm font-bold text-slate-700 dark:text-slate-300">
                {{ isConnected ? 'Google' : 'Local Guest' }}
              </div>
           </div>
        </div>

        <!-- Actions -->
        <div class="p-6 pt-4">
          <!-- Button: Connect (If not connected) -->
          <button v-if="!isConnected" 
                  @click="connectGoogle"
                  class="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 group shadow-md shadow-blue-500/20">
            <i class="fab fa-google group-hover:scale-110 transition-transform"></i>
            <span>Hubungkan Akun Google</span>
          </button>

          <!-- Button: Logout (If connected) -->
          <button v-else 
                  @click="logoutGoogle"
                  class="w-full py-3.5 px-4 bg-white dark:bg-slate-800 text-red-500 border border-red-200 dark:border-red-900/30 rounded-xl font-bold hover:bg-red-50 dark:hover:bg-red-900/10 transition-all flex items-center justify-center gap-2 group shadow-sm">
            <i class="fas fa-sign-out-alt group-hover:-translate-x-1 transition-transform"></i>
            <span>Logout Akun Google</span>
          </button>
          
          <!-- Footer Info -->
          <div v-if="isConnected" class="mt-5 text-center">
             <div class="inline-flex items-center gap-2 px-3 py-1.5 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
               <span class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">SYNC</span>
               <span class="text-xs font-bold text-slate-600 dark:text-slate-300">{{ syncTimeText }}</span>
             </div>
          </div>
          
          <p v-else class="text-[10px] text-center text-slate-400 mt-4 px-4">
             Hubungkan akun untuk mengakses fitur cloud.
          </p>
        </div>
      </div>
    </div>

    <!-- Logout Confirmation Modal -->
    <div v-if="showLogoutConfirm" 
         class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
         @click="showLogoutConfirm = false">
      <div class="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-sm w-full p-6 border border-slate-200 dark:border-slate-800"
           @click.stop>
        
        <div class="w-16 h-16 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-sign-out-alt text-red-600 dark:text-red-400 text-2xl"></i>
        </div>

        <h3 class="text-xl font-bold text-slate-800 dark:text-white text-center mb-2">
          Logout Akun Google?
        </h3>
        <p class="text-sm text-slate-500 dark:text-slate-400 text-center mb-6">
          Anda akan keluar dari akun Google dan perlu login ulang untuk mengakses fitur cloud.
        </p>

        <div class="flex gap-3">
          <button 
            @click="showLogoutConfirm = false"
            class="flex-1 px-4 py-2.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-lg font-semibold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
            Batal
          </button>
          <button 
            @click="confirmLogout"
            class="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors">
            Ya, Logout
          </button>
        </div>
      </div>
    </div>

    <!-- Toast Notifications -->
    <ToastNotification ref="toast" />

  </div>
</template>

<script setup>
import { useTheme } from '~/composables/useTheme'
import ToastNotification from '~/components/ToastNotification.vue'

// Require authentication for all dashboard pages
definePageMeta({
  middleware: 'auth'
})

const route = useRoute()
const config = useRuntimeConfig()
const apiUrl = config.public.apiBaseUrl || 'http://localhost:5000'
const { isDark, toggleTheme, initTheme } = useTheme()

// Toast ref
const toast = ref(null)

// Default State
const DEFAULT_PROFILE = {
  username: 'guest',
  name: 'Guest User',
  email: 'Belum Terhubung',
  picture: null,
  role: 'Guest'
}

const userProfile = ref({ ...DEFAULT_PROFILE })
const isConnected = ref(false)

const loadingProfile = ref(true)
const showProfileModal = ref(false)
const showLogoutConfirm = ref(false)
const lastSyncCheck = ref(Date.now())
const lastSyncTime = ref(null)

const getInitials = (name) => {
  return name ? name.substring(0, 2).toUpperCase() : 'GU'
}

// Format relative time
const syncTimeText = computed(() => {
  const _ = lastSyncCheck.value
  if (!lastSyncTime.value) return 'Belum pernah'
  const now = new Date()
  const diff = now - new Date(lastSyncTime.value)
  const seconds = Math.floor(diff / 1000)
  const minutes = Math.floor(seconds / 60)
  const hours = Math.floor(minutes / 60)
  const days = Math.floor(hours / 24)

  if (seconds < 60) return 'Baru saja'
  if (minutes < 60) return `${minutes} menit yang lalu`
  if (hours < 24) return `${hours} jam yang lalu`
  return `${days} hari yang lalu`
})

// Fetch user profile logic
const fetchUserProfile = async () => {
  loadingProfile.value = true
  try {
    const response = await fetch(`${apiUrl}/auth/me`)
    if (response.ok) {
      const result = await response.json()
      if (result.success && result.data) {
        userProfile.value = {
          username: result.data.username || 'admin',
          name: result.data.name || result.data.username || 'Administrator',
          email: result.data.email || 'user@example.com',
          picture: result.data.picture || null,
          role: result.data.role || 'Admin'
        }
        isConnected.value = true
        
        // Debug: Log profile picture
        console.log('👤 Profile loaded:',{
          email: userProfile.value.email,
          hasPicture: !!userProfile.value.picture,
          pictureUrl: userProfile.value.picture
        })
        
        // Update sync time
        const now = new Date()
        lastSyncTime.value = now
        if (process.client) {
          localStorage.setItem('auth_last_sync', now.toISOString())
        }
      }
    } else if (response.status === 401) {
      // Expected: user not authenticated - suppress error
      userProfile.value = { ...DEFAULT_PROFILE }
      isConnected.value = false
    } else {
      // Other errors
      userProfile.value = { ...DEFAULT_PROFILE }
      isConnected.value = false
    }
  } catch (error) {
    // Network error or other issues - suppress console error
    userProfile.value = { ...DEFAULT_PROFILE }
    isConnected.value = false
  } finally {
    loadingProfile.value = false
  }
}

// Connect Google (Popup with Auth Polling)
const connectGoogle = async () => {
  showProfileModal.value = false
  try {
    const response = await fetch(`${apiUrl}/auth/google/url`)
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    
    const result = await response.json()

    if (result.success && result.authUrl) {
       // Open Popup
       const width = 600
       const height = 500
       const left = (window.screen.width / 2) - (width / 2)
       const top = (window.screen.height / 2) - (height / 2)
       
       const popup = window.open(
         result.authUrl,
         'Google OAuth',
         `width=${width},height=${height},left=${left},top=${top},resizable=yes,scrollbars=yes`
       )
       
       if (!popup) {
         toast.value?.addToast({
           type: 'warning',
           title: 'Popup Diblokir',
           message: 'Izinkan popup untuk situs ini agar bisa login.',
           duration: 5000
         })
         return
       }

       let authCheckInterval = null
       let hasShownToast = false

       // Poll auth status every 2 seconds
       const checkAuthStatus = async () => {
         try {
           const checkResponse = await fetch(`${apiUrl}/auth/me`)
           if (checkResponse.ok) {
             const checkResult = await checkResponse.json()
             if (checkResult.success && checkResult.data && !hasShownToast) {
               hasShownToast = true
               
               // Clear interval
               if (authCheckInterval) {
                 clearInterval(authCheckInterval)
                 authCheckInterval = null
               }
               
               // Try to close popup
               try {
                 if (popup && !popup.closed) {
                   popup.close()
                 }
               } catch (e) {
                 // Ignore close error
               }
               
               // Show success toast
               toast.value?.addToast({
                 type: 'success',
                 title: 'Berhasil Terhubung',
                 message: 'Akun Google Anda telah terhubung',
                 duration: 3000
               })
               
               // Reload after short delay
               setTimeout(() => {
                 window.dispatchEvent(new CustomEvent('oauth-completed'))
                 window.location.reload()
               }, 1000)
             }
           }
         } catch (error) {
           // Silent fail - auth not ready yet
         }
       }

       // Start polling every 2 seconds
       authCheckInterval = setInterval(checkAuthStatus, 2000)
       
       // Also check immediately
       checkAuthStatus()

       // Cleanup on focus (if user closed popup manually)
       const handleFocus = () => {
         setTimeout(() => {
           if (authCheckInterval) {
             clearInterval(authCheckInterval)
             authCheckInterval = null
           }
           window.removeEventListener('focus', handleFocus)
         }, 500)
       }
       
       window.addEventListener('focus', handleFocus)
    } else {
      throw new Error(result.message || 'No auth URL returned')
    }
  } catch (error) {
    toast.value?.addToast({
      type: 'error',
      title: 'Gagal Menghubungkan',
      message: error.message || 'Tidak dapat terhubung ke Google',
      duration: 5000
    })
  }
}

// Logout Google - Show confirmation modal
const logoutGoogle = () => {
  showProfileModal.value = false
  showLogoutConfirm.value = true
}

// Confirm Logout - Execute logout
const confirmLogout = async () => {
  showLogoutConfirm.value = false
  
  try {
    const response = await fetch(`${apiUrl}/auth/logout`, { method: 'POST' })
    if (response.ok) {
      if (process.client) localStorage.removeItem('auth_last_sync')
      lastSyncTime.value = null
      
      userProfile.value = { ...DEFAULT_PROFILE }
      isConnected.value = false
      
      // Show success toast
      toast.value?.addToast({
        type: 'success',
        title: 'Berhasil Logout',
        message: 'Anda telah keluar dari akun Google',
        duration: 3000
      })
      
      window.dispatchEvent(new CustomEvent('oauth-completed'))
      
      // Reload after toast shows
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    }
  } catch (error) {
    toast.value?.addToast({
      type: 'error',
      title: 'Gagal Logout',
      message: error.message || 'Terjadi kesalahan saat logout',
      duration: 5000
    })
  }
}

let syncInterval
onMounted(() => {
  initTheme()
  fetchUserProfile()
  
  if (process.client) {
    const savedTime = localStorage.getItem('auth_last_sync')
    if (savedTime) lastSyncTime.value = new Date(savedTime)
  }
  
  syncInterval = setInterval(() => { lastSyncCheck.value = Date.now() }, 30000)
  
  window.addEventListener('oauth-completed', () => {
    console.log('Refreshing profile...')
    fetchUserProfile()
  })
})

onUnmounted(() => {
  if (syncInterval) clearInterval(syncInterval)
  window.removeEventListener('oauth-completed', fetchUserProfile)
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.5);
  border-radius: 20px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.1);
}
.custom-scrollbar:hover::-webkit-scrollbar-thumb {
  background-color: rgba(148, 163, 184, 0.8);
}
</style>
