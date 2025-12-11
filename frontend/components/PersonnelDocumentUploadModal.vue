<template>
  <BaseModal :show="show" @close="handleClose" maxWidth="7xl">
    <template #header>
      <div class="flex items-center gap-4">
        <div class="w-12 h-12 rounded-2xl flex items-center justify-center shadow-sm" :class="iconBackgroundClass">
          <i :class="iconClass" class="text-xl"></i>
        </div>
        <div>
          <h3 class="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
            {{ isEditMode ? 'Edit' : 'Tambah' }} {{ documentLabel }}
          </h3>
          <p class="text-sm text-slate-500 dark:text-slate-400 font-medium">{{ personName }}</p>
        </div>
      </div>
    </template>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Left Column: Form Fields (2 cols) - Scrollable -->
      <div class="lg:col-span-2">
        <div class="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-700 flex flex-col h-[400px]">
          <h4 class="text-xs font-bold text-slate-900 dark:text-slate-100 px-4 pt-4 pb-3 flex items-center gap-2 flex-shrink-0">
            <span class="w-1 h-3 bg-blue-500 rounded-full"></span>
            Informasi Dokumen
          </h4>
          <!-- Scrollable Form Container -->
          <div class="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4">
            <slot name="form-fields"></slot>
          </div>
        </div>
      </div>

      <!-- Right Column: Upload/Preview (1 col) -->
      <div class="lg:col-span-1 bg-slate-100 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[400px] relative group">
        
        <!-- Header with Actions -->
        <div class="bg-white dark:bg-slate-800 px-3 py-2 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center shadow-sm z-10">
          <div class="flex items-center gap-2">
            <i class="fas" :class="previewUrl ? 'fa-eye' : 'fa-cloud-upload-alt text-blue-500'"></i>
            <span class="text-[10px] font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
              {{ previewUrl ? 'Preview' : 'Upload' }}
            </span>
          </div>
          
          <!-- Actions: Only visible if previewUrl exists -->
          <div v-if="previewUrl" class="flex items-center gap-1">
             <input
              ref="fileInput"
              type="file"
              accept=".pdf,application/pdf"
              @change="handleFileSelect"
              class="hidden"
            />
             <button @click="$refs.fileInput.click()" type="button" class="text-[10px] bg-slate-100 hover:bg-blue-50 text-slate-600 hover:text-blue-600 px-2 py-1 rounded transition-colors border border-slate-200 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300 dark:hover:text-blue-400">
                <i class="fas fa-sync-alt"></i>
             </button>
             <button @click="removeFile" type="button" class="text-[10px] bg-red-50 hover:bg-red-100 text-red-600 px-2 py-1 rounded transition-colors border border-red-100 dark:bg-red-900/20 dark:border-red-900/30 dark:text-red-400">
                <i class="fas fa-trash"></i>
             </button>
          </div>
        </div>
        
        <!-- Content Area -->
        <div class="flex-1 relative bg-slate-200/50 dark:bg-slate-900/50 p-2">
           <!-- State 1: Preview -->
           <iframe
            v-if="previewUrl"
            :src="previewUrl"
            class="w-full h-full rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm bg-white"
          ></iframe>
          
          <!-- State 2: Upload Placeholder/Button -->
          <div 
            v-else 
            @click="$refs.fileInput.click()"
            class="w-full h-full rounded-lg border-2 border-dashed border-slate-300 dark:border-slate-600 hover:border-blue-500 dark:hover:border-blue-400 bg-white dark:bg-slate-800 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group/upload"
          >
             <input
              v-if="!previewUrl"
              ref="fileInput"
              type="file"
              accept=".pdf,application/pdf"
              @change="handleFileSelect"
              class="hidden"
            />

             <!-- Decoration -->
             <div class="w-16 h-16 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-500 flex items-center justify-center mb-4 group-hover/upload:scale-110 group-hover/upload:rotate-3 transition-transform duration-300 shadow-sm">
                <i class="fas fa-cloud-upload-alt text-2xl"></i>
             </div>
             
             <h3 class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-1 group-hover/upload:text-blue-600 dark:group-hover/upload:text-blue-400">
                Upload PDF
             </h3>
             <p class="text-slate-400 max-w-[150px] text-center text-[10px] mb-3 leading-tight">
                Klik untuk pilih dokumen
             </p>
             
             <div class="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                Max 10MB
             </div>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-3 w-full">
        <button
          @click="handleClose"
          type="button"
          class="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
        >
          Batal
        </button>
        <button
          @click="handleSave"
          :disabled="!canSave || saving"
          type="button"
          class="px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:shadow-none flex items-center gap-2 transform active:scale-95"
          :class="buttonClasses"
        >
          <i v-if="saving" class="fas fa-spinner fa-spin"></i>
          <i v-else class="fas fa-save"></i>
          {{ saving ? 'Menyimpan...' : 'Simpan Dokumen' }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
import BaseModal from '~/components/BaseModal.vue'

const props = defineProps({
  show: Boolean,
  documentType: {
    type: String,
    required: true,
    validator: (value) => ['ktp', 'npwp', 'ijazah', 'cv'].includes(value)
  },
  personName: String,
  isEditMode: Boolean,
  existingFileUrl: String
})

const emit = defineEmits(['close', 'save'])

const documentConfig = {
  ktp: {
    label: 'KTP',
    icon: 'far fa-id-card',
    iconBg: 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400',
    button: 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/30'
  },
  npwp: {
    label: 'NPWP',
    icon: 'fas fa-credit-card',
    iconBg: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    button: 'bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white shadow-orange-500/30'
  },
  ijazah: {
    label: 'Ijazah',
    icon: 'fas fa-graduation-cap',
    iconBg: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    button: 'bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white shadow-purple-500/30'
  },
  cv: {
    label: 'Daftar Riwayat Hidup',
    icon: 'fas fa-file-alt',
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    button: 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-500/30'
  }
}

const config = computed(() => documentConfig[props.documentType])
const documentLabel = computed(() => config.value.label)
const iconClass = computed(() => config.value.icon)
const iconBackgroundClass = computed(() => config.value.iconBg)
const buttonClasses = computed(() => config.value.button)

// File handling
const fileInput = ref(null)
const selectedFile = ref(null)
const previewUrl = ref(props.existingFileUrl || '')
const saving = ref(false)

// Watch for external file URL changes (for edit mode)
watch(() => props.existingFileUrl, (newUrl) => {
  if (newUrl && !selectedFile.value) {
    previewUrl.value = newUrl.includes('drive.google.com') && newUrl.includes('/view') 
      ? newUrl.replace('/view', '/preview')
      : newUrl
  }
})

// Reset state when modal closes
watch(() => props.show, (newShow) => {
  if (!newShow) {
    // Modal closed - reset everything
    saving.value = false
    selectedFile.value = null
    if (!props.existingFileUrl) {
      previewUrl.value = ''
    }
  }
})

// Set initial preview if editing
onMounted(() => {
  if (props.existingFileUrl) {
    previewUrl.value = props.existingFileUrl.includes('drive.google.com') && props.existingFileUrl.includes('/view')
      ? props.existingFileUrl.replace('/view', '/preview')
      : props.existingFileUrl
  }
})

const handleFileSelect = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validate file type
  if (file.type !== 'application/pdf') {
    alert('File harus berformat PDF')
    return
  }

  // Validate file size (10MB)
  if (file.size > 10 * 1024 * 1024) {
    alert('Ukuran file maksimal 10MB')
    return
  }

  selectedFile.value = file

  // Create preview URL
  const reader = new FileReader()
  reader.onload = (e) => {
    previewUrl.value = e.target.result
  }
  reader.readAsDataURL(file)
}

const removeFile = () => {
  selectedFile.value = null
  previewUrl.value = ''
  if (fileInput.value) {
    fileInput.value.value = ''
  }
}

const canSave = computed(() => {
  // In add mode: must have file
  // In edit mode: can save without new file (just updating data)
  return props.isEditMode ? true : selectedFile.value !== null
})

const handleClose = () => {
  removeFile()
  saving.value = false // Reset saving state
  emit('close')
}

const handleSave = async () => {
  if (saving.value) return // Prevent double submit
  
  saving.value = true
  try {
    await emit('save', selectedFile.value)
  } finally {
    // Don't reset saving here - parent will close modal
    // saving will be reset when modal closes
  }
}

// Expose saving state setter
defineExpose({
  setSaving: (state) => {
    saving.value = state
  },
  reset: () => {
    removeFile()
    saving.value = false
  }
})
</script>

<style scoped>
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.3);
  border-radius: 10px;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(107, 114, 128, 0.6);
}
</style>
