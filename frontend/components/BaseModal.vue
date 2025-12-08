<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-200 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-150 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div 
          v-if="show" 
          class="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <!-- Backdrop (Reduced blur for performance) -->
          <div 
            class="absolute inset-0 bg-black/50 backdrop-blur-sm transition-opacity" 
            @click="$emit('close')"
          ></div>

          <!-- Modal Panel -->
          <Transition
            enter-active-class="transition duration-300 ease-out"
            enter-from-class="opacity-0 scale-95 translate-y-4"
            enter-to-class="opacity-100 scale-100 translate-y-0"
            leave-active-class="transition duration-200 ease-in"
            leave-from-class="opacity-100 scale-100 translate-y-0"
            leave-to-class="opacity-0 scale-95 translate-y-4"
          >
            <div 
              class="relative w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl flex flex-col max-h-[90vh] transition-all transform overflow-hidden"
              :class="maxWidthClass"
            >
              <!-- Header -->
              <div class="px-6 py-4 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white dark:bg-gray-800 z-10 flex-shrink-0">
                <div v-if="$slots.header">
                  <slot name="header"></slot>
                </div>
                <div v-else>
                  <h3 class="text-xl font-bold text-gray-900 dark:text-white">{{ title }}</h3>
                  <p v-if="subtitle" class="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{{ subtitle }}</p>
                </div>
                <button 
                  @click="$emit('close')" 
                  class="w-8 h-8 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 flex items-center justify-center transition-colors outline-none"
                >
                  <i class="fas fa-times text-sm"></i>
                </button>
              </div>

              <!-- Content (Scrollable) -->
              <div class="flex-grow overflow-y-auto custom-scrollbar px-6 py-6">
                <slot name="body" v-if="$slots.body"></slot>
                <slot v-else></slot>
              </div>

              <!-- Footer (Always Visible at Bottom) -->
              <div v-if="$slots.footer" class="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50 flex-shrink-0 flex justify-end gap-3">
                <slot name="footer"></slot>
              </div>
            </div>
          </Transition>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  title: {
    type: String,
    default: ''
  },
  subtitle: {
    type: String,
    default: ''
  },
  maxWidth: {
    type: String,
    default: '2xl' // sm, md, lg, xl, 2xl, 3xl, 4xl, 5xl, full
  }
})

defineEmits(['close'])

const maxWidthClass = computed(() => {
  const widths = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    '3xl': 'max-w-3xl',
    '4xl': 'max-w-4xl',
    '5xl': 'max-w-5xl',
    full: 'max-w-full'
  }
  return widths[props.maxWidth] || widths['2xl']
})
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
