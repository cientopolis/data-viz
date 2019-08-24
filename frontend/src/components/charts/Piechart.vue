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
        const url = `http://${document.domain}:8000/delete_chart/${this.id}`
        axios.delete(url).then(response =>{
          console.log(response)
        })
      }
      // destroy the vue listeners, etc
      this.$destroy()
      // remove the element from the DOM
      this.$el.parentNode.removeChild(this.$el)
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