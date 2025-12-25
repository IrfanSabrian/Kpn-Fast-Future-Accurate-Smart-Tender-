<template>
  <div class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col overflow-hidden h-[520px] sticky top-24">
    <!-- Header -->
    <div class="px-6 py-4 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center bg-slate-50 dark:bg-slate-800/50 shrink-0">
      <div>
        <h3 class="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2 text-sm">
          <i class="fas fa-file-pdf text-red-500"></i>
          Dokumen {{ label }}
        </h3>
        <p v-if="subtitle" class="text-xs text-slate-500 mt-1">{{ subtitle }}</p>
      </div>
      
      <div class="flex gap-2">
        <!-- Update Button (when PDF exists and not uploading) -->
        <button 
          v-if="existingPdfUrl && !isPending" 
          @click="$refs.updateInput.click()"
          class="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-700 rounded text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors flex items-center gap-1"
          title="Perbarui PDF"
        >
          <i class="fas fa-sync-alt"></i>
          <span>Perbarui</span>
        </button>
        
        <!-- Hidden file input for update -->
        <input 
          ref="updateInput"
          type="file"
          accept="application/pdf"
          @change="handleFileSelect"
          class="hidden"
        />
        
        <!-- Open in new tab button -->
        <a 
          v-if="existingPdfUrl && !isPending" 
          :href="existingPdfUrl" 
          target="_blank" 
          class="px-3 py-1.5 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded text-[10px] font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 hover:border-blue-400 transition-colors"
        >
          <i class="fas fa-external-link-alt mr-1"></i> Buka Tab Baru
        </a>
      </div>
    </div>
    
    <!-- Content Area -->
    <div class="flex-1 bg-slate-100 dark:bg-slate-900 relative">
      <!-- Existing PDF Preview -->
      <iframe 
        v-if="existingPdfUrl && !isPending" 
        :src="getPreviewUrl(existingPdfUrl)" 
        class="w-full h-full absolute inset-0 border-none"
      ></iframe>
      
      <!-- Pending Upload Preview -->
      <div v-else-if="isPending && pendingPreview" class="w-full h-full flex flex-col">
        <iframe 
          :src="pendingPreview" 
          class="flex-1 w-full border-none"
        ></iframe>
        
        <!-- Footer with Save/Cancel -->
        <div class="p-4 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between">
          <div class="flex-1 min-w-0">
            <p class="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{{ pendingFileName }}</p>
            <p class="text-xs text-slate-500">{{ formatFileSize(pendingFileSize) }}</p>
          </div>
          <div class="flex gap-2 ml-4">
            <button 
              @click="handleCancel"
              :disabled="isUploading"
              class="px-3 py-1.5 text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg transition-all"
            >
              Batal
            </button>
            <button 
              @click="handleSave"
              :disabled="isUploading"
              class="px-4 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <i v-if="isUploading" class="fas fa-spinner fa-spin"></i>
              <i v-else class="fas fa-save"></i>
              {{ isUploading ? 'Menyimpan...' : 'Simpan' }}
            </button>
          </div>
        </div>
      </div>
      
      <!-- Upload State (No PDF) -->
      <div 
        v-else 
        class="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6 cursor-pointer hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors" 
        @click="$refs.uploadInput.click()"
      >
        <input 
          ref="uploadInput"
          type="file"
          accept="application/pdf"
          @change="handleFileSelect"
          class="hidden"
        />
        
        <div 
          class="w-20 h-20 rounded-full flex items-center justify-center mb-4"
          :class="iconBgClass"
        >
          <i :class="iconClass" class="text-3xl"></i>
        </div>
        
        <p class="text-sm font-bold text-slate-700 dark:text-slate-300 mb-1">Upload Dokumen {{ label }}</p>
        <p class="text-xs text-slate-500">Klik untuk pilih file PDF (Max 50MB)</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

// Props
const props = defineProps({
  documentType: {
    type: String,
    required: true
  },
  label: {
    type: String,
    required: true
  },
  subtitle: {
    type: String,
    default: ''
  },
  icon: {
    type: String,
    default: 'fas fa-file-pdf'
  },
  iconColor: {
    type: String,
    default: 'orange' // orange, blue, green, purple, etc.
  },
  existingPdfUrl: {
    type: String,
    default: ''
  },
  pendingFile: {
    type: Object,
    default: null
  },
  pendingPreview: {
    type: String,
    default: ''
  },
  isUploading: {
    type: Boolean,
    default: false
  }
})

// Emits
const emit = defineEmits(['file-selected', 'save', 'cancel'])

// Computed
const isPending = computed(() => !!props.pendingFile)
const pendingFileName = computed(() => props.pendingFile?.name || '')
const pendingFileSize = computed(() => props.pendingFile?.size || 0)

const iconClass = computed(() => props.icon)
const iconBgClass = computed(() => {
  const colorMap = {
    orange: 'bg-orange-100 dark:bg-orange-900/30 text-orange-500',
    blue: 'bg-blue-100 dark:bg-blue-900/30 text-blue-500',
    green: 'bg-green-100 dark:bg-green-900/30 text-green-500',
    purple: 'bg-purple-100 dark:bg-purple-900/30 text-purple-500',
    cyan: 'bg-cyan-100 dark:bg-cyan-900/30 text-cyan-500',
    pink: 'bg-pink-100 dark:bg-pink-900/30 text-pink-500'
  }
  return colorMap[props.iconColor] || colorMap.orange
})

// Methods
const getPreviewUrl = (url) => {
  if (!url) return ''
  if (url.includes('drive.google.com')) {
    return url.replace(/\/view.*$/, '/preview')
  }
  return url
}

const formatFileSize = (bytes) => {
  if (!bytes || bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

const handleFileSelect = (event) => {
  emit('file-selected', event)
}

const handleSave = () => {
  emit('save')
}

const handleCancel = () => {
  emit('cancel')
}
</script>
