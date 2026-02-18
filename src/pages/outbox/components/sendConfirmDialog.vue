<template>
     <q-dialog v-model="value" position="right" maximized persistent  no-shake  transition-show="none"
  transition-hide="none">
        <q-card style="width: 500px; max-width: 90vw;" class="height-100-titlebar padding-top-titlebar material-card material-card-filled">
            <div class="flex-column h-100">
                <div class="row w-100">
                    <div class="col text-center">
                        <div class="text-h5 q-pa-md">
                            Bestätigung
                        </div>
                    </div>
                    <div class="col-2 text-right">
                        <q-btn icon="close" flat round dense class="q-mr-md q-mt-md" @click="cancel()" />
                    </div>
                </div>
                <q-card-section class="flex-1 overflow-auto">
               
                    <div v-if="page===1">
                        <div class="text-h6 q-mb-md">
                            Basis Daten
                        </div>
                        <div><strong>Art:</strong> {{ docType }}</div>
                        <div><strong>Betreff:</strong> {{ data.subject }}</div>
                        <div><strong>Empfängeranzahl:</strong> {{ data.receivers.length }}</div>
                        <div><strong>Papierbrief erlaubt:</strong> {{ data.allowSendingPapermail ? 'Ja' : 'Nein' }}</div>
                        <div class="text-h6 q-my-md">
                            Optionen
                        </div>

                        <div><strong>Zustellbestätigung erforderlich:</strong> {{ data.requireDeliveryConfirmation ? 'Ja' : 'Nein' }}</div>
                        <div><strong>Signaturanhang:</strong> {{ data.attachSignatureData ? 'Ja' : 'Nein' }}</div>
                        <div><strong>Rechnungsanhang:</strong> {{ data.attachInvoiceData ? 'Ja' : 'Nein' }}</div>
                        <template v-if="data.paymentData && data.documentType === 'invoice' && data.attachInvoiceData">
                            <div class="text-h6 q-my-md">
                                Zahlungsdaten
                            </div>
                            <div><strong>Referenz:</strong> {{ data.paymentData.reference ? data.paymentData.reference : 'Nicht angegeben' }}</div>
                            <div><strong>Betrag:</strong> {{ data.paymentData.amount }} {{ data.paymentData.currency }}</div>
                            <div><strong>IBAN:</strong> {{ formatedIban }}</div>
                            <div><strong>Fälligkeitsdatum:</strong> {{ data.paymentData.dueDate ? data.paymentData.dueDate : 'Nicht angegeben' }}</div>
                        </template>
                        <template v-if="data.signatureData && data.attachSignatureData">
                            <div class="text-h6 q-my-md">
                                Signaturdaten
                            </div>
                            <div class="q-my-md" v-for="(sig, index) in data.signatureData" :key="index">
                                <div class="text-subtitle1 q-mb-sm">Signatur {{ index + 1 }}</div>
                                <div><strong>Name:</strong> {{ sig.fieldName }}</div>
                                <div><strong>Role:</strong> {{ sig.role }}</div>
                                <div><strong>Zweck:</strong> {{ sig.purpose }}</div>
                                <div><strong>Partei:</strong> {{ sig.signingParty }}</div>
                            </div>
                        </template>
                    </div>
                    <div v-else-if="page===2" class="flex-column h-100">
                        <div class="text-h6 q-mb-md">
                            Empfänger
                        </div>
                        <div class="flex-column h-100">
                            <q-tabs
                                v-model="receiverTab"
                                dense
                                class="text-grey"
                                active-color="secondary"
                                indicator-color="secondary"
                                align="justify"
                                narrow-indicator
                                >
                                <q-tab name="brifle" label="Brifle" />
                                <q-tab name="papermail" label="Papierpost" />
                                <q-tab name="error" label="Fehler" />
                                </q-tabs>

                                <q-separator />

                                <q-tab-panels class="h-100 flex-1" v-model="receiverTab" animated>
                                <q-tab-panel name="brifle">
                                    <template v-if="receiverGroups.brifle.length > 0">
                                        <div v-for="(rec, index) in receiverGroups.brifle" :key="index+'receiver-brifle'" class="q-mb-md material-card q-pa-xs">
                                            <div><strong>{{ rec.firstName }} {{ rec.lastName }}</strong></div>
                                            <div class="row" v-if="getReceiverAddressString(rec) !== ''">
                                                <div class="col-4 q-pr-sm">
                                                    Adresse:
                                                </div>
                                                <div class="col q-pl-sm">
                                                    {{ getReceiverAddressString(rec) }}
                                                </div>
                                            </div><div class="row" v-if="rec.email">
                                                <div class="col-4 q-pr-sm">
                                                    E-Mail:
                                                </div>
                                                <div class="col q-pl-sm">
                                                    {{ rec.email }}
                                                </div>
                                            </div>
                                            <div class="row" v-if="rec.phone">
                                                <div class="col-4 q-pr-sm">
                                                    Telefon:
                                                </div>
                                                <div class="col q-pl-sm">
                                                    {{ rec.phone }}
                                                </div>
                                            </div>
                                            <div class="row" v-if="rec.dateOfBirth">
                                                <div class="col-4 q-pr-sm">
                                                    Geburtsdatum:
                                                </div>
                                                <div class="col q-pl-sm">
                                                    {{ rec.dateOfBirth }}
                                                </div>
                                            </div>
                                            <div class="row" v-if="rec.placeOfBirth">
                                                <div class="col-4 q-pr-sm">
                                                    Geburtsort:
                                                </div>
                                                <div class="col q-pl-sm">
                                                    {{ rec.placeOfBirth }}
                                                </div>
                                            </div>
                                        </div>
                                    </template>
                                    <template v-else>
                                        <div class="text-muted text-center">Keine Brifle Empfänger</div>
                                    </template>
                                </q-tab-panel>

                                <q-tab-panel name="papermail">
                                    <template v-if="receiverGroups.papermail.length > 0">
                                        <div v-for="(rec, index) in receiverGroups.papermail" :key="index+'receiver-papermail'" class="q-mb-md material-card q-pa-xs">
                                            <div><strong>{{ rec.firstName }} {{ rec.lastName }}</strong></div>
                                            <div class="row" v-if="getReceiverAddressString(rec) !== ''">
                                                <div class="col-4 q-pr-sm">
                                                    Adresse:
                                                </div>
                                                <div class="col q-pl-sm">
                                                    {{ getReceiverAddressString(rec) }}
                                                </div>
                                            </div><div class="row" v-if="rec.email">
                                                <div class="col-4 q-pr-sm">
                                                    E-Mail:
                                                </div>
                                                <div class="col q-pl-sm">
                                                    {{ rec.email }}
                                                </div>
                                            </div>
                                            <div class="row" v-if="rec.phone">
                                                <div class="col-4 q-pr-sm">
                                                    Telefon:
                                                </div>
                                                <div class="col q-pl-sm">
                                                    {{ rec.phone }}
                                                </div>
                                            </div>
                                            <div class="row" v-if="rec.dateOfBirth">
                                                <div class="col-4 q-pr-sm">
                                                    Geburtsdatum:
                                                </div>
                                                <div class="col q-pl-sm">
                                                    {{ rec.dateOfBirth }}
                                                </div>
                                            </div>
                                            <div class="row" v-if="rec.placeOfBirth">
                                                <div class="col-4 q-pr-sm">
                                                    Geburtsort:
                                                </div>
                                                <div class="col q-pl-sm">
                                                    {{ rec.placeOfBirth }}
                                                </div>
                                            </div>
                                        </div>
                                    </template>
                                    <template v-else>
                                        <div class="text-muted text-center" v-if="data.allowSendingPapermail">Keine Papierpost Empfänger</div>
                                        <div class="text-muted text-bold text-center" v-else>Papierpost Versand nicht erlaubt</div>
                                    </template>
                                </q-tab-panel>

                                <q-tab-panel name="error">
                                    <template v-if="receiverGroups.error.length > 0">
                                        <div v-for="(rec, index) in receiverGroups.error" :key="index+'receiver-error'" class="q-mb-md material-card q-pa-xs">
                                            <div><strong>{{ rec.firstName }} {{ rec.lastName }}</strong></div>
                                            <div class="row" v-if="getReceiverAddressString(rec) !== ''">
                                                <div class="col-4 q-pr-sm">
                                                    Adresse:
                                                </div>
                                                <div class="col q-pl-sm">
                                                    {{ getReceiverAddressString(rec) }}
                                                </div>
                                            </div><div class="row" v-if="rec.email">
                                                <div class="col-4 q-pr-sm">
                                                    E-Mail:
                                                </div>
                                                <div class="col q-pl-sm">
                                                    {{ rec.email }}
                                                </div>
                                            </div>
                                            <div class="row" v-if="rec.phone">
                                                <div class="col-4 q-pr-sm">
                                                    Telefon:
                                                </div>
                                                <div class="col q-pl-sm">
                                                    {{ rec.phone }}
                                                </div>
                                            </div>
                                            <div class="row" v-if="rec.dateOfBirth">
                                                <div class="col-4 q-pr-sm">
                                                    Geburtsdatum:
                                                </div>
                                                <div class="col q-pl-sm">
                                                    {{ rec.dateOfBirth }}
                                                </div>
                                            </div>
                                            <div class="row" v-if="rec.placeOfBirth">
                                                <div class="col-4 q-pr-sm">
                                                    Geburtsort:
                                                </div>
                                                <div class="col q-pl-sm">
                                                    {{ rec.placeOfBirth }}
                                                </div>
                                            </div>                                      
                                        </div>
                                    </template>
                                    <template v-else>
                                        <div class="text-muted text-center">Keine fehlerhaften Empfänger</div>
                                    </template>
                                </q-tab-panel>
                                </q-tab-panels>
                        </div>
                    </div>  
                </q-card-section>

                <q-card-section>
                </q-card-section>
                <q-separator />

                <q-card-actions align="right">
                    <div v-if="page===1">
                        
                        <q-btn class="q-mr-sm" flat label="Schließen" @click="cancel()" />
                        <q-btn outline color="secondary" label="Weiter" @click="nextPage()" />

                    </div>
                    <div v-else-if="page===2">                       
                        <q-btn class="q-mr-sm" flat label="Zurück" @click="previousPage()" />
                        <q-btn outline color="secondary" label="Senden" @click="confirm()" />
                    </div>
                </q-card-actions>
                
            </div>
        </q-card>
        </q-dialog>
