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
      v-for="(column, index) in renamedColumns"
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
import NiceTable from '@/nicetable'

export default {
  components: {
    'a-modal': Modal,
    'a-col': Col,
    'a-input': Input
  },

  data () {
    return {
      niceTable: null,
      renamedColumns: [],
      modalVisible: false
    }
  },

  watch: {
    niceTable: function(niceTable) {
      let columns = niceTable.getColumns()
      this.renamedColumns = columns.map(column => {
        return {
          'value': column.dataIndex,
          'label': column.dataIndex
        }
      })
    }
  },

  methods: {
    showModal () {
      this.modalVisible = true
    },

    save () {
      let columns = this.niceTable.getColumns()
      this.renamedColumns.forEach((column, index) => {
        columns[index]['title'] = column.label
      })
      let niceTable = new NiceTable(this.niceTable.id, columns, this.niceTable.rows)
      this.$emit('onSave', niceTable)
      this.modalVisible = false
    }
  }
}
</script>