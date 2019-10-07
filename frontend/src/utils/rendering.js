import axios from 'axios'


const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : 'https://tablevis.herokuapp.com'

const getRandomColor = () => {
  return "hsl(" + Math.random() * 360 + ", 100%, 75%)"
}

const removeChart = (component) => {
  if (component.backend) {
    // remove from backend
    const url = `${baseUrl}/chart_detail/${component.id}`
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
  baseUrl,
  getRandomColor,
  removeChart
}