<template>
  <div ref="tableContainer">
    <a-row ref="buttons">
      <a-button
        style="float: left; margin: 10px 5px;"
        ref="button"
        @click="showCreateModal()"
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
    <!-- select columns names -->
    <a-modal
      title="Crear Tabla Infovis"
      v-model="modalVisible0"
    >
      <template slot="footer">
        <a-button
          key="submit"
          type="primary"
          @click="saveColumnNames()"
        >
          Guardar
        </a-button>
      </template>
      <h3>Completa con un nombre descriptivo para tus columnas</h3>
      <a-row
        v-for="(column, index) in allColumns"
        :key="index"
      >
        <a-col style="text-align: center;">
          <a-input 
            :addonBefore="column.value"
            v-model="column.label"
            style="width: 250px; margin-top: 5px;"
          />
        </a-col>
      </a-row>
    </a-modal>
    <!-- end select columns names -->
    <!-- filter columns -->
    <a-modal
      title="Crear Tabla Infovis"
      v-model="modalVisible1"
    >
      <template slot="footer">
        <a-button
          key="submit"
          type="primary"
          :disabled="selectedColumns.length === 0"
          @click="handleSaveColumns"
        >
          Guardar
        </a-button>
      </template>
      <a-row>
        <h3>Selecciona las columnas que quieras incluir en tu nueva tabla</h3>
        <a-checkbox-group
          style="margin: 0 30px;"
          :options="allColumns"
          v-model="selectedColumns"
        />
      </a-row>
    </a-modal>
    <!-- end filtering columns -->
    <!-- select data types -->
    <a-modal
      title="Crear Tabla Infovis"
      v-model="modalVisible2"
      @cancel="wizardClosed()"
      :footer="null"
    >
      <vue-good-wizard
        v-if="steps.length > 0"
        ref="my-wizard"
        :steps="steps"
        :onNext="nextClicked" 
        :onBack="backClicked"
      >
        <div
          v-for="(column, index) in curatedColumns"
          :key="index"
          :slot="column.dataIndex"
        >
          <a-card>
            <p><strong>Nombre:</strong> {{column.title}}</p>
            <p><strong>Ejemplo:</strong> {{example[column.dataIndex]}}</p>
            <p>Select a data type</p>
            <a-select
              style="width: 100%"
              placeholder="Select data type"
              v-model="selectedType"
            >
              <a-select-option
                v-for="(type, index) in dataTypes"
                :key="index"
                :value="type"
              >
                {{type}}
              </a-select-option>
            </a-select>
            <div
              style="margin-top: 10px;"
              v-if="selectedType === 'Date'"
            >
              <p>Select a date format</p>
              <a-select
                style="width: 100%;"
                placeholder="Select date format"
                v-model="dateFormat"
              >
                <a-select-option
                  v-for="(dateFormat, index) in dateFormats"
                  :key="index"
                  :value="dateFormat"
                >
                  {{dateFormat}}
                </a-select-option>
              </a-select>
            </div>
            <a-alert
              style="margin-top: 10px;"
              v-if="columnsError"
              type="error"
              :message="columnsError"
              banner
            />
          </a-card>
        </div>
        <div slot="page4">
          <h4>Step 4</h4>
          <p>This is step 4</p>
        </div>
      </vue-good-wizard>
    </a-modal>
    <!-- end selecting data types -->
  </div>
</template>

<script>
import NiceTable from '@/components/NiceTable'
import Vue from 'vue'
import moment from 'moment'
import axios from 'axios'
import utils from '@/components/utils'

function isNumeric (str) {
  return !isNaN(str)
}

function isDate(value) {
  var dateFormat
  if (toString.call(value) === '[object Date]') {
      return true
  }
  if (typeof value.replace === 'function') {
      value.replace(/^\s+|\s+$/gm, '')
  }
  dateFormat = /(^\d{1,4}[\.|\\/|-]\d{1,2}[\.|\\/|-]\d{1,4})(\s*(?:0?[1-9]:[0-5]|1(?=[012])\d:[0-5])\d\s*[ap]m)?$/;
  return dateFormat.test(value)
}

function isCoordinate (str) {
  return str.match(/((\d+)+(\.\d+))$/)
}

const dataTypes = [
  'Date',
  'Number',
  'String',
  'Latitude',
  'Longitude'
]

const dateFormats = ['DDMMYYY', 'MMDDYYY']

const url = `${utils.baseUrl}/nice_table/`

