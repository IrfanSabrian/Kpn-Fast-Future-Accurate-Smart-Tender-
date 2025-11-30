export const useTheme = () => {
  const isDark = useState('theme-dark', () => false)

  const toggleTheme = () => {
    isDark.value = !isDark.value
    updateTheme()
  }

  const updateTheme = () => {
    if (process.client) {
      localStorage.setItem('theme', isDark.value ? 'dark' : 'light')
      if (isDark.value) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }
  }

  const initTheme = () => {
    if (process.client) {
      const savedTheme = localStorage.getItem('theme')
      if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        isDark.value = true
      } else {
        isDark.value = false
      }
      updateTheme()
    }
  }

  return {
    isDark,
    toggleTheme,
    initTheme
  }
}
