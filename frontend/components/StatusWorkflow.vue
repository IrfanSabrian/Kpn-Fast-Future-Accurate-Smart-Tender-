<template>
  <div class="workflow-status">
    <h3 class="workflow-title">Status Workflow Project</h3>
    
    <div class="workflow-steps">
      <!-- Step 1: Upload KAK & HPS -->
      <div :class="['workflow-step', getStepClass(1)]">
        <div class="step-icon">
          <span v-if="hasKakHps" class="icon-check">✓</span>
          <span v-else class="step-number">1</span>
        </div>
        <div class="step-content">
          <h4 class="step-title">Upload KAK & HPS</h4>
          <p class="step-desc">Upload file Kerangka Acuan Kerja dan Harga Perkiraan Sendiri</p>
          <div v-if="hasKakHps" class="step-files">
            <a v-if="data.file_kak_url" :href="data.file_kak_url" target="_blank" class="file-link">
              📄 KAK
            </a>
            <a v-if="data.file_hps_url" :href="data.file_hps_url" target="_blank" class="file-link">
              📄 HPS
            </a>
          </div>
        </div>
      </div>

      <!-- Step 2: Generate & Lengkapi Penawaran -->
      <div :class="['workflow-step', getStepClass(2)]">
        <div class="step-icon">
          <span v-if="isPenawaranLengkap" class="icon-check">✓</span>
          <span v-else-if="isPenawaranDraft" class="icon-progress">⏳</span>
          <span v-else class="step-number">2</span>
        </div>
        <div class="step-content">
          <h4 class="step-title">Lengkapi Penawaran</h4>
          <p class="step-desc">Generate dan lengkapi semua dokumen penawaran (16 folder)</p>
          <div class="step-status">
            <span :class="['status-badge', getStatusBadgeClass(data.status_penawaran)]">
              {{ data.status_penawaran || 'Belum Dimulai' }}
            </span>
          </div>
        </div>
      </div>

      <!-- Step 3: Upload HPS V2 -->
      <div :class="['workflow-step', getStepClass(3)]">
        <div class="step-icon">
          <span v-if="hasHpsV2" class="icon-check">✓</span>
          <span v-else class="step-number">3</span>
        </div>
        <div class="step-content">
          <h4 class="step-title">Upload HPS V2</h4>
          <p class="step-desc">Upload HPS versi penawaran (hasil olahan dari HPS original)</p>
          <div v-if="hasHpsV2" class="step-files">
            <a :href="data.file_hps_v2_url" target="_blank" class="file-link">
              📄 HPS V2 (Penawaran)
            </a>
          </div>
          <div v-if="!isPenawaranLengkap && !hasHpsV2" class="step-locked">
            🔒 Penawaran harus lengkap terlebih dahulu
          </div>
        </div>
      </div>

      <!-- Step 4: Buat Invoice -->
      <div :class="['workflow-step', getStepClass(4)]">
        <div class="step-icon">
          <span v-if="hasInvoice" class="icon-check">✓</span>
          <span v-else class="step-number">4</span>
        </div>
        <div class="step-content">
          <h4 class="step-title">Buat Invoice</h4>
          <p class="step-desc">Buat invoice berdasarkan HPS V2</p>
          <div class="step-status">
            <span :class="['status-badge', getStatusBadgeClass(data.status_invoice)]">
              {{ data.status_invoice || 'Belum' }}
            </span>
          </div>
          <div v-if="!hasHpsV2 && !hasInvoice" class="step-locked">
            🔒 HPS V2 harus ada terlebih dahulu
          </div>
        </div>
      </div>

      <!-- Step 5: Buat Laporan -->
      <div :class="['workflow-step', getStepClass(5)]">
        <div class="step-icon">
          <span v-if="hasLaporan" class="icon-check">✓</span>
          <span v-else class="step-number">5</span>
        </div>
        <div class="step-content">
          <h4 class="step-title">Buat Laporan Akhir</h4>
          <p class="step-desc">Buat laporan akhir project</p>
          <div class="step-status">
            <span :class="['status-badge', getStatusBadgeClass(data.status_laporan)]">
              {{ data.status_laporan || 'Belum' }}
            </span>
          </div>
          <div v-if="!hasInvoice && !hasLaporan" class="step-locked">
            🔒 Invoice harus ada terlebih dahulu
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface ProjectData {
  file_kak_url?: string
  file_hps_url?: string
  file_hps_v2_url?: string
  status_penawaran?: 'Draft' | 'Lengkap'
  status_invoice?: 'Belum' | 'Sudah'
  status_laporan?: 'Belum' | 'Sudah'
}

