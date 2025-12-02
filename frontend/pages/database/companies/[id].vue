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
          <!-- Add Button for Current Tab -->
          <div class="flex justify-end mb-6">
            <button
              @click="openAddModal(activeTab)"
              class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg shadow-md transition-colors flex items-center gap-2 text-sm font-medium"
            >
              <i class="fas fa-plus"></i>
              <span>Tambah {{ getTabLabel(activeTab) }}</span>
            </button>
          </div>

          <!-- Akta -->
          <div v-if="activeTab === 'akta'">
            <div v-if="loadingTab" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <div v-else-if="akta.length > 0" class="space-y-4">
              <div v-for="item in akta" :key="item.nomor_akta" class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 group hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
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
                  <!-- Action Buttons -->
                  <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="openEditModal('akta', item)" class="p-2 text-blue-600 hover:bg-blue-100 rounded-lg" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click="confirmDelete('akta', item)" class="p-2 text-red-600 hover:bg-red-100 rounded-lg" title="Hapus">
                      <i class="fas fa-trash"></i>
                    </button>
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
              <div v-for="item in pejabat" :key="item.nik" class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 group hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                <div class="flex items-start gap-3">
                  <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 flex-shrink-0">
                    <i class="fas fa-user-tie"></i>
                  </div>
                  <div class="flex-1">
                    <div class="flex justify-between items-start">
                      <h4 class="font-semibold text-gray-900 dark:text-white">{{ item.nama }}</h4>
                      <!-- Action Buttons -->
                      <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button @click="openEditModal('pejabat', item)" class="p-1.5 text-blue-600 hover:bg-blue-100 rounded-lg" title="Edit">
                          <i class="fas fa-edit text-xs"></i>
                        </button>
                        <button @click="confirmDelete('pejabat', item)" class="p-1.5 text-red-600 hover:bg-red-100 rounded-lg" title="Hapus">
                          <i class="fas fa-trash text-xs"></i>
                        </button>
                      </div>
                    </div>
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
              <div v-for="item in nib" :key="item.nomor_nib" class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 group hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                <div class="flex justify-between items-start mb-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
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
                  <!-- Action Buttons -->
                  <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity ml-4">
                    <button @click="openEditModal('nib', item)" class="p-2 text-blue-600 hover:bg-blue-100 rounded-lg" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click="confirmDelete('nib', item)" class="p-2 text-red-600 hover:bg-red-100 rounded-lg" title="Hapus">
                      <i class="fas fa-trash"></i>
                    </button>
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
              <div v-for="item in pengalaman" :key="item.nomor_kontrak" class="p-6 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 group hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
                <div class="flex justify-between items-start mb-3">
                  <h4 class="font-bold text-lg text-gray-900 dark:text-white">{{ item.nama_pekerjaan }}</h4>
                  <!-- Action Buttons -->
                  <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="openEditModal('pengalaman', item)" class="p-2 text-blue-600 hover:bg-blue-100 rounded-lg" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click="confirmDelete('pengalaman', item)" class="p-2 text-red-600 hover:bg-red-100 rounded-lg" title="Hapus">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
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

          <!-- Projects -->
          <div v-if="activeTab === 'projects'">
            <div v-if="loadingTab" class="flex justify-center py-8">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
            <div v-else-if="projects.length > 0" class="space-y-4">
              <div v-for="item in projects" :key="item.id_project" class="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 group hover:border-blue-300 dark:hover:border-blue-700 transition-colors">
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
                  <!-- Action Buttons -->
                  <div class="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button @click="openEditModal('projects', item)" class="p-2 text-blue-600 hover:bg-blue-100 rounded-lg" title="Edit">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click="confirmDelete('projects', item)" class="p-2 text-red-600 hover:bg-red-100 rounded-lg" title="Hapus">
                      <i class="fas fa-trash"></i>
                    </button>
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

    <!-- Base Modal for Forms -->
    <BaseModal
      :show="showModal"
      :title="modalTitle"
      @close="closeModal"
    >
      <template #body>
        <form @submit.prevent="saveItem" class="space-y-6">
          <!-- Form Fields based on modalType -->
          
          <!-- AKTA FORM -->
          <div v-if="modalType === 'akta'" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Jenis Akta</label>
              <input 
                v-model="formData.jenis_akta" 
                type="text" 
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
                placeholder="Contoh: Pendirian, Perubahan"
              >
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nomor Akta</label>
              <input 
                v-model="formData.nomor_akta" 
                type="text" 
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              >
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tanggal Akta</label>
              <input 
                v-model="formData.tanggal_akta" 
                type="date" 
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              >
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nama Notaris</label>
              <input 
                v-model="formData.nama_notaris" 
                type="text" 
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              >
            </div>
          </div>

          <!-- PEJABAT FORM -->
          <div v-if="modalType === 'pejabat'" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nama Pejabat</label>
              <input 
                v-model="formData.nama" 
                type="text" 
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              >
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">NIK</label>
              <input 
                v-model="formData.nik" 
                type="text" 
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              >
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Jabatan</label>
              <input 
                v-model="formData.jabatan" 
                type="text" 
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              >
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Alamat</label>
              <textarea 
                v-model="formData.alamat" 
                rows="3" 
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              ></textarea>
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">No. Telp</label>
              <input 
                v-model="formData.no_telp" 
                type="text" 
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              >
            </div>
          </div>

          <!-- NIB FORM -->
          <div v-if="modalType === 'nib'" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nomor NIB</label>
              <input 
                v-model="formData.nomor_nib" 
                type="text" 
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              >
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tanggal NIB</label>
              <input 
                v-model="formData.tanggal_nib" 
                type="date" 
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              >
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Bidang NIB</label>
              <textarea 
                v-model="formData.bidang_nib" 
                rows="4" 
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
                placeholder="Pisahkan dengan koma jika banyak"
              ></textarea>
            </div>
          </div>

          <!-- PENGALAMAN FORM -->
          <div v-if="modalType === 'pengalaman'" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nama Pekerjaan</label>
              <input 
                v-model="formData.nama_pekerjaan" 
                type="text" 
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              >
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Bidang Pekerjaan</label>
                <input 
                  v-model="formData.bidang_pekerjaan" 
                  type="text" 
                  class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                >
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Lokasi</label>
                <input 
                  v-model="formData.lokasi" 
                  type="text" 
                  class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                >
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Pemberi Tugas</label>
                <input 
                  v-model="formData.nama_pemberi_tugas" 
                  type="text" 
                  class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                >
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Alamat Pemberi Tugas</label>
                <input 
                  v-model="formData.alamat_pemberi_tugas" 
                  type="text" 
                  class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                >
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nomor Kontrak</label>
                <input 
                  v-model="formData.nomor_kontrak" 
                  type="text" 
                  class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                >
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nilai Kontrak</label>
                <input 
                  v-model="formData.nilai_kontrak" 
                  type="number" 
                  class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                >
              </div>
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tgl Selesai Kontrak</label>
                <input 
                  v-model="formData.tanggal_selesai_kontrak" 
                  type="date" 
                  class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                >
              </div>
              <div>
                <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Tgl BA Serah Terima</label>
                <input 
                  v-model="formData.tanggal_BA_selesai_serah_terima" 
                  type="date" 
                  class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
                >
              </div>
            </div>
          </div>

          <!-- PROJECT FORM -->
          <div v-if="modalType === 'projects'" class="space-y-4">
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Nama Project</label>
              <input 
                v-model="formData.nama_project" 
                type="text" 
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none"
              >
            </div>
            <div>
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">NIK Personil</label>
              <input 
                v-model="formData.nik" 
                type="text" 
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none" 
                placeholder="Masukkan NIK Personil"
              >
            </div>
          </div>

        </form>
      </template>
      <template #footer>
        <button @click="closeModal" class="px-6 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium">
          Batal
        </button>
        <button @click="saveItem" :disabled="saving" class="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors flex items-center gap-2 font-medium shadow-lg shadow-blue-600/30">
          <span v-if="saving" class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></span>
          <span>{{ isEditing ? 'Update' : 'Simpan' }}</span>
        </button>
      </template>
    </BaseModal>

    <!-- Confirm Dialog -->
    <ConfirmDialog
      :show="showDeleteDialog"
      title="Konfirmasi Hapus"
      :message="deleteMessage"
      @confirm="deleteItem"
      @cancel="showDeleteDialog = false"
    />

    <!-- Toast -->
    <BaseToast ref="toast" />
  </div>
