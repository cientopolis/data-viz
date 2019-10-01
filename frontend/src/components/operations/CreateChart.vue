<template>
  <!-- create chart modal -->
  <a-modal
    v-model="modalVisible"
    :footer="null"
  >
    <vue-good-wizard
      ref="my-wizard"
      :steps="steps"
      :onNext="nextClicked"
      :onBack="backClicked"
    >
      <div slot="selectChartType">
        <span style="margin-right: 10px; margin-left: 5px">Selecciona un tipo de gráfico</span>
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
            Selecciona las columnas para tu gráfico.
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
                {{column.label}}
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
</template>
<script>
import { GoodWizard } from 'vue-good-wizard'
import { Alert, Modal, Row, Select } from 'ant-design-vue'
import charts from '@/components/charts'

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
  components: {
    'a-alert': Alert,
    'a-modal': Modal,
    'a-row': Row,
    'a-select': Select,
    'a-select-option': Select.Option,
    'vue-good-wizard': GoodWizard
  },

  data () {
    return {
      modalVisible: false,
      columnsError: null,
      selectedChartType: null,
      columns: [],
      chartColumns: [],
      steps,
      chartTypes: [],
      chart: null
    }
  },

  computed: {
    columnsOptions () {
      return this.columns.map(column => {
        return {
          label: column.title,
          value: column.dataIndex
        }
      })
    }
  },

  created () {
    for (let [key, chart] of Object.entries(charts)) {
      const name = chart.methods.getName()
      const value = chart.methods.getValue()
      const instruction = chart.methods.getInstruction()
      this.chartTypes.push({
        value: value,
        title: name,
        instruction: instruction
      })
    }
  },

  methods: {
    showModal () {
      this.chartColumns = []
      this.modalVisible = true
    },

    handleChartChange (value) {
      this.selectedChartType = this.chartTypes.find(item => item.value == value)
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
            selectedColumns = selectedColumns.map(column => column.dataIndex)
            let conf = {
              selectedColumns
            }
            this.$emit('onSave', chartType, conf)
          }
        } else {
          this.columnsError = 'Debes seleccionar alguna columna'
          return false
        }
      }
      this.modalVisible = false
      this.selectedChartType = null
      this.$refs['my-wizard'].goTo(0)
    },

    backClicked (currentPage) {
      return true
    }
  }
}
</script>