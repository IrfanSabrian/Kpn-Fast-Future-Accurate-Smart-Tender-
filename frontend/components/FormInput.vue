<template>
  <div>
    <label 
      v-if="label" 
      class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1"
    >
      {{ label }}
      <span v-if="required" class="text-blue-500">*</span>
    </label>
    
    <!-- Text Input -->
    <div class="relative group">
      <input
        v-if="type !== 'textarea' && type !== 'select'"
        :type="type"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        class="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed transition-all"
        :class="{ 'font-mono': type === 'number' || type === 'date' || label?.toLowerCase().includes('id') || label?.toLowerCase().includes('npwp') || label?.toLowerCase().includes('kontrak') || label?.toLowerCase().includes('nik') }"
      />
      
      <!-- Textarea -->
      <textarea
        v-else-if="type === 'textarea'"
        :value="modelValue"
        @input="$emit('update:modelValue', $event.target.value)"
        :rows="rows || 3"
        :placeholder="placeholder"
        :required="required"
        :disabled="disabled"
        class="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-60 transition-all resize-none"
      ></textarea>
      
      <!-- Select -->
      <div v-else-if="type === 'select'" class="relative">
        <select
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          :required="required"
          :disabled="disabled"
          class="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-60 transition-all appearance-none cursor-pointer"
        >
          <option 
            v-if="placeholder" 
            value="" 
            disabled 
            :selected="!modelValue"
          >
            {{ placeholder }}
          </option>
          <slot name="options"></slot>
        </select>
        <div class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400">
          <i class="fas fa-chevron-down text-xs"></i>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
defineProps({
  modelValue: {
    type: [String, Number],
    default: ''
  },
  label: {
    type: String,
    default: ''
  },
  type: {
    type: String,
    default: 'text' // text, email, number, date, textarea, select
  },
  placeholder: {
    type: String,
    default: ''
  },
  required: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  rows: {
    type: Number,
    default: 3
  }
})

defineEmits(['update:modelValue'])
</script>
