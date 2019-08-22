<template>
  <div>
    <a-button
      style="margin-left: 5px; margin-top: 50px; float: left;"
      type="primary"
      @click="removeChart()"
    >
      Remove Chart
    </a-button>
    <div id="mapid">
    </div>
  </div>
</template>

<script>
import axios from 'axios'

let accessToken = 'pk.eyJ1Ijoiam9zZWZpbmFlc3RldmV6IiwiYSI6ImNqeml2ZDJwNTAyMGMzYm9zczdhdndidGsifQ.xUBtj7UjSEDYUucjf7_AQA'

export default {
  props: {
    id: {
      type: Number
    },
    data: {
      type: Object,
      required: true
    },
    backend: {
      type: Boolean,
      required: true
    }
  },

  mounted () {
    this.$nextTick(() => {
      this.draw()
    })
  },

  methods: {
    draw () {
      let data = this.data.data
      let view = data[0]
      let lat = data[0]['latitude']
      let lng = data[0]['longitude']
      var mymap = L.map('mapid').setView([parseFloat(lat), parseFloat(lng)], 3)
      L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        maxZoom: 18,
        id: 'mapbox.streets',
        accessToken: accessToken
      }).addTo(mymap);
      data.forEach(element => {
        let lat = parseFloat(element['latitude'])
        let lng = parseFloat(element['longitude'])
        var marker = L.marker([lat, lng]).addTo(mymap)
      })
      // var polygon = L.polygon([
      //   [51.509, -0.08],
      //   [51.503, -0.06],
      //   [51.51, -0.047]
      // ], { color: 'red'}).addTo(mymap);
      // var circle = L.circle([51.508, -0.11], {
      //   color: 'red',
      //   fillColor: '#f03',
      //   fillOpacity: 0.5,
      //   radius: 500
      // }).addTo(mymap);
    },

    removeChart () {
      // if (this.backend) {
      //   // remove from backend
      //   const url = `http://${document.domain}:8000/delete_map/${this.id}`
      //   axios.delete(url).then(response =>{
      //     console.log(response)
      //   })
      // }
      // destroy the vue listeners, etc
      this.$destroy()
      // remove the element from the DOM
      this.$el.parentNode.removeChild(this.$el)
    }
  }
}
</script>
<style scoped>
#mapid {
  margin: auto;
  width: 800px;
  height: 400px;
}
</style>