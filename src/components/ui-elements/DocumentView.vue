<template>    
        <div  v-if="content != null">
            <div v-for="(cont, index) in content"
            :key="baseKey+'_content'+index" >
                <div>
                    <vue-pdf-embed :key="baseKey+'_'+pdfRefreshCounter" :source="buildPdfContent(cont)" />
                </div> 
            </div>
        </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import VuePdfEmbed from 'vue-pdf-embed';
import { Content } from '@brifle/brifle-sdk';
import PdfBuilder from 'src/utils/pdfBuilder';

export default defineComponent({
  name: 'DocumentView',
  components: {
    VuePdfEmbed,
  },
  props: {
    content: {
      type: Array<Content>,
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
    buildPdfContent(content : Content) {
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

<style lang="scss">

</style>
