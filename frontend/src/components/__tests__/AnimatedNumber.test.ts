import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import AnimatedNumber from '../../components/AnimatedNumber.vue'

describe('AnimatedNumber', () => {
  it('renders initial value formatted as number', async () => {
    const wrapper = mount(AnimatedNumber, {
      props: { value: 1234.56, decimals: 2 },
      global: { stubs: ['style'] },
    })
    await nextTick()
    expect(wrapper.text()).toContain('1.234,56')
  })

  it('renders currency format', async () => {
    const wrapper = mount(AnimatedNumber, {
      props: { value: 1000, format: 'currency', decimals: 2 },
      global: { stubs: ['style'] },
    })
    await nextTick()
    expect(wrapper.text()).toMatch(/R\$\s?1.000,00/)
  })

  it('renders percentage format', async () => {
    const wrapper = mount(AnimatedNumber, {
      props: { value: 12.345, format: 'percentage', decimals: 1 },
      global: { stubs: ['style'] },
    })
    await nextTick()
    expect(wrapper.text()).toBe('12,3%')
  })

  it('applies prefix/suffix for number format', async () => {
    const wrapper = mount(AnimatedNumber, {
      props: { value: 42, prefix: '+', suffix: ' pts' },
      global: { stubs: ['style'] },
    })
    await nextTick()
    expect(wrapper.text()).toBe('+42 pts')
  })
})


