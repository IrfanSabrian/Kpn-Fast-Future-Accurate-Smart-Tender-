<template>
  <BaseModal :show="show" @close="cancel" max-width="md">
    <template #header>
      <h3 
        class="text-2xl font-bold"
        :class="[
          type === 'danger' ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-white'
        ]"
      >
        {{ title }}
      </h3>
    </template>
    <template #body>
      <div class="text-center py-4">
        <div 
          class="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
          :class="[
            type === 'danger' ? 'bg-red-100 dark:bg-red-900' : 'bg-blue-100 dark:bg-blue-900'
          ]"
        >
          <i 
            class="text-3xl"
            :class="[
              type === 'danger' ? 'fas fa-exclamation-triangle text-red-600 dark:text-red-400' : 'fas fa-question-circle text-blue-600 dark:text-blue-400'
            ]"
          ></i>
        </div>
        <p class="text-gray-700 dark:text-gray-300">
          {{ message }}
        </p>
      </div>
    </template>
    <template #footer>
      <div class="flex justify-end gap-3 w-full">
        <button
          @click="cancel"
          :disabled="loading"
          class="px-5 py-2.5 rounded-xl font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors disabled:opacity-50"
        >
          {{ cancelText }}
        </button>
        <button
          @click="confirm"
          :disabled="loading"
          class="px-6 py-2.5 font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-95 flex items-center gap-2"
          :class="[
            type === 'danger' 
              ? 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-500/30' 
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-500/30'
          ]"
        >
          <i v-if="loading" class="fas fa-spinner fa-spin"></i>
          <span v-else-if="type === 'danger'"><i class="fas fa-trash-alt mr-2"></i></span>
          <span v-else><i class="fas fa-check mr-2"></i></span>
          {{ loading ? loadingText : confirmText }}
        </button>
      </div>
    </template>
  </BaseModal>
</template>

<script setup>
const props = defineProps({
  show: {
    type: Boolean,
    default: false
  },
  type: {
    type: String,
    default: 'info', // info, danger
    validator: (value) => ['info', 'danger'].includes(value)
  },
  title: {
    type: String,
    default: 'Konfirmasi'
  },
  message: {
    type: String,
    required: true
  },
  confirmText: {
    type: String,
    default: 'Ya'
  },
  cancelText: {
    type: String,
    default: 'Batal'
  },
  loadingText: {
    type: String,
    default: 'Memproses...'
  },
  loading: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['confirm', 'cancel'])

const confirm = () => {
  emit('confirm')
}

const cancel = () => {
  emit('cancel')
}
</script>
