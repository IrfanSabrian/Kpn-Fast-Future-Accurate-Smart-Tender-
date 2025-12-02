<template>
  <div>
    <!-- Back Button -->
    <NuxtLink 
      to="/database/companies"
      class="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 mb-6 transition-colors"
    >
      <i class="fas fa-arrow-left"></i>
      <span>Kembali ke Database</span>
    </NuxtLink>

    <!-- Loading State -->
    <div v-if="loading" class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>

    <!-- Company Detail -->
    <div v-else-if="company">
      <!-- Company Header -->
      <div class="bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl p-8 mb-8 text-white relative overflow-hidden">
        <!-- Background Pattern -->
        <div class="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
        
        <div class="relative flex items-start gap-6">
          <div class="w-20 h-20 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center flex-shrink-0 shadow-lg border border-white/20">
            <i class="fas fa-building text-4xl"></i>
          </div>
          <div class="flex-1">
            <h1 class="text-3xl font-bold mb-2">{{ company.nama_perusahaan }}</h1>
            <div class="flex flex-wrap gap-3 text-sm text-blue-100">
              <!-- Row 1: ID & No Telp -->
              <span class="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                <i class="fas fa-id-card"></i>
                {{ company.id_perusahaan }}
              </span>
              <span v-if="company.no_telp" class="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                <i class="fas fa-phone"></i>
                {{ company.no_telp }}
              </span>
              
              <!-- Row 2: Status & Fax -->
              <span v-if="company.status_perusahaan" class="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                <i class="fas fa-tag"></i>
                {{ company.status_perusahaan }}
              </span>
              <span v-if="company.no_fax" class="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                <i class="fas fa-fax"></i>
                {{ company.no_fax }}
              </span>
              
              <!-- Row 3: Email -->
              <span v-if="company.email" class="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm">
                <i class="fas fa-envelope"></i>
                {{ company.email }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Database Tabs -->
      <div class="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <!-- Tab Headers -->
        <div class="border-b border-gray-200 dark:border-gray-700 overflow-x-auto">
          <div class="flex">
            <button
              v-for="tab in tabs"
              :key="tab.id"
              @click="activeTab = tab.id"
              class="px-6 py-4 font-medium transition-all whitespace-nowrap"
              :class="activeTab === tab.id 
                ? 'text-blue-600 dark:text-blue-400 border-b-2 border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-gray-700/50' 
                : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700/30'"
            >
              <i :class="tab.icon" class="mr-2"></i>
              {{ tab.label }}
              <span v-if="tab.count !== null" class="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-200 dark:bg-gray-600">
                {{ tab.count }}
              </span>
            </button>
          </div>
        </div>

        <!-- Tab Content -->
        <div class="p-6">
          <!-- Akta -->
          <div v-if="activeTab === 'akta'">
            <div v-if="loadingTab" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <div v-else-if="akta.length > 0" class="space-y-4">
              <div v-for="item in akta" :key="item.nomor_akta" class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-2">{{ item.jenis_akta }}</h4>
                    <div class="space-y-1 text-sm">
                      <p class="text-gray-600 dark:text-gray-400">
                        <i class="fas fa-file-alt w-4"></i> {{ item.nomor_akta }}
                      </p>
                      <p class="text-gray-600 dark:text-gray-400">
                        <i class="fas fa-calendar w-4"></i> {{ item.tanggal_akta }}
                      </p>
                      <p class="text-gray-600 dark:text-gray-400">
                        <i class="fas fa-user-tie w-4"></i> {{ item.nama_notaris }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
              <i class="fas fa-file-alt text-4xl mb-4 opacity-50"></i>
              <p>Belum ada data akta</p>
            </div>
          </div>

          <!-- Pejabat -->
          <div v-if="activeTab === 'pejabat'">
            <div v-if="loadingTab" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <div v-else-if="pejabat.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div v-for="item in pejabat" :key="item.nik" class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                <div class="flex items-start gap-3">
                  <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                    <i class="fas fa-user-tie"></i>
                  </div>
                  <div class="flex-1">
                    <h4 class="font-semibold text-gray-900 dark:text-white">{{ item.nama }}</h4>
                    <p class="text-sm text-blue-600 dark:text-blue-400 mb-2">{{ item.jabatan }}</p>
                    <div class="space-y-1 text-xs text-gray-600 dark:text-gray-400">
                      <p><i class="fas fa-id-card w-4"></i> {{ item.nik }}</p>
                      <p v-if="item.no_telp"><i class="fas fa-phone w-4"></i> {{ item.no_telp }}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
              <i class="fas fa-user-tie text-4xl mb-4 opacity-50"></i>
              <p>Belum ada data pejabat</p>
            </div>
          </div>

          <!-- NIB -->
          <div v-if="activeTab === 'nib'">
            <div v-if="loadingTab" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <div v-else-if="nib.length > 0" class="space-y-4">
              <div v-for="item in nib" :key="item.nomor_nib" class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Nomor NIB</p>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ item.nomor_nib }}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Tanggal NIB</p>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ item.tanggal_nib }}</p>
                  </div>
                  <div class="md:col-span-2">
                    <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Bidang NIB</p>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ item.bidang_nib }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
              <i class="fas fa-certificate text-4xl mb-4 opacity-50"></i>
              <p>Belum ada data NIB</p>
            </div>
          </div>


          <!-- Pengalaman -->
          <div v-if="activeTab === 'pengalaman'">
            <div v-if="loadingTab" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <div v-else-if="pengalaman.length > 0" class="space-y-4">
              <div v-for="item in pengalaman" :key="item.nomor_kontrak" class="p-6 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                <h4 class="font-bold text-lg text-gray-900 dark:text-white mb-3">{{ item.nama_pekerjaan }}</h4>
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <p class="text-gray-500 dark:text-gray-400 mb-1">Bidang Pekerjaan</p>
                    <p class="font-medium text-gray-900 dark:text-white">{{ item.bidang_pekerjaan }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500 dark:text-gray-400 mb-1">Lokasi</p>
                    <p class="font-medium text-gray-900 dark:text-white">{{ item.lokasi }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500 dark:text-gray-400 mb-1">Pemberi Tugas</p>
                    <p class="font-medium text-gray-900 dark:text-white">{{ item.nama_pemberi_tugas }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500 dark:text-gray-400 mb-1">Nomor Kontrak</p>
                    <p class="font-medium text-gray-900 dark:text-white">{{ item.nomor_kontrak }}</p>
                  </div>
                  <div>
                    <p class="text-gray-500 dark:text-gray-400 mb-1">Nilai Kontrak</p>
                    <p class="font-medium text-green-600 dark:text-green-400">
                      Rp {{ parseInt(item.nilai_kontrak || 0).toLocaleString('id-ID') }}
                    </p>
                  </div>
                  <div>
                    <p class="text-gray-500 dark:text-gray-400 mb-1">Tanggal Selesai</p>
                    <p class="font-medium text-gray-900 dark:text-white">{{ item.tanggal_selesai_kontrak }}</p>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
              <i class="fas fa-project-diagram text-4xl mb-4 opacity-50"></i>
              <p>Belum ada data pengalaman proyek</p>
            </div>
          </div>

          <!-- Projects (New Tab) -->
          <div v-if="activeTab === 'projects'">
            <div v-if="loadingTab" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <div v-else-if="projects.length > 0" class="space-y-4">
              <div v-for="item in projects" :key="item.id_project" class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                <div class="flex items-start justify-between">
                  <div class="flex-1">
                    <h4 class="font-semibold text-gray-900 dark:text-white mb-2">{{ item.nama_project }}</h4>
                    <div class="space-y-1 text-sm">
                      <p class="text-gray-600 dark:text-gray-400">
                        <i class="fas fa-hashtag w-4"></i> {{ item.id_project }}
                      </p>
                      <p class="text-gray-600 dark:text-gray-400">
                        <i class="fas fa-user w-4"></i> NIK: {{ item.nik }}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
              <i class="fas fa-tasks text-4xl mb-4 opacity-50"></i>
              <p>Belum ada data project</p>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- Error State -->
    <div v-else class="bg-white dark:bg-gray-800 rounded-2xl p-12 text-center border border-gray-200 dark:border-gray-700">
      <div class="w-20 h-20 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center mx-auto mb-6">
        <i class="fas fa-exclamation-triangle text-4xl text-red-500"></i>
      </div>
      <h3 class="text-xl font-bold text-gray-900 dark:text-white mb-2">
        Perusahaan Tidak Ditemukan
      </h3>
      <p class="text-gray-600 dark:text-gray-400">
        Data perusahaan yang Anda cari tidak ditemukan
      </p>
    </div>
  </div>
</template>

<script setup>
definePageMeta({
  layout: 'dashboard'
})

const route = useRoute()
const companyId = route.params.id

const loading = ref(true)
const company = ref(null)
const activeTab = ref('akta')

// Data for each tab
const akta = ref([])
const pejabat = ref([])
const nib = ref([])
const pengalaman = ref([])
const projects = ref([])

// Loading state untuk masing-masing tab
const tabLoading = ref({
  akta: false,
  pejabat: false,
  nib: false,
  pengalaman: false,
  projects: false
})

// Check if current tab is still loading
const loadingTab = computed(() => tabLoading.value[activeTab.value])

// Tabs configuration - REMOVED PERSONIL TAB
const tabs = computed(() => [
  { id: 'akta', label: 'Akta', icon: 'fas fa-file-alt', count: akta.value.length },
  { id: 'pejabat', label: 'Pejabat', icon: 'fas fa-user-tie', count: pejabat.value.length },
  { id: 'nib', label: 'NIB', icon: 'fas fa-certificate', count: nib.value.length },
  { id: 'pengalaman', label: 'Pengalaman', icon: 'fas fa-project-diagram', count: pengalaman.value.length },
  { id: 'projects', label: 'Project', icon: 'fas fa-tasks', count: projects.value.length }
])

// Fetch company data
const fetchCompany = async () => {
  try {
    const response = await fetch(`http://localhost:5000/api/companies/${companyId}`)
    if (response.ok) {
      company.value = await response.json()
    } else {
      console.error('Failed to fetch company:', response.status)
    }
  } catch (error) {
    console.error('Error fetching company:', error)
  } finally {
    loading.value = false
  }
}

// Fetch data untuk satu tab
const fetchTabData = async (tab) => {
  tabLoading.value[tab] = true
  try {
    const response = await fetch(`http://localhost:5000/api/companies/${companyId}/${tab}`)
    
    if (response.ok) {
      const data = await response.json()
      switch (tab) {
        case 'akta': akta.value = data; break
        case 'pejabat': pejabat.value = data; break
        case 'nib': nib.value = data; break
        case 'pengalaman': pengalaman.value = data; break
        case 'projects': projects.value = data; break
      }
      console.log(`Loaded ${tab}:`, data.length, 'items')
    } else {
      console.error(`Failed to fetch ${tab}:`, response.status)
    }
  } catch (error) {
    console.error(`Error fetching ${tab}:`, error)
  } finally {
    tabLoading.value[tab] = false
  }
}

// Fetch semua tab data sekaligus
const fetchAllTabsData = async () => {
  console.log('Fetching all tabs data...')
  const allTabs = ['akta', 'pejabat', 'nib', 'pengalaman', 'projects']
  
  // Fetch semua tab secara parallel
  await Promise.all(allTabs.map(tab => fetchTabData(tab)))
  
  console.log('All tabs data loaded!')
}

// Fetch data on mount
onMounted(async () => {
  // Fetch company data dulu
  await fetchCompany()
  
  // Jika company berhasil di-load, fetch semua tab data
  if (company.value) {
    await fetchAllTabsData()
  }
})

// Actions
const handleEdit = () => {
  alert('Fitur Edit akan segera hadir!')
}

const handleDelete = async () => {
  if (confirm('Apakah Anda yakin ingin menghapus perusahaan ini?')) {
    alert('Fitur Hapus akan segera hadir!')
  }
}
</script>
