<template>
  <!-- create chart modal -->
  <a-modal
    v-model="modalVisible"
    @cancel="handleCancel"
    :footer="null"
  >
    <vue-good-wizard
      ref="my-wizard"
      :steps="steps"
      :onNext="nextClicked"
      :onBack="backClicked"
    >
      <div slot="selectChartType" style="margin-top: 20px;">
        <span style="margin-right: 10px; margin-left: 5px;">Selecciona un tipo de gráfico</span>
        <a-select
          v-if="selectedChartType"
          :defaultValue="selectedChartType.value"
          style="width: 200px"
          @change="handleChartChange"
        >
          <a-select-option
            v-for="(chartType, index) in chartTypes"
            :key="index"
            :value="chartType.value"
          >
            {{chartType.title}}
          </a-select-option>
        </a-select>
        <a-select
          v-else
          style="width: 200px"
          @change="handleChartChange"
        >
          <a-select-option
            v-for="(chartType, index) in chartTypes"
            :key="index"
            :value="chartType.value"
          >
            {{chartType.title}}
          </a-select-option>
        </a-select>
        <a-alert
          v-if="columnsError"
          :message="columnsError"
          type="error"
          banner
        />
      </div>
      <div slot="selectColumns">
        <div v-if="selectedChartType">
          <span 
            style="margin: 10px;"
          >
            Selecciona las columnas para tu gráfico.
          </span>
          <a-alert style="margin-bottom: 10px;" :message="selectedChartType.instruction" banner />
          <a-row>
            <div
              v-for="(field, index) in selectedChartType.fields"
              :key="index"
            >
              <span>{{field.name}}</span>
              <a-select
                v-if="field.max == 1"
                v-model="form[field.model]"
                style="width: 100%;"
              >
                <a-select-option
                  v-for="(column, index) in columnsOptions"
                  :key="index"
                >
                  {{column.label}}
                </a-select-option>
              </a-select>
              <a-select
                v-else
                mode="multiple"
                style="width: 100%;"
                placeholder="Please select"
                v-model="form[field.model]"
              >
                <a-select-option
                  v-for="(column, index) in columnsOptions"
                  :key="index">
                  {{column.label}}
                </a-select-option>
              </a-select>
            </div>
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
      niceTable: null,
      steps,
      chartTypes: [],
      chart: null,
      form: {}
    }
  },

  computed: {
    columns () {
      return this.niceTable ? this.niceTable.getVisibleColumns() : []
    },

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
      const form = chart.methods.getForm()
      this.chartTypes.push({
        value: key,
        title: form.name,
        instruction: form.instruction,
        fields: form.fields
      })
    }
  },

  methods: {
    showModal () {
      this.modalVisible = true
    },

    handleChartChange (value) {
      this.selectedChartType = this.chartTypes.find(item => item.value == value)
      this.form = {}
    },

    nextClicked (currentPage) {
      this.columnsError = null
      if (currentPage === 0) {
        if (this.selectedChartType !== null) {
          return true
        } else {
          this.columnsError = 'Debes seleccionar un tipo de gráfico'
          return false
        }
      }
      if (currentPage === this.steps.length - 1) {
        const chartType = this.selectedChartType.value
        let selectedComponent = charts[chartType]
        // first validate
        let { isValid, message } = this.validateForm()
        if (isValid === false) {
          this.columnsError = message
          return false
        } else {
          // map columns index with data index to relate with rows
          let conf = {}
          for (let i = 0; i < this.selectedChartType.fields.length; i++) {
            const field = this.selectedChartType.fields[i]
            if (field.max == 1) {
              if (this.form[field.model] !== undefined) {
                let selectedColumn = this.columns[this.form[field.model]]
                conf[field.model] = selectedColumn.dataIndex
              } else {
                conf[field.model] = null
              }
            } else {
              conf[field.model] = []
              if (this.form[field.model]) {
                let selectedColumns = this.columns.filter(column => this.form[field.model].indexOf(this.columns.indexOf(column)) >= 0)
                for (let i = 0; i < selectedColumns.length; i++) {
                  const column = selectedColumns[i]
                  conf[field.model].push(column.dataIndex)
                }
              }
            }
          }
          this.modalVisible = false
          this.resetModal()
          this.$emit('onSave', chartType, conf)
        }
      }
    },

    validateForm () {
      let isValid
      let message = ''
      for (let i = 0; i < this.selectedChartType.fields.length; i++) {
        const field = this.selectedChartType.fields[i]
        if (field.max == 1) {
          let selectedColumn = this.columns[this.form[field.model]]
          if ((field.required == true) && (selectedColumn == undefined)) {
            isValid = false
            message = `El campo ${field.name} es requerido`
            break
          }
          if ((selectedColumn) && (field.type.length > 0) && (field.type.indexOf(selectedColumn.type) < 0)) {
            isValid = false
            message = `El campo ${field.name} debe ser de tipo ${field.type}`
            break
          }
        } else {
          if ((field.required == true) && ((this.form[field.model] == undefined) || (this.form[field.model].length == 0))) {
            isValid = false
            message = `El campo ${field.name} es requerido`
            break
          }
          if (this.form[field.model] !== undefined) {
            let selectedColumns = this.columns.filter(column => this.form[field.model].indexOf(this.columns.indexOf(column)) >= 0)
            if (field.type.length > 0) {
              for (let i = 0; i < selectedColumns.length; i++) {
                const column = selectedColumns[i];
                if (field.type.indexOf(column.type) < 0) {
                  isValid = false
                  message = `El campo ${field.name} debe ser de tipo ${field.type}`.replace(/\,/g,' o ')
                  break
                }
              }
            }
          }
        }
      }
      return { isValid, message }
    },

    resetModal () {
      this.form = {}
      this.selectedChartType = null
      this.columnsError = null
      this.$refs['my-wizard'].goTo(0)
    },

    backClicked (currentPage) {
      return true
    },

    handleCancel () {
      this.resetModal()
    }
  }
}
</script>