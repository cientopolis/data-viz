<template>
  <div id="app" style="padding: 0 50px;">
    <example1 />
    <infovis table-id="appear" />
  </div>
</template>

<script>
import Example1 from '@/components/Example1'
import Infovis from '@/components/Infovis'

export default {
  name: 'app',
  components: {
    Example1,
    Infovis
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
  margin-top: 60px;
}
</style>
