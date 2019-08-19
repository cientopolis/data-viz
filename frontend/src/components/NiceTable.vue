<template>
  <div ref="niceTableContainer">
    <a-row type="flex" justify="center">
      <a-col :span="12" id="chart">
      </a-col>
      <a-col :span="3" id="chart-hover">
      </a-col>
    </a-row>
    <a-row>
      <a-button
        style="margin-left: 5px; margin-top: 50px; float: left;"
        type="primary"
        @click="removeTable()"
      >
        Remove Table
      </a-button>
      <a-button
        style="margin-left: 5px; margin-top: 50px; float: left;"
        type="primary"
        :disabled="selectedRowKeys.length === 0"
        @click="chartModalVisible = true"
      >
        Create Chart
      </a-button>
    </a-row>
    <a-modal
      v-model="chartModalVisible"
      :footer="null"
    >
      <vue-good-wizard
        ref="my-wizard"
        :steps="steps"
        :onNext="nextClicked"
        :onBack="backClicked"
      >
        <div slot="selectChartType">
          <span style="margin-right: 10px; margin-left: 5px">Select a chart</span>
          <a-select style="width: 200px" @change="handleChartChange">
            <a-select-option
              v-for="(chartType, index) in chartTypes"
              :key="index"
              :value="chartType.value"
            >
              {{chartType.title}}
            </a-select-option>
          </a-select>
        </div>
        <div slot="selectColumns">
          <div v-if="selectedChartType">
            <span 
              style="margin: 10px;"
            >
              Select {{selectedChartType.title}} columns
            </span>
            <a-alert :message="selectedChartType.instruction" banner />
            <a-row>
              <a-select
                mode="multiple"
                style="width: 100%; margin-top: 10px;"
                placeholder="Please select"
                :maxTagCount="3"
                v-model="chartColumns"
              >
                <a-select-option
                  v-for="(column, index) in columnsOptions"
                  :key="index">
                  {{column.value}}
                </a-select-option>
              </a-select>
              <a-alert
                v-if="columnsError"
                :message="columnsError"
                type="error"
                banner
              />
            </a-row>
          </div>
        </div>
      </vue-good-wizard>
    </a-modal>
    <a-row type="flex" justify="space-between" style="margin: 10px 0;">
      <a-col>
        <span style="margin-left: 8px">
          <template v-if="hasSelected">
            {{`Selected ${selectedRowKeys.length} items`}}
          </template>
        </span>
      </a-col>
      <a-col>
        <a-dropdown style="margin-right: 10px;">
          <a class="ant-dropdown-link" href="#">
            Visible Columns<a-icon type="down" />
          </a>
          <a-menu slot="overlay" style="padding: 5px; width: 300px;">
            <a-row>
              <a-checkbox-group
                :options="columnsOptions"
                v-model="columnsChecked"
              />
            </a-row>
          </a-menu>
        </a-dropdown>
      </a-col>
    </a-row>
    <a-table
      :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
      :columns="visibleColumns"
      :dataSource="data"
      :rowKey="row => index(row)"
    >
      <div slot="filterDropdown" slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }" class='custom-filter-dropdown'>
        <a-input
          v-ant-ref="c => searchInput = c"
          :placeholder="`Search ${column.dataIndex}`"
          :value="selectedKeys[0]"
          @change="e => setSelectedKeys(e.target.value ? [e.target.value] : [])"
          @pressEnter="() => handleSearch(selectedKeys, confirm)"
          style="width: 188px; margin-bottom: 8px; display: block;"
        />
        <a-button
          type='primary'
          @click="() => handleSearch(selectedKeys, confirm)"
          icon="search"
          size="small"
          style="width: 90px; margin-right: 8px"
        >Search</a-button>
        <a-button
          @click="() => handleReset(clearFilters)"
          size="small"
          style="width: 90px"
        >Reset</a-button>
      </div>
      <a-icon slot="filterIcon" slot-scope="filtered" type='search' :style="{ color: filtered ? '#108ee9' : undefined }" />
      <template slot="customRender" slot-scope="text">
        <span v-if="searchText">
          <template v-for="(fragment, i) in text.toString().split(new RegExp(`(?<=${searchText})|(?=${searchText})`, 'i'))">
            <mark v-if="fragment.toLowerCase() === searchText.toLowerCase()" :key="i" class="highlight">{{fragment}}</mark>
            <template v-else>{{fragment}}</template>
          </template>
        </span>
        <template v-else>{{text}}</template>
      </template>
    </a-table>
    <div ref="charts">
    </div>
  </div>
