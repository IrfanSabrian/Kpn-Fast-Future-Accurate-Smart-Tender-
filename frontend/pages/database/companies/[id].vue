<template>
  <div class="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans pb-20">
    <!-- Technical Header -->
    <header class="sticky top-0 z-40 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-700 shadow-sm transition-all duration-200">
      <div class="max-w-[1800px] mx-auto px-4 md:px-6 h-16 md:h-20 flex items-center justify-between">
        <div class="flex items-center gap-4 md:gap-6">
          <button @click="router.push('/database/companies')" class="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-600 transition-colors">
            <i class="fas fa-arrow-left"></i>
          </button>
          
          <div class="h-8 md:h-10 w-px bg-slate-200 dark:bg-slate-700"></div>

          <div class="flex items-center gap-4">
             <div class="w-10 h-10 md:w-12 md:h-12 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center font-bold text-slate-500 overflow-hidden border border-slate-200 dark:border-slate-600">
                <img v-if="company?.logo_url" :src="company.logo_url" class="w-full h-full object-contain" />
                <span v-else>{{ company ? getInitials(company.nama_perusahaan) : '...' }}</span>
             </div>
             <div>
               <h1 class="text-base md:text-xl font-bold text-slate-900 dark:text-white leading-tight truncate max-w-[200px] md:max-w-md">
                 {{ company?.nama_perusahaan || 'Loading...' }}
               </h1>
               <div class="flex items-center gap-2 text-xs md:text-sm text-slate-500 dark:text-slate-400 font-mono">
                 <span class="bg-slate-100 dark:bg-slate-700 px-1.5 rounded">{{ company?.id_perusahaan || 'ID-____' }}</span>
                 <span v-if="company?.status" class="uppercase text-[10px] font-bold tracking-wider px-1.5 py-0.5 rounded" :class="company.status === 'Pusat' ? 'bg-blue-100 text-blue-700' : 'bg-slate-200 text-slate-600'">
                   {{ company?.status }}
                 </span>
               </div>
             </div>
          </div>
        </div>

        <!-- Header Actions -->
        <div class="flex items-center gap-3">
          <div class="hidden md:flex flex-col items-end mr-4">
            <span class="text-[10px] uppercase tracking-widest text-slate-400 font-bold">Verification Status</span>
            <div class="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-sm">
              <i class="fas fa-check-circle"></i>
              <span>VERIFIED</span>
            </div>
          </div>
          <button class="px-3 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-600 dark:text-slate-300 rounded-lg text-sm font-bold transition-colors">
            <i class="fas fa-print mr-1"></i> Report
          </button>
        </div>
      </div>
    </header>

    <!-- Main Layout Grid -->
    <div class="max-w-[1800px] mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
      
      <!-- Left Sidebar (Navigation) -->
      <aside class="lg:col-span-2 space-y-1 lg:sticky lg:top-24 lg:self-start overflow-x-auto lg:overflow-visible flex lg:block gap-2 pb-2 lg:pb-0">
        <button
          v-for="tab in tabs"
          :key="tab.id"
          @click="activeTab = tab.id"
          class="flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all w-full min-w-[140px] whitespace-nowrap lg:whitespace-normal"
          :class="activeTab === tab.id 
            ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/30 ring-1 ring-blue-500' 
            : 'text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400'"
        >
          <i :class="[tab.icon, 'w-5 text-center']" class="text-base opacity-80"></i>
          <span>{{ tab.label }}</span>
          <span v-if="tab.count !== null" 
                class="ml-auto text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[20px] text-center"
                :class="activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-500'">
            {{ tab.count }}
          </span>
        </button>
      </aside>

      <!-- Main Content Area -->
      <main class="lg:col-span-10 min-h-[60vh]">
        
        <!-- Tab Header & Actions -->
        <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h2 class="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <i :class="getTabIcon(activeTab)" class="text-blue-500"></i>
              Manage {{ getTabLabel(activeTab) }}
            </h2>
            <p class="text-sm text-slate-500 dark:text-slate-400">
              Technical data & legal documents repository.
            </p>
          </div>
          <button
            @click="openAddModal(activeTab)"
            class="px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-lg text-sm font-bold shadow-lg hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 group"
          >
            <i class="fas fa-plus group-hover:rotate-90 transition-transform"></i>
            <span>ENTRI DATA</span>
          </button>
        </div>

        <!-- Loading State -->
        <div v-if="loadingTab" class="py-20 flex flex-col items-center justify-center text-slate-400">
           <div class="w-10 h-10 border-4 border-blue-100 border-t-blue-600 rounded-full animate-spin mb-4"></div>
           <span class="text-xs font-mono animate-pulse">Retrieving Data...</span>
        </div>

        <!-- Content Views -->
        <div v-else class="animate-fade-in-up">
          
          <!-- Empty State -->
          <div v-if="getTabData(activeTab).length === 0" class="border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-12 text-center text-slate-400">
             <i :class="getTabIcon(activeTab)" class="text-4xl mb-3 opacity-30"></i>
             <p class="text-sm">Belum ada data {{ getTabLabel(activeTab) }} terdaftar.</p>
          </div>

          <!-- GRID VIEW: Akta -->
          <div v-if="activeTab === 'akta'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            <div v-for="item in akta" :key="item.nomor_akta" class="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-blue-400 hover:shadow-lg transition-all p-5 relative overflow-hidden">
               <div class="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
               <div class="flex justify-between items-start mb-3 pl-2">
                  <div>
                    <span class="text-[10px] font-bold text-slate-400 uppercase tracking-widest">NOMOR AKTA</span>
                    <h3 class="text-lg font-mono font-bold text-slate-900 dark:text-white">{{ item.nomor_akta }}</h3>
                  </div>
                  <div class="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button @click="openEditModal('akta', item)" class="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded"><i class="fas fa-pen text-xs"></i></button>
                     <button @click="confirmDelete('akta', item)" class="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded"><i class="fas fa-trash text-xs"></i></button>
                  </div>
               </div>
               <div class="grid grid-cols-2 gap-4 pl-2 text-sm text-slate-600 dark:text-slate-300">
                  <div>
                    <p class="text-[10px] text-slate-400 font-bold mb-0.5">TANGGAL</p>
                    <p class="font-medium">{{ item.tanggal_akta || '-' }}</p>
                  </div>
                   <div>
                    <p class="text-[10px] text-slate-400 font-bold mb-0.5">NOTARIS</p>
                    <p class="font-medium truncate" :title="item.nama_notaris">{{ item.nama_notaris || '-' }}</p>
                  </div>
               </div>
               <div class="pl-2 mt-4 pt-3 border-t border-slate-100 dark:border-slate-700/50 flex gap-2">
                 <button v-if="item.url_dokumen" class="flex-1 py-1.5 bg-slate-50 dark:bg-slate-700/30 text-blue-600 dark:text-blue-400 text-xs font-bold rounded flex items-center justify-center gap-2 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors">
                    <i class="fas fa-file-pdf"></i> Dokumen
                 </button>
               </div>
            </div>
          </div>

          <!-- GRID VIEW: Pejabat -->
          <div v-if="activeTab === 'pejabat'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
             <div v-for="item in pejabat" :key="item.nik" class="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-cyan-400 hover:shadow-lg transition-all p-5 relative">
              <div class="flex items-start gap-4 mb-4">
                 <div class="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-400 font-bold text-lg">
                    {{ getInitials(item.nama) }}
                 </div>
                 <div class="flex-grow min-w-0">
                    <span class="inline-block px-2 py-0.5 bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 text-[10px] font-bold rounded mb-1">{{ item.jabatan || 'PEJABAT' }}</span>
                    <h3 class="font-bold text-slate-900 dark:text-white truncate">{{ item.nama }}</h3>
                    <p class="text-xs text-slate-500 font-mono">{{ item.nik }}</p>
                 </div>
                 <div class="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                     <button @click="openEditModal('pejabat', item)" class="p-1.5 hover:bg-blue-50 text-slate-400 hover:text-blue-600 rounded"><i class="fas fa-pen text-xs"></i></button>
                     <button @click="confirmDelete('pejabat', item)" class="p-1.5 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded"><i class="fas fa-trash text-xs"></i></button>
                 </div>
              </div>
              <div class="text-xs text-slate-500 space-y-1 bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg">
                 <div class="flex justify-between"><span class="font-semibold text-slate-400">NPWP:</span> <span>{{ item.npwp_pribadi || '-' }}</span></div>
                 <div class="flex justify-between"><span class="font-semibold text-slate-400">Saham:</span> <span>{{ item.saham_lembar || 0 }} lbr</span></div>
              </div>
            </div>
          </div>

          <!-- GRID VIEW: NIB -->
          <div v-if="activeTab === 'nib'" class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
             <div v-for="item in nib" :key="item.nomor_nib" class="group bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:border-indigo-400 transition-all">
                <div class="flex justify-between items-start mb-2">
                   <h3 class="text-xl font-mono font-bold text-slate-900 dark:text-white group-hover:text-indigo-600">{{ item.nomor_nib }}</h3>
                   <div class="flex gap-1">
                     <button @click="openEditModal('nib', item)" class="p-1 hover:bg-blue-50 text-slate-300 hover:text-blue-600 rounded"><i class="fas fa-pen text-xs"></i></button>
                     <button @click="confirmDelete('nib', item)" class="p-1 hover:bg-red-50 text-slate-300 hover:text-red-600 rounded"><i class="fas fa-trash text-xs"></i></button>
                  </div>
                </div>
                <div class="space-y-3 mt-4">
                   <div>
                     <p class="text-[10px] font-bold text-slate-400">KBLI CODE</p>
                     <div class="flex flex-wrap gap-1 mt-1">
                       <span class="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 text-xs font-mono font-bold rounded border border-slate-200 dark:border-slate-600">{{ item.kbli || 'N/A' }}</span>
                     </div>
                   </div>
                   <button v-if="item.url_dokumen" class="w-full py-2 border border-dashed border-slate-300 hover:border-indigo-500 text-slate-500 hover:text-indigo-600 rounded text-xs font-bold transition-colors">
                     <i class="fas fa-paperclip mr-1"></i> Preview NIB
                   </button>
                </div>
             </div>
          </div>

           <!-- GRID VIEW: Projects -->
          <div v-if="activeTab === 'projects'" class="grid grid-cols-1 gap-4">
            <div v-for="group in groupedProjects" :key="group.id_project" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-6 hover:shadow-md transition-all">
               <div class="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                 <div>
                   <span class="text-[10px] font-bold text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/20 px-2 py-1 rounded uppercase tracking-wider mb-2 inline-block">Active Project</span>
                   <h3 class="text-xl font-bold text-slate-900 dark:text-white">{{ group.nama_project }}</h3>
                 </div>
                 <div class="flex items-center gap-2">
                    <button @click="openProjectDetailModal(group)" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg transition-colors">
                       <i class="fas fa-users-cog mr-2"></i> Kelola Tim
                    </button>
                    <button @click="openEditProjectModal(group)" class="w-9 h-9 flex items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition-colors">
                        <i class="fas fa-pen"></i>
                    </button>
                     <button @click="confirmDeleteProject(group)" class="w-9 h-9 flex items-center justify-center bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors">
                        <i class="fas fa-trash"></i>
                    </button>
                 </div>
               </div>
               
               <!-- Team Members Preview -->
               <div class="bg-slate-50 dark:bg-slate-700/30 rounded-lg p-4">
                 <h4 class="text-xs font-bold text-slate-400 uppercase mb-3 px-1">Assigned Personnel ({{ group.personil.length }})</h4>
                 <div class="flex -space-x-2 overflow-hidden px-1">
                   <div v-for="(p, i) in group.personil.slice(0,5)" :key="i" class="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-200 dark:bg-slate-600 flex items-center justify-center text-xs font-bold text-slate-500" :title="p.nama">
                      {{ getInitials(p.nama) }}
                   </div>
                   <div v-if="group.personil.length > 5" class="w-8 h-8 rounded-full border-2 border-white dark:border-slate-800 bg-slate-800 text-white flex items-center justify-center text-xs font-bold z-10">
                     +{{ group.personil.length - 5 }}
                   </div>
                 </div>
                 <div v-if="group.personil.length === 0" class="text-sm text-slate-400 italic px-1">No personnel assigned yet.</div>
               </div>
            </div>
          </div>

          <!-- GRID VIEW: Pengalaman -->
             <div v-if="activeTab === 'pengalaman'" class="grid grid-cols-1 gap-4">
                <div v-for="item in pengalaman" :key="item.nomor_kontrak" class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5 hover:border-green-400 transition-all">
                  <div class="flex items-start justify-between"> 
                    <div>
                      <span class="text-xs font-mono text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{{ item.tahun || 'YYYY' }}</span>
                      <h3 class="font-bold text-slate-800 dark:text-white mt-2">{{ item.nama_pekerjaan }}</h3>
                      <p class="text-sm text-slate-500">{{ item.pemberi_tugas }}</p>
                    </div>
                    <div class="flex gap-2">
                       <button @click="openEditModal('pengalaman', item)" class="text-slate-400 hover:text-blue-600"><i class="fas fa-pen"></i></button>
                       <button @click="confirmDelete('pengalaman', item)" class="text-slate-400 hover:text-red-600"><i class="fas fa-trash"></i></button>
                    </div>
                  </div>
                   <div class="mt-4 pt-3 border-t border-slate-100 dark:border-slate-700 flex justify-between items-center">
                     <div class="text-xs font-bold text-slate-500 uppercase">Nilai Kontrak</div>
                     <div class="font-mono font-bold text-slate-800 dark:text-slate-200">Rp {{ item.nilai_kontrak || 0 }}</div>
                   </div>
                </div>
             </div>

        </div>
      </main>
    </div>

    <!-- Modals -->
    <BaseModal 
      :show="showModal" 
      @close="closeModal" 
      :title="modalTitle"
      max-width="2xl"
    >
      <template #body>
         <form @submit.prevent="saveItem" class="space-y-4">
           <!-- Dynamic Forms based on Type -->
           
           <!-- AKTA FORM -->
           <div v-if="modalType === 'akta'" class="space-y-4">
             <div class="grid grid-cols-2 gap-4">
               <FormInput v-model="formData.nomor_akta" label="Nomor Akta" required />
               <FormInput v-model="formData.tanggal_akta" label="Tanggal" type="date" />
             </div>
             <FormInput v-model="formData.nama_notaris" label="Nama Notaris" required />
             <FormInput v-model="formData.url_dokumen" label="Link Google Drive" />
           </div>

           <!-- PEJABAT FORM -->
           <div v-if="modalType === 'pejabat'" class="space-y-4">
             <div class="grid grid-cols-2 gap-4">
                <FormInput v-model="formData.nama" label="Nama Lengkap" required />
                <FormInput v-model="formData.nik" label="NIK" required />
             </div>
             <div class="grid grid-cols-2 gap-4">
               <FormInput v-model="formData.jabatan" label="Jabatan" placeholder="Direktur / Komisaris" />
               <FormInput v-model="formData.saham_lembar" label="Jml Saham" type="number" />
             </div>
             <FormInput v-model="formData.npwp_pribadi" label="NPWP Pribadi" />
           </div>

           <!-- NIB FORM -->
           <div v-if="modalType === 'nib'" class="space-y-4">
             <FormInput v-model="formData.nomor_nib" label="Nomor Induk Berusaha (NIB)" required class="font-mono" />
             <div class="grid grid-cols-2 gap-4">
                <FormInput v-model="formData.tanggal_terbit" label="Tanggal Terbit" type="date" />
                <FormInput v-model="formData.kbli" label="Kode KBLI (Pisahkan koma)" placeholder="Ex: 41011, 41012" />
             </div>
             <FormInput v-model="formData.url_dokumen" label="Link Dokumen OSS" />
           </div>

           <!-- PROJECT FORM (CREATE ONLY) -->
            <div v-if="modalType === 'projects'" class="space-y-4">
              <FormInput v-model="formData.nama_project" label="Nama Project / Tender" required placeholder="Nama pekerjaan..." />
            </div>

            <!-- PENGALAMAN FORM -->
            <div v-if="modalType === 'pengalaman'" class="space-y-4">
               <FormInput v-model="formData.nama_pekerjaan" label="Nama Pekerjaan" required />
               <FormInput v-model="formData.pemberi_tugas" label="Pemberi Tugas/Owner" />
               <div class="grid grid-cols-2 gap-4">
                  <FormInput v-model="formData.nomor_kontrak" label="No. Kontrak" required />
                  <FormInput v-model="formData.nilai_kontrak" label="Nilai (Rp)" type="number" />
               </div>
               <div class="grid grid-cols-2 gap-4">
                  <FormInput v-model="formData.tanggal_kontrak" label="Tgl Kontrak" type="date" />
                  <FormInput v-model="formData.tahun" label="Tahun Anggaran" type="number" />
               </div>
            </div>

         </form>
      </template>
      <template #footer>
        <button @click="closeModal" class="px-4 py-2 text-slate-600 font-bold hover:bg-slate-100 rounded-lg">BATAL</button>
        <button @click="saveItem" :disabled="saving" class="px-6 py-2 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 flex items-center gap-2">
           <i v-if="saving" class="fas fa-spinner animate-spin"></i>
           {{ saving ? 'SAVING...' : 'SIMPAN' }}
        </button>
      </template>
    </BaseModal>

    <!-- Project Team Management Modal -->
    <BaseModal 
      :show="showProjectDetailModal" 
      @close="closeProjectDetailModal" 
      title="Manajemen Tim Project"
      :subtitle="selectedProject?.nama_project"
      max-width="2xl"
    >
       <template #body>
         <div v-if="selectedProject" class="space-y-6">
            <!-- Add Personil Section -->
            <div class="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-xl border border-blue-100 dark:border-blue-800">
               <label class="block text-xs font-bold text-blue-700 dark:text-blue-300 uppercase mb-2">Assign Tenaga Ahli</label>
               <div class="flex gap-2">
                 <select v-model="selectedNIK" class="flex-1 rounded-lg border-slate-300 text-sm focus:border-blue-500 focus:ring-blue-500 dark:bg-slate-800 dark:border-slate-600">
                    <option value="" disabled>Pilih Personil...</option>
                    <option v-for="p in availablePersonil" :key="p.nik" :value="p.nik">
                       {{ p.nama }} ({{ p.keahlian || 'Staff' }})
                    </option>
                 </select>
                 <button @click="addPersonilToProject" :disabled="!selectedNIK || addingPersonil" class="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50">
                    <i class="fas fa-plus"></i>
                 </button>
               </div>
            </div>

            <!-- Team List -->
            <div>
               <h4 class="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2 text-sm uppercase tracking-wider">
                  <i class="fas fa-users text-slate-400"></i> Current Team ({{ selectedProject.personil.length }})
               </h4>
               <div class="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                  <div v-for="person in selectedProject.personil" :key="person.nik" class="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-blue-300 transition-colors">
                     <div class="flex items-center gap-3">
                        <div class="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center text-slate-500 font-bold text-xs">
                           {{ getInitials(person.nama) }}
                        </div>
                        <div>
                           <p class="font-bold text-slate-800 dark:text-slate-200 text-sm">{{ person.nama }}</p>
                           <p class="text-xs text-slate-500">{{ person.jabatan || 'Tenaga Ahli' }}</p>
                        </div>
                     </div>
                     <button @click="removePersonilFromProject(person.nik)" class="p-2 text-slate-300 hover:text-red-500 transition-colors"><i class="fas fa-times"></i></button>
                  </div>
                  <div v-if="selectedProject.personil.length === 0" class="text-center py-8 text-slate-400 italic">
                     No team members assigned yet.
                  </div>
               </div>
            </div>
         </div>
       </template>
    </BaseModal>

    <ConfirmDialog 
      :show="showDeleteDialog" 
      title="Delete Data?" 
      message="Tindakan ini permanen dan tidak dapat dibatalkan." 
      @cancel="showDeleteDialog = false"
      @confirm="deleteItem" 
    />

    <BaseToast ref="toast" />
  </div>
