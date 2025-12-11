<template>
  <BaseModal :show="show" @close="handleClose" maxWidth="6xl">
    <template #header>
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-full flex items-center justify-center" :class="iconBackgroundClass">
          <i :class="iconClass"></i>
        </div>
        <div>
          <h3 class="text-lg font-bold text-slate-900 dark:text-white">
            {{ isEditMode ? 'Edit' : 'Tambah' }} {{ documentLabel }}
          </h3>
          <p class="text-xs text-slate-500 mt-0.5">{{ personName }}</p>
        </div>
      </div>
    </template>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left Column: Form Fields -->
      <div class="space-y-4">
        <h4 class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">Informasi {{ documentLabel }}</h4>
        
        <slot name="form-fields"></slot>
      </div>

      <!-- Right Column: PDF Upload & Preview -->
      <div class="space-y-4">
        <h4 class="text-sm font-bold text-slate-700 dark:text-slate-200 mb-4">File PDF</h4>
        
        <!-- File Upload -->
        <div class="relative">
          <input
            ref="fileInput"
            type="file"
            accept=".pdf,application/pdf"
            @change="handleFileSelect"
            class="hidden"
          />
          <button
            @click="$refs.fileInput.click()"
            type="button"
            class="w-full px-4 py-3 border-2 border-dashed rounded-xl transition-all"
            :class="selectedFile ? 'border-green-300 bg-green-50 dark:bg-green-900/10' : 'border-slate-300 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500'"
          >
            <div class="flex items-center justify-center gap-2">
              <i :class="selectedFile ? 'fas fa-check-circle text-green-600' : 'fas fa-upload text-slate-400'"></i>
              <span class="text-sm font-medium" :class="selectedFile ? 'text-green-700 dark:text-green-400' : 'text-slate-600 dark:text-slate-300'">
                {{ selectedFile ? selectedFile.name : `Pilih File PDF ${documentLabel}` }}
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-1">Format: PDF | Maks: 10MB</p>
          </button>
        </div>

        <!-- PDF Preview -->
        <div v-if="previewUrl" class="bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-[400px]">
          <div class="bg-slate-50 dark:bg-slate-800 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
            <div class="text-xs font-bold text-slate-700 dark:text-slate-200">Preview Dokumen</div>
            <button
              v-if="selectedFile"
              @click="removeFile"
              type="button"
              class="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100 hover:bg-red-100 transition-colors"
            >
              <i class="fas fa-times mr-1"></i> Hapus File
            </button>
          </div>
          <div class="flex-1 relative">
            <iframe
              :src="previewUrl"
              class="w-full h-full absolute inset-0 border-none"
            ></iframe>
          </div>
        </div>
        <div v-else class="bg-slate-50 dark:bg-slate-900 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center h-[400px]">
          <i class="fas fa-file-pdf text-5xl text-slate-300 mb-3"></i>
          <p class="text-sm text-slate-400">Belum ada file dipilih</p>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="flex items-center justify-end gap-3">
        <button
          @click="handleClose"
          type="button"
          class="px-5 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        >
          Batal
        </button>
        <button
          @click="handleSave"
          :disabled="!canSave || saving"
          type="button"
          class="px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
          :class="buttonClasses"
        >
          <i v-if="saving" class="fas fa-spinner fa-spin mr-2"></i>
          <i v-else class="fas fa-save mr-2"></i>
          {{ saving ? 'Menyimpan...' : 'Simpan' }}
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
    button: 'bg-blue-600 hover:bg-blue-700 text-white'
  },
  npwp: {
    label: 'NPWP',
    icon: 'fas fa-credit-card',
    iconBg: 'bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400',
    button: 'bg-orange-600 hover:bg-orange-700 text-white'
  },
  ijazah: {
    label: 'Ijazah',
    icon: 'fas fa-graduation-cap',
    iconBg: 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400',
    button: 'bg-purple-600 hover:bg-purple-700 text-white'
  },
  cv: {
    label: 'Daftar Riwayat Hidup',
    icon: 'fas fa-file-alt',
    iconBg: 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400',
    button: 'bg-emerald-600 hover:bg-emerald-700 text-white'
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
