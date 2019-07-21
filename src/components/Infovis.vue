<template>
  <div ref="tableContainer">
    <a-row ref="buttons">
      <a-button
        v-show="showCreateButton"
        style="float: left; margin: 10px 5px;"
        ref="button"
        @click="parseTable()"
      >
        Create Infovis Table
      </a-button>
      <a-button
        v-show="tableCreated && !tableVisible"
        style="float: left; margin: 10px 5px;"
        ref="eye"
        @click="showTable"
      >
        <a-icon type="eye" />
      </a-button>
      <a-button
        v-show="tableCreated && tableVisible"
        style="float: left; margin: 10px 5px;"
        ref="eyeInvisible"
        @click="hideTable"
      >
        <a-icon type="eye-invisible" />
      </a-button>
    </a-row>
    <a-modal
      title="Create Infovis Table"
      v-model="modalVisible1"
    >
      <template slot="footer">
        <a-button
          key="submit"
          type="primary"
          :disabled="selectedColumns.length === 0"
          @click="handleSaveColumns"
        >
          Save
        </a-button>
      </template>
      <a-row>
        <h3>Select columns that you what to include in your new table</h3>
        <a-checkbox-group
          style="margin: 0 30px;"
          :options="allColumns"
          v-model="selectedColumns"
        />
      </a-row>
    </a-modal>
    <a-modal
      title="Create Infovis Table"
      v-model="modalVisible2"
      :footer="null"
    >
      <vue-good-wizard 
        :steps="steps"
        :onNext="nextClicked" 
        :onBack="backClicked"
      >
        <div
          v-for="(column, index) in selectedColumns"
          :key="index"
          :slot="column"
        >
          <a-card>
            <p><strong>Column name:</strong> {{column}}</p>
            <p><strong>Example:</strong> {{example[column]}}</p>
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
          </a-card>
        </div>
        <div slot="page4">
          <h4>Step 4</h4>
          <p>This is step 4</p>
        </div>
      </vue-good-wizard>
    </a-modal>
  </div>
</template>

<script>
import NiceTable from '@/components/NiceTable'
import Vue from 'vue'
/**
 * converts array-like object to array
 * @param  collection the object to be converted
 * @return {Array} the converted object
 */
function arrayify(collection) {
  return Array.prototype.slice.call(collection);
}

/**
 * generates factory functions to convert table rows to objects,
 * based on the titles in the table's <thead>
 * @param  {Array[String]} headings the values of the table's <thead>
 * @return {Function}      a function that takes a table row and spits out an object
 */
function factory(headings) {
  return function(row) {
    return arrayify(row.cells).reduce(function(prev, curr, i) {
      prev[headings[i]] = curr.innerText;
      return prev;
    }, {});
  }
}

/**
 * given a table, generate an array of objects.
 * each object corresponds to a row in the table.
 * each object's key/value pairs correspond to a column's heading and the row's value for that column
 * 
 * @param  {HTMLTableElement} table the table to convert
 * @return {Array[Object]}       array of objects representing each row in the table
 */
function parseHead(table) {
  let headings = arrayify(table.tHead.rows[0].cells).map(function(heading) {
    return heading.innerText;
  })
  return headings
}

function parseTable(table) {
  let headings = parseHead(table)
  return arrayify(table.tBodies[0].rows).map(factory(headings))
}

function isNumeric (str) {
  return !isNaN(str)
}

function isDate(str) {
  var dateFormat;
  if (toString.call(str) === '[object Date]') {
      return true;
  }
  if (typeof str.replace === 'function') {
      str.replace(/^\s+|\s+$/gm, '');
  }
  dateFormat = /(^\d{1,4}[\.|\\/|-]\d{1,2}[\.|\\/|-]\d{1,4})(\s*(?:0?[1-9]:[0-5]|1(?=[012])\d:[0-5])\d\s*[ap]m)?$/;
  return dateFormat.test(str);
}

function isCoordinate (str) {
  return str.match(/((\d+)+(\.\d+))$/)
}

const dataTypes = [
  'Date',
  'Date and Time',
  'Number',
  'String',
  'Latitude',
  'Longitude',
  'Other'
]

const dateFormats = [
  'DD/MM/YYYY',
  'MM/DD/YYYY',
  'DD-MM-YYYY',
  'MM-DD-YYYY'
]

export default {
  props: {
    tableId: {
      type: String,
      required: true
    }
  },

  data () {
    return {
      showCreateButton: false,
      modalVisible1: false,
      modalVisible2: false,
      data: [],
      allColumns: [],
      selectedColumns: [],
      curatedColumns: [],
      dataTypes: dataTypes,
      selectedType: null,
      steps: [],
      example: {},
      tableCreated: false,
      tableVisible: true,
    }
  },

  mounted () {
    var table = document.querySelector(`#${this.tableId}`)
    if (table) {
      var buttons = this.$refs.buttons.$el
      // var eye = this.$refs.eye.$el
      // var eyeInvisible = this.$refs.eyeInvisible.$el
      // table.parentElement.insertBefore(button, table)
      // table.parentElement.insertBefore(eye, table)
      table.parentElement.insertBefore(buttons, table)
      this.showCreateButton = true
    } else {
      console.log('No table id found')
    }
  },

  methods: {
    parseTable () {
      var table = document.querySelector(`#${this.tableId}`)
      let columns = parseHead(table)
      this.allColumns = columns
      this.data = parseTable(table)
      this.allColumns.forEach(column => {
        let filtered = this.data.filter(element => element[column] !== '')
        this.example[column] = filtered ? filtered[0][column] : 'No data example' 
      })
      this.modalVisible1 = true
    },

    // handleTypeChange (value, column) {
    //   console.log(value)
    //   console.log(column)
    // },

    handleSaveColumns () {
      this.steps = []
      this.curatedColumns = []
      this.selectedColumns.forEach(column => {
        this.steps.push({
          label: 'Select type',
          slot: column
        })
        this.curatedColumns.push({
          'dataIndex': column,
          'title': column
        })
      })
      this.modalVisible1 = false
      this.modalVisible2 = true
    },

    nextClicked (currentPage) {
      if ((this.selectedType === null) || (this.selectedType === undefined)) {
        return false
      }
      // else
      this.curatedColumns[currentPage]['type'] = this.selectedType
      if (currentPage == this.steps.length - 1) {
        // last page
        this.createNiceTable()
        this.modalVisible2 = false
      } else {
        this.selectedType = this.curatedColumns[currentPage+1]['type']
      }
      //return false if you want to prevent moving to next page
      return true
    },

    backClicked (currentPage) {
      console.log('back clicked', currentPage)
      this.selectedType = this.curatedColumns[currentPage-1]['type']
      //return false if you want to prevent moving to previous page
      return true
    },

    async createNiceTable () {
      let ComponentClass = Vue.extend(NiceTable)
      this.curatedColumns.forEach(column => {

      })
      let niceTable = new ComponentClass({
        propsData: {
          columns: this.curatedColumns,
          data: this.data
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
      console.log('hide table')
      let table = document.querySelector(`#${this.tableId}`)
      table.style.display = 'none'
      this.tableVisible = false
    },

    showTable () {
      console.log('show table')
      let table = document.querySelector(`#${this.tableId}`)
      table.style.display = ''
      this.tableVisible = true
    }
  }
}
</script>

<style scoped>
</style>
