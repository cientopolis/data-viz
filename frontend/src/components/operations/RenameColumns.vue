<template>
  <!-- select columns names -->
  <a-modal title="Renombrar Columnas" v-model="modalVisible">
    <template slot="footer">
      <a-button key="submit" type="primary" @click="save()">Guardar</a-button>
    </template>
    <h3>Complete con un nombre descriptivo para las columnas</h3>
    <a-row v-for="(column, index) in renamedColumns" :key="index">
      <a-col style="text-align: center;">
        <a-tooltip>
          <template slot="title">{{column.value}}</template>
          <a-input
            :addonBefore="column.value | truncate"
            v-model="column.label"
            :title="column.title"
            style="width: 300px; margin-top: 5px;"
          />
        </a-tooltip>
      </a-col>
    </a-row>
  </a-modal>
  <!-- end select columns names -->
</template>
<script>
import { Button, Col, Input, Modal, Row, Tooltip } from "ant-design-vue";
import NiceTable from "@/nicetable";

export default {
  components: {
    "a-button": Button,
    "a-col": Col,
    "a-input": Input,
    "a-modal": Modal,
    "a-row": Row,
    "a-tooltip": Tooltip
  },

  data() {
    return {
      niceTable: null,
      renamedColumns: [],
      modalVisible: false
    };
  },

  filters: {
    truncate: function(value) {
      if (value.length > 13) {
        return value.substring(0, 13) + "...";
      }
      return value;
    }
  },

  methods: {
    showModal() {
      let columns = this.niceTable.getVisibleColumns();
      this.renamedColumns = columns.map(column => {
        return {
          value: column.dataIndex,
          label: column.title
        };
      });
      this.modalVisible = true;
    },

    save() {
      let columns = this.niceTable.getColumns();
      this.renamedColumns.forEach(renamedColumn => {
        let column = columns.find(
          column => column.dataIndex == renamedColumn.value
        );
        column.title = renamedColumn.label;
      });
      let niceTable = new NiceTable(
        this.niceTable.id,
        columns,
        this.niceTable.rows
      );
      this.$emit("onSave", niceTable);
      this.modalVisible = false;
    }
  }
};
</script>