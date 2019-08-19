import Vue from 'vue'
import Antd from 'ant-design-vue'
import VueGoodWizard from 'vue-good-wizard'
import App from '@/App.vue'
import { LMap, LTileLayer, LMarker } from 'vue2-leaflet'
import { Icon } from 'leaflet'
import 'leaflet/dist/leaflet.css'

import 'ant-design-vue/dist/antd.css'

Vue.component('l-map', LMap)
Vue.component('l-tile-layer', LTileLayer)
Vue.component('l-marker', LMarker)
delete Icon.Default.prototype._getIconUrl

Icon.Default.mergeOptions({
  iconRetinaUrl: require('leaflet/dist/images/marker-icon-2x.png'),
  iconUrl: require('leaflet/dist/images/marker-icon.png'),
  shadowUrl: require('leaflet/dist/images/marker-shadow.png')
})

var VueScrollTo = require('vue-scrollto')

// Vue.use(Button)
// Vue.use(Table)
Vue.use(Antd)
Vue.use(VueGoodWizard) 
Vue.use(VueScrollTo, {
  container: "body",
  duration: 500,
  easing: "ease",
  offset: 0,
  force: true,
  cancelable: true,
  onStart: false,
  onDone: false,
  onCancel: false,
  x: false,
  y: true
})

Vue.config.productionTip = false

new Vue({
  render: h => h(App),
}).$mount('#app')
