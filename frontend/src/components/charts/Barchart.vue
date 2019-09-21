<template>
  <div>
     <a-button
      style="margin-left: 5px; margin-top: 50px; float: left;"
      type="primary"
      @click="removeChart()"
    >
      Eliminar Grafico
    </a-button>
    <div ref="chart" />
  </div>
</template>
<script>
import * as d3 from 'd3'
import utils from '@/components/utils'
import { Button } from 'ant-design-vue'

export default {
  props: {
    id: {
      type: Number,
      default: function () {
        return 0
      }
    },
    niceTable: {
      type: Object,
      required: true
    },
    conf: {
      type: Object,
      required: true
    }
  },

  data () {
    return {
      data: null
    }
  },

  components: {
    'a-button': Button
  },

  computed: {

    backend () {
      return this.niceTable.getBackend()
    },

    columns () {
      let niceTableColumns = this.niceTable.getColumns().filter(column => column.visible == true)
      let selectedColumns = this.conf.selectedColumns
      return niceTableColumns.filter(column => selectedColumns.indexOf(column.dataIndex) >= 0)
    },

    rows () {
      let niceTableRows = this.niceTable.getRows()
      let selectedRows = this.conf.selectedRows
      return niceTableRows.filter(row => selectedRows.indexOf(niceTableRows.indexOf(row)) >= 0)
    }
  },

  mounted () {
    this.data = this.transformData(this.columns, this.rows)
    this.draw()
  },

  methods: {
    draw () {
      var margin = {top: 10, right: 10, bottom: 100, left: 60}
      var width = 800 - margin.left - margin.right,
          height = 600 - margin.top - margin.bottom

      var x = d3.scale.ordinal()
          .rangeRoundBands([0,width],1)

      var x2 = d3.scale.ordinal()
          .rangeRoundBands([0,width],0)

      var y = d3.scale.linear()
          .range([height,0]);

      var xAxis = d3.svg.axis()
          .scale(x)
          .orient("bottom")

      var yAxis = d3.svg.axis()
          .scale(y)
          .orient("left")

      var color = d3.scale.category10()

      var tooltip = d3.select("body").append("div")
              .attr("class", "tooltip")
              .style("opacity", 0)

      var data = this.data

      data.forEach(function(d) {
          d['value'] = +d['value']
      })

      var svg = d3.select(this.$refs.chart).append("svg")
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom)
          .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

      x.domain(data.map(function(d) { return d['legend']; }))
      y.domain([0, d3.max(data, function(d) { return d['value']; })])
      x2.domain(data.map(function(d) { return d['legend']; }))

      svg.append("g")
          .attr("class", "axis axis--x")
          .attr("transform", "translate(0," + height + ")")
          .call(xAxis)
          .selectAll("text")
          .attr("y", 0)
          .attr("x", 9)
          .attr("dy", "-0.2em")
          .attr("transform", "rotate(90)")
          .style("text-anchor", "start");

      svg.append("g")
          .attr("class", "axis axis--y")
          .call(yAxis)
          .append("text")
          //.attr("transform", "rotate(-90)")
          .attr("y", 6)
          .attr("dy", "0em")
          .attr("text-anchor", "end")

      var bars = svg.append("g").attr("class", "bars")

      bars.selectAll(".bar")
          .data(data)
          .enter().append("rect")
          .attr("class", "bar")
          .attr("x", function(d) { return x(d['legend']); })
          .attr("y", function(d) { return y(d['value']); })
          .attr("width", 10)
          .attr("height", function(d) { return height - y(d['value']); })
          .style("fill", "#ccc")
          .on("mouseover", function(d) {
              d3.select(this).style("fill", function(d) { return color(d['legend']); })
              tooltip.text(d['legend'] + " " + d['value'])
              .style("opacity", 0.8)
                      .style("left", (d3.event.pageX)+0 + "px") 
                      .style("top", (d3.event.pageY)-0 + "px");
          })
          .on("mouseout", function(d) {
              tooltip.style("opacity", 0);
              d3.select(this).style("fill", "#ccc");

          })

      var sum = d3.sum(data, function(d) { return d['value']; })
      var average = sum/data.length

      var line = d3.svg.line()
          .x(function(d, i) { return x2(d['legend']) + i; })
          .y(function(d, i) { return y(average); })

      svg.append("path")
          .datum(data)
          .attr("class", "mean")
          .attr("d", line)

      // svg.append("text")
      //     .attr("transform", "translate(" + (width+3) + "," + y(average) + ")")
      //     .attr("dy", "1em")
      //     .attr("text-anchor", "end")
      //     .style("fill", "red")
      //     .html("Average = " + average)
    },

    removeChart () {
      utils.removeChart(this)
    },

    // Processing info
    validateColumns (columns) {
      // Validate selected data
      let message
      let isValid = true
      let numberColumns = columns.filter(column => column.type === 'Number')
      if (numberColumns.length !== columns.length) {
        message = 'Todas las columnas deben ser de tipo numerico'
        isValid = false
      }
      return { isValid, message }
    },

    transformData (columns, rows) {
      // processing data
      let chartData = []
      // selected columns
      columns.forEach(col => {
        let chartItem = {
          legend: col.dataIndex,
          value: 0,
          color: utils.getRandomColor()
        }
        chartData.push(chartItem)
      })
      // selected rows
      rows.forEach(row => {
        chartData.forEach(item => {
          let value = row[item['legend']]
          if (utils.isNumeric(value) && (value!=='')) {
            item['value'] += parseFloat(value)
          }
        })
      })
      // end processing data
      return chartData
    }
  }
}
</script>
<style scoped>
.axis line,
.axis path {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges;
}
.axis--x line{
  display: none;
}
.axis--x path {
    display: none;
}
.axis--y path {
  display: none;
}
h1, h3 {
  text-align: center;
}
div.tooltip {
  position: absolute;
  text-align: left;
  width: auto;
  height: auto;
  padding: 8px;
  font: 12px sans-serif;
  background: black;
  border-radius: 0px;
  pointer-events: none;
  color: white;
}
.mean {
  stroke-width: 1px;
  stroke: red;
}
</style>
