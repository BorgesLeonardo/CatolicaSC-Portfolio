import { onMounted, onUnmounted } from 'vue'
import { useDashboardStore } from 'src/stores/dashboard'

export function useRealtimeDashboard(userId?: string, ownerId?: string) {
  let es: EventSource | null = null
  const store = useDashboardStore()
  const apiBase = import.meta.env?.VITE_API_BASE_URL || 'http://localhost:3333'

  function connect() {
    try {
      const qs: string[] = []
      if (userId) qs.push(`userId=${encodeURIComponent(userId)}`)
      if (ownerId) qs.push(`ownerId=${encodeURIComponent(ownerId)}`)
      const url = `${apiBase}/api/events${qs.length ? `?${qs.join('&')}` : ''}`
      es = new EventSource(url, { withCredentials: true })

      es.addEventListener('connected', () => {
        // connected
      })

      es.addEventListener('contribution.succeeded', () => {
        void (async () => {
          try {
            await Promise.all([
              store.fetchTimeseries(),
              store.fetchMetrics(),
              store.fetchCampaignsMetrics(),
            ])
          } catch {
            // Swallow refresh errors silently in production
          }
        })()
      })

      es.onerror = () => {
        if (es) {
          es.close()
        }
        es = null
        setTimeout(connect, 2000)
      }
    } catch {
      setTimeout(connect, 2000)
    }
  }

  onMounted(connect)
  onUnmounted(() => { if (es) { es.close() } es = null })
}


