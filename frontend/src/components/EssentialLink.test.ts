import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import EssentialLink from './EssentialLink.vue'

describe('EssentialLink', () => {
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
        icon: 'home'
      }
    })

    expect(wrapper.text()).toContain('Test Link')
    expect(wrapper.text()).toContain('Test Caption')
    expect(wrapper.find('a').attributes('href')).toBe('https://example.com')
    expect(wrapper.find('a').attributes('target')).toBe('_blank')
  })

  it('uses default values for optional props', () => {
    const wrapper = mount(EssentialLink, {
      props: {
        title: 'Test Link'
      }
    })

    expect(wrapper.find('a').attributes('href')).toBe('#')
    expect(wrapper.find('a').attributes('target')).toBe('_blank')
  })

  it('renders icon section only when icon is provided', () => {
    const wrapperWithoutIcon = mount(EssentialLink, {
      props: {
        title: 'Test Link'
      }
    })

    const wrapperWithIcon = mount(EssentialLink, {
      props: {
        title: 'Test Link',
        icon: 'home'
      }
    })

    // Check if icon section exists by looking for the conditional rendering
    expect(wrapperWithoutIcon.html()).not.toContain('avatar')
    expect(wrapperWithIcon.html()).toContain('avatar')
  })
})
