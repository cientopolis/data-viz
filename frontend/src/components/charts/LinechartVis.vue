<template>
  <div>
    <a-button
      style="margin-left: 5px; margin-top: 50px; float: left;"
      type="primary"
      @click="removeChart()"
    >Eliminar Grafico</a-button>
    <div ref="chart" />
  </div>
</template>
<script>
import * as d3 from "d3";
import moment from "moment";
import rendering from "@/utils/rendering";
import types from "@/utils/types";
import { Button } from "ant-design-vue";

const utils = { ...rendering, ...types };

export default {
  props: {
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
    "a-button": Button
  },

  computed: {
    backend() {
      return this.niceTable.getBackend();
    },

    columns() {
      return this.niceTable ? this.niceTable.getVisibleColumns() : [];
    },

    rows() {
      let niceTableRows = this.niceTable.getRows();
      let selectedRows = this.conf.selectedRows;
      return niceTableRows.filter(
        row => selectedRows.indexOf(niceTableRows.indexOf(row)) >= 0
      );
    }
  },

  mounted() {
    let data = this.transformData();
    this.draw(data);
  },

  methods: {
    getForm() {
      const instruction = "Selecciona un eje x y un eje y";
      const name = "Gráfico de línea";
      let fields = [];
      fields.push({
        name: "Eje x",
        type: [utils.date, utils.number, utils.text, utils.lat, utils.lng],
        model: "ejex",
        required: true,
        max: 1
      });
      fields.push({
        name: "Eje y",
        type: [utils.number, utils.text, utils.lat, utils.lng],
        model: "ejey",
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

    draw(data) {
      // set the dimensios and margins of the graph
      let margin = { top: 10, right: 30, bottom: 100, left: 100 },
        width = 600 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

      // append the svg object to the body of the page
      var svg = d3
        .select(this.$refs.chart)
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      let xType = this.columns.find(
        column => column.dataIndex == this.conf.ejex
      ).type;
      let yType = this.columns.find(
        column => column.dataIndex == this.conf.ejey
      ).type;

      let xValues = data.map(element => element.x);
      let yValues = data.map(element => element.y);
      let x, y;

      data = this._.sortBy(data, ["x", "y"]);
      if (xType === utils.number) {
        data = data.filter(x => x.x !== "");
        let domainXTo = Math.max(...xValues);
        x = d3.scale
          .linear()
          .domain([domainXTo, 0])
          .range([height, 0]);
        svg
          .append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(
            d3.svg
              .axis()
              .scale(x)
              .orient("bottom")
          );
      } else if (xType === utils.date) {
        let format = this.columns.find(
          column => column.dataIndex == this.conf.ejex
        ).format;
        data = data
          .map(element => {
            return {
              x: moment(element.x, format),
              y: element.y
            };
          })
          .filter(element => String(element.x._d) !== "Invalid Date")
          .map(element => {
            return {
              x: element.x._d,
              y: element.y
            };
          });
        data = this._.sortBy(data, ["x"]);
        let dates = data.map(element => element.x)
        let datesDomain = [dates[0], dates[dates.length-1]]
        x = d3.time
          .scale()
          .domain(datesDomain)
          .range([0, width]);
        svg
          .append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(
            d3.svg
              .axis()
              .scale(x)
              .orient("bottom")
          )
          .selectAll("text")
          .attr("y", 0)
          .attr("x", 9)
          .attr("dy", "-0.2em")
          .attr("transform", "rotate(90)")
          .style("text-anchor", "start");
      } else {
        // Add X axis
        // data.sort((a, b) => a.x < b.x ? -1 : 1)
        xValues = data.map(element => element.x);
        x = d3.scale
          .ordinal()
          .domain(xValues)
          .rangePoints([0, width]);
        svg
          .append("g")
          .attr("transform", "translate(0," + height + ")")
          .call(
            d3.svg
              .axis()
              .scale(x)
              .orient("bottom")
          )
          .selectAll("text")
          .attr("y", 0)
          .attr("x", 9)
          .attr("dy", "-0.2em")
          .attr("transform", "rotate(90)")
          .style("text-anchor", "start");
      }

      if (yType === utils.number) {
        // Add Y axis
        data = data.filter(y => y.y !== "");
        let domainYTo = Math.max(...yValues);
        y = d3.scale
          .linear()
          .domain([0, domainYTo])
          .range([height, 0]);
        svg.append("g").call(
          d3.svg
            .axis()
            .scale(y)
            .orient("left")
        );
      } else {
        // Add Y axis
        y = d3.scale
          .ordinal()
          .domain(yValues)
          .rangePoints([height, 0]);
        svg.append("g").call(
          d3.svg
            .axis()
            .scale(y)
            .orient("left")
        );
      }

      // Add the line
      svg
        .append("path")
        .datum(data)
        .attr("fill", "none")
        .attr("stroke", "steelblue")
        .attr("stroke-width", 1.5)
        .attr(
          "d",
          d3.svg
            .line()
            .x(function(d) {
              return x(d.x);
            })
            .y(function(d) {
              return y(d.y);
            })
        );
    },

    // Processing data
    transformData() {
      let chartData = [];
      let xType = this.columns.find(
        column => column.dataIndex == this.conf.ejex
      ).type;
      let yType = this.columns.find(
        column => column.dataIndex == this.conf.ejey
      ).type;
      this.rows.forEach(row => {
        let xValue = row[this.conf.ejex];
        let yValue = row[this.conf.ejey];
        // check eje x
        if (
          (xType === utils.number && utils.isNumeric(xValue)) ||
          xType !== utils.number
        ) {
          // check eje y
          if (
            (yType === utils.number && utils.isNumeric(yValue)) ||
            yType !== utils.number
          ) {
            let chartElement = {
              x: xValue,
              y: yValue
            };
            chartData.push(chartElement);
          }
        }
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