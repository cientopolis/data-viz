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

    rows () {
      let niceTableRows = this.niceTable.getRows()
      let selectedRows = this.conf.selectedRows
      return niceTableRows.filter(row => selectedRows.indexOf(niceTableRows.indexOf(row)) >= 0)
    }
  },

  mounted () {
    this.data = this.transformData()
    this.draw()
  },

  methods: {
    // Rendering
    draw () {
      var dataset = this.data

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

      g.append("path")
        .attr("d", arc)
        .attr("fill", function(d){ return d.data.color })
        .on("mouseover", function(d, i) {
            svg.append("text")
              .attr("dy", ".5em")
              .style("text-anchor", "middle")
              .style("font-size", 25)
              .attr("class","label")
              .style("fill", function(d,i){return "black"})
              .text(d.data.legend)
            
        })
        .on("mouseout", function(d) {
          svg.select(".label").remove()
        })
      
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
      this.rows.forEach(row => {
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