import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { createRouter, createWebHistory } from 'vue-router'
import App from '@/App.vue'

// Mock router
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/', component: { template: '<div>Home</div>' } }
  ]
})

describe('App.vue', () => {
  it('renders router-view', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    })
    
    expect(wrapper.findComponent({ name: 'RouterView' }).exists()).toBe(true)
  })

  it('has correct template structure', () => {
    const wrapper = mount(App, {
      global: {
        plugins: [router]
      }
    })
    
    // Check if router-view component exists rather than HTML string
    expect(wrapper.findComponent({ name: 'RouterView' }).exists()).toBe(true)
  })
})
