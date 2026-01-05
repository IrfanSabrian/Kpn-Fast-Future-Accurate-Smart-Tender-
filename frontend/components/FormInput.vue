<template>
  <div>
    <label
      v-if="label"
      class="block text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-1.5 ml-1"
    >
      {{ label }}
      <span v-if="required" class="text-blue-500">*</span>
    </label>

    <!-- Container with flex for input + validation button -->
    <div class="flex gap-2 items-start">
      <!-- Input Container (flex-1) -->
      <div class="relative group flex-1 min-w-0">
        <input
          v-if="type !== 'textarea' && type !== 'select'"
          :type="type"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          :placeholder="placeholder"
          :required="required"
          :disabled="disabled || isLocked"
          class="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-60 disabled:bg-slate-100 dark:disabled:bg-slate-800 disabled:cursor-not-allowed transition-all"
          :class="{
            'font-mono':
              type === 'number' ||
              type === 'date' ||
              label?.toLowerCase().includes('id') ||
              label?.toLowerCase().includes('npwp') ||
              label?.toLowerCase().includes('kontrak') ||
              label?.toLowerCase().includes('nik'),
            'border-green-500 ring-1 ring-green-500/20': isLocked,
          }"
        />

        <!-- Textarea -->
        <textarea
          v-else-if="type === 'textarea'"
          :value="modelValue"
          @input="$emit('update:modelValue', $event.target.value)"
          :rows="rows || 3"
          :placeholder="placeholder"
          :required="required"
          :disabled="disabled || isLocked"
          class="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-60 transition-all resize-none"
          :class="{ 'border-green-500 ring-1 ring-green-500/20': isLocked }"
        ></textarea>

        <!-- Select -->
        <div v-else-if="type === 'select'" class="relative">
          <select
            :value="modelValue"
            @input="$emit('update:modelValue', $event.target.value)"
            :required="required"
            :disabled="disabled || isLocked"
            class="w-full px-4 py-2.5 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm font-medium text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:opacity-60 transition-all appearance-none cursor-pointer"
            :class="{ 'border-green-500 ring-1 ring-green-500/20': isLocked }"
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
          <div
            class="absolute inset-y-0 right-0 flex items-center px-4 pointer-events-none text-slate-400"
          >
            <i class="fas fa-chevron-down text-xs"></i>
          </div>
        </div>
      </div>

      <!-- Validation Lock Button (Right side) -->
      <button
        v-if="showValidation"
        type="button"
        @click="toggleLock"
        class="w-7 h-7 flex items-center justify-center rounded-lg transition-all shrink-0 mt-0.5 border"
        :class="
          isLocked
            ? 'bg-green-50 text-green-600 hover:bg-green-100 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800'
            : 'bg-slate-50 text-slate-400 hover:bg-slate-100 border border-slate-200 dark:bg-slate-800 dark:text-slate-500 dark:border-slate-700 hover:text-blue-500 hover:border-blue-200'
        "
        :title="
          isLocked
            ? 'Batalkan validasi (Edit kembali)'
            : 'Validasi data ini (Kunci)'
        "
      >
        <i class="fas fa-check transition-all" style="font-size: 0.7rem"></i>
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from "vue";

const props = defineProps({
  modelValue: {
    type: [String, Number],
    default: "",
  },
  label: {
    type: String,
    default: "",
  },
  type: {
    type: String,
    default: "text", // text, email, number, date, textarea, select
  },
  placeholder: {
    type: String,
    default: "",
  },
  required: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  rows: {
    type: Number,
    default: 3,
  },
  showValidation: {
    type: Boolean,
    default: false, // Enable validation button
  },
  locked: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["update:modelValue", "update:locked"]);

const isLocked = ref(props.locked);

// Watch for external locked prop changes
watch(
  () => props.locked,
  (newVal) => {
    isLocked.value = newVal;
  }
);

const toggleLock = () => {
  isLocked.value = !isLocked.value;
  emit("update:locked", isLocked.value);
};
</script>
