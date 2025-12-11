<template>
  <Teleport to="body">
    <div class="fixed top-4 right-4 z-[9999] flex flex-col gap-3 max-w-sm pointer-events-none">
      <TransitionGroup name="toast">
        <div
          v-for="toast in toasts"
          :key="toast.id"
          class="pointer-events-auto bg-white dark:bg-slate-800 rounded-xl shadow-2xl border overflow-hidden min-w-[320px] animate-slide-in"
          :class="[
            toast.type === 'success' ? 'border-emerald-500' : 
            toast.type === 'error' ? 'border-red-500' : 
            toast.type === 'warning' ? 'border-amber-500' : 
            'border-blue-500'
          ]"
        >
          <!-- Color Bar -->
          <div 
            class="h-1"
            :class="[
              toast.type === 'success' ? 'bg-emerald-500' : 
              toast.type === 'error' ? 'bg-red-500' : 
              toast.type === 'warning' ? 'bg-amber-500' : 
              'bg-blue-500'
            ]"
          ></div>

          <div class="p-4 flex items-start gap-3">
            <!-- Icon -->
            <div 
              class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
              :class="[
                toast.type === 'success' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600' : 
                toast.type === 'error' ? 'bg-red-100 dark:bg-red-900/30 text-red-600' : 
                toast.type === 'warning' ? 'bg-amber-100 dark:bg-amber-900/30 text-amber-600' : 
                'bg-blue-100 dark:bg-blue-900/30 text-blue-600'
              ]"
            >
              <i 
                class="fas"
                :class="[
                  toast.type === 'success' ? 'fa-check-circle' : 
                  toast.type === 'error' ? 'fa-exclamation-circle' : 
                  toast.type === 'warning' ? 'fa-exclamation-triangle' : 
                  'fa-info-circle'
                ]"
              ></i>
            </div>

            <!-- Content -->
            <div class="flex-1 min-w-0">
              <h4 
                class="text-sm font-bold mb-1"
                :class="[
                  toast.type === 'success' ? 'text-emerald-700 dark:text-emerald-400' : 
                  toast.type === 'error' ? 'text-red-700 dark:text-red-400' : 
                  toast.type === 'warning' ? 'text-amber-700 dark:text-amber-400' : 
                  'text-blue-700 dark:text-blue-400'
                ]"
              >
                {{ toast.title }}
              </h4>
              <p class="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                {{ toast.message }}
              </p>
            </div>

            <!-- Close Button -->
            <button 
              @click="removeToast(toast.id)"
              class="w-6 h-6 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors flex-shrink-0"
            >
              <i class="fas fa-times text-xs"></i>
            </button>
          </div>
        </div>
      </TransitionGroup>
    </div>
  </Teleport>
</template>

<script setup>
const toasts = ref([])

const addToast = (toast) => {
  const id = Date.now()
  toasts.value.push({ ...toast, id })
  
  // Auto remove after duration
  setTimeout(() => {
    removeToast(id)
  }, toast.duration || 5000)
}

const removeToast = (id) => {
  const index = toasts.value.findIndex(t => t.id === id)
  if (index > -1) {
    toasts.value.splice(index, 1)
  }
}

// Expose untuk bisa dipanggil dari parent
defineExpose({ addToast })
</script>

<style scoped>
.toast-enter-active {
  animation: slideInRight 0.3s ease-out;
}

.toast-leave-active {
  animation: slideOutRight 0.3s ease-in;
}

@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

@keyframes slideOutRight {
  from {
    transform: translateX(0);
    opacity: 1;
  }
  to {
    transform: translateX(100%);
    opacity: 0;
  }
}

.animate-slide-in {
  animation: slideInRight 0.3s ease-out;
}
</style>
