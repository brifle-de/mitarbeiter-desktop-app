<template>
  <Dialog v-model:visible="value" modal :style="{ width: '760px', maxWidth: '90vw' }" :header="showPreview ? 'Deckblatt-Vorschau' : 'Deckblatt auswählen'">
    <div class="flex max-h-[65vh] flex-col gap-3 overflow-auto">
      <Button v-if="showPreview" text :label="'Zurück zur Liste'" class="self-start" @click="showPreview = false">
        <template #icon><ArrowLeft :size="18" /></template>
      </Button>
      <div v-if="loading" class="flex justify-center py-10"><ProgressSpinner style="width: 40px; height: 40px" /></div>
      <template v-else-if="showPreview">
        <div class="rounded-[12px] bg-dezent p-4"><DocumentView :content="getPreviewContent()" /></div>
      </template>
      <template v-else>
        <p class="text-ink-muted">Wähle ein Deckblatt. Mit „Vorschau“ siehst du es vorher an.</p>
        <ul class="flex flex-col gap-1" role="listbox">
          <li v-for="coverLetter in allCoverLetters" :key="coverLetter.name">
            <button
              role="option"
              :aria-selected="selectedCoverLetter?.name === coverLetter.name"
              class="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left"
              :class="selectedCoverLetter?.name === coverLetter.name ? 'border border-line-brand bg-mint' : 'border border-transparent hover:bg-dezent'"
              @click="selectedCoverLetter = coverLetter"
            >
              <FileText :size="20" :class="selectedCoverLetter?.name === coverLetter.name ? 'text-icon-brand' : 'text-ink-muted'" />
              <span class="flex flex-1 flex-col">
                <span class="ma-text-strong">{{ coverLetter.displayName }}</span>
                <span class="ma-small text-ink-muted">{{ coverLetter.type === 'default' ? 'Vorgabe von Brifle' : 'Eigenes Deckblatt' }}</span>
              </span>
              <StatusTag :type="coverLetter.type === 'default' ? 'test' : 'delivered'" :label="coverLetter.type === 'default' ? 'Vorgabe' : 'Eigenes'" />
            </button>
          </li>
        </ul>
      </template>
    </div>
    <template #footer>
      <Button v-if="!showPreview" severity="secondary" outlined label="Vorschau" :disabled="!selectedCoverLetter" @click="loadPreview(selectedCoverLetter!)">
        <template #icon><Eye :size="18" /></template>
      </Button>
      <Button label="Auswählen" :disabled="!selectedCoverLetter" @click="$emit('selected', selectedCoverLetter); value = false">
        <template #icon><Check :size="18" /></template>
      </Button>
    </template>
  </Dialog>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';

import BrifleApi from 'src/services/node/Brifle';
import { ContentBody } from '@brifle/brifle-sdk';
import DocumentView from 'src/components/ui-elements/DocumentView.vue';
import Dialog from 'openvue/dialog';
import Button from 'openvue/button';
import ProgressSpinner from 'openvue/progressspinner';
import StatusTag from 'components/ui/StatusTag.vue';
import { ArrowLeft, Check, Eye, FileText } from 'lucide-vue-next'; 


interface CoverLetterSelectionValue {
    name: string;
    type: 'default' | 'custom';
    displayName: string;
}


export default defineComponent({
  name: 'CoverLetterSelectionModal',
  components: { DocumentView, Dialog, Button, ProgressSpinner, StatusTag, ArrowLeft, Check, Eye, FileText },
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    apiId: {
      type: String,
      required: true,
    },
    tenantId: {
      type: String,
      required: true,
    },

  },
  emits: ['update:modelValue', 'close', 'selected'],
  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(value : boolean) {
        this.$emit('update:modelValue', value);
      },

    },
  },
  methods: {
    getPreviewContent() : ContentBody[] {
        return this.previewContent ? [{
            type: 'application/pdf',
            content: this.previewContent
        }] : [];
    },
    close() {
        this.value = false;
        this.$emit('close');
    },
    loadPreview(coverLetter: CoverLetterSelectionValue) {
        this.showPreview = true;
        this.loading = true;
        BrifleApi.content().contentCoverLetterGet(this.apiId, this.tenantId, coverLetter.type, coverLetter.name)
        .then(response => {
            if(response.isSuccess) {
                this.previewContent = response.data || null; 
            }
        })
        .catch(error => {
            console.error('Error fetching cover letter preview:', error);
        }).finally(() => {
            this.loading = false;
        });
    }
  },  
  mounted() {
    // Fetch cover letters when the component is mounted
    this.loading = true;
    BrifleApi.content().listCoverLetters(this.apiId,this.tenantId)
      .then(response => {
        if (response.isSuccess) {
          this.allCoverLetters = response.data?.cover_letters.map(cl => ({
            name: cl.name,
            type: cl.type as 'default' | 'custom',
            displayName: cl.display_name,
          }) ) || [];
        }
      })
      .catch(error => {
        console.error('Error fetching cover letters:', error);
      }).finally(() => {
        this.loading = false;
      });
  },
  setup() {
    const selectedCoverLetter = ref<CoverLetterSelectionValue | null>(null);
    const allCoverLetters = ref<CoverLetterSelectionValue[]>([
        { name: 'Default Cover Letter', type: 'default', displayName: 'Default Cover Letter' },
        { name: 'Custom Cover Letter 1', type: 'custom', displayName: 'Custom Cover Letter 1' },
        { name: 'Custom Cover Letter 2', type: 'custom', displayName: 'Custom Cover Letter 2' },
    ]);
    const showPreview = ref(false);
    const previewContent = ref<string | null>(null);
    const brifleApi = new BrifleApi();
    const loading = ref(false);
    return {
        selectedCoverLetter,
        allCoverLetters,
        showPreview,
        previewContent, 
        brifleApi,
        loading
        };
  },
});
</script>