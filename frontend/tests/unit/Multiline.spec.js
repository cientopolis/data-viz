// Import Vue and the component being tested
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Multiline from '@/components/charts/Multiline'

const id = null
const backend = false
const data = [
  {
    date: new Date(),
    legend1: 20,
    legend2: 50,
    legend3: 10
  },
  {
    date: new Date(),
    legend1: 30,
    legend2: 60,
    legend3: 70
  },
  {
    date: new Date(),
    legend1: 50,
    legend2: 80,
    legend3: 100
  }
]

describe('Multiline', () => {
  // Inspect the raw component options
  it('has a mounted hook', () => {
    expect(typeof Multiline.mounted).toBe('function')
  })
  it('test Multiline rendering', () => {
    const localVue = createLocalVue()
    const wrapper = shallowMount(Multiline, {
      localVue,
      propsData: {
        id,
        backend,
        data
      }
    })
    expect(wrapper.isVueInstance).toBeTruthy()
    expect(wrapper.findAll('svg').length).toBe(1)
  })
})