export default {
  props: {
    columns: {
      type: Array,
      required: true
    },
    data: {
      type: Array,
      required: true
    },
    tableId: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      backend: false,
      showCreateButton: false,
      modalVisible0: false,
      modalVisible1: false,
      modalVisible2: false,
      allColumns: [],
      selectedColumns: [],
      curatedColumns: [],
      selectedType: null,
      steps: [],
      example: {},
      tableCreated: false,
      tableVisible: true,
      columnsError: null,
      dateFormat: dateFormats[0],
      dataTypes,
      dateFormats
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
    showCreateModal () {
      this.modalVisible0 = true
    },

    saveColumnNames () {
      this.modalVisible0 = false
      this.modalVisible1 = true
    },

    handleSaveColumns () {
      this.steps = []
      this.curatedColumns = []
      this.selectedColumns.forEach(column => {
        this.steps.push({
          label: 'Select type',
          slot: column
        })
        let completeColumn = this.allColumns.find(col => col.value == column)
        this.curatedColumns.push({
          'dataIndex': column,
          'title': completeColumn['label'],
          'type': this.predictType(column)
        })
      })
      this.selectedType = this.curatedColumns[0].type
      this.modalVisible1 = false
      this.modalVisible2 = true
    },

    nextClicked (currentPage) {
      this.columnsError = null
      if ((this.selectedType === null) || (this.selectedType === undefined)) {
        this.columnsError = `No type selected`
        return false
      }
      // else
      let column = this.curatedColumns[currentPage]
      let example = this.example[column.dataIndex]
      let validate = this.checkType(example, this.selectedType)
      if (this.selectedType == 'Date') {
        column['format'] = this.dateFormat
      }
      if (validate) {
        column['type'] = this.selectedType
        if (currentPage == this.steps.length - 1) {
          // last page
          this.createNiceTable(this.curatedColumns)
          this.modalVisible2 = false
        } else {
          this.selectedType = this.curatedColumns[currentPage+1]['type']
        }
        //return false if you want to prevent moving to next page
        return true 
      } else {
        this.columnsError = `Column ${column.dataIndex} is not a ${this.selectedType}`
        if (this.selectedType == 'Date'){
          this.columnsError += ` with format ${this.dateFormat}`
        }
        return false
      }
    },

    backClicked (currentPage) {
      this.selectedType = this.curatedColumns[currentPage-1]['type']
      //return false if you want to prevent moving to previous page
      return true
    },

    createNiceTable (columns) {
      let niceTableId
      if (this.backend) {
        this.persistNiceTable(columns)
      } else {
        this.displayNiceTable(niceTableId, columns)
      }
      this.curatedColumns = []
      this.selectedColumns = []
      this.steps = []
      this.selectedType = null
    },

    async displayNiceTable (id, columns) {
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
      let ComponentClass = Vue.extend(NiceTable)
      let niceTable = new ComponentClass({
        propsData: {
          id,
          columns: columnsWithFunctions,
          data: filteredData,
          backend: this.backend
        }
      })
      niceTable.$mount()
      this.$refs.tableContainer.appendChild(niceTable.$el)
      this.tableCreated = true
      this.showCreateButton = false
      await this.$nextTick()
      this.$scrollTo(niceTable.$el)
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

    checkType (value, type) {
      if (type === 'Number') {
        return isNumeric(value)
      }
      if (type === 'Date') {
        if (isDate(value) && this.dateFormat) {
          let date = moment(value, this.dateFormat)
          return String(date._d) !== 'Invalid Date'
        }
        return false
      }
      if (type === 'Longitude' || type === 'Latitude') {
        return isCoordinate(value)
      }
      return true
    },

    predictType (column) {
      let example = this.example[column]
      if (isNumeric(example)) {
        return 'Number'
      }
      if (isDate(example)) {
        return 'Date'
      }
      if (isCoordinate(example)) {
        if ((column.toLowerCase() === 'lat') || (column.toLowerCase() === 'latitude')) {
          return 'Latitude'
        }
        if ((column.toLowerCase() === 'long') || (column.toLowerCase() === 'lng') || (column.toLowerCase() === 'longitude')) {
          return 'Longitude'
        }
        if (this.curatedColumns.some(column => column.type == 'Latitude')) {
          return 'Longitude'
        }
        return 'Latitude'
      }
      return 'String'
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
            this.displayNiceTable(niceTable.id, columns)
          })
        })
        .catch(error => {
          this.backend = false
          console.log('no backend installed')
        })
    },

    persistNiceTable (columns) {
      // save columns and display
      axios.post(url, {
        domain: document.domain,
        table_id: this.tableId,
        columns: JSON.stringify(columns)
      }).then(response => {
        const newTable = response.data
        this.displayNiceTable(newTable.id, columns)
      })
    }
  }
}
</script>

<style scoped>
</style>
