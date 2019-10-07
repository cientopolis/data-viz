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
      <h3>GeoVin</h3>
      <geo-vin-table v-show="current == 'original'"/>
      <div id="nicetable" v-show="current == 'nicetable'"></div>
      <div id="geovincharts"></div>
    </div>
  </div>
</template>

<script>
import GeoVinTable from '@/components/examples/GeoVinTable'
import { Menu } from 'ant-design-vue'
import * as tablevis from '@/index'

export default {
  components: {
    'a-menu': Menu,
    'a-menu-item': Menu.Item,
    GeoVinTable
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
      extractor: extractors.tableIdExtractor.getTable('geovin'),
      newTableInDiv: document.getElementById('nicetable'),
      tableInsertMethod: 'insertBefore',
      chartsDiv: document.getElementById('geovincharts'),
      persistence: false
    }
    tablevis.default.transformTable(conf)
  }
}
</script>