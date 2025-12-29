<template>
  <header
    class="sticky top-0 z-30 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-sm transition-all duration-200"
  >
    <div
      class="max-w-[1800px] mx-auto px-4 md:px-6 h-16 md:h-24 flex items-center justify-between"
    >
      <div class="flex items-center gap-4 md:gap-6 flex-1 min-w-0">
        <button
          @click="$emit('back')"
          class="w-10 h-10 flex items-center justify-center rounded-xl bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-blue-600 transition-colors border border-slate-100 dark:border-slate-700"
        >
          <i class="fas fa-arrow-left"></i>
        </button>

        <div class="flex items-center gap-5 flex-1 min-w-0">
          <!-- Logo -->
          <div
            class="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center p-1.5 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden"
          >
            <img
              v-if="shouldShowLogo"
              :src="logoUrl"
              class="w-full h-full object-contain"
              @error="$emit('logo-error', $event)"
            />
            <div
              v-else
              class="w-full h-full bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center"
            >
              <span class="text-sm font-bold text-slate-400 font-mono">{{
                initials
              }}</span>
            </div>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-1">
              <h1
                class="text-lg md:text-2xl font-black text-slate-900 dark:text-white leading-tight truncate"
              >
                {{ company?.nama_perusahaan || "Loading Database..." }}
              </h1>
              <!-- Status Badge -->
              <span
                v-if="company?.status"
                class="hidden md:inline-flex items-center justify-center uppercase text-[10px] font-bold tracking-widest px-3 py-1 rounded-md border h-6"
                :class="getStatusClass(company.status)"
              >
                {{ company?.status }}
              </span>
            </div>

            <div
              class="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium"
            >
              <div class="flex items-center gap-2 font-mono">
                <span class="text-slate-300">ID:</span>
                <span class="text-blue-600 dark:text-blue-400 font-bold">{{
                  company?.id_perusahaan || "..."
                }}</span>
              </div>
              <div class="flex items-center gap-2" v-if="company?.npwp">
                <i class="fas fa-id-card text-slate-300"></i>
                <span>NPWP: {{ company.npwp }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Kop (Letterhead) -->
      <div
        v-if="shouldShowKop"
        class="hidden md:flex items-center justify-end ml-4"
      >
        <div class="h-16 max-w-[300px]">
          <img
            :src="kopUrl"
            class="h-full w-auto object-contain"
            @error="$emit('kop-error', $event)"
            alt="Company Letterhead"
          />
        </div>
      </div>
    </div>

    <!-- Navigation Tabs -->
    <div
      class="max-w-[1800px] mx-auto px-4 md:px-6 overflow-x-auto no-scrollbar mask-gradient bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
    >
      <div
        class="relative flex items-center gap-0.5 md:gap-1 py-2"
        role="tablist"
      >
        <!-- Glider -->
        <div
          class="absolute bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/30 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] z-0 pointer-events-none"
          :style="gliderStyle"
        ></div>

        <button
          v-for="(tab, index) in tabs"
          :key="tab.id"
          :ref="(el) => (tabRefs[index] = el)"
          @click="$emit('tab-change', tab.id)"
          role="tab"
          :aria-selected="activeTab === tab.id"
          class="group relative z-10 px-2.5 md:px-4 py-2 rounded-xl text-sm font-bold transition-all duration-200 flex items-center gap-1.5 whitespace-nowrap bg-transparent"
          :class="[
            activeTab === tab.id
              ? 'text-white'
              : tab.hasData === false
              ? 'text-red-500/70 hover:text-red-600 dark:text-red-400/70 bg-red-50/50 dark:bg-red-900/10'
              : 'text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100/50 dark:hover:bg-slate-800/50',
          ]"
        >
          <i :class="tab.icon" class="text-base opacity-75"></i>
          {{ tab.label }}
        </button>
      </div>
    </div>
  </header>
</template>

<script setup>
const props = defineProps({
  company: Object,
  activeTab: String,
  tabs: Array,
  logoUrl: String,
  kopUrl: String,
  shouldShowLogo: Boolean,
  shouldShowKop: Boolean,
  initials: String,
});

const emit = defineEmits(["back", "tab-change", "logo-error", "kop-error"]);

const getStatusClass = (status) => {
  const statusMap = {
    Aktif:
      "bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 border-green-200 dark:border-green-800",
    "Tidak Aktif":
      "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800",
    Draft:
      "bg-slate-50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800",
    default:
      "bg-slate-50 dark:bg-slate-900/20 text-slate-700 dark:text-slate-400 border-slate-200 dark:border-slate-800",
  };
  return statusMap[status] || statusMap.default;
};

// Sliding Tab Logic
const tabRefs = ref([]);
const gliderStyle = ref({
  width: "0px",
  transform: "translateX(0px)",
  opacity: 0,
  height: "0px",
  top: "0px",
});

const updateGlider = async () => {
  await nextTick();
  const index = props.tabs.findIndex((t) => t.id === props.activeTab);
  const el = tabRefs.value[index];
  if (el) {
    gliderStyle.value = {
      width: `${el.offsetWidth}px`,
      transform: `translateX(${el.offsetLeft}px)`,
      opacity: 1,
      height: `${el.offsetHeight}px`,
      top: `${el.offsetTop}px`,
    };
  }
};

watch(() => props.activeTab, updateGlider);
watch(() => props.tabs, updateGlider, { deep: true });

onMounted(() => {
  setTimeout(updateGlider, 100);
  window.addEventListener("resize", updateGlider);
});
</script>

<style scoped>
.mask-gradient {
  -webkit-mask-image: linear-gradient(
    to right,
    transparent,
    black 20px,
    black calc(100% - 20px),
    transparent
  );
  mask-image: linear-gradient(
    to right,
    transparent,
    black 20px,
    black calc(100% - 20px),
    transparent
  );
}

.no-scrollbar::-webkit-scrollbar {
  display: none;
}

.no-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
</style>
