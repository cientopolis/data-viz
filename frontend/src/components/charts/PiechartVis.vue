<template>
  <div style="padding-top: 50px;">
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
          style="text-align: left; margin: 5px 0; font-size: 12px;"
        >
          <a-col :span="2" class="dot" :style="`background-color: ${element.color}`"></a-col>
          <a-col :span="20" :offset="1">
            <p><b>{{element.legend}}:</b> {{element.percentage}}</p>
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
import utils from "@/utils/rendering";
import { Row, Col, Button } from "ant-design-vue";

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
    // Rendering
    draw() {
      var dataset = this.data;

      var width = 500;
      var height = 500;
      var radius = 220;

      var total = 0;
      dataset.forEach(element => {
        total += element.value;
      });

      var svg = d3
        .select(this.$refs.chart)
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

      var arc = d3.svg
        .arc()
        .outerRadius(radius)
        .innerRadius(60);

      var pie = d3.layout
        .pie()
        .sort(null)
        .value(function(d) {
          return d.value;
        });

      var g = svg
        .selectAll(".fan")
        .data(pie(dataset))
        .enter()
        .append("g")
        .attr("class", "fan");

      // Define the div for the tooltip
      var div = d3
        .select(this.$refs.chart)
        .append("div")
        .style("position", "absolute")
        .style("text-align", "center")
        .style("width", "auto")
        .style("height", "auto")
        .style("padding", "8px")
        .style("font", "12px sans-serif")
        .style("background-color", "#d1e8e3")
        .style("border", "0px")
        .style("color", "black")
        .style("font-weight", "bold")
        .style("border-radius", "8px")
        .style("pointer-events", "none")
        .style("opacity", 0);

      g.append("path")
        .attr("d", arc)
        .attr("fill", function(d) {
          return d.data.color;
        })
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
    },

    getForm() {
      const instruction = "Selecciona un campo";
      const name = "Gráfico de torta";
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
          let value = parseFloat(row[this.conf.field]);
          color =
            allColors.length >= 1
              ? allColors.pop()
              : utils.generateRandomColor();
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
      let total = chartData.reduce((a, b) => a + b.value, 0);
      chartData = chartData.map(chartItem => {
        let percentage = ((chartItem.value / total) * 100).toPrecision(2);
        return {
          legend: chartItem.legend,
          value: chartItem.value,
          color: chartItem.color,
          percentage: `${percentage}%`
        };
      });
      return chartData;
    },

    // API
    removeChart() {
      utils.removeChart(this);
    }
  }
};
</script>

<style scoped>
.arc text {
  font: 10px sans-serif;
  text-anchor: middle;
}

.arc path {
  stroke: #fff;
}
.dot {
  height: 25px;
  width: 25px;
  border-radius: 50%;
  display: inline-block;
}
</style>