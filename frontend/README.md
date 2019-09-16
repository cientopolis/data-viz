## infovis-table

La libreria actua sobre una matriz compuesta con columnas y filas, creando una tabla amigable para el usuario brindandole la posibilidad de crear a traves de diferentes filtros y selecciones, una tabla con informacion curada, con posibilidad de busqueda y ordenaciones, y tambien con la posibilidad de redefinir los nombres de las columnas usando otros que sean mas descriptivos segun a conveniencia de cada usuario. La matriz puede generarse con un exportador de tablas html, obteniendo los datos de la misma.

### Instalacion

## En un proyecto vue

`npm instal infovis`

### Uso

```<script>
import Vue from 'vue'
import infovis from 'infovis'
import 'infovis/dist/infovis.css'

export default {
  mounted () {
    let exporter = infovis.exporters.tableIdExporter
    let table = exporter.getTable(document, 'sometable')
    let ComponentClass = Vue.extend(infovis.Infovis)
    let element = new ComponentClass({
      propsData: {
        tableId: 'identificador',
        columns: table['columns'],
        data: table['data']
      }
    })
    element.$mount() // pass nothing
    document.getElementById('app').appendChild(element.$el) // append in document
  }
}
</script>```

### Demo

Podes probar una demo online [aqui](https://optimistic-roentgen-99a869.netlify.com/) :)