</template>

<script setup>
import BaseModal from '~/components/BaseModal.vue'
import ConfirmDialog from '~/components/ConfirmDialog.vue'
import BaseToast from '~/components/BaseToast.vue'
import FormInput from '~/components/FormInput.vue'

definePageMeta({ layout: 'dashboard' })

const router = useRouter()
const route = useRoute()
const config = useRuntimeConfig()
const companyId = route.params.id

// Refs
const company = ref(null)
const activeTab = ref('akta')
const loading = ref(true)
const toast = ref(null)

// Data Stores
const akta = ref([])
const pejabat = ref([])
const nib = ref([])
const pengalaman = ref([])
const projects = ref([])
const allPersonil = ref([])

// UI States
const showModal = ref(false)
const modalType = ref('')
const isEditing = ref(false)
const saving = ref(false)
const formData = ref({})
const showDeleteDialog = ref(false)
const deleteType = ref('')
const itemToDelete = ref(null)

// Project Specific
const showProjectDetailModal = ref(false)
const selectedProject = ref(null)
const selectedNIK = ref('')
const addingPersonil = ref(false)

const tabLoading = ref({
  akta: false, pejabat: false, nib: false, pengalaman: false, projects: false
})

const loadingTab = computed(() => tabLoading.value[activeTab.value])

