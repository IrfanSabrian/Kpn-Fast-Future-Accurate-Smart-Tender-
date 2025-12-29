<template>
  <div
    class="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
  >
    <!-- Document is NOT available -->
    <div
      v-if="!hasDocument"
      class="flex flex-col items-center justify-center py-12"
    >
      <div
        class="w-16 h-16 rounded-full flex items-center justify-center mb-4"
        :class="iconBackgroundClass"
      >
        <i :class="`${iconClass} text-2xl`"></i>
      </div>
      <h3 class="text-lg font-bold text-slate-900 dark:text-white mb-1">
        {{ documentLabel }} Belum Tersedia
      </h3>
      <p class="text-sm text-slate-500 mb-6">
        Belum ada data {{ documentLabel }} untuk personel ini
      </p>
      <button
        @click="$emit('add')"
        class="px-6 py-2.5 rounded-xl font-bold transition-all shadow-sm"
        :class="buttonClasses"
      >
        <i class="fas fa-plus mr-2"></i>
        Tambah {{ documentLabel }}
      </button>
    </div>

    <!-- Document is available -->
    <div v-else>
      <div class="flex items-center justify-between px-6 pt-6 pb-4">
        <div class="flex items-center gap-3">
          <div
            class="w-10 h-10 rounded-xl flex items-center justify-center"
            :class="iconBackgroundClass"
          >
            <i :class="`${iconClass} text-lg`"></i>
          </div>
          <div>
            <h3 class="text-lg font-bold text-slate-900 dark:text-white">
              {{ documentLabel }}
            </h3>
            <p class="text-xs text-slate-500">Data tersedia</p>
          </div>
        </div>
        <div class="flex items-center gap-2">
          <button
            @click="$emit('edit')"
            class="w-9 h-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors flex items-center justify-center"
            title="Edit"
          >
            <i class="fas fa-edit text-sm"></i>
          </button>
          <button
            @click="$emit('delete')"
            class="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors flex items-center justify-center"
            title="Hapus"
          >
            <i class="fas fa-trash text-sm"></i>
          </button>
        </div>
      </div>

      <!-- Scrollable Content Area -->
      <div
        class="max-h-[calc(45vh-80px)] overflow-y-auto custom-scrollbar px-6 pb-6"
      >
        <slot name="content"></slot>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  documentType: {
    type: String,
    required: true,
    validator: (value) => ["ktp", "npwp", "ijazah", "cv"].includes(value),
  },
  hasDocument: {
    type: Boolean,
    required: true,
  },
});

defineEmits(["add", "edit", "delete"]);

const documentConfig = {
  ktp: {
    label: "KTP",
    icon: "far fa-id-card",
    color: "blue",
    iconBg: "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400",
    button: "bg-blue-600 hover:bg-blue-700 text-white",
  },
  npwp: {
    label: "NPWP",
    icon: "fas fa-credit-card",
    color: "orange",
    iconBg:
      "bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400",
    button: "bg-orange-600 hover:bg-orange-700 text-white",
  },
  ijazah: {
    label: "Ijazah",
    icon: "fas fa-graduation-cap",
    color: "purple",
    iconBg:
      "bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400",
    button: "bg-purple-600 hover:bg-purple-700 text-white",
  },
  cv: {
    label: "CV",
    icon: "fas fa-file-alt",
    color: "emerald",
    iconBg:
      "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400",
    button: "bg-emerald-600 hover:bg-emerald-700 text-white",
  },
};

const config = computed(() => documentConfig[props.documentType]);
const documentLabel = computed(() => config.value.label);
const iconClass = computed(() => config.value.icon);
const iconBackgroundClass = computed(() => config.value.iconBg);
const buttonClasses = computed(() => config.value.button);
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
