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
      <button
        @click="cancel"
        class="px-6 py-2.5 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 font-semibold rounded-lg transition-colors"
      >
        {{ cancelText }}
      </button>
      <button
        @click="confirm"
        :disabled="loading"
        class="px-6 py-2.5 font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        :class="[
          type === 'danger' 
            ? 'bg-red-600 hover:bg-red-700 text-white' 
            : 'bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-700 hover:to-violet-700 text-white'
        ]"
      >
        <span v-if="loading">
          <i class="fas fa-spinner fa-spin mr-2"></i>{{ loadingText }}
        </span>
        <span v-else>
          {{ confirmText }}
        </span>
      </button>
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
