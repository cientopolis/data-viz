<template>
  <!-- select data types -->
  <a-modal
    title="Crear Tabla Infovis"
    v-model="modalVisible"
    @cancel="handleCancel"
    :footer="null"
  >
    <vue-good-wizard
      v-if="steps.length > 0"
      ref="wizard"
      :steps="steps"
      :onNext="nextClicked"
      :onBack="backClicked"
    >
      <div
        v-for="(column, index) in columns"
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
</template>
<script>
// external
import moment from 'moment'
import { Card, Select, Modal } from 'ant-design-vue'
import { GoodWizard } from 'vue-good-wizard'
// my lib
import NiceTable from '@/nicetable'
import utils from '@/components/utils'

const dateFormats = ['DDMMYYY', 'MMDDYYY']

export default {
  components: {
    'a-card': Card,
    'a-modal': Modal,
    'a-select': Select,
    'a-select-option': Select.Option,
    'vue-good-wizard': GoodWizard
  },

  data () {
    return {
      niceTable: null,
      modalVisible: false,
      example: {},
      steps: [],
      selectedType: null,
      columnsError: null,
      dateFormat: dateFormats[0],
      dataTypes: utils.dataTypes,
      dateFormats
    }
  },

  computed: {
    columns () {
      return this.niceTable.getVisibleColumns()
    }
  },

  methods: {
    showModal () {
      this.steps = []
      this.selectedType = this.columns[0].type
      this.columns.forEach(column => {
        this.steps.push({
          label: 'Select type',
          slot: column.dataIndex
        })
        this.example[column.dataIndex] = NiceTable.getExample(column.dataIndex, this.niceTable.getRows())
      })
      this.modalVisible = true
    },

    handleCancel () {
      this.$refs.wizard.goTo(0)
    },

    save () {
      let niceTable = new NiceTable(this.niceTable.id, this.columns, this.niceTable.rows)
      this.steps = []
      this.$refs.wizard.goTo(0)
      this.$emit('onSave', niceTable)
      this.modalVisible = false
    },

    checkType (value, type) {
      if (type === 'Number') {
        return utils.isNumeric(value)
      }
      if (type === 'Date') {
        if (utils.isDate(value) && this.dateFormat) {
          let date = moment(value, this.dateFormat)
          return String(date._d) !== 'Invalid Date'
        }
        return false
      }
      if (type === 'Longitude' || type === 'Latitude') {
        return utils.isCoordinate(value)
      }
      return true
    },

    nextClicked (currentPage) {
      this.columnsError = null
      if ((this.selectedType === null) || (this.selectedType === undefined)) {
        this.columnsError = `No type selected`
        return false
      }
      // else
      let column = this.columns[currentPage]
      const example = this.example[column.dataIndex]
      let validate = this.checkType(example, this.selectedType)
      if (this.selectedType == 'Date') {
        column['format'] = this.dateFormat
      }
      if (validate) {
        column['type'] = this.selectedType
        if (currentPage == this.steps.length - 1) {
          // last page
          this.save()
        } else {
          this.selectedType = this.columns[currentPage + 1]['type']
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
      this.selectedType = this.columns[currentPage-1]['type']
      //return false if you want to prevent moving to previous page
      return true
    }
  }
}
</script>