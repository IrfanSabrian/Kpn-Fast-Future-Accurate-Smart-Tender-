// Composable for toast notifications
export const useToast = () => {
  const toast = ref({
    show: false,
    type: 'info',
    title: '',
    message: '',
    duration: 3000
  })

  const showToast = (type, title, message, duration = 3000) => {
    toast.value = {
      show: true,
      type,
      title,
      message,
      duration
    }
  }

  const hideToast = () => {
    toast.value.show = false
  }

  const success = (title, message, duration) => {
    showToast('success', title, message, duration)
  }

  const error = (title, message, duration) => {
    showToast('error', title, message, duration)
  }

  const warning = (title, message, duration) => {
    showToast('warning', title, message, duration)
  }

  const info = (title, message, duration) => {
    showToast('info', title, message, duration)
  }

  return {
    toast,
    hideToast,
    success,
    error,
    warning,
    info
  }
}
