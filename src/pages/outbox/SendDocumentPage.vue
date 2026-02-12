<template>
    <q-page class="q-px-xl">
        <div class="text-h4 q-mb-xl">
            Dokument versenden
        </div>
        <div class="row">
            <div class="col-12 col-lg-4 q-pr-xl">
                <!-- Sidebar for selecting document type, recipients, etc. -->
                 <div class="material-card q-pa-md rounded-borders">                 
                    <div class="text-h6 q-mt-lg q-mb-md">Betreff</div>
                    <q-input 
                        v-model="subject"
                        color="secondary"
                        label="Betreff des Briefes"
                    />                  
                </div>
                <div class="material-card q-pa-md rounded-borders q-mt-lg">
                    <div class="text-h6 q-mt-lg q-mb-md">Dokumententyp</div>
                    <!-- grid layout 3 cols -->
                     <div class="row q-col-gutter-md">
                        <div class="col-4">
                            <div 
                            @click="docType = 'letter'"
                            :class="'selection-item-box q-pa-md rounded-borders cursor-pointer' + (docType === 'letter' ? ' active' : '')">
                                <!-- placeholder image -->
                               <div class="text-center">
                                    <img src="~assets/img/letter.png" style="width: 100px; aspect-ratio: 1;"/>
                               </div>
                               <div class="text-center">
                                    Brief
                               </div>
                            </div>
                        </div>
                        <div class="col-4">
                            <div 
                            @click="docType = 'invoice'"
                            :class="'selection-item-box q-pa-md rounded-borders cursor-pointer' + (docType === 'invoice' ? ' active' : '')">
                               <div class="text-center">
                                    <img src="~assets/img/invoice.png" style="width: 100px; aspect-ratio: 1;"/>
                                 </div>
                               <div class="text-center">
                                    Rechnung
                               </div>
                            </div>
                        </div>
                        <div class="col-4">
                            <div 
                            @click="docType = 'contract'"
                            :class="'selection-item-box q-pa-md rounded-borders cursor-pointer' + (docType === 'contract' ? ' active' : '')">
                                <div class="text-center">
                                    <img src="~assets/img/contract.png" style="width: 100px; aspect-ratio: 1;"/>
                                </div>
                               <div class="text-center">
                                    Vertrag
                               </div>
                            </div>
                        </div>
                    </div>

                </div>
                <div class="material-card q-pa-md rounded-borders q-mt-lg">
                    <div class="text-h6 q-mt-lg q-mb-md">Empfänger</div>
                    <div class="text-muted" v-if="receivers.length === 0"> 
                        Füge einen oder mehrere Empfänger hinzu, an die das Dokument gesendet werden soll. 
                    </div>

                    <div>
                        <div v-for="(receiver, index) in receivers" :key="index+'receiver'">
                            <div class="row q-pa-sm rounded-t-borders">
                                 <q-expansion-item
                                    class="w-100"
                                        switch-toggle-side
                                        expand-separator
                                        :label="receiver.firstName + ' ' + receiver.lastName"
                                    >

                                    <template v-slot:header>
                                        <q-item-section>
                                            <div class="q-pr-sm">
                                                <div>{{ receiver.firstName }} {{ receiver.lastName }}</div>
                                                <div class="text-caption">{{ receiver.address }}</div>
                                            </div>
                                        </q-item-section>
                                        <q-item-section side>
                                                 <q-btn 
                                                    icon="delete" 
                                                    flat 
                                                    dense 
                                                    color="red"
                                                    @click.stop="receivers.splice(index, 1)"
                                                />
                                            </q-item-section>
                                    </template>
                                    <q-item-section>
                                        <div class="row">
                                            <div class="col-4 q-pr-sm">
                                                Name:
                                            </div>
                                            <div class="col q-pl-sm">
                                                {{ receiver.firstName }} {{ receiver.lastName }}
                                            </div>
                                        </div>
                                        <div class="row" v-if="getReceiverAddressString(receiver) !== ''">
                                            <div class="col-4 q-pr-sm">
                                                Adresse:
                                            </div>
                                            <div class="col q-pl-sm">
                                                {{ getReceiverAddressString(receiver) }}
                                            </div>
                                        </div>
                                            <div class="row" v-if="receiver.dateOfBirth">
                                                <div class="col-4 q-pr-sm">
                                                    Geburtsdatum:
                                                </div>
                                                <div class="col q-pl-sm">
                                                    {{ receiver.dateOfBirth }}
                                                </div>
                                            </div>
                                            <div class="row" v-if="receiver.placeOfBirth">
                                                <div class="col-4 q-pr-sm">
                                                    Geburtsort:
                                                </div>
                                                <div class="col q-pl-sm">
                                                    {{ receiver.placeOfBirth }}
                                                </div>
                                            </div>
                                            <div class="row" v-if="receiver.email">
                                                <div class="col-4 q-pr-sm">
                                                    E-Mail:
                                                </div>
                                                <div class="col q-pl-sm">
                                                    {{ receiver.email }}
                                                </div>
                                            </div>
                                            <div class="row" v-if="receiver.phone">
                                                <div class="col-4 q-pr-sm">
                                                    Telefon:
                                                </div>
                                                <div class="col q-pl-sm">
                                                    {{ receiver.phone }}
                                                </div>
                                            </div>
                                    </q-item-section>
                                </q-expansion-item>
                            </div>
                            <q-separator class="q-mt-md" />
                        </div>
                    </div>

                    <div class="text-right q-mt-md">
                        <q-btn color="secondary" 
                        @click="showAddReceiverModal = true"
                        outline>Empfänger hinzufügen</q-btn>
                    </div>
                </div>
                <div>
                    <!-- options -->
                    <div class="material-card q-pa-md rounded-borders q-mt-lg">
                        <div class="text-h6 q-mt-lg q-mb-md">Optionen</div>
                        <div class="row">
                            <div class="col-12 q-px-md">
                                <q-toggle 
                                    v-model="allowPapermail"
                                    color="secondary"
                                />
                                <span class="q-ml-md">Per Post versenden, falls digitaler Versand fehlschlägt</span>
                            </div>
                            <div class="col-12 q-px-md">
                                <q-toggle 
                                    v-model="requestBrifleDeliveryCertificate"
                                    color="secondary"
                                />
                                <span class="q-ml-md">Zustellungsbescheinigung für Digitalen Versand anfordern</span>
                               
                            </div>
                        </div>
                    </div>
                </div>
                <div class="q-mt-xl">
                    <div class="row">
                        <div class="col-6">
                            <q-btn color="secondary" text-color="green-10" @click="sendDocument()">
                                <q-icon name="send"  />
                                <span class="q-ml-md">Dokument versenden</span>
                            </q-btn>
                        </div>
                        <div class="col-6 text-right">
                            <q-btn color="secondary" outline @click="checkReceivers()">
                                <q-icon name="check"  />
                                <span class="q-ml-md">Empfänger Prüfen</span>
                            </q-btn>

                        </div>
                    </div>
                </div>
            </div>
            <div class="col-8">
                <!-- Main content area for composing the document -->
                <FileDragAndDrop 
                    @drop="addFile($event)"
                />
                <div
                 v-for="(file, index) in getPreviewContent()" 
                    :key="index+'preview_element'" class="q-mt-md rounded-borders"
                >
                    <div>
                        <!-- delete section -->
                        <div class="row q-pa-sm rounded-t-borders">
                            <div class="col-11 q-pr-sm">
                                <q-separator class="q-mt-md" />
                            </div>
                            <div class="col text-right">
                                <q-btn 
                                    icon="delete" 
                                    flat 
                                    dense 
                                    color="red"
                                    @click="files.splice(index, 1)"
                                />
                            </div>
                        </div>
                    </div>
                    <DocumentView   
                        :content="[file]"
                    />
                </div>             


            </div>
        </div>

        <AddReceiverModal 
            @save="newRecord($event)"
            v-model="showAddReceiverModal"
        />
    </q-page>
