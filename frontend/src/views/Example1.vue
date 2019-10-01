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
    <div style="padding: 50px;">
      <html-table-1 v-show="current == 'original'"/>
      <div id="nicetable1" v-show="current == 'nicetable'"></div>
    </div>
  </div>
</template>

<script>
import Vue from 'vue'
import HtmlTable1 from '@/components/examples/HtmlTable1'
import TableVis from '@/components/TableVis'
import { Menu } from 'ant-design-vue'
import * as extractors from '@/extractors'

export default {
  components: {
    'a-menu': Menu,
    'a-menu-item': Menu.Item,
    HtmlTable1
  },

  data () {
    return {
      current: ['original'],
      showNiceTable: false
    }
  },

  mounted () {
    let ComponentClass = Vue.extend(TableVis)
    let tableId = 'appear'
    let tableVis = new ComponentClass({
      propsData: {
        niceTableParam: extractors.tableIdExtractor.getTable(tableId)
      }
    })
    tableVis.$mount() // pass nothing
    document.getElementById('nicetable1').appendChild(tableVis.$el)
  }
}
</script>