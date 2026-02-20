<template>
      <q-dialog v-model="value" class="full-size-modal" >
          <q-card class="no-shadow unselectable">
            <div class="row w-100">
                <div class="col-2">
                    <!-- back btn -->
                     <div class="q-mx-sm" v-if="showPreview">
                         <q-btn icon="arrow_back" flat round dense class="q-mr-md q-mt-md" @click="showPreview = false" />
                     </div>
                </div>
                <div class="col text-center">
                    <div class="text-h6 q-pa-md">
                        {{ 
                        showPreview ? 'Deckblatt Vorschau' : 'Deckblatt auswählen'    
                        }}
                    </div>
                </div>
                <div class="col-2 text-right">
                    <q-btn icon="close" flat round dense class="q-mr-md q-mt-md" @click="close()" />
                </div>
            </div>
            <q-separator />
            <div class="flex-1 scroll q-pa-md">
                <div v-if="loading" class="row items-center justify-center full-height">
                    <q-spinner color="secondary" size="50px" />
                </div>
                <div v-else>
                    <template v-if="showPreview">
                         <div class="q-px-lg">
                            <DocumentView
                            :content="getPreviewContent()"
                            />
                         </div>
                    </template>
                        <template v-else>
                            <div class="text-subtitle1 q-mb-md">
                                Wählen Sie ein Deckblatt aus der Liste unten aus. Klicken Sie auf ein Deckblatt, um eine Vorschau anzuzeigen.
                            </div>
                            <q-list class="cover-letter-selection-list">
                                <q-item v-for="coverLetter in allCoverLetters" :key="coverLetter.name"
                                    clickable
                                    :active="selectedCoverLetter?.name === coverLetter.name"
                                    @click="selectedCoverLetter = coverLetter"
                                >
                                    <q-item-section>
                                        <q-item-label>{{ coverLetter.displayName }}</q-item-label>
                                        <q-item-label caption>
                                            Typ: {{ coverLetter.type === 'default' ? 'Standard' : 'Benutzerdefiniert' }}
                                        </q-item-label>
                                    </q-item-section>
                                </q-item>
                            </q-list>
                    </template>
                </div>
            </div>
            <div>
                <q-card-actions align="right" class="q-pa-md">
                    <!-- Preview btn -->
                     <q-btn 
                        v-if="!showPreview"
                        :disable="!selectedCoverLetter"
                        color="secondary" 
                        outline 
                        @click="loadPreview(selectedCoverLetter!)">
                        <q-icon name="visibility" class="q-mr-sm" />
                        Vorschau
                    </q-btn>
                    <q-btn 
                        :disable="!selectedCoverLetter"
                        color="secondary" 
                        text-color="black" 
                        label="Auswählen" 
                        @click="
                            $emit('selected', selectedCoverLetter);
                            value = false;
                        " 
                    />
                </q-card-actions>
            </div>
            </q-card>
            
        </q-dialog>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';

import BrifleApi from 'src/services/node/Brifle';
import { ContentBody } from '@brifle/brifle-sdk';
import DocumentView from 'src/components/ui-elements/DocumentView.vue'; 


interface CoverLetterSelectionValue {
    name: string;
    type: 'default' | 'custom';
    displayName: string;
}


export default defineComponent({
  name: 'CoverLetterSelectionModal',
  components: {
    DocumentView,
  },
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