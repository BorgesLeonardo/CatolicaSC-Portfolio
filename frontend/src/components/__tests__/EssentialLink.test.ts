import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import EssentialLink from '../../components/EssentialLink.vue'

describe('EssentialLink', () => {
  it('renders title and caption', async () => {
    const wrapper = mount(EssentialLink, {
      props: { title: 'Docs', caption: 'Read the documentation', link: 'https://example.com' },
      global: {
        stubs: {
          'q-item': { template: '<div><slot /></div>' },
          'q-item-section': { template: '<div><slot /></div>' },
          'q-item-label': { template: '<div><slot /></div>' },
          'q-icon': { template: '<i />' },
        },
      },
    })
    await nextTick()
    expect(wrapper.text()).toContain('Docs')
    expect(wrapper.text()).toContain('Read the documentation')
  })
})


