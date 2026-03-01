<template>
    <q-dialog :model-value="editIndex !== -1" persistent>
        <q-card class="material-card material-card-filled">
            <q-card-section>
                <div class="text-h6">Dokumententyp bearbeiten</div>
                <q-input filled
                v-model="customDocTypes[editIndex]"
                color="secondary"
                label="Dokumententyp"
                class="q-mt-lg"
                @keyup.enter="editIndex = -1" 
                @keyup.esc="editIndex = -1">
            
            </q-input>
                
            </q-card-section>
            <q-card-actions align="right" class="q-mx-sm">
                <q-btn flat class="muted-action-btn" label="Schließen" color="secondary" @click="editIndex = -1" />
            </q-card-actions>
        </q-card>

    </q-dialog>
    <div class="q-my-lg text-center">
        <q-input filled
        v-model="subject.default"
        color="secondary"
        label="Betreff"
        class="q-mt-lg"
        />
    </div>
    <div class="q-my-lg text-center">
        <h6>Dokumententyp spezifische Betreffs</h6>
        <div v-for="docType in docTypes" :key="docType" class="q-my-md">
            <q-input filled
            v-model="subject.docTypes[docType]"
            color="secondary"
            :placeholder="subject.default"
            :label="`Betreff für ${docType}`"
             >
            <template v-slot:append>
                <q-btn 
                flat 
                class="muted-action-btn"
                @click="customDocTypes.push('Dok' + (customDocTypes.length + 1))"
                color="secondary" label="+" />
            </template>
            <template v-slot:prepend>
              <div :class="getPillClass(docType)">
                {{ docType }}
              </div>
            </template>
            </q-input>
        </div>
        <div v-for="(docType, index) in customDocTypes" :key="docType" class="q-my-md">
            <q-input filled
            v-model="subject.docTypes[docType]"
            color="secondary"
            :placeholder="subject.default"
            :label="`Betreff für ${docType}`"
             >
            <template v-slot:append>
                <div class="row">
                    <q-btn 
                        flat 
                        class="muted-action-btn"
                        @click="customDocTypes.push('Dok' + (customDocTypes.length + 1))"
                        color="secondary" label="+" />
                    <q-btn 
                        flat
                        class="muted-action-btn q-mx-sm"
                        @click="customDocTypes.splice(customDocTypes.indexOf(docType), 1)"
                        color="negative" label="-" />
                        <q-btn
                        flat
                        class="muted-action-btn"
                        @click="editIndex = index"
                        icon="edit"
                        />
                        
                </div>
            </template>
            <template v-slot:prepend>
              <div :class="getPillClass(docType)">
                {{ docType }}
              </div>
            </template>
            </q-input>
        </div>
    </div>
</template> 
<script lang="ts">

import { defineComponent, PropType, ref } from 'vue';
import { SubjectData } from '../util/helper';
import DocumentRecord from '../util/documents/documentRecord';
import { computePillColors } from '../util/helper';

export default defineComponent({
    name: 'SubjectSetter',
    props: {
        modelValue: {
            type: Object as PropType<SubjectData>,
            required: true,
        },
        docs: {
            type: Array<DocumentRecord>,
            required: false,
            default: () => []
        }
    },
    methods: {
        getPillClass(docType: string) {
            return 'text-caption q-ml-sm muted-pill ' + (this.pillColors[docType] ?? '')
        }
    },
    computed: {
        pillColors(): Record<string, string> {
            const types : {docType: string}[] = [];
            this.allTypes.forEach(doc => {
                if (doc) {
                    types.push({docType: doc});
                }
            });
            return computePillColors(types);
         },
        allTypes(): string[] {
            const types = new Set<string>();
            this.docs.forEach(doc => {
                if (doc.docType) {
                    types.add(doc.docType);
                }
            });
            this.customDocTypes.forEach(type => types.add(type));
            return Array.from(types);
        },
        docTypes(): string[] {
            const types = new Set<string>();
            this.docs.forEach(doc => {
                if (doc.docType) {
                    types.add(doc.docType);
                }
            });
            return Array.from(types);
        },
        subject: {
            get() : SubjectData {
                return this.modelValue;
            },
            set(value: SubjectData) {
                this.$emit('update:modelValue', value);
            }
        }
     },
    emits: ['update:modelValue'],
    setup() {
        const customDocTypes = ref<string[]>([]);
        const editIndex = ref<number>( - 1);
        return { customDocTypes, editIndex };
    },
});



</script>