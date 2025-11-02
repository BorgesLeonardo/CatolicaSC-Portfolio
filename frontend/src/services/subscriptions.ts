import { http } from '../utils/http'

export type SubscriptionStatus = 'INCOMPLETE' | 'ACTIVE' | 'PAST_DUE' | 'CANCELED'
export type SubscriptionInterval = 'MONTH' | 'YEAR'

export interface MySubscriptionItem {
  id: string
  status: SubscriptionStatus
  priceBRL: number
  interval: SubscriptionInterval
  createdAt: string
  projectId: string
  projectTitle: string
  cancelable: boolean
}

export interface MySubscriptionsResponse {
  page: number
  pageSize: number
  total: number
  items: MySubscriptionItem[]
}

export class SubscriptionsService {
  async listMine(page = 1, pageSize = 50): Promise<MySubscriptionsResponse> {
    const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) })
    const res = await http.get(`/api/me/subscriptions?${params.toString()}`)
    return res.data
  }

  async cancel(id: string, cancelAtPeriodEnd = false): Promise<{ id: string; status: SubscriptionStatus }> {
    const res = await http.delete(`/api/subscriptions/${id}`, { data: { cancelAtPeriodEnd } })
    return res.data
  }
}

export const subscriptionsService = new SubscriptionsService()


