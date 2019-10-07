<template>
  <div>
    <!-- operations buttons -->
    <a-row>
      <a-button
        style="float: left; margin: 10px 5px;"
        @click="filterColumns()"
      >
        Filtrar Columnas
      </a-button>
      <a-button
        style="float: left; margin: 10px 5px;"
        @click="renameColumns()"
      >
        Renombrar Columnas
      </a-button>
      <a-button
        style="float: left; margin: 10px 5px;"
        @click="changeColumnsTypes()"
      >
        Definir tipos para las columnas
      </a-button>
      <a-button
        style="float: left; margin: 10px 5px;"
        :disabled="selectedRowKeys.length === 0"
        @click="createChart()"
      >
        Crear Grafico
      </a-button>
      <a-button
        v-if="backend"
        type="primary"
        style="float: right; margin: 10px 5px;"
        @click="persistTable()"
      >
        Guardar Cambios
      </a-button>
    </a-row>
    <!-- end operations buttons -->
    <!-- rows management -->
    <a-row>
      <a-button
        size="small"
        style="float: left; width: 180px; margin: 10px 5px;"
        @click="checkAllRows()"
      >
        Marcar todas las filas
      </a-button>
      <a-button
        size="small"
        style="float: left; width: 180px; margin: 10px 5px;"
        @click="uncheckAllRows()"
      >
        Desmarcar todas las filas
      </a-button>
    </a-row>
    <a-row>
      <span style="float: left; margin: 10px 5px;">
        <template v-if="selectedRowKeys.length > 0">
          {{`${selectedRowKeys.length} filas seleccionadas`}}
        </template>
      </span>
    </a-row>
    <!-- end rows management -->
    <!-- table -->
    <a-table
      :rowSelection="{selectedRowKeys: selectedRowKeys, onChange: onSelectChange}"
      :columns="columnsWithFunctions"
      :dataSource="rows"
      :rowKey="row => rows.indexOf(row)"
    >
      <div slot="filterDropdown" slot-scope="{ setSelectedKeys, selectedKeys, confirm, clearFilters, column }" class='custom-filter-dropdown'>
        <a-input
          v-ant-ref="c => searchInput = c"
          :placeholder="`Buscar ${column.dataIndex}`"
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
        >Buscar</a-button>
        <a-button
          @click="() => handleReset(clearFilters)"
          size="small"
          style="width: 90px"
        >Reiniciar</a-button>
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
    <!-- end table -->
    <!-- operations components -->
    <rename-columns
      ref="renameColumns"
      @onSave="niceTableChanged(niceTable)"
    />
    <filter-columns
      ref="filterColumns"
      @onSave="niceTableChanged(niceTable)"
    />
    <change-columns-types
      ref="changeColumnsTypes"
      @onSave="niceTableChanged(niceTable)"
    />
    <create-chart
      ref="createChart"
      @onSave="chartCreated"
    />
    <!-- end operations components -->
  </div>
</template>
<script>
// external
import Vue from 'vue'
import axios from 'axios'
import { Button, Icon, Input, Row, Table } from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'

var VueScrollTo = require('vue-scrollto')
Vue.use(VueScrollTo, {
  container: "body",
  duration: 500,
  easing: "ease",
  offset: 0,
  force: true,
  cancelable: true,
  onStart: false,
  onDone: false,
  onCancel: false,
  x: false,
  y: true
})

// my lib stuff
// utils
import utils from '@/utils/rendering'
// nice table class
import NiceTable from '@/nicetable'
// all posible charts
import charts from '@/components/charts'
// operations
import RenameColumns from '@/components/operations/RenameColumns'
import FilterColumns from '@/components/operations/FilterColumns'
import ChangeColumnsTypes from '@/components/operations/ChangeColumnsTypes'
import CreateChart from '@/components/operations/CreateChart'

