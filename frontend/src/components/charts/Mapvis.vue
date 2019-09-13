<template>
  <div style="margin-top: 50px">
    <a-row>
      <a-col :span="2">
        <a-button
          style="margin-left: 5px; margin-top: 50px; float: left;"
          type="primary"
          @click="removeChart()"
        >
          Eliminar Grafico
        </a-button>
        <a-button
          style="margin-left: 5px; margin-top: 50px; float: left;"
          type="primary"
          @click="addCategory()"
        >
          Agregar Categoria
        </a-button>
      </a-col>
      <a-col>
        <div class="mapchart">
        </div>
      </a-col>
    </a-row>
    <!-- modal for selecting map category -->
    <a-modal
      title="Crear Mapa"
      v-model="modalMapCategory"
    >
      <h3>Elije un campo para categorizar tu mapa</h3>
      <a-select style="width: 200px; margin-bottom: 20px" @change="handleCategoryChange">
        <a-select-option
          v-for="(category, index) in mapCategoryOptions"
          :key="index"
          :value="category.dataIndex"
        >
          {{category.title}}
        </a-select-option>
      </a-select>
      <div
        v-if="mapCategory"
      >
        <div v-if="mapCategory.type === 'Number'">
          <p>Maximo valor: <b>{{maxRangeValue}}</b></p>
          <a-input-group
            compact
            v-if="mapCategoryRangesCant >= 1"
            style="margin-top: 5px"
          >
            <a-input
              style="width: 100px; border-left: 0; pointer-events: none; backgroundColor: #fff"
              placeholder="Rango"
              disabled
            />
            <a-input
              style="width: 100px; text-align: center"
              type="number"
              min="0"
              :max="maxRangeValue"
              v-model="from"
              placeholder="Desde"
            />
            <a-input
              style="width: 30px; border-left: 0; pointer-events: none; backgroundColor: #fff"
              placeholder="~"
              disabled
            />
            <a-input
              style="width: 100px; text-align: center; border-left: 0"
              type="number"
              min="0"
              :max="maxRangeValue"
              v-model="to"
              placeholder="Hasta"
            />
          </a-input-group>
        </div>
        <div v-if="mapCategory.type == 'String'">
          <p style="margin-bottom: 10px">Se agrupara la informacion segun las siguientes categorias:</p>
          <div
            v-for="(category, index) in mapStringCategories"
            :key="index"
          >
            <p>{{category}}</p>
          </div>
        </div>
        <a-alert
          v-if="mapRangeError"
          :message="mapRangeError"
          type="error"
          banner
        />
      </div>
      <template slot="footer">
        <a-button
          key="submit"
          type="primary"
          @click="validateMapRanges()"
        >
          Crear Categoria
        </a-button>
      </template>
    </a-modal>
    <!-- end map modal -->
  </div>
</template>

<script>
import axios from 'axios'
import utils from '@/components/utils'

let accessToken = 'pk.eyJ1Ijoiam9zZWZpbmFlc3RldmV6IiwiYSI6ImNqeml2ZDJwNTAyMGMzYm9zczdhdndidGsifQ.xUBtj7UjSEDYUucjf7_AQA'

const chartType = 'Mapvis'

function isBetween(x, min, max) {
  return x >= min && x <= max;
}

const amountCountRanges = [1, 2, 3]

