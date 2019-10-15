<template>
  <div style="padding: 10px 50px;">
    <h3>Violencia contra Personas LGBTI en América</h3>
    <small>
      Fuente de informacion:
      <a
        href="http://www.oas.org/es/cidh/multimedia/2015/violencia-lgbti/violencia-lgbti.html"
      >CIDHLGBTIViolencia</a>
    </small>
    <LGTBI-violencia />
    <div id="violencialgtbi_charts" style="margin-bottom: 100px;"></div>
  </div>
</template>

<script>
import LGTBIViolencia from "@/components/examples/LGTBIViolencia";
import * as tablevis from "@/index";

export default {
  components: {
    LGTBIViolencia
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
      extractor: extractors.tableIdExtractor.getTable("lgtbiviolencia"),
      newTableInDiv: document.getElementById("lgtbiviolencia"),
      tableInsertMethod: "replace",
      chartsDiv: document.getElementById("violencialgtbi_charts"),
      persistence: false
    };
    tablevis.default.transformTable(conf);
  }
};
</script>