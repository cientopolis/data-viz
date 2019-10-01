import Vue from 'vue'
import Router from 'vue-router'
import Home from '@/views/Home'
import Example1 from '@/views/Example1'

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
      path: '/example1',
      name: 'example1',
      component: Example1,
    }
  ]
})

export default router