export default {

  props: {
    niceTableParam: {
      type: Object,
      required: true
    },
    chartsDiv: {
      type: HTMLDivElement,
      required: true
    }
  },

  components: {
    'a-button': Button,
    'a-icon': Icon,
    'a-input': Input,
    'a-row': Row,
    'a-table': Table,
    // operations
    RenameColumns,
    FilterColumns,
    ChangeColumnsTypes,
    CreateChart
  },

  data () {
    return {
      niceTable: null,
      selectedRowKeys: [],
      // search in table
      searchText: '',
      searchInput: null
    }
  },

  computed: {
    id () {
      return this.niceTable ? this.niceTable.getId() : null
    },

    backend () {
      return this.niceTable ? this.niceTable.getBackend() : false
    },

    rows () {
      return this.niceTable ? this.niceTable.getRows() : []
    },

    visibleColumns () {
      return this.niceTable ? this.niceTable.getVisibleColumns() : []
    },

    columnsWithFunctions () {
      if (this.niceTable) {
        // adding posibility of sort / search in our table
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
      return []
    }
  },

  created () {
    this.loadTable()
  },

  methods: {
    // handlers
    checkAllRows () {
      this.selectedRowKeys = this.rows.map((row, index) => index)
    },

    uncheckAllRows () {
      this.selectedRowKeys = []
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

    // rendering
    loadTable () {
      let url = `${utils.baseUrl}/try_domain/`
      let tableId = this.niceTableParam.getId()
      const params = {
        domain: document.domain,
        identificator: tableId
      }
      let backend
      axios.get(url)
        .then(tryDomainResponse => {
          // recuperar tabla y luego charts
          let url = `${utils.baseUrl}/table/`
          const params = {
            domain: document.domain,
            identificator: tableId
          }
          axios.get(url, { params })
            .then((getTableResponse) => {
              // backend installed and table persisted
              console.log('there is a table, lets load it')
              let responseColumns = getTableResponse.data.columns.map(column => {
                return {
                  dataIndex: column.index,
                  title: column.title,
                  type: column.column_type,
                  visible: column.visible
                }
              })
              this.niceTable = new NiceTable(tableId, responseColumns, this.niceTableParam.getRows(), true)
              this.getCharts()
            })
            .catch((getTableError) => {
              console.log('no table persisted')
              this.niceTable = new NiceTable(tableId, this.niceTableParam.getColumns(), this.niceTableParam.getRows(), true)
            })
        })
        .catch(tryDomainError => {
          // no backend installed
          this.niceTable = NiceTable.clone(this.niceTableParam)
          this.niceTable.setBackend(false)
        })
    },

    async renderChart(type, conf, firstTime=true, id=null) {
      let chartClass = charts[type]
      chartClass = Vue.extend(chartClass)
      let propsData = {
        conf,
        niceTable: this.niceTable
      }
      if (id !== null) {
        propsData['id'] = id
      }
      let chart = new chartClass({
        propsData
      })
      chart.$mount() // pass nothing
      this.chartsDiv.appendChild(chart.$el)
      // only scroll if it is being created
      if (firstTime) {
        await this.$nextTick()
        this.$scrollTo(chart.$el)
      }
    },

    // API
    getCharts () {
      const url = `${utils.baseUrl}/chart/`
      const params = {
        domain: document.domain,
        identificator: this.id
      }
      axios.get(url, { params })
        .then(response => {
          const charts = response.data
          charts.forEach(chart => {
            // const data = JSON.parse(chart.data)
            const type = chart.chart_type
            const conf = JSON.parse(chart.conf)
            const firstTime = false
            this.renderChart(type, conf, firstTime, chart.id)
          })
        })
    },

    persistTable () {
      // save columns
      let url = `${utils.baseUrl}/table/`
      let columns = this.niceTable.getColumns()
      axios.post(url, {
        domain: document.domain,
        identificator: this.id,
        columns: JSON.stringify(columns)
      }).then(response => {
        console.log('table persisted!')
      })
    },

    persistChart (type, conf) {
      // first save table changes
      let url = `${utils.baseUrl}/table/`
      let columns = this.niceTable.getColumns()
      axios.post(url, {
        domain: document.domain,
        identificator: this.id,
        columns: JSON.stringify(columns)
      }).then(response => {
        // save chart
        const url = `${utils.baseUrl}/chart/`
        const params = {
          domain: document.domain,
          identificator: this.id,
          chart_type: type,
          conf: JSON.stringify(conf)
        }
        axios.post(url, params)
          .then(response => {
            const chart = response.data
            const firstTime = true
            this.renderChart(type, conf, firstTime, chart.id)
          })
      })
    },

    // operations
    renameColumns () {
      this.$refs.renameColumns.niceTable = this.niceTable
      this.$refs.renameColumns.showModal()
    },

    filterColumns () {
      this.$refs.filterColumns.niceTable = this.niceTable
      this.$refs.filterColumns.showModal()
    },

    changeColumnsTypes () {
      this.$refs.changeColumnsTypes.niceTable = this.niceTable
      this.$refs.changeColumnsTypes.showModal()
    },

    niceTableChanged (niceTable) {
      this.niceTable = niceTable
    },

    createChart () {
      this.$refs.createChart.niceTable = this.niceTable
      this.$refs.createChart.showModal()
    },

    chartCreated (type, conf) {
      conf['selectedRows'] = this.selectedRowKeys
      this.renderChart(type, conf)
      // if (this.backend) {
      //   this.persistChart(type, conf)
      // } else {
      //   this.renderChart(type, conf)
      // }
    }
  }
}
</script>