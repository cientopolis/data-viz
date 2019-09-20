<template>
  <!-- filter columns -->
  <a-modal
    title="Crear Tabla Infovis"
    v-model="modalVisible"
  >
    <template slot="footer">
      <a-button
        key="submit"
        type="primary"
        :disabled="filteredColumns.length === 0"
        @click="save"
      >
        Guardar
      </a-button>
    </template>
    <a-row>
      <h3>Selecciona las columnas que quieras incluir en tu nueva tabla</h3>
      <a-checkbox-group
        style="margin: 0 30px;"
        :options="columns"
        v-model="filteredColumns"
      />
    </a-row>
  </a-modal>
  <!-- end filtering columns -->
</template>
<script>
import { Modal } from 'ant-design-vue'

export default {
  components: {
    'a-modal': Modal
  },

  data () {
    return {
      modalVisible: false,
      columns: [],
      filteredColumns: []
    }
  },

  methods: {
    showModal () {
      this.modalVisible = true
    },

    save () {
      this.modalVisible = false
      this.$parent.filteredColumns(this.filteredColumns)
    }
  }
}
</script>