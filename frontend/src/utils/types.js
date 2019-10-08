import moment from 'moment'

const date = 'Fecha'
const number = 'Numerico'
const text = 'Texto'
const lat = 'Latitud'
const lng = 'Longitud'

const dataTypes = [
  date,
  number,
  text,
  lat,
  lng
]

const dateFormats = ['DDMMYYY', 'MMDDYYY']

const checkType = (value, type, dateFormat=null) => {
  if (type === number) {
    return isNumeric(value)
  }
  if (type === lng || type === lat) {
    return isCoordinate(value)
  }
  if (type === date) {
    if (isDate(value) && dateFormat) {
      let date = moment(value, dateFormat)
      return String(date._d) !== 'Invalid Date'
    }
    return false
  }
  return true
}

const isCoordinate = (str) => {
  return str.match(/((\d+)+(\.\d+))$/)
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

const isNumeric = (str) => {
  return !isNaN(str)
}

export default {
  dateFormats,
  dataTypes,
  date,
  number,
  text,
  lat,
  lng,
  checkType,
  isCoordinate,
  isDate,
  isNumeric
}