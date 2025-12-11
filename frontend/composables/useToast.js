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

  const success = (...args) => {
    // If only one parameter, treat it as message with default title
    if (args.length === 1) {
      showToast('success', 'Berhasil', args[0], 3000)
    } else {
      showToast('success', args[0], args[1], args[2])
    }
  }

  const error = (...args) => {
    // If only one parameter, treat it as message with default title
    if (args.length === 1) {
      showToast('error', 'Gagal', args[0], 3000)
    } else {
      showToast('error', args[0], args[1], args[2])
    }
  }

  const warning = (...args) => {
    // If only one parameter, treat it as message with default title
    if (args.length === 1) {
      showToast('warning', 'Peringatan', args[0], 3000)
    } else {
      showToast('warning', args[0], args[1], args[2])
    }
  }

  const info = (...args) => {
    // If only one parameter, treat it as message with default title
    if (args.length === 1) {
      showToast('info', 'Informasi', args[0], 3000)
    } else {
      showToast('info', args[0], args[1], args[2])
    }
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
