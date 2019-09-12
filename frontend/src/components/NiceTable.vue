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
    <!-- in this div charts will be inserted -->
    <div ref="charts">
    </div>
    <!-- end chart's div -->
    <!-- modals -->
    <!-- create chart modal -->
    <a-modal
      v-model="chartModalVisible"
      @cancel="createChartCancel()"
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
    <!-- end create chart modal -->
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
          <p>Cuantos rangos de categorias queres crear? Maximo valor: <b>{{maxRangeValue}}</b></p>
          <a-input-group compact>
            <a-select
              defaultValue="1"
              @change="handleRangeChange"
            >
              <a-select-option
                v-for="(amountCountRange, index) in amountCountRanges"
                :key="index"
                :value="amountCountRange"
              >
                {{amountCountRange}}
              </a-select-option>
            </a-select>
          </a-input-group> <br>
          <a-input-group
            compact
            v-if="mapCategoryRangesCant >= 1"
            style="margin-top: 5px"
          >
            <a-input
              style="width: 100px; border-left: 0; pointer-events: none; backgroundColor: #fff"
              placeholder="Rango 1"
              disabled
            />
            <a-input
              style="width: 100px; text-align: center"
              type="number"
              min="0"
              :max="maxRangeValue"
              v-model="from1"
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
              v-model="to1"
              placeholder="Hasta"
            />
          </a-input-group>
          <a-input-group
            compact
            v-if="mapCategoryRangesCant >= 2"
            style="margin-top: 5px"
          >
            <a-input
              style="width: 100px; border-left: 0; pointer-events: none; backgroundColor: #fff"
              placeholder="Rango 2"
              disabled
            />
            <a-input
              style="width: 100px; text-align: center"
              type="number"
              min="0"
              :max="maxRangeValue"
              v-model="from2"
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
              v-model="to2"
              placeholder="Hasta"
            />
          </a-input-group>
          <a-input-group
            compact
            v-if="mapCategoryRangesCant === 3"
            style="margin-top: 5px"
          >
            <a-input
              style="width: 100px; border-left: 0; pointer-events: none; backgroundColor: #fff"
              placeholder="Rango 3"
              disabled
            />
            <a-input
              style="width: 100px; text-align: center"
              type="number"
              min="0"
              :max="maxRangeValue"
              v-model="from3"
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
              v-model="to3"
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
          Crear Mapa
        </a-button>
      </template>
    </a-modal>
    <!-- end map modal -->
    <!-- end modals -->
  </div>
</template>
<script>
import moment from 'moment'
import Vue from 'vue'
import charts from '@/components/charts'
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
    value: 'Multiline',
    title: 'Multiline',
    instruction: 'Selecciona una fecha y valores numericos'
  }, {
    value: 'Piechart',
    title: 'Piechart',
    instruction: 'Selecciona columnas con valores numericos'
  }, {
    value: 'Barchart',
    title: 'Barchart',
    instruction: 'Selecciona columnas con valores numericos'
  }, {
    value: 'Mapvis',
    title: 'Map',
    instruction: 'Selecciona una latitud, una longitud, y los valores que desees incluir en el mapa'
  }
]

