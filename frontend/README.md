# TableVis

TableVis permite generar diferentes visualizaciones a partir de tablas. Genera, a partir de una tabla existente, una tabla nueva agreǵandole funcionalidad. Por un lado, esta nueva tabla ofrece distintas operaciones que no pod́ıan realizarse sin la librería: filtrar columnas, renombrar columnas, elegir tipos para las columnas (lo cual permite buscar y ordenar dentrode la tabla segun el tipo de columna que sea). Por otro lado, tambíen agregala posibilidad de crear gŕaficos a partir de la seleccíon  de  informacíon  sobre dicha tabla, la cual es la misma que la de la tabla original.

## Demo

Podes probar una demo online [aqui](https://optimistic-roentgen-99a869.netlify.com/) :)

## Instalacion

```bash
npm instal infovis
```

## Uso

```html
<script>
// importar vue
import Vue from 'vue'
// importar la libreria
import infovis from 'infovis'
import 'infovis/dist/infovis.css'

export default {
  mounted () {
    // inicializamos el componente TableVis pasando la
    // tabla generada por el extractor. 
    // El string tableId es el id de nuestra tabla html
    let tableId = 'tableId'
    let ComponentClass = Vue.extend(TableVis)
    let tableVis = new ComponentClass({
      propsData: {
        niceTableParam: extractors.tableIdExtractor.getTable(tableId)
      }
    })
    // agregamos el componente en el documento
    tableVis.$mount()
    document.getElementById('app').appendChild(tableVis.$el)
  }
}
</script>
```

## Licencia

Este sofware esta distribuido bajo [licencia MIT](LICENSE.txt).