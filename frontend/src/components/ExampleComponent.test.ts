import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import ExampleComponent from './ExampleComponent.vue'
import type { Todo, Meta } from './models'

describe('ExampleComponent', () => {
  const mockTodos: Todo[] = [
    { id: 1, content: 'Test todo 1' },
    { id: 2, content: 'Test todo 2' }
  ]

  const mockMeta: Meta = {
    totalCount: 100
  }

  it('renders with required props', () => {
    const wrapper = mount(ExampleComponent, {
      props: {
        title: 'Test Title',
        meta: mockMeta,
        active: true
      }
    })

    expect(wrapper.text()).toContain('Test Title')
    expect(wrapper.text()).toContain('Active: yes')
  })

  it('renders todos list', () => {
    const wrapper = mount(ExampleComponent, {
      props: {
        title: 'Test Title',
        todos: mockTodos,
        meta: mockMeta,
        active: true
      }
    })

    expect(wrapper.text()).toContain('Test todo 1')
    expect(wrapper.text()).toContain('Test todo 2')
  })

  it('shows correct count and active status', () => {
    const wrapper = mount(ExampleComponent, {
      props: {
        title: 'Test Title',
        todos: mockTodos,
        meta: mockMeta,
        active: false
      }
    })

    expect(wrapper.text()).toContain('Count: 2 / 100')
    expect(wrapper.text()).toContain('Active: no')
  })

  it('increments click count when todo is clicked', async () => {
    const wrapper = mount(ExampleComponent, {
      props: {
        title: 'Test Title',
        todos: mockTodos,
        meta: mockMeta,
        active: true
      }
    })

    expect(wrapper.text()).toContain('Clicks on todos: 0')

    await wrapper.find('li').trigger('click')
    expect(wrapper.text()).toContain('Clicks on todos: 1')

    await wrapper.find('li').trigger('click')
    expect(wrapper.text()).toContain('Clicks on todos: 2')
  })

  it('uses default empty array for todos when not provided', () => {
    const wrapper = mount(ExampleComponent, {
      props: {
        title: 'Test Title',
        meta: mockMeta,
        active: true
      }
    })

    expect(wrapper.text()).toContain('Count: 0 / 100')
  })

  it('returns incremented value from increment function', () => {
    const wrapper = mount(ExampleComponent, {
      props: {
        title: 'Test Title',
        todos: mockTodos,
        meta: mockMeta,
        active: true
      }
    })

    const component = wrapper.vm as { increment: () => number }
    expect(component.increment()).toBe(1)
    expect(component.increment()).toBe(2)
  })
})