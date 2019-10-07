import axios from 'axios'
import moment from 'moment'

const isNumeric = (str) => {
  return !isNaN(str)
}

const getRandomColor = () => {
  return "hsl(" + Math.random() * 360 + ", 100%, 75%)"
}

const isDate = (value) => {
  var dateFormat
  if (toString.call(value) === '[object Date]') {
    return true
  }
  if (typeof value.replace === 'function') {
    value.replace(/^\s+|\s+$/gm, '')
  }
  /* eslint-disable */
  dateFormat = /(^\d{1,4}[\.|\\/|-]\d{1,2}[\.|\\/|-]\d{1,4})(\s*(?:0?[1-9]:[0-5]|1(?=[012])\d:[0-5])\d\s*[ap]m)?$/
  /* eslint-enable */
  return dateFormat.test(value)
}

const dateFormats = ['DDMMYYY', 'MMDDYYY']

const isCoordinate = (str) => {
  return str.match(/((\d+)+(\.\d+))$/)
}

const checkType = (value, type, dateFormat=null) => {
  if (type === 'Numerico') {
    return isNumeric(value)
  }
  if (type === 'Longitud' || type === 'Latitud') {
    return isCoordinate(value)
  }
  if (type === 'Fecha') {
    if (isDate(value) && dateFormat) {
      let date = moment(value, dateFormat)
      return String(date._d) !== 'Invalid Date'
    }
    return false
  }
  return true
}

const baseUrl = process.env.NODE_ENV === 'development' ? 'http://localhost:8000' : 'https://tablevis.herokuapp.com'

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

const dataTypes = [
  'Fecha',
  'Numerico',
  'Texto',
  'Latitud',
  'Longitud'
]

export default {
  isNumeric,
  getRandomColor,
  baseUrl,
  removeChart,
  isDate,
  isCoordinate,
  dataTypes,
  checkType,
  dateFormats
}