<template>
  <div>
    <a-button
      style="margin-left: 5px; margin-top: 50px; float: left;"
      type="primary"
      @click="removeChart()"
    >
      Remove Chart
    </a-button>
    <div ref="chart" />
  </div>
</template>

<script>
import * as d3 from 'd3'
import axios from 'axios'
import utils from '@/components/utils'

export default {
  props: {
    id: {
      type: Number
    },
    data: {
      type: Array,
      required: true
    },
    backend: {
      type: Boolean,
      required: true
    }
  },

  mounted () {
    this.draw()
  },

  methods: {
    draw () {
      var dataset = this.data

      var width = 960;
      var height = 500;
      var radius = 200;

      var svg = d3.select(this.$refs.chart).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      var arc = d3.svg.arc()
          .outerRadius(radius)
          .innerRadius(30);

      var pie = d3.layout.pie()
          .sort(null)
          .value(function(d){ return d.value; });

      var g = svg.selectAll(".fan")
          .data(pie(dataset))
          .enter()
          .append("g")
          .attr("class", "fan")

      g.append("path")
        .attr("d", arc)
        .attr("fill", function(d){ return d.data.color; })
      
      g.append("text")
        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")"; })
        .style("text-anchor", "middle")
        .text(function(d) { return d.data.legend; });
    },

    removeChart () {
      if (this.backend) {
        // remove from backend
        const url = `https://${document.domain}:8000/delete_chart/${this.id}`
        axios.delete(url).then(response =>{
          console.log(response)
        })
      }
      // destroy the vue listeners, etc
      this.$destroy()
      // remove the element from the DOM
      this.$el.parentNode.removeChild(this.$el)
    },

    // Processing info
    validateColumns (columns) {
      // Validate selected data
      let message = ''
      let isValid = true
      let numberColumns = columns.filter(column => column.type === 'Number')
      if (numberColumns.length !== columns.length) {
        message = 'Todas las columnas deben ser de tipo numerico'
        isValid = false
      }
      return { isValid, message }
    },

    transformData (columns, rows) {
      // process data
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
      // end process data
      return chartData
    }
  }
}
</script>

<style scoped>
.arc text {
  font: 10px sans-serif;
  text-anchor: middle;
}

.arc path {
  stroke: #fff;
}
</style>