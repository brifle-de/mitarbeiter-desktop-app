<template>
    <div>
        Im folgenden wird geprüft, welche Empfänger bereits ein Brifle Konto haben. Es werden nur die Empfänger angefragt, für die auch Dokumente vorliegen.
    </div>
    <div>
        <q-btn @click="checkForExistence" color="secondary" class="q-mt-md" text-color="black">
            <span>
                Empfänger Suchen
            </span>                
        </q-btn>
        <div class="q-mt-sm" v-if="totalChecking > 0 && totalChecked < totalChecking">
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
                    name: 'path',
                    label: 'Dateipfad',
                    field: (row: SendDocReq) => row.doc.filePath,
                    sortable: true,
                },
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
                }
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
        async checkForExistence() {
            
            this.isLoading = true;
            this.userExistenceStatus.clear();
            
            // tmp map for receiverId => receiver record
            const receiverIdMap = new Map<string, {req: ReceiverRequest, original: ReceiverRecord}>();
            this.receiverRecords.forEach(record => {                
                if(!record.receiverId) {
                    return;
                }
                const r = {
                    req: ReceiverRecordConverter.toReceiverRequest(record, this.receiverType),
                    original: record,
                }
                receiverIdMap.set(record.receiverId, r);
            });
            
            // only check for receivers that have a at least one document
            const checkForIds = this.documentRecords.map(record => record.receiverId);
            this.totalChecking = checkForIds.length;
            this.totalChecked = 0;
            checkForIds.forEach(id => {
                // check if the id is in the receiverIdMap
                if(receiverIdMap.has(id)) {
                    const record = receiverIdMap.get(id);
                    if(record) {
                        void this.checkReceiver(record.req).then(exists => {                           
                            this.userExistenceStatus.set(id, exists);
                        }).catch((e) => {
                            console.error('Error checking receiver existence:', e);
                            this.userExistenceStatus.set(id, false);
                        }).finally(() => {
                            this.totalChecked++;                            
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
                            }
                        });
                    } else {
                        this.userExistenceStatus.set(id, false);
                    }
                } else {
                    this.userExistenceStatus.set(id, false);
                    this.totalChecked++;  
                }
            });            
            
        },
        async checkReceiver(receiverRecord: ReceiverRequest) : Promise<boolean> {
            return BrifleApi.content().contentCheckReceiver(this.apiId, receiverRecord)
            .then(response => {
                 console.log(response)
                if(response && response.isSuccess) {
                    return response.data?.receiver != null;
                } else {
                    return false;
                }
            }).catch(() => {
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