<template>
    <div class="row q-mb-lg">
        <div class="col-6">
            
        </div>
        <div class="col-6 text-right">
            <div class="text-h5">
               <q-btn 
                    color="secondary" 
                    class="muted-action-btn"
                    flat
                    v-if="previewLoaded"
                    @click="loadPreview()">
                    <q-tooltip anchor="top middle" self="bottom middle" class="muted-tooltip">
                        Vorschau aktualisieren
                    </q-tooltip>
                    <span class="q-mr-sm">Aktualisieren</span>
                    <q-icon name="refresh" />
                </q-btn>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-4 q-pr-xl">
                    <div class="material-card q-pa-md rounded-borders">
                        <div class="text-h6">
                            Empfängerauswahl
                        </div>                        
                        <div v-if="receivers.length > 0">
                            <q-select
                            v-model="selectedReceiver"
                            :options="filterAvailableReceivers(receivers)"
                            :option-label="(receiver) => getReceiverDataSelection(receiver)"
                            option-value="id"
                            color="secondary"
                            map-options
                            :disable="!hasCheckedReceivers"
                            class="q-mt-md" />                                    
                            <div v-if="!hasCheckedReceivers" class="q-mt-md text-caption">
                                Es müssen erst alle Empfänger überprüft werden, bevor eine Vorschau angezeigt werden kann.
                            </div>                           
                        </div>
                        <div v-else class="q-mt-md">
                            Es wurden noch keine Empfänger hinzugefügt.
                        </div>
                    </div>
                    <!-- Details about receiver -->
                     <div v-if="selectedReceiver" class="material-card q-pa-md rounded-borders q-mt-md">
                        <div class="text-h6">
                            Empfängerdetails
                        </div>
                        <div class="q-mt-md">
                            <div><strong>Name:</strong> {{ getReceiverDataSelection(selectedReceiver) }}</div>
                            <div><strong>Brifle Account:</strong> {{ selectedReceiver.existsBrifle ? "Ja" : "Nein" }}</div>
                            <div><strong>Gültige Postadresse:</strong> {{ selectedReceiver.validPostalAddress ? "Ja" : "Nein" }}</div>
                            <div><strong>Zustellung per:</strong> {{ getDeliveryMethod(selectedReceiver) }}</div> 
                        </div>
                    </div>
                </div>
            <div class="col-8">
                <template v-if="previewLoaded">
                    <div
                        v-for="(file, index) in getPreviewContent()" 
                            :key="index+'preview_element'" class="rounded-borders"
                        >
                                
                                <template v-if="requiresPapermail() && paperMailPreview">
                                    <DocumentView   
                                    base-key="preview-papermail" 
                                    :content="[paperMailPreview]" />

                                </template>
                                <template v-else-if="requiresBrifle()">
                                    <DocumentView   
                                    base-key="preview-raw" 
                                    :content="[file]" />
                                </template>
                                <template v-else-if="requiresNoDelivery()">
                                    <div class="row items-center justify-center" style="height: 100%;">
                                        <div class="col-auto text-center">
                                            <div class="text-muted q-my-xl text-h5">Keine Zustellung möglich</div>
                                        </div>
                                    </div>
                                </template>
                            
                            
                        
                        </div>   
                </template>
                <template v-else>
                    <div class="row items-center justify-center" style="height: 100%;">
                        <div class="col-auto text-center">
                            <div class="text-muted q-my-xl text-h5">Noch keine Vorschau generiert</div>
                            <div class="q-mt-md">
                                <q-btn 
                                    :disable="!hasCheckedReceivers || !selectedReceiver" 
                                    color="secondary" 
                                    class="muted-action-btn"
                                    flat
                                    @click="loadPreview()">
                                    Vorschau generieren
                                </q-btn>
                            </div>
                        </div>
                    </div>
                </template>
                
            </div>
    </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import { CoverLetterData, TrackableReceiverRecord } from '../util/types';
import { FileContent } from 'src/components/ui-elements/FileDragAndDrop.vue';
import { ContentBody, PreviewCoverLetterRequest, PreviewPaperMailRequest } from '@brifle/brifle-sdk';
import DocumentView from 'src/components/ui-elements/DocumentView.vue';
import BrifleApi from 'src/services/node/Brifle';

