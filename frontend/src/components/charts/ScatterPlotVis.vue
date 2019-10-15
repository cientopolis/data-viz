<template>
  <div style="padding-top: 50px;">
    <a-row>
      <a-col :span="8" :offset="1">
        <a-row>
          <a-button style="float: left;" type="primary" @click="removeChart()">Eliminar Grafico</a-button>
        </a-row>
        <a-row>
          <h3 style="font-weight: bold; margin: 10px auto 0 auto; float: left;">Detalles</h3>
          <br />
          <small
            style="text-align: left;float: left; width: 100%;"
          >(Pose el mouse sobre los puntos del grafico para ver los detalles)</small>
        </a-row>
        <a-row ref="metadata" style="text-align: left; margin: 5px 0; font-size: 12px;"></a-row>
      </a-col>
      <a-col :span="15">
        <h3 style="font-weight: bold;">{{ this.conf.ejey }} / {{ this.conf.ejex }}</h3>
        <div ref="chart" />
      </a-col>
    </a-row>
  </div>
</template>

<script>
import * as d3 from "d3";
import types from "@/utils/types";
import rendering from "@/utils/rendering";
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

  mounted() {
    let data = this.transformData();
    this.draw(data);
  },

  methods: {
    draw(data) {
      // set the dimensios and margins of the graph
      let margin = { top: 10, right: 100, bottom: 200, left: 100 },
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

      if (xType == utils.number) {
        // Add Y axis
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
      } else {
        // Add X axis
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
          .style("text-anchor", "end")
          .attr("dx", "-.8em")
          .attr("dy", ".15em")
          .attr("transform", function(d) {
            return "rotate(-90)";
          });
      }

      if (yType == utils.number) {
        // Add Y axis
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

      // Add dots
      let metadatadiv = this.$refs.metadata.$el;
      svg
        .append("g")
        .selectAll("dot")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", function(d) {
          return x(d.x);
        })
        .attr("cy", function(d) {
          return y(d.y);
        })
        .attr("r", 7)
        .style("fill", "#69b3a2")
        .style("opacity", 0.3)
        .style("stroke", "white")
        .on("mouseover", function(d) {
          Object.entries(d.metadata).forEach(([key, value]) => {
            let b = document.createElement("b");
            let t = document.createTextNode(`${key}:`);
            b.appendChild(t);
            let p = document.createElement("p");
            p.appendChild(b);
            t = document.createTextNode(`${value}`);
            p.appendChild(t);
            p.style.marginBottom = "3px";
            metadatadiv.appendChild(p);
          });
        })
        .on("mouseout", function(d) {
          metadatadiv.innerHTML = "";
        });
    },

    getForm() {
      const instruction = "Selecciona un eje x y un eje y";
      const name = "Gráfico de dispersión";
      let fields = [];
      fields.push({
        name: "Eje x",
        type: [],
        model: "ejex",
        required: true,
        max: 1
      });
      // TODO: lets build it only with x axis
      fields.push({
        name: "Eje y",
        type: [utils.number],
        model: "ejey",
        required: false,
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
      this.rows.forEach(row => {
        let xType = this.columns.find(
          column => column.dataIndex == this.conf.ejex
        ).type;
        let yType = this.columns.find(
          column => column.dataIndex == this.conf.ejey
        ).type;
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