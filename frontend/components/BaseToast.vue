<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-500 cubic-bezier(0.16, 1, 0.3, 1) transform"
        enter-from-class="translate-x-full opacity-0"
        enter-to-class="translate-x-0 opacity-100"
        leave-active-class="transition duration-300 ease-in transform"
        leave-from-class="translate-x-0 opacity-100"
        leave-to-class="translate-x-full opacity-0"
      >
        <div
          v-if="isVisible"
          class="fixed top-4 right-4 z-50 max-w-sm w-full pointer-events-auto"
        >
          <div
            class="bg-white dark:bg-slate-800 rounded-xl shadow-2xl border overflow-hidden backdrop-blur-md"
            :class="[
              props.type === 'success'
                ? 'border-emerald-500'
                : props.type === 'error'
                ? 'border-red-500'
                : props.type === 'warning'
                ? 'border-amber-500'
                : 'border-blue-500',
            ]"
          >
            <!-- Color Bar -->
            <div
              class="h-1"
              :class="[
                props.type === 'success'
                  ? 'bg-emerald-500'
                  : props.type === 'error'
                  ? 'bg-red-500'
                  : props.type === 'warning'
                  ? 'bg-amber-500'
                  : 'bg-blue-500',
              ]"
            ></div>

            <div class="p-4 flex items-start gap-3">
              <!-- Icon -->
              <div
                class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                :class="[
                  props.type === 'success'
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600'
                    : props.type === 'error'
                    ? 'bg-red-100 dark:bg-red-900/30 text-red-600'
                    : props.type === 'warning'
                    ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600'
                    : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600',
                ]"
              >
                <i
                  class="fas"
                  :class="[
                    props.type === 'success'
                      ? 'fa-check-circle'
                      : props.type === 'error'
                      ? 'fa-exclamation-circle'
                      : props.type === 'warning'
                      ? 'fa-exclamation-triangle'
                      : 'fa-info-circle',
                  ]"
                ></i>
              </div>

              <!-- Content -->
              <div class="flex-1 min-w-0">
                <h4
                  class="text-sm font-bold mb-1"
                  :class="[
                    props.type === 'success'
                      ? 'text-emerald-700 dark:text-emerald-400'
                      : props.type === 'error'
                      ? 'text-red-700 dark:text-red-400'
                      : props.type === 'warning'
                      ? 'text-amber-700 dark:text-amber-400'
                      : 'text-blue-700 dark:text-blue-400',
                  ]"
                >
                  {{ props.title }}
                </h4>
                <p
                  class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed"
                >
                  {{ props.message }}
                </p>
              </div>

              <!-- Close Button -->
              <button
                @click="close"
                class="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex-shrink-0"
              >
                <i class="fas fa-times text-xs"></i>
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<script setup>
// Define props
const props = defineProps({
  show: {
    type: Boolean,
    default: false,
  },
  type: {
    type: String,
    default: "info",
    validator: (value) =>
      ["success", "error", "warning", "info"].includes(value),
  },
  title: {
    type: String,
    default: "",
  },
  message: {
    type: String,
    default: "",
  },
  duration: {
    type: Number,
    default: 3000,
  },
});

// Define emits
const emit = defineEmits(["close"]);

// Internal state
const isVisible = ref(false);
let hideTimeout = null;

// Watch for show prop changes
watch(
  () => props.show,
  (newValue) => {
    if (newValue) {
      isVisible.value = true;

      // Clear any existing timeout
      if (hideTimeout) {
        clearTimeout(hideTimeout);
      }

      // Auto-hide after duration
      if (props.duration > 0) {
        hideTimeout = setTimeout(() => {
          close();
        }, props.duration);
      }
    } else {
      isVisible.value = false;
    }
  },
  { immediate: true }
);

const close = () => {
  isVisible.value = false;
  emit("close");

  // Clear timeout when manually closed
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
};

// Cleanup on unmount
onUnmounted(() => {
  if (hideTimeout) {
    clearTimeout(hideTimeout);
  }
});
</script>