</template>
<script>
import moment from 'moment'
import Vue from 'vue'
import Multiline from '@/components/charts/Multiline'
import Pie from '@/components/charts/Pie'
import Mapvis from '@/components/charts/Mapvis'
import axios from 'axios'

const steps = [
  {
    label: 'Selecciona un tipo de grafico',
    slot: 'selectChartType'
  },
  {
    label: 'Selecciona las columnas del grafico',
    slot: 'selectColumns'
  }
]

const chartTypes = [
  {
    value: 'multilines',
    title: 'Multilines',
    instruction: 'Selecciona una fecha y valores numericos'
  }, {
    value: 'piechart',
    title: 'Piechart',
    instruction: 'Selecciona columnas con valores numericos'
  }, {
    value: 'map',
    title: 'Map',
    instruction: 'Selecciona una latitud, una longitud, y los valores que desees incluir en el mapa'
  }
]

function isNumeric (str) {
  return !isNaN(str)
}

const domain = document.domain

export default {
  props: {
    id: {
      type: Number
    },
    columns: {
      type: Array,
      required: true
    },
    data: {
      type: Array,
      required: true
    },
    backend: {
      type: Boolean,
      required: true
    }
  },

  data() {
    return {
      selectedRowKeys: [], // Check here to configure the default column
      columnsOptions: [],
      columnsChecked: [],
      chartColumns: [],
      selectedChartType : null,
      showTable: false,
      searchText: '',
      searchInput: null,
      chartModalVisible: false,
      columnsError: null,
      steps,
      chartTypes
    }
  },

  computed: {
    hasSelected() {
      return this.selectedRowKeys.length > 0
    },

    visibleColumns () {
      let visibleColumns = this.columns.filter(column => this.columnsChecked.indexOf(column.dataIndex) >= 0)
      return visibleColumns
    }
  },

  created () {
    this.columnsOptions = this.columns.map(column => {
      return {
        label: column.title,
        value: column.dataIndex
      }
    })

    this.columnsChecked = this.columnsOptions.map(column => {
      return column.value
    })
    
    if (this.backend) {
      this.getCharts()
    }
  },

  methods: {
    getCharts () {
      const url = `http://${domain}:8000/chart/`
      const params = {
        domain: domain,
        nice_table: this.id
      }
      axios.get(url, {params})
        .then(response => {
          this.backend = true
          const charts = response.data
          charts.forEach(chart => {
            const chartData = JSON.parse(chart.data)
            this.renderChart(chart.id, chart.chart_type, chartData)
          })
        })
    },

    async renderChart(id, chart_type, data) {
      let componentClass
      switch (chart_type) {
        case 'multiline':
          componentClass = Multiline
          break
        case 'pie':
          componentClass = Pie
          break
        case 'map':
          componentClass = Mapvis
          break
        default:
          break
      }
      let ComponentClass = Vue.extend(componentClass)
      let chart = new ComponentClass({
        propsData: {
          id,
          backend: this.backend,
          data
        }
      })
      chart.$mount() // pass nothing
      this.$refs.charts.appendChild(chart.$el)
      await this.$nextTick()
      this.$scrollTo(chart.$el)
    },

    onSelectChange (selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },

    index (row) {
      return this.data.indexOf(row)
    },

    handleChartChange (value) {
      this.selectedChartType = this.chartTypes.find(item => item.value == value)
    },

    clearChart () {
      var myNode = document.getElementById('chart')
      while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild)
      }
    },

    createMultilineChart () {
      const chartType = 'multiline'
      // process data
      let chartData = []
      this.selectedRowKeys.forEach(rowIndex => {
        const row = this.data[rowIndex]
        let chartItem = {}
        this.chartColumns.forEach(index => {
          const col = this.columns[index]
          if (col.type === 'Date') {
            chartItem['date'] = moment(row[col.dataIndex], col.format)
          } else {
            let value = row[col.dataIndex]
            if ((value === '') || (value === 'null')) {
              value = 0
            }
            chartItem[col.dataIndex] = +value
          }
        })
        // date validation
        if (String(chartItem['date']._d) !== 'Invalid Date') {
          // number validation
          let allNumerics = true
          Object.keys(chartItem).filter(key => key !== 'date').forEach(key => {
            if (!isNumeric(chartItem[key])) {
              allNumerics = false
            }
          })
          if (allNumerics) {
            chartData.push(chartItem)
          } else {
            console.log('numbers not valid')
          }
        }
      })
      // end process data
      // persists
      let chartId
      if (this.backend) {
        this.persistChart(chartType, chartData)
      } else {
        this.renderChart(chartId, chartType, chartData)
      }
      // end persists
      this.chartColumns = []
    },

    persistChart (type, data) {
      const url = `http://${domain}:8000/chart/`
      axios.post(url, {
        nice_table: this.id,
        chart_type: type,
        data: JSON.stringify(data)
      }).then(response => {
        const newChart = response.data
        this.renderChart(newChart.id, type, data)
      })
    },

    createPieChart () {
      const chartType = 'pie'
      // process data
      let chartData = []
      // selected columns
      this.chartColumns.forEach(index => {
        const col = this.columns[index]
        let chartItem = {
          legend: col.dataIndex,
          value: 0,
          color: this.getRandomColor()
        }
        chartData.push(chartItem)
      })
      // selected rows
      this.selectedRowKeys.forEach(rowIndex => {
        const row = this.data[rowIndex]
        chartData.forEach(item => {
          let value = row[item['legend']]
          if (isNumeric(value) && (value!=='')) {
            item['value'] += parseFloat(value)
          }
        })
      })
      // end process data
      // persist
      let chartId
      if (this.backend) {
        this.persistChart(chartType, chartData)
      } else {
        this.renderChart(chartId, chartTypes, chartData)
      }
      this.chartColumns = []
    },

    createMapChart (categories) {
      const chartType = 'map'
      // process data
      let chartData = {
        categories: [],
        data: []
      }
      // selected columns
      this.selectedRowKeys.forEach(rowIndex => {
        const row = this.data[rowIndex]
        let chartItem = {}
        this.chartColumns.forEach(index => {
          const col = this.columns[index]
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
      // end process data
      // persist
      let chartId
      this.renderChart(chartId, chartType, chartData)
    },

    getRandomColor () {
      return 'rgb(' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ',' + (Math.floor(Math.random() * 256)) + ')'
    },

    handleSearch (selectedKeys, confirm) {
      confirm()
      this.searchText = selectedKeys[0]
    },

    handleReset (clearFilters) {
      clearFilters()
      this.searchText = ''
    },

    nextClicked (currentPage) {
      this.columnsError = null
      if (currentPage === 0) {
        if (this.selectedChartType !== null) {
          return true
        }
      }
      if (currentPage === this.steps.length - 1) {
        let numberColumns
        switch (this.selectedChartType.value) {
          case 'multilines':
            // Validate selected data
            // Should be one DATE column
            let dateColumns = this.chartColumns.filter(columnIndex => this.columns[columnIndex].type === 'Date')
            if (dateColumns.length !== 1) {
              this.columnsError = `Debes seleccionar una columna de tipo fecha`
              return false
            }
            // The rest of selected columns should be type number
            numberColumns = this.chartColumns.filter(columnIndex => this.columns[columnIndex].type === 'Number')
            if (numberColumns.length + 1 !== this.chartColumns.length) {
              this.columnsError = `Todos los valores deben ser de tipo numerico`
              return false
            }
            this.createMultilineChart()
            break
          case 'piechart':
            // Validate selected data
            numberColumns = this.chartColumns.filter(columnIndex => this.columns[columnIndex].type === 'Number')
            if (numberColumns.length !== this.chartColumns.length) {
              this.columnsError = `Todas las columnas deben ser de tipo numerico`
              return false
            }
            this.createPieChart()
            break
          case 'map':
            let lngColumn = this.chartColumns.filter(columnIndex => this.columns[columnIndex].type == 'Longitude')
            let latColumn = this.chartColumns.filter(columnIndex => this.columns[columnIndex].type == 'Latitude')
            if (latColumn.length !== 1 && lngColumn !== 1) {
              this.columnsError = `Debes seleccionar una columna de tipo longitud y una de tipo latitud`
              return false
            }
            if (this.chartColumns.length == 2) {
              let categories = []
              this.createMapChart(categories)
            } else {
              console.log('create map categories')
            }
            break
        }
      }
      this.chartModalVisible = false
      this.selectedChartType = null
      this.$refs['my-wizard'].goTo(0)
    },

    backClicked (currentPage) {
      return true
    },

    removeTable () {
      if (this.backend) {
        // remove from backend
        const url = `http://${domain}:8000/delete_table/${this.id}`
        axios.delete(url).then(response =>{
          console.log(response)
        })
      }
      // destroy the vue listeners, etc
      this.$destroy()
      // remove the element from the DOM
      this.$el.parentNode.removeChild(this.$el)
    }
  }
}
</script>