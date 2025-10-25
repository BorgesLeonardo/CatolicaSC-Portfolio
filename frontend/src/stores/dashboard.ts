import { defineStore } from 'pinia'
import { ref } from 'vue'
import { http } from 'src/utils/http'

export interface MeMetricsResponse {
  totalSupportedBRL: number
  totalRaisedOnMyCampaignsBRL: number
  activeCampaigns: number
  publishedCampaigns: number
  successRatePct: number
  avgTicketBRL: number
}

export interface TimePoint { period: string; amount: number }

export interface CampaignsMetricsResponse {
  topByRaised: Array<{ campaignId: string; title: string; raised: number; goal: number }>
  byCategory: Array<{ category: string; count: number; raised: number }>
}

export interface CampaignListItem {
  id: string
  title: string
  status: string
  goal: number
  raised: number
  contributions: number
  deadline: string
}

export interface CampaignListResponse {
  page: number
  pageSize: number
  total: number
  items: CampaignListItem[]
}

export interface MyContributionItem {
  id: string
  amount: number
  currency: string
  status: string
  createdAt: string
  projectId: string
  projectTitle: string
}

export interface MyContributionsResponse {
  page: number
  pageSize: number
  total: number
  items: MyContributionItem[]
}

export const useDashboardStore = defineStore('dashboard', () => {
  // Metrics
  const metrics = ref<MeMetricsResponse | null>(null)
  const metricsLoading = ref(false)
  const metricsError = ref<string | null>(null)

  // Timeseries
  const timeseries = ref<TimePoint[]>([])
  const timeseriesLoading = ref(false)
  const timeseriesError = ref<string | null>(null)

  // Campaigns metrics
  const campaignsMetrics = ref<CampaignsMetricsResponse | null>(null)
  const campaignsMetricsLoading = ref(false)
  const campaignsMetricsError = ref<string | null>(null)

  // Campaigns list
  const campaignsList = ref<CampaignListResponse | null>(null)
  const campaignsListLoading = ref(false)
  const campaignsListError = ref<string | null>(null)

  // My contributions
  const myContributions = ref<MyContributionsResponse | null>(null)
  const myContributionsLoading = ref(false)
  const myContributionsError = ref<string | null>(null)

  async function fetchMetrics() {
    metricsLoading.value = true
    metricsError.value = null
    try {
      const { data } = await http.get<MeMetricsResponse>('/api/me/metrics')
      metrics.value = data
    } catch (e) {
      metricsError.value = 'Falha ao carregar métricas'
      throw e
    } finally {
      metricsLoading.value = false
    }
  }

  async function fetchTimeseries(params?: { from?: string; to?: string }) {
    timeseriesLoading.value = true
    timeseriesError.value = null
    try {
      const { data } = await http.get<TimePoint[]>('/api/me/contributions/timeseries', { params: { ...params, interval: 'month' } })
      timeseries.value = data
    } catch (e) {
      timeseriesError.value = 'Falha ao carregar série temporal'
      throw e
    } finally {
      timeseriesLoading.value = false
    }
  }

  async function fetchCampaignsMetrics() {
    campaignsMetricsLoading.value = true
    campaignsMetricsError.value = null
    try {
      const { data } = await http.get<CampaignsMetricsResponse>('/api/me/campaigns/metrics')
      campaignsMetrics.value = data
    } catch (e) {
      campaignsMetricsError.value = 'Falha ao carregar métricas de campanhas'
      throw e
    } finally {
      campaignsMetricsLoading.value = false
    }
  }

  async function fetchCampaignsList(params: { status?: string; q?: string; page?: number; pageSize?: number }) {
    campaignsListLoading.value = true
    campaignsListError.value = null
    try {
      const { data } = await http.get<CampaignListResponse>('/api/me/campaigns/list', { params })
      campaignsList.value = data
    } catch (e) {
      campaignsListError.value = 'Falha ao carregar campanhas'
      throw e
    } finally {
      campaignsListLoading.value = false
    }
  }

  async function fetchMyContributions(params: { projectId?: string; status?: string; from?: string; to?: string; page?: number; pageSize?: number }) {
    myContributionsLoading.value = true
    myContributionsError.value = null
    try {
      const { data } = await http.get<MyContributionsResponse>('/api/me/contributions/list', { params })
      myContributions.value = data
    } catch (e) {
      myContributionsError.value = 'Falha ao carregar contribuições'
      throw e
    } finally {
      myContributionsLoading.value = false
    }
  }

  return {
    metrics,
    metricsLoading,
    metricsError,
    timeseries,
    timeseriesLoading,
    timeseriesError,
    campaignsMetrics,
    campaignsMetricsLoading,
    campaignsMetricsError,
    campaignsList,
    campaignsListLoading,
    campaignsListError,
    myContributions,
    myContributionsLoading,
    myContributionsError,
    fetchMetrics,
    fetchTimeseries,
    fetchCampaignsMetrics,
    fetchCampaignsList,
    fetchMyContributions
  }
})


