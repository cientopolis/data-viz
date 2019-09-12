const isNumeric = (str) => {
  return !isNaN(str)
}

const getRandomColor = () => {
  return 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')'
}

export default {
  isNumeric,
  getRandomColor
}