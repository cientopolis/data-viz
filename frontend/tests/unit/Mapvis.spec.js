// Import Vue and the component being tested
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Mapvis from '@/components/charts/Mapvis'

const id = null
const backend = false
const ranges = []
const type = null
const field = null

const category = {
  type,
  field,
  ranges
}

const data = {
  category,
  data: [
    {
      latitude: '-35.115.974',
      longitude: '-58.172.607',
      legend: 'legend'
    }
  ]
}

describe('Mapvis', () => {
  // Inspect the raw component options
  it('has a mounted hook', () => {
    expect(typeof Mapvis.mounted).toBe('function')
  })
  it('test Mapvis rendering', () => {
    const localVue = createLocalVue()
    const wrapper = shallowMount(Mapvis, {
      localVue,
      propsData: {
        id,
        backend,
        data
      }
    })
    expect(wrapper.isVueInstance).toBeTruthy()
    const mapdivs = wrapper.findAll('.mapchart')
    expect(mapdivs.length).toBe(1)
    const mapdiv = mapdivs.at(0)
    expect(mapdiv.classes().length > 1).toBe(false)
    wrapper.vm.$nextTick(() => {
      expect(mapdiv.classes().length > 1).toBe(true)
    })
  })
})
