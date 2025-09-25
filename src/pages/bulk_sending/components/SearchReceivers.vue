<template>
    <div>
        Im folgenden wird geprüft, welche Empfänger bereits ein Brifle Konto haben. Es werden nur die Empfänger angefragt, für die auch Dokumente vorliegen.
    </div>
    <div>
        <q-btn @click="checkForExistenceClick()" color="secondary" class="q-mt-md" text-color="black">
            Empfänger Suchen              
        </q-btn>
        <div class="q-mt-sm" v-if="totalChecking > 0 && totalChecked < totalChecking">
            <div v-if="isLoading" class="q-mb-sm">
                <q-spinner size="20px" color="secondary" />
            </div>
            <span v-if="totalChecking > 0">
                {{ totalChecked }} / {{ totalChecking }}
            </span>
            <span>
                Empfänger geprüft
            </span>
        </div>
        
    </div>
    <div v-if="sendDocsRecords.length > 0">
        <q-table            
            :rows="sendDocsRecords"
            :columns="getColumns()"            
            selection="multiple"
            :row-key="(row: SendDocReq) => row.doc.filePath"
            class="q-mt-md search-receiver-table"
            flat
            bordered
            v-model:selected="selected"
        >
        <!-- template for 'exists' header -->
         <template v-slot:header-cell-exists="props">
            <q-th :props="props" class="q-mx-xl">                                                
                <q-img width="40px" src="/src/assets/electron-web-logo.png" />
                <span class="q-ml-md">Hat Brifle</span>                
            </q-th>
        </template>
        <!-- template for 'exists' cell -->
        <template v-slot:body-cell-exists="props">
            <q-td :props="props" class="text-center">
                <q-icon v-if="props.row.exists" name="check" color="green" size="xs" />
                <q-icon v-else name="close" color="red" size="xs" />
            </q-td>
        </template>
        
        </q-table>
        <div class="q-mt-md">
            <div class="row">
                <div class="col-6">
                    <div class="q-mb-md">
                        <q-btn outline color="primary" class="q-mr-sm" @click="selectAll()">
                        Alle Empfänger auswählen
                        </q-btn>
                    </div>
                    <div>
                        <q-btn color="primary" class="q-mr-sm" text-color="black" @click="selectBrifleOnly()">
                            Nur Brifle Empfänger auswählen
                        </q-btn>
                    </div>
                </div>
                <div class="col-6 text-right">
                    <q-btn outline color="grey-4" @click="selected = []">
                        Auswahl zurücksetzen
                    </q-btn>
                </div>
            </div>
            
        </div>
        <div class="q-mt-lg">
            <q-btn color="secondary" text-color="black"
            :disable="selected.length === 0"
             class="q-mr-sm" @click="emitSelectedRecords()">
                Auswahl bestätigen
            </q-btn>
        </div>
    </div>
</template>

<style lang="scss">
 
</style>

<script lang="ts">
import { defineComponent, ref } from 'vue';

import ReceiverRecord, { PostalAddress, ReceiverRecordConverter, SendDocReq } from '../util/receivers/receiverRecord';
import DocumentRecord from '../util/documents/documentRecord';
import {useBrifleStore} from 'src/stores/brifle-store';
import { useEncryptedStore } from 'src/stores/encrypted-store';
import { AccountData, ApiEndpoints } from 'app/src-electron/models/EncryptedStore';
import { useSessionStore } from 'src/stores/session-store';
import BrifleApi from 'src/services/node/Brifle';
import { ReceiverRequest } from '@brifle/brifle-sdk';
import Logger from 'src/services/node/Log';

