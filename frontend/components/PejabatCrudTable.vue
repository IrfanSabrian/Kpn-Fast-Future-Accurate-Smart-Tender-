<template>
  <div class="pejabat-crud-table">
    <div class="header">
      <h3 class="title">Struktur Pimpinan Perusahaan</h3>
      <button
        type="button"
        @click="openAddModal"
        class="btn-add"
      >
        <svg class="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
        </svg>
        Tambah Pejabat
      </button>
    </div>

    <p class="help-text">
      Minimal harus ada 1 Direktur Utama. Tambahkan Wakil Direktur, Komisaris, Komanditer, atau jabatan lainnya sesuai kebutuhan.
    </p>

    <!-- Table -->
    <div v-if="pejabatList.length > 0" class="table-container">
      <table class="table">
        <thead>
          <tr>
            <th class="w-12">#</th>
            <th>Nama Lengkap</th>
            <th>Jabatan</th>
            <th>No. KTP</th>
            <th>No. Telepon</th>
            <th class="text-center w-32">Aksi</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(pejabat, index) in sortedPejabatList" :key="pejabat.id_pejabat || index">
            <td class="text-center">{{ index + 1 }}</td>
            <td class="font-medium">{{ pejabat.nama_lengkap }}</td>
            <td>
              <span :class="['badge-jabatan', getJabatanBadgeClass(pejabat.jenis_jabatan)]">
                {{ getJabatanDisplay(pejabat) }}
              </span>
            </td>
            <td>{{ pejabat.no_ktp || '-' }}</td>
            <td>{{ pejabat.no_telp || '-' }}</td>
            <td>
              <div class="action-buttons">
                <button
                  type="button"
                  @click="openEditModal(pejabat, index)"
                  class="btn-edit"
                  title="Edit"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
                <button
                  type="button"
                  @click="confirmDelete(pejabat, index)"
                  class="btn-delete"
                  :disabled="isDirekturUtamaAndOnlyOne(pejabat)"
                  :title="isDirekturUtamaAndOnlyOne(pejabat) ? 'Tidak bisa dihapus (minimal 1 Direktur Utama)' : 'Hapus'"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <svg class="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
      <p class="text-gray-600">Belum ada data pejabat.</p>
      <p class="text-sm text-red-600 font-medium mt-2">⚠️ Minimal harus ada 1 Direktur Utama</p>
    </div>

    <!-- Form Modal -->
    <BaseModal :show="showModal" @close="closeModal" max-width="2xl">
      <template #header>
        <h3 class="text-xl font-bold">{{ isEditMode ? 'Edit Pejabat' : 'Tambah Pejabat' }}</h3>
      </template>
      <template #body>
        <form @submit.prevent="savePejabat" class="space-y-4">
          <FormInput
            v-model="formData.nama_lengkap"
            label="Nama Lengkap"
            placeholder="Contoh: Ir. Budi Santoso, M.T."
            required
            :error="formErrors.nama_lengkap"
          />

          <FormSelect
            v-model="formData.jenis_jabatan"
            label="Jenis Jabatan"
            :options="jabatanOptions"
            placeholder="Pilih jenis jabatan..."
            required
            :error="formErrors.jenis_jabatan"
          />

          <FormInput
            v-if="formData.jenis_jabatan === 'Lainnya'"
            v-model="formData.jabatan_custom"
            label="Nama Jabatan Custom"
            placeholder="Contoh: Sekretaris, Bendahara, dll"
            :required="formData.jenis_jabatan === 'Lainnya'"
            help-text="Isi nama jabatan khusus jika memilih 'Lainnya'"
            :error="formErrors.jabatan_custom"
          />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              v-model="formData.no_ktp"
              label="No. KTP"
              placeholder="16 digit"
              maxlength="16"
              :error="formErrors.no_ktp"
            />

            <FormInput
              v-model="formData.npwp"
              label="NPWP"
              placeholder="Contoh: 12.345.678.9-012.000"
              :error="formErrors.npwp"
            />
          </div>

          <FormInput
            v-model="formData.alamat"
            label="Alamat"
            type="textarea"
            :rows="3"
            placeholder="Alamat lengkap pejabat"
          />

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormInput
              v-model="formData.no_telp"
              label="No. Telepon"
              placeholder="08xxx"
              :error="formErrors.no_telp"
            />

            <FormInput
              v-model="formData.email"
              label="Email"
              type="email"
              placeholder="email@example.com"
              :error="formErrors.email"
            />
          </div>
        </form>
      </template>
      <template #footer>
        <button type="button" @click="closeModal" class="btn-cancel">
          Batal
        </button>
        <button type="button" @click="savePejabat" class="btn-save">
          {{ isEditMode ? 'Update' : 'Simpan' }}
        </button>
      </template>
    </BaseModal>

    <!-- Confirm Delete Dialog -->
    <ConfirmDialog
      :show="showConfirmDelete"
      type="danger"
      title="Konfirmasi Hapus"
      :message="`Apakah Anda yakin ingin menghapus pejabat: ${pejabatToDelete?.nama_lengkap}?`"
      confirm-text="Hapus"
      cancel-text="Batal"
      @confirm="deletePejabat"
      @cancel="showConfirmDelete = false"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface Pejabat {
  id_pejabat?: string
  nama_lengkap: string
  jenis_jabatan: 'Direktur Utama' | 'Wakil Direktur' | 'Komisaris' | 'Komanditer' | 'Lainnya'
  jabatan_custom?: string
  no_ktp?: string
  npwp?: string
  alamat?: string
  no_telp?: string
  email?: string
  urutan?: number
  status?: 'Active' | 'Inactive'
}

