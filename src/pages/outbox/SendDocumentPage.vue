<template>
    <q-page class="q-px-xl">
            
        <q-dialog v-model="recommendationDrawerOpen" position="right" maximized persistent  no-shake  transition-show="none"
  transition-hide="none">
        <q-card style="width: 400px; max-width: 90vw;" class="height-100-titlebar padding-top-titlebar material-card material-card-filled">
            <div class="flex-column h-100">
                <div class="row w-100">
                    <div class="col text-center">
                        <div class="text-h5 q-pa-md">
                            Vorschläge
                        </div>
                    </div>
                    <div class="col-2 text-right">
                        <q-btn icon="close" flat round dense class="q-mr-md q-mt-md" @click="recommendationDrawerOpen = false" />
                    </div>
                </div>
                <q-card-section class="flex-1 overflow-auto">
                <div class="text-muted q-mb-md" v-if="recommendations.length > 0">
                    Wir können für das Dokument folgende Empfehlungen geben. Wähle die Empfehlungen aus, die du übernehmen möchtest, und klicke auf Übernehmen.                  
                </div>
                <div>
                   <RecommendationItemSelection
                    @select="selectRecommendations($event)"
                    :selectedRecommendations="selectedRecommendations"
                    :recommendations="recommendations" />
                </div>
                </q-card-section>

                <q-card-section>
                </q-card-section>
                <q-separator />

                <q-card-actions align="right">
                <q-btn flat label="Schließen" @click="rejectAllRecommendations()" />
                <q-btn outline color="secondary" label="Übernehmen" @click="acceptSelectedRecommendations()" />
                </q-card-actions>
                
            </div>
        </q-card>
        </q-dialog>
        <SendConfirmDialog
            :data="confirmData"
            v-model="sendConfirmDialogOpen"
            @confirm="onSendConfirm($event)"
            :apiId="apiId"
            />

        <div class="text-h4 q-mb-xl">
            Dokument versenden
        </div>
        <q-separator class="q-mb-xl" />
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
                    
                    <div class="float-right q-mt-md">
                        <q-btn color="secondary" 
                        @click="showAddReceiverModal = true"
                        outline>
                        <q-icon name="add" />
                    </q-btn>
                    </div>
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
                                            <div class="row">
                                                <div color="col-3">
                                                <q-icon 
                                                size="md"
                                                    :name="receiver.existsBrifle === true ? 'check' : (receiver.existsBrifle === false ? 'close' : 'help')" 
                                                    :color="receiver.existsBrifle === true ? 'green' : (receiver.existsBrifle === false ? 'red' : 'grey')"
                                                />
                                                </div>
                                                <div class="col">
                                                    <q-btn 
                                                    icon="delete" 
                                                    flat 
                                                    dense 
                                                    color="red"
                                                    @click.stop="receivers.splice(index, 1)"
                                                />
                                                </div>
                                            </div>
                                            
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

                    <div class="row">
                        <div class="col-6">                            

                        </div>
                        <div class="col-6">
                            <div class="text-right q-mt-md">
                                <q-btn color="secondary" text-color="green-9"
                                @click="checkReceivers()"

                                >Prüfen</q-btn>                                
                            </div>
                        </div>

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
                            <q-separator class="q-my-md" />
                        <div class="row">
                            <div class="col-12 q-px-md" v-if="canAttachInvoice">
                                <q-toggle 
                                    v-model="attachInvoiceData"
                                    color="secondary"
                                />
                                <span class="q-ml-md">Rechnungsdaten anhängen (nur für Dokumententyp Rechnung)</span>
                            </div>
                            <div class="col-12 q-px-md" v-if="canAttachSignature">
                                <q-toggle 
                                    v-model="attachSignatureData"
                                    color="secondary"
                                />
                                <span class="q-ml-md">Signaturdaten anhängen (nur für Dokumententyp Vertrag)</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="q-mt-lg" v-if="showInvoiceDataOption"> 
                    <!-- invoice data options -->
                    <div class="material-card q-pa-md rounded-borders">
                        <div class="text-h6 q-mt-lg q-mb-md">Rechnungsdaten</div>
                        <div class="row">
                            <div class="col-6 q-px-lg">
                                <q-input 
                                    v-model.number="paymentData.amount"
                                    label="Betrag"
                                    color="secondary"
                                    class="q-mb-md"
                                    type="number"
                                    min="0"
                                    :step="0.01"
                                />
                            </div>
                            <div class="col-6 q-px-lg">
                                <q-select
                                    v-model="paymentData.currency"
                                    :options="supportedCurrencies"
                                    label="Währung"
                                    color="secondary"
                                    class="q-mb-md" 
                                />   
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-6 q-px-lg">                              
                                <q-input v-model="paymentData.dueDate" mask="##/##/####">
                                    <template v-slot:append>
                                        <q-icon name="event" class="cursor-pointer">
                                        <q-popup-proxy cover transition-show="scale" transition-hide="scale">
                                            <q-date v-model="paymentData.dueDate" mask="DD/MM/YYYY" >
                                            <div class="row items-center justify-end">
                                                <q-btn v-close-popup label="Schließen" color="secondary" flat />
                                            </div>
                                            </q-date>
                                        </q-popup-proxy>
                                        </q-icon>
                                    </template>
                                </q-input>
                            </div>
                            <div class="col-6 q-px-lg">
                                <q-input 
                                    v-model="paymentData.reference"
                                    label="Referenznummer*"
                                    color="secondary"
                                    class="q-mb-md"
                                />   
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-12 q-px-lg">
                                <q-input 
                                    v-model="paymentData.iban"
                                    label="IBAN"
                                    color="secondary"
                                    class="q-mb-md"
                                    mask="AA## #### #### #### #### ##"
                                    fill-mask
                                    unmasked-value
                                />
                            </div>
                        </div>
                        <div class="row">
                            <div class="col-12 q-px-lg">
                                <q-input 
                                    v-model="paymentData.description"
                                    label="Beschreibung (optional, max. 100 Zeichen)"
                                    color="secondary"
                                    class="q-mb-md"                                    
                                    :maxlength="100"
                                    type="textarea"
                                />
                            </div>
                        </div>
                    </div>
                </div>
                <div class="q-mt-lg" v-if="showSignatureDataOption"> 
                    <!-- signature data options -->
                    <div class="material-card q-pa-md rounded-borders">
                        <div class="float-right">
                            <q-btn color="secondary"  outline
                                @click="showAddSignatureFieldModal = true"

                                ><q-icon name="add" size="sm" /></q-btn>                                
                        </div>
                        <div class="text-h6 q-mt-lg q-mb-md">Signaturdaten</div>
                      
                        <div class="row" v-for="(field, index) in signatureFields" :key="index+'signatureField'">                            
                                
                            <q-expansion-item
                                    class="w-100"
                                        switch-toggle-side
                                        expand-separator
                                        :label="field.fieldName"
                                    >

                                    <template v-slot:header>
                                        <q-item-section>
                                            <div class="q-pr-sm">                                               
                                                <div>{{ field.fieldName }}</div>
                                            </div>
                                        </q-item-section>
                                        <q-item-section side>
                                                 <q-btn 
                                                    icon="delete" 
                                                    flat 
                                                    dense 
                                                    color="red"
                                                    @click.stop="signatureFields.splice(index, 1)"
                                                />
                                            </q-item-section>
                                    </template>
                                    <q-item-section>
                                        <div class="row q-my-xs">
                                            <div class="col-4 q-pr-sm">
                                                Feldname:
                                            </div>
                                            <div class="col q-pl-sm">
                                                {{ field.fieldName }}
                                            </div>
                                        </div>
                                        <div class="row q-my-xs">
                                            <div class="col-4 q-pr-sm">
                                                Zweck:
                                            </div>
                                            <div class="col q-pl-sm">
                                                {{ field.purpose }}
                                            </div>
                                        </div>
                                        <div class="row q-my-xs">
                                            <div class="col-4 q-pr-sm">
                                                Rolle:
                                            </div>
                                            <div class="col q-pl-sm">
                                                {{ field.role }}
                                            </div>
                                        </div>
                                        <div class="row q-my-xs">   
                                            <div class="col-4 q-pr-sm">
                                                Unterschrift von:
                                            </div>
                                            <div class="col q-pl-sm">
                                                {{ field.signingParty === 'receiver' ? 'Empfänger' : 'Absender' }}
                                            </div>
                                        </div>
                                    </q-item-section>
                                </q-expansion-item>

                           

                        </div>
                        
                    </div>
                </div>
                <div class="q-mt-xl">
              
                    <q-btn color="secondary" 
                    class="w-100"
                    :disable="!canSend"
                    text-color="green-10" @click="sendDocument()">
                        <q-icon name="send"  />
                        <span class="q-ml-md">Dokument versenden</span>
                    </q-btn>
                    </div>
                    <div class="col-6 text-right">                      

                    </div>
            </div>
            <div class="col-8">
                <!-- Main content area for composing the document -->
                <FileDragAndDrop 
                    @drop="addFile($event)"
                />
                <!-- <img :src="firstPageImage" />   -->
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
        <AddSignatureFieldModal
            v-model="showAddSignatureFieldModal"
            @save="signatureFields.push($event)"
        />
    </q-page>
