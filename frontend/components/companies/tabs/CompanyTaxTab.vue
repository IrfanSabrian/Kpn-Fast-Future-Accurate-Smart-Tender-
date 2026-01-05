<template>
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    <!-- Left: NPWP & PKP -->
    <div class="space-y-6">
      <!-- NPWP Compact -->
      <div
        class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5"
      >
        <div
          class="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700 pb-3"
        >
          <h3
            class="font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-2"
          >
            <i class="fas fa-id-card text-blue-500"></i> NPWP Perusahaan
          </h3>
          <div class="flex gap-2">
            <button
              v-if="taxData.npwp?.[0]?.npwp_perusahaan_url"
              @click="$emit('open-modal', 'npwp', taxData.npwp[0])"
              class="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded border border-blue-100 hover:bg-blue-100 transition-colors"
            >
              <i class="fas fa-file-pdf"></i> View
            </button>
            <button
              v-if="!taxData.npwp?.length"
              @click="$emit('open-modal', 'npwp', null)"
              class="w-6 h-6 rounded bg-blue-50 hover:bg-blue-100 text-blue-600 flex items-center justify-center transition-colors"
              title="Tambah NPWP"
            >
              <i class="fas fa-plus text-xs"></i>
            </button>
          </div>
        </div>
        <div v-if="taxData.npwp?.length > 0" class="space-y-2">
          <div v-for="item in taxData.npwp" :key="item.id_npwp_perusahaan">
            <div
              class="grid grid-cols-[140px_1fr] gap-2 py-1 border-b border-dashed border-slate-50 dark:border-slate-700"
            >
              <div
                class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
              >
                NOMOR NPWP
              </div>
              <div
                class="text-sm font-mono font-bold text-slate-800 dark:text-white"
              >
                {{ item.nomor_npwp }}
              </div>
            </div>
            <div
              class="grid grid-cols-[140px_1fr] gap-2 py-1 border-b border-dashed border-slate-50 dark:border-slate-700"
            >
              <div
                class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
              >
                NAMA WAJIB PAJAK
              </div>
              <div class="text-xs font-bold text-slate-700 dark:text-slate-200">
                {{ item.nama_wajib_pajak }}
              </div>
            </div>
            <div
              class="grid grid-cols-[140px_1fr] gap-2 py-1 border-b border-dashed border-slate-50 dark:border-slate-700"
            >
              <div
                class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
              >
                ALAMAT
              </div>
              <div class="text-xs text-slate-600 dark:text-slate-300">
                {{ item.alamat_npwp }}
              </div>
            </div>
            <div
              class="grid grid-cols-[140px_1fr] gap-2 py-1 border-b border-dashed border-slate-50 dark:border-slate-700"
            >
              <div
                class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
              >
                KPP
              </div>
              <div class="text-xs text-slate-700 dark:text-slate-200">
                {{ item.kpp || "-" }}
              </div>
            </div>
            <div class="grid grid-cols-[140px_1fr] gap-2 py-1">
              <div
                class="text-[10px] font-bold text-slate-400 uppercase pt-0.5"
              >
                TGL TERDAFTAR
              </div>
              <div class="text-xs text-slate-700 dark:text-slate-200">
                {{ item.tanggal_terdaftar || "-" }}
              </div>
            </div>
          </div>
        </div>
        <div v-else class="space-y-2">
          <!-- Empty State Placeholders -->
          <div
            v-for="label in [
              'NOMOR NPWP',
              'NAMA WAJIB PAJAK',
              'ALAMAT',
              'KPP',
              'TGL TERDAFTAR',
            ]"
            :key="label"
            class="grid grid-cols-[140px_1fr] gap-2 py-1 border-b border-dashed border-slate-50 dark:border-slate-700 last:border-0"
          >
            <div class="text-[10px] font-bold text-slate-400 uppercase pt-0.5">
              {{ label }}
            </div>
            <div class="text-xs font-bold text-slate-400 dark:text-slate-500">
              -
            </div>
          </div>
        </div>
      </div>

      <!-- PKP -->
      <div
        class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5"
      >
        <div
          class="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700 pb-3"
        >
          <h3
            class="font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-2"
          >
            <i class="fas fa-stamp text-orange-500"></i> Status PKP
          </h3>
          <div class="flex gap-2">
            <button
              v-if="taxData.pkp?.[0]?.url_pkp"
              @click="$emit('open-modal', 'pkp', taxData.pkp[0])"
              class="text-[10px] font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded border border-orange-100 hover:bg-orange-100 transition-colors"
            >
              <i class="fas fa-file-pdf"></i> View
            </button>
            <!-- Hide Add button if PKP data exists -->
            <button
              v-if="!taxData.pkp?.length"
              @click="$emit('open-modal', 'pkp', null)"
              class="w-6 h-6 rounded bg-orange-50 hover:bg-orange-100 text-orange-600 flex items-center justify-center transition-colors"
              title="Tambah PKP"
            >
              <i class="fas fa-plus text-xs"></i>
            </button>
          </div>
        </div>
        <div v-if="taxData.pkp?.length > 0">
          <div v-for="item in taxData.pkp" :key="item.id_pkp" class="space-y-4">
            <div class="flex items-center gap-3">
              <div
                class="w-10 h-10 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center"
              >
                <i class="fas fa-check"></i>
              </div>
              <div>
                <div class="text-[10px] font-bold text-slate-400 uppercase">
                  STATUS
                </div>
                <div class="text-sm font-bold text-slate-800 dark:text-white">
                  {{ item.status || "PKP" }}
                </div>
              </div>
            </div>
            <div
              class="space-y-2 mt-2 bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg border border-slate-100 dark:border-slate-700"
            >
              <div class="flex justify-between">
                <span class="text-[10px] font-bold text-slate-500 uppercase"
                  >Nomor PKP</span
                >
                <span
                  class="text-xs font-mono font-bold text-slate-700 dark:text-slate-200"
                  >{{ item.nomor_pkp }}</span
                >
              </div>
              <div class="flex justify-between">
                <span class="text-[10px] font-bold text-slate-500 uppercase"
                  >Tgl Pengukuhan</span
                >
                <span
                  class="text-xs font-medium text-slate-700 dark:text-slate-200"
                  >{{ item.tanggal_pengukuhan }}</span
                >
              </div>
            </div>
          </div>
        </div>
        <div v-else>
          <div class="flex items-center gap-3 mb-3">
            <div
              class="w-10 h-10 rounded-full bg-orange-100 dark:bg-orange-900/20 text-orange-400 flex items-center justify-center opacity-50"
            >
              <i class="fas fa-check"></i>
            </div>
            <div>
              <div class="text-[10px] font-bold text-slate-400 uppercase">
                STATUS
              </div>
              <div class="text-sm font-bold text-slate-400 dark:text-slate-500">
                -
              </div>
            </div>
          </div>
          <div
            class="space-y-2 mt-2 bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg border border-slate-100 dark:border-slate-700"
          >
            <div class="flex justify-between">
              <span class="text-[10px] font-bold text-slate-400 uppercase"
                >Nomor PKP</span
              >
              <span
                class="text-xs font-mono font-bold text-slate-400 dark:text-slate-500"
                >-</span
              >
            </div>
            <div class="flex justify-between">
              <span class="text-[10px] font-bold text-slate-400 uppercase"
                >Tgl Pengukuhan</span
              >
              <span
                class="text-xs font-medium text-slate-400 dark:text-slate-500"
                >-</span
              >
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right: SPT & KSWP -->
    <div class="space-y-6">
      <!-- SPT History Compact -->
      <div
        class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden"
      >
        <div
          class="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center"
        >
          <h3
            class="font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-2"
          >
            <i class="fas fa-history text-purple-500"></i> Riwayat SPT
          </h3>
          <button
            @click="$emit('open-modal', 'spt', null)"
            class="w-6 h-6 rounded bg-purple-50 hover:bg-purple-100 text-purple-600 flex items-center justify-center transition-colors"
            title="Tambah SPT"
          >
            <i class="fas fa-plus text-xs"></i>
          </button>
        </div>
        <div
          v-if="taxData.spt?.length > 0"
          class="max-h-[300px] overflow-y-auto"
        >
          <table class="w-full text-xs text-left">
            <thead
              class="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold sticky top-0 dark:text-slate-400"
            >
              <tr>
                <th class="px-4 py-2 bg-slate-50 dark:bg-slate-800">Tahun</th>
                <th class="px-4 py-2 bg-slate-50 dark:bg-slate-800">Jenis</th>
                <th class="px-4 py-2 bg-slate-50 dark:bg-slate-800">Status</th>
                <th class="px-4 py-2 bg-slate-50 dark:bg-slate-800 text-right">
                  #
                </th>
              </tr>
            </thead>
            <tbody class="divide-y divide-slate-100 dark:divide-slate-700">
              <tr
                v-for="item in taxData.spt"
                :key="item.id_spt"
                @click="$emit('open-modal', 'spt', item)"
                class="hover:bg-slate-50 dark:hover:bg-slate-800/50 cursor-pointer"
              >
                <td class="px-4 py-2 font-bold">
                  <div class="flex items-center gap-2">
                    {{ item.tahun_pajak }}
                    <span
                      v-if="isYearExpired(item.tahun_pajak)"
                      class="px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-orange-100 text-orange-700 border border-orange-200"
                      title="Tahun pajak sudah lewat"
                    >
                      ⚠ Expired
                    </span>
                  </div>
                </td>
                <td class="px-4 py-2">{{ item.jenis_spt }}</td>
                <td class="px-4 py-2">
                  <span
                    class="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase bg-green-100 text-green-700 border border-green-200"
                    >{{ item.status_spt }}</span
                  >
                </td>
                <td class="px-4 py-2 text-right">
                  <div class="flex items-center justify-end gap-2">
                    <button class="text-blue-600 hover:text-blue-700 font-bold">
                      View
                    </button>
                    <button
                      @click.stop="$emit('delete-spt', item.id_spt)"
                      class="text-red-500 hover:text-red-700"
                      title="Hapus SPT"
                    >
                      <i class="fas fa-trash"></i>
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <div v-else>
          <table class="w-full text-xs text-left">
            <thead
              class="bg-slate-50 dark:bg-slate-800 text-slate-500 uppercase font-bold dark:text-slate-400"
            >
              <tr>
                <th class="px-4 py-2">Tahun</th>
                <th class="px-4 py-2">Jenis</th>
                <th class="px-4 py-2">Status</th>
                <th class="px-4 py-2 text-right">#</th>
              </tr>
            </thead>
            <tbody>
              <tr class="border-b border-slate-100 dark:border-slate-700">
                <td
                  class="px-4 py-3 font-bold text-slate-400"
                  colspan="4"
                  text-center
                >
                  Belum ada data SPT
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- KSWP -->
      <div
        class="bg-white dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 p-5"
      >
        <div
          class="flex items-center justify-between mb-4 border-b border-slate-100 dark:border-slate-700 pb-3"
        >
          <h3
            class="font-bold text-slate-700 dark:text-slate-200 text-sm flex items-center gap-2"
          >
            <i class="fas fa-check-double text-emerald-500"></i> Status KSWP
          </h3>
          <div class="flex gap-2">
            <button
              v-if="taxData.kswp?.[0]?.kswp_url"
              @click="$emit('open-modal', 'kswp', taxData.kswp[0])"
              class="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100 hover:bg-emerald-100 transition-colors"
            >
              <i class="fas fa-file-pdf"></i> View
            </button>
            <!-- Hide Add button if KSWP data exists -->
            <button
              v-if="!taxData.kswp?.length"
              @click="$emit('open-modal', 'kswp', null)"
              class="w-6 h-6 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center transition-colors"
              title="Tambah KSWP"
            >
              <i class="fas fa-plus text-xs"></i>
            </button>
          </div>
        </div>
        <div v-if="taxData.kswp?.length > 0">
          <div
            v-for="item in taxData.kswp"
            :key="item.id_kswp"
            class="space-y-2 bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg border border-slate-100 dark:border-slate-700"
          >
            <div class="text-center mb-3">
              <div
                class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold border border-slate-200 dark:border-slate-600 text-xs"
              >
                <i class="fas fa-check-circle text-emerald-500"></i>
                {{ item.status_kswp || "-" }}
              </div>
            </div>

            <div class="flex justify-between text-[10px]">
              <span class="font-bold text-slate-400 uppercase">Tahun KSWP</span>
              <span
                class="font-mono font-bold text-slate-700 dark:text-slate-200"
                >{{ item.tahun_kswp || "-" }}</span
              >
            </div>
            <div class="flex justify-between text-[10px]">
              <span class="font-bold text-slate-400 uppercase">NPWP</span>
              <span
                class="font-mono font-bold text-slate-700 dark:text-slate-200"
                >{{ item.npwp || "-" }}</span
              >
            </div>
            <div class="flex justify-between text-[10px]">
              <span class="font-bold text-slate-400 uppercase"
                >Wajib Pajak</span
              >
              <span class="font-bold text-slate-700 dark:text-slate-200">{{
                item.nama_wp || "-"
              }}</span>
            </div>
            <div
              class="text-[10px] pt-2 border-t border-slate-200 dark:border-slate-600"
            >
              <span class="font-bold text-slate-400 uppercase block mb-1"
                >Tanggal Terbit</span
              >
              <span class="text-xs text-slate-700 dark:text-slate-200">{{
                item.tanggal_terbit || "-"
              }}</span>
            </div>
          </div>
        </div>
        <div v-else>
          <div class="text-center mb-3">
            <div
              class="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-400 font-bold border border-slate-200 dark:border-slate-600 text-xs opacity-50"
            >
              <i class="fas fa-check-circle"></i>
              -
            </div>
          </div>
          <div
            class="space-y-2 bg-slate-50 dark:bg-slate-700/30 p-3 rounded-lg border border-slate-100 dark:border-slate-700"
          >
            <div class="flex justify-between text-[10px]">
              <span class="font-bold text-slate-400 uppercase">NIK/NPWP</span>
              <span
                class="font-mono font-bold text-slate-400 dark:text-slate-500"
                >-</span
              >
            </div>
            <!-- Placeholders -->
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  taxData: {
    type: Object,
    required: true,
  },
});

defineEmits(["open-modal", "delete-spt"]);

// Helper function to check if tax year has expired
const isYearExpired = (taxYear) => {
  if (!taxYear) return false;
  const currentYear = new Date().getFullYear();
  const year = parseInt(taxYear);
  return year < currentYear;
};
</script>
