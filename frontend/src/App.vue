<template>
  <div
    id="app"
    style="padding: 0 50px;"
    ref="container"
  >
    <example1 />
  </div>
</template>

<script>
import Vue from 'vue'
import Example1 from '@/components/Example1'
import TableVis from '@/components/TableVis'
import { tableIdExporter } from '@/exporters'

export default {
  name: 'app',
  components: {
    Example1
  },
  mounted () {
    let ComponentClass = Vue.extend(TableVis)
    let tableVis = new ComponentClass({
      propsData: {
        niceTableParam: tableIdExporter.getTable('appear')
      }
    })
    tableVis.$mount() // pass nothing
    this.$refs.container.appendChild(tableVis.$el)
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
