<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-300 ease-out transform"
        enter-from-class="translate-y-2 opacity-0"
        enter-to-class="translate-y-0 opacity-100"
        leave-active-class="transition duration-200 ease-in transform"
        leave-from-class="translate-y-0 opacity-100"
        leave-to-class="translate-y-2 opacity-0"
      >
        <div 
          v-if="show"
          class="fixed top-4 right-4 z-[999999] max-w-md"
        >
          <div 
            class="flex items-start gap-3 p-4 rounded-xl shadow-2xl border backdrop-blur-md"
            :class="[
              type === 'success' ? 'bg-green-50/95 dark:bg-green-900/95 border-green-200 dark:border-green-700' : '',
              type === 'error' ? 'bg-red-50/95 dark:bg-red-900/95 border-red-200 dark:border-red-700' : '',
              type === 'warning' ? 'bg-yellow-50/95 dark:bg-yellow-900/95 border-yellow-200 dark:border-yellow-700' : '',
              type === 'info' ? 'bg-blue-50/95 dark:bg-blue-900/95 border-blue-200 dark:border-blue-700' : ''
            ]"
          >
            <!-- Icon -->
            <div class="flex-shrink-0">
              <i 
                class="text-xl"
                :class="[
                  type === 'success' ? 'fas fa-check-circle text-green-600 dark:text-green-400' : '',
                  type === 'error' ? 'fas fa-times-circle text-red-600 dark:text-red-400' : '',
                  type === 'warning' ? 'fas fa-exclamation-triangle text-yellow-600 dark:text-yellow-400' : '',
                  type === 'info' ? 'fas fa-info-circle text-blue-600 dark:text-blue-400' : ''
                ]"
              ></i>
            </div>
            
            <!-- Content -->
            <div class="flex-1">
              <h4 
                class="font-bold mb-1"
                :class="[
                  type === 'success' ? 'text-green-900 dark:text-green-100' : '',
                  type === 'error' ? 'text-red-900 dark:text-red-100' : '',
                  type === 'warning' ? 'text-yellow-900 dark:text-yellow-100' : '',
                  type === 'info' ? 'text-blue-900 dark:text-blue-100' : ''
                ]"
              >
                {{ title }}
              </h4>
              <p 
                class="text-sm"
                :class="[
                  type === 'success' ? 'text-green-700 dark:text-green-300' : '',
                  type === 'error' ? 'text-red-700 dark:text-red-300' : '',
                  type === 'warning' ? 'text-yellow-700 dark:text-yellow-300' : '',
                  type === 'info' ? 'text-blue-700 dark:text-blue-300' : ''
                ]"
              >
                {{ message }}
              </p>
            </div>
            
            <!-- Close Button -->
            <button 
              @click="close"
              class="flex-shrink-0 hover:opacity-70 transition-opacity"
              :class="[
                type === 'success' ? 'text-green-600 dark:text-green-400' : '',
                type === 'error' ? 'text-red-600 dark:text-red-400' : '',
                type === 'warning' ? 'text-yellow-600 dark:text-yellow-400' : '',
                type === 'info' ? 'text-blue-600 dark:text-blue-400' : ''
              ]"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
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
  type: {
    type: String,
    default: 'info', // success, error, warning, info
    validator: (value) => ['success', 'error', 'warning', 'info'].includes(value)
  },
  title: {
    type: String,
    default: ''
  },
  message: {
    type: String,
    default: ''
  },
  duration: {
    type: Number,
    default: 3000 // Auto close after 3 seconds
  }
})

const emit = defineEmits(['close'])

const close = () => {
  emit('close')
}

// Auto close
watch(() => props.show, (newValue) => {
  if (newValue && props.duration > 0) {
    setTimeout(() => {
      close()
    }, props.duration)
  }
})
</script>