const amountCountRanges = [1, 2, 3]

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

  data () {
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
      modalMapCategory: false,
      columnsError: null,
      mapCategoryOptions: [],
      mapCategory: null,
      amountCountRanges,
      mapCategoryRangesCant: 1,
      maxRangeValue: 0,
      from1: null,
      to1: null,
      from2: null,
      to2: null,
      from3: null,
      to3: null,
      mapStringCategories: [],
      mapRangeError: '',
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
    // charts
    getCharts () {
      const url = `https://${domain}:8000/chart/`
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

    async renderChart(id, data) {
      let chartType = this.selectedChartType.value
      let componentClass = charts[chartType]
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

    index (row) {
      return this.data.indexOf(row)
    },

    clearChart () {
      var myNode = document.getElementById('chart')
      while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild)
      }
    },

    persistChart (type, data) {
      const url = `https://${domain}:8000/chart/`
      let chartType = this.selectedChartType.value
      axios.post(url, {
        nice_table: this.id,
        chart_type: chartType,
        data: JSON.stringify(data)
      }).then(response => {
        const newChart = response.data
        this.renderChart(newChart.id, data)
      })
    },

    createMapChart () {
      const chartType = 'Mapvis'
      let ranges = []
      let type
      let field
      if (this.mapCategory) {
        type = this.mapCategory.type
        ranges = type === 'Number' ? this.getMapNumberRanges() : this.mapStringCategories
        field = this.mapCategory.dataIndex
      }
      let category = {
        type,
        field,
        ranges
      }
      // process data
      let chartData = {
        category,
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
      if (this.backend) {
        this.persistChart(chartType, chartData)
      } else {
        this.renderChart(chartId, chartType, chartData)
      }
      // end persists
      this.modalMapCategory = false
      this.chartColumns = []
      this.mapCategory = null
      this.mapCategoryOptions = []
      this.mapStringCategories = []
    },

    getMapNumberRanges () {
      let ranges = []
      if (this.mapCategoryRangesCant >=1) {
        let range1 = [this.from1, this.to1]
        ranges.push(range1)
      }
      if (this.mapCategoryRangesCant >=2) {
        let range2 = [this.from2, this.to2]
        ranges.push(range2)
      }
      if (this.mapCategoryRangesCant === 3) {
        let range3 = [this.from3, this.to3]
        ranges.push(range3)
      }
      return ranges
    },

    validateMapRanges () {
      this.mapRangeError = ''
      let validate = true
      if (this.mapCategory.type == 'String' && this.mapStringCategories) {
        this.createMapChart()
        return
      }
      if (this.mapCategory.type == 'Number') {
        if (this.mapCategoryRangesCant === 1) {
          if (this.from1 && this.to1) {
            this.createMapChart()
            return
          }
        }
        if (this.mapCategoryRangesCant === 2) {
          if (this.from1 && this.to1 && this.from2 && this.to2) {
            this.createMapChart()
            return
          }
        }
        if (this.mapCategoryRangesCant === 3) {
          if (this.from1 && this.to1 && this.from2 && this.to2 && this.from3 && this.to3) {
            this.createMapChart()
            return
          }
        }
      }
      this.mapRangeError = 'Campos requeridos faltantes'
    },

    // handlers

    onSelectChange (selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },

    handleChartChange (value) {
      this.selectedChartType = this.chartTypes.find(item => item.value == value)
    },

    handleCategoryChange (category) {
      this.mapStringCategories = []
      let column = this.columns.filter(col => col.dataIndex === category)
      if (column) {
        column = column[0]
        this.mapCategory = column
        let selectedData = this.data.filter(item => this.selectedRowKeys.includes(this.data.indexOf(item)))
        if (column.type === "Number") {
          let validatedNumbers = selectedData.filter(item => item[category] !== '' && isNumeric(item[category]))
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
        let selectedComponent = charts[this.selectedChartType.value]
        // first validate
        if (this.chartColumns.length > 0) {
          let selectedColumns = this.columns.filter(column => this.chartColumns.indexOf(this.columns.indexOf(column)) >= 0)
          let { isValid, message } = selectedComponent.methods.validateColumns(selectedColumns)
          if (isValid === false) {
            this.columnsError = message
            return false
          } else {
            // now process selected data
            let id
            let selectedData = this.data.filter(element => this.selectedRowKeys.indexOf(this.data.indexOf(element)) >= 0)
            let processedData = selectedComponent.methods.transformData(selectedColumns, selectedData)
            if (this.backend) {
              // persist and then render chart
              this.persistChart(processedData)
            } else {
              // only render chart
              this.renderChart(id, processedData)
            }
          }
        } else {
          this.columnsError = 'Debes seleccionar alguna columna'
          return false
        }
        // TODO: Delegate mapvis category modal to mapvis component
        // let lngColumn = this.chartColumns.filter(columnIndex => this.columns[columnIndex].type == 'Longitude')
        // let latColumn = this.chartColumns.filter(columnIndex => this.columns[columnIndex].type == 'Latitude')
        // if (latColumn.length !== 1 && lngColumn !== 1) {
        //   this.columnsError = `Debes seleccionar una columna de tipo longitud y una de tipo latitud`
        //   return false
        // }
        // let strColumns = this.chartColumns.filter(columnIndex => this.columns[columnIndex].type == 'String')
        // numberColumns = this.chartColumns.filter(columnIndex => this.columns[columnIndex].type == 'Number')
        // if (strColumns.length >=1 || numberColumns.length >= 1) {
        //   this.mapCategoryOptions = this.columns.filter(col => strColumns.includes(this.columns.indexOf(col)) || numberColumns.includes(this.columns.indexOf(col)))
        //   this.modalMapCategory = true
        // } else {
        //   this.createMapChart()
        // }
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
        const url = `https://${domain}:8000/delete_table/${this.id}`
        axios.delete(url).then(response =>{
          console.log(response)
        })
      }
      // destroy the vue listeners, etc
      this.$destroy()
      // remove the element from the DOM
      this.$el.parentNode.removeChild(this.$el)
    },

    handleRangeChange (value) {
      this.mapCategoryRangesCant = value
      console.log(this.mapCategoryRangesCant)
    },

    createChartTypeCancel () {
      this.mapCategoryOptions = []
      this.mapCategory = null
      this.mapStringCategories = []
      this.from1 = null
      this.to1 = null
      this.from2 = null
      this.to2 = null
      this.from3 = null
      this.to3 = null
    }
  }
}
</script>