import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import IndexPage from './IndexPage.vue'

describe('IndexPage', () => {
  it('renders page structure', () => {
    const wrapper = mount(IndexPage)

    expect(wrapper.exists()).toBe(true)
  })

  it('has correct data structure', () => {
    const wrapper = mount(IndexPage)
    const vm = wrapper.vm as { todos: Array<{ id: number; content: string }> }

    expect(vm.todos).toHaveLength(5)
    expect(vm.todos[0]).toEqual({ id: 1, content: 'ct1' })
    expect(vm.todos[1]).toEqual({ id: 2, content: 'ct2' })
    expect(vm.todos[2]).toEqual({ id: 3, content: 'ct3' })
    expect(vm.todos[3]).toEqual({ id: 4, content: 'ct4' })
    expect(vm.todos[4]).toEqual({ id: 5, content: 'ct5' })
  })

  it('has correct meta data', () => {
    const wrapper = mount(IndexPage)
    const vm = wrapper.vm as { meta: { totalCount: number } }

    expect(vm.meta).toEqual({ totalCount: 1200 })
  })
})