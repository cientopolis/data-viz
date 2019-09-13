// Import Vue and the component being tested
import { createLocalVue, shallowMount } from '@vue/test-utils'
import Piechart from '@/components/charts/Piechart'

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

describe('Piechart', () => {
  // Inspect the raw component options
  it('has a mounted hook', () => {
    expect(typeof Piechart.mounted).toBe('function')
  })
  it('test piechart rendering', () => {
    const localVue = createLocalVue()
    const wrapper = shallowMount(Piechart, {
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
  it('test piechart columns validation', () => {
    // first happy case
    let columns = [{
      type: 'Number'
    }]
    let firstValidation = Piechart.methods.validateColumns(columns)
    expect(firstValidation.isValid).toBeTruthy()
    expect(firstValidation.message).toBe(undefined)
    // second happy case
    columns.push({
      'type': 'Number'
    })
    let secondValidation = Piechart.methods.validateColumns(columns)
    expect(secondValidation.isValid).toBeTruthy()
    expect(secondValidation.message).toBe(undefined)
    // first nonhappy case
    columns.push({
      'type': 'String'
    })
    let thirdValidation = Piechart.methods.validateColumns(columns)
    expect(thirdValidation.isValid).toBe(false)
    expect(thirdValidation.message.constructor).toBe(String)
  })
})