interface Props {
  modelValue: Pejabat[]
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: () => []
})

const emit = defineEmits(['update:modelValue'])

const pejabatList = ref<Pejabat[]>([...props.modelValue])
const showModal = ref(false)
const showConfirmDelete = ref(false)
const isEditMode = ref(false)
const editIndex = ref<number>(-1)
const pejabatToDelete = ref<Pejabat | null>(null)
const deleteIndex = ref<number>(-1)

const formData = ref<Pejabat>({
  nama_lengkap: '',
  jenis_jabatan: 'Direktur Utama',
  jabatan_custom: '',
  no_ktp: '',
  npwp: '',
  alamat: '',
  no_telp: '',
  email: '',
  urutan: 0,
  status: 'Active'
})

const formErrors = ref({
  nama_lengkap: '',
  jenis_jabatan: '',
  jabatan_custom: '',
  no_ktp: '',
  npwp: '',
  no_telp: '',
  email: ''
})

const jabatanOptions = [
  { value: 'Direktur Utama', label: 'Direktur Utama' },
  { value: 'Wakil Direktur', label: 'Wakil Direktur' },
  { value: 'Komisaris', label: 'Komisaris' },
  { value: 'Komanditer', label: 'Komanditer' },
  { value: 'Lainnya', label: 'Lainnya (Custom)' }
]

// Sorted by urutan
const sortedPejabatList = computed(() => {
  return [...pejabatList.value].sort((a, b) => (a.urutan || 0) - (b.urutan || 0))
})

const getJabatanDisplay = (pejabat: Pejabat): string => {
  if (pejabat.jenis_jabatan === 'Lainnya' && pejabat.jabatan_custom) {
    return pejabat.jabatan_custom
  }
  return pejabat.jenis_jabatan
}

const getJabatanBadgeClass = (jenis: string): string => {
  switch (jenis) {
    case 'Direktur Utama': return 'badge-primary'
    case 'Wakil Direktur': return 'badge-secondary'
    case 'Komisaris': return 'badge-info'
    case 'Komanditer': return 'badge-warning'
    default: return 'badge-default'
  }
}

const isDirekturUtamaAndOnlyOne = (pejabat: Pejabat): boolean => {
  if (pejabat.jenis_jabatan !== 'Direktur Utama') return false
  const dirUtamaCount = pejabatList.value.filter(p => p.jenis_jabatan === 'Direktur Utama').length
  return dirUtamaCount <= 1
}

const openAddModal = () => {
  isEditMode.value = false
  editIndex.value = -1
  formData.value = {
    nama_lengkap: '',
    jenis_jabatan: 'Direktur Utama',
    jabatan_custom: '',
    no_ktp: '',
    npwp: '',
    alamat: '',
    no_telp: '',
    email: '',
    urutan: pejabatList.value.length + 1,
    status: 'Active'
  }
  formErrors.value = {
    nama_lengkap: '',
    jenis_jabatan: '',
    jabatan_custom: '',
    no_ktp: '',
    npwp: '',
    no_telp: '',
    email: ''
  }
  showModal.value = true
}

