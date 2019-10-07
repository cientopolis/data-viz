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
      <div id="cazamosquitoscharts"></div>
    </div>
  </div>
</template>

<script>
import CazaMosquitosTable from '@/components/examples/CazaMosquitosTable'
import { Menu } from 'ant-design-vue'
import * as tablevis from '@/index'

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
    let extractors = tablevis.default.extractors
    const conf = {
      extractor: extractors.tableIdExtractor.getTable('cazamosquitos'),
      newTableInDiv: document.getElementById('nicetable'),
      tableInsertMethod: 'insertBefore',
      chartsDiv: document.getElementById('cazamosquitoscharts'),
      persistence: false
    }
    tablevis.default.transformTable(conf)
  }
}
</script>