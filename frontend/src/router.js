import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/views/Home'
import Example from '@/views/Example'
import Appear from '@/views/Appear'
import CazaMosquitos from '@/views/CazaMosquitos'
import GeoVin from '@/views/GeoVin'
import OdGlobe from '@/views/OdGlobe'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    // {
    //   path: '/',
    //   name: 'home',
    //   component: Home,
    // },
    {
      path: '/',
      name: 'example',
      component: Example
    },
    // {
    //   path: '/appear',
    //   name: 'AppEAR',
    //   component: Appear,
    // },
    // {
    //   path: '/cazamosquitos',
    //   name: 'Caza Mosquitos',
    //   component: CazaMosquitos,
    // },
    // {
    //   path: '/geovin',
    //   name: 'GeoVin',
    //   component: GeoVin
    // },
    // {
    //   path: '/odglobe',
    //   name: 'ODGlobe',
    //   component: OdGlobe
    // }
  ]
})

export default router