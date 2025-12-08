<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans">
    <!-- Technical Header (Full Width) -->
    <header class="sticky top-0 z-50 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-200">
      <div class="max-w-[1800px] mx-auto px-4 md:px-6 h-16 md:h-24 flex items-center justify-between">
        <div class="flex items-center gap-4 md:gap-6 w-full">
          <button @click="router.push('/database/companies')" class="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-600 transition-colors border border-slate-100 dark:border-slate-700">
            <i class="fas fa-arrow-left"></i>
          </button>
          
          <div class="flex items-center gap-5 flex-1 min-w-0">
             <!-- Logo with better container -->
             <div class="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center p-1.5 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                <img v-if="shouldShowLogo(company)" :src="getCompanyLogoUrl(company)" class="w-full h-full object-contain" @error="(e) => handleImageError(e, company)" />
                <div v-else class="w-full h-full bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                    <span class="text-sm font-bold text-slate-400 font-mono">{{ company ? getInitials(company.nama_perusahaan) : '...' }}</span>
                </div>
             </div>
             
             <div class="flex-1 min-w-0">
               <div class="flex items-center gap-3 mb-1">
                 <h1 class="text-lg md:text-2xl font-black text-slate-900 dark:text-white leading-tight truncate">
                   {{ company?.nama_perusahaan || 'Loading Database...' }}
                 </h1>
                 <!-- Status Badge (Fixed Shape) -->
                  <span v-if="company?.status" class="hidden md:inline-flex items-center justify-center uppercase text-[10px] font-bold tracking-widest px-3 py-1 rounded-md border h-6" :class="company.status === 'Pusat' ? 'bg-blue-50 border-blue-100 text-blue-700 dark:bg-blue-900/20 dark:border-blue-800 dark:text-blue-300' : 'bg-slate-100 border-slate-200 text-slate-600'">
                   {{ company?.status }}
                 </span>
               </div>
               
               <div class="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
                 <div class="flex items-center gap-2 font-mono">
                    <span class="text-slate-300">ID:</span>
                    <span class="bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-700 dark:text-slate-300">{{ company?.id_perusahaan || 'ID-____' }}</span>
                 </div>
                 <div class="flex items-center gap-2" v-if="company?.npwp">
                    <i class="fas fa-id-card text-slate-300"></i>
                    <span>NPWP: {{ company.npwp }}</span>
                 </div>
               </div>
             </div>
          </div>
        </div>
      </div>
      
      <!-- Horizontal Navigation Tabs (Sticky under header) -->
      <div class="max-w-[1800px] mx-auto px-4 md:px-6 overflow-x-auto no-scrollbar mask-gradient bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
        <div class="flex items-center gap-1 md:gap-2 pb-0.5">
           <button
            v-for="tab in tabs"
            :key="tab.id"
            @click="activeTab = tab.id"
            class="relative px-4 py-3 text-sm font-bold transition-all whitespace-nowrap flex items-center gap-2 border-b-2"
            :class="activeTab === tab.id 
              ? 'text-blue-600 dark:text-blue-400 border-blue-600 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/10' 
              : 'text-slate-500 dark:text-slate-400 border-transparent hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/50'"
          >
             <i :class="tab.icon" class="text-base opacity-75"></i>
             {{ tab.label }}
             <span v-if="tab.count !== null && tab.count > 0" class="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
               {{ tab.count }}
             </span>
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content Area (Full Width) -->
    <main class="max-w-[1800px] mx-auto px-4 md:px-6 py-6 min-h-[60vh]">
      
      <!-- Tab Actions Bar (Except Overview) -->
      <div v-if="activeTab !== 'overview'" class="flex justify-between items-center mb-6 animate-fade-in">
        <div>
           <h2 class="text-xl font-bold text-slate-800 dark:text-white">{{ getTabLabel(activeTab) }} Data</h2>
           <p class="text-sm text-slate-500">Manage {{ getTabLabel(activeTab).toLowerCase() }} records for this company.</p>
        </div>
         <button
            @click="openAddModal(activeTab)"
            class="px-4 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold shadow hover:shadow-lg transition-all flex items-center gap-2"
          >
            <i class="fas fa-plus"></i>
            <span>Tambah Data</span>
          </button>
      </div>

      <!-- Loading State -->
      <div v-if="loadingTab" class="py-20 flex flex-col items-center justify-center text-slate-400">
         <div class="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
         <span class="text-xs font-mono animate-pulse">Syncing Database...</span>
      </div>

      <!-- Content Views -->
      <div v-else class="animate-fade-in-up">

        <!-- OVERVIEW TAB (Redesigned) -->
        <div v-if="activeTab === 'overview' && company" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
           
           <!-- Left Column: Company Info & KBLI (Wider: 7 cols) -->
           <div class="lg:col-span-7 space-y-6">
              
              <!-- Company Contacts Card -->
              <div class="relative overflow-hidden bg-white dark:bg-slate-800 rounded-2xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm group">
                 <div class="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <i class="fas fa-building text-9xl"></i>
                 </div>
                 
                 <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
                    <!-- Email -->
                    <div class="flex items-start gap-4">
                       <div class="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0 border border-blue-100 dark:border-blue-900/50">
                          <i class="fas fa-envelope"></i>
                       </div>
                       <div>
                          <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Email Perusahaan</p>
                          <p class="font-medium text-slate-700 dark:text-slate-200 break-all">{{ company.email || '-' }}</p>
                       </div>
                    </div>

                    <!-- Phone -->
                    <div class="flex items-start gap-4">
                       <div class="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0 border border-emerald-100 dark:border-emerald-900/50">
                          <i class="fas fa-phone"></i>
                       </div>
                       <div>
                          <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">No. Telepon</p>
                          <p class="font-medium text-slate-700 dark:text-slate-200">{{ company.no_telp || '-' }}</p>
                       </div>
                    </div>

                    <!-- Address -->
                    <div class="md:col-span-2 flex items-start gap-4">
                       <div class="w-10 h-10 rounded-full bg-violet-50 dark:bg-violet-900/20 flex items-center justify-center text-violet-600 dark:text-violet-400 shrink-0 border border-violet-100 dark:border-violet-900/50">
                          <i class="fas fa-map-marker-alt"></i>
                       </div>
                       <div>
                          <p class="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Alamat Lengkap</p>
                          <p class="font-medium text-slate-700 dark:text-slate-200 leading-relaxed">{{ company.alamat || '-' }}</p>
                       </div>
                    </div>
                 </div>
              </div>

              <!-- Kualifikasi KBLI Section (Scrollable with Sticky Header) -->
              <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm relative overflow-hidden flex flex-col h-[45vh] min-h-[250px]">
                 <!-- Sticky Header -->
                 <div class="sticky top-0 z-20 bg-white dark:bg-slate-800 px-6 py-4 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between shadow-sm">
                    <h3 class="text-xs font-bold text-slate-400 uppercase tracking-widest">KUALIFIKASI KBLI</h3>
                    <span v-if="subModules.kbli?.length" class="text-[10px] font-bold px-3 py-1 bg-slate-100 dark:bg-slate-700 text-slate-500 rounded-full">
                       {{ subModules.kbli.length }} ITEMS
                    </span>
                 </div>
                 
                 <!-- Scrollable Content -->
                 <div class="flex-1 overflow-y-auto custom-scrollbar p-6 bg-slate-50/30 dark:bg-slate-900/10">
                    <div v-if="subModules.kbli?.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
                        <div v-for="kbli in subModules.kbli" :key="kbli.id_perusahaan_kbli" 
                             class="group relative p-4 rounded-xl border border-slate-100 dark:border-slate-700/50 bg-white dark:bg-slate-800 hover:shadow-md hover:border-blue-200 dark:hover:border-blue-500/30 transition-all duration-300">
                             
                             <!-- Active/Primary Indicator -->
                             <div v-if="kbli.is_primary === 'true'" class="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full border-2 border-white dark:border-slate-800 shadow-sm" title="KBLI Utama"></div>

                             <div class="flex items-start gap-3">
                                <div class="px-2 py-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded text-[10px] font-mono font-bold shrink-0 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-colors">
                                   {{ kbli.kode_kbli }}
                                </div>
                                <div class="flex-1 min-w-0">
                                   <h4 class="text-xs font-bold text-slate-700 dark:text-slate-200 leading-tight mb-1 group-hover:text-blue-700 dark:group-hover:text-blue-400 transition-colors line-clamp-2" :title="kbli.nama_klasifikasi">
                                      {{ kbli.nama_klasifikasi || 'Klasifikasi KBLI' }}
                                   </h4>
                                   <div v-if="kbli.is_primary === 'true'" class="inline-flex items-center gap-1 mt-1">
                                      <i class="fas fa-star text-[8px] text-amber-400"></i>
                                      <span class="text-[9px] font-bold text-amber-600 dark:text-amber-500 uppercase tracking-wider">Primary</span>
                                   </div>
                                </div>
                             </div>
                        </div>
                    </div>
                    <div v-else class="flex flex-col items-center justify-center py-10 text-center border-2 border-dashed border-slate-100 dark:border-slate-700 rounded-xl bg-slate-50/50 dark:bg-slate-800/50">
                        <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-3">
                            <i class="fas fa-tags text-slate-300 dark:text-slate-500 text-xl"></i>
                        </div>
                        <p class="text-slate-500 dark:text-slate-400 text-sm font-medium">Belum ada data KBLI terdaftar.</p>
                    </div>
                 </div>
              </div>
           </div>

           <!-- Right Column: Profile Document Preview (Adjusted Height) -->
           <div class="lg:col-span-5 flex flex-col h-full">
              <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex-1 flex flex-col overflow-hidden h-[45vh] min-h-[300px] sticky top-24">
                 <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 shrink-0">
                    <h3 class="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 text-sm">
                       <i class="fas fa-file-pdf text-red-500"></i>
                       Company Profile
                    </h3>
                    <div class="flex gap-2">
                       <a v-if="company.profil_perusahaan_url" :href="company.profil_perusahaan_url" target="_blank" class="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:border-blue-400 transition-colors">
                          <i class="fas fa-external-link-alt mr-1"></i> Open New Tab
                       </a>
                    </div>
                 </div>
                 
                 <div class="flex-1 bg-slate-100 dark:bg-slate-900 relative">
                    <iframe 
                       v-if="company.profil_perusahaan_url" 
                       :src="getPreviewUrl(company.profil_perusahaan_url)" 
                       class="w-full h-full absolute inset-0 border-none"
                    ></iframe>
                    <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-400">
                       <i class="fas fa-file-invoice text-4xl mb-4 opacity-20"></i>
                       <p class="text-sm">Document not available</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>
        
        <!-- GENERIC EMPTY STATE (Except Overview) -->
        <div v-else-if="activeTab !== 'overview' && (!getTabData(activeTab) || getTabData(activeTab).length === 0)" class="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center text-slate-400 bg-slate-50/50 dark:bg-slate-800/20">
            <i :class="getTabIcon(activeTab)" class="text-4xl mb-3 opacity-30"></i>
            <p class="text-sm font-medium">Belum ada data {{ getTabLabel(activeTab) }}.</p>
            <button @click="openAddModal(activeTab)" class="mt-4 text-blue-600 font-bold text-sm hover:underline">
               + Tambah Data Sekarang
            </button>
        </div>

        <!-- 1. AKTA TAB (Redesigned with PDF Preview) -->
        <div v-else-if="activeTab === 'akta'" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <!-- Left: Data List (7 cols) -->
           <div class="lg:col-span-7 space-y-4">
              <!-- Empty State -->
              <div v-if="!subModules.akta?.length" class="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center text-slate-400 bg-slate-50/50 dark:bg-slate-800/20">
                  <i class="fas fa-file-contract text-4xl mb-3 opacity-30"></i>
                  <p class="text-sm font-medium">Belum ada data Akta.</p>
                  <button @click="openAddModal('akta')" class="mt-4 text-blue-600 font-bold text-sm hover:underline">
                     + Tambah Data Sekarang
                  </button>
              </div>

              <!-- Data Cards -->
              <div v-else class="space-y-3">
                 <div v-for="item in subModules.akta" :key="item.id_akta" 
                      @click="selectItem('akta', item)"
                      class="bg-white dark:bg-slate-800 rounded-xl border-2 p-5 cursor-pointer transition-all group"
                      :class="selectedItems.akta?.id_akta === item.id_akta 
                         ? 'border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-500/20' 
                         : 'border-slate-200 dark:border-slate-700 hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md'">
                    
                    <div class="flex items-start justify-between mb-4">
                       <div class="flex items-center gap-4">
                          <div class="w-12 h-12 rounded-xl bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center shrink-0">
                             <i class="fas fa-file-contract text-lg"></i>
                          </div>
                          <div>
                             <h4 class="font-bold text-slate-800 dark:text-white text-lg">Akta {{ item.jenis_akta }}</h4>
                             <p class="text-sm text-slate-500 font-mono">No: {{ item.nomor_akta }}</p>
                          </div>
                       </div>
                       
                       <div class="flex gap-2">
                          <button @click.stop="openEditModal('akta', item)" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-blue-600 transition-colors">
                             <i class="fas fa-pen text-sm"></i>
                          </button>
                          <button @click.stop="openDeleteConfirm('akta', item)" class="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg text-slate-400 hover:text-red-600 transition-colors">
                             <i class="fas fa-trash text-sm"></i>
                          </button>
                       </div>
                    </div>

                    <div class="grid grid-cols-2 gap-4 text-sm">
                       <div class="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-700 pb-2">
                          <span class="text-slate-500">Tanggal:</span> 
                          <span class="font-medium text-slate-700 dark:text-slate-200">{{ item.tanggal_akta || '-' }}</span>
                       </div>
                       <div class="flex justify-between border-b border-dashed border-slate-100 dark:border-slate-700 pb-2">
                          <span class="text-slate-500">Notaris:</span> 
                          <span class="font-medium text-slate-700 dark:text-slate-200 truncate max-w-[150px]" :title="item.notaris">{{ item.notaris || '-' }}</span>
                       </div>
                    </div>

                    <!-- Selection Indicator -->
                    <div v-if="selectedItems.akta?.id_akta === item.id_akta" class="mt-3 pt-3 border-t border-blue-100 dark:border-blue-900/30">
                       <div class="flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold">
                          <i class="fas fa-check-circle"></i>
                          <span>DIPILIH UNTUK PREVIEW</span>
                       </div>
                    </div>
                 </div>
              </div>
           </div>

           <!-- Right: PDF Preview (5 cols) -->
           <div class="lg:col-span-5">
              <div class="sticky top-24 bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden h-[calc(100vh-150px)] flex flex-col">
                 <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50">
                    <h3 class="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 text-sm">
                       <i class="fas fa-file-pdf text-red-500"></i>
                       Dokumen Akta
                    </h3>
                    <p v-if="selectedItems.akta" class="text-xs text-slate-500 mt-1">{{ selectedItems.akta.jenis_akta }} - {{ selectedItems.akta.nomor_akta }}</p>
                 </div>
                 
                 <div class="flex-1 bg-slate-100 dark:bg-slate-900 relative">
                    <iframe 
                       v-if="getSelectedDocUrl('akta')" 
                       :src="getPreviewUrl(getSelectedDocUrl('akta'))" 
                       class="w-full h-full absolute inset-0 border-none"
                    ></iframe>
                    <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-400">
                       <i class="fas fa-file-invoice text-4xl mb-4 opacity-20"></i>
                       <p class="text-sm">{{ selectedItems.akta ? 'Dokumen tidak tersedia' : 'Pilih item untuk preview' }}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <!-- 2. PEJABAT TAB (Renamed from Pengurus) -->
        <div v-if="activeTab === 'pejabat' && subModules.pejabat?.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
           <div v-for="item in subModules.pejabat" :key="item.id_pejabat" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:border-cyan-400 transition-all group relative overflow-hidden">
              <div class="absolute top-0 right-0 p-4 opacity-5"><i class="fas fa-user-tie text-6xl"></i></div>
              <div class="flex items-center gap-4 mb-4 relative z-10">
                 <div class="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-400 ring-2 ring-white dark:ring-slate-800 shadow-sm">
                    {{ getInitials(item.nama_lengkap || 'Personil') }}
                 </div>
                 <div>
                    <div class="text-[10px] font-bold text-cyan-600 uppercase bg-cyan-50 dark:bg-cyan-900/20 px-2 py-0.5 rounded inline-block mb-1">{{ item.jenis_jabatan || item.jabatan_custom || 'JABATAN' }}</div>
                    <h4 class="font-bold text-slate-800 dark:text-white truncate max-w-[150px]" title="Nama Personil">{{ item.id_personel || 'NAMA PERSONIL' }}</h4>
                 </div>
              </div>
              <div class="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 flex gap-2 relative z-10">
                 <button class="flex-1 py-1.5 border border-slate-200 rounded text-xs font-bold text-slate-500 hover:bg-slate-50">Edit Data</button>
              </div>
           </div>
        </div>

        <!-- 3. PAJAK TAB (Grouped) -->
        <div v-if="activeTab === 'pajak'" class="space-y-8">
           <!-- NPWP Card -->
           <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
              <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <i class="fas fa-id-card"></i> IDENTITAS PAJAK (NPWP)
              </h3>
              <div v-if="subModules.npwp && subModules.npwp.length > 0" class="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div v-for="item in subModules.npwp" :key="item.id_npwp_perusahaan" class="bg-slate-50 dark:bg-slate-900 rounded-xl p-5 border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-6">
                    <div class="flex-1 space-y-2">
                       <div><label class="text-xs text-slate-400 font-bold">NOMOR NPWP</label> <div class="font-mono font-bold text-lg">{{ item.nomor_npwp }}</div></div>
                       <div><label class="text-xs text-slate-400 font-bold">NAMA WAJIB PAJAK</label> <div class="font-medium">{{ item.nama_wajib_pajak }}</div></div>
                       <div><label class="text-xs text-slate-400 font-bold">ALAMAT TERDAFTAR</label> <div class="text-sm text-slate-600 dark:text-slate-400">{{ item.alamat_npwp }}</div></div>
                    </div>
                    <div>
                       <a v-if="item.npwp_perusahaan_url" :href="item.npwp_perusahaan_url" target="_blank" class="w-full md:w-auto h-full flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-800 rounded-lg border-2 border-dashed border-slate-300 hover:border-blue-500 hover:text-blue-600 transition-colors cursor-pointer group">
                          <i class="fas fa-file-pdf text-3xl mb-2 text-slate-300 group-hover:text-blue-500"></i>
                          <span class="text-xs font-bold">Lihat Kartu NPWP</span>
                       </a>
                    </div>
                 </div>
              </div>
              <div v-else class="text-slate-400 text-sm italic py-4">Data NPWP belum tersedia.</div>
           </div>

           <!-- PKP & KSWP Grid -->
           <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- PKP -->
              <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                 <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <i class="fas fa-stamp"></i> PENGUSAHA KENA PAJAK (PKP)
                 </h3>
                 <div v-if="subModules.pkp && subModules.pkp.length > 0">
                    <div v-for="item in subModules.pkp" :key="item.id_pkp" class="space-y-4">
                       <div class="flex justify-between items-center bg-green-50 dark:bg-green-900/20 p-3 rounded-lg border border-green-100 dark:border-green-900">
                          <span class="text-green-800 dark:text-green-300 font-bold text-sm"><i class="fas fa-check-circle mr-2"></i>Status: {{ item.status }}</span>
                          <span class="text-xs font-mono">{{ item.tanggal_pengukuhan }}</span>
                       </div>
                       <div class="space-y-2 text-sm">
                          <div class="flex justify-between border-b border-dashed border-slate-100 pb-1"><span>Nomor PKP:</span> <span class="font-mono font-bold">{{ item.nomor_pkp }}</span></div>
                       </div>
                       <a v-if="item.url_pkp" :href="item.url_pkp" target="_blank" class="block w-full py-2 bg-slate-100 dark:bg-slate-700 text-center rounded text-xs font-bold hover:bg-slate-200 transition-colors">Open Document PKP</a>
                    </div>
                 </div>
                 <div v-else class="text-slate-400 text-sm italic py-4">Data PKP belum tersedia.</div>
              </div>

              <!-- KSWP -->
              <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                 <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <i class="fas fa-check-double"></i> STATUS KSWP
                 </h3>
                 <div v-if="subModules.kswp && subModules.kswp.length > 0">
                    <div v-for="item in subModules.kswp" :key="item.id_kswp" class="space-y-4">
                       <div class="text-center py-6">
                          <div class="inline-block px-4 py-1 rounded-full bg-blue-100 text-blue-800 font-bold text-sm mb-2 uppercase">{{ item.status_kswp || 'VALID' }}</div>
                          <p class="text-xs text-slate-400">Konfirmasi Status Wajib Pajak</p>
                       </div>
                       <a v-if="item.kswp_url" :href="item.kswp_url" target="_blank" class="block w-full py-2 bg-slate-100 dark:bg-slate-700 text-center rounded text-xs font-bold hover:bg-slate-200 transition-colors">Lihat Bukti KSWP</a>
                    </div>
                 </div>
                 <div v-else class="text-slate-400 text-sm italic py-4">Data KSWP belum tersedia.</div>
              </div>
           </div>
           
           <!-- SPT List -->
           <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                 <h3 class="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <i class="fas fa-history"></i> RIWAYAT PELAPORAN SPT
                 </h3>
                 <div v-if="subModules.spt && subModules.spt.length > 0" class="overflow-hidden bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-700">
                    <table class="w-full text-sm text-left">
                       <thead class="bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 uppercase font-bold">
                          <tr>
                             <th class="px-4 py-3">Tahun</th>
                             <th class="px-4 py-3">Jenis</th>
                             <th class="px-4 py-3">Status</th>
                             <th class="px-4 py-3">Tanda Terima</th>
                             <th class="px-4 py-3 text-right">Action</th>
                          </tr>
                       </thead>
                       <tbody class="divide-y divide-slate-100 dark:divide-slate-800">
                          <tr v-for="item in subModules.spt" :key="item.id_spt" class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
                             <td class="px-4 py-3 font-bold">{{ item.tahun_pajak }}</td>
                             <td class="px-4 py-3">{{ item.jenis_spt }}</td>
                             <td class="px-4 py-3"><span class="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase">{{ item.status_spt }}</span></td>
                             <td class="px-4 py-3 font-mono text-xs">{{ item.nomor_tanda_terima }}</td>
                             <td class="px-4 py-3 text-right">
                                <a v-if="item.spt_url" :href="item.spt_url" target="_blank" class="text-blue-600 hover:underline text-xs font-bold">View</a>
                             </td>
                          </tr>
                       </tbody>
                    </table>
                 </div>
                  <div v-else class="text-slate-400 text-sm italic py-4">Belum ada riwayat lapor SPT.</div>
           </div>
        </div>

        <!-- 4. PENGALAMAN / KONTRAK TAB -->
        <div v-if="activeTab === 'kontrak'" class="space-y-4">
           <!-- Card List Style for Contracts -->
           <div v-if="subModules.kontrak && subModules.kontrak.length > 0" class="space-y-4">
              <div v-for="item in subModules.kontrak" :key="item.id_kontrak" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:border-blue-400 transition-all group">
                 <div class="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                    <div class="flex-1">
                       <div class="flex items-center gap-2 mb-2">
                          <span class="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase rounded border border-blue-100 dark:border-blue-800">{{ item.bidang_pekerjaan }}</span>
                          <span class="text-xs text-slate-400 font-bold">• {{ item.lokasi }}</span>
                       </div>
                       <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-2 leading-tight">{{ item.nama_pekerjaan }}</h3>
                       <div class="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
                          <i class="fas fa-building text-slate-300"></i>
                          <span>{{ item.nama_pemberi_tugas }}</span>
                       </div>
                    </div>
                    <div class="text-right">
                       <div class="text-[10px] font-bold text-slate-400 uppercase">NILAI KONTRAK</div>
                       <div class="text-lg font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          IDR {{ Number(item.nilai_kontrak).toLocaleString('id-ID') }}
                       </div>
                    </div>
                 </div>
                 
                 <div class="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-3 text-xs flex flex-wrap gap-4 border border-slate-100 dark:border-slate-800">
                    <div class="flex flex-col"><span class="text-slate-400 font-bold text-[10px]">NO. KONTRAK</span> <span class="font-mono">{{ item.nomor_kontrak }}</span></div>
                    <div class="flex flex-col"><span class="text-slate-400 font-bold text-[10px]">TGL KONTRAK</span> <span class="font-medium">{{ item.tanggal_kontrak }}</span></div>
                    <div class="flex flex-col"><span class="text-slate-400 font-bold text-[10px]">TGL SELESAI</span> <span class="font-medium">{{ item.tanggal_selesai_kontrak }}</span></div>
                 </div>
                 
                 <div class="mt-4 flex gap-3">
                    <a v-if="item.kontrak_url" :href="item.kontrak_url" target="_blank" class="px-4 py-2 bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 rounded-lg text-xs font-bold transition-colors flex items-center gap-2">
                       <i class="fas fa-file-contract"></i> Lihat Dokumen Kontrak
                    </a>
                 </div>
              </div>
           </div>
           <div v-else class="text-center py-12 bg-slate-50 rounded-xl border border-dashed border-slate-200">
              <i class="fas fa-briefcase text-4xl text-slate-300 mb-3"></i>
              <p class="text-slate-500 font-medium">Belum ada data pengalaman proyek.</p>
           </div>
        </div>

        <!-- 5. OTHER TABS (NIB, SBU, KTA, etc) - Generic View -->
        <div v-if="['nib', 'sbu', 'kta', 'sertifikat'].includes(activeTab)" class="space-y-4">
            <div v-for="(item, idx) in subModules[activeTab] || []" :key="idx" class="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-5 flex flex-col md:flex-row md:items-center gap-6 hover:shadow-md transition-all">
                <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-700 dark:to-slate-800 border border-slate-200 dark:border-slate-600 flex items-center justify-center flex-shrink-0 text-slate-600 dark:text-slate-300 shadow-sm">
                   <i :class="getTabIcon(activeTab)" class="text-2xl opacity-75"></i>
                </div>
                <div class="flex-1 min-w-0">
                   <div class="flex items-center gap-2 mb-1">
                      <span class="px-2 py-0.5 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-bold uppercase tracking-wider text-slate-500">{{ getTabLabel(activeTab) }}</span>
                   </div>
                   <h4 class="text-lg font-bold text-slate-900 dark:text-white font-mono tracking-tight">
                      {{ item.nomor_nib || item.nomor_registrasi_lpjk || item.nomor_anggota || item.nomor_sertifikat || '#'+(idx+1) }}
                   </h4>
                   <p class="text-sm text-slate-500 mt-1 truncate" v-if="item.kualifikasi || item.asosiasi">
                      {{ item.kualifikasi || '' }} {{ item.asosiasi ? '• ' + item.asosiasi : '' }}
                   </p>
                </div>
                <div class="flex items-center gap-3">
                   <a v-if="getDocumentUrl(item)" :href="getDocumentUrl(item)" target="_blank" class="px-4 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 text-xs font-bold rounded-lg hover:bg-blue-100 hover:text-blue-700 transition-colors">
                      <i class="fas fa-external-link-alt mr-1"></i> View Document
                   </a>
                </div>
            </div>
             <div v-if="(!subModules[activeTab] || subModules[activeTab].length === 0)" class="text-center py-10 text-slate-400 italic">Data tidak ditemukan.</div>
        </div>

      </div>
    </main>

    <!-- Modals (Simplified for Layout Demo) -->
  </div>