var mymap

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

  data () {
    return {
      modalMapCategory: false,
      mapCategoryOptions: [],
      mapCategory: null,
      amountCountRanges,
      mapCategoryRangesCant: 1,
      maxRangeValue: 0,
      from: null,
      to: null,
      mapStringCategories: [],
      mapRangeError: ''
    }
  },

  mounted () {
    this.$nextTick(() => {
      this.draw()
    })
  },

  methods: {
    // Rendering
    draw () {
      let data = this.data['data']
      let categories = this.data['categories']
      let view = data[0]
      let lat = parseFloat(data[0]['latitude'])
      let lng = parseFloat(data[0]['longitude'])
      let cant = document.getElementsByClassName('mapchart').length
      let div = document.getElementsByClassName('mapchart')[cant-1]
      mymap = L.map(div).setView([lat, lng], 10)
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

      // add categories
      categories.forEach(category => {
        this.renderCategory(category)
      })
    },

    addPolygon (geopoints, category) {
      var polygon = L.polygon(geopoints, {color: utils.getRandomColor()}).addTo(mymap)
      polygon.bindPopup(`${category}`)
    },

    addCircle (geopoint, category) {
      let color = utils.getRandomColor()
      var circle = L.circle(geopoint, {
        color: color,
        fillColor: color,
        fillOpacity: 0.5,
        radius: 500
      }).addTo(mymap)
      circle.bindPopup(`${category}`)
    },

    addCategory () {
      let columns = this.data.columns
      this.mapCategoryOptions = columns.filter(column => column['type'] === 'String' || column['type'] == 'Number')
      this.modalMapCategory = true
    },

    handleCategoryChange (category) {
      let columns = this.data.columns
      this.mapStringCategories = []
      let column = columns.filter(col => col.dataIndex === category)
      if (column) {
        column = column[0]
        this.mapCategory = column
        let selectedData = this.data.data
        if (column.type === "Number") {
          let validatedNumbers = selectedData.filter(item => item[category] !== '' && utils.isNumeric(item[category]))
          let maxValue = 0
          validatedNumbers.forEach(element => {
            let value = parseFloat(element[category])
            if (value > maxValue) {
              maxValue = value
            }
          })
          this.maxRangeValue = maxValue
        } else if (column.type === 'String') {
          selectedData.forEach(element => {
            if ((this.mapStringCategories.indexOf(element[category]) < 0)) {
              this.mapStringCategories.push(element[category])
            }
          })
        }
      }
    },

    validateMapRanges () {
      let type
      let field
      this.mapRangeError = ''
      type = this.mapCategory.type
      field = this.mapCategory.dataIndex
      if (type == 'String' && this.mapStringCategories) {
        this.mapStringCategories.forEach(range => {
          // this.createCategory(range, 'String', field)
          let category = {
            range,
            categoryType: 'String',
            categoryField: field
          }
          this.renderCategory(category)
          this.data.categories.push(category)
        })
        if (this.backend) {
          this.updateChart()
        }
        return
      }
      else if (type == 'Number') {
        if (this.from && this.to) {
          let range = [this.from, this.to]
          // this.createCategory(range, 'Number', field)
          let category = {
            range,
            categoryType: 'Number',
            categoryField: field
          }
          this.renderCategory(category)
          this.data.categories.push(category)
          if (this.backend) {
            this.updateChart()
          }
          return
        }
      }
      this.mapRangeError = 'Campos requeridos faltantes'
    },

    createCategory (range, categoryType, categoryField) {
      let category = {
        range,
        categoryType,
        categoryField
      }
      this.data.categories.push(category)
      this.addRange(category)
      if (this.backend) {
        this.updateChart()
      }
    },

    renderCategory (category) {
      let range = category.range
      let categoryType = category.categoryType
      let categoryField = category.categoryField
      let rangeText = range
      let geopoints = []
      let filtered = []
      let data = this.data.data
      if (categoryType === 'String') {
        filtered = data.filter(d => d[categoryField] == range)
      } else if (categoryType === 'Number') {
        filtered = data.filter(d => isBetween(d[categoryField], range[0], range[1]))
        rangeText = `${categoryField} entre ${range[0]} y ${range[1]}`
      }
      filtered.forEach(element => {
        let lat = parseFloat(element['latitude'])
        let lng = parseFloat(element['longitude'])
        geopoints.push([lat, lng])
      })
      if (geopoints.length > 1) {
        this.addPolygon(geopoints, rangeText)
      } else if (geopoints.length === 1) {
        this.addCircle(geopoints[0], rangeText)
      }
      this.modalMapCategory = false
    },

    handleRangeChange (value) {
      this.mapCategoryRangesCant = value
    },

    // API
    removeChart () {
      utils.removeChart(this)
    },

    updateChart () {
      const url = `${utils.baseUrl}/chart_detail/${this.id}`
      axios.post(url, {
        nice_table: this.id,
        chart_type: chartType,
        data: JSON.stringify(this.data)
      }).then(response => {
        console.log('updated', response)
      })
    },

    // Processing
    validateColumns (columns) {
      // Validate selected data
      let message = ''
      let isValid = true
      let lngColumn = columns.filter(column => column.type == 'Longitude')
      let latColumn = columns.filter(column => column.type == 'Latitude')
      if (!(latColumn.length === 1 && lngColumn.length === 1)) {
        message = 'Debes seleccionar una columna de tipo longitud y una de tipo latitud'
        isValid = false
      }
      return { isValid, message }
    },

    transformData (columns, rows) {
      // processing data
      let chartData = {
        categories: [],
        columns,
        data: []
      }
      rows.forEach(row => {
        let chartItem = {}
        columns.forEach(col => {
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