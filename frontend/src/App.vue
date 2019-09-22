<template>
  <div
    id="app"
    style="padding: 0 50px;"
    ref="container"
  >
    <html-table />
  </div>
</template>

<script>
import Vue from 'vue'
import HtmlTable from '@/components/HtmlTable'
import TableVis from '@/components/TableVis'
import { tableIdExporter } from '@/exporters'

export default {
  name: 'app',
  components: {
    HtmlTable
  },
  mounted () {
    let ComponentClass = Vue.extend(TableVis)
    let tableId = 'appear'
    let tableVis = new ComponentClass({
      propsData: {
        niceTableParam: tableIdExporter.getTable(htmlTableId)
      }
    })
    tableVis.$mount() // pass nothing
    document.getElementById(htmlTableId).replaceWith(tableVis.$el)
    // this.$refs.container.appendChild(tableVis.$el)
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