</template>

<script setup>
import BaseModal from '~/components/BaseModal.vue'
import BaseToast from '~/components/BaseToast.vue'
import FormInput from '~/components/FormInput.vue'

definePageMeta({ layout: 'dashboard' })

const route = useRoute()
const router = useRouter()
const config = useRuntimeConfig()
const apiBaseUrl = config.public.apiBaseUrl
const companyId = route.params.id

// State
const company = ref(null)
const subModules = ref({
   akta: [], pejabat: [], nib: [], sbu: [], kta: [], sertifikat: [],
   npwp: [], kswp: [], spt: [], pkp: [], kontrak: [], kbli: []
})
const activeTab = ref('overview')
const loadingTab = ref(false)
const imageErrors = ref({})

// Selected items for PDF preview (per tab)
const selectedItems = ref({
   akta: null,
   nib: null,
   sbu: null,
   kta: null,
   sertifikat: null,
   kontrak: null,
   spt: null
})

// Tabs Configuration (Re-ordered & Renamed)
const tabs = [
  { id: 'overview', label: 'Overview', icon: 'fas fa-th-large', count: null },
  { id: 'pejabat', label: 'Pejabat', icon: 'fas fa-user-tie', count: 0 }, // Renamed from Pengurus
  { id: 'akta', label: 'Akta', icon: 'fas fa-file-contract', count: 0 },
  { id: 'nib', label: 'NIB', icon: 'fas fa-id-badge', count: 0 },
  { id: 'sbu', label: 'SBU', icon: 'fas fa-certificate', count: 0 },
  { id: 'kta', label: 'KTA', icon: 'fas fa-id-card-alt', count: 0 },
  { id: 'sertifikat', label: 'Sertifikat', icon: 'fas fa-award', count: 0 },
  { id: 'pajak', label: 'Data Pajak', icon: 'fas fa-wallet', count: 0 }, // Grouped
  { id: 'kontrak', label: 'Pengalaman', icon: 'fas fa-briefcase', count: 0 }, // New
]

