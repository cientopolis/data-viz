<template>
  <div>
    <div ref="container" />
    <a-row type="flex" justify="center">
      <a-col :span="12" id="chart">
      </a-col>
      <a-col :span="3" id="chart-hover">
      </a-col>
    </a-row>
    <a-row>
      <a-button
        style="margin-left: 10px; left: left;"
        type="primary"
        :disabled="selectedRowKeys.length === 0"
        @click="chartModalVisible = true"
      >
        Create Chart
      </a-button>
    </a-row>
    <a-modal
      v-model="chartModalVisible"
      :footer="null"
    >
      <vue-good-wizard
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
              <!-- <a-checkbox-group
                :options="columnsOptions"
                v-model="chartColumns"
              /> -->
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
  </div>
</template>
<script>
import moment from 'moment'
import Vue from 'vue'
import Multiline from '@/components/charts/Multiline'
import { setTimeout } from 'timers';

const colors = [
  '#00FFFF',
  '#0000FF',
  '#000080',
  '#FF00FF',
  '#800080',
  '#00FF00',
  '#FF0000',
  '#000000',
  '#FA8072'
]

const steps = [
  {
    label: 'Select Chart Type',
    slot: 'selectChartType'
  },
  {
    label: 'Select Chart Columns',
    slot: 'selectColumns'
  }
]

const chartTypes = [
  {
    value: 'multilines',
    title: 'Multilines',
    instruction: 'You have to select a date and values',
    minColumns: 2,
    exactColumns: 0,
  }
]

function randomColor () {
  return colors[Math.floor(Math.random() * colors.length)];
}

export default {
  props: {
    columns: {
      type: Array,
      required: true
    },
    data: {
      type: Array,
      required: true
    }
  },

  data() {
    return {
      selectedRowKeys: [], // Check here to configure the default column
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
  },

  methods: {
    onSelectChange (selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },

    index (row) {
      return this.data.indexOf(row)
    },

    handleChartChange (value) {
      this.selectedChartType = this.chartTypes.find(item => item.value = value)
    },

    clearChart () {
      var myNode = document.getElementById('chart')
      while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild)
      }
    },

    createChart () {
      this.clearChart()
      let chartData = []
      this.selectedRowKeys.forEach(rowIndex => {
        const row = this.data[rowIndex]
        let chartItem = {}
        this.chartColumns.forEach(index => {
          // const index = this.columns.map(e => e.dataIndex).indexOf(column)
          const col = this.columns[index]
          if (col.type === 'Date') {
            chartItem['date'] = moment(row[col.dataIndex], "DD/MM/YYYY")
          } else {
            chartItem[col.dataIndex] = +row[col.dataIndex]
          }
          chartData.push(chartItem)
        })
      })
      let ComponentClass = Vue.extend(Multiline)
      let chart = new ComponentClass({
        propsData: {
          data: chartData,
        }
      })
      chart.$mount() // pass nothing
      this.$refs.container.appendChild(chart.$el)
      var container = this.$el.querySelector("#chart")
      container.scrollTop = container.scrollHeight
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
        if ((this.selectedChartType.exactColumns === 0) || (this.selectedChart.exactColumns === this.chartColumns.length)) {
          // no exact columns needed or exact columns same as selected
          this.createChart()
          this.chartModalVisible = false
        } else {
          this.columnsError = `Must be selected ${this.selectedChartType.columns.length} columns`
        }
      }
      return false
    },

    backClicked (currentPage) {
      return true
    }
  }
}
</script>