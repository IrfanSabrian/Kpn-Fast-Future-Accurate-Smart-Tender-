import { defineStore } from 'pinia'

export const useProjectStore = defineStore('project', {
  state: () => ({
    projects: [],
    currentProject: null,
    loading: false,
    error: null
  }),

  getters: {
    allProjects: (state) => state.projects,
    activeProjects: (state) => state.projects.filter(p => p.status !== 'completed'),
    completedProjects: (state) => state.projects.filter(p => p.status === 'completed')
  },

  actions: {
    async fetchProjects() {
      this.loading = true
      try {
        const config = useRuntimeConfig()
        const { data } = await $fetch(`${config.public.apiBaseUrl}/projects`)
        this.projects = data
        this.error = null
      } catch (error) {
        this.error = error.message
        console.error('Fetch projects error:', error)
      } finally {
        this.loading = false
      }
    },

    async createProject(projectData) {
      this.loading = true
      try {
        const config = useRuntimeConfig()
        const { data } = await $fetch(`${config.public.apiBaseUrl}/projects`, {
          method: 'POST',
          body: projectData
        })
        this.projects.push(data)
        return { success: true, data }
      } catch (error) {
        return { success: false, error: error.message }
      } finally {
        this.loading = false
      }
    },

    setCurrentProject(project) {
      this.currentProject = project
    }
  }
})
