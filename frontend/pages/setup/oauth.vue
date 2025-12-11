<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center p-6 font-sans transition-colors duration-300">
    <div class="max-w-md w-full relative">
      
      <!-- Brand Logo -->
      <div class="text-center mb-8 animate-fade-in-down">
         <div class="inline-flex items-center gap-3 bg-white dark:bg-slate-900 px-5 py-3 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 mb-6">
           <img src="/Logo.png" alt="KPN Logo" class="w-8 h-8 object-contain" />
           <span class="text-lg font-black text-slate-800 dark:text-white tracking-tight">KPN <span class="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-500">FAST</span></span>
         </div>
         <h1 class="text-2xl font-bold text-slate-800 dark:text-white mb-2">Google Integration</h1>
         <p class="text-slate-500 dark:text-slate-400 text-sm">Connect your account to enable cloud features</p>
      </div>

      <!-- Main Card -->
      <div class="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden relative group">
        <!-- Top Gradient Line -->
        <div class="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-blue-500 via-cyan-500 to-emerald-500"></div>

        <!-- Content -->
        <div class="p-8">
          
          <!-- Loading State -->
          <div v-if="loading" class="text-center py-12 space-y-4">
            <div class="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
            <p class="text-sm font-medium text-slate-500 dark:text-slate-400 animate-pulse">Checking connection status...</p>
          </div>

          <!-- Unauthenticated State -->
          <div v-else-if="!isAuthenticated" class="space-y-8 animate-fade-in">
             <!-- Status Alert -->
             <div class="bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/20 rounded-2xl p-4 flex gap-4">
                <div class="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0 text-amber-600 dark:text-amber-500">
                   <i class="fas fa-shield-alt"></i>
                </div>
                <div>
                   <h3 class="text-sm font-bold text-slate-800 dark:text-white mb-1">Authentication Required</h3>
                   <p class="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                     Please connect your Google account to access Drive storage, Spreadsheets, and Document generation features.
                   </p>
                </div>
             </div>

             <!-- Permissions List -->
             <div class="space-y-3">
                <h4 class="text-xs font-bold text-slate-400 uppercase tracking-widest px-1">Access Permissions</h4>
                <div class="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-1">
                   <div class="flex items-center gap-3 p-3 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors">
                      <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                         <i class="fab fa-google-drive"></i>
                      </div>
                      <div class="flex-1">
                         <div class="text-xs font-bold text-slate-700 dark:text-slate-200">Google Drive</div>
                         <div class="text-[10px] text-slate-400">Upload & manage personnel files</div>
                      </div>
                      <i class="fas fa-check text-emerald-500 text-xs"></i>
                   </div>
                   <div class="flex items-center gap-3 p-3 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors">
                      <div class="w-8 h-8 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 dark:text-green-400">
                         <i class="fas fa-table"></i>
                      </div>
                      <div class="flex-1">
                         <div class="text-xs font-bold text-slate-700 dark:text-slate-200">Google Sheets</div>
                         <div class="text-[10px] text-slate-400">Database synchronization</div>
                      </div>
                      <i class="fas fa-check text-emerald-500 text-xs"></i>
                   </div>
                   <div class="flex items-center gap-3 p-3 hover:bg-white dark:hover:bg-slate-800 rounded-xl transition-colors">
                      <div class="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                         <i class="fas fa-user-circle"></i>
                      </div>
                      <div class="flex-1">
                         <div class="text-xs font-bold text-slate-700 dark:text-slate-200">User Profile</div>
                         <div class="text-[10px] text-slate-400">Identity & activity tracking</div>
                      </div>
                      <i class="fas fa-check text-emerald-500 text-xs"></i>
                   </div>
                </div>
             </div>

             <!-- Connect Button (If not authenticated) -->
             <button
                v-if="!isAuthenticated"
                @click="handleLogin"
                :disabled="authLoading"
                class="w-full group relative flex items-center justify-center gap-3 bg-gradient-to-r from-slate-800 to-slate-900 dark:from-white dark:to-slate-200 text-white dark:text-slate-900 py-4 px-6 rounded-xl font-bold shadow-lg hover:shadow-xl hover:translate-y-[-2px] active:translate-y-0 transition-all disabled:opacity-70 disabled:cursor-not-allowed overflow-hidden"
              >
                <!-- Shine effect -->
                <div class="absolute top-0 -inset-full h-full w-1/2 z-5 block transform -skew-x-12 bg-gradient-to-r from-transparent to-white opacity-20 group-hover:animate-shine" />
                
                <i v-if="!authLoading" class="fab fa-google text-lg"></i>
                <div v-else class="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                
                <span>{{ authLoading ? 'Connecting...' : 'Connect with Google' }}</span>
             </button>

             <!-- Back Link -->
             <div v-if="!isAuthenticated" class="text-center">
                <p class="text-xs text-slate-400">
                  Anda perlu login untuk mengakses sistem
                </p>
             </div>
          </div>

          <!-- Authenticated State -->
          <div v-if="isAuthenticated" class="py-6 text-center space-y-6 animate-fade-in">
             <div class="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto mb-6 relative">
                <i class="fas fa-check text-4xl text-emerald-500"></i>
                <div class="absolute inset-0 bg-emerald-400 opacity-20 rounded-full animate-ping"></div>
             </div>
             
             <div class="space-y-2">
                <h2 class="text-2xl font-black text-slate-800 dark:text-white">Integration Active!</h2>
                <p class="text-sm text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                   Your Google account is successfully connected. All cloud services are ready to use.
                </p>
             </div>

             <div class="pt-6">
                <NuxtLink 
                   to="/" 
                   class="inline-flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 px-8 py-3 rounded-xl font-bold hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                   <span>Open Dashboard</span>
                   <i class="fas fa-arrow-right text-xs"></i>
                </NuxtLink>
             </div>
          </div>

        </div>
      </div>
      
      <!-- Footer Info -->
      <div class="mt-8 text-center space-y-2 animate-fade-in-up">
         <div class="inline-flex items-center gap-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-white dark:bg-slate-900 px-3 py-1.5 rounded-full border border-slate-100 dark:border-slate-800 shadow-sm">
            <i class="fas fa-lock text-emerald-500"></i>
            <span>Secure OAuth 2.0 Protocol</span>
         </div>
      </div>

    </div>
  </div>