// Config
const tabs = computed(() => [
  { id: 'akta', label: 'Akta Pendirian', icon: 'fas fa-book', count: akta.value.length },
  { id: 'pejabat', label: 'Pengurus & Saham', icon: 'fas fa-user-tie', count: pejabat.value.length },
  { id: 'nib', label: 'Legalitas NIB', icon: 'fas fa-stamp', count: nib.value.length },
  { id: 'projects', label: 'Proyek Berjalan', icon: 'fas fa-hard-hat', count: projects.value.length },
  { id: 'pengalaman', label: 'Riwayat Pengalaman', icon: 'fas fa-briefcase', count: pengalaman.value.length },
])

// Helpers
const getInitials = (name) => {
  if (!name) return '?'
  return name.replace(/[^\w\s]/gi, '').split(' ').slice(0,2).map(w => w[0]).join('').toUpperCase()
}

const getTabLabel = (id) => tabs.value.find(t => t.id === id)?.label || id
const getTabIcon = (id) => tabs.value.find(t => t.id === id)?.icon || 'fas fa-folder'
const getTabData = (id) => {
  switch(id) {
    case 'akta': return akta.value
    case 'pejabat': return pejabat.value
    case 'nib': return nib.value
    case 'projects': return projects.value
    case 'pengalaman': return pengalaman.value
    default: return []
  }
}

