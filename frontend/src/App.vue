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
import Infovis from '@/components/Infovis'
import exporters from '@/exporters'

export default {
  name: 'app',
  components: {
    Example1
  },
  mounted () {
    let exporter = exporters.tableIdExporter
    let table = exporter.getTable('appear')
    let ComponentClass = Vue.extend(Infovis)
    let infovis = new ComponentClass({
      propsData: {
        tableId: 'appear',
        columns: table['columns'],
        data: table['data']
      }
    })
    infovis.$mount() // pass nothing
    this.$refs.container.appendChild(infovis.$el)
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
