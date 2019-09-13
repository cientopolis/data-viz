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
  it('test mapvis columns validation', () => {
    // first nonhappy case
    let columns = [{
      type: 'Number'
    }]
    let firstValidation = Mapvis.methods.validateColumns(columns)
    expect(firstValidation.isValid).toBe(false)
    expect(firstValidation.message.constructor).toBe(String)
    // second nonhappy case
    columns.push({
      'type': 'String'
    })
    let secondValidation = Mapvis.methods.validateColumns(columns)
    expect(secondValidation.isValid).toBe(false)
    expect(secondValidation.message.constructor).toBe(String)
    // third nonhappy case
    columns.push({
      'type': 'Latitude'
    })
    let thirdValidation = Mapvis.methods.validateColumns(columns)
    expect(thirdValidation.isValid).toBe(false)
    expect(thirdValidation.message.constructor).toBe(String)
    // first happy case
    columns.push({
      'type': 'Longitude'
    })
    let fourthValidation = Mapvis.methods.validateColumns(columns)
    expect(fourthValidation.isValid).toBeTruthy()
    expect(fourthValidation.message).toBe(undefined)
    // second happy case
    columns.push({
      'type': 'Date'
    })
    let fifthValidation = Mapvis.methods.validateColumns(columns)
    expect(fifthValidation.isValid).toBeTruthy()
    expect(fifthValidation.message).toBe(undefined)
    // last unhappy case
    columns.push({
      'type': 'Longitude'
    })
    let sixthValidation = Mapvis.methods.validateColumns(columns)
    expect(sixthValidation.isValid).toBe(false)
    expect(sixthValidation.message.constructor).toBe(String)
  })
})
