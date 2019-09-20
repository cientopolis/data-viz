<template>
  <!-- select columns names -->
  <a-modal
    title="Crear Tabla Infovis"
    v-model="modalVisible"
  >
    <template slot="footer">
      <a-button
        key="submit"
        type="primary"
        @click="save()"
      >
        Guardar
      </a-button>
    </template>
    <h3>Completa con un nombre descriptivo para tus columnas</h3>
    <a-row
      v-for="(column, index) in columns"
      :key="index"
    >
      <a-col style="text-align: center;">
        <a-input 
          :addonBefore="column.value"
          v-model="column.label"
          style="width: 250px; margin-top: 5px;"
        />
      </a-col>
    </a-row>
  </a-modal>
  <!-- end select columns names -->
</template>
<script>
import { Modal, Col, Input } from 'ant-design-vue'

export default {
  components: {
    'a-modal': Modal,
    'a-col': Col,
    'a-input': Input
  },

  data () {
    return {
      modalVisible: false,
      columns: []
    }
  },

  methods: {
    showModal () {
      this.modalVisible = true
    },

    save () {
      this.modalVisible = false
      this.$parent.renamedColumns(this.columns)
    }
  }
}
</script>