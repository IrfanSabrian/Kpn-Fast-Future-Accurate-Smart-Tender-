<template>
  <div>
    <!-- Header -->
    <div class="mb-8">
      <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-2">
        Database Perusahaan
      </h1>
      <p class="text-gray-600 dark:text-gray-400">
        Pilih perusahaan untuk melihat detail database
      </p>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Companies Grid -->
    <div v-else-if="companies.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <NuxtLink
        v-for="company in companies"
        :key="company.id_perusahaan"
        :to="`/database/companies/${company.id_perusahaan}`"
        class="group block"
      >
        <div class="bg-white dark:bg-gray-800 rounded-2xl p-6 border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
          <!-- Company Icon -->
          <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-violet-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
            <i class="fas fa-building text-2xl text-white"></i>
          </div>

          <!-- Company Info -->
          <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
            {{ company.nama_perusahaan }}
          </h3>
          
          <div class="space-y-2 text-sm">
            <div class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <i class="fas fa-id-card w-4"></i>
              <span>{{ company.id_perusahaan }}</span>
            </div>
            
            <div v-if="company.status_perusahaan" class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <i class="fas fa-tag w-4"></i>
              <span>{{ company.status_perusahaan }}</span>
            </div>

            <div v-if="company.email" class="flex items-center gap-2 text-gray-600 dark:text-gray-400">
              <i class="fas fa-envelope w-4"></i>
              <span class="truncate">{{ company.email }}</span>
            </div>
          </div>

          <!-- View Details Button -->
          <div class="mt-6 flex items-center justify-between">
            <span class="text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:underline">
              Lihat Detail
            </span>
            <i class="fas fa-arrow-right text-blue-600 dark:text-blue-400 group-hover:translate-x-1 transition-transform"></i>
          </div>
        </div>
      </NuxtLink>
    </div>

    <!-- Empty State -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
      <div class="w-20 h-20 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-6">
        <i class="fas fa-building text-4xl text-gray-400"></i>
      </div>
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Belum Ada Data Perusahaan
      </h3>
      <p class="text-gray-600 dark:text-gray-400 mb-6">
        Silakan tambahkan data perusahaan terlebih dahulu
      </p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'dashboard'
})

const loading = ref(true)
const companies = ref([])

// Fetch companies on mount
onMounted(async () => {
  try {
    const response = await fetch('http://localhost:5000/api/companies')
    if (response.ok) {
      companies.value = await response.json()
    } else {
      console.error('Failed to fetch companies:', response.status)
    }
  } catch (error) {
    console.error('Error fetching companies:', error)
  } finally {
    loading.value = false
  }
})
</script>