// Fetch Logic
const fetchCompany = async () => {
  try {
    const res = await fetch(`${config.public.apiBaseUrl}/companies/${companyId}`)
    if (res.ok) company.value = await res.json()
  } catch (e) { console.error(e) }
}

const fetchTabData = async (tab) => {
  tabLoading.value[tab] = true
  try {
    const res = await fetch(`${config.public.apiBaseUrl}/companies/${companyId}/${tab}`)
    if (res.ok) {
      const data = await res.json()
      if(tab === 'akta') akta.value = data
      if(tab === 'pejabat') pejabat.value = data
      if(tab === 'nib') nib.value = data
      if(tab === 'pengalaman') pengalaman.value = data
      if(tab === 'projects') projects.value = data
    }
  } catch (e) { console.error(e) }
  finally { tabLoading.value[tab] = false }
}

const fetchAllPersonil = async () => {
  try {
    const res = await fetch(`${config.public.apiBaseUrl}/personnel`)
    if(res.ok) {
      const json = await res.json()
      allPersonil.value = json.data || []
    }
  } catch (e) { console.error(e) }
}

onMounted(async () => {
  await fetchCompany()
  await Promise.all(['akta','pejabat','nib','projects','pengalaman'].map(fetchTabData))
  await fetchAllPersonil()
  loading.value = false
})

