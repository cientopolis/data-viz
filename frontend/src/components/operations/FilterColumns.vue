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
import { Modal } from 'ant-design-vue'
import NiceTable from '@/nicetable'

export default {
  components: {
    'a-modal': Modal
  },

  data () {
    return {
      niceTable: null,
      modalVisible: false,
      allColumns: [],
      filteredColumns: []
    }
  },

  watch: {
    niceTable: function(niceTable) {
      const columns = niceTable.getColumns()
      this.allColumns = []
      columns.forEach(column => {
        this.allColumns.push({
          'value': column.dataIndex,
          'label': column.title
        })
        if (column.visible) {
          this.filteredColumns.push(column.dataIndex)
        }
      })
    }
  },

  methods: {
    showModal () {
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