<template>
  <div>
    <a-button
      style="margin-left: 5px; margin-top: 50px; float: left;"
      type="primary"
      @click="removeChart()"
    >
      Remove Chart
    </a-button>
    <div ref="chart"></div>
  </div>
</template>

<script>
import * as d3 from 'd3'

export default {
  props: {
    data: {
      type: Array,
      required: true
    }
  },

  mounted () {
    this.draw()
  },

  methods: {
    async draw () {
      this.$nextTick()
      var margin = { top: 20, right: 100, bottom: 40, left: 100 }
      var height = 500 - margin.top - margin.bottom
      var width = 960 - margin.left - margin.right
      var svg = d3.select(this.$refs.chart).append("svg")
          .attr("width",width + margin.left + margin.right)
          .attr("height",height + margin.top + margin.bottom)
        .append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
      // setup scales - the domain is specified inside of the function called when we load the data
      var xScale = d3.time.scale().range([0, width])
      var yScale = d3.scale.linear().range([height, 0])
      var color = d3.scale.category10()
      // setup the axes
      var xAxis = d3.svg.axis().scale(xScale).orient("bottom")
      var yAxis = d3.svg.axis().scale(yScale).orient("left")
      // create function to parse dates into date objects
      var parseDate = d3.time.format("%Y-%m-%d").parse
      var formatDate = d3.time.format("%Y-%m-%d")
      var bisectDate = d3.bisector(function(d) { return d.date; }).left
      // set the line attributes
      var line = d3.svg.line()
        .interpolate("basis")
        .x(function(d) { return xScale(d.date); })
        .y(function(d) { return yScale(d.close); })
      var focus = svg.append("g").style("display","none")
      var data = this.data
      var keys = Object.keys(data[0])
      // sort data ascending - needed to get correct bisector results
      data.sort(function(a,b) {
        return a.date - b.date
      });
      // color domain
      color.domain(d3.keys(data[0]).filter(function(key) { return key !== "date" }))
      // create stocks array with object for each company containing all data
      var stocks = color.domain().map(function(name) {
        return {
          name: name,
          values: data.map(function(d){
            return { date: d.date, close: d[name] };
          })
        };
      })

      // add domain ranges to the x and y scales
      xScale.domain([
        d3.min(stocks, function(c) { return d3.min(c.values, function(v) { return v.date; }); }),
        d3.max(stocks, function(c) { return d3.max(c.values, function(v) { return v.date; }); })
      ])
      yScale.domain([
        0,
        // d3.min(stocks, function(c) { return d3.min(c.values, function(v) { return v.close; }); }),
        d3.max(stocks, function(c) { return d3.max(c.values, function(v) { return v.close; }); })
      ])

      // Legends
      var legend = svg.selectAll('g')
        .data(keys)
        .enter()
        .append('g')
        .attr('class', 'legend');

      legend.append('rect')
        .attr('x', width + 20)
        .attr('y', function(d, i) {
          return i * 20;
        })
        .attr('width', 10)
        .attr('height', 10)
        .style('fill', function(d) {
          return color(d);
        });

      legend.append('text')
        .attr('x', width + 30)
        .attr('y', function(d, i) {
          return (i * 20) + 9;
        })
        .text(function(d) {
          return d;
        })
        .on("mouseover",function(d,i) {
          console.log('d', d)
          console.log('i', i)
          let j
          i = i - 1
          for (j=0; j < 6; j++) {
            if (i !== j) {
              d3.select("#id"+j).style("opacity",0.1);
              d3.select("#text_id"+j).style("opacity",0.2);
            }
          };
        })
        .on("mouseout", function(d,i) {
          console.log('d', d)
          console.log('i', i)
          let j
          for (j=0; j < 6; j++) {
            d3.select("#id"+j).style("opacity",1);
            d3.select("#text_id"+j).style("opacity",1);
          };
        });

      // end legends

      // add the x axis
      svg.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

      // add the y axis
      svg.append("g")
          .attr("class", "y axis")
          .call(yAxis)
        .append("text")
          .attr("transform","rotate(-90)")
          .attr("y",-60)
          .attr("dy",".71em")
          .style("text-anchor","end")
          // .text("Price ($)");

      // add circle at intersection
      focus.append("circle")
        .attr("class","y")
        .attr("fill","none")
        .attr("stroke","black")
        .style("opacity",0.5)
        .attr("r",8);

      // add horizontal line at intersection
      focus.append("line")
        .attr("class","x")
        .attr("stroke","black")
        .attr("stroke-dasharray","3,3")
        .style("opacity",0.5)
        .attr("x1", 0)
        .attr("x2", width);

      // add vertical line at intersection
      focus.append("line")
        .attr("class","y")
        .attr("stroke","black")
        .attr("stroke-dasharray","3,3")
        .style("opacity",0.5)
        .attr("y1", 0)
        .attr("y2", height);

      // append rectangle for capturing if mouse moves within area
      svg.append("rect")
        .attr("width",width)
        .attr("height",height)
        .style("fill","none")
        .style("pointer-events","all")
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", mousemove);
      
      // add the line groups
      var stock = svg.selectAll(".stockXYZ")
          .data(stocks)
        .enter().append("g")
          .attr("class","stockXYZ");

      // add the stock price paths
      stock.append("path")
        .attr("class","line")
        .attr("id",function(d,i){ return "id" + i; })
        .attr("d", function(d) {
          return line(d.values); 
        })
        .style("stroke", function(d) { return color(d.name); });

      let component = this

      // mousemove function
      function mousemove () {
        var x0 = xScale.invert(d3.mouse(this)[0]);
        var i = bisectDate(component.data, x0, 1); // gives index of element which has date higher than x0
        var d0 = component.data[i - 1], d1 = component.data[i];
        var d = x0 - d0.date > d1.date - x0 ? d1 : d0;
        var keys = Object.keys(d).filter(item => item !== 'date')
        var values = keys.map(key => +d[key])
        var close = d3.max(values)

        focus.select("circle.y")
        .attr("transform", "translate(" + xScale(d.date) + "," + yScale(close) + ")");

        focus.select("line.y")
          .attr("y2",height - yScale(close))
          .attr("transform", "translate(" + xScale(d.date) + "," 
            + yScale(close) + ")");

        focus.select("line.x")
        .attr("x2",xScale(d.date))
        .attr("transform", "translate(0," 
          + (yScale(close)) + ")");
      }
    },

    removeChart () {
      // destroy the vue listeners, etc
      this.$destroy()
      // remove the element from the DOM
      this.$el.parentNode.removeChild(this.$el)
    }
  }
}
</script>

<style>
  .line {
    fill: none;
    stroke-width: 1px;
  }

  .axis path {
    stroke: black;
    stroke-width: 1px;
    fill: none;
    shape-rendering: crispEdges;
  }

  .tick line {
    stroke: black;
    stroke-width: 1px;
  }
</style>