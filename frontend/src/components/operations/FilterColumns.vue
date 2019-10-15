<template>
  <!-- filter columns -->
  <a-modal
    title="Filtrar Columnas"
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
      <h3>Selecciona las columnas que quieras incluir en la tabla</h3>
    </a-row>
    <a-row>
      <a-button
        size="small"
        style="float: left; margin: 10px 5px;"
        @click="checkAll()"
      >
        Marcar todas
      </a-button>
      <a-button
        size="small"
        style="float: left; margin: 10px 5px;"
        @click="uncheckAll()"
      >
        Desmarcar todas
      </a-button>
    </a-row>
    <a-row>
      <a-checkbox-group
        style="margin: 0 30px;"
        :options="allColumns"
        v-model="filteredColumns"
      />
    </a-row>
  </a-modal>
  <!-- end filtering columns -->
</template>
<script>
import { Checkbox, Button, Modal, Row } from 'ant-design-vue'
import NiceTable from '@/nicetable'

export default {
  components: {
    'a-checkbox-group': Checkbox.Group,
    'a-button': Button,
    'a-modal': Modal,
    'a-row': Row
  },

  data () {
    return {
      niceTable: null,
      modalVisible: false,
      allColumns: [],
      filteredColumns: []
    }
  },

  methods: {
    showModal () {
      this.allColumns = []
      this.filteredColumns = []
      let columns = this.niceTable.getColumns()
      columns.forEach(column => {
        this.allColumns.push({
          'value': column.dataIndex,
          'label': column.title
        })
        if (column.visible) {
          this.filteredColumns.push(column.dataIndex)
        }
      })
      this.modalVisible = true
    },

    checkAll () {
      const columns = this.niceTable.getColumns()
      columns.forEach(column => {
        this.filteredColumns.push(column.dataIndex)
      })
    },

    uncheckAll () {
      this.filteredColumns = []
    },

    save () {
      let columns = this.niceTable.getColumns()
      columns.forEach(column => {
        column.visible = this.filteredColumns.indexOf(column.dataIndex) >= 0 ? true : false
      })
      let niceTable = new NiceTable(this.niceTable.id, columns, this.niceTable.rows)
      this.$emit('onSave', niceTable)
      this.modalVisible = false
    }
  }
}
</script>