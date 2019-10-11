<template>
  <div style="margin: 50px; 0;">
    <a-row>
      <a-col :span="8" :offset="1">
        <a-row>
          <a-button
            style="float: left; margin-bottom: 50px"
            type="primary"
            @click="removeChart()"
          >Eliminar Grafico</a-button>
        </a-row>
        <a-row
          v-for="(element, index) in sortedData"
          :key="index"
          style="text-align: left; margin: 5px 0; font-weight: 700; font-size: 12px;"
        >
          <a-col :span="2" class="dot" :style="`background-color: ${element.color}`"></a-col>
          <a-col :span="20" :offset="1">
            <p>{{element.legend}}: {{element.value}}</p>
          </a-col>
        </a-row>
      </a-col>
      <a-col :span="15">
        <div ref="chart">
          <h3 style="margin-top: 15px; font-weight: bold;">{{ this.conf.field }}</h3>
        </div>
      </a-col>
    </a-row>
  </div>
</template>
<script>
import * as d3 from "d3";
import rendering from "@/utils/rendering";
import types from "@/utils/types";
import { Row, Col, Button } from "ant-design-vue";

const utils = { ...rendering, ...types };

export default {
  props: {
    id: {
      type: Number,
      default: function() {
        return 0;
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
    "a-row": Row,
    "a-col": Col,
    "a-button": Button
  },

  computed: {
    backend() {
      return this.niceTable.getBackend();
    },

    columns() {
      return this.niceTable.getVisibleColumns();
    },

    rows() {
      let niceTableRows = this.niceTable.getRows();
      let selectedRows = this.conf.selectedRows;
      return niceTableRows.filter(
        row => selectedRows.indexOf(niceTableRows.indexOf(row)) >= 0
      );
    },

    sortedData() {
      return this._.orderBy(this.data, ["value"], ["desc"]);
    }
  },

  data() {
    return {
      data: null
    };
  },

  mounted() {
    this.data = this.transformData();
    this.draw();
  },

  methods: {
    draw() {
      var data = this.data;
      var margin = { top: 10, right: 10, bottom: 100, left: 60 };
      var width = 800 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

      var x = d3.scale.ordinal().rangeRoundBands([0, width], 1);

      var x2 = d3.scale.ordinal().rangeRoundBands([0, width], 0);

      var y = d3.scale.linear().range([height, 0]);

      var xAxis = d3.svg
        .axis()
        .scale(x)
        .orient("bottom");

      var yAxis = d3.svg
        .axis()
        .scale(y)
        .orient("left");

      var color = d3.scale.category10();

      data.forEach(function(d) {
        d["value"] = +d["value"];
      });

      var svg = d3
        .select(this.$refs.chart)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      x.domain(
        data.map(function(d) {
          return d["legend"];
        })
      );
      y.domain([
        0,
        d3.max(data, function(d) {
          return d["value"];
        })
      ]);
      x2.domain(
        data.map(function(d) {
          return d["legend"];
        })
      );

      svg
        .append("g")
        .attr("class", "axis axis--x")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 9)
        .attr("dy", "-0.2em")
        .attr("transform", "rotate(90)")
        .style("text-anchor", "start");

      svg
        .append("g")
        .attr("class", "axis axis--y")
        .call(yAxis)
        .append("text")
        //.attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0em")
        .attr("text-anchor", "end");

      var bars = svg.append("g").attr("class", "bars");

      bars
        .selectAll(".bar")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "bar")
        .attr("x", function(d) {
          return x(d["legend"]);
        })
        .attr("y", function(d) {
          return y(d["value"]);
        })
        .attr("width", 10)
        .attr("height", function(d) {
          return height - y(d["value"]);
        })
        .style("fill", function(d) {
          return d["color"];
        });

      var sum = d3.sum(data, function(d) {
        return d["value"];
      });
      var average = sum / data.length;

      var line = d3.svg
        .line()
        .x(function(d, i) {
          return x2(d["legend"]) + i;
        })
        .y(function(d, i) {
          return y(average);
        });

      svg
        .append("path")
        .datum(data)
        .attr("class", "mean")
        .attr("d", line);
    },

    getForm() {
      const instruction = "Selecciona un campo";
      const name = "Gráfico de barras";
      let fields = [];
      fields.push({
        name: "",
        type: [],
        model: "field",
        required: true,
        max: 1
      });
      let form = {
        instruction,
        fields,
        name
      };
      return form;
    },

    // Processing data
    transformData() {
      let chartData = [];
      let allColors = utils.colors;
      let selectedColumn = this.columns.find(
        column => column.dataIndex == this.conf.field
      );
      let color;
      this.rows.forEach(row => {
        if (selectedColumn.type == utils.number) {
          color =
            allColors.length >= 1
              ? allColors.pop()
              : utils.generateRandomColor();
          let value = parseFloat(row[this.conf.field]);
          let element = {
            legend: row[this.conf.field],
            value: !isNaN(value) ? value : 0,
            color
          };
          chartData.push(element);
        } else {
          let columnValue =
            chartData.length > 0
              ? chartData.find(e => e.legend == row[this.conf.field])
              : null;
          if (!columnValue) {
            color =
              allColors.length >= 1
                ? allColors.pop()
                : utils.generateRandomColor();
            let element = {
              legend: row[this.conf.field],
              value: 1,
              color
            };
            chartData.push(element);
          } else {
            columnValue.value += 1;
          }
        }
      });
      return chartData;
    },

    removeChart() {
      utils.removeChart(this);
    }
  }
};
</script>
<style scoped>
.axis line,
.axis path {
  fill: none;
  stroke: #000;
  shape-rendering: crispEdges;
}
.axis--x line {
  display: none;
}
.axis--x path {
  display: none;
}
.axis--y path {
  display: none;
}
h1,
h3 {
  text-align: center;
}
.mean {
  stroke-width: 1px;
  stroke: red;
}
.dot {
  height: 25px;
  width: 25px;
  border-radius: 50%;
  display: inline-block;
}
</style>