</template>
<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { SendConfirmData, SendConfirmEventData, TrackableReceiverRecord } from '../util/types';
import ReceiverRecord from 'src/pages/bulk_sending/util/receivers/receiverRecord';
import { BirthInformation, FallbackOptions, ParsedAddressResponse, ReceiverRequest, SendContentRequest } from '@brifle/brifle-sdk';
import { useAddressStore } from 'src/stores/address-store';
import BrifleApi from 'src/services/node/Brifle';

export default defineComponent({
    name: 'SendConfirmDialog',
    props: {        
        modelValue: {
            type: Boolean,
            default: false,
        },
        data: {
            type: Object as PropType<SendConfirmData>,
            required: true,
        },
        apiId: {
            type: String,
            required: true,
        }
        
    },
    computed: {
        receiverGroups(): { brifle: TrackableReceiverRecord[]; papermail: TrackableReceiverRecord[]; error: TrackableReceiverRecord[] } {
            const groups = {
                brifle: [] as TrackableReceiverRecord[],
                papermail: [] as TrackableReceiverRecord[],
                error: [] as TrackableReceiverRecord[]
            };
            for (const rec of this.data.receivers) {
                if (rec.existsBrifle === true) {
                    groups.brifle.push(rec);
                } else if (rec.existsBrifle === false && this.data.allowSendingPapermail && rec.validPostalAddress) {
                    groups.papermail.push(rec);
                } else {
                    groups.error.push(rec);
                }
            }
            
            return groups;
        },
        value: {
            get() {
                return this.modelValue;
            },
            set(value: boolean) {
                this.$emit('update:modelValue', value);
            }
        },
        formatedIban(): string {
            if (this.data.paymentData?.iban) {
                return this.data.paymentData.iban.replace(/(.{4})/g, '$1 ').trim();
            }
            return '';
        },
        docType(): string {
            switch (this.data.documentType) {
                case 'invoice':
                    return 'Rechnung';
                case 'letter':
                    return 'Brief';
                case 'contract':
                    return 'Vertrag';
                default:
                    return this.data.documentType;
            }
        }
    },
    emits: ['confirm', 'cancel', 'update:modelValue'],  
    methods: {
        uint8ToBase64(uint8: Uint8Array): string {
            let binary = "";
            const len = uint8.byteLength;
            for (let i = 0; i < len; i++) {
                binary += String.fromCharCode(uint8[i]!);
            }
            return btoa(binary);
        },
        async getReceiverRequests(){
              const receivers: ReceiverRequest[] = [];
              for(const receiver of this.data.receivers) {
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
                receivers.push(req);
            }
            return receivers;
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
        async confirm() {
            const body : { type: 'application/pdf'; content: string;}[] = this.data.content.map(file => ({
                type: "application/pdf",
                content: this.uint8ToBase64(file.content)
            }));
            const requests : SendContentRequest[] = [];
            const receiverReqs = await this.getReceiverRequests();            
            for(const receiverTo of receiverReqs) {
                const fallback : FallbackOptions = {
                    enabled_physical_delivery: this.data.allowSendingPapermail ?? false,
                    paper_mail: {
                        test_mode:{
                            enabled: false,
                            email: ""
                        },
                        recipient: {
                            city: "",
                            country: "",
                            postal_code: "",
                            address_line1: "",
                            address_line2: "",                                                        
                        }
                    }                  
                }
                if(this.data.allowSendingPapermail && receiverTo.postal_address) {
                    fallback.paper_mail = {
                        test_mode:{
                            enabled: false,
                            email: ""
                        },
                        recipient: {
                            city: receiverTo.postal_address.city,
                            country: receiverTo.postal_address.country,
                            postal_code: receiverTo.postal_address.postcode,
                            address_line1: receiverTo.postal_address.first_name + " " + receiverTo.postal_address.last_name,
                            address_line2: receiverTo.postal_address.street + " " + receiverTo.postal_address.house_number,                                                        
                        }
                    }
                }  
                const allowPaperMail = this.data.allowSendingPapermail && receiverTo.postal_address != null;

                const req : SendContentRequest = {
                    type: this.data.documentType as 'invoice' | 'letter' | 'contract',
                    subject: this.data.subject,
                    body: body,
                    to: receiverTo,
                    delivery_certificate: this.data.requireDeliveryConfirmation ? 'aes' : 'none',                                 
                };
                if(allowPaperMail) {
                    req.fallback = fallback;
                }
                if(this.data.paymentData && this.data.documentType === 'invoice' && this.data.attachInvoiceData){
                    req.payment_info = {
                        payable: true,
                        details: {
                            // amount is in decimal format, convert to cents for the API
                            amount: Math.floor((this.data.paymentData?.amount?? 0) * 100),
                            currency: (this.data.paymentData?.currency ?? "EUR") as 'EUR',
                            iban: this.data.paymentData?.iban ?? "",
                            reference: this.data.paymentData?.reference ?? "",
                            due_date: this.data.paymentData?.dueDate?? "",
                            description: this.data.paymentData?.description ?? "",
                        }
                    }
                }
                if(this.data.signatureData && this.data.attachSignatureData){
                    const signData : {field: string;signer: "sender" | "receiver"}[] = [];
                    this.data.signatureData.forEach(sig => {
                        signData.push({
                            field: sig.fieldName,
                            signer: sig.signingParty
                        });
                    });
                    req.signature_info = {
                        signature_reference: "",
                        requesting_signer: signData
                    }
                }    
                requests.push(req);           
            }
            const eventData : SendConfirmEventData = {
                requestData: requests,
                signatureData: this.data.attachSignatureData ? this.data.signatureData : undefined
            }
            this.$emit('confirm', eventData);
            this.close();
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
        close() {
            this.value = false;
        },
        cancel() {            
            this.$emit('cancel');
            this.close();
        },
        nextPage() {
            if (this.page < this.totalPages) {
                this.page++;
            }
        },
        previousPage() {
            if (this.page > 1) {
                this.page--;
            }
        }
    },
    setup() {
        const page = ref(1);
        const totalPages = 2;
        // brifle, paper, error
        const receiverTab = ref('brifle');
        
        const addressStore = useAddressStore();
        return {
            page,
            totalPages,
            receiverTab,
            addressStore
        };
    }
});



</script>

