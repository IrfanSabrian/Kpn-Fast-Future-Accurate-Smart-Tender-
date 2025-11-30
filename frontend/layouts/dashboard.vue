<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
    <!-- Sidebar -->
    <aside class="fixed left-0 top-0 z-40 h-screen w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <!-- Logo -->
      <div class="h-16 flex items-center px-6 border-b border-gray-200 dark:border-gray-700">
        <h1 class="text-xl font-black text-gray-900 dark:text-white tracking-tight">
          <span class="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-violet-600">KPN FAST</span>
        </h1>
      </div>

      <!-- Navigation -->
      <nav class="p-4 space-y-2">
        <NuxtLink
          to="/"
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-medium"
          active-class="bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-bold shadow-sm"
        >
          <i class="fas fa-th-large w-5 text-center"></i>
          <span>Dashboard</span>
        </NuxtLink>

        <NuxtLink
          to="/perusahaan"
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-medium"
          active-class="bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-bold shadow-sm"
        >
          <i class="fas fa-building w-5 text-center"></i>
          <span>Data Perusahaan</span>
        </NuxtLink>

        <NuxtLink
          to="/personil"
          class="flex items-center gap-3 px-4 py-3 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 transition-all font-medium"
          active-class="bg-blue-50 dark:bg-gray-700 text-blue-600 dark:text-blue-400 font-bold shadow-sm"
        >
          <i class="fas fa-users w-5 text-center"></i>
          <span>Data Personil</span>
        </NuxtLink>
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

          <div class="flex items-center gap-3 pl-6 border-l border-gray-200 dark:border-gray-700">
            <div class="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center text-white font-bold text-xs">
              A
            </div>
            <span class="text-sm font-medium text-gray-700 dark:text-gray-300">{{ userEmail }}</span>
          </div>
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

// Initialize theme on mount
onMounted(() => {
  initTheme()
})

// Computed properties
const pageTitle = computed(() => {
  const titles = {
    '/': 'Dashboard',
    '/perusahaan': 'Data Perusahaan',
    '/personil': 'Data Personil'
  }
  return titles[route.path] || 'KPN FAST'
})

const userEmail = computed(() => 'admin@kpn.co.id')
</script>
