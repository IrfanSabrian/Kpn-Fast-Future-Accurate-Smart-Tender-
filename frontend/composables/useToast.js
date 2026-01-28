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

  const hideToast = (id) => {
    if (id) {
      removeToast(id);
    } else {
      clearToasts();
    }
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

  // Specialized Toasts
  const loadingScan = (message = "Sedang memindai dokumen dengan AI...") => {
    return info(message, 0);
  };

  const successScan = (
    message = "Data berhasil diekstrak. Silakan validasi data sebelum menyimpan.",
  ) => {
    return success(message);
  };

  const errorScan = (message = "Gagal memindai dokumen.") => {
    return error(message);
  };

  const loadingUpload = (message = "Sedang mengupload file...") => {
    return info(message, 0);
  };

  const successUpload = (message = "File berhasil diupload.") => {
    return success(message);
  };

  const errorUpload = (message = "Gagal mengupload file.") => {
    return error(message);
  };

  // Standardized Save Helpers
  const loadingSave = (message = "Menyimpan data...") => {
    return info(message, 0);
  };

  const successSave = (message = "Data berhasil disimpan.") => {
    return success(message);
  };

  const errorSave = (message = "Gagal menyimpan data.") => {
    return error(message);
  };

  // Standardized Delete Helpers
  const loadingDelete = (message = "Menghapus data...") => {
    return info(message, 0);
  };

  const successDelete = (message = "Data berhasil dihapus.") => {
    return success(message);
  };

  const errorDelete = (message = "Gagal menghapus data.") => {
    return error(message);
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
    loadingScan,
    successScan,
    errorScan,
    loadingUpload,
    successUpload,
    errorUpload,
    loadingSave,
    successSave,
    errorSave,
    loadingDelete,
    successDelete,
    errorDelete,
  };
};