// Modal Actions
const openAddModal = (type) => {
  modalType.value = type
  isEditing.value = false
  formData.value = {}
  showModal.value = true
}

const openEditModal = (type, item) => {
  modalType.value = type
  isEditing.value = true
  formData.value = { ...item }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
  formData.value = {}
}

const modalTitle = computed(() => 
  (isEditing.value ? 'Edit Data ' : 'Tambah Data ') + getTabLabel(modalType.value)
)

const saveItem = async () => {
  saving.value = true
  try {
    const type = modalType.value
    let url = `${config.public.apiBaseUrl}`
    if (isEditing.value) {
       if(type === 'akta') url += `/companies/akta/${formData.value.nomor_akta}`
       if(type === 'pejabat') url += `/companies/pejabat/${formData.value.nik}`
       if(type === 'nib') url += `/companies/nib/${encodeURIComponent(formData.value.nomor_nib)}`
       if(type === 'pengalaman') url += `/companies/pengalaman/${encodeURIComponent(formData.value.nomor_kontrak)}`
       if(type === 'projects') url += `/companies/projects/${formData.value.id_project}`
    } else {
       url += `/companies/${companyId}/${type}`
    }

    const res = await fetch(url, {
      method: isEditing.value ? 'PUT' : 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(formData.value)
    })
    
    if(!res.ok) throw new Error('Gagal menyimpan')
    
    await fetchTabData(type)
    closeModal()
    toast.value.show('Berhasil disimpan', 'success')

  } catch (e) {
    toast.value.show('Error: ' + e.message, 'error')
  } finally {
    saving.value = false
  }
}

