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
        Eliminar Tabla
      </a-button>
      <a-button
        style="margin-left: 5px; margin-top: 50px; float: left;"
        type="primary"
        :disabled="selectedRowKeys.length === 0"
        @click="chartModalVisible = true"
      >
        Crear Grafico
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
  </div>
</template>
<script>
import moment from 'moment'
import Vue from 'vue'
import charts from '@/components/charts'
import axios from 'axios'
import utils from '@/components/utils'
import { GoodWizard } from 'vue-good-wizard'

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

// TODO: dynamic
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

  components: {
    'vue-good-wizard': GoodWizard
  },

  data () {
    return {
      selectedRowKeys: [],
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
    // Rendering
    async renderChart(id, chartType, data, firstTime=true) {
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
      if (firstTime) {
        await this.$nextTick()
        this.$scrollTo(chart.$el)
      }
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

    onSelectChange (selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },

    handleChartChange (value) {
      this.selectedChartType = this.chartTypes.find(item => item.value == value)
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
        const chartType = this.selectedChartType.value
        let selectedComponent = charts[chartType]
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
              this.persistChart(processedData, chartType)
            } else {
              // only render chart
              this.renderChart(id, chartType, processedData)
            }
            this.selectedRowKeys = []
            this.chartColumns = []
          }
        } else {
          this.columnsError = 'Debes seleccionar alguna columna'
          return false
        }
      }
      this.chartModalVisible = false
      this.selectedChartType = null
      this.$refs['my-wizard'].goTo(0)
    },

    backClicked (currentPage) {
      return true
    },

    // API
    getCharts () {
      const url = `${utils.baseUrl}/chart/`
      const params = {
        domain: document.domain,
        nice_table: this.id
      }
      axios.get(url, {params})
        .then(response => {
          this.backend = true
          const charts = response.data
          charts.forEach(chart => {
            const data = JSON.parse(chart.data)
            this.renderChart(chart.id, chart.chart_type, data, false)
          })
        })
    },

    persistChart (data, chartType) {
      const url = `${utils.baseUrl}/chart/`
      axios.post(url, {
        nice_table: this.id,
        chart_type: chartType,
        data: JSON.stringify(data)
      }).then(response => {
        const newChart = response.data
        this.renderChart(newChart.id, chartType, data)
      })
    },

    removeTable () {
      if (this.backend) {
        // remove from backend
        const url = `${utils.baseUrl}/table_detail/${this.id}`
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