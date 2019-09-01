// Import Vue and the component being tested
import { createLocalVue, shallowMount } from '@vue/test-utils'
import App from '@/App'
import Infovis from '@/components/Infovis'
import Example1 from '@/components/Example1'

describe('Infovis', () => {
  // Inspect the raw component options
  it('has a mounted hook', () => {
    expect(typeof Infovis.mounted).toBe('function')
  })
  it('test nice table creation', () => {
    const localVue = createLocalVue()
    const wrapper = shallowMount(App, {
      localVue,
      propsData: {
        tableId: 'appear'
      },
      stubs: {
        Example1,
        Infovis
      }
    })
    expect(wrapper.isVueInstance).toBeTruthy()
    expect(wrapper.findAll('table').length).toBe(1)
  })
})