// Helper Functions
const getInitials = (name) => {
  if (!name) return '?'
  const words = name.replace(/[^\w\s]/gi, '').split(/\s+/).filter(w => w.length > 0)
  if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase()
  return name.slice(0, 2).toUpperCase()
}

// === LOGO HANDLER (Complete Logic) ===
const getCompanyLogoUrl = (c) => {
  // PRIORITY 1: Local
  if (c?.lokal_logo) return c.lokal_logo.startsWith('/') ? c.lokal_logo : '/' + c.lokal_logo
  // PRIORITY 2: Drive
  const url = c?.logo_perusahaan || c?.logo_url
  if (url?.includes('drive.google.com')) {
    let id = ''
    if (url.includes('/d/')) id = url.split('/d/')[1].split('/')[0]
    else if (url.includes('id=')) id = url.split('id=')[1].split('&')[0]
    if (id) return `https://drive.google.com/uc?export=download&id=${id}`
  }
  return url || ''
}

const shouldShowLogo = (c) => {
  if (imageErrors.value[c?.id_perusahaan]) return true // Let fallback handle it
  return !!(c?.lokal_logo || c?.logo_perusahaan || c?.logo_url)
}

const handleImageError = (e, c) => {
  const currentSrc = e.target.src
  if (currentSrc.includes('drive.google.com')) {
     e.target.src = `/assets/logos/${c.id_perusahaan}.svg`
     return
  }
  if (!currentSrc.includes(`${c.id_perusahaan}.svg`)) {
     e.target.src = `/assets/logos/${c.id_perusahaan}.svg`
     return
  }
  imageErrors.value[c.id_perusahaan] = true
}