const openEditModal = (pejabat: Pejabat, index: number) => {
  isEditMode.value = true
  editIndex.value = index
  formData.value = { ...pejabat }
  showModal.value = true
}

const closeModal = () => {
  showModal.value = false
}

const savePejabat = () => {
  // Validate
  formErrors.value = {
    nama_lengkap: '',
    jenis_jabatan: '',
    jabatan_custom: '',
    no_ktp: '',
    npwp: '',
    no_telp: '',
    email: ''
  }

  if (!formData.value.nama_lengkap.trim()) {
    formErrors.value.nama_lengkap = 'Nama lengkap wajib diisi'
    return
  }

  if (!formData.value.jenis_jabatan) {
    formErrors.value.jenis_jabatan = 'Jenis jabatan wajib dipilih'
    return
  }

  if (formData.value.jenis_jabatan === 'Lainnya' && !formData.value.jabatan_custom?.trim()) {
    formErrors.value.jabatan_custom = 'Jabatan custom wajib diisi untuk jenis "Lainnya"'
    return
  }

  // Save
  if (isEditMode.value && editIndex.value >= 0) {
    pejabatList.value[editIndex.value] = { ...formData.value }
  } else {
    pejabatList.value.push({ ...formData.value })
  }

  emit('update:modelValue', pejabatList.value)
  closeModal()
}

const confirmDelete = (pejabat: Pejabat, index: number) => {
  if (isDirekturUtamaAndOnlyOne(pejabat)) {
    alert('Tidak bisa menghapus Direktur Utama! Minimal harus ada 1 Direktur Utama.')
    return
  }

  pejabatToDelete.value = pejabat
  deleteIndex.value = index
  showConfirmDelete.value = true
}

const deletePejabat = () => {
  if (deleteIndex.value >= 0) {
    pejabatList.value.splice(deleteIndex.value, 1)
    emit('update:modelValue', pejabatList.value)
  }
  showConfirmDelete.value = false
  pejabatToDelete.value = null
  deleteIndex.value = -1
}

// Watch props changes
watch(() => props.modelValue, (newValue) => {
  pejabatList.value = [...newValue]
}, { deep: true })
</script>

<style scoped>
.pejabat-crud-table {
  @apply border border-gray-200 rounded-lg p-6 bg-white;
}

.header {
  @apply flex items-center justify-between mb-4;
}

.title {
  @apply text-lg font-semibold text-gray-800;
}

.btn-add {
  @apply inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium;
}

.help-text {
  @apply text-sm text-gray-600 mb-4 pb-4 border-b border-gray-200;
}

.table-container {
  @apply overflow-x-auto;
}

.table {
  @apply w-full text-sm;
}

.table thead {
  @apply bg-gray-50 border-b-2 border-gray-200;
}

.table th {
  @apply px-4 py-3 text-left font-semibold text-gray-700;
}

.table tbody tr {
  @apply border-b border-gray-100 hover:bg-gray-50 transition-colors;
}

.table td {
  @apply px-4 py-3 text-gray-800;
}

.badge-jabatan {
  @apply inline-block px-3 py-1 rounded-full text-xs font-semibold;
}

.badge-primary {
  @apply bg-blue-100 text-blue-800;
}

.badge-secondary {
  @apply bg-green-100 text-green-800;
}

.badge-info {
  @apply bg-purple-100 text-purple-800;
}

.badge-warning {
  @apply bg-yellow-100 text-yellow-800;
}

.badge-default {
  @apply bg-gray-100 text-gray-800;
}

.action-buttons {
  @apply flex items-center justify-center gap-2;
}

.btn-edit {
  @apply p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors;
}

.btn-delete {
  @apply p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed;
}

.empty-state {
  @apply text-center py-12 bg-gray-50 rounded-lg;
}

.btn-cancel {
  @apply px-6 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-lg transition-colors;
}

.btn-save {
  @apply px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors;
}
</style>
