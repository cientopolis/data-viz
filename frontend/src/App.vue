<template>
  <div
    id="app"
    ref="container"
  >
    <a-menu
      v-model="current"
      mode="horizontal"
    >
      <!-- <a-menu-item key="home">
        <router-link to="/">Inicio</router-link>
      </a-menu-item> -->
      <a-menu-item key="home">
        <router-link to="/">Ejemplo 1</router-link>
      </a-menu-item>
      <a-menu-item key="cazamosquitos">
        <router-link to="/cazamosquitos">Ejemplo 2</router-link>
      </a-menu-item>
      <a-menu-item key="geovin">
        <router-link to="/geovin">Ejemplo 3</router-link>
      </a-menu-item>
      <a-menu-item key="odglobe">
        <router-link to="/odglobe">Ejemplo 4</router-link>
      </a-menu-item>
    </a-menu>
    <table />
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
<style>
table {
  border-collapse: collapse;
  border: 2px black solid;
  font: 12px sans-serif;
}

td, th {
  border: 1px black solid;
  padding: 5px;
}
</style>