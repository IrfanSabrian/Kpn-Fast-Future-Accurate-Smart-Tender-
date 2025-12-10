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
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content Area (Full Width) -->
    <main class="max-w-[1800px] mx-auto px-4 md:px-6 py-6 min-h-[60vh]">
      

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
        <div v-else-if="activeTab !== 'overview' && activeTab !== 'pajak' && (!getTabData(activeTab) || getTabData(activeTab).length === 0)" class="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center text-slate-400 bg-slate-50/50 dark:bg-slate-800/20">
            <i :class="getTabIcon(activeTab)" class="text-4xl mb-3 opacity-30"></i>
            <p class="text-sm font-medium">Belum ada data {{ getTabLabel(activeTab) }}.</p>
        </div>

        <!-- 1. AKTA TAB (Redesigned with Complete Info) -->
        <div v-else-if="activeTab === 'akta'" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <!-- Left: Data List (7 cols) -->
           <div class="lg:col-span-7 space-y-4">
              <!-- Data Cards -->
              <div v-if="subModules.akta?.length > 0" class="space-y-3">
                 <div v-for="item in subModules.akta" :key="item.id_akta" 
                      @click="selectItem('akta', item)"
                      class="bg-white dark:bg-slate-800 rounded-xl border-2 p-6 cursor-pointer transition-all group hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md"
                      :class="selectedItems.akta?.id_akta === item.id_akta 
                         ? 'border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-500/20' 
                         : 'border-slate-200 dark:border-slate-700'">
                    
                    <div class="flex justify-between items-start mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
                        <div class="flex items-center gap-3">
                             <div class="w-10 h-10 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 flex items-center justify-center shrink-0">
                                 <i class="fas fa-file-contract"></i>
                             </div>
                             <div>
                                 <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">JENIS AKTA</div>
                                 <h4 class="font-bold text-slate-800 dark:text-white text-lg leading-none mt-1">{{ item.jenis_akta }}</h4>
                             </div>
                        </div>
                    </div>

                    <div class="space-y-0.5 mt-4">
                       <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700">
                           <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">NOMOR AKTA</div>
                           <div class="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">{{ item.nomor_akta }}</div>
                       </div>
                       
                       <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700">
                           <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">TANGGAL</div>
                           <div class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ item.tanggal_akta || '-' }}</div>
                       </div>
                       
                       <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700">
                           <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">NOTARIS</div>
                           <div class="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">{{ item.notaris || '-' }}</div>
                       </div>
                    </div>

                    <div v-if="selectedItems.akta?.id_akta === item.id_akta" class="mt-4 pt-3 border-t border-blue-100 dark:border-blue-900/30 flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold">
                       <i class="fas fa-check-circle"></i> <span>PREVIEWING DOCUMENT</span>
                    </div>
                 </div>
              </div>

               <!-- Empty State -->
               <div v-else class="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center text-slate-400 bg-slate-50/50 dark:bg-slate-800/20">
                   <i class="fas fa-file-contract text-4xl mb-3 opacity-30"></i>
                   <p class="text-sm font-medium">Belum ada data Akta.</p>
               </div>
           </div>

           <!-- Right: PDF Preview (5 cols) -->
           <div class="lg:col-span-5 flex flex-col h-full">
              <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex-1 flex flex-col overflow-hidden h-[calc(100vh-150px)] min-h-[500px] sticky top-24">
                 <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 shrink-0">
                    <div>
                        <h3 class="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 text-sm">
                           <i class="fas fa-file-pdf text-red-500"></i>
                           Dokumen Akta
                        </h3>
                        <p v-if="selectedItems.akta" class="text-xs text-slate-500 mt-1">{{ selectedItems.akta.jenis_akta }} - {{ selectedItems.akta.nomor_akta }}</p>
                    </div>
                    <div class="flex gap-2" v-if="getSelectedDocUrl('akta')">
                       <a :href="getSelectedDocUrl('akta')" target="_blank" class="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:border-blue-400 transition-colors">
                          <i class="fas fa-external-link-alt mr-1"></i> Open New Tab
                       </a>
                    </div>
                 </div>
                 
                 <div class="flex-1 bg-slate-100 dark:bg-slate-900 relative">
                    <iframe 
                       v-if="getSelectedDocUrl('akta')" 
                       :key="getSelectedDocUrl('akta')"
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
                    {{ getInitials(item.nama_lengkap || 'Personel') }}
                 </div>
                 <div class="flex-1 min-w-0">
                    <div class="text-[10px] font-bold text-cyan-600 uppercase bg-cyan-50 dark:bg-cyan-900/20 px-2 py-0.5 rounded inline-block mb-1">{{ item.jenis_jabatan || item.jabatan_custom || 'JABATAN' }}</div>
                    <h4 class="font-bold text-slate-800 dark:text-white truncate" :title="item.nama_lengkap">{{ item.nama_lengkap || 'NAMA PERSONEL' }}</h4>
                 </div>
              </div>

           </div>
        </div>

        <!-- 3. PAJAK TAB (Style Dashboard) -->
        <!-- 3. PAJAK TAB (Compact Style) -->
        <div v-if="activeTab === 'pajak'" class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <!-- Left: NPWP & PKP -->
            <div class="space-y-6">
                 <!-- NPWP Compact -->
                 <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                      <div class="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
                          <h3 class="font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-2"><i class="fas fa-id-card text-blue-500"></i> NPWP Perusahaan</h3>
                          <button v-if="subModules.npwp?.[0]?.npwp_perusahaan_url" @click="openNpwpModal(subModules.npwp[0])" class="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100 transition-colors"><i class="fas fa-file-pdf"></i> View</button>
                      </div>
                      <div v-if="subModules.npwp?.length > 0" class="space-y-2">
                           <div v-for="item in subModules.npwp" :key="item.id_npwp_perusahaan">
                               <div class="grid grid-cols-[140px_1fr] gap-2 py-1 border-b border-dashed border-slate-50 dark:border-slate-700">
                                   <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">NOMOR NPWP</div>
                                   <div class="text-sm font-mono font-bold text-slate-800 dark:text-white">{{ item.nomor_npwp }}</div>
                               </div>
                               <div class="grid grid-cols-[140px_1fr] gap-2 py-1 border-b border-dashed border-slate-50 dark:border-slate-700">
                                   <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">NAMA WAJIB PAJAK</div>
                                   <div class="text-xs font-bold text-slate-700 dark:text-slate-200">{{ item.nama_wajib_pajak }}</div>
                               </div>
                               <div class="grid grid-cols-[140px_1fr] gap-2 py-1 border-b border-dashed border-slate-50 dark:border-slate-700">
                                   <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">ALAMAT</div>
                                   <div class="text-xs text-slate-600 dark:text-slate-300">{{ item.alamat_npwp }}</div>
                               </div>
                               <div class="grid grid-cols-[140px_1fr] gap-2 py-1 border-b border-dashed border-slate-50 dark:border-slate-700">
                                   <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">KPP</div>
                                   <div class="text-xs text-slate-700 dark:text-slate-200">{{ item.kpp || '-' }}</div>
                               </div>
                               <div class="grid grid-cols-[140px_1fr] gap-2 py-1">
                                   <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">TGL TERDAFTAR</div>
                                   <div class="text-xs text-slate-700 dark:text-slate-200">{{ item.tanggal_terdaftar || '-' }}</div>
                               </div>
                           </div>
                      </div>
                      <div v-else class="text-slate-400 text-xs italic text-center py-4">Data NPWP belum tersedia.</div>
                 </div>

                 <!-- PKP -->
                 <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                      <div class="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
                          <h3 class="font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-2"><i class="fas fa-stamp text-orange-500"></i> Status PKP</h3>
                          <button v-if="subModules.pkp?.[0]?.url_pkp" @click="openPkpModal(subModules.pkp[0])" class="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100 hover:bg-orange-100 transition-colors"><i class="fas fa-file-pdf"></i> View</button>
                      </div>
                      <div v-if="subModules.pkp?.length > 0">
                           <div v-for="item in subModules.pkp" :key="item.id_pkp" class="space-y-4">
                               <div class="flex items-center gap-3">
                                   <div class="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center"><i class="fas fa-check"></i></div>
                                   <div>
                                       <div class="text-[10px] font-bold text-slate-400 uppercase">STATUS</div>
                                       <div class="text-sm font-bold text-slate-800 dark:text-white">{{ item.status || 'PKP' }}</div>
                                   </div>
                               </div>
                               <div class="space-y-2 mt-2 bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                   <div class="flex justify-between">
                                       <span class="text-[10px] font-bold text-slate-500 uppercase">Nomor PKP</span>
                                       <span class="text-xs font-mono font-bold text-slate-700 dark:text-slate-200">{{ item.nomor_pkp }}</span>
                                   </div>
                                   <div class="flex justify-between">
                                       <span class="text-[10px] font-bold text-slate-500 uppercase">Tgl Pengukuhan</span>
                                       <span class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ item.tanggal_pengukuhan }}</span>
                                   </div>
                               </div>
                           </div>
                      </div>
                      <div v-else class="text-slate-400 text-xs italic text-center py-4">Belum dikukuhkan PKP.</div>
                 </div>
            </div>

            <!-- Right: SPT & KSWP -->
            <div class="space-y-6">
                 <!-- SPT History Compact -->
                 <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden">
                      <div class="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-200 dark:border-slate-700">
                          <h3 class="font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-2"><i class="fas fa-history text-purple-500"></i> Riwayat SPT</h3>
                      </div>
                      <div v-if="subModules.spt?.length > 0" class="max-h-[300px] overflow-y-auto">
                          <table class="w-full text-xs text-left">
                              <thead class="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold sticky top-0 dark:text-slate-400">
                                  <tr>
                                      <th class="px-4 py-2 bg-slate-50 dark:bg-slate-800">Tahun</th>
                                      <th class="px-4 py-2 bg-slate-50 dark:bg-slate-800">Jenis</th>
                                      <th class="px-4 py-2 bg-slate-50 dark:bg-slate-800">Status</th>
                                      <th class="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-right">#</th>
                                  </tr>
                              </thead>
                              <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
                                  <tr v-for="item in subModules.spt" :key="item.id_spt" @click="openSptModal(item)" class="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer">
                                      <td class="px-4 py-2 font-bold">{{ item.tahun_pajak }}</td>
                                      <td class="px-4 py-2">{{ item.jenis_spt }}</td>
                                      <td class="px-4 py-2"><span class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-700 border border-green-200">{{ item.status_spt }}</span></td>
                                      <td class="px-4 py-2 text-right"><button class="text-blue-600 hover:text-blue-700 font-bold">View</button></td>
                                  </tr>
                              </tbody>
                          </table>
                      </div>
                      <div v-else class="p-6 text-center text-slate-400 text-xs italic">Belum ada riwayat SPT.</div>
                 </div>

                 <!-- KSWP -->
                 <div class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5">
                      <div class="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
                          <h3 class="font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-2"><i class="fas fa-check-double text-emerald-500"></i> Status KSWP</h3>
                          <button v-if="subModules.kswp?.[0]?.kswp_url" @click="openKswpModal(subModules.kswp[0])" class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 hover:bg-emerald-100 transition-colors"><i class="fas fa-file-pdf"></i> View</button>
                      </div>
                      <div v-if="subModules.kswp?.length > 0">
                           <div v-for="item in subModules.kswp" :key="item.id_kswp" class="space-y-3">
                               <div class="text-center mb-3">
                                   <div class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 text-xs">
                                       <i class="fas fa-check-circle"></i> {{ item.status_kswp || 'VALID' }}
                                   </div>
                               </div>
                               <div class="space-y-2 bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg border border-slate-100 dark:border-slate-700">
                                   <div class="flex justify-between text-[10px]">
                                       <span class="font-bold text-slate-500 uppercase">NIK/NPWP (15)</span>
                                       <span class="font-mono font-bold text-slate-700 dark:text-slate-200">{{ item.nik_npwp15 }}</span>
                                   </div>
                                   <div class="flex justify-between text-[10px]">
                                       <span class="font-bold text-slate-500 uppercase">NPWP (16)</span>
                                       <span class="font-mono font-bold text-slate-700 dark:text-slate-200">{{ item.npwp16 }}</span>
                                   </div>
                                   <div class="flex justify-between text-[10px]">
                                       <span class="font-bold text-slate-500 uppercase">Nama WP</span>
                                       <span class="text-xs font-semibold text-slate-700 dark:text-slate-200">{{ item.nama_wp }}</span>
                                   </div>
                                   <div class="text-[10px] pt-2 border-t border-slate-200 dark:border-slate-600">
                                       <span class="font-bold text-slate-500 uppercase block mb-1">Alamat</span>
                                       <span class="text-xs text-slate-600 dark:text-slate-300">{{ item.alamat }}</span>
                                   </div>
                               </div>
                           </div>
                      </div>
                      <div v-else class="text-slate-400 text-xs italic text-center py-4">Data KSWP belum tersedia.</div>
                 </div>
            </div>
        </div>

         <!-- 4. KONTRAK TAB (Redesigned with Split View) -->
         <div v-if="activeTab === 'kontrak'" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <!-- Left: Contract List (7 cols) -->
            <div class="lg:col-span-7 space-y-4">
               <div v-if="subModules.kontrak && subModules.kontrak.length > 0" class="space-y-3">
                  <div v-for="item in subModules.kontrak" :key="item.id_kontrak" 
                       @click="selectItem('kontrak', item)"
                       class="bg-white dark:bg-slate-800 rounded-xl border-2 p-6 cursor-pointer transition-all group hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md"
                       :class="selectedItems.kontrak?.id_kontrak === item.id_kontrak 
                          ? 'border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-500/20' 
                          : 'border-slate-200 dark:border-slate-700'">
                     
                     <div class="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4 border-b border-slate-100 dark:border-slate-700 pb-3">
                        <div class="flex-1">
                           <div class="flex items-center gap-2 mb-2">
                              <span class="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 text-[10px] font-bold uppercase rounded border border-blue-100 dark:border-blue-800">{{ item.bidang_pekerjaan }}</span>
                              <span class="text-xs text-slate-400 font-bold">• {{ item.lokasi }}</span>
                           </div>
                           <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1 leading-tight">{{ item.nama_pekerjaan }}</h3>
                           <div class="flex items-center gap-2 text-xs text-slate-500">
                               <i class="fas fa-building"></i> {{ item.nama_pemberi_tugas }}
                           </div>
                        </div>
                     </div>
                     
                     <div class="space-y-0.5 mt-2">
                         <div class="grid grid-cols-[110px_1fr] gap-2 py-1 items-center bg-slate-50 dark:bg-slate-700/30 px-2 -mx-2 rounded mb-1">
                              <div class="text-[10px] font-bold text-slate-400 uppercase">NILAI KONTRAK</div>
                              <div class="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">
                                 Rp {{ Number(item.nilai_kontrak).toLocaleString('id-ID') }}
                              </div>
                         </div>

                         <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700">
                              <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">No. Kontrak</div> 
                              <div class="text-xs font-mono font-bold text-slate-700 dark:text-slate-200 truncate">{{ item.nomor_kontrak }}</div>
                         </div>
                         <div v-if="item.sub_bidang_pekerjaan" class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700">
                              <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Sub Bidang</div> 
                              <div class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ item.sub_bidang_pekerjaan }}</div>
                         </div>
                         <div v-if="item.alamat_pemberi_tugas" class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700">
                              <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Alamat</div> 
                              <div class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ item.alamat_pemberi_tugas }}</div>
                         </div>
                         <div v-if="item.kode_pos_pemberi_tugas" class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700">
                              <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Kode Pos</div> 
                              <div class="text-xs font-mono font-medium text-slate-700 dark:text-slate-200">{{ item.kode_pos_pemberi_tugas }}</div>
                         </div>
                         <div v-if="item.telepon_pemberi_tugas" class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700">
                              <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Telepon</div> 
                              <div class="text-xs font-mono font-medium text-slate-700 dark:text-slate-200">{{ item.telepon_pemberi_tugas }}</div>
                         </div>
                         <div v-if="item.fax_pemberi_tugas" class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700">
                              <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Fax</div> 
                              <div class="text-xs font-mono font-medium text-slate-700 dark:text-slate-200">{{ item.fax_pemberi_tugas }}</div>
                         </div>
                         <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700">
                              <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Tgl Kontrak</div> 
                              <div class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ item.tanggal_kontrak }}</div>
                         </div>
                         <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700">
                              <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Tgl Selesai</div> 
                              <div class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ item.tanggal_selesai_kontrak }}</div>
                         </div>
                         <div v-if="item.waktu_pelaksanaan" class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700">
                              <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Waktu Pelaksanaan</div> 
                              <div class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ item.waktu_pelaksanaan }}</div>
                         </div>
                         <div v-if="item.tanggal_ba_serah_terima" class="grid grid-cols-[110px_1fr] gap-2 py-0.5">
                              <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">BA Serah Terima</div> 
                              <div class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ item.tanggal_ba_serah_terima }}</div>
                         </div>
                     </div>
                     
                     <div v-if="selectedItems.kontrak?.id_kontrak === item.id_kontrak" class="mt-4 pt-3 border-t border-blue-100 dark:border-blue-900/30 flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold">
                        <i class="fas fa-check-circle"></i> <span>PREVIEWING DOCUMENT</span>
                     </div>
                  </div>
               </div>
               <div v-else class="text-center py-12 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700">
                  <i class="fas fa-briefcase text-4xl text-slate-300 mb-3 opacity-30"></i>
                  <p class="text-slate-500 font-medium text-sm">Belum ada data kontrak.</p>
               </div>
            </div>

            <!-- Right: PDF Preview (5 cols) -->
            <div class="lg:col-span-5 flex flex-col h-full">
               <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex-1 flex flex-col overflow-hidden h-[calc(100vh-150px)] min-h-[500px] sticky top-24">
                  <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 shrink-0">
                     <div>
                         <h3 class="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 text-sm">
                            <i class="fas fa-file-pdf text-red-500"></i>
                            Dokumen Kontrak
                         </h3>
                         <p v-if="selectedItems.kontrak" class="text-xs text-slate-500 mt-1 truncate max-w-[200px]">{{ selectedItems.kontrak.nama_pekerjaan }}</p>
                     </div>
                     <div class="flex gap-2" v-if="getSelectedDocUrl('kontrak')">
                        <a :href="getSelectedDocUrl('kontrak')" target="_blank" class="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:border-blue-400 transition-colors">
                           <i class="fas fa-external-link-alt mr-1"></i> Open Tab
                        </a>
                     </div>
                  </div>
                  
                  <div class="flex-1 bg-slate-100 dark:bg-slate-900 relative">
                     <iframe 
                        v-if="getSelectedDocUrl('kontrak')" 
                        :key="getSelectedDocUrl('kontrak')"
                        :src="getPreviewUrl(getSelectedDocUrl('kontrak'))" 
                        class="w-full h-full absolute inset-0 border-none"
                     ></iframe>
                     <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-400">
                        <i class="fas fa-file-invoice text-4xl mb-4 opacity-20"></i>
                        <p class="text-sm">{{ selectedItems.kontrak ? 'Dokumen tidak tersedia' : 'Pilih kontrak untuk preview' }}</p>
                     </div>
                  </div>
               </div>
            </div>
         </div>

        <!-- 5. NIB, SBU, KTA, SERTIFIKAT TABS - Redesigned with Complete Info -->
        <div v-if="['nib', 'sbu', 'kta', 'sertifikat'].includes(activeTab)" class="grid grid-cols-1 lg:grid-cols-12 gap-8">
           <!-- Left: Data List (7 cols) -->
           <div class="lg:col-span-7 space-y-4">
              <!-- Data Cards -->
              <div v-if="subModules[activeTab]?.length > 0" class="space-y-3">
                 <div v-for="(item, idx) in subModules[activeTab]" :key="idx" 
                      @click="selectItem(activeTab, item)"
                      class="bg-white dark:bg-slate-800 rounded-xl border-2 p-6 cursor-pointer transition-all group hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md"
                      :class="selectedItems[activeTab] === item 
                         ? 'border-blue-500 dark:border-blue-400 shadow-lg shadow-blue-500/20' 
                         : 'border-slate-200 dark:border-slate-700'">
                    
                    <div class="flex items-center gap-3 mb-4 pb-3 border-b border-slate-100 dark:border-slate-700">
                        <div class="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 flex items-center justify-center shrink-0">
                           <i :class="getTabIcon(activeTab)"></i>
                        </div>
                        <div>
                             <div class="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{{ getTabLabel(activeTab) }}</div>
                             <h4 class="font-bold text-slate-800 dark:text-white text-lg font-mono leading-none mt-1">
                                {{ item.nomor_nib || item.nomor_registrasi_lpjk || item.nomor_anggota || item.nomor_sertifikat || '#'+(idx+1) }}
                             </h4>
                        </div>
                    </div>

                    <!-- NIB Specific Fields -->
                    <div v-if="activeTab === 'nib'" class="space-y-0.5 mt-2">
                       <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700">
                           <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Tgl Terbit</div>
                           <div class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ item.tanggal_terbit || '-' }}</div>
                       </div>
                       <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700">
                           <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Status Modal</div>
                           <div class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ item.status_penanaman_modal || '-' }}</div>
                       </div>
                       <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700">
                           <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Skala Usaha</div>
                           <div class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ item.skala_usaha || '-' }}</div>
                       </div>
                    </div>

                    <!-- SBU Specific Fields -->
                    <div v-else-if="activeTab === 'sbu'" class="flex flex-col gap-0.5 mt-2">
                           <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-50 dark:border-slate-700">
                               <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">No. PB UMKU</div>
                               <div class="text-xs font-medium text-slate-700 dark:text-slate-200 truncate" :title="item.nomor_pb_umku">{{ item.nomor_pb_umku || '-' }}</div>
                           </div>
                           <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-50 dark:border-slate-700">
                               <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Jenis Usaha</div>
                               <div class="text-xs font-medium text-slate-700 dark:text-slate-200 truncate" :title="item.jenis_usaha">{{ item.jenis_usaha || '-' }}</div>
                           </div>
                           <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-50 dark:border-slate-700">
                               <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Asosiasi</div>
                               <div class="text-xs font-medium text-slate-700 dark:text-slate-200 truncate" :title="item.asosiasi">{{ item.asosiasi || '-' }}</div>
                           </div>
                           <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-50 dark:border-slate-700">
                               <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">PJBU</div>
                               <div class="text-xs font-medium text-slate-700 dark:text-slate-200 truncate" :title="item.pjbu">{{ item.pjbu || '-' }}</div>
                           </div>
                           <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-50 dark:border-slate-700">
                               <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">PJTBU</div>
                               <div class="text-xs font-medium text-slate-700 dark:text-slate-200 truncate" :title="item.pjtbu">{{ item.pjtbu || '-' }}</div>
                           </div>
                           <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-50 dark:border-slate-700">
                               <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Reg. LPJK</div>
                               <div class="text-xs font-medium text-slate-700 dark:text-slate-200 truncate" :title="item.nomor_registrasi_lpjk">{{ item.nomor_registrasi_lpjk || '-' }}</div>
                           </div>
                           <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-50 dark:border-slate-700">
                               <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Pelaksana</div>
                               <div class="text-xs font-medium text-slate-700 dark:text-slate-200 truncate" :title="item.pelaksana_sertifikasi">{{ item.pelaksana_sertifikasi || '-' }}</div>
                           </div>
                           <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-50 dark:border-slate-700">
                               <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Tgl Terbit</div>
                               <div class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ item.tanggal_terbit || '-' }}</div>
                           </div>
                           <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-50 dark:border-slate-700">
                               <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Berlaku</div>
                               <div class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ item.masa_berlaku || '-' }}</div>
                           </div>
                           <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-50 dark:border-slate-700">
                               <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Kualifikasi</div>
                               <div class="text-xs font-medium text-slate-700 dark:text-slate-200 truncate" :title="item.kualifikasi">{{ item.kualifikasi || '-' }}</div>
                           </div>
                           <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-50 dark:border-slate-700">
                               <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Subklas</div>
                               <div class="text-xs font-medium text-slate-700 dark:text-slate-200 truncate" :title="item.kode_subklasifikasi">{{ item.kode_subklasifikasi || '-' }}</div>
                           </div>
                           <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-50 dark:border-slate-700">
                               <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Sifat</div>
                               <div class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ item.sifat || '-' }}</div>
                           </div>
                           <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-50 dark:border-slate-700">
                               <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">KBLI</div>
                               <div class="text-xs font-medium text-slate-700 dark:text-slate-200 truncate" :title="item.kode_kbli">{{ item.kode_kbli || '-' }}</div>
                           </div>
                           <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-50 dark:border-slate-700">
                               <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">PJSKBU</div>
                               <div class="text-xs font-medium text-slate-700 dark:text-slate-200 truncate" :title="item.nama_pjskbu">{{ item.nama_pjskbu || '-' }}</div>
                           </div>
                    </div>

                    <!-- KTA Specific Fields -->
                    <!-- KTA Specific Fields -->
                    <div v-else-if="activeTab === 'kta'" class="space-y-0.5 mt-2">
                       <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700">
                           <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">No Anggota</div>
                           <div class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ item.nomor_anggota || '-' }}</div>
                       </div>
                       <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700">
                           <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Nama Asosiasi</div>
                           <div class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ item.nama_asosiasi || '-' }}</div>
                       </div>
                       <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700">
                           <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Penanggung Jawab</div>
                           <div class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ item.penanggung_jawab || '-' }}</div>
                       </div>
                       <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700">
                           <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Jenis Usaha</div>
                           <div class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ item.jenis_usaha || '-' }}</div>
                       </div>
                       <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700">
                           <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Status</div>
                           <div class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ item.status_keanggotaan || '-' }}</div>
                       </div>
                       <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700">
                           <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Tgl Terbit</div>
                           <div class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ item.tanggal_terbit || '-' }}</div>
                       </div>
                    </div>

                    <!-- SERTIFIKAT Specific Fields -->
                    <!-- SERTIFIKAT Specific Fields -->
                    <div v-else-if="activeTab === 'sertifikat'" class="space-y-0.5 mt-2">
                       <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700">
                           <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">No Sertifikat</div>
                           <div class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ item.nomor_sertifikat || '-' }}</div>
                       </div>
                       <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700">
                           <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Kode KBLI</div>
                           <div class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ item.kode_kbli || '-' }}</div>
                       </div>
                       <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700">
                           <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Lembaga</div>
                           <div class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ item.lembaga_verifikasi || '-' }}</div>
                       </div>
                       <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700">
                           <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Klasifikasi Risiko</div>
                           <div class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ item.klasifikasi_risiko || '-' }}</div>
                       </div>
                       <div class="grid grid-cols-[110px_1fr] gap-2 py-0.5 border-b border-dashed border-slate-100 dark:border-slate-700">
                           <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">Status</div>
                           <div class="text-xs font-medium text-slate-700 dark:text-slate-200">{{ item.status_pemenuhan || '-' }}</div>
                       </div>
                    </div>

                    <!-- Selection Indicator -->
                    <div v-if="selectedItems[activeTab] === item" class="mt-4 pt-3 border-t border-blue-100 dark:border-blue-900/30 flex items-center gap-2 text-blue-600 dark:text-blue-400 text-xs font-bold">
                       <i class="fas fa-check-circle"></i> <span>PREVIEWING DOCUMENT</span>
                    </div>
                 </div>
              </div>
              
              <!-- Empty State -->
              <div v-else class="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center text-slate-400 bg-slate-50/50 dark:bg-slate-800/20">
                  <i :class="getTabIcon(activeTab)" class="text-4xl mb-3 opacity-30"></i>
                  <p class="text-sm font-medium">Belum ada data {{ getTabLabel(activeTab) }}.</p>
              </div>
           </div>

           <!-- Right: PDF Preview (5 cols) -->
           <div class="lg:col-span-5 flex flex-col h-full">
              <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex-1 flex flex-col overflow-hidden h-[calc(100vh-150px)] min-h-[500px] sticky top-24">
                 <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 shrink-0">
                    <div>
                        <h3 class="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 text-sm">
                           <i class="fas fa-file-pdf text-red-500"></i>
                           Dokumen {{ getTabLabel(activeTab) }}
                        </h3>
                        <p v-if="selectedItems[activeTab]" class="text-xs text-slate-500 mt-1">
                           {{ selectedItems[activeTab].nomor_nib || selectedItems[activeTab].nomor_registrasi_lpjk || selectedItems[activeTab].nomor_anggota || selectedItems[activeTab].nomor_sertifikat }}
                        </p>
                    </div>
                    <div class="flex gap-2" v-if="getSelectedDocUrl(activeTab)">
                       <a :href="getSelectedDocUrl(activeTab)" target="_blank" class="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:border-blue-400 transition-colors">
                          <i class="fas fa-external-link-alt mr-1"></i> Open Tab
                       </a>
                    </div>
                 </div>
                 
                 <div class="flex-1 bg-slate-100 dark:bg-slate-900 relative">
                    <iframe 
                       v-if="getSelectedDocUrl(activeTab)" 
                       :key="`${activeTab}-${selectedItems[activeTab]?.id_sertifikat_standar || selectedItems[activeTab]?.id_nib || selectedItems[activeTab]?.id_sbu || selectedItems[activeTab]?.id_kta || selectedItems[activeTab]?.id_akta || Date.now()}`"
                       :src="getPreviewUrl(getSelectedDocUrl(activeTab))" 
                       class="w-full h-full absolute inset-0 border-none"
                    ></iframe>
                    <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-400">
                       <i class="fas fa-file-invoice text-4xl mb-4 opacity-20"></i>
                       <p class="text-sm">{{ selectedItems[activeTab] ? 'Dokumen tidak tersedia' : 'Pilih item untuk preview' }}</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

      </div>
    </main>

    <!-- SPT Detail Modal -->
    <BaseModal :show="showSptModal" @close="showSptModal = false" maxWidth="5xl">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center">
            <i class="fas fa-file-invoice"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Detail SPT</h3>
            <p v-if="selectedSpt" class="text-xs text-slate-500 mt-0.5">Tahun {{ selectedSpt.tahun_pajak }} - {{ selectedSpt.masa_pajak }}</p>
          </div>
        </div>
      </template>

      <div v-if="selectedSpt" class="grid grid-cols-1 lg:grid-cols-2 gap-6 max-h-[70vh]">
        <!-- Left: Data Detail -->
        <div class="space-y-4 overflow-y-auto pr-2">
          <div class="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-xl border border-purple-100 dark:border-purple-800">
            <div class="text-[10px] font-bold text-purple-600 dark:text-purple-400 uppercase mb-2">Informasi Wajib Pajak</div>
            <div class="space-y-2">
              <div class="grid grid-cols-[120px_1fr] gap-2 text-xs">
                <span class="font-bold text-slate-500">Nama WP</span>
                <span class="font-semibold text-slate-800 dark:text-white">{{ selectedSpt.nama_wp }}</span>
              </div>
              <div class="grid grid-cols-[120px_1fr] gap-2 text-xs">
                <span class="font-bold text-slate-500">NPWP</span>
                <span class="font-mono font-bold text-slate-800 dark:text-white">{{ selectedSpt.npwp }}</span>
              </div>
              <div class="grid grid-cols-[120px_1fr] gap-2 text-xs">
                <span class="font-bold text-slate-500">NITKU</span>
                <span class="font-mono text-slate-700 dark:text-slate-200">{{ selectedSpt.nitku }}</span>
              </div>
            </div>
          </div>

          <div class="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl border border-slate-200 dark:border-slate-700">
            <div class="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase mb-2">Detail SPT</div>
            <div class="space-y-2">
              <div class="grid grid-cols-[120px_1fr] gap-2 text-xs">
                <span class="font-bold text-slate-500">Tahun Pajak</span>
                <span class="font-bold text-slate-800 dark:text-white">{{ selectedSpt.tahun_pajak }}</span>
              </div>
              <div class="grid grid-cols-[120px_1fr] gap-2 text-xs">
                <span class="font-bold text-slate-500">Masa Pajak</span>
                <span class="font-semibold text-slate-800 dark:text-white">{{ selectedSpt.masa_pajak }}</span>
              </div>
              <div class="grid grid-cols-[120px_1fr] gap-2 text-xs">
                <span class="font-bold text-slate-500">Jenis SPT</span>
                <span class="font-mono text-slate-800 dark:text-white">{{ selectedSpt.jenis_spt }}</span>
              </div>
              <div class="grid grid-cols-[120px_1fr] gap-2 text-xs">
                <span class="font-bold text-slate-500">Pembetulan Ke</span>
                <span class="text-slate-800 dark:text-white">{{ selectedSpt.pembetulan_ke }}</span>
              </div>
              <div class="grid grid-cols-[120px_1fr] gap-2 text-xs">
                <span class="font-bold text-slate-500">Status</span>
                <span class="inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-700 border border-green-200">{{ selectedSpt.status_spt }}</span>
              </div>
            </div>
          </div>

          <div class="bg-emerald-50 dark:bg-emerald-900/20 p-4 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <div class="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase mb-2">Nominal & Penyampaian</div>
            <div class="space-y-2">
              <div class="grid grid-cols-[120px_1fr] gap-2 text-xs">
                <span class="font-bold text-slate-500">Nominal</span>
                <span class="font-mono font-bold text-lg text-emerald-700 dark:text-emerald-400">Rp {{ Number(selectedSpt.nominal).toLocaleString('id-ID') }}</span>
              </div>
              <div class="grid grid-cols-[120px_1fr] gap-2 text-xs">
                <span class="font-bold text-slate-500">Tgl Penyampaian</span>
                <span class="font-semibold text-slate-800 dark:text-white">{{ selectedSpt.tanggal_penyampaian }}</span>
              </div>
              <div class="grid grid-cols-[120px_1fr] gap-2 text-xs">
                <span class="font-bold text-slate-500">No Tanda Terima</span>
                <span class="font-mono text-slate-700 dark:text-slate-200">{{ selectedSpt.nomor_tanda_terima }}</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Right: PDF Preview -->
        <div class="bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col">
          <div class="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div class="text-xs font-bold text-slate-700 dark:text-slate-200">Dokumen SPT</div>
            <a v-if="selectedSpt.spt_url" :href="selectedSpt.spt_url" target="_blank" class="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100 transition-colors">
              <i class="fas fa-external-link-alt mr-1"></i> Buka
            </a>
          </div>
          <div class="flex-1 relative min-h-[400px]">
            <iframe 
              v-if="selectedSpt.spt_url"
              :key="selectedSpt.id_spt"
              :src="getPreviewUrl(selectedSpt.spt_url)" 
              class="w-full h-full absolute inset-0 border-none"
            ></iframe>
            <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-400">
              <i class="fas fa-file-pdf text-4xl mb-4 opacity-20"></i>
              <p class="text-sm">Dokumen tidak tersedia</p>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>

    <!-- NPWP Modal -->
    <BaseModal :show="showNpwpModal" @close="showNpwpModal = false" maxWidth="5xl">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center">
            <i class="fas fa-id-card"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Dokumen NPWP Perusahaan</h3>
            <p v-if="selectedNpwp" class="text-xs text-slate-500 mt-0.5">{{ selectedNpwp.nomor_npwp }}</p>
          </div>
        </div>
      </template>

      <div v-if="selectedNpwp" class="w-full h-[60vh]">
        <div class="bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full">
          <div class="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div class="text-xs font-bold text-slate-700 dark:text-slate-200">Preview Dokumen NPWP</div>
            <a v-if="selectedNpwp.npwp_perusahaan_url" :href="selectedNpwp.npwp_perusahaan_url" target="_blank" class="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100 transition-colors">
              <i class="fas fa-external-link-alt mr-1"></i> Buka di Tab Baru
            </a>
          </div>
          <div class="flex-1 relative">
            <iframe 
              v-if="selectedNpwp.npwp_perusahaan_url"
              :key="selectedNpwp.id_npwp_perusahaan"
              :src="getPreviewUrl(selectedNpwp.npwp_perusahaan_url)" 
              class="w-full h-full absolute inset-0 border-none"
            ></iframe>
            <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-400">
              <i class="fas fa-file-pdf text-4xl mb-4 opacity-20"></i>
              <p class="text-sm">Dokumen tidak tersedia</p>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>

    <!-- PKP Modal -->
    <BaseModal :show="showPkpModal" @close="showPkpModal = false" maxWidth="5xl">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center">
            <i class="fas fa-stamp"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Dokumen PKP</h3>
            <p v-if="selectedPkp" class="text-xs text-slate-500 mt-0.5">{{ selectedPkp.nomor_pkp }}</p>
          </div>
        </div>
      </template>

      <div v-if="selectedPkp" class="w-full h-[60vh]">
        <div class="bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full">
          <div class="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div class="text-xs font-bold text-slate-700 dark:text-slate-200">Preview Dokumen PKP</div>
            <a v-if="selectedPkp.url_pkp" :href="selectedPkp.url_pkp" target="_blank" class="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100 hover:bg-orange-100 transition-colors">
              <i class="fas fa-external-link-alt mr-1"></i> Buka di Tab Baru
            </a>
          </div>
          <div class="flex-1 relative">
            <iframe 
              v-if="selectedPkp.url_pkp"
              :key="selectedPkp.id_pkp"
              :src="getPreviewUrl(selectedPkp.url_pkp)" 
              class="w-full h-full absolute inset-0 border-none"
            ></iframe>
            <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-400">
              <i class="fas fa-file-pdf text-4xl mb-4 opacity-20"></i>
              <p class="text-sm">Dokumen tidak tersedia</p>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>

    <!-- KSWP Modal -->
    <BaseModal :show="showKswpModal" @close="showKswpModal = false" maxWidth="5xl">
      <template #header>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <i class="fas fa-check-double"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">Dokumen KSWP</h3>
            <p v-if="selectedKswp" class="text-xs text-slate-500 mt-0.5">{{ selectedKswp.nama_wp }}</p>
          </div>
        </div>
      </template>

      <div v-if="selectedKswp" class="w-full h-[60vh]">
        <div class="bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full">
          <div class="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div class="text-xs font-bold text-slate-700 dark:text-slate-200">Preview Dokumen KSWP</div>
            <a v-if="selectedKswp.kswp_url" :href="selectedKswp.kswp_url" target="_blank" class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 hover:bg-emerald-100 transition-colors">
              <i class="fas fa-external-link-alt mr-1"></i> Buka di Tab Baru
            </a>
          </div>
          <div class="flex-1 relative">
            <iframe 
              v-if="selectedKswp.kswp_url"
              :key="selectedKswp.id_kswp"
              :src="getPreviewUrl(selectedKswp.kswp_url)" 
              class="w-full h-full absolute inset-0 border-none"
            ></iframe>
            <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-400">
              <i class="fas fa-file-pdf text-4xl mb-4 opacity-20"></i>
              <p class="text-sm">Dokumen tidak tersedia</p>
            </div>
          </div>
        </div>
      </div>
    </BaseModal>

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

