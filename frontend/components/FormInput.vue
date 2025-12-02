<template>
  <div>
    <label 
      v-if="label" 
      class="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2"
    >
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    
    <!-- Text Input -->
    <input
      v-if="type !== 'textarea' && type !== 'select'"
      :type="type"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :placeholder="placeholder"
      :required="required"
      :disabled="disabled"
      class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-gray-900 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-800 disabled:text-gray-500 dark:disabled:text-gray-400"
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
      class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-gray-900 dark:text-white resize-none"
    ></textarea>
    
    <!-- Select -->
    <select
      v-else-if="type === 'select'"
      :value="modelValue"
      @input="$emit('update:modelValue', $event.target.value)"
      :required="required"
      :disabled="disabled"
      class="w-full px-4 py-2.5 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none text-gray-900 dark:text-white"
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
