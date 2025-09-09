import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EssentialLink from '@/components/EssentialLink.vue'

describe('EssentialLink.vue', () => {
  it('renders with required props', () => {
    const wrapper = mount(EssentialLink, {
      props: {
        title: 'Test Link'
      }
    })
    
    expect(wrapper.text()).toContain('Test Link')
    expect(wrapper.find('a').attributes('href')).toBe('#')
  })

  it('renders with all props', () => {
    const wrapper = mount(EssentialLink, {
      props: {
        title: 'Test Link',
        caption: 'Test Caption',
        link: 'https://example.com',
        icon: 'link'
      }
    })
    
    expect(wrapper.text()).toContain('Test Link')
    expect(wrapper.text()).toContain('Test Caption')
    expect(wrapper.find('a').attributes('href')).toBe('https://example.com')
    expect(wrapper.find('a').attributes('target')).toBe('_blank')
  })

  it('renders icon when provided', () => {
    const wrapper = mount(EssentialLink, {
      props: {
        title: 'Test Link',
        icon: 'home'
      }
    })
    
    expect(wrapper.findComponent({ name: 'QIcon' }).exists()).toBe(true)
  })

  it('does not render icon section when icon is not provided', () => {
    const wrapper = mount(EssentialLink, {
      props: {
        title: 'Test Link'
      }
    })
    
    // Check that there's no icon in the first QItemSection (which would be the icon section)
    const sections = wrapper.findAllComponents({ name: 'QItemSection' })
    expect(sections.length).toBe(1) // Only the text section, no icon section
  })
})
