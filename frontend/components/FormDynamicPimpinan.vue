<template>
  <div class="dynamic-pimpinan">
    <label class="form-label">
      Struktur Pimpinan
      <span class="text-red-500">*</span>
    </label>
    <p class="text-gray-500 text-sm mb-3">
      Isi struktur pimpinan perusahaan (minimal Direktur Utama wajib diisi)
    </p>

    <div class="space-y-3">
      <!-- Direktur Utama (Required) -->
      <div class="pimpinan-item">
        <FormInput
          v-model="pimpinan.direktur_utama"
          label="Direktur Utama"
          placeholder="Contoh: Ir. Budi Santoso, M.T."
          required
          :error="errors.direktur_utama"
        />
      </div>

      <!-- Wakil Direktur (Optional) -->
      <div class="pimpinan-item">
        <FormInput
          v-model="pimpinan.wakil_direktur"
          label="Wakil Direktur"
          placeholder="Contoh: Drs. Ahmad Fauzi"
        />
      </div>

      <!-- Komisaris (Optional) -->
      <div class="pimpinan-item">
        <FormInput
          v-model="pimpinan.komisaris"
          label="Komisaris"
          placeholder="Contoh: Dr. Siti Nurhaliza"
        />
      </div>

      <!-- Dynamic Additional Positions -->
      <div
        v-for="(item, index) in additionalPositions"
        :key="index"
        class="pimpinan-item flex gap-2"
      >
        <FormInput
          v-model="item.jabatan"
          label="Jabatan"
          placeholder="Contoh: Sekretaris"
          class="flex-1"
        />
        <FormInput
          v-model="item.nama"
          label="Nama"
          placeholder="Contoh: Andi Wijaya, S.E."
          class="flex-1"
        />
        <button
          type="button"
          @click="removePosition(index)"
          class="btn-remove mt-6"
          title="Hapus"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>

    <!-- Add More Button -->
    <button
      type="button"
      @click="addPosition"
      class="btn-add-position mt-3"
    >
      <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
      </svg>
      Tambah Jabatan Lainnya
    </button>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'

interface Pimpinan {
  direktur_utama: string
  wakil_direktur?: string
  komisaris?: string
  [key: string]: string | undefined
}

interface AdditionalPosition {
  jabatan: string
  nama: string
}

interface Props {
  modelValue: Pimpinan | string
  errors?: {
    direktur_utama?: string
  }
}

const props = withDefaults(defineProps<Props>(), {
  errors: () => ({})
})

const emit = defineEmits(['update:modelValue'])

// Parse initial value
const pimpinan = ref<Pimpinan>({
  direktur_utama: '',
  wakil_direktur: '',
  komisaris: ''
})

const additionalPositions = ref<AdditionalPosition[]>([])

// Initialize from modelValue
const initializeValue = (value: Pimpinan | string) => {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value)
      pimpinan.value.direktur_utama = parsed.direktur_utama || ''
      pimpinan.value.wakil_direktur = parsed.wakil_direktur || ''
      pimpinan.value.komisaris = parsed.komisaris || ''
      
      // Extract additional positions
      const additional: AdditionalPosition[] = []
      Object.keys(parsed).forEach(key => {
        if (!['direktur_utama', 'wakil_direktur', 'komisaris'].includes(key) && parsed[key]) {
          additional.push({ jabatan: key, nama: parsed[key] })
        }
      })
      additionalPositions.value = additional
    } catch (e) {
      console.error('Failed to parse pimpinan JSON:', e)
    }
  } else if (value && typeof value === 'object') {
    pimpinan.value.direktur_utama = value.direktur_utama || ''
    pimpinan.value.wakil_direktur = value.wakil_direktur || ''
    pimpinan.value.komisaris = value.komisaris || ''
    
    // Extract additional positions
    const additional: AdditionalPosition[] = []
    Object.keys(value).forEach(key => {
      if (!['direktur_utama', 'wakil_direktur', 'komisaris'].includes(key) && value[key]) {
        additional.push({ jabatan: key, nama: value[key] })
      }
    })
    additionalPositions.value = additional
  }
}

if (props.modelValue) {
  initializeValue(props.modelValue)
}

const addPosition = () => {
  additionalPositions.value.push({ jabatan: '', nama: '' })
}

const removePosition = (index: number) => {
  additionalPositions.value.splice(index, 1)
}

// Build final object
const buildPimpinanObject = () => {
  const result: Pimpinan = {
    direktur_utama: pimpinan.value.direktur_utama.trim()
  }

  if (pimpinan.value.wakil_direktur?.trim()) {
    result.wakil_direktur = pimpinan.value.wakil_direktur.trim()
  }

  if (pimpinan.value.komisaris?.trim()) {
    result.komisaris = pimpinan.value.komisaris.trim()
  }

  // Add additional positions
  additionalPositions.value.forEach(pos => {
    if (pos.jabatan.trim() && pos.nama.trim()) {
      result[pos.jabatan.trim().toLowerCase().replace(/\s+/g, '_')] = pos.nama.trim()
    }
  })

  return result
}

// Watch for changes
watch([pimpinan, additionalPositions], () => {
  emit('update:modelValue', buildPimpinanObject())
}, { deep: true })
</script>

<style scoped>
.dynamic-pimpinan {
  @apply border border-gray-200 rounded-lg p-4 bg-gray-50;
}

.form-label {
  @apply block text-sm font-medium text-gray-700 mb-1;
}

.pimpinan-item {
  @apply bg-white rounded-lg p-3 border border-gray-200;
}

.btn-remove {
  @apply text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg p-2 transition-colors;
}

.btn-add-position {
  @apply flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors;
}
</style>
