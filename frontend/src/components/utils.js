import axios from 'axios'

const isNumeric = (str) => {
  return !isNaN(str)
}

const getRandomColor = () => {
  return 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')'
}

const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https'
const baseUrl = `${protocol}://${document.domain}:8000`

const removeChart = (component) => {
  if (component.backend) {
    // remove from backend
    const url = `${baseUrl}/delete_chart/${component.id}`
    axios.delete(url).then(response =>{
      console.log(response)
    })
  }
  // destroy the vue listeners, etc
  component.$destroy()
  // remove the element from the DOM
  component.$el.parentNode.removeChild(component.$el)
}

export default {
  isNumeric,
  getRandomColor,
  baseUrl,
  removeChart
}