export default defineComponent({
    name: 'PreviewComponent',
    props: {
        apiId: {
            type: String,
            required: true
        },
         tenantId: {
            type: String,
            required: true
        },
        receivers: {
            type: Array as () => TrackableReceiverRecord[],
            required: true
        },
        hasCheckedReceivers: {
            type: Boolean,
            required: true
        },
        allowPapermail: {
            type: Boolean,
            required: true
        },
        files: {
            type: Array as () => FileContent[],
            required: true
        },
        includeCoverLetter: {
            type: Boolean,
            required: true
        },
        selectedCoverLetter: {
            type: Object as () => CoverLetterData | null,
            required: false
        }
    },
    components: {
      DocumentView
    },
    methods: {
        requiresPapermail(){
            return this.selectedReceiver && !this.selectedReceiver.existsBrifle && this.selectedReceiver.validPostalAddress;
        },
         requiresBrifle(){
            return this.selectedReceiver && this.selectedReceiver.existsBrifle;
        },
         requiresNoDelivery(){
            return this.selectedReceiver && !this.selectedReceiver.existsBrifle && !this.selectedReceiver.validPostalAddress;
        },
        loadPreview() {
            if(this.requiresPapermail()){
                const firstLine = [this.selectedReceiver?.firstName, this.selectedReceiver?.lastName].filter(Boolean).join(" ");
                const coverLetter : PreviewCoverLetterRequest = {
                    type: this.selectedCoverLetter?.type || "default",
                    enable: this.includeCoverLetter && !!this.selectedCoverLetter,
                    data: undefined,
                    name: this.selectedCoverLetter?.name || "cover_letter"
                }
                if(!coverLetter.enable){
                    coverLetter.data = undefined;
                    coverLetter.name = undefined;
                }
                const previewReq : PreviewPaperMailRequest = {
                    to: {
                        address_line1: firstLine,
                        address_line2: this.selectedReceiver?.addressStreet || "",
                        postal_code: this.selectedReceiver?.addressPostcode || "",
                        city: this.selectedReceiver?.addressCity || "",
                        country: this.selectedReceiver?.addressCountry || "",
                    },
                    body: this.getPreviewContent(),
                    cover_letter: coverLetter
                }


                BrifleApi.content().previewPaperMail(this.apiId, this.tenantId, previewReq).then((res)=>{
                    console.log("Preview response:", res);
                    if(res.isSuccess && res.data){
                        const data = res.data as unknown as string;
                        this.paperMailPreview = {
                            type: 'application/pdf',
                            content: data
                        };
                    } else {
                        console.error("Fehler beim Laden der Vorschau:", res.error);
                    }
                }).catch((err)=>{
                    console.error("Fehler beim Laden der Vorschau:", err);
                });
            }
            this.previewLoaded = true;
        },
        getDeliveryMethod(receiver: TrackableReceiverRecord): string { 
            if(receiver.existsBrifle){
                return "Brifle";
            } else if(receiver.validPostalAddress){
                return "Papierpost";
            }
            return "Keine Zustellung möglich";
        },
        filterAvailableReceivers(receivers: TrackableReceiverRecord[]) {
            if(!this.allowPapermail){
                return receivers.filter(receiver => receiver.existsBrifle);
            }
            return receivers.filter(receiver => receiver.existsBrifle || receiver.validPostalAddress);
        },
        getReceiverDataSelection(receiver: TrackableReceiverRecord) {
            if(receiver){
                const firstName = receiver.firstName || "";
                const lastName = receiver.lastName || "";
                                

                return [
                    firstName, lastName
                ].join(" ").trim();
            }
            return "n/a";

        },
        getPreviewContent() : ContentBody[] {   
            return this.files.map((file)=>{         
                const b64encoded = this.uint8ToBase64(file.content);           
                return {
                    type: 'application/pdf', 
                    content: b64encoded
                }
            })
    },
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
    },
    setup() {
        const selectedReceiver = ref<TrackableReceiverRecord | null>(null);
        const previewLoaded = ref(false);
        const paperMailPreview = ref<ContentBody|null>(null);
        return {
            selectedReceiver,
            previewLoaded,
            paperMailPreview
        };
    }
    
});
</script>