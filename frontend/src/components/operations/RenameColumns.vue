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
import { Button, Col, Input, Modal, Row } from 'ant-design-vue'
import NiceTable from '@/nicetable'

export default {
  components: {
    'a-button': Button,
    'a-col': Col,
    'a-input': Input,
    'a-modal': Modal,
    'a-row': Row
  },

  data () {
    return {
      niceTable: null,
      renamedColumns: [],
      modalVisible: false
    }
  },

  methods: {
    showModal () {
      let columns = this.niceTable.getVisibleColumns()
      this.renamedColumns = columns.map(column => {
        return {
          'value': column.dataIndex,
          'label': column.title
        }
      })
      this.modalVisible = true
    },

    save () {
      let columns = this.niceTable.getColumns()
      this.renamedColumns.forEach(renamedColumn => {
        let column = columns.find(column => column.dataIndex == renamedColumn.value)
        column.title = renamedColumn.label
      })
      let niceTable = new NiceTable(this.niceTable.id, columns, this.niceTable.rows)
      this.$emit('onSave', niceTable)
      this.modalVisible = false
    }
  }
}
</script>