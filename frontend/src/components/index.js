import Vue from 'vue'
import Barchart from './charts/Barchart'
import Mapvis from './charts/Mapvis'
import Multiline from './charts/Multiline'
import Piechart from './charts/Piechart'
import NiceTable from './NiceTable'
import Infovis from './Infovis'

const Components = {
  Barchart,
  Mapvis,
  Multiline,
  Piechart,
  NiceTable,
  Infovis
}

Object.keys(Components).forEach(name => {
  Vue.component(name, Components[name])
})

export default Components