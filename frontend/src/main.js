import Vue from 'vue'
import Antd from 'ant-design-vue'
import VueGoodWizard from 'vue-good-wizard'
import App from '@/App.vue'
// import { Button, Table } from 'ant-design-vue'
import 'ant-design-vue/dist/antd.css'

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
