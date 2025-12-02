<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <!-- Sidebar -->
    <aside class="fixed left-0 top-0 z-40 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <!-- Logo -->
      <div class="h-16 flex items-center justify-center px-6 border-b border-gray-200 dark:border-gray-700 gap-3 bg-gradient-to-br from-blue-50 to-violet-50 dark:from-gray-800 dark:to-gray-900">
        <img src="/Logo.png" alt="KPN FAST" class="h-12 w-auto object-contain drop-shadow-lg" />
        <h1 class="text-xl font-black tracking-tight">
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-violet-600 to-purple-600">KPN - Fast</span>
        </h1>
      </div>

      <!-- Navigation -->
      <nav class="p-3 space-y-1">
        <NuxtLink
          to="/"
          class="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-violet-50 dark:hover:from-gray-700 dark:hover:to-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 text-sm font-medium group"
          active-class="bg-gradient-to-r from-blue-50 to-violet-50 dark:from-gray-700 dark:to-gray-700 text-blue-600 dark:text-blue-400 font-bold shadow-sm ring-1 ring-blue-100 dark:ring-gray-600"
        >
          <div class="w-8 h-8 rounded-lg bg-blue-100 dark:bg-gray-700 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
            <i class="fas fa-th-large text-xs"></i>
          </div>
          <span>Dashboard</span>
        </NuxtLink>

        <!-- Database Menu with Sub-items -->
        <div>
          <button
            @click="toggleDatabaseMenu"
            class="w-full flex items-center justify-between gap-2.5 px-3 py-2.5 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gradient-to-r hover:from-blue-50 hover:to-violet-50 dark:hover:from-gray-700 dark:hover:to-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-200 text-sm font-medium group"
            :class="{ 'bg-gradient-to-r from-blue-50 to-violet-50 dark:from-gray-700 dark:to-gray-700 text-blue-600 dark:text-blue-400 font-bold ring-1 ring-blue-100 dark:ring-gray-600': isDatabaseActive }"
          >
            <div class="flex items-center gap-2.5">
              <div class="w-8 h-8 rounded-lg bg-violet-100 dark:bg-gray-700 flex items-center justify-center group-hover:scale-110 transition-transform flex-shrink-0">
                <i class="fas fa-database text-xs"></i>
              </div>
              <span>Database</span>
            </div>
            <i class="fas fa-chevron-down transition-transform text-xs" :class="{ 'rotate-180': databaseMenuOpen }"></i>
          </button>
          
          <!-- Sub Menu -->
          <div v-show="databaseMenuOpen" class="ml-11 mt-1 space-y-0.5">
            <NuxtLink
              to="/database/companies"
              class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-medium group"
              active-class="bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold ring-1 ring-blue-100 dark:ring-gray-600"
            >
              <i class="fas fa-building w-4 text-center group-hover:scale-110 transition-transform"></i>
              <span>Perusahaan</span>
            </NuxtLink>
            
            <NuxtLink
              to="/database/personil"
              class="flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-medium group"
              active-class="bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-semibold ring-1 ring-blue-100 dark:ring-gray-600"
            >
              <i class="fas fa-users w-4 text-center group-hover:scale-110 transition-transform"></i>
              <span>Personil</span>
            </NuxtLink>
          </div>
        </div>
      </nav>
    </aside>

    <!-- Main Content -->
    <div class="ml-64 transition-all duration-300">
      <!-- Top Bar -->
      <header class="h-16 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-8 sticky top-0 z-30 transition-colors duration-300">
        <div>
          <h2 class="text-lg font-bold text-gray-900 dark:text-white">{{ pageTitle }}</h2>
        </div>
        <div class="flex items-center gap-6">
          <!-- Theme Toggle -->
          <button 
            @click="toggleTheme" 
            class="w-10 h-10 rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-yellow-400 hover:bg-gray-200 dark:hover:bg-gray-600 transition-all flex items-center justify-center focus:outline-none"
            :title="isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'"
          >
            <i class="fas" :class="isDark ? 'fa-sun' : 'fa-moon'"></i>
          </button>
        </div>
      </header>

      <!-- Page Content -->
      <main class="p-8">
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup>
import { useTheme } from '~/composables/useTheme'

const route = useRoute()
const { isDark, toggleTheme, initTheme } = useTheme()

// Database menu state
const databaseMenuOpen = ref(false)

// Initialize theme on mount
onMounted(() => {
  initTheme()
  // Auto-open database menu if on database route (initial load only)
  if (route.path.startsWith('/database')) {
    databaseMenuOpen.value = true
  }
})

// Do NOT auto-open dropdown on route change
// Let user manually control dropdown state

// Toggle database menu
const toggleDatabaseMenu = () => {
  databaseMenuOpen.value = !databaseMenuOpen.value
}

// Check if database route is active
const isDatabaseActive = computed(() => {
  return route.path.startsWith('/database')
})

// Computed properties
const pageTitle = computed(() => {
  const titles = {
    '/': 'Dashboard',
    '/database': 'Database',
    '/database/companies': 'Database Perusahaan',
    '/database/personil': 'Database Personil',
    '/database/projects': 'Database Project'
  }
  
  // Handle dynamic company detail routes
  if (route.path.startsWith('/database/companies/') && route.params.id) {
    return 'Detail Perusahaan'
  }
  
  return titles[route.path] || 'KPN FAST'
})

const userEmail = computed(() => 'admin@kpn.co.id')
</script>
