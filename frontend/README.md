## TableVis

### Live demo [here](https://optimistic-roentgen-99a869.netlify.com/)

### Install
`npm install infovis`

### How to use in VueJS projects
```html
<script>
import infovis from "infovis";
import "infovis/dist/infovis.css";

export default {
  mounted () {
    const conf = {
      // ’tableId’ is the id of our html table
      extractor: infovis.extractors.tableIdExtractor.getTable('tableId'),
      // our new table will be inserted
      // in div with id ’divId’
      newTableInDiv: document.getElementById('divId'),
      // replace will be the method to insert our new table
      // options are: append, insertBefore, replace 
      tableInsertMethod: 'replace',
      // div with id ’chartsDiv’ will be used
      // to insert our new table
      chartsDiv: document.getElementById('chartsDiv')
    }
    infovis.transformTable(conf)
  }
};
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
      created () {
        const conf = {
          // ’tableId’ is the id of our html table
          extractor: infovis.default.extractors.tableIdExtractor.getTable('tableId'),
          // our new table will be inserted
          // in div with id ’divId’
          newTableInDiv: document.getElementById('divId'),
          // replace will be the method to insert our new table
          // options are: append, insertBefore, replace 
          tableInsertMethod: 'replace',
          // div with id ’chartsDiv’ will be used
          // to insert our new table
          chartsDiv: document.getElementById('chartsDiv'),
          // persistence could be true or false
          // depending if we want to persis our actions out not
          // by default is true
          persistence: false
        }
        infovis.default.transformTable(conf)
      }
    })
  </script>
```