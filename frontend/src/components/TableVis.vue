<template>
  <div>
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
        @click="createChart()"
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
    </a-row>
    <a-table
      :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
      :columns="columnsWithFunctions"
      :dataSource="rows"
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
    <create-chart
      ref="createChart"
      @onSave="chartCreated"
    />
  </div>
</template>
<script>
import moment from 'moment'
import Vue from 'vue'
import charts from '@/components/charts'
import CreateChart from '@/components/operations/CreateChart'
import axios from 'axios'
import utils from '@/components/utils'
import { Col, Input } from 'ant-design-vue'
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

export default {
  props: {
    niceTable: {
      type: Object,
      required: true
    },
    backend: {
      type: Boolean,
      required: true
    }
  },

  components: {
    'a-col': Col,
    'a-input': Input,
    CreateChart
  },

  data () {
    return {
      selectedRowKeys: [],
      selectedChartType : null,
      showTable: false,
      searchText: '',
      searchInput: null,
      chartModalVisible: false,
      columnsError: null
    }
  },

  computed: {
    hasSelected () {
      return this.selectedRowKeys.length > 0
    },

    id () {
      return this.niceTable.getId()
    },

    rows () {
      return this.niceTable.getRows()
    },

    visibleColumns () {
      return this.niceTable.getVisibleColumns()
    },

    columnsWithFunctions () {
      let columnsWithFunctions = []
      this.visibleColumns.forEach(col => {
        let column = Object.assign({}, col)
        if (column['type'] === 'String') {
          let field = column['dataIndex']
          column['sorter'] = (a, b) => a[field].length - b[field].length
          column['scopedSlots'] = {
            filterDropdown: 'filterDropdown',
            filterIcon: 'filterIcon',
            customRender: 'customRender'
          }
          column['onFilter'] = (value, record) => record[field].toLowerCase().includes(value.toLowerCase())
        }
        if (column['type'] === 'Number') {
          let field = column['dataIndex']
          column['sorter'] = (a, b) => a[field] - b[field]
        }
        columnsWithFunctions.push(column)
      })
      return columnsWithFunctions
    }
  },

  created () {
    // if (this.backend) {
    //   this.getCharts()
    // }
  },

  methods: {
    // Rendering
    async renderChart(id, chartType, selectedColumns, firstTime=true) {
      let componentClass = charts[chartType]
      let ComponentClass = Vue.extend(componentClass)
      let conf = {
        selectedColumns: selectedColumns,
        selectedRows: this.selectedRowKeys
      }
      let chart = new ComponentClass({
        propsData: {
          backend: false,
          conf,
          niceTable: this.niceTable
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
      return this.rows.indexOf(row)
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

    handleSearch (selectedKeys, confirm) {
      confirm()
      this.searchText = selectedKeys[0]
    },

    handleReset (clearFilters) {
      clearFilters()
      this.searchText = ''
    },

    // API
    // getCharts () {
    //   const url = `${utils.baseUrl}/chart/`
    //   const params = {
    //     domain: document.domain,
    //     nice_table: this.id
    //   }
    //   axios.get(url, {params})
    //     .then(response => {
    //       this.backend = true
    //       const charts = response.data
    //       charts.forEach(chart => {
    //         const data = JSON.parse(chart.data)
    //         this.renderChart(chart.id, chart.chart_type, data, false)
    //       })
    //     })
    // },

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
        axios.delete(url).then(response => {
          console.log(response)
        })
      }
      // destroy the vue listeners, etc
      this.$destroy()
      // remove the element from the DOM
      this.$el.parentNode.removeChild(this.$el)
    },

    createChart () {
      this.$refs.createChart.columns = this.niceTable.getVisibleColumns()
      this.$refs.createChart.showModal()
    },

    chartCreated (chart) {
      let selectedColumns = chart.selectedColumns
      let chartType = chart.chartType
      let id
      if (this.backend) {
        // persist and then render chart
        this.persistChart(processedData, chartType)
      } else {
        // only render chart
        this.renderChart(id, chartType, selectedColumns)
      }
    }
  }
}
</script>