// Delete Logic
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
    
    if (type === 'project_group') {
        if(item.personil) {
          for(const p of item.personil) {
             if(p.assignment_id) await fetch(`${config.public.apiBaseUrl}/companies/projects/${p.assignment_id}`, { method: 'DELETE'})
          }
        }
    }

    if(type === 'akta') url += `/companies/akta/${item.nomor_akta}`
    else if(type === 'pejabat') url += `/companies/pejabat/${item.nik}`
    else if(type === 'nib') url += `/companies/nib/${encodeURIComponent(item.nomor_nib)}`
    else if(type === 'pengalaman') url += `/companies/pengalaman/${encodeURIComponent(item.nomor_kontrak)}`
    else if(type === 'projects') url += `/companies/projects/${item.id_project}` || ''

    if(type !== 'project_group') {
       await fetch(url, { method: 'DELETE' })
    }
    
    await fetchTabData(type === 'project_group' ? 'projects' : type)
    showDeleteDialog.value = false
    toast.value.show('Item dihapus', 'success')
  } catch (e) {
    toast.value.show('Gagal hapus: '+e.message, 'error')
  }
}

// Project Logic
const groupedProjects = computed(() => {
  return projects.value.map(proj => {
    const details = (proj.personil || []).map(p => {
      const found = allPersonil.value.find(ap => ap.nik === p.nik)
      return { ...p, ...(found || { nama: 'Unknown' }) }
    })
    return { ...proj, personil: details }
  })
})