</template>

<script setup>
import BaseModal from '~/components/BaseModal.vue'
import ConfirmDialog from '~/components/ConfirmDialog.vue'
import BaseToast from '~/components/BaseToast.vue'

definePageMeta({
  layout: 'dashboard'
})

const route = useRoute()
const companyId = route.params.id

const loading = ref(true)
const company = ref(null)
const activeTab = ref('akta')
const toast = ref(null)

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

// Tabs configuration
const tabs = computed(() => [
  { id: 'akta', label: 'Akta', icon: 'fas fa-file-alt', count: akta.value.length },
  { id: 'pejabat', label: 'Pejabat', icon: 'fas fa-user-tie', count: pejabat.value.length },
  { id: 'nib', label: 'NIB', icon: 'fas fa-certificate', count: nib.value.length },
  { id: 'pengalaman', label: 'Pengalaman', icon: 'fas fa-project-diagram', count: pengalaman.value.length },
  { id: 'projects', label: 'Project', icon: 'fas fa-tasks', count: projects.value.length }
])

// Modal & Form State
const showModal = ref(false)
const modalType = ref('')
const isEditing = ref(false)
const saving = ref(false)
const formData = ref({})

// Delete State
const showDeleteDialog = ref(false)
const itemToDelete = ref(null)
const deleteType = ref('')

