<template>
     <q-dialog 
    class="unselectable full-size-modal"
    v-model="value">
    <q-card >
         <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 q-px-md">Deckblatt Erstellen</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="close()" />
        </q-card-section>
        <q-card-section>
            <div class="row">
                <div class="col-4 q-px-md q-pr-xl">
                    <div class="material-card q-pa-md rounded-borders">
                         <q-input 
                        v-model="name"
                        color="secondary"
                        label="Name des Deckblatts"
                    />
                    <q-input 
                        v-model="description"
                        color="secondary"
                        label="Beschreibung (optional)"
                    />
                   </div>
                   
                </div>
                <div class="col-8">
                    <!-- preview -->
                     <DocumentView
                        :content="getPreviewContent()"
                    />
                </div>

            </div>
        </q-card-section>
        <q-card-section>            
            <q-btn flat label="Abbrechen" @click="close()" />
            <q-btn 
                color="secondary"
                text-color="black" 
                label="Deckblatt erstellen" 
                @click="createCoverLetter()"
                class="q-ml-md"
            />
        </q-card-section>         
        </q-card>   
    </q-dialog>
</template>
<script lang="ts">

import { Content } from '@brifle/brifle-sdk';
import { FileContent } from 'src/components/ui-elements/FileDragAndDrop.vue';
import { defineComponent, PropType, ref } from 'vue';

import DocumentView from 'src/components/ui-elements/DocumentView.vue';

export interface CoverLetterCreateValue {
    name: string;
    description?: string;
    content: FileContent;
}

export default defineComponent({
  name: 'AddCoverLetterModal',
  components: {
    DocumentView,
    },

    props: {
        modelValue: {
            type: Boolean,
            required: true,
        },
        contentValue: { 
            type: Object as PropType<FileContent>,
            required: false,
        }
    },
    methods: {
        uint8ToBase64(bytes: Uint8Array): string {
            let binary = "";
            const chunkSize = 0x8000; // 32 KB chunks

            for (let i = 0; i < bytes.length; i += chunkSize) {
                binary += String.fromCharCode(
                ...bytes.subarray(i, i + chunkSize)
                );
            }

            return btoa(binary);
        },
        getPreviewContent() : Content[] {      
            console.log('Content Value:', this.contentValue);
            const b64encoded = this.uint8ToBase64(this.contentValue?.content || new Uint8Array());           
            return [{
                type: 'application/pdf', 
                content: b64encoded
            }];
        },
        close() {            
            this.value = false;
        },
        createCoverLetter() {
            this.$emit('create', {
                name: this.name,
                description: this.description,
                content: this.contentValue!,
            } as CoverLetterCreateValue);
            this.close();
        },
       
    },
    emits: ['update:modelValue', 'create'],
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
  setup() {
    const name = ref('');
    const description = ref('');
    return {
      name,
      description,
    };
  },
});

</script>