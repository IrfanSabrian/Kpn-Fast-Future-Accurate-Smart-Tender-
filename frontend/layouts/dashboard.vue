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
            <p class="text-[10px] uppercase font-mono text-slate-500 tracking-widest bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded inline-block">System v2.0</p>
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
             <NuxtLink to="/database/personil" 
               class="flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-bold transition-all group hover:bg-slate-50 dark:hover:bg-slate-800"
               active-class="bg-blue-50 dark:bg-blue-900/10 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/20 shadow-sm"
             >
               <i class="fas fa-users w-5 text-center group-hover:text-blue-500 transition-colors"></i>
               <span>Personil Ahli</span>
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
        <div class="flex items-center gap-3 group cursor-pointer" @click="editProfile" title="Klik untuk edit profil">
           <div class="w-10 h-10 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden border border-slate-300 dark:border-slate-600 shadow-sm relative">
             <img v-if="userProfile.photo" :src="userProfile.photo" class="w-full h-full object-cover" @error="userProfile.photo = null" />
             <span v-else class="text-xs font-bold text-slate-600 dark:text-slate-300">{{ getInitials(userProfile.name) }}</span>
             
             <!-- Edit overlay on hover -->
             <div class="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
               <i class="fas fa-pen text-white text-[10px]"></i>
             </div>
           </div>
           
           <div class="flex-1 min-w-0">
             <h4 class="text-sm font-bold text-slate-800 dark:text-white truncate" :title="userProfile.name">{{ userProfile.name }}</h4>
             <p class="text-[10px] text-slate-500 font-mono truncate" :title="userProfile.email">{{ userProfile.email }}</p>
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

  </div>
</template>

<script setup>
import { useTheme } from '~/composables/useTheme'

const route = useRoute()
const { isDark, toggleTheme, initTheme } = useTheme()

// User Profile Logic
const userProfile = ref({
  name: 'Administrator',
  email: 'admin@kpn.co.id',
  photo: null
})

const getInitials = (name) => {
  return name ? name.substring(0, 2).toUpperCase() : 'AD'
}

const editProfile = () => {
  // Simple prompt to allow customization
  const newName = prompt("Masukkan Nama Lengkap Anda:", userProfile.value.name)
  if (newName !== null) { // Check for cancel
    const newEmail = prompt("Masukkan Email Anda:", userProfile.value.email)
    // Optional photo
    const newPhoto = prompt("URL Foto Profil (Optional - Kosongkan jika tidak ada):", userProfile.value.photo || '')
    
    if (newName && newEmail) {
      userProfile.value = {
        name: newName,
        email: newEmail,
        photo: newPhoto || null
      }
      // Save to storage
      if (process.client) {
         localStorage.setItem('kpn_user_profile', JSON.stringify(userProfile.value))
      }
    }
  }
}

// Initialize theme & profile
onMounted(() => {
  initTheme()
  
  if (process.client) {
    // Load profile from storage
    const savedProfile = localStorage.getItem('kpn_user_profile')
    if (savedProfile) {
      try {
        userProfile.value = JSON.parse(savedProfile)
      } catch (e) { console.error('Error parsing profile', e) }
    }
  }
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