const availablePersonil = computed(() => {
  if(!selectedProject.value) return []
  const currentNiks = selectedProject.value.personil.map(p => p.nik)
  return allPersonil.value.filter(p => !currentNiks.includes(p.nik))
})

const openProjectDetailModal = (proj) => {
  selectedProject.value = JSON.parse(JSON.stringify(proj))
  showProjectDetailModal.value = true
}

const closeProjectDetailModal = () => {
  showProjectDetailModal.value = false
  selectedProject.value = null
}

const addPersonilToProject = async () => {
  if(!selectedNIK.value) return 
  addingPersonil.value = true
  try {
    await fetch(`${config.public.apiBaseUrl}/companies/projects/${selectedProject.value.id_project}/personil`, {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ id_perusahaan: companyId, nik: selectedNIK.value })
    })
    await fetchTabData('projects')
    setTimeout(() => {
       const fresh = groupedProjects.value.find(p => p.id_project === selectedProject.value.id_project)
       if(fresh) selectedProject.value = JSON.parse(JSON.stringify(fresh))
    }, 100)
    selectedNIK.value = ''
    toast.value.show('Personil ditambahkan', 'success')
  } catch(e) {
    toast.value.show('Gagal: '+e.message, 'error')
  } finally {
    addingPersonil.value = false
  }
}

const removePersonilFromProject = async (nik) => {
  try {
    await fetch(`${config.public.apiBaseUrl}/companies/projects/${selectedProject.value.id_project}/personil/${nik}`, { method: 'DELETE' })
    await fetchTabData('projects')
    setTimeout(() => {
       const fresh = groupedProjects.value.find(p => p.id_project === selectedProject.value.id_project)
       if(fresh) selectedProject.value = JSON.parse(JSON.stringify(fresh))
    }, 100)
    toast.value.show('Personil dihapus', 'success')
  } catch(e) { console.error(e) }
}

const openEditProjectModal = (proj) => {
   modalType.value = 'projects'
   isEditing.value = true
   formData.value = { id_project: proj.id_project, nama_project: proj.nama_project }
   showModal.value = true
}

const confirmDeleteProject = (proj) => {
  deleteType.value = 'project_group'
  itemToDelete.value = proj
  showDeleteDialog.value = true
}

</script>

<style scoped>
/* Custom Scrollbar for compact lists */
.custom-scrollbar::-webkit-scrollbar {
  width: 4px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #cbd5e1;
  border-radius: 20px;
}
.dark .custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: #475569;
}
</style>
