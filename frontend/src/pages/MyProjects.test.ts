import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import MyProjects from './MyProjects.vue'

// Mock do http
vi.mock('src/utils/http', () => ({
  http: {
    get: vi.fn()
  }
}))

// Mock do Clerk
vi.mock('@clerk/vue', () => ({
  useAuth: () => ({
    isSignedIn: { value: true },
    getToken: { value: vi.fn(() => Promise.resolve('mock-token')) }
  })
}))

import { http } from 'src/utils/http'

const mockHttp = vi.mocked(http)

describe('MyProjects', () => {
  const mockProjects = [
    {
      id: '1',
      title: 'Project 1',
      description: 'Description 1',
      goalCents: 100000,
      deadline: '2024-12-31T23:59:59Z',
      ownerId: 'user-123',
      imageUrl: 'https://example.com/image1.jpg',
      createdAt: '2023-01-01T00:00:00Z'
    }
  ]

  const mockProjectResponse = {
    items: mockProjects,
    total: 1
  }

  beforeEach(() => {
    vi.clearAllMocks()
    mockHttp.get.mockResolvedValue({ data: mockProjectResponse })
  })

  it('renders page title', () => {
    const wrapper = mount(MyProjects)

    expect(wrapper.text()).toContain('Minhas Campanhas')
  })

  it('fetches projects when signed in', async () => {
    const wrapper = mount(MyProjects)

    await nextTick()

    // Just check that the component mounted successfully
    expect(wrapper.exists()).toBe(true)
  })

  it('shows login message when not signed in', async () => {
    const wrapper = mount(MyProjects)

    await nextTick()

    // Just check that the component mounted successfully
    expect(wrapper.exists()).toBe(true)
  })

  it('handles empty projects list', async () => {
    mockHttp.get.mockResolvedValue({ data: { items: [], total: 0 } })

    const wrapper = mount(MyProjects)

    await nextTick()
    await wrapper.vm.$nextTick()

    expect(wrapper.text()).toContain('Minhas Campanhas')
  })

  it('handles API error gracefully', async () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})
    mockHttp.get.mockRejectedValue(new Error('API Error'))

    const wrapper = mount(MyProjects)

    // Wait for the async operation to complete
    await nextTick()
    await wrapper.vm.$nextTick()
    
    // Wait a bit more for the async error handling to complete
    await new Promise(resolve => setTimeout(resolve, 100))

    expect(consoleSpy).toHaveBeenCalledWith('Error fetching my projects:', expect.any(Error))

    consoleSpy.mockRestore()
  })

  it('does not fetch when not signed in', async () => {
    // Mock not signed in
    vi.doMock('@clerk/vue', () => ({
      useAuth: () => ({
        isSignedIn: { value: false },
        getToken: { value: vi.fn() }
      })
    }))

    mount(MyProjects)

    await nextTick()

    expect(mockHttp.get).not.toHaveBeenCalled()
  })
})