interface Props {
  data: ProjectData
}

const props = defineProps<Props>()

// Computed properties
const hasKakHps = computed(() => {
  return !!(props.data.file_kak_url && props.data.file_hps_url)
})

const isPenawaranDraft = computed(() => {
  return props.data.status_penawaran === 'Draft'
})

const isPenawaranLengkap = computed(() => {
  return props.data.status_penawaran === 'Lengkap'
})

const hasHpsV2 = computed(() => {
  return !!props.data.file_hps_v2_url
})

const hasInvoice = computed(() => {
  return props.data.status_invoice === 'Sudah'
})

const hasLaporan = computed(() => {
  return props.data.status_laporan === 'Sudah'
})

const getStepClass = (step: number) => {
  switch (step) {
    case 1:
      return hasKakHps.value ? 'completed' : 'active'
    case 2:
      return isPenawaranLengkap.value ? 'completed' : (hasKakHps.value ? 'active' : 'locked')
    case 3:
      return hasHpsV2.value ? 'completed' : (isPenawaranLengkap.value ? 'active' : 'locked')
    case 4:
      return hasInvoice.value ? 'completed' : (hasHpsV2.value ? 'active' : 'locked')
    case 5:
      return hasLaporan.value ? 'completed' : (hasInvoice.value ? 'active' : 'locked')
    default:
      return 'locked'
  }
}

const getStatusBadgeClass = (status?: string) => {
  if (status === 'Lengkap' || status === 'Sudah') return 'status-complete'
  if (status === 'Draft') return 'status-draft'
  return 'status-pending'
}
</script>

<style scoped>
.workflow-status {
  @apply bg-white rounded-lg border border-gray-200 p-6;
}

.workflow-title {
  @apply text-lg font-semibold text-gray-800 mb-6;
}

.workflow-steps {
  @apply space-y-4;
}

.workflow-step {
  @apply flex gap-4 p-4 rounded-lg border-2 transition-all;
}

.workflow-step.completed {
  @apply bg-green-50 border-green-300;
}

.workflow-step.active {
  @apply bg-blue-50 border-blue-300;
}

.workflow-step.locked {
  @apply bg-gray-50 border-gray-200 opacity-60;
}

.step-icon {
  @apply flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold;
}

.workflow-step.completed .step-icon {
  @apply bg-green-500 text-white;
}

.workflow-step.active .step-icon {
  @apply bg-blue-500 text-white;
}

.workflow-step.locked .step-icon {
  @apply bg-gray-300 text-gray-600;
}

.icon-check {
  @apply text-xl;
}

.icon-progress {
  @apply text-xl;
}

.step-number {
  @apply text-lg;
}

.step-content {
  @apply flex-1;
}

.step-title {
  @apply font-semibold text-gray-800 mb-1;
}

.step-desc {
  @apply text-sm text-gray-600 mb-2;
}

.step-files {
  @apply flex gap-2 mt-2;
}

.file-link {
  @apply inline-flex items-center px-3 py-1 bg-white border border-gray-300 rounded-lg text-sm text-blue-600 hover:bg-blue-50 transition-colors;
}

.step-status {
  @apply mt-2;
}

.status-badge {
  @apply inline-block px-3 py-1 rounded-full text-xs font-semibold;
}

.status-badge.status-complete {
  @apply bg-green-100 text-green-800;
}

.status-badge.status-draft {
  @apply bg-yellow-100 text-yellow-800;
}

.status-badge.status-pending {
  @apply bg-gray-100 text-gray-800;
}

.step-locked {
  @apply text-sm text-gray-500 italic mt-2;
}
</style>
