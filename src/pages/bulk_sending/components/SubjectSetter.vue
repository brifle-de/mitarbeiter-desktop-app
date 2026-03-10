<template>
    <q-dialog 
        class="confirm-dialog"
        v-model="showBuildDialog" position="right" 
        maximized persistent  no-shake  transition-show="none"
        transition-hide="none">
            <q-card class="material-card material-card-filled flex-column  padding-top-titlebar unselectable builder-dialog">
                <q-card-section class="w-100">
                    <div class="text-h5">Betreff Designer</div>
                </q-card-section>
                <q-card-section class="w-100">
                    <q-input
                    label="Betreff"
                     filled
                    class="w-100"
                    v-model="builderSubject"
                    color="secondary" />
                    <div class="q-mt-md text-bold">
                        {{ builderPreview }}
                    </div>
                </q-card-section>
                <q-card-section class="w-100 flex-1 q-py-sm" style="overflow: auto;">
                    <div class="text-h6">Verfügbare Platzhalter</div>
                    <div v-for="placeholder in placeholders" :key="placeholder" class="row q-my-sm q-px-md">
                        <div class="col-4">
                            <div class="muted-pill text-caption clickable" @click="builderSubject += `{{${placeholder}}}`">
                                {{ placeholder }}
                            </div>
                        </div>
                        <div class="col-8">
                            {{ placeholderDescriptions[placeholder as keyof typeof placeholderDescriptions] ?? 'Keine Beschreibung verfügbar' }}
                        </div>
                    </div>
                    
                </q-card-section>
                <q-card-actions class="w-100 justify-between">
                    <q-btn flat class="muted-action-btn" label="Schließen" @click="showBuildDialog = false" />
                    <!-- copy design value-->
                    <q-btn flat class="muted-action-btn" color="secondary" label="Kopieren in Zwischenablage" @click="copyFromBuilder()" />
                </q-card-actions>
                
            </q-card>
    </q-dialog>
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
    <div>
        <q-btn flat class="muted-action-btn" @click="showBuildDialog = true" color="secondary" label="Betreff Builder" />
    </div>
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
            <q-input            
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
<style lang="scss" scoped>
    .builder-dialog {
        width: 800px;
        max-width: 60vw;
    }
</style>
<script lang="ts">

import { defineComponent, PropType, ref } from 'vue';
import { getSubjectPlaceholderkeys, getSubjectPlaceholders, SubjectData } from '../util/helper';
import DocumentRecord from '../util/documents/documentRecord';
import { computePillColors } from '../util/helper';
import { copyToClipboard } from 'quasar';
import { SendDocReceiverReq } from '../util/receivers/receiverRecord';

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
        copyFromBuilder() {
            void copyToClipboard(this.builderSubject);
            this.$q.notify({ type: 'positive', message: 'Betreff in Zwischenablage kopiert' });
            this.showBuildDialog = false;
        },
        getPillClass(docType: string) {
            return 'text-caption q-ml-sm muted-pill ' + (this.pillColors[docType] ?? '')
        }
    },
    computed: {
        builderPreview(): string {
            let preview = this.builderSubject;
            const dummyData = getSubjectPlaceholders({doc: {docType: 'default'}} as SendDocReceiverReq);
            for (const key in dummyData) {
                preview = preview.replaceAll(`{{${key}}}`, dummyData[key]!);
            }
            return preview;
        },
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
        const showBuildDialog = ref<boolean>(false);
        const placeholders = getSubjectPlaceholderkeys();
      
        const placeholderDescriptions = {
            receiverId: 'Die ID des Empfängers',
            docType: 'Der Dokumententyp',
            currentMonth: 'Der aktuelle Monat (z.B. Januar, Februar, ...)',
            currentYear: 'Das aktuelle Jahr (z.B. 2024)',   
            currentDate: 'Das aktuelle Datum (z.B. 01.01.2024)',
            currentDay: 'Der aktuelle Tag (z.B. 01, 02, ...)',
            nextMonth: 'Der nächste Monat (z.B. Januar, Februar, ...)',
            nextYear: 'Das nächste Jahr (z.B. 2024)',
            nextDate: 'Das nächste Datum (z.B. 01.01.2024)',
            lastMonth: 'Der letzte Monat (z.B. Januar, Februar, ...)',
            lastYear: 'Das letzte Jahr (z.B. 2024)',
            lastDate: 'Das letzte Datum (z.B. 01.01.2024)',
            lastMonthYear: 'Der letzte Monat und das Jahr (z.B. Januar 2024)',
            currentMonthAndYear: 'Der aktuelle Monat und das Jahr (z.B. Januar 2024)',
            nextMonthYear: 'Der nächste Monat und das Jahr (z.B. Januar 2024)',
        }
        const builderSubject = ref<string>('');
        return { customDocTypes, editIndex, showBuildDialog, placeholders, placeholderDescriptions, builderSubject };
    },
});



</script>