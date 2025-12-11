/**
 * Composable untuk Document Management (KTP, NPWP, Ijazah, CV)
 * @param {string} personId - ID personel
 * @param {string} apiBaseUrl - Base URL API
 * @param {Function} successToast - Function to show success toast
 * @param {Function} errorToast - Function to show error toast
 */

export const usePersonnelDocuments = (personId, apiBaseUrl, successToast, errorToast) => {
  // Use toast functions passed from parent instead of creating new instance
  const success = successToast
  const showError = errorToast

  // ========== KTP Handlers ==========
  const handleAddKtp = async (formData, file) => {
    try {
      const data = new FormData()
      
      // Append form fields
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key] || '')
      })
      
      // Append file
      if (file) {
        data.append('file', file)
      }

      const response = await fetch(`${apiBaseUrl}/personnel-documents/${personId}/ktp`, {
        method: 'POST',
        body: data
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to add KTP')
      }

      const result = await response.json()
      // Success toast will be shown by parent after reload
      return result
    } catch (err) {
      showError('Gagal menambah KTP: ' + err.message)
      throw err
    }
  }

  const handleUpdateKtp = async (formData, file) => {
    try {
      const data = new FormData()
      
      Object.keys(formData).forEach(key => {
        data.append(key, formData[key] || '')
      })
      
      if (file) {
        data.append('file', file)
      }

      const response = await fetch(`${apiBaseUrl}/personnel-documents/${personId}/ktp`, {
        method: 'PUT',
        body: data
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to update KTP')
      }

      const result = await response.json()
      // Success toast will be shown by parent after reload
      return result
    } catch (err) {
      showError('Gagal memperbarui KTP: ' + err.message)
      throw err
    }
  }

  const handleDeleteKtp = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/personnel-documents/${personId}/ktp`, {
        method: 'DELETE'
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Failed to delete KTP')
      }

      // Success toast will be shown by parent after reload
      return true
    } catch (err) {
      showError('Gagal menghapus KTP: ' + err.message)
      throw err
    }
  }

  // ========== NPWP Handlers ==========
  const handleAddNpwp = async (formData, file) => {
    try {
      const data = new FormData()
      Object.keys(formData).forEach(key => data.append(key, formData[key] || ''))
      if (file) data.append('file', file)

      const response = await fetch(`${apiBaseUrl}/personnel-documents/${personId}/npwp`, {
        method: 'POST',
        body: data
      })

      if (!response.ok) throw new Error('Failed to add NPWP')
      // Success toast will be shown by parent after reload
      return await response.json()
    } catch (err) {
      showError('Gagal menambah NPWP: ' + err.message)
      throw err
    }
  }

  const handleUpdateNpwp = async (formData, file) => {
    try {
      const data = new FormData()
      Object.keys(formData).forEach(key => data.append(key, formData[key] || ''))
      if (file) data.append('file', file)

      const response = await fetch(`${apiBaseUrl}/personnel-documents/${personId}/npwp`, {
        method: 'PUT',
        body: data
      })

      if (!response.ok) throw new Error('Failed to update NPWP')
      // Success toast will be shown by parent after reload
      return await response.json()
    } catch (err) {
      showError('Gagal memperbarui NPWP: ' + err.message)
      throw err
    }
  }

  const handleDeleteNpwp = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/personnel-documents/${personId}/npwp`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete NPWP')
      // Success toast will be shown by parent after reload
      return true
    } catch (err) {
      showError('Gagal menghapus NPWP: ' + err.message)
      throw err
    }
  }

  // ========== Ijazah Handlers ==========
  const handleAddIjazah = async (formData, file) => {
    try {
      const data = new FormData()
      Object.keys(formData).forEach(key => data.append(key, formData[key] || ''))
      if (file) data.append('file', file)

      const response = await fetch(`${apiBaseUrl}/personnel-documents/${personId}/ijazah`, {
        method: 'POST',
        body: data
      })

      if (!response.ok) throw new Error('Failed to add Ijazah')
      // Success toast will be shown by parent after reload
      return await response.json()
    } catch (err) {
      showError('Gagal menambah Ijazah: ' + err.message)
      throw err
    }
  }

  const handleUpdateIjazah = async (formData, file) => {
    try {
      const data = new FormData()
      Object.keys(formData).forEach(key => data.append(key, formData[key] || ''))
      if (file) data.append('file', file)

      const response = await fetch(`${apiBaseUrl}/personnel-documents/${personId}/ijazah`, {
        method: 'PUT',
        body: data
      })

      if (!response.ok) throw new Error('Failed to update Ijazah')  
      // Success toast will be shown by parent after reload
      return await response.json()
    } catch (err) {
      showError('Gagal memperbarui Ijazah: ' + err.message)
      throw err
    }
  }

  const handleDeleteIjazah = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/personnel-documents/${personId}/ijazah`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete Ijazah')
      // Success toast will be shown by parent after reload
      return true
    } catch (err) {
      showError('Gagal menghapus Ijazah: ' + err.message)
      throw err
    }
  }

  // ========== CV Handlers ==========
  const handleAddCv = async (formData, file) => {
    try {
      const data = new FormData()
      Object.keys(formData).forEach(key => data.append(key, formData[key] || ''))
      if (file) data.append('file', file)

      const response = await fetch(`${apiBaseUrl}/personnel-documents/${personId}/cv`, {
        method: 'POST',
        body: data
      })

      if (!response.ok) throw new Error('Failed to add CV')
      // Success toast will be shown by parent after reload
      return await response.json()
    } catch (err) {
      showError('Gagal menambah CV: ' + err.message)
      throw err
    }
  }

  const handleUpdateCv = async (formData, file) => {
    try {
      const data = new FormData()
      Object.keys(formData).forEach(key => data.append(key, formData[key] || ''))
      if (file) data.append('file', file)

      const response = await fetch(`${apiBaseUrl}/personnel-documents/${personId}/cv`, {
        method: 'PUT',
        body: data
      })

      if (!response.ok) throw new Error('Failed to update CV')
      // Success toast will be shown by parent after reload
      return await response.json()
    } catch (err) {
      showError('Gagal memperbarui CV: ' + err.message)
      throw err
    }
  }

  const handleDeleteCv = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/personnel-documents/${personId}/cv`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Failed to delete CV')
      // Success toast will be shown by parent after reload
      return true
    } catch (err) {
      showError('Gagal menghapus CV: ' + err.message)
      throw err
    }
  }

  return {
    // KTP
    handleAddKtp,
    handleUpdateKtp,
    handleDeleteKtp,
    // NPWP
    handleAddNpwp,
    handleUpdateNpwp,
    handleDeleteNpwp,
    // Ijazah
    handleAddIjazah,
    handleUpdateIjazah,
    handleDeleteIjazah,
    // CV
    handleAddCv,
    handleUpdateCv,
    handleDeleteCv
  }
}
