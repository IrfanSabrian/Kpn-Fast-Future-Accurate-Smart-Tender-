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
          <!-- Avatar (Replaced with Social Media Style Icon) -->
          <div
            class="w-12 h-12 md:w-16 md:h-16 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center p-1 border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden relative group"
          >
            <!-- Icon Placeholder -->
            <div
              class="w-full h-full bg-slate-100 dark:bg-slate-800 rounded-lg flex items-center justify-center text-slate-300 dark:text-slate-600 shadow-inner"
            >
              <i class="fas fa-user text-2xl md:text-3xl"></i>
            </div>
          </div>

          <div class="flex-1 min-w-0">
            <div class="flex items-center gap-3 mb-1">
              <!-- Name with Skeleton Loader -->
              <h1
                v-if="person"
                class="text-lg md:text-2xl font-black text-slate-900 dark:text-white leading-tight truncate"
              >
                {{ person.nama_lengkap }}
              </h1>
              <BaseSkeleton
                v-else
                width="200px"
                height="1.5rem"
                class="rounded-md"
              />

              <!-- ID Badge -->
              <span
                v-if="person"
                class="hidden md:inline-flex items-center justify-center uppercase text-[10px] font-bold tracking-widest px-3 py-1 rounded-md border h-6 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border-blue-200 dark:border-blue-800"
              >
                ACTIVE
              </span>
            </div>

            <div
              class="flex flex-wrap items-center gap-x-6 gap-y-1 text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium"
            >
              <div class="flex items-center gap-2 font-mono">
                <span class="text-slate-300">ID:</span>
                <span
                  v-if="person"
                  class="text-blue-600 dark:text-blue-400 font-bold"
                  >{{ person.id_personel }}</span
                >
                <BaseSkeleton
                  v-else
                  width="80px"
                  height="1rem"
                  class="rounded"
                />
              </div>
              <div
                class="flex items-center gap-2"
                v-if="person?.no_hp || !person"
              >
                <template v-if="person">
                  <i class="fas fa-phone text-slate-300"></i>
                  <span>{{ person.no_hp }}</span>
                </template>
                <!-- Don't show skeleton for optional phone, or maybe show small one? User asked for skeleton support. -->
                <!-- Keeping it clean, usually ID and Name are essential for skeleton. -->
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Right Side Actions (Slot) -->
      <div class="hidden md:flex items-center ml-4 gap-2">
        <slot name="actions"></slot>
      </div>
    </div>

    <!-- Navigation Tabs (Glider) -->
    <div
      class="max-w-[1800px] mx-auto px-4 md:px-6 overflow-x-auto no-scrollbar mask-gradient bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm"
    >
      <div
        class="relative flex items-center gap-0.5 md:gap-1 py-2"
        role="tablist"
      >
        <!-- Glider -->

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
              ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50/50 dark:bg-blue-900/10'
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
import { ref, watch, onMounted, nextTick } from "vue";
import BaseSkeleton from "~/components/BaseSkeleton.vue";

const props = defineProps({
  person: Object,
  activeTab: String,
  tabs: Array,
  initials: String,
});

const emit = defineEmits(["back", "tab-change"]);
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