</template>

<script setup>
const config = useRuntimeConfig()
const apiBaseUrl = config.public.apiBaseUrl

const loading = ref(true)
const authLoading = ref(false)
const isAuthenticated = ref(false)

// Check auth status on mount
const checkAuthStatus = async () => {
  try {
    loading.value = true
    const response = await fetch(`${apiBaseUrl}/auth/me`)
    
    if (response.ok) {
      const data = await response.json()
      if (data.success && data.data) {
        isAuthenticated.value = true
        // Already authenticated - redirect to dashboard
        await navigateTo('/')
        return
      }
    }
    
    isAuthenticated.value = false
  } catch (error) {
    isAuthenticated.value = false
  } finally {
    loading.value = false
  }
}

// Handle login
const handleLogin = async () => {
  try {
    authLoading.value = true
    
    // Get auth URL
    const response = await fetch(`${apiBaseUrl}/auth/google/url`)
    const data = await response.json()
    
    if (data.success && data.authUrl) {
      // Open Google OAuth in new window
      const width = 600
      const height = 500
      const left = (screen.width / 2) - (width / 2)
      const top = (screen.height / 2) - (height / 2)
      
      const authWindow = window.open(
        data.authUrl,
        'Google OAuth',
        `width=${width},height=${height},left=${left},top=${top}`
      )

      if (!authWindow) {
        alert('Popup blocked! Please allow popups for this site.')
        authLoading.value = false
        return
      }

      // Poll for authentication success every 2 seconds
      const authCheckInterval = setInterval(async () => {
        try {
          const checkResponse = await fetch(`${apiBaseUrl}/auth/me`)
          if (checkResponse.ok) {
            const checkData = await checkResponse.json()
            if (checkData.success && checkData.data) {
              // Authenticated! Close popup and redirect
            clearInterval(authCheckInterval)
              authLoading.value = false
              
              try {
                if (authWindow && !authWindow.closed) {
                  authWindow.close()
                }
              } catch (e) {}
              
              // Redirect to dashboard
              await navigateTo('/')
            }
          }
        } catch (e) {
          // Silent fail - auth not ready yet
        }
      }, 2000)

      // Cleanup on window close (user cancelled)
      const checkWindowClosed = setInterval(() => {
        if (authWindow.closed) {
          clearInterval(checkWindowClosed)
          clearInterval(authCheckInterval)
          authLoading.value = false
        }
      }, 500)
    }
  } catch (error) {
    console.error('Error getting auth URL:', error)
    authLoading.value = false
  }
}

onMounted(() => {
  checkAuthStatus()
})
</script>

<style scoped>
@keyframes fade-in-down {
  from { opacity: 0; transform: translateY(-20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes fade-in {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes shine {
  100% { left: 125%; }
}

.animate-fade-in-down { animation: fade-in-down 0.6s ease-out; }
.animate-fade-in-up { animation: fade-in-up 0.6s ease-out 0.2s backwards; }
.animate-fade-in { animation: fade-in 0.6s ease-out 0.1s backwards; }
.animate-shine { animation: shine 1s; }
</style>