// SPT Modal state
const showSptModal = ref(false)
const selectedSpt = ref(null)

// NPWP Modal state
const showNpwpModal = ref(false)
const selectedNpwp = ref(null)

// PKP Modal state  
const showPkpModal = ref(false)
const selectedPkp = ref(null)

// KSWP Modal state
const showKswpModal = ref(false)
const selectedKswp = ref(null)


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
      kontrak: item.kontrak_url || item.url_dokumen,
      spt: item.spt_url
   }
   return urlMap[tabId] || item.url_dokumen || item.kontrak_url || ''
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
      // Fetch company overview (main profile only)
      const companyRes = await fetch(`${apiBaseUrl}/companies/${companyId}`)
      
      if(companyRes.ok) {
         company.value = await companyRes.json()
         console.log('✅ Company profile loaded:', company.value)
      }
      
      // Fetch KBLI for overview tab
      await fetchKBLI()
      
   } catch(e) {
      console.error('Error fetching company:', e)
   } finally {
      loadingTab.value = false
   }
}

// Fetch KBLI data
const fetchKBLI = async () => {
   try {
      const res = await fetch(`${apiBaseUrl}/companies/${companyId}/kbli`)
      if(res.ok) {
         subModules.value.kbli = await res.json()
         console.log('✅ KBLI Data loaded:', subModules.value.kbli.length, 'items')
      }
   } catch(e) {
      console.error('Error fetching KBLI:', e)
   }
}

