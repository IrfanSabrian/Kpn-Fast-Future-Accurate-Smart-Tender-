<template>
  <header class="sticky top-0 z-30 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700 shadow-sm">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex items-center gap-6 py-4">
        <!-- Back Button -->
        <button
          @click="handleBack"
          class="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-600 flex items-center justify-center text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 hover:border-slate-400 dark:hover:border-slate-500 transition-all group"
        >
          <i class="fas fa-arrow-left group-hover:-translate-x-0.5 transition-transform"></i>
        </button>

        <!-- Avatar/Logo -->
        <div class="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 dark:from-blue-600 dark:to-blue-700 flex items-center justify-center text-white font-bold text-lg shadow-lg border-2 border-white dark:border-slate-700">
          {{ initials }}
        </div>

        <!-- Info -->
        <div class="flex-1 min-w-0">
          <h1 class="text-2xl font-bold text-slate-900 dark:text-white truncate">
            {{ title }}
          </h1>
          <div class="flex items-center gap-3 mt-1 flex-wrap">
            <!-- Status Badge -->
            <span
              :class="[
                'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold',
                getStatusClass(status)
              ]"
            >
              <i :class="`${statusIcon} mr-1.5`"></i>
              {{ status }}
            </span>
            
            <!-- ID Badge -->
            <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600">
              <i class="fas fa-hashtag mr-1 text-[10px]"></i>
              {{ entityId }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    required: true
  },
  initials: {
    type: String,
    required: true
  },
  status: {
    type: String,
    default: 'Aktif'
  },
  entityId: {
    type: String,
    required: true
  },
  backRoute: {
    type: String,
    required: true
  },
  statusIcon: {
    type: String,
    default: 'fas fa-check-circle'
  }
})

const router = useRouter()

const handleBack = () => {
  router.push(props.backRoute)
}

const getStatusClass = (status) => {
  const statusLower = status?.toLowerCase() || ''
  
  if (statusLower.includes('aktif')) {
    return 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
  } else if (statusLower.includes('nonaktif') || statusLower.includes('tidak aktif')) {
    return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 border border-red-200 dark:border-red-800'
  } else if (statusLower.includes('pending')) {
    return 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 border border-yellow-200 dark:border-yellow-800'
  }
  
  return 'bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-600'
}
</script>