</template>

<style lang="scss">
.selection-item-box {
    background-color: #292929;
    transition: box-shadow 0.3s ease;
    border: 1px solid transparent;
    &:hover {
        background-color: #3a3a3a;
        border: 1px solid #555;
    }
    &.active {
        background-color: #343d34;
        border: 1px solid #617f54;
        &:hover {
            background-color: #3b4b3b;
            border: 1px solid #617f54;
        }
    }
}

</style>

<script lang="ts">
import { defineComponent, ref } from 'vue';

import BrifleApi from 'src/services/node/Brifle';
import { useSessionStore } from 'src/stores/session-store';

import FileDragAndDrop, { FileContent } from 'src/components/ui-elements/FileDragAndDrop.vue';
import DocumentView from 'src/components/ui-elements/DocumentView.vue';
import { BirthInformation, Content, ReceiverRequest } from '@brifle/brifle-sdk';
import OcrService, { OrcAddressResult } from 'src/services/node/OcrService';


import * as pdfjsLib from "pdfjs-dist";

// needed for Vite / modern bundlers
import pdfjsWorker from "pdfjs-dist/build/pdf.worker?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

import AddReceiverModal from './modals/AddReceiverModal.vue';
import ReceiverRecord from '../bulk_sending/util/receivers/receiverRecord';
import { AccountData, ApiEndpoints } from 'app/src-electron/models/EncryptedStore';
import { useBrifleStore } from 'src/stores/brifle-store';
import { useEncryptedStore } from 'src/stores/encrypted-store';

