import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/views/Home'
import Appear from '@/views/Appear'
import CazaMosquitos from '@/views/CazaMosquitos'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home,
    },
    {
      path: '/appear',
      name: 'AppEAR',
      component: Appear,
    },
    {
      path: '/cazamosquitos',
      name: 'Caza Mosquitos',
      component: CazaMosquitos,
    }
  ]
})

export default router