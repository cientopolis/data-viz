<template>
  <div style="margin-top: 50px">
    <a-button
      style="margin-left: 5px; margin-top: 50px; float: left;"
      type="primary"
      @click="removeChart()"
    >
      Remove Chart
    </a-button>
    <div class="mapchart">
    </div>
  </div>
</template>

<script>
import axios from 'axios'

let accessToken = 'pk.eyJ1Ijoiam9zZWZpbmFlc3RldmV6IiwiYSI6ImNqeml2ZDJwNTAyMGMzYm9zczdhdndidGsifQ.xUBtj7UjSEDYUucjf7_AQA'

function isBetween(x, min, max) {
  return x >= min && x <= max;
}

export default {
  props: {
    id: {
      type: Number
    },
    data: {
      type: Object,
      required: true
    },
    backend: {
      type: Boolean,
      required: true
    }
  },

  mounted () {
    this.$nextTick(() => {
      this.draw()
    })
  },

  methods: {
    draw () {
      let data = this.data.data
      let category = this.data.category
      let view = data[0]
      let lat = parseFloat(data[0]['latitude'])
      let lng = parseFloat(data[0]['longitude'])
      let cant = document.getElementsByClassName('mapchart').length
      let div = document.getElementsByClassName('mapchart')[cant-1]
      var mymap = L.map(div).setView([lat, lng], 10)
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: accessToken
      }).addTo(mymap)

      // adding markers
      data.forEach(element => {
        let lat = parseFloat(element['latitude'])
        let lng = parseFloat(element['longitude'])
        var marker = L.marker([lat, lng]).addTo(mymap)
        let text = ''
        Object.keys(element).forEach(key => {
          text += `<b>${key}</b>: ${element[key]} <br>`
        })
        marker.bindPopup(text).openPopup()
      })

      // handling categories
      if (category) {
        let categoryType = category.type
        let categoryField = category.field
        category.ranges.forEach(range => {
          let rangeText = range
          let geopoints = []
          let filtered = []
          if (categoryType === "String") {
            filtered = data.filter(d => d[categoryField] == range)
          } else if (categoryType === "Number") {
            filtered = data.filter(d => isBetween(d[categoryField], range[0], range[1]))
            rangeText = `${categoryField} entre ${range[0]} y ${range[1]}`
          }
          filtered.forEach(element => {
            let lat = parseFloat(element['latitude'])
            let lng = parseFloat(element['longitude'])
            geopoints.push([lat, lng])
          })
          if (geopoints.length > 1) {
            this.addPolygon(mymap, geopoints, rangeText)
          } else if (geopoints.length === 1) {
            this.addCircle(mymap, geopoints[0], rangeText)
          }
        })
      }

    },

    addPolygon (mymap, geopoints, category) {
      var polygon = L.polygon(geopoints, {color: this.getRandomColor()}).addTo(mymap)
      polygon.bindPopup(`${category}`)
    },

    addCircle (mymap, geopoint, category) {
      let color = this.getRandomColor()
      var circle = L.circle(geopoint, {
        color: color,
        fillColor: color,
        fillOpacity: 0.5,
        radius: 500
      }).addTo(mymap)
      circle.bindPopup(`${category}`)
    },

    getRandomColor () {
      return 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')'
    },

    removeChart () {
      if (this.backend) {
        // remove from backend
        const url = `https://${document.domain}:8000/delete_chart/${this.id}`
        axios.delete(url).then(response =>{
          console.log(response)
        })
      }
      // destroy the vue listeners, etc
      this.$destroy()
      // remove the element from the DOM
      this.$el.parentNode.removeChild(this.$el)
    },

    // Processing
    validateColumns (chartColumns, columns) {
      // Validate selected data
      let message = ''
      let isValid = true
      let lngColumn = chartColumns.filter(columnIndex => columns[columnIndex].type == 'Longitude')
      let latColumn = chartColumns.filter(columnIndex => columns[columnIndex].type == 'Latitude')
      if (!(latColumn.length === 1 && lngColumn.length === 1)) {
        message = 'Debes seleccionar una columna de tipo longitud y una de tipo latitud'
        isValid = false
      }
      return { isValid, message }
    },

    transformData (allRows, selectedRows, selectedColumns, tableColumns) {
      // processing data
      let chartData = {
        category: null,
        data: []
      }
      selectedRows.forEach(rowIndex => {
        const row = allRows[rowIndex]
        let chartItem = {}
        selectedColumns.forEach(index => {
          const col = tableColumns[index]
          if (col.type == 'Longitude') {
            chartItem['longitude'] = row[col.dataIndex]
          } else if (col.type == 'Latitude') {
            chartItem['latitude'] = row[col.dataIndex]
          } else {
            chartItem[col.dataIndex] = row[col.dataIndex]
          }
        })
        chartData.data.push(chartItem)
      })
      // end processing data
      return chartData
    }
  }
}
</script>
<style scoped>
.mapchart {
  margin: auto;
  width: 800px;
  height: 400px;
}
</style>