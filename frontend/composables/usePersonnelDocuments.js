/**
 * Composable untuk Document Management (KTP, NPWP, Ijazah, CV)
 */

export const usePersonnelDocuments = (personId, apiBaseUrl) => {
  const { success, error: showError } = useToast()

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
      success('KTP berhasil ditambahkan')
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
      success('KTP berhasil diperbarui')
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

      success('KTP berhasil dihapus')
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
      success('NPWP berhasil ditambahkan')
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
      success('NPWP berhasil diperbarui')
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
      success('NPWP berhasil dihapus')
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
      success('Ijazah berhasil ditambahkan')
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
      success('Ijazah berhasil diperbarui')
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
      success('Ijazah berhasil dihapus')
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
      success('CV berhasil ditambahkan')
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
      success('CV berhasil diperbarui')
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
      success('CV berhasil dihapus')
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
