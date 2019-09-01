// Import Vue and the component being tested
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Barchart from '@/components/charts/Barchart'

const id = null
const backend = false
const data = [
  {
    legend: 'value1',
    value: 50
  },
  {
    legend: 'value2',
    value: 20
  },
  {
    legend: 'value3',
    value: 80
  }
]

describe('Barchart', () => {
  // Inspect the raw component options
  it('has a mounted hook', () => {
    expect(typeof Barchart.mounted).toBe('function')
  })
  it('test barchart rendering', () => {
    const localVue = createLocalVue()
    const wrapper = shallowMount(Barchart, {
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
