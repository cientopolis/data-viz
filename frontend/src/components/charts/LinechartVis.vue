<template>
  <div style="padding-top: 50px;">
    <a-row>
      <a-col :span="8" :offset="1">
        <a-row>
          <a-button style="float: left;" type="primary" @click="removeChart()">Eliminar Grafico</a-button>
        </a-row>
        <h3 style="font-weight: bold; margin-bottom: 0;">Detalles</h3>
        <small>(Pose el mouse sobre los puntos del grafico para ver los detalles)</small>
        <a-row ref="metadata" style="text-align: left; margin: 5px 0; font-size: 12px;"></a-row>
      </a-col>
      <a-col :span="15">
        <h3 style="margin-top: 15px; font-weight: bold;">{{ this.conf.ejey }} / {{ this.conf.ejex }}</h3>
        <div ref="chart" width="800" height="600" />
      </a-col>
    </a-row>
  </div>
</template>
<script>
import * as d3 from "d3";
import moment from "moment";
import rendering from "@/utils/rendering";
import types from "@/utils/types";
import { Row, Col, Button } from "ant-design-vue";

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
    "a-row": Row,
    "a-col": Col,
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

  data() {
    return {
      hoverData: null
    };
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
      // TODO: lets build it only with x axis
      fields.push({
        name: "Eje y",
        type: [utils.number],
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
      let margin = { top: 10, right: 30, bottom: 200, left: 200 },
        width = 800 - margin.left - margin.right,
        height = 600 - margin.top - margin.bottom;

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

      data = this._.sortBy(data, ["x", "y"], ["asc", "asc"]);

      if (xType === utils.number) {
        data = data.filter(x => x.x !== "");
        data = data.map(element => {
          return {
            x: parseFloat(element.x),
            y: element.y
          };
        });
        data = this._.sortBy(data, ["x", "y"], ["asc", "asc"]);
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
        let dates = data.map(element => element.x);
        let datesDomain = [dates[0], dates[dates.length - 1]];
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

      // Add the scatterplot
      let metadatadiv = this.$refs.metadata.$el;
      svg
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("r", 3.5)
        .attr("cx", function(d) {
          return x(d.x);
        })
        .attr("cy", function(d) {
          return y(d.y);
        })
        .on("mouseover", function(d) {
          Object.entries(d.metadata).forEach(([key, value]) => {
            console.log(key + " " + value);
            let b = document.createElement("b");
            let t = document.createTextNode(`${key}:`);
            b.appendChild(t);
            let p = document.createElement("p");
            p.appendChild(b);
            t = document.createTextNode(`${value}`);
            p.appendChild(t);
            p.style.marginBottom = "3px";
            console.log("p", p);
            metadatadiv.appendChild(p);
          });
        })
        .on("mouseout", function(d) {
          metadatadiv.innerHTML = "";
        });
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
              y: yValue,
              metadata: row
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