import Vue from 'vue'
import TableVis from '@/components/TableVis'

const transformTable = (conf) => {
  if (!conf.extractor) {
    throw "extractor is required in conf"
  }
  if (!conf.newTableInDiv) {
    throw "newTableInDiv is required in conf"
  }
  if (!conf.chartsDiv) {
    throw "chartsDiv is required in conf"
  }
  let insertMethod = conf.hasOwnProperty('tableInsertMethod') ? conf.tableInsertMethod : 'append'
  let persistence = conf.hasOwnProperty('persistence') ? conf.persistence : true
  let ComponentClass = Vue.extend(TableVis)
  let niceTable = conf.extractor
  niceTable.setBackend(persistence)
  let tableVis = new ComponentClass({
    propsData: {
      niceTableParam: niceTable,
      chartsDiv: conf.chartsDiv
    }
  })
  tableVis.$mount() // pass nothing
  if (insertMethod == 'append') {
    conf.newTableInDiv.appendChild(tableVis.$el)
  } else if (insertMethod == 'insertBefore') {
    conf.newTableInDiv.insertBefore(tableVis.$el, null)
  } else if (insertMethod == 'replace') {
    conf.newTableInDiv.replaceWith(tableVis.$el)
  }
}

export default transformTable