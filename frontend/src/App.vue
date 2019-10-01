<template>
  <div
    id="app"
    ref="container"
  >
    <a-menu
      v-model="current"
      mode="horizontal"
    >
      <a-menu-item key="home">
        <router-link to="/">Inicio</router-link>
      </a-menu-item>
      <a-menu-item key="example1">
        <router-link to="/example1">Ejemplo 1</router-link>
      </a-menu-item>
    </a-menu>
    <router-view />
  </div>
</template>

<script>
import { Menu } from 'ant-design-vue'

export default {
  name: 'app',
  components: {
    'a-menu': Menu,
    'a-menu-item': Menu.Item
  },
  data () {
    return {
      current: ['home']
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
}
</style>