const getPreviewUrl = (url) => {
   if (!url) return ''
   if (url.includes('drive.google.com')) {
      // Convert view/edit link to preview link for iframe
      return url.replace(/\/view.*$/, '/preview')
   }
   return url
}

const getTabLabel = (id) => tabs.find(t => t.id === id)?.label || 'Data'
const getTabIcon = (id) => tabs.find(t => t.id === id)?.icon || 'fas fa-folder'
const getTabData = (tabId) => subModules.value[tabId] || []

// Get document URL from item (handles different field names per module)
const getDocumentUrl = (item, tabId) => {
   const urlMap = {
      akta: item.akta_perusahaan_url,
      nib: item.nib_url,
      sbu: item.sbu_url,
      kta: item.kta_url,
      sertifikat: item.sertifikat_standar_url,
      kontrak: item.url_kontrak || item.url_dokumen,
      spt: item.spt_url
   }
   return urlMap[tabId] || item.url_dokumen || ''
}

// Select item for PDF preview
const selectItem = (tabId, item) => {
   selectedItems.value[tabId] = item
}

// Get selected item's document URL
const getSelectedDocUrl = (tabId) => {
   const item = selectedItems.value[tabId]
   return item ? getDocumentUrl(item, tabId) : ''
}

// Fetch Logic
const fetchCompanyDetail = async () => {
   loadingTab.value = true
   try {
      // Fetch company detail and KBLI in parallel
      const [companyRes, kbliRes] = await Promise.all([
         fetch(`${apiBaseUrl}/companies/${companyId}`),
         fetch(`${apiBaseUrl}/kbli/company/${companyId}`)
      ])
      
      // Process company data
      if(companyRes.ok) {
         const result = await companyRes.json()
         if(result.success) {
            company.value = result.data
            // Assign sub-modules if backend provides them (new logic)
            if (result.data.relations) {
               subModules.value = result.data.relations
               
               // Update tab counts
               const rel = result.data.relations
               tabs.find(t => t.id === 'akta').count = rel.akta?.length || 0
               tabs.find(t => t.id === 'pejabat').count = rel.pejabat?.length || 0
               tabs.find(t => t.id === 'nib').count = rel.nib?.length || 0
               tabs.find(t => t.id === 'sbu').count = rel.sbu?.length || 0
               tabs.find(t => t.id === 'kta').count = rel.kta?.length || 0
               tabs.find(t => t.id === 'sertifikat').count = rel.sertifikat?.length || 0
               tabs.find(t => t.id === 'kontrak').count = rel.kontrak?.length || 0
               // Group tax count
               const taxCount = (rel.npwp?.length||0) + (rel.pkp?.length||0) + (rel.kswp?.length||0)
               tabs.find(t => t.id === 'pajak').count = taxCount
               
               // Auto-select first item for each tab (for PDF preview)
               if (rel.akta?.length) selectedItems.value.akta = rel.akta[0]
               if (rel.nib?.length) selectedItems.value.nib = rel.nib[0]
               if (rel.sbu?.length) selectedItems.value.sbu = rel.sbu[0]
               if (rel.kta?.length) selectedItems.value.kta = rel.kta[0]
               if (rel.sertifikat?.length) selectedItems.value.sertifikat = rel.sertifikat[0]
               if (rel.kontrak?.length) selectedItems.value.kontrak = rel.kontrak[0]
               if (rel.spt?.length) selectedItems.value.spt = rel.spt[0]
            }
         } else {
             company.value = result // Fallback to old format
         }
      }
      
      // Process KBLI data separately (more reliable)
      if(kbliRes.ok) {
         const kbliResult = await kbliRes.json()
         if(kbliResult.success && kbliResult.data) {
            subModules.value.kbli = kbliResult.data
            console.log('✅ KBLI Data loaded:', kbliResult.data.length, 'items')
         }
      }
      
   } catch(e) {
      console.error(e)
   } finally {
      loadingTab.value = false
   }
}

// Placeholder Actions
const openAddModal = (tab) => { console.log('Add', tab) }

onMounted(() => {
   fetchCompanyDetail()
})
</script>

<style scoped>
.no-scrollbar::-webkit-scrollbar { display: none; }
.no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
.mask-gradient {
  mask-image: linear-gradient(to right, transparent, black 20px, black 90%, transparent);
}
</style>
