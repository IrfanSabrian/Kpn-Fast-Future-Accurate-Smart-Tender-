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
            <div v-else-if="groupedProjects.length > 0" class="space-y-4">
              <div v-for="project in groupedProjects" :key="project.nama_project" class="p-6 rounded-xl bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-700 hover:border-blue-400 dark:hover:border-blue-600 transition-all shadow-sm hover:shadow-md">
                <!-- Project Header -->
                <div class="flex items-start justify-between mb-4">
                  <div class="flex-1">
                    <h4 class="text-xl font-bold text-gray-900 dark:text-white mb-2">{{ project.nama_project }}</h4>
                    <p class="text-sm text-gray-500 dark:text-gray-400">
                      <i class="fas fa-hashtag"></i> {{ project.id_project }}
                    </p>
                  </div>
                  <!-- Action Buttons -->
                  <div class="flex gap-2">
                    <button @click="openProjectDetailModal(project)" class="px-4 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 text-green-700 dark:text-green-300 rounded-lg transition-colors flex items-center gap-2 text-sm font-medium" title="Kelola Personil">
                      <i class="fas fa-users"></i>
                      <span>Kelola Personil</span>
                    </button>
                    <button @click="openEditProjectModal(project)" class="p-2 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:hover:bg-blue-800 text-blue-700 dark:text-blue-300 rounded-lg transition-colors" title="Edit Project">
                      <i class="fas fa-edit"></i>
                    </button>
                    <button @click="confirmDeleteProject(project)" class="p-2 bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 text-red-700 dark:text-red-300 rounded-lg transition-colors" title="Hapus Project">
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </div>

                <!-- Personil List -->
                <div class="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h5 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                    <i class="fas fa-users"></i>
                    <span>Tim Personil ({{ project.personil.length }})</span>
                  </h5>
                  <div v-if="project.personil.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <div v-for="person in project.personil" :key="person.nik" class="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div class="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                        <i class="fas fa-user text-blue-600 dark:text-blue-400"></i>
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="font-medium text-gray-900 dark:text-white truncate">{{ person.nama || 'Unknown' }}</p>
                        <p class="text-xs text-gray-500 dark:text-gray-400">NIK: {{ person.nik }}</p>
                      </div>
                    </div>
                  </div>
                  <div v-else class="text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                    <i class="fas fa-user-slash opacity-50"></i>
                    <p>Belum ada personil ditugaskan</p>
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
              <label class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">Jenis Akta *</label>
              <select 
                v-model="formData.jenis_akta" 
                required
                class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-gray-900 dark:text-white"
              >
                <option value="" disabled selected>-- Pilih Jenis Akta --</option>
                <option value="Pendirian">Pendirian</option>
                <option value="Perubahan">Perubahan</option>
              </select>
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
                placeholder="Masukkan Nama Project"
              >
            </div>
          </div>

        </form>
      </template>
      <template #footer>
        <button @click="closeModal" class="px-6 py-2.5 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium">
          Batal
        </button>
        <button @click="saveItem" :disabled="saving || !isFormValid" class="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-lg shadow-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed">
          {{ saving ? 'Menyimpan...' : (isEditing ? 'Update' : 'Simpan') }}
        </button>
      </template>
    </BaseModal>

    <!-- Project Detail Modal (Kelola Personil) -->
    <BaseModal :show="showProjectDetailModal" @close="closeProjectDetailModal" max-width="4xl">
      <template #header>
        <div>
          <h3 class="text-2xl font-bold text-gray-900 dark:text-white">Kelola Personil Project</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400 mt-1">{{ selectedProject?.nama_project }}</p>
        </div>
      </template>
      <template #body>
        <div v-if="selectedProject" class="space-y-6">
          <!-- Tambah Personil Section -->
          <div class="bg-blue-50 dark:bg-blue-900/20 border-2 border-blue-200 dark:border-blue-800 rounded-xl p-4">
            <h4 class="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <i class="fas fa-user-plus"></i>
              Tambah Personil ke Project
            </h4>
            <div class="flex gap-3">
              <select v-model="selectedNIK" class="flex-1 px-4 py-2.5 rounded-xl bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-gray-900 dark:text-white">
                <option value="" disabled>-- Pilih Personil --</option>
                <option v-for="p in availablePersonil" :key="p.nik" :value="p.nik">
                  {{ p.nama }} (NIK: {{ p.nik }})
                </option>
              </select>
              <button @click="addPersonilToProject" :disabled="!selectedNIK || addingPersonil" class="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
                <i class="fas fa-plus"></i>
                <span>{{ addingPersonil ? 'Menambah...' : 'Tambah' }}</span>
              </button>
            </div>
          </div>

          <!-- Daftar Personil di Project -->
          <div>
            <h4 class="font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <i class="fas fa-users"></i>
              Daftar Tim ({{ selectedProject.personil.length }} orang)
            </h4>
            <div v-if="selectedProject.personil.length > 0" class="space-y-2">
              <div v-for="person in selectedProject.personil" :key="person.nik" class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                <div class="flex items-center gap-3">
                  <div class="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                    <i class="fas fa-user text-blue-600 dark:text-blue-400"></i>
                  </div>
                  <div>
                    <p class="font-semibold text-gray-900 dark:text-white">{{ person.nama || 'Unknown' }}</p>
                    <p class="text-sm text-gray-500 dark:text-gray-400">NIK: {{ person.nik }}</p>
                  </div>
                </div>
                <button @click="removePersonilFromProject(person.nik)" class="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-lg transition-colors" title="Hapus dari project">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </div>
            <div v-else class="text-center py-8 text-gray-500 dark:text-gray-400">
              <i class="fas fa-user-slash text-3xl mb-2 opacity-50"></i>
              <p>Belum ada personil ditugaskan</p>
            </div>
          </div>
        </div>
      </template>
      <template #footer>
        <button @click="closeProjectDetailModal" class="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors">
          Tutup
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
const config = useRuntimeConfig()

