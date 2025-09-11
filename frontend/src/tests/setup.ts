import { config } from '@vue/test-utils'
import { Quasar } from 'quasar'
import { vi } from 'vitest'

// Quasar mínimo
config.global.plugins = [Quasar]

// Axios mock
vi.mock('axios', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
    create: () => ({ 
      get: vi.fn(), 
      post: vi.fn(),
      put: vi.fn(),
      delete: vi.fn()
    }),
  },
}))

// Clerk (Vue) mock/stubs
vi.mock('@clerk/vue', () => ({
  useAuth: () => ({ 
    isSignedIn: { value: true }, 
    getToken: vi.fn(() => 'token_fake') 
  }),
  useUser: () => ({ 
    user: { value: { id: 'user_test_id' } } 
  }),
  SignedIn: {
    name: 'SignedIn',
    render: (props: { slots?: { default?: () => unknown } }) => props?.slots?.default?.() || null
  },
  SignedOut: {
    name: 'SignedOut', 
    render: (props: { slots?: { default?: () => unknown } }) => props?.slots?.default?.() || null
  },
  SignInButton: {
    name: 'SignInButton',
    render: (props: { slots?: { default?: () => unknown } }) => props?.slots?.default?.() || null
  },
  UserButton: { 
    name: 'UserButton', 
    render: () => null 
  },
}))

// Mock do Notify do Quasar
vi.mock('quasar', async () => {
  const actual = await vi.importActual('quasar')
  return {
    ...actual,
    Notify: {
      create: vi.fn()
    }
  }
})

// Mock do http
vi.mock('src/utils/http', () => ({
  http: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}))
