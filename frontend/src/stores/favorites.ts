import { defineStore } from 'pinia'
import { LocalStorage, Notify } from 'quasar'
import type { Project } from 'src/components/models'

interface FavoritesState {
  userId: string | null
  items: Project[]
}

function storageKey(userId: string | null): string {
  return userId ? `favorites:${userId}` : 'favorites:anonymous'
}

export const useFavoritesStore = defineStore('favorites', {
  state: (): FavoritesState => ({
    userId: null,
    items: [],
  }),
  getters: {
    count(state): number {
      return state.items.length
    },
    isFavorite: (state) => (id: string): boolean => {
      return state.items.some(p => p.id === id)
    },
  },
  actions: {
    setUser(userId: string | null): void {
      this.userId = userId
      const stored = LocalStorage.getItem<Project[]>(storageKey(userId))
      this.items = Array.isArray(stored) ? stored : []
    },
    load(): void {
      const stored = LocalStorage.getItem<Project[]>(storageKey(this.userId))
      this.items = Array.isArray(stored) ? stored : []
    },
    privateSave(): void {
      LocalStorage.set(storageKey(this.userId), this.items)
    },
    add(project: Project): void {
      if (!this.isFavorite(project.id)) {
        this.items = [project, ...this.items]
        this.privateSave()
        Notify.create({ type: 'positive', message: 'Adicionado aos favoritos' })
      }
    },
    remove(id: string): void {
      const before = this.items.length
      this.items = this.items.filter(p => p.id !== id)
      if (this.items.length !== before) {
        this.privateSave()
        Notify.create({ type: 'warning', message: 'Removido dos favoritos' })
      }
    },
    toggle(project: Project): void {
      if (this.isFavorite(project.id)) {
        this.remove(project.id)
      } else {
        this.add(project)
      }
    },
    clear(): void {
      this.items = []
      this.privateSave()
    },
  },
})



