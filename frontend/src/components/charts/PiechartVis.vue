<template>
  <div style="margin: 50px; 0;">
    <a-button
      style="margin-left: 5px; margin-top: 50px; float: left;"
      type="primary"
      @click="removeChart()"
    >
      Eliminar Grafico
    </a-button>
    <h3>{{ this.conf.field }}</h3>
    <div ref="chart" />
  </div>
</template>

<script>
import * as d3 from 'd3'
import utils from '@/utils/rendering'
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

  components: {
    'a-button': Button
  },

  computed: {

    backend () {
      return this.niceTable.getBackend()
    },

    columns () {
      return this.niceTable.getVisibleColumns()
    },

    rows () {
      let niceTableRows = this.niceTable.getRows()
      let selectedRows = this.conf.selectedRows
      return niceTableRows.filter(row => selectedRows.indexOf(niceTableRows.indexOf(row)) >= 0)
    }
  },

  mounted () {
    let data = this.transformData()
    this.draw(data)
  },

  methods: {
    // Rendering
    draw (data) {
      var dataset = data

      var width = 400
      var height = 400
      var radius = 200

      var total = 0
      dataset.forEach(element => {
        total += element.value
      })

      var svg = d3.select(this.$refs.chart).append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")

      var arc = d3.svg.arc()
          .outerRadius(radius)
          .innerRadius(60)

      var pie = d3.layout.pie()
          .sort(null)
          .value(function(d){ return d.value })

      var g = svg.selectAll(".fan")
          .data(pie(dataset))
          .enter()
          .append("g")
          .attr("class", "fan")

      // Define the div for the tooltip
      var div = d3.select("body")
        .append("div")
        .style("position", "absolute")
        .style("text-align", "center")
        .style("width", "80px")
        .style("height", "30px")
        .style("padding", "8px")
        .style("font", "12px sans-serif")
        .style("background-color", "#d1e8e3")
        .style("border", "0px")
        .style("color", "black")
        .style("font-weight", "bold")
        .style("border-radius", "8px")
        .style("pointer-events", "none")
        .style("opacity", 0)

      g.append("path")
        .attr("d", arc)
        .attr("fill", function(d){ return d.data.color })
        .on("mouseover", function(d) {
          div
            .transition()
            .duration(200)
            .style("opacity", 0.9);
          div
            .html(`${d.data.legend}`)
            .style("left", d3.event.pageX + "px")
            .style("top", d3.event.pageY - 28 + "px");
        })
        .on("mouseout", function(d) {
          div
            .transition()
            .duration(500)
            .style("opacity", 0);
        });
      
      g.append("text")
        .attr("transform", function(d) { return "translate(" + arc.centroid(d) + ")" })
        .style("text-anchor", "middle")
        .text(function(d) { return `${(d.value / total)*100}%` })

    },

    getForm () {
      const instruction = 'Selecciona un campo'
      const name = 'Gráfico de torta'
      let fields = []
      fields.push({
        name: '',
        type: [],
        model: 'field',
        required: true,
        max: 1
      })
      let form = {
        instruction,
        fields,
        name
      }
      return form
    },

    // Processing data
    transformData () {
      let chartData = []
      let selectedColumn = this.columns.find(column => column.dataIndex == this.conf.field)
      this.rows.forEach(row => {
        if (selectedColumn.type == utils.number) {
          let value = parseFloat(row[this.conf.field])
          let element = {
            legend: row[this.conf.field],
            value: !isNaN(value) ? value : 0,
            color: utils.getRandomColor()
          }
          chartData.push(element)
        } else {
          let columnValue = chartData.length > 0 ? chartData.find(e => e.legend == row[this.conf.field]) : null
          if (!columnValue) {
            let element = {
              legend: row[this.conf.field],
              value: 1,
              color: utils.getRandomColor()
            }
            chartData.push(element)
          } else {
            columnValue.value += 1
          }
        }
      })
      return chartData
    },

    // API
    removeChart () {
      utils.removeChart(this)
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