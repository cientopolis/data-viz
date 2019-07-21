<template>
  <div>
    <div ref="container" />
    <a-row type="flex" justify="center">
      <a-col :span="12" id="chart">
      </a-col>
      <a-col :span="3" id="chart-hover">
      </a-col>
    </a-row>
    <!-- <a-row type="flex" justify="start" style="margin-top: 15px;">
      <div>
        <span style="margin-right: 10px; margin-left: 5px">Select a chart</span>
        <a-select style="width: 200px" @change="handleChartChange">
          <a-select-option value="timeline-with-labels">Timeline with Labels</a-select-option>
        </a-select>
        <a-button
          v-if="(currentInstruction && selectedRowKeys.length > 1 && chartColumns.length === 3)"
          style="margin-left: 10px;"
          type="primary"
          @click="createChart"
        >
          Create Chart
        </a-button>
        <a-button
          style="margin-left: 10px;"
          type="primary"
          @click="clearChart"
        >
          Clear Chart
        </a-button>
         <a-alert
          v-if="currentInstruction"
          style="margin-top: 15px; margin-left: 5x;"
          :showIcon="false"
          :message="currentInstruction"
          banner
        />
      </div>
    </a-row> -->
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
        <!-- <a-dropdown>
          <a class="ant-dropdown-link" href="#">
            Selected Columns<a-icon type="down" />
          </a>
          <a-menu slot="overlay" style="padding: 5px; width: 300px;">
            <a-row>
              <a-checkbox-group
                :options="columnsOptions"
                v-model="chartColumns"
              />
            </a-row>
          </a-menu>
        </a-dropdown> -->
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
import TimelineWithLabels from '@/components/TimelineWithLabels'
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

  // watch: {
  //   columns: function (newValue) {
  //     console.log('columns', newValue)
  //     let tableColumns = []
  //     newValue.forEach(element => {
  //       let column = element
  //       if (column['type'] === 'String') {
  //         let field = column['dataIndex']
  //         column['sorter'] = (a, b) => a[field].length - b[field].length
  //         column['scopedSlots'] = {
  //           filterDropdown: 'filterDropdown',
  //           filterIcon: 'filterIcon',
  //           customRender: 'customRender'
  //         }
  //         column['onFilter'] = (value, record) => record[field].toLowerCase().includes(value.toLowerCase())
  //         column['onFilterDropdownVisibleChange'] = (visible) => {
  //           if (visible) {
  //             setTimeout(() => {
  //               this.searchInput.focus()
  //             }, 0)
  //           }
  //         }
  //       }
  //       if (column['type'] === 'Number') {
  //         let field = column['dataIndex']
  //         column['sorter'] = (a, b) => a[field] - b[field]
  //       }
  //       tableColumns.push(column)
  //     })
  //     this.tableColumns = tableColumns
  //     if (tableColumns.length > 0) {
  //       this.showTable = true
  //     } else  {
  //       this.showTable = false
  //     }
  //     this.columnsOptions = newValue.map(column => {
  //       return {
  //         label: column.title,
  //         value: column.dataIndex
  //       }
  //     })
  //     this.columnsChecked = this.columnsOptions.map(column => {
  //       return column.value
  //     })
  //   }
  // },

  data() {
    return {
      tableColumns: [],
      selectedRowKeys: [], // Check here to configure the default column
      columnsOptions: [],
      columnsChecked: [],
      chartColumns: [],
      selectedChart : null,
      currentInstruction: null,
      showTable: false,
      searchText: '',
      searchInput: null
    }
  },

  computed: {
    hasSelected() {
      return this.selectedRowKeys.length > 0
    },
    visibleColumns () {
      let visibleColumns = this.columns.filter(column => this.columnsChecked.indexOf(column.dataIndex) >= 0)
      console.log('visible columns', visibleColumns)
      return visibleColumns
    }
  },

  created () {
    console.log('columns', this.columns)
    this.columnsOptions = this.columns.map(column => {
      return {
        label: column.title,
        value: column.dataIndex
      }
    })
    console.log('columns options', this.columnsOptions)
    this.columnsChecked = this.columnsOptions.map(column => {
      return column.value
    })
    console.log('columns checked', this.columnsChecked)
  },

  methods: {
    onSelectChange (selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys
    },
    index (row) {
      return this.data.indexOf(row)
    },
    handleChartChange (value) {
      // console.log(`selected ${value}`);
      this.selectedChart = value
      if (value === 'timeline-with-labels') {
        this.currentInstruction = 'You have to select a date, a label, and a data field'
      }
    },
    clearChart () {
      var myNode = document.getElementById('chart')
      while (myNode.firstChild) {
        myNode.removeChild(myNode.firstChild)
      }
    },
    createChart () {
      this.clearChart()
      let dateColumn = null
      let labelColumn = null
      let dataColumn = null
      this.chartColumns.forEach(column => {
        const index = this.tableColumns.map(e => e.dataIndex).indexOf(column)
        const col = this.tableColumns[index]
        if (col.type === 'Date') {
          dateColumn = col
        }
        else {
          if (!labelColumn) {
            labelColumn = col
          } else {
            dataColumn = col
          }
        }
      })
      let chartData = []
      let dates = []
      this.selectedRowKeys.forEach(rowIndex => {
        const row = this.data[rowIndex]
        const label = row[labelColumn.dataIndex]
        const date = row[dateColumn.dataIndex]
        const data = row[dataColumn.dataIndex]

        if (date) {

          let chartItem = chartData.find(data => data.label === label)
          if (!chartItem) {
            chartData.push({
              'label': label,
              'times': [
                {
                  'label_label': String(label),
                  'color': randomColor(),
                  'label': String(data),
                  'starting_time': moment(date, "DD/MM/YYYY").valueOf(),
                  'ending_time': moment(date, "DD/MM/YYYY").valueOf()
                }
              ]
            })
          } else {
            chartItem['times'].push(
              {
                'label_label': String(label),
                'color': randomColor(),
                'label': String(data),
                'starting_time': moment(date, "DD/MM/YYYY").valueOf(),
                'ending_time': moment(date, "DD/MM/YYYY").valueOf()
              }
            )
          }

          dates.push(moment(date, "DD/MM/YYYY"))

        }

      })
      let sortedDates = dates.sort((a, b) => a.valueOf() - b.valueOf())
      let ComponentClass = Vue.extend(TimelineWithLabels)
      let chart = new ComponentClass({
        propsData: {
          data: chartData,
          beggining: sortedDates[0],
          ending: sortedDates[sortedDates.length-1],
          selector: '#chart'
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
  }
}
</script>