</template>

<style lang="scss">


</style>

<script lang="ts">
import { defineComponent, ref } from 'vue';

import BrifleApi from 'src/services/node/Brifle';
import { useSessionStore } from 'src/stores/session-store';

import FileDragAndDrop, { FileContent } from 'src/components/ui-elements/FileDragAndDrop.vue';
import DocumentView from 'src/components/ui-elements/DocumentView.vue';
import { BirthInformation, Content, CreateSignatureReferenceRequest, ParsedAddressResponse, ReceiverRequest, SendContentResponse } from '@brifle/brifle-sdk';
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
import AddSignatureFieldModal from './modals/AddSignatureFieldModal.vue';
import { OrcDocumentAnalysisResult } from 'app/src-electron/apis/ocr/ocrApi';
import { RecommendationRecord } from './components/recommendationItem.vue';
import RecommendationItemSelection from './components/recommendationItemSelection.vue';
import { PaymentData, SendConfirmData, SendConfirmEventData, SignatureRecord, TrackableReceiverRecord } from './util/types';
import SendConfirmDialog from './components/sendConfirmDialog.vue';
import { useAddressStore } from 'src/stores/address-store';

export default defineComponent({
    name: 'SendDocumentPage', 
    components: {
      DocumentView, FileDragAndDrop, AddReceiverModal, AddSignatureFieldModal, RecommendationItemSelection, SendConfirmDialog
    },
    props: {
       
    },
    computed: {
        canSend(): boolean {
            return this.subject.trim() !== '' && this.receivers.length > 0 && this.files.length > 0;
        },
        canAttachInvoice(): boolean {
            return this.docType === 'invoice';
        },
        canAttachSignature(): boolean {
            return this.docType === 'contract' || this.docType === 'letter';
        },
        showInvoiceDataOption(): boolean {
            return this.canAttachInvoice && this.attachInvoiceData;
        },
        showSignatureDataOption(): boolean {
            return this.canAttachSignature && this.attachSignatureData;
        },
        confirmData(): SendConfirmData{
            return {
                documentType: this.docType,
                subject: this.subject,
                receivers: this.receivers,
                paymentData: this.attachInvoiceData ? this.paymentData : undefined,
                signatureData: this.attachSignatureData ? this.signatureFields : undefined,
                allowSendingPapermail: this.allowPapermail,
                requireDeliveryConfirmation: this.requestBrifleDeliveryCertificate,
                attachInvoiceData: this.showInvoiceDataOption,
                attachSignatureData: this.showSignatureDataOption,
                content: this.files

            }
        }
    
    },
    methods: {       
        selectRecommendations(recs: RecommendationRecord[]) {
            console.log("Selected recommendations:", recs);
            this.selectedRecommendations = recs;
        },
        rejectAllRecommendations() {
            this.recommendationDrawerOpen = false;
            this.recommendations = [];
            this.selectedRecommendations = [];
            // handle rejection logic here, e.g. clear recommendations or mark them as rejected
        },
        acceptSelectedRecommendations() {
            this.recommendationDrawerOpen = false;
            this.selectedRecommendations.forEach(rec => {
                // handle acceptance logic for each selected recommendation
                // this could involve applying changes to the document, updating state, etc.
                if(rec.type === 'receiver_record') {
                    this.newRecord(rec.data as ReceiverRecord);
                }else if(rec.type === 'document_type') {
                    this.docType = rec.data as string;
                }else if(rec.type === 'signature_field') {
                    this.signatureFields.push(rec.data as SignatureRecord);
                }else if(rec.type === 'subject') {
                    this.subject = rec.data as string;
                }else if(rec.type === 'invoice_amount') {
                    this.paymentData.amount = Number(rec.data);
                }else if(rec.type === 'invoice_due_date') {
                    this.paymentData.dueDate = rec.data as string;
                }else if(rec.type === 'invoice_iban') {
                    this.paymentData.iban = rec.data as string;
                }else if(rec.type === 'invoice_reference') {
                    this.paymentData.reference = rec.data as string;
                }

            });
            this.recommendations = [];
            this.selectedRecommendations = [];
        }, 
        async fetchParsedAddress(addressString: string | null) : Promise<ParsedAddressResponse | null> {
            if (!addressString || addressString.trim() === '') {
                return null;
            }
            const trimmedAddress = addressString.trim();
            // check cache first to avoid unnecessary api calls for the same address
            if(this.addressStore.hasAddress(trimmedAddress)) {
                return this.addressStore.findAddress(trimmedAddress) || null;
            }
            return BrifleApi.address().parsePostalAddress(this.apiId, addressString).then((res)=>{
                if(res.isSuccess) {
                    this.addressStore.storeAddress(trimmedAddress, res.data as ParsedAddressResponse);
                    return res.data ?? null;
                } else {
                    throw new Error('Failed to parse address: ' + JSON.stringify(res.error));
                }
            });
        },
        async checkReceivers(){
            for(const receiver of this.receivers) {
                const birthInfo: BirthInformation = {
                    date_of_birth: receiver.dateOfBirth ?? "",
                    place_of_birth: receiver.placeOfBirth ?? "",
                    last_name: receiver.lastName ?? "",
                    given_names: receiver.firstName ?? "",  
                }
                const validBirthInfo = Object.values(birthInfo).every(value => value && value.trim() !== '');
                const addressString = this.getReceiverAddressString(receiver);
                const parsedAddress = await this.fetchParsedAddress(addressString);
                const requiredAddressFields = ['street', 'city', 'postcode', 'house_number'];
                const validAddress : boolean = parsedAddress != null && requiredAddressFields.every(field => {                        
                    const hasField = field in parsedAddress;
                    if (!hasField) {
                        console.warn(`Parsed address is missing required field: ${field}`);
                        return false;
                    }
                    const value = parsedAddress[field as keyof ParsedAddressResponse];
                    return value && value.trim() !== '';
                });
                receiver.validPostalAddress = validAddress;
                const req: ReceiverRequest = {
                    email: receiver.email ?? "",
                    first_name: receiver.firstName ?? "",
                    last_name: receiver.lastName ?? "",
                    tel: receiver.phone ?? "",
                    // parse postal address with brifle api to parse addresses into structured format                       
                } 
                if (validBirthInfo) {
                    req.birth_information = birthInfo;
                }


                if(parsedAddress != null && validAddress) {
                    req.postal_address = {
                        street: parsedAddress.street ?? "",
                        city: parsedAddress.city ?? "",
                        postcode: parsedAddress.postcode ?? "",
                        country: parsedAddress.country ?? "",
                        house_number: parsedAddress.house_number ?? "",
                        first_name: receiver.firstName ?? "",
                        last_name: receiver.lastName ?? "",                            
                    }
                    if (receiver.dateOfBirth) {
                        req.postal_address.date_of_birth = receiver.dateOfBirth;
                    }
                }
                console.log("Checking receiver with data:", req);

                void BrifleApi.content().contentCheckReceiver(this.apiId, req).then((res)=>{
                    if(res.isSuccess) {
                        receiver.existsBrifle = true;                            
                        this.$q.notify({
                            type: 'positive',
                            message: `Empfänger ${receiver.firstName} ${receiver.lastName} ist gültig`,
                            timeout: 5000
                        });
                    } else {
                        receiver.existsBrifle = false;
                        this.$q.notify({
                            type: 'negative',
                            message: `Empfänger ${receiver.firstName} ${receiver.lastName} ist ungültig: ${JSON.stringify(res.error)}`,
                            timeout: 5000
                        });
                    }
                }).catch((error)=>{
                    console.error("Error checking receiver:", error);
                    this.$q.notify({
                        type: 'negative',
                        message: `Fehler bei der Überprüfung von ${receiver.firstName} ${receiver.lastName}`,
                        timeout: 5000
                    });
                });
            }
        },
        sendDocument() {
            this.sendConfirmDialogOpen = true;  
        },
        async onSendConfirm(eventData: SendConfirmEventData) {
            console.log("Confirmed send with data:", eventData); 
            // handle the actual sending logic here, e.g. call an API to send the document with the provided data
            const signatureRefReq : CreateSignatureReferenceRequest = {
                fields: (eventData.signatureData ?? []).map(field => ({
                    name: field.fieldName,
                    purpose: field.purpose,
                    role: field.role
                }))
            }
            const requiresSignatureRef = signatureRefReq.fields.length > 0;
            if(requiresSignatureRef) {
                console.log("Creating signature reference with data:", signatureRefReq);           
                const signatureRef = await BrifleApi.signatures().createSignatureReference(this.apiId, this.tenantId, signatureRefReq);
                if(signatureRef.isSuccess) {
                    console.log("Created signature reference:", signatureRef.data);
                    // proceed with sending the document, including the signature reference ID in the payload if needed
                    const sref = signatureRef.data?.id;
                    const sendRequest = eventData.requestData
                    if(sref) {
                        for(const req of sendRequest) {
                            req.signature_info!.signature_reference = sref;
                        }
                    }
                } else {
                    console.error("Failed to create signature reference:", signatureRef.error);
                    this.$q.notify({
                        type: 'negative',
                        message: `Fehler beim Erstellen der Signaturreferenz: ${JSON.stringify(signatureRef.error)}`,
                        timeout: 5000
                    });
                }
            }

            // now handle the sending of the document with the provided data, including the signature reference if it was created successfully
            const resp = [] as SendContentResponse[];
            for(const req of eventData.requestData) {
                console.log("Sending document with request data:", req);
                try {
                    const response = await BrifleApi.content().contentSendContent(this.apiId, this.tenantId, req);
                    if(response.isSuccess) {
                        console.log("Document sent successfully:", response.data);
                        resp.push(response.data as SendContentResponse);
                    } else {
                        console.error("Failed to send document:", response.error);
                        this.$q.notify({
                            type: 'negative',
                            message: `Fehler beim Versenden des Dokuments: ${JSON.stringify(response.error)}`,
                            timeout: 5000
                        });
                    }
                } catch (error) {
                    console.error("Error sending document:", error);
                    this.$q.notify({
                        type: 'negative',
                        message: `Fehler beim Versenden des Dokuments: ${error instanceof Error ? error.message : String(error)}`,
                        timeout: 5000
                    });
                }
            }

            this.sendConfirmDialogOpen = false;
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
       async pdfPagesToPng(pdfData: Uint8Array) : Promise<string[]> {
            const bytesCopy = new Uint8Array(pdfData.length);
            bytesCopy.set(pdfData);          
            const pdf = await pdfjsLib.getDocument({data: bytesCopy}).promise;
            const numPages = pdf.numPages;
            const pageImages: string[] = [];

            for(let pageNum = 1; pageNum <= numPages; pageNum++) {
                const page = await pdf.getPage(pageNum);
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
                // PNG as base64
                pageImages.push(canvas.toDataURL("image/png"));
            }

            return pageImages;
        },
       async pdfFirstPageToPNG(pdfData: Uint8Array) : Promise<string> {
            const bytesCopy = new Uint8Array(pdfData.length);
            bytesCopy.set(pdfData);
          
            const pdf = await pdfjsLib.getDocument({data: bytesCopy}).promise;
            const page = await pdf.getPage(1);

            const scale = 4; // increase for higher resolution
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
            const toleranceCmTop = 0.85;
            const toleranceCmRight = -0.25;
            const toleranceCmBottom = 1.5;
            const toleranceCmLeft = 1.25;
            
            context!.stroke();
            // cut the rectangle area and remove the rest
            context!.clearRect(
                0, 0, canvas.width, cmToPx(4.5 - toleranceCmTop)
            );
            context!.clearRect(
                0, cmToPx(4.5 - toleranceCmTop), cmToPx(2.3 - toleranceCmLeft), canvas.height
            );
            context!.clearRect(
                cmToPx(2.3 + 9 + toleranceCmRight), cmToPx(4.5 - toleranceCmTop), canvas.width, canvas.height
            );
            context!.clearRect(
                0, cmToPx(4.5 + 4.5 + toleranceCmBottom), canvas.width, canvas.height
            );           

            // PNG as base64
            return canvas.toDataURL("image/png");
            },
        runOcrAnalysis(content: string[]) : Promise<RecommendationRecord[]> {
             return this.ocrService.performDocumentAnalysisOnBase64Data(content).then((result: OrcDocumentAnalysisResult)=>{
                this.recommendationDrawerOpen = true;
                const recs: RecommendationRecord[] = [];
                let type = "";
                const typeDectionKeys = Object.keys(result.typeDetection);
                let typeDetectionScore = 0;
                for (const key of typeDectionKeys) {
                    const rec = result.typeDetection[key];
                    if(rec?.isMatch && rec?.score > typeDetectionScore) {
                        type = key;
                        typeDetectionScore = rec.score;
                    }
                }
                if(type.length > 0) {
                    const recRecord: RecommendationRecord = {
                        type: 'document_type',
                        data: type
                    }
                    const hasTypeRecommendation = recs.some(rec => rec.type === 'document_type');
                    if(!hasTypeRecommendation) {
                        recs.push(recRecord);
                    }
                }
                if(type === 'invoice' && result.invoiceDetection) {
                    const iban = result.invoiceDetection.ibans.length > 0 ? result.invoiceDetection.ibans[0] : null;
                    const invoiceNumber = result.invoiceDetection.invoiceNumber.trim() !== '' ? result.invoiceDetection.invoiceNumber : null;
                    const amount = this.detectInvoiceAmount(result.invoiceDetection.amounts);
                    this.attachInvoiceData = true; // if it is an invoice, show the option to attach invoice data by default since we have some data to attach
                    if(iban) {
                        const ibanRecord: RecommendationRecord = {
                            type: 'invoice_iban',
                            data: iban
                        }
                        recs.push(ibanRecord);
                    }
                    if(invoiceNumber) {
                        const invoiceNumberRecord: RecommendationRecord = {
                            type: 'invoice_reference',
                            data: invoiceNumber
                        }
                        const subjectRecord: RecommendationRecord = {
                            type: 'subject',
                            data: `Rechnung ${invoiceNumber}`
                        }
                        recs.push(invoiceNumberRecord);
                        recs.push(subjectRecord);
                    }
                    if(amount) {
                        const amountRecord: RecommendationRecord = {
                            type: 'invoice_amount',
                            data: amount
                        }
                        recs.push(amountRecord);
                    }

                }


                return recs;
            }).catch((error)=>{
                console.error("Error performing document analysis OCR:", error);
                return [];
            });
        },
        detectInvoiceAmount(amounts: string[]) : string | null {
            if (amounts.length === 0) {
                return null;
            }
            const clearedAmounts = amounts.map(amount => amount.replace(/\s/g, '').replace(/[^0-9,.-]/g, '').replace(',', '.'));
            const occuranceCount: Record<string, number> = {};
            clearedAmounts.forEach(amount => {
                if(amount.trim() !== '' && !isNaN(Number(amount))) {
                    occuranceCount[amount] = (occuranceCount[amount] || 0) + 1;
                }
            });
            let maxCount = 0;
            let mostFrequentAmount = null;
            let maxNumber = 0;
            for(const [amount, count] of Object.entries(occuranceCount)) {
                // if it more often in document or if is equally often but higher than current most frequent amount, set as most frequent amount
                if(count > maxCount || (count == maxCount && Number(amount) > maxNumber)) {
                    maxCount = count;
                    mostFrequentAmount = amount;
                    maxNumber = Number(amount);
                }
            }
            return mostFrequentAmount;
        },
        runAddressOcr(imageString : string): Promise<RecommendationRecord[]> {
           
            return this.ocrService.parseAddressesOrcBase64Data(imageString).then((address: OrcAddressResult)=>{            
                const requiredFields = [address.receiverAddress?.name, address.receiverAddress?.street, address.receiverAddress?.postalCode, address.receiverAddress?.city];
                const hasAllRequiredFields = requiredFields.every(field => field && field.trim() !== '');
                
                // if any required field is missing, do not add the receiver and show a notification
                if(!hasAllRequiredFields) {                   
                    return [];
                }
                
                const names = address.receiverAddress.name.split(" ");
                const lastName = names.pop() ?? "";
                // remove last name from first name
                const firstName = names.join(" ");
                const receiverRecord: ReceiverRecord = {
                    firstName,
                    lastName,
                    addressCity: address.receiverAddress.city,
                    addressStreet: address.receiverAddress.street,
                    addressCountry: 'DE',
                    addressPostcode: address.receiverAddress.postalCode      
                }
                const recRecord: RecommendationRecord = {
                    type: 'receiver_record',
                    data: receiverRecord
                }
                const recs : RecommendationRecord[] = [];
                recs.push(recRecord);
                console.log("Address recommendation from OCR analysis:", recRecord);
                return recs;
            }).catch((error)=>{
                console.error("Error performing OCR:", error);
                return [];
            });
        },
        async addFile(fileContent: FileContent[]) {
            fileContent.forEach(file => {
                this.files.push(file);
            }); 
            if (this.files.length == 1) {
                this.firstPageImage = '';
                const firstPagePromise = this
                .pdfFirstPageToPNG(this.files[0]!.content)
                .then((dataUrl)=>{
                    this.firstPageImage = dataUrl;
                    const addressRec = this.runAddressOcr(dataUrl);
                    return addressRec;
                }).catch((error)=>{
                    console.error("Error generating first page preview:", error);
                });
                const images : Promise<string[]> = this.files[0] ? this.pdfPagesToPng(this.files[0]!.content) : Promise.resolve([])
                const imagesRes = images.then((pages)=>{
                    const r = this.runOcrAnalysis(pages);
                    return r;
                }).catch((error)=>{
                    console.error("Error generating page previews:", error);
                });
                const res = await Promise.all([firstPagePromise, imagesRes])      
                // merge res arrays in one array of recommendations
                const allRecs: RecommendationRecord[] = [];
                if(res[0]) {
                    for(const rec of res[0]) {
                        if(!allRecs.some(r => JSON.stringify(r) === JSON.stringify(rec))) {
                            allRecs.push(rec);
                        }
                    }
                }
                if(res[1]) {
                    allRecs.push(...(res[1]));
                }
                this.recommendations = allRecs;

                if(this.recommendations.length > 0) {
                    this.recommendationDrawerOpen = true;
                    this.selectRecommendations(this.recommendations); // select all by default
                }
              
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
    watch: {
        recommendations(newRecs) {
            console.log("Updated recommendations:", newRecs);
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
        const receivers = ref<TrackableReceiverRecord[]>([]);
        const docType = ref<string>('letter');
        const apiKey = ref<string>('');
        const apiId = ref<string>('');
        const brifleStore = useBrifleStore();
        const account = ref<AccountData | null>(null);
        const tenantId = ref<string>('');

        const allowPapermail = ref<boolean>(false);
        const requestBrifleDeliveryCertificate = ref<boolean>(false);
        const attachInvoiceData = ref<boolean>(false);
        const attachSignatureData = ref<boolean>(false);
        const paymentData = ref<PaymentData>({
            amount: 0,
            currency: 'EUR',
            dueDate: '',
            reference: '',
            iban: ''
        });
        const supportedCurrencies = ['EUR'];
        const signatureFields = ref<SignatureRecord[]>([]);
        const showAddSignatureFieldModal = ref<boolean>(false);
        const recommendationDrawerOpen = ref<boolean>(false);
        const recommendations = ref<RecommendationRecord[]>([]);
        const selectedRecommendations = ref<RecommendationRecord[]>([]);
            
        const sendConfirmDialogOpen = ref<boolean>(false);

        const addressStore = useAddressStore();

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
            tenantId,
            attachInvoiceData,
            attachSignatureData,
            paymentData,
            supportedCurrencies,
            signatureFields,
            showAddSignatureFieldModal,
            recommendationDrawerOpen,
            recommendations,
            selectedRecommendations,
            sendConfirmDialogOpen,
            addressStore
        };
    }
});




</script>