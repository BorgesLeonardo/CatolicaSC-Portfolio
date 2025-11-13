import { defineStore } from 'pinia'

export const useBreadcrumbStore = defineStore('breadcrumb', {
  state: () => ({
    projectTitle: '' as string
  }),
  actions: {
    setProjectTitle(title: string) {
      this.projectTitle = title || ''
    },
    clear() {
      this.projectTitle = ''
    }
  }
})