// Fetch Akta data
const fetchAkta = async () => {
   try {
      const res = await fetch(`${apiBaseUrl}/companies/${companyId}/akta`)
      if(res.ok) {
         subModules.value.akta = await res.json()
         tabs.find(t => t.id === 'akta').count = subModules.value.akta.length
         if (subModules.value.akta.length) selectedItems.value.akta = subModules.value.akta[0]
         console.log('✅ Akta Data loaded:', subModules.value.akta.length, 'items')
      }
   } catch(e) {
      console.error('Error fetching Akta:', e)
   }
}

// Fetch Pejabat data
const fetchPejabat = async () => {
   try {
      const res = await fetch(`${apiBaseUrl}/companies/${companyId}/pejabat`)
      if(res.ok) {
         subModules.value.pejabat = await res.json()
         tabs.find(t => t.id === 'pejabat').count = subModules.value.pejabat.length
         console.log('✅ Pejabat Data loaded:', subModules.value.pejabat.length, 'items')
      }
   } catch(e) {
      console.error('Error fetching Pejabat:', e)
   }
}

// Fetch NIB data
const fetchNIB = async () => {
   try {
      const res = await fetch(`${apiBaseUrl}/companies/${companyId}/nib`)
      if(res.ok) {
         subModules.value.nib = await res.json()
         tabs.find(t => t.id === 'nib').count = subModules.value.nib.length
         if (subModules.value.nib.length) selectedItems.value.nib = subModules.value.nib[0]
         console.log('✅ NIB Data loaded:', subModules.value.nib.length, 'items')
      }
   } catch(e) {
      console.error('Error fetching NIB:', e)
   }
}

