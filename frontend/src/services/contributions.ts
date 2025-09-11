import { http } from '../utils/http'

export interface Contribution {
  id: string
  projectId: string
  contributorId: string
  amountCents: number
  currency: string
  status: 'PENDING' | 'SUCCEEDED' | 'FAILED' | 'REFUNDED'
  stripePaymentIntentId?: string
  stripeCheckoutSessionId?: string
  createdAt: string
  updatedAt: string
  contributor?: {
    id: string
    name?: string
    email?: string
  }
}

export interface CreateCheckoutData {
  projectId: string
  amountCents: number
  successUrl?: string
  cancelUrl?: string
}

export interface CheckoutResponse {
  checkoutUrl: string
  contributionId: string
}

export interface ContributionsResponse {
  page: number
  pageSize: number
  total: number
  items: Contribution[]
}

export class ContributionsService {
  async createCheckout(data: CreateCheckoutData): Promise<CheckoutResponse> {
    const response = await http.post('/api/contributions/checkout', data)
    return response.data
  }

  async listByProject(projectId: string, page: number = 1, pageSize: number = 10): Promise<ContributionsResponse> {
    const params = new URLSearchParams({
      page: page.toString(),
      pageSize: pageSize.toString()
    })

    const response = await http.get(`/api/contributions/project/${projectId}?${params.toString()}`)
    return response.data
  }
}

export const contributionsService = new ContributionsService()
