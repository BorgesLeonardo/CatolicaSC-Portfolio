import { http } from '../utils/http'

export class ConnectService {
  async onboard(redirectPath?: string): Promise<{ url: string }> {
    const payload = redirectPath ? { redirect: redirectPath } : undefined
    const { data } = await http.post<{ url: string }>('/api/connect/onboard', payload)
    return data
  }

  async status(): Promise<{ connected: boolean; chargesEnabled: boolean; payoutsEnabled: boolean }> {
    const { data } = await http.get('/api/me/connect/status')
    return data
  }

  async dashboardLink(): Promise<{ url: string }> {
    const { data } = await http.get<{ url: string }>('/api/me/connect/dashboard-link')
    return data
  }
}

export const connectService = new ConnectService()