// Fetch SBU data
const fetchSBU = async () => {
   try {
      const res = await fetch(`${apiBaseUrl}/companies/${companyId}/sbu`)
      if(res.ok) {
         subModules.value.sbu = await res.json()
         tabs.find(t => t.id === 'sbu').count = subModules.value.sbu.length
         if (subModules.value.sbu.length) selectedItems.value.sbu = subModules.value.sbu[0]
         console.log('✅ SBU Data loaded:', subModules.value.sbu.length, 'items')
      }
   } catch(e) {
      console.error('Error fetching SBU:', e)
   }
}

// Fetch KTA data
const fetchKTA = async () => {
   try {
      const res = await fetch(`${apiBaseUrl}/companies/${companyId}/kta`)
      if(res.ok) {
         subModules.value.kta = await res.json()
         tabs.find(t => t.id === 'kta').count = subModules.value.kta.length
         if (subModules.value.kta.length) selectedItems.value.kta = subModules.value.kta[0]
         console.log('✅ KTA Data loaded:', subModules.value.kta.length, 'items')
      }
   } catch(e) {
      console.error('Error fetching KTA:', e)
   }
}

// Fetch Sertifikat data
const fetchSertifikat = async () => {
   try {
      const res = await fetch(`${apiBaseUrl}/companies/${companyId}/sertifikat`)
      if(res.ok) {
         subModules.value.sertifikat = await res.json()
         tabs.find(t => t.id === 'sertifikat').count = subModules.value.sertifikat.length
         if (subModules.value.sertifikat.length) selectedItems.value.sertifikat = subModules.value.sertifikat[0]
         console.log('✅ Sertifikat Data loaded:', subModules.value.sertifikat.length, 'items')
      }
   } catch(e) {
      console.error('Error fetching Sertifikat:', e)
   }
}

