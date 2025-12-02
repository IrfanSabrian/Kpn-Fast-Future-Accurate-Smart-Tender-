<template>
  <div class="bg-white dark:bg-gray-800 rounded-2xl border-2 border-gray-200 dark:border-gray-700 shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden group">
    <!-- Card Header with Gradient -->
    <div class="h-24 bg-gradient-to-r from-blue-600 to-violet-600 relative">
      <div class="absolute inset-0 bg-black/10"></div>
      <div class="absolute -bottom-12 left-6">
        <!-- Photo Placeholder -->
        <div class="w-24 h-24 rounded-xl bg-white dark:bg-gray-700 border-4 border-white dark:border-gray-800 shadow-lg flex items-center justify-center overflow-hidden">
          <i v-if="!person.foto" class="fas fa-user text-4xl text-gray-400 dark:text-gray-500"></i>
          <img v-else :src="person.foto" :alt="person.nama" class="w-full h-full object-cover">
        </div>
      </div>
    </div>

    <!-- Card Body -->
    <div class="pt-16 px-6 pb-6">
      <!-- Name and NIK -->
      <div class="mb-4">
        <h3 class="text-2xl font-black text-gray-900 dark:text-white mb-1">
          {{ person.nama || 'Nama Tidak Tersedia' }}
        </h3>
        <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
          <i class="fas fa-id-card"></i>
          <span class="font-mono font-semibold">NIK: {{ person.nik || '-' }}</span>
        </div>
      </div>

      <!-- Info Grid - Clean Style -->
      <div class="space-y-3 mb-4">
        <!-- Tempat/Tanggal Lahir -->
        <div>
          <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">Tempat/Tgl Lahir</p>
          <p class="text-sm text-gray-900 dark:text-white font-medium">
            <span v-if="person.tempat_lahir && person.tanggal_lahir">
              {{ person.tempat_lahir }}, {{ formatDate(person.tanggal_lahir) }}
            </span>
            <span v-else-if="person.tempat_lahir">{{ person.tempat_lahir }}</span>
            <span v-else-if="person.tanggal_lahir">{{ formatDate(person.tanggal_lahir) }}</span>
            <span v-else class="text-gray-400">-</span>
          </p>
        </div>

        <!-- Pendidikan -->
        <div>
          <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">Pendidikan</p>
          <p class="text-sm text-gray-900 dark:text-white font-medium">
            <span v-if="person.strata && person.jurusan_pendidikan">
              {{ person.strata }} - {{ person.jurusan_pendidikan }}
            </span>
            <span v-else-if="person.strata">{{ person.strata }}</span>
            <span v-else-if="person.jurusan_pendidikan">{{ person.jurusan_pendidikan }}</span>
            <span v-else class="text-gray-400">-</span>
          </p>
        </div>

        <!-- Sertifikat Keahlian -->
        <div>
          <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">Sertifikat Keahlian</p>
          <p class="text-sm text-gray-900 dark:text-white font-medium line-clamp-2" :title="person.sertifikat_keahlian">
            {{ person.sertifikat_keahlian || '-' }}
          </p>
        </div>

        <!-- Pengalaman Kerja -->
        <div>
          <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">Pengalaman Kerja</p>
          <p class="text-sm text-gray-900 dark:text-white font-medium">
            {{ person.pengalaman_kerja || '-' }}
          </p>
        </div>

        <!-- ID Perusahaan (if exists) -->
        <div v-if="person.id_perusahaan">
          <p class="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold mb-1">ID Perusahaan</p>
          <p class="text-sm text-gray-900 dark:text-white font-medium font-mono">
            {{ person.id_perusahaan }}
          </p>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-2 pt-4 border-t border-gray-200 dark:border-gray-700">
        <button
          @click="$emit('view', person)"
          class="flex-1 px-4 py-2.5 bg-green-100 hover:bg-green-200 dark:bg-green-900/50 dark:hover:bg-green-900 text-green-700 dark:text-green-300 rounded-xl transition-all font-semibold text-sm flex items-center justify-center gap-2 group"
        >
          <i class="fas fa-eye group-hover:scale-110 transition-transform"></i>
          <span>Detail</span>
        </button>
        <button
          @click="$emit('edit', person)"
          class="flex-1 px-4 py-2.5 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900/50 dark:hover:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-xl transition-all font-semibold text-sm flex items-center justify-center gap-2 group"
        >
          <i class="fas fa-edit group-hover:scale-110 transition-transform"></i>
          <span>Edit</span>
        </button>
        <button
          @click="$emit('delete', person)"
          class="flex-1 px-4 py-2.5 bg-red-100 hover:bg-red-200 dark:bg-red-900/50 dark:hover:bg-red-900 text-red-700 dark:text-red-300 rounded-xl transition-all font-semibold text-sm flex items-center justify-center gap-2 group"
        >
          <i class="fas fa-trash group-hover:scale-110 transition-transform"></i>
          <span>Hapus</span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  person: {
    type: Object,
    required: true
  }
})

defineEmits(['view', 'edit', 'delete'])

const formatDate = (dateString) => {
  if (!dateString) return '-'
  const date = new Date(dateString)
  return date.toLocaleDateString('id-ID', { 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })
}
</script>

<style scoped>
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  line-clamp: 2;
  overflow: hidden;
}
</style>
