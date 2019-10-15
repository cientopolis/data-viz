import axios from 'axios'


const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : 'https://tablevis.herokuapp.com'

const colors = [
  '#ff9ff3',
  '#feca57',
  '#ff6b6b',
  '#48dbfb',
  '#1dd1a1',
  '#c8d6e5',
  '#5f27cd',
  '#54a0ff',
  '#00d2d3',
  '#BC70A4',
  '#BFD641',
  '#00A591',
  '#6B5B95',
  '#DBB1CD',
  '#6F9FD8',
  '#E94B3C',
  '#BE9EC9',
  '#FF6F61'
]

const generateRandomColor = () => {
  return "hsl(" + Math.random() * 360 + ", 100%, 75%)"
}

const getRandomColor = () => {
  return colors[Math.floor(Math.random() * colors.length)]
}

const removeChart = (component) => {
  if (component.backend) {
    // remove from backend
    const url = `${baseUrl}/chart_detail/${component.id}`
    axios.delete(url).then(response => {
      console.log(response)
    })
  }
  // destroy the vue listeners, etc
  component.$destroy()
  // remove the element from the DOM
  component.$el.parentNode.removeChild(component.$el)
}

export default {
  colors,
  baseUrl,
  generateRandomColor,
  getRandomColor,
  removeChart
}