<template>
  <div style="padding: 50px 200px;">
    <div style="width: 700px; margin: auto;">
      <h1>NiceTable</h1>
      <p>TableVis permite generar diferentes visualizaciones a partir de tablas. 
      Genera, a partir de una tabla existente, una tabla nueva agreǵandole funcionalidad.
      Por un lado, esta nueva tabla ofrece distintas operaciones que no podían realizarse sin la librería: 
      filtrar columnas, renombrar columnas, elegir tipos para las columnas (lo cual permite buscar y ordenar 
      dentro de la tabla segun el tipo de columna que sea). Por otro lado, también agrega la posibilidad de crear 
      gŕaficos a partir de la seleccíon de informacíon sobre dicha tabla, la cual es la misma que la de la tabla 
      original.</p>
      <h1># Instalacion</h1>
      <div style="margin: auto; background-color: #8080802b;">
        <pre style="text-align: left;">
          <code>
            $ npm  install  infovis
          </code>
        </pre>
      </div>
      <h1># Uso</h1>
      <h3>Incluir TableVis en proyecto vue:</h3>
      <div style="margin: auto; background-color: #8080802b;">
        <pre style="text-align: left;">
          <code>
            // importar vue
            import Vue from 'vue'
            // importar la libreria
            import infovis from 'infovis'
            import 'infovis/dist/infovis.css'
          </code>
        </pre>
      </div>
      <h3>Incluir TableVis sin vue:</h3>
      <div style="margin: auto; background-color: #8080802b;">
        <pre style="text-align: left;">
          <code>
            &lt;script src=&quot;https://unpkg.com/vue&quot;&gt;&lt;/script&gt;
            &lt;script src=&quot;path/to/infovis.umd.js&quot;&gt;&lt;/script&gt;
            &lt;link rel=&quot;stylesheet&quot; href=&quot;path/to/infovis.css&quot;&gt;
          </code>
        </pre>
      </div>
      <h3>Inicializar TableVis en proyecto vue:</h3>
      <div style="margin: auto; background-color: #8080802b;">
        <pre style="text-align: left;">
          <code>
          export default {
            // mounted es un metodo que se acciona automaticamente en 
            // vue una vez que el sitio ha sido renderizado
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
          </code>
        </pre>
      </div>
      <h3>Inicializar TableVis sin vue:</h3>
      <div style="margin: auto; background-color: #8080802b;">
        <pre style="text-align: left;">
          <code>
          &lt;script&gt;
            new Vue({
              // mounted es un metodo que se acciona automaticamente 
              // en vue una vez que el sitio ha sido renderizado
              mounted () {
                // guardamos la libreria en la variable lib
                let lib = infovis.default
                // inicializamos el componente TableVis pasando la
                // tabla generada por el extractor. 
                // El string tableId es el id de nuestra tabla html
                let tableId = 'tableId'
                let ComponentClass = Vue.extend(lib.TableVis)
                let tableVis = new ComponentClass({
                  propsData: {
                    niceTableParam: lib.extractors.tableIdExtractor.getTable(tableId)
                  }
                })
                // agregamos el componente en el documento
                tableVis.$mount()
                document.getElementById('app').appendChild(tableVis.$el)
              }
            })
          &lt;/script&gt;
          </code>
        </pre>
      </div>
    </div>
  </div>
</template>
<style>
.code
{
    display: block;
    max-height: 500px;
    width: 100%;
    margin: 20px 0;
    font-family: monospace;
    font-size: 13px;
    line-height: 23px;
    position: relative;
    overflow: auto
}
</style>