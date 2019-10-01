<template>
  <div>
    <a-menu
      v-model="current"
      mode="horizontal"
    >
      <a-menu-item key="original">
        Tabla Original
      </a-menu-item>
      <a-menu-item key="nicetable">
        NiceTable
      </a-menu-item>
    </a-menu>
    <div style="padding: 10px 50px;">
      <h3>Caza Mosquitos</h3>
      <caza-mosquitos-table v-show="current == 'original'"/>
      <div id="nicetable" v-show="current == 'nicetable'"></div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import CazaMosquitosTable from '@/components/examples/CazaMosquitosTable'
import TableVis from '@/components/TableVis'
import { Menu } from 'ant-design-vue'
import * as extractors from '@/extractors'

export default {
  components: {
    'a-menu': Menu,
    'a-menu-item': Menu.Item,
    CazaMosquitosTable
  },

  data () {
    return {
      current: ['original'],
      showNiceTable: false
    }
  },

  mounted () {
    let ComponentClass = Vue.extend(TableVis)
    let tableId = 'cazamosquitos'
    let tableVis = new ComponentClass({
      propsData: {
        niceTableParam: extractors.tableIdExtractor.getTable(tableId)
      }
    })
    tableVis.$mount() // pass nothing
    document.getElementById('nicetable').appendChild(tableVis.$el)
  }
}
</script>