<template>
  <div>
    <!-- <a-menu
      v-model="current"
      mode="horizontal"
    >
      <a-menu-item key="original">
        Tabla Original
      </a-menu-item>
      <a-menu-item key="nicetable">
        NiceTable
      </a-menu-item>
    </a-menu>-->
    <div style="position:relative;width:fit-content;height:fit-content;">
      <a
        style="position:absolute;top:20px;right:1rem;opacity:0.8;"
        href="https://clipchamp.com/watch/New-Project-RHEQ1i?utm_source=embed&utm_medium=embed&utm_campaign=watch"
      >
        <img style="height:22px;" src="https://clipchamp.com/e.svg" alt="Made with Clipchamp" />
      </a>
      <iframe
        allowfullscreen
        style="border:none"
        src="https://clipchamp.com/watch/New-Project-RHEQ1i/embed"
        width="640"
        height="360"
      ></iframe>
    </div>
    <div style="padding: 30px 50px">
      <!-- <h3>AppEAR</h3> -->
      <appear-table v-show="false" />
      <div id="nicetable"></div>
      <div id="appearcharts"></div>
    </div>
  </div>
</template>

<script>
import AppearTable from "@/components/examples/AppearTable";
import { Menu } from "ant-design-vue";
import * as tablevis from "@/index";

export default {
  components: {
    "a-menu": Menu,
    "a-menu-item": Menu.Item,
    AppearTable
  },

  data() {
    return {
      current: ["original"],
      showNiceTable: false
    };
  },

  mounted() {
    let extractors = tablevis.default.extractors;
    const conf = {
      extractor: extractors.tableIdExtractor.getTable("appear"),
      newTableInDiv: document.getElementById("nicetable"),
      tableInsertMethod: "insertBefore",
      chartsDiv: document.getElementById("appearcharts")
    };
    tablevis.default.transformTable(conf);
  }
};
</script>