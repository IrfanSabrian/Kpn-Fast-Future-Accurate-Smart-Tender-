<template>
  <div class="file-upload-button">
    <label class="form-label" v-if="label">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <div class="upload-area">
      <input
        ref="fileInput"
        type="file"
        :accept="accept"
        @change="handleFileChange"
        :disabled="disabled || uploading"
        class="hidden"
      />
      
      <!-- Upload Button / Current File -->
      <div v-if="!currentFile && !modelValue" class="upload-prompt">
        <button
          type="button"
          @click="triggerFileInput"
          :disabled="disabled || uploading"
          class="btn-upload"
        >
          <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          <span v-if="uploading">Uploading...</span>
          <span v-else>{{ buttonText || 'Upload File' }}</span>
        </button>
        <p class="upload-hint">{{ helpText || 'Klik untuk memilih file' }}</p>
      </div>

      <!-- File Preview -->
      <div v-else class="file-preview">
        <div class="file-info">
          <svg class="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
          </svg>
          <div class="file-details">
            <p class="file-name">{{ currentFileName }}</p>
            <p class="file-size" v-if="currentFileSize">{{ formatFileSize(currentFileSize) }}</p>
          </div>
        </div>
        
        <div class="file-actions">
          <a
            v-if="modelValue"
            :href="modelValue"
            target="_blank"
            class="btn-view"
            title="Lihat File"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </a>
          <button
            type="button"
            @click="removeFile"
            :disabled="disabled || uploading"
            class="btn-remove"
            title="Hapus"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
      </div>

      <!-- Progress Bar -->
      <div v-if="uploading" class="upload-progress">
        <div class="progress-bar" :style="{ width: `${uploadProgress}%` }"></div>
      </div>
    </div>

    <p v-if="error" class="text-red-500 text-sm mt-1">{{ error }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Props {
  modelValue?: string | null
  label?: string
  required?: boolean
  disabled?: boolean
  error?: string
  helpText?: string
  buttonText?: string
  accept?: string
  maxSize?: number // in MB
}

const props = withDefaults(defineProps<Props>(), {
  accept: '*/*',
  maxSize: 10
})

const emit = defineEmits(['update:modelValue', 'file-selected'])

const fileInput = ref<HTMLInputElement | null>(null)
const currentFile = ref<File | null>(null)
const uploading = ref(false)
const uploadProgress = ref(0)

const currentFileName = computed(() => {
  if (currentFile.value) return currentFile.value.name
  if (props.modelValue) {
    const url = props.modelValue
    const parts = url.split('/')
    return parts[parts.length - 1] || 'File'
  }
  return ''
})

const currentFileSize = computed(() => {
  return currentFile.value?.size || 0
})

const triggerFileInput = () => {
  fileInput.value?.click()
}

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement
  const file = target.files?.[0]
  
  if (!file) return

  // Validate file size
  const fileSizeMB = file.size / (1024 * 1024)
  if (fileSizeMB > props.maxSize) {
    alert(`File terlalu besar! Maksimal ${props.maxSize}MB`)
    return
  }

  currentFile.value = file
  emit('file-selected', file)
  
  // Reset input
  if (target) target.value = ''
}

const removeFile = () => {
  currentFile.value = null
  emit('update:modelValue', null)
}

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
}

// Expose methods for parent component
defineExpose({
  setUploading: (status: boolean) => { uploading.value = status },
  setProgress: (progress: number) => { uploadProgress.value = progress },
  clearFile: () => { currentFile.value = null }
})
</script>

<style scoped>
.file-upload-button {
  @apply mb-4;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 mb-2;
}

.upload-area {
  @apply border-2 border-dashed border-gray-300 rounded-lg p-4 transition-colors;
}

.upload-area:hover {
  @apply border-blue-400;
}

.upload-prompt {
  @apply text-center;
}

.btn-upload {
  @apply inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed;
}

.upload-hint {
  @apply text-sm text-gray-500 mt-2;
}

.file-preview {
  @apply flex items-center justify-between;
}

.file-info {
  @apply flex items-center gap-3;
}

.file-details {
  @apply text-sm;
}

.file-name {
  @apply font-medium text-gray-800;
}

.file-size {
  @apply text-gray-500 text-xs;
}

.file-actions {
  @apply flex gap-2;
}

.btn-view {
  @apply p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors;
}

.btn-remove {
  @apply p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed;
}

.upload-progress {
  @apply mt-2 h-2 bg-gray-200 rounded-full overflow-hidden;
}

.progress-bar {
  @apply h-full bg-blue-600 transition-all duration-300;
}
</style>