const modalTitle = computed(() => {
  const action = isEditing.value ? 'Edit' : 'Tambah'
  const labels = {
    akta: 'Akta',
    pejabat: 'Pejabat',
    nib: 'NIB',
    pengalaman: 'Pengalaman',
    projects: 'Project'
  }
  return `${action} ${labels[modalType.value] || 'Item'}`
})

const deleteMessage = computed(() => {
  return `Apakah Anda yakin ingin menghapus data ini? Tindakan ini tidak dapat dibatalkan.`
})

const getTabLabel = (tabId) => {
  const tab = tabs.value.find(t => t.id === tabId)
  return tab ? tab.label : ''
}

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
  const allTabs = ['akta', 'pejabat', 'nib', 'pengalaman', 'projects']
  await Promise.all(allTabs.map(tab => fetchTabData(tab)))
}

// Fetch data on mount
onMounted(async () => {
  await fetchCompany()
  if (company.value) {
    await fetchAllTabsData()
  }
})

// --- CRUD ACTIONS ---

const openAddModal = (type) => {
  modalType.value = type
  isEditing.value = false
  formData.value = {}
  showModal.value = true
}

const openEditModal = (type, item) => {
  modalType.value = type
  isEditing.value = true
  formData.value = { ...item } // Copy item to form data
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  formData.value = {}
}

const saveItem = async () => {
  saving.value = true
  try {
    const type = modalType.value
    let url = `http://localhost:5000/api`
    let method = isEditing.value ? 'PUT' : 'POST'
    
    // Construct URL based on type and action
    if (isEditing.value) {
      // Update URLs
      switch (type) {
        case 'akta': url += `/akta/${formData.value.nomor_akta}`; break
        case 'pejabat': url += `/pejabat/${formData.value.nik}`; break
        case 'nib': url += `/nib/${encodeURIComponent(formData.value.nomor_nib)}`; break
        case 'pengalaman': url += `/pengalaman/${encodeURIComponent(formData.value.nomor_kontrak)}`; break
        case 'projects': url += `/projects/${formData.value.id_project}`; break
      }
    } else {
      // Create URLs
      url += `/companies/${companyId}/${type}`
    }

    const response = await fetch(url, {
      method: method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData.value)
    })

    if (!response.ok) throw new Error('Gagal menyimpan data')

    // Refresh data
    await fetchTabData(type)
    closeModal()
    toast.value.show('Data berhasil disimpan', 'success')
  } catch (error) {
    console.error('Error saving item:', error)
    toast.value.show('Gagal menyimpan data: ' + error.message, 'error')
  } finally {
    saving.value = false
  }
}

const confirmDelete = (type, item) => {
  deleteType.value = type
  itemToDelete.value = item
  showDeleteDialog.value = true
}

const deleteItem = async () => {
  try {
    const type = deleteType.value
    const item = itemToDelete.value
    let url = `http://localhost:5000/api`
    
    // Construct Delete URL
    switch (type) {
      case 'akta': url += `/akta/${item.nomor_akta}`; break
      case 'pejabat': url += `/pejabat/${item.nik}`; break
      case 'nib': url += `/nib/${encodeURIComponent(item.nomor_nib)}`; break
      case 'pengalaman': url += `/pengalaman/${encodeURIComponent(item.nomor_kontrak)}`; break
      case 'projects': url += `/projects/${item.id_project}`; break
    }

    const response = await fetch(url, { method: 'DELETE' })
    if (!response.ok) throw new Error('Gagal menghapus data')

    // Refresh data
    await fetchTabData(type)
    showDeleteDialog.value = false
    toast.value.show('Data berhasil dihapus', 'success')
  } catch (error) {
    console.error('Error deleting item:', error)
    toast.value.show('Gagal menghapus data: ' + error.message, 'error')
  }
}
</script>
