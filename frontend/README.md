## TableVis

### Install
`$ npm install infovis`

### How to use in VueJS projects
```html
<script>
import infovis from 'infovis'
import 'infovis/dist/infovis.css'

export default {
  mounted () {
    const conf = {
      extractor: infovis.extractors.tableIdExtractor.getTable('sometableid'),
      newTableInDiv: document.getElementById('sometableid'),
      tableInsertMethod: 'replace',
      chartsDiv: document.getElementById('chartsdiv')
    }
    infovis.transformTable(conf)
  }
}
</script>
```

### How to use in without VueJS
```html
<head>
    <script src="https://unpkg.com/vue"></script>
    <script src="path/to/infovis.umd.js"></script>
    <link rel="stylesheet" href="path/to/infovis.css">
</head>
```
```html
<script>
new Vue({
  const conf = {
    extractor: infovis.extractors.tableIdExtractor.getTable('sometableid'),
    newTableInDiv: document.getElementById('sometableid'),
    tableInsertMethod: 'replace',
    chartsDiv: document.getElementById('charts')
  }
  infovis.transformTable(chartsdiv)
})
</script>
```