export default defineComponent({
  name: 'SearchReceivers',
  emits: ['confirmed'],
    props: {
        receiverRecords: {
            type: Array as () => ReceiverRecord[],
            required: true,
        },
        documentRecords: {
            type: Array as () => DocumentRecord[],
            required: true,
        },
    },
    methods: {
        emitSelectedRecords() {
            this.$emit('confirmed', this.selected);
        },
        getColumns(){
            // default for birth_info
            const defaultCol = [                  
                {
                    name: 'exists',
                    label: 'Hat Brifle Konto',
                    field: (row: SendDocReq) => row.exists,
                    sortable: true,
                },
                {
                    name: 'receiverID',
                    label: 'Empfänger ID',
                    field: (row: SendDocReq) => row.receiver?.original.receiverId ?? 'Nicht vorhanden',
                    sortable: true,
                },
                {
                    name: 'receiverName',
                    label: 'Nachname',
                    field: (row: SendDocReq) => row.receiver?.req.birth_information?.last_name,
                    sortable: true,
                },
                {
                    name: 'receiverName',
                    label: 'Vorname',
                    field: (row: SendDocReq) => row.receiver?.req.birth_information?.given_names,
                    sortable: true,
                },
                {
                    name: 'receiverName',
                    label: 'Geburtsdatum',
                    field: (row: SendDocReq) => row.receiver?.req.birth_information?.date_of_birth,                    
                    sortable: true,
                    format: (val: string) => {
                        if(val) {
                            return new Date(val).toLocaleDateString('de-DE');
                        }
                        return '';
                    },
                },
                {
                    name: 'postalAddress',
                    label: 'Adresse',
                    field: (row: SendDocReq) => row.postalAddress,
                    format: (val: PostalAddress) => val ? `${val.street}, ${val.postcode} ${val.city}, ${val.country}` : '',
                    sortable: true,
                },
                 {
                    name: 'path',
                    label: 'Dateipfad',
                    field: (row: SendDocReq) => row.doc.filePath,
                    sortable: true,
                },
            ];

            return defaultCol;
        },
        computeCountryCode(row: ReceiverRecord) {
            const val = row.addressCountry ?? null;
            if( val ) {
                return val;
            }
            return "DE";
        },
        checkForExistenceClick() {
            void this.checkForExistence().catch((e) => {
                Logger.error(e);
            });
        },
        async checkForExistence() {
            
            Logger.debug("Starting to check for receiver existence...");            
            this.isLoading = true;
            Logger.debug("Start checking");
            this.userExistenceStatus.clear();
            Logger.debug("Cleared State");
            // tmp map for receiverId => receiver record
            const receiverIdMap = new Map<string, {req: ReceiverRequest, original: ReceiverRecord}>();
            Logger.debug("Created ID Map");
            Logger.debug("Mapping " + this.receiverRecords.length + " receiver records.");
            Logger.debug("Receiver Records: " + JSON.stringify(this.receiverRecords));
            this.receiverRecords.forEach(record => {  
                Logger.debug("Processing record for ID: " + record.receiverId);              
                if(!record.receiverId) {
                    return;
                }
                Logger.debug("Mapping record for ID: " + record.receiverId);
                const r = {
                    req: ReceiverRecordConverter.toReceiverRequest(record, this.receiverType),
                    original: record,
                }                
                Logger.debug("Mapped record for ID: " + record.receiverId);
                receiverIdMap.set(record.receiverId, r);
                Logger.debug("Set record for ID: " + record.receiverId);
            });
            Logger.debug("Mapping receiver IDs: " + receiverIdMap.size);
            
            
            // only check for receivers that have a at least one document
            const checkForIds = this.documentRecords.map(record => record.receiverId);
            this.totalChecking = checkForIds.length;
            this.totalChecked = 0;
            Logger.debug("Found IDs to check: " + checkForIds.join(', '));
            Logger.debug("Status check for " + this.totalChecking + " receivers.");
            Logger.debug("Status: " + this.totalChecked + " / " + this.totalChecking);            
            checkForIds.forEach(id => {
                // check if the id is in the receiverIdMap
                Logger.debug("Checking ID: " + id);
                if(receiverIdMap.has(id)) {
                    Logger.debug("Checking existence for ID: " + id);
                    const record = receiverIdMap.get(id);
                    Logger.debug("Checking Record: " + JSON.stringify(record));
                    if(record) {
                        void this.checkReceiver(record.req).then(exists => {  
                            Logger.debug("Checked existence for ID: " + id + ", exists: " + exists);                         
                            this.userExistenceStatus.set(id, exists);
                        }).catch((e) => {
                            console.error('Error checking receiver existence:', e);
                            this.userExistenceStatus.set(id, false);
                        }).finally(() => {
                            this.totalChecked++;           
                            Logger.debug("Status: " + this.totalChecked + " / " + this.totalChecking);                 
                            if(this.totalChecked >= this.totalChecking) {
                                this.sendDocsRecords = this.documentRecords.map(record => {

                                    const receiver = receiverIdMap.get(record.receiverId) ?? null;

                                    const postalAddress = receiver ? {
                                        street: receiver?.original.addressStreet ?? '',
                                        postcode: receiver?.original.addressPostcode ?? '',
                                        city: receiver?.original.addressCity ?? '',
                                        country: receiver ? this.computeCountryCode(receiver?.original) ?? 'DE' : 'DE',
                                    } : null;
                                    
                                    return {
                                        doc: record,
                                        receiver: receiverIdMap.get(record.receiverId) ?? null,
                                        postalAddress: postalAddress,
                                        exists: this.userExistenceStatus.get(record.receiverId) ?? false,
                                    };
                                }).filter(record => record.receiver != null);
                                this.isLoading = false;
                            }
                        });
                    } else {
                        Logger.debug("No record found for ID: " + id);
                        // notification
                        this.$q.notify({
                            color: 'negative',
                            message: 'Fehler beim Überprüfen des Empfängers mit ID: ' + id,
                            icon: 'error'
                        });
                        this.userExistenceStatus.set(id, false);
                        this.totalChecked++;
                        if(this.totalChecked >= this.totalChecking) {
                            this.isLoading = false;
                        }
                    }
                } else {
                    Logger.debug("No receiver found for ID: " + id);
                    // notification
                    this.$q.notify({
                        color: 'negative',
                        message: 'Kein Empfänger gefunden für ID: ' + id,
                        icon: 'error'
                    });
                    this.userExistenceStatus.set(id, false);
                    this.totalChecked++;  
                    if(this.totalChecked >= this.totalChecking) {
                            this.isLoading = false;
                    }
                }
            });            
            
        },
        async checkReceiver(receiverRecord: ReceiverRequest) : Promise<boolean> {
            return BrifleApi.content().contentCheckReceiver(this.apiId, receiverRecord)
            .then(response => {
                if(response && response.isSuccess) {
                    return response.data?.receiver != null;
                } else {
                    return false;
                }
            }).catch((e) => {
                this.$q.notify({
                    color: 'negative',
                    message: e.message || 'Fehler beim Überprüfen des Empfängers',
                    icon: 'error'
                });
                return false;
            });

        },
        selectBrifleOnly() {
            this.selected = this.sendDocsRecords.filter(record => record.exists);
        },
        selectAll() {
            this.selected = this.sendDocsRecords;
        },
    },
    mounted() {
        // get session data
        const accountId = this.session.getSelectedAccountId as string;
        // get account data
        this.account = this.encryptedStore.getAccount(accountId) ?? null;
        this.apiKey = this.account?.apiKey ?? '';
        // get api 
        if(this.account) {            
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

    setup () {    
 
    const isLoading = ref<boolean>(false);
    const userExistenceStatus = ref<Map<string, boolean>>(
        new Map<string, boolean>()
    ); 
    const totalChecked = ref<number>(0);
    const totalChecking = ref<number>(0);
    const apiKey = ref<string>('');
    const apiId = ref<string>('');
    const brifleStore = useBrifleStore();
    const encryptedStore = useEncryptedStore();
    const account = ref<AccountData | null>(null);
    const session = useSessionStore();
    const receiverType = ref<'birth_info' | 'email' | 'tel'>('birth_info');

    const sendDocsRecords = ref<SendDocReq[]>([]);
    const selected = ref<SendDocReq[]>([])

    return {
      isLoading, userExistenceStatus,
      totalChecked, totalChecking, apiKey, apiId, brifleStore,
      encryptedStore, account, session, receiverType, sendDocsRecords, selected

    };
  }
});



</script>