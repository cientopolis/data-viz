<template>
  <div ref="tableContainer">
    <a-row ref="buttons">
      <a-button
        style="float: left; margin: 10px 5px;"
        ref="button"
        @click="renameColumns()"
      >
        Crear Tabla Infovis
      </a-button>
      <a-button
        v-show="!tableVisible"
        style="float: left; margin: 10px 5px;"
        ref="eye"
        @click="showTable"
      >
        <a-icon type="eye" />
      </a-button>
      <a-button
        v-show="tableVisible"
        style="float: left; margin: 10px 5px;"
        ref="eyeInvisible"
        @click="hideTable"
      >
        <a-icon type="eye-invisible" />
      </a-button>
    </a-row>
    <rename-columns ref="renameColumns" />
    <filter-columns ref="filterColumns" />
    <change-columns-types ref="changeColumnsTypes" />
  </div>
</template>

<script>
//// external
import Vue from 'vue'
import axios from 'axios'
// antd conf
import Antd from 'ant-design-vue'
import { Row, Button, Icon } from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'
Vue.use(Antd)
// end antd conf
// scroll to conf
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
// end scroll to conf
//// my lib
import utils from '@/components/utils'
import TableVis from '@/components/TableVis'
import RenameColumns from '@/components/operations/RenameColumns'
import FilterColumns from '@/components/operations/FilterColumns'
import ChangeColumnsTypes from '@/components/operations/ChangeColumnsTypes'

const url = `${utils.baseUrl}/nice_table/`

export default {
  props: {
    columns: {
      type: Array,
      default: function () {
        return ['number', 'string', 'date', 'otherstring', 'lat', 'lng']
      }
    },
    data: {
      type: Array,
      default: function () {
        return [
          { 
            number: 1234,
            string: 'Un string',
            date: '2019-08-25',
            otherstring: 'blablanba',
            lat: '-35.115.974',
            lng: '-58.172.607',
          },
          { 
            number: 0,
            string: 'esofkoewkfew',
            date: '2018-08-25',
            otherstring: 'Lorem ipsum',
            lat: '-34.838.684',
            lng: '-58.833.248'
          }
        ]
      }
    },
    tableId: {
      type: String,
      default: function () {
        return 'tableId'
      }
    }
  },

  components: {
    // ant design components
    'a-row': Row,
    'a-button': Button,
    'a-icon': Icon,
    // operations
    RenameColumns,
    FilterColumns,
    ChangeColumnsTypes
  },

  data () {
    return {
      backend: false,
      showCreateButton: false,
      allColumns: [],
      selectedColumns: [],
      curatedColumns: [],
      example: {},
      tableCreated: false,
      tableVisible: true
    }
  },

  mounted () {
    this.getNiceTables()
    this.allColumns = this.columns.map(column => {
      return {
        'value': column,
        'label': column
      }
    })
    this.allColumns.forEach(col => {
      let column = col['value']
      let filtered = this.data.filter(element => element[column] !== '')
      this.example[column] = filtered ? filtered[0][column] : 'No data example' 
    })
    this.showCreateButton = true
  },

  methods: {
    // Rendering
    renameColumns () {
      this.$refs.renameColumns.columns = this.allColumns
      this.$refs.renameColumns.showModal()
    },

    renamedColumns (columns) {
      this.allColumns = columns
      this.$refs.filterColumns.columns = this.allColumns
      this.$refs.filterColumns.showModal()
    },

    filteredColumns (columns) {
      this.selectedColumns = columns
      this.$refs.changeColumnsTypes.allColumns = this.allColumns
      this.$refs.changeColumnsTypes.selectedColumns = this.selectedColumns
      this.$refs.changeColumnsTypes.example = this.example
      this.$refs.changeColumnsTypes.showModal()
    },

    changedColumnTypes (columns) {
      this.createTableVis(columns)
    },

    createTableVis (columns) {
      let niceTableId
      if (this.backend) {
        this.persistTableVis(columns)
      } else {
        this.displayTableVis(niceTableId, columns)
      }
      this.curatedColumns = []
      this.selectedColumns = []
      this.steps = []
      this.selectedType = null
    },

    async displayTableVis (id, columns) {
      // searcheable and sorteable columns
      let columnsWithFunctions = []
      columns.forEach(col => {
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
      let filteredData = this.data.filter(element => {
        let dataIndexes = columnsWithFunctions.map(col => col['dataIndex'])
        let toRemove = true
        dataIndexes.forEach(col => {
          if ((element[col] !== '') && element[col] !== 'null') {
            toRemove = false
          }
        })
        return !toRemove
      })
      let ComponentClass = Vue.extend(TableVis)
      let tableVis = new ComponentClass({
        propsData: {
          id,
          columns: columnsWithFunctions,
          data: filteredData,
          backend: this.backend
        }
      })
      tableVis.$mount()
      this.$refs.tableContainer.appendChild(tableVis.$el)
      this.tableCreated = true
      this.showCreateButton = false
      await this.$nextTick()
      VueScrollTo.scrollTo(tableVis.$el)
    },

    hideTable () {
      let table = document.querySelector(`#${this.tableId}`)
      table.style.display = 'none'
      this.tableVisible = false
    },

    showTable () {
      let table = document.querySelector(`#${this.tableId}`)
      table.style.display = ''
      this.tableVisible = true
    },

    // API
    getNiceTables () {
      const params = {
        domain: document.domain,
        table_id: this.tableId
      }
      axios.get(url, {params})
        .then(response => {
          this.backend = true
          const niceTables = response.data
          niceTables.forEach(niceTable => {
            const columns = niceTable.columns.map(column => {
              return {
                dataIndex: column['index'],
                title: column['title'],
                type: column['column_type']
              }
            })
            this.displayTableVis(niceTable.id, columns)
          })
        })
        .catch(error => {
          this.backend = false
          console.log(`no backend installed ${error}`)
        })
    },

    persistTableVis (columns) {
      // save columns and display
      axios.post(url, {
        domain: document.domain,
        table_id: this.tableId,
        columns: JSON.stringify(columns)
      }).then(response => {
        const newTable = response.data
        this.displayTableVis(newTable.id, columns)
      })
    }
  }
}
</script>