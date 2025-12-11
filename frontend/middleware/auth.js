// Authentication middleware
export default defineNuxtRouteMiddleware(async (to, from) => {
  // Skip auth check for these routes
  const publicRoutes = ['/setup/oauth']
  if (publicRoutes.includes(to.path)) {
    return
  }

  // Check if user is authenticated
  const config = useRuntimeConfig()
  const apiUrl = config.public.apiBaseUrl || 'http://localhost:5000'

  try {
    const response = await fetch(`${apiUrl}/auth/me`)
    
    if (!response.ok) {
      // Not authenticated - redirect to OAuth setup
      return navigateTo('/setup/oauth')
    }

    const result = await response.json()
    if (!result.success || !result.data) {
      // Invalid auth - redirect to OAuth setup
      return navigateTo('/setup/oauth')
    }

    // User is authenticated - allow access
    return
  } catch (error) {
    // Network error or backend down - redirect to OAuth setup
    return navigateTo('/setup/oauth')
  }
})
