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
    </a-row>
    <!-- operations -->
    <rename-columns
      ref="renameColumns"
      @onSave="renamedColumns(niceTable)"
    />
    <filter-columns
      ref="filterColumns"
      @onSave="filteredColumns(niceTable)"
    />
    <change-columns-types
      ref="changeColumnsTypes"
      @onSave="changedColumnTypes(niceTable)"
    />
  </div>
</template>

<script>
//// external
import Vue from 'vue'
import axios from 'axios'
// antd conf
import Antd from 'ant-design-vue'
import { Row, Button } from 'ant-design-vue'
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
import NiceTable from '@/nicetable'

const url = `${utils.baseUrl}/nice_table/`

export default {
  props: {
    niceTableParam: {
      type: Object,
      required: true
    }
  },

  components: {
    // ant design components
    'a-row': Row,
    'a-button': Button,
    // operations
    RenameColumns,
    FilterColumns,
    ChangeColumnsTypes
  },

  data () {
    return {
      niceTable: null,
      backend: false,
      showCreateButton: false,
      tableCreated: false,
      tableVisible: true
    }
  },

  created () {
    this.niceTable = NiceTable.clone(this.niceTableParam)
    this.getNiceTables()
    this.showCreateButton = true
  },

  methods: {
    // Rendering
    renameColumns () {
      this.$refs.renameColumns.niceTable = this.niceTable
      this.$refs.renameColumns.showModal()
    },

    renamedColumns (niceTable) {
      this.niceTable = niceTable
      this.$refs.filterColumns.niceTable = niceTable
      this.$refs.filterColumns.showModal()
    },

    filteredColumns (niceTable) {
      this.niceTable = niceTable
      this.$refs.changeColumnsTypes.niceTable = niceTable
      this.$refs.changeColumnsTypes.showModal()
    },

    changedColumnTypes (niceTable) {
      this.createTableVis(niceTable.getColumns())
    },

    createTableVis (columns) {
      let niceTableId
      if (this.backend) {
        this.persistTableVis(columns)
      } else {
        this.displayTableVis(niceTableId, columns)
      }
    },

    async displayTableVis (id, columns) {
      // let filteredData = rows.filter(element => {
      //   let dataIndexes = columnsWithFunctions.map(col => col['dataIndex'])
      //   let toRemove = true
      //   dataIndexes.forEach(col => {
      //     if ((element[col] !== '') && element[col] !== 'null') {
      //       toRemove = false
      //     }
      //   })
      //   return !toRemove
      // })
      let ComponentClass = Vue.extend(TableVis)
      let tableVis = new ComponentClass({
        propsData: {
          backend: this.backend,
          niceTable: this.niceTable
        }
      })
      tableVis.$mount()
      this.$refs.tableContainer.appendChild(tableVis.$el)
      this.tableCreated = true
      this.showCreateButton = false
      await this.$nextTick()
      VueScrollTo.scrollTo(tableVis.$el)
    },

    // API
    getNiceTables () {
      let tableId = this.niceTable.getId()
      const params = {
        domain: document.domain,
        table_id: tableId
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
      let tableId = this.niceTable.getId()
      axios.post(url, {
        domain: document.domain,
        table_id: tableId,
        columns: JSON.stringify(columns)
      }).then(response => {
        const newTable = response.data
        this.displayTableVis(newTable.id, columns)
      })
    }
  }
}
</script>