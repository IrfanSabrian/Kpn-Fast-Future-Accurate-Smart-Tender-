<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out"
        enter-from-class="opacity-0"
        enter-to-class="opacity-100"
        leave-active-class="transition duration-200 ease-in"
        leave-from-class="opacity-100"
        leave-to-class="opacity-0"
      >
        <div 
          v-if="show" 
          class="fixed inset-0 z-[99999] flex items-center justify-center p-4 sm:p-6"
          role="dialog"
          aria-modal="true"
        >
          <!-- Backdrop with Blur -->
          <div 
            class="absolute inset-0 bg-black/60 backdrop-blur-md transition-opacity" 
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
              class="relative w-full bg-white dark:bg-gray-800 rounded-[2rem] shadow-2xl border border-white/20 dark:border-gray-700 flex flex-col max-h-[90vh] transform transition-all overflow-hidden"
              :class="maxWidthClass"
            >
              <!-- Header -->
              <div class="px-8 py-6 border-b border-gray-100 dark:border-gray-700 flex justify-between items-center bg-white/90 dark:bg-gray-800/90 backdrop-blur-md z-10 flex-shrink-0 rounded-t-[2rem]">
                <div v-if="$slots.header">
                  <slot name="header"></slot>
                </div>
                <div v-else>
                  <h3 class="text-2xl font-black text-gray-900 dark:text-white">{{ title }}</h3>
                  <p v-if="subtitle" class="text-gray-500 dark:text-gray-400 text-sm mt-1">{{ subtitle }}</p>
                </div>
                <button 
                  @click="$emit('close')" 
                  class="w-10 h-10 rounded-full bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white flex items-center justify-center transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <i class="fas fa-times"></i>
                </button>
              </div>

              <!-- Content (Scrollable) - flex-grow memungkinkan mengambil sisa ruang -->
              <div class="flex-grow overflow-y-auto custom-scrollbar px-8 py-6">
                <slot name="body" v-if="$slots.body"></slot>
                <slot v-else></slot>
              </div>

              <!-- Footer (Always Visible at Bottom) -->
              <div v-if="$slots.footer" class="px-8 py-6 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex-shrink-0 flex justify-end gap-4 rounded-b-[2rem]">
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
  width: 8px;
}
.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}
.custom-scrollbar::-webkit-scrollbar-thumb {
  background-color: rgba(156, 163, 175, 0.5);
  border-radius: 20px;
  border: 3px solid transparent;
  background-clip: content-box;
}
.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background-color: rgba(107, 114, 128, 0.8);
}
</style>