// Data for each tab
const akta = ref([])
const pejabat = ref([])
const nib = ref([])
const pengalaman = ref([])
const projects = ref([])
const allPersonil = ref([])

// Project Detail Modal State
const showProjectDetailModal = ref(false)
const selectedProject = ref(null)
const selectedNIK = ref('')
const addingPersonil = ref(false)

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

const isFormValid = computed(() => {
  if (modalType.value === 'projects') {
    return !!formData.value.nama_project?.trim()
  }
  // Add other validations if needed
  return true
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
    const response = await fetch(`${config.public.apiBaseUrl}/companies/${companyId}`)
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
    const response = await fetch(`${config.public.apiBaseUrl}/companies/${companyId}/${tab}`)
    
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
    await fetchAllPersonil()
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
    let url = `${config.public.apiBaseUrl}`
    let method = isEditing.value ? 'PUT' : 'POST'
    
    // Construct URL based on type and action
    if (isEditing.value) {
      // Update URLs - menggunakan companies routing
      switch (type) {
        case 'akta': url += `/companies/akta/${formData.value.nomor_akta}`; break
        case 'pejabat': url += `/companies/pejabat/${formData.value.nik}`; break
        case 'nib': url += `/companies/nib/${encodeURIComponent(formData.value.nomor_nib)}`; break
        case 'pengalaman': url += `/companies/pengalaman/${encodeURIComponent(formData.value.nomor_kontrak)}`; break
        case 'projects': url += `/companies/projects/${formData.value.id_project}`; break
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
    let url = `${config.public.apiBaseUrl}`
    
    // Handle Project Group Deletion (Delete all assignments for this project)
    if (type === 'project_group') {
      const assignments = item.personil
      
      // Delete all assignments sequentially
      for (const person of assignments) {
        if (person.assignment_id) {
          await fetch(`${config.public.apiBaseUrl}/companies/projects/${person.assignment_id}`, {  
            method: 'DELETE' 
          })
        }
      }
      
      // Refresh data
      await fetchTabData('projects')
      showDeleteDialog.value = false
      toast.value.show('Project dan seluruh tim berhasil dihapus', 'success')
      return
    }

    // Construct Delete URL - menggunakan companies routing
    switch (type) {
      case 'akta': url += `/companies/akta/${item.nomor_akta}`; break
      case 'pejabat': url += `/companies/pejabat/${item.nik}`; break
      case 'nib': url += `/companies/nib/${encodeURIComponent(item.nomor_nib)}`; break
      case 'pengalaman': url += `/companies/pengalaman/${encodeURIComponent(item.nomor_kontrak)}`; break
      case 'projects': url += `/companies/projects/${item.id_project}`; break
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

// --- PROJECT-SPECIFIC FUNCTIONS ---

// Computed: Group projects by nama_project and attach personil info
const groupedProjects = computed(() => {
  // Backend now returns projects with nested personil array (NIKs only)
  // We need to map these NIKs to full personil data
  
  return projects.value.map(proj => {
    const personilWithDetails = (proj.personil || []).map(p => {
      const details = allPersonil.value.find(ap => ap.nik === p.nik)
      return {
        ...p,
        nama: details ? details.nama : 'Unknown',
        ...details // Spread all details
      }
    })

    return {
      ...proj,
      personil: personilWithDetails
    }
  })
})

// Computed: Available personil (not yet in current project)
const availablePersonil = computed(() => {
  if (!selectedProject.value) return allPersonil.value
  
  const assignedNIKs = selectedProject.value.personil.map(p => p.nik)
  return allPersonil.value.filter(p => !assignedNIKs.includes(p.nik))
})

// Fetch all personil
const fetchAllPersonil = async () => {
  try {
    const response = await fetch(`${config.public.apiBaseUrl}/personnel`)
    if (response.ok) {
      const json = await response.json()
      allPersonil.value = json.data || [] // Access .data property
    }
  } catch (error) {
    console.error('Error fetching personil:', error)
  }
}

// Open project detail modal
const openProjectDetailModal = (project) => {
  // Clone project to avoid direct mutation
  selectedProject.value = JSON.parse(JSON.stringify(project))
  selectedNIK.value = ''
  showProjectDetailModal.value = true
}

// Close project detail modal
const closeProjectDetailModal = () => {
  showProjectDetailModal.value = false
  selectedProject.value = null
  selectedNIK.value = ''
}

// Add personil to project
const addPersonilToProject = async () => {
  if (!selectedNIK.value || !selectedProject.value) return
  
  try {
    addingPersonil.value = true
    
    // Use new endpoint for adding personil
    const response = await fetch(`${config.public.apiBaseUrl}/companies/projects/${selectedProject.value.id_project}/personil`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id_perusahaan: companyId,
        nik: selectedNIK.value
      })
    })
    
    if (!response.ok) throw new Error('Gagal menambah personil')
    
    // Refresh projects data
    await fetchTabData('projects')
    
    // Update selected project in modal
    // We need to re-find the project from the updated list
    // Wait for next tick or just find it in the updated projects.value
    // Since fetchTabData updates projects.value, and groupedProjects is computed, 
    // we just need to find the project again.
    
    // Small delay to ensure computed updates? Usually not needed if reactive.
    // But let's find it from the computed list.
    setTimeout(() => {
      const updatedProject = groupedProjects.value.find(p => p.id_project === selectedProject.value.id_project)
      if (updatedProject) {
        selectedProject.value = JSON.parse(JSON.stringify(updatedProject))
      }
    }, 100)
    
    selectedNIK.value = ''
    toast.value.show('Personil berhasil ditambahkan ke project', 'success')
  } catch (error) {
    console.error('Error adding personil:', error)
    toast.value.show('Gagal menambah personil: ' + error.message, 'error')
  } finally {
    addingPersonil.value = false
  }
}

// Remove personil from project
const removePersonilFromProject = async (nik) => {
  if (!selectedProject.value) return
  
  try {
    // Use new endpoint for deleting personil
    const response = await fetch(`${config.public.apiBaseUrl}/companies/projects/${selectedProject.value.id_project}/personil/${nik}`, {
      method: 'DELETE'
    })
    
    if (!response.ok) throw new Error('Gagal menghapus personil')
    
    // Refresh projects data
    await fetchTabData('projects')
    
    // Update selected project
    setTimeout(() => {
      const updatedProject = groupedProjects.value.find(p => p.id_project === selectedProject.value.id_project)
      if (updatedProject) {
        selectedProject.value = JSON.parse(JSON.stringify(updatedProject))
      }
    }, 100)
    
    toast.value.show('Personil berhasil dihapus dari project', 'success')
  } catch (error) {
    console.error('Error removing personil:', error)
    toast.value.show('Gagal menghapus personil: ' + error.message, 'error')
  }
}

// Open edit project modal (edit nama project)
const openEditProjectModal = (project) => {
  modalType.value = 'projects'
  isEditing.value = true
  
  // For editing, we only need nama_project
  // We'll use the first entry's id_project to represent the whole group
  formData.value = {
    id_project: project.id_project,
    nama_project: project.nama_project
  }
  showModal.value = true
}

// Confirm delete project (will delete all personil assignments)
const confirmDeleteProject = (project) => {
  deleteType.value = 'project_group'
  itemToDelete.value = project
  showDeleteDialog.value = true
}


</script>