// Fetch Pajak data (combined)
const fetchPajak = async () => {
   try {
      const res = await fetch(`${apiBaseUrl}/companies/${companyId}/pajak`)
      if(res.ok) {
         const pajakData = await res.json()
         subModules.value.npwp = pajakData.npwp || []
         subModules.value.kswp = pajakData.kswp || []
         subModules.value.spt = pajakData.spt || []
         subModules.value.pkp = pajakData.pkp || []
         
         const taxCount = subModules.value.npwp.length + subModules.value.kswp.length + 
                          subModules.value.spt.length + subModules.value.pkp.length
         tabs.find(t => t.id === 'pajak').count = taxCount
         
         if (subModules.value.spt.length) selectedItems.value.spt = subModules.value.spt[0]
         console.log('✅ Pajak Data loaded - NPWP:', subModules.value.npwp.length, 
                    'KSWP:', subModules.value.kswp.length, 
                    'SPT:', subModules.value.spt.length, 
                    'PKP:', subModules.value.pkp.length)
      }
   } catch(e) {
      console.error('Error fetching Pajak:', e)
   }
}

// Fetch Pengalaman/Kontrak data
const fetchPengalaman = async () => {
   try {
      const res = await fetch(`${apiBaseUrl}/companies/${companyId}/pengalaman`)
      if(res.ok) {
         subModules.value.kontrak = await res.json()
         tabs.find(t => t.id === 'kontrak').count = subModules.value.kontrak.length
         if (subModules.value.kontrak.length) selectedItems.value.kontrak = subModules.value.kontrak[0]
         console.log('✅ Pengalaman Data loaded:', subModules.value.kontrak.length, 'items')
      }
   } catch(e) {
      console.error('Error fetching Pengalaman:', e)
   }
}

