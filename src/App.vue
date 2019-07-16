<template>
  <div id="app" style="padding: 0 50px;">
    <nice-table :columns=columns :data=data />
    <!-- <div><timeline-with-labels :data=data /></div> -->
  </div>
</template>

<script>
// import Vue from 'vue'
import NiceTable from '@/components/NiceTable'
// import TimelineWithLabels from '@/components/TimelineWithLabels'

export default {
  name: 'app',
  components: {
    NiceTable
  },
  data () {
    return {
      columns: [],
      data: []
    }
  },
  mounted () {
    this.columns = [
      {
        type: 'String',
        title: 'Site name',
        dataIndex: 'site_name'
      },
      {
        type: 'Latitude',
        title: 'Latitude',
        dataIndex: 'latitude'
      },
      {
        type: 'Longitude',
        title: 'Longitude',
        dataIndex: 'longitude'
      },
      {
        type: 'Number',
        title: 'Quality index',
        dataIndex: 'quality_index'
      },
      {
        type: 'Date',
        title: 'Date',
        dataIndex: 'date'
      },
      {
        type: 'String',
        title: 'Habitat Type',
        dataIndex: 'habitat_type'
      },
      {
        type: 'String',
        title: 'Username',
        dataIndex: 'username'
      },
      {
        type: 'String',
        title: 'Verified',
        dataIndex: 'verified'
      }
    ]
    this.data = [
      {
        'site_name': 'SN',
        'latitude': '-35.115974',
        'longitude': '-58.172607',
        'quality_index': 32,
        'date': '30/05/2016',
        'habitat_type': 'Laguna',
        'username': 'juacochero',
        'verified': 'Incorrecto',
      },
      {
        'site_name': 'ARROMORA1',
        'latitude': '-34.838684',
        'longitude': '-58.833248',
        'quality_index': 51.3,
        'date': '08/03/2016',
        'habitat_type': 'Llanura',
        'username': 'juacochero',
        'verified': 'Incorrecto',
      },
      {
        'site_name': '',
        'latitude': '-34.874893',
        'longitude': '-58.030827',
        'quality_index': 62.5,
        'date': '',
        'habitat_type': '',
        'username': 'Mariano',
        'verified': 'Verificado',
      },
      {
        'site_name': 'arroyo dona flora',
        'latitude': '-34.848465',
        'longitude': '-57.920609',
        'quality_index': 67.8,
        'date': '07/05/2016',
        'habitat_type': 'Llanura',
        'username': 'Mariano',
        'verified': 'Incorrecto',
      },
      {
        'site_name': 'SN',
        'latitude': '-34.910007',
        'longitude': '-57.92593',
        'quality_index': 67.3,
        'date': '05/05/2016',
        'habitat_type': 'Montana',
        'username': 'Mariano',
        'verified': 'Verificado',
      },
      {
        'site_name': 'SN',
        'latitude': '-34.883255',
        'longitude': '-57.800102',
        'quality_index': 59.6,
        'date': '09/05/2016',
        'habitat_type': 'Llanura',
        'username': 'rocio',
        'verified': 'Verificado',
      },
      {
        'site_name': 'Santo Domingo',
        'latitude': '-34.666943',
        'longitude': '-58.301109',
        'quality_index': 80,
        'date': '05/05/2016',
        'habitat_type': 'Estuario',
        'username': 'escuela2',
        'verified': 'Verificado',
      },
      {
        'site_name': 'B2',
        'latitude': '-34.834999',
        'longitude': '-58.172001',
        'quality_index': 42,
        'date': '',
        'habitat_type': '',
        'username': 'belensat',
        'verified': 'Verificado',
      },
      {
        'site_name': 'B3',
        'latitude': '-34.801998',
        'longitude': '-58.124001',
        'quality_index': 67,
        'date': '',
        'habitat_type': '',
        'username': 'escuela1',
        'verified': 'Verificado',
      },
      {
        'site_name': 'B1',
        'latitude': '-34.848999',
        'longitude': '-58.181',
        'quality_index': 71,
        'date': '',
        'habitat_type': '',
        'username': 'escuela1',
        'verified': 'Verificado',
      }
    ]
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
