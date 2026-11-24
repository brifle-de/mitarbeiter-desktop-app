<template>
  <!-- PDF pages as white sheets (vue-pdf-embed) -->
  <div v-if="content != null" class="flex flex-col items-center gap-4">
    <div v-for="(cont, index) in content" :key="baseKey + '_content' + index" class="w-full">
      <vue-pdf-embed :key="baseKey + '_' + pdfRefreshCounter" :source="buildPdfContent(cont)" class="document-view" />
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import VuePdfEmbed from 'vue-pdf-embed';
import { ContentBody } from '@brifle/brifle-sdk';
import PdfBuilder from 'src/utils/pdfBuilder';

export default defineComponent({
  name: 'DocumentView',
  components: {
    VuePdfEmbed,
  },
  props: {
    content: {
      type: Array<ContentBody>,
      default: () => [],
    },
    baseKey: {
      type: String,
      default: '',
    },
  },
  computed: {
  
  }, 
  methods: {
    buildPdfContent(content : ContentBody) {
      if (content.type === 'application/pdf') {
        return PdfBuilder.buildPdfContent(content.content);
      }
      return content.content;
    },
    rerender() {
      this.pdfRefreshCounter++;
    },
  },
  setup() {
    const pdfRefreshCounter = ref(0);
    return {
      pdfRefreshCounter,
    };
  },
});

</script>


<style scoped>
/* every rendered page as a sheet on the Dezent background of the preview card */
.document-view :deep(.vue-pdf-embed__page) {
  margin: 0 auto 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  background: #fff;
}
.document-view :deep(canvas) {
  max-width: 100%;
  height: auto !important;
}
</style>
