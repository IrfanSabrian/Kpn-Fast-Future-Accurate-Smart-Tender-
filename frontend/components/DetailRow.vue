<template>
  <div :class="containerClass">
    <!-- Label -->
    <span :class="labelClass">
      {{ label }}
    </span>
    
    <!-- Value -->
    <span :class="valueClass">
      <slot>
        {{ value || '-' }}
      </slot>
    </span>
  </div>
</template>

<script setup>
const props = defineProps({
  label: {
    type: String,
    required: true
  },
  value: {
    type: [String, Number],
    default: null
  },
  spacing: {
    type: String,
    default: 'normal', // 'tight', 'normal', 'relaxed'
    validator: (value) => ['tight', 'normal', 'relaxed'].includes(value)
  },
  bordered: {
    type: Boolean,
    default: true
  }
})

const spacingMap = {
  tight: 'py-0.5',
  normal: 'py-1',
  relaxed: 'py-1.5'
}

const containerClass = computed(() => {
  const baseClass = 'grid grid-cols-[120px_1fr] gap-3'
  const spacing = spacingMap[props.spacing]
  const border = props.bordered ? 'border-b border-dashed border-slate-100 dark:border-slate-700' : ''
  
  return `${baseClass} ${spacing} ${border}`.trim()
})

const labelClass = 'text-[10px] font-bold text-slate-400 uppercase pt-0.5'
const valueClass = 'text-xs font-medium text-slate-700 dark:text-slate-200'
</script>
