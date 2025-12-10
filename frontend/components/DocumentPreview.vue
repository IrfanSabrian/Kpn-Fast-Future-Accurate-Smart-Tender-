<template>
  <div :class="containerClass">
    <!-- Header -->
    <div class="px-4 py-3 border-b border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 flex items-center justify-between">
      <div class="text-xs font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">
        {{ title }}
      </div>
      <a 
        v-if="documentUrl" 
        :href="documentUrl" 
        target="_blank" 
        :class="buttonClass"
      >
        <i class="fas fa-external-link-alt mr-1"></i> Buka Tab Baru
      </a>
    </div>
    
    <!-- Content -->
    <div class="flex-1 relative bg-slate-50 dark:bg-slate-900">
      <!-- PDF Iframe -->
      <iframe 
        v-if="documentUrl && showPreview"
        :key="documentUrl"
        :src="getPreviewUrl(documentUrl)" 
        class="w-full h-full absolute inset-0 border-none"
      ></iframe>
      
      <!-- Empty State -->
      <div v-else class="w-full h-full flex flex-col items-center justify-center text-slate-400">
        <i :class="`${emptyIcon} text-5xl mb-4 opacity-20`"></i>
        <p class="text-sm">{{ emptyMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  title: {
    type: String,
    default: 'Preview Dokumen'
  },
  documentUrl: {
    type: String,
    default: null
  },
  showPreview: {
    type: Boolean,
    default: true
  },
  emptyIcon: {
    type: String,
    default: 'fas fa-file-pdf'
  },
  emptyMessage: {
    type: String,
    default: 'Tidak ada dokumen'
  },
  buttonColor: {
    type: String,
    default: 'blue', // blue, orange, emerald, purple
    validator: (value) => ['blue', 'orange', 'emerald', 'purple'].includes(value)
  },
  containerClass: {
    type: String,
    default: 'bg-slate-100 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden flex flex-col h-full'
  }
})

const buttonClass = computed(() => {
  const baseClass = 'text-[10px] font-bold px-2 py-1 rounded border hover:opacity-90 transition-colors'
  
  const colorMap = {
    blue: 'text-blue-600 bg-blue-50 border-blue-100',
    orange: 'text-orange-600 bg-orange-50 border-orange-100',
    emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
    purple: 'text-purple-600 bg-purple-50 border-purple-100'
  }
  
  return `${baseClass} ${colorMap[props.buttonColor] || colorMap.blue}`
})

// Preview URL Helper (Google Drive & Local)
const getPreviewUrl = (url) => {
  if (!url) return ''
  
  // If local file
  if (url.startsWith('http://localhost') || url.startsWith('/')) {
    return url
  }
  
  // If Google Drive view link, convert to preview
  if (url.includes('drive.google.com') && url.includes('/view')) {
    return url.replace('/view', '/preview')
  }
  
  return url
}
</script>
