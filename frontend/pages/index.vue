<template>
  <NuxtLayout name="dashboard">
    <div class="space-y-6 animate-fade-in">
      <!-- Welcome Section -->
      <div class="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-violet-600 p-8 text-white shadow-lg">
        <div class="absolute top-0 right-0 -mr-16 -mt-16 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div class="absolute bottom-0 left-0 -ml-16 -mb-16 w-64 h-64 bg-black/10 rounded-full blur-3xl"></div>
        
        <div class="relative z-10">
          <h2 class="text-3xl font-black mb-3">Selamat Datang di KPN FAST! 👋</h2>
          <p class="text-blue-100 text-base max-w-2xl font-medium leading-relaxed">
            Sistem Automasi Dokumen Pengadaan Berbasis AI. Kelola data perusahaan dan personil Anda dengan mudah, cepat, dan akurat.
          </p>
        </div>
      </div>

      <!-- Stats Grid -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- Company Stats -->
        <div class="group relative bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div class="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-blue-50 dark:bg-blue-900/20 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl flex items-center justify-center text-xl group-hover:rotate-12 transition-transform duration-300">
                <i class="fas fa-building"></i>
              </div>
              <span class="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold rounded-full">Active</span>
            </div>
            <p class="text-gray-500 dark:text-gray-400 font-medium mb-1 text-sm">Total Perusahaan</p>
            <h3 class="text-3xl font-black text-gray-900 dark:text-white">{{ companyCount }}</h3>
          </div>
        </div>

        <!-- Personnel Stats -->
        <div class="group relative bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div class="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-violet-50 dark:bg-violet-900/20 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-violet-100 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 rounded-xl flex items-center justify-center text-xl group-hover:rotate-12 transition-transform duration-300">
                <i class="fas fa-users"></i>
              </div>
              <span class="px-2.5 py-1 bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 text-xs font-bold rounded-full">Active</span>
            </div>
            <p class="text-gray-500 dark:text-gray-400 font-medium mb-1 text-sm">Total Personil</p>
            <h3 class="text-3xl font-black text-gray-900 dark:text-white">{{ personnelCount }}</h3>
          </div>
        </div>

        <!-- Documents Stats -->
        <div class="group relative bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden">
          <div class="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-fuchsia-50 dark:bg-fuchsia-900/20 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
          <div class="relative z-10">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-fuchsia-100 dark:bg-fuchsia-900/30 text-fuchsia-600 dark:text-fuchsia-400 rounded-xl flex items-center justify-center text-xl group-hover:rotate-12 transition-transform duration-300">
                <i class="fas fa-file-alt"></i>
              </div>
              <span class="px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 text-xs font-bold rounded-full">Soon</span>
            </div>
            <p class="text-gray-500 dark:text-gray-400 font-medium mb-1 text-sm">Dokumen Dibuat</p>
            <h3 class="text-3xl font-black text-gray-900 dark:text-white">0</h3>
          </div>
        </div>
      </div>

      <!-- System Status -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div class="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 flex items-center gap-4 shadow-sm">
          <div class="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-xl">
            <i class="fas fa-server"></i>
          </div>
          <div>
            <h4 class="text-lg font-bold text-gray-900 dark:text-white">Backend API</h4>
            <div class="flex items-center gap-2 mt-1">
              <span class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">Connected to {{ apiUrl }}</span>
            </div>
          </div>
        </div>

        <div class="bg-white dark:bg-gray-800 p-6 rounded-3xl border border-gray-100 dark:border-gray-700 flex items-center gap-4 shadow-sm">
          <div class="w-12 h-12 rounded-2xl bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 flex items-center justify-center text-xl">
            <i class="fas fa-database"></i>
          </div>
          <div>
            <h4 class="text-lg font-bold text-gray-900 dark:text-white">Database</h4>
            <div class="flex items-center gap-2 mt-1">
              <span class="relative flex h-3 w-3">
                <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span class="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <span class="text-sm text-gray-500 dark:text-gray-400 font-medium">Google Sheets Connected</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </NuxtLayout>
</template>

<script setup>
const config = useRuntimeConfig()
const apiUrl = config.public.apiBaseUrl

// Stats
const companyCount = ref(0)
const personnelCount = ref(0)

// Fetch stats from API
onMounted(async () => {
  try {
    // Get companies
    const companiesRes = await $fetch(`${apiUrl}/company`)
    companyCount.value = companiesRes.data?.length || 0

    // Get personnel
    const personnelRes = await $fetch(`${apiUrl}/personnel`)
    personnelCount.value = personnelRes.data?.length || 0
  } catch (error) {
    console.error('Failed to fetch stats:', error)
  }
})

useHead({
  title: 'Dashboard - KPN FAST'
})
</script>
