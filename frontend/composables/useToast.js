// Composable for toast notifications
export const useToast = () => {
  // State shared across components (singleton pattern for toast list)
  const toasts = useState("toasts", () => []);

  const addToast = (type, title, message, duration = 5000) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    const newToast = {
      id,
      show: true,
      type,
      title,
      message,
      duration,
    };

    // Add to array
    toasts.value.push(newToast);

    // Auto-remove after duration
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  };

  const removeToast = (id) => {
    const index = toasts.value.findIndex((t) => t.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };

  const clearToasts = () => {
    toasts.value = [];
  };

  const hideToast = () => {
    // Deprecated but kept for compatibility - removes the last toast or clears all?
    // Let's make it clear all to be safe if previously it hid the single active toast
    clearToasts();
  };

  const success = (...args) => {
    if (args.length === 1) {
      return addToast("success", "Berhasil", args[0], 5000);
    } else if (args.length === 2 && typeof args[1] === "number") {
      // (message, duration)
      return addToast("success", "Berhasil", args[0], args[1]);
    } else {
      // (title, message, duration?)
      return addToast("success", args[0], args[1], args[2] || 5000);
    }
  };

  const error = (...args) => {
    if (args.length === 1) {
      return addToast("error", "Gagal", args[0], 8000);
    } else if (args.length === 2 && typeof args[1] === "number") {
      return addToast("error", "Gagal", args[0], args[1]);
    } else {
      return addToast("error", args[0], args[1], args[2] || 8000);
    }
  };

  const warning = (...args) => {
    if (args.length === 1) {
      return addToast("warning", "Peringatan", args[0], 6000);
    } else if (args.length === 2 && typeof args[1] === "number") {
      return addToast("warning", "Peringatan", args[0], args[1]);
    } else {
      return addToast("warning", args[0], args[1], args[2] || 6000);
    }
  };

  const info = (...args) => {
    if (args.length === 1) {
      return addToast("info", "Informasi", args[0], 5000);
    } else if (args.length === 2 && typeof args[1] === "number") {
      return addToast("info", "Informasi", args[0], args[1]);
    } else {
      return addToast("info", args[0], args[1], args[2] || 5000);
    }
  };

  return {
    toast: toasts, // Alias for backward compatibility
    toasts,
    addToast,
    removeToast,
    clearToasts,
    hideToast,
    success,
    error,
    warning,
    info,
  };
};