// Lazy load data when tab changes
const loadedTabs = ref(['overview']) // Track which tabs have been loaded

watch(activeTab, async (newTab) => {
   // Skip if already loaded
   if (loadedTabs.value.includes(newTab)) return
   
   loadingTab.value = true
   
   try {
      switch(newTab) {
         case 'akta':
            await fetchAkta()
            break
         case 'pejabat':
            await fetchPejabat()
            break
         case 'nib':
            await fetchNIB()
            break
         case 'sbu':
            await fetchSBU()
            break
         case 'kta':
            await fetchKTA()
            break
         case 'sertifikat':
            await fetchSertifikat()
            break
         case 'pajak':
            await fetchPajak()
            break
         case 'kontrak':
            await fetchPengalaman()
            break
      }
      
      // Mark tab as loaded
      loadedTabs.value.push(newTab)
   } finally {
      loadingTab.value = false
   }
})

// Placeholder Actions
const openAddModal = (tab) => { console.log('Add', tab) }

// Open SPT Modal
const openSptModal = (item) => {
   selectedSpt.value = item
   showSptModal.value = true
}

// Open NPWP Modal
const openNpwpModal = (item) => {
   selectedNpwp.value = item
   showNpwpModal.value = true
}

// Open PKP Modal
const openPkpModal = (item) => {
   selectedPkp.value = item
   showPkpModal.value = true
}

// Open KSWP Modal
const openKswpModal = (item) => {
   selectedKswp.value = item
   showKswpModal.value = true
}


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