export default defineComponent({
    name: 'SendDocumentPage', 
    components: {
      DocumentView, FileDragAndDrop, AddReceiverModal
    },
    props: {
       
    },
    methods: {
        checkReceivers(){
                this.receivers.forEach((receiver)=>{
                    const birthInfo: BirthInformation = {
                        date_of_birth: receiver.dateOfBirth ?? "",
                        place_of_birth: receiver.placeOfBirth ?? "",
                        last_name: receiver.lastName ?? "",
                        given_names: receiver.firstName ?? "",                                                

                    }
                    const req: ReceiverRequest = {
                        email: receiver.email ?? "",
                        first_name: receiver.firstName ?? "",
                        last_name: receiver.lastName ?? "",
                        tel: receiver.phone ?? "",
                        // parse postal address with brifle api to parse addresses into structured format
                        birth_information: birthInfo
                    }
                    void BrifleApi.content().contentCheckReceiver(this.apiId, req)

                });
        },
        sendDocument() {
            
        },
        newRecord(receiver: ReceiverRecord) {
            this.receivers.push(receiver);
        },
        getReceiverAddressString(receiver: ReceiverRecord) : string {
            const parts = [
                receiver.addressStreet,
                (receiver.addressPostcode?? "" )+ " " + (receiver.addressCity?? ""),
                receiver.addressCountry
            ]
            const filteredParts = parts
                .map(part => part?.trim() ?? "")
                .filter(part => part);
            return filteredParts.join(", ");
        },
       async pdfFirstPageToPNG(pdfData: Uint8Array) : Promise<string> {

            const bytesCopy = new Uint8Array(pdfData.length);
            bytesCopy.set(pdfData);
          
            const pdf = await pdfjsLib.getDocument({data: bytesCopy}).promise;
            const page = await pdf.getPage(1);

            const scale = 2; // increase for higher resolution
            const viewport = page.getViewport({ scale });

            const canvas = document.createElement("canvas");
            const context = canvas.getContext("2d");
            canvas.width = viewport.width;
            canvas.height = viewport.height;           

            await page.render({
                canvasContext: context as CanvasRenderingContext2D,
                viewport
            }).promise;

             
            const cmToPx = (cm: number) => cm * 28.34625 * scale; // 1 cm = 28.34625 pixels at 72 DPI
        
            /*
            area for address field is
            top: 4.5 cm
            left: 2.3 cm
            width: 9 cm
            height: 4.5 cm
            add 0.1cm tolerance on each side
            */
            const toleranceCm = 0.1;
            
            context!.stroke();
            // cut the rectangle area and remove the rest
            context!.clearRect(
                0, 0, canvas.width, cmToPx(4.5 - toleranceCm)
            );
            context!.clearRect(
                0, cmToPx(4.5 - toleranceCm), cmToPx(2.3 - toleranceCm), canvas.height
            );
            context!.clearRect(
                cmToPx(2.3 + 9 + toleranceCm), cmToPx(4.5 - toleranceCm), canvas.width, canvas.height
            );
            context!.clearRect(
                0, cmToPx(4.5 + 4.5 + toleranceCm), canvas.width, canvas.height
            );
            

            // PNG as base64
            return canvas.toDataURL("image/png");
            },
        runOcr(imageString : string){
            void this.ocrService.parseAddressesOrcBase64Data(imageString).then((address: OrcAddressResult)=>{            
                const names = address.receiverAddress.name.split(" ");
                const lastName = names.pop() ?? "";
                // remove last name from first name
                const firstName = names.join(" ");
                this.receivers.push({
                    firstName,
                    lastName,
                    addressCity: address.receiverAddress.city,
                    addressStreet: address.receiverAddress.street,
                    addressCountry: 'DE',
                    addressPostcode: address.receiverAddress.postalCode      
                });
                this.$q.notify({
                    type: 'positive',
                    message: 'Addresse erkannt',
                    timeout: 5000
                });
            }).catch((error)=>{
                console.error("Error performing OCR:", error);
            });
        },
        addFile(fileContent: FileContent[]) {
            fileContent.forEach(file => {
                this.files.push(file);
            }); 
            if (this.files.length == 1) {
                this.firstPageImage = '';
                this.pdfFirstPageToPNG(this.files[0]!.content).then((dataUrl)=>{
                    void this.runOcr(dataUrl);
                    this.firstPageImage = dataUrl;
                }).catch((error)=>{
                    console.error("Error generating first page preview:", error);
                });
            }
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
        getPreviewContent() : Content[] {   
            return this.files.map((file)=>{         
                const b64encoded = this.uint8ToBase64(file.content);           
                return {
                    type: 'application/pdf', 
                    content: b64encoded
                }
            })
    },
    },
    mounted(){
        const accountId = this.sessionStore.getSelectedAccountId as string;
        // get account data
        this.account = this.encryptedStore.getAccount(accountId) ?? null;
        this.apiKey = this.account?.apiKey ?? '';
        if(this.account) {            
            this.tenantId = this.account.tenantId ?? '';
             void this.brifleStore.getApi(this.account.apiKey ?? '', ApiEndpoints.getEndpoint(this.account.apiEnv)).then(api => {
                if(api) {
                    this.apiId = api;                 
                } else {
                    this.apiKey = '';
                }
            });
        } else {
            this.apiKey = '';
            this.apiId = ''; 
        }
    },
    setup() {
        const brifleApi = new BrifleApi();
        const sessionStore = useSessionStore();
        const files = ref<FileContent[]>([]);
        const subject = ref<string>('');
        const showAddReceiverModal = ref<boolean>(false);
        const firstPageImage = ref<string>('');
        const encryptedStore = useEncryptedStore();
        const ocrService = new OcrService();
        const receivers = ref<ReceiverRecord[]>([]);
        const docType = ref<string>('letter');
        const apiKey = ref<string>('');
        const apiId = ref<string>('');
        const brifleStore = useBrifleStore();
        const account = ref<AccountData | null>(null);
        const tenantId = ref<string>('');

        const allowPapermail = ref<boolean>(false);
        const requestBrifleDeliveryCertificate = ref<boolean>(false);

            

        return {
            brifleApi,
            sessionStore,
            files,
            subject,
            showAddReceiverModal,
            firstPageImage,
            ocrService,
            receivers,
            docType,
            allowPapermail,
            requestBrifleDeliveryCertificate,
            apiKey,
            apiId,  
            brifleStore,
            account,
            encryptedStore,
            tenantId
        };
    }
});

</script>