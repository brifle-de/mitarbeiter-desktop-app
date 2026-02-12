<template>
    <div>
        Im folgenden wird geprüft, welche Empfänger bereits ein Brifle Konto haben. Es werden nur die Empfänger angefragt, für die auch Dokumente vorliegen.
    </div>
    <div class="q-my-md">
        <div class="text-right">
            <q-btn @click="checkForExistenceClick()" color="secondary" class="q-mt-md" text-color="black">
                Empfänger Suchen              
            </q-btn>
        </div>
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
    <div v-if="records.length > 0">
        <div class="q-mt-md">
        {{ records.filter(r => r.exists).length }} von {{ records.length }} Empfängern haben ein Brifle Konto.
        </div>

        <q-table            
            :rows="records"
            :columns="getColumns()"    
            class="q-mt-md search-receiver-table"
            flat
            bordered
            v-model:selected="selected"
        >
         <template v-slot:header-cell-exists="props">
            <q-th :props="props" class="q-mx-xl">                                                
                <q-img width="40px" src="/src/assets/electron-web-logo.png" />
                <span class="q-ml-md">Hat Brifle</span>                
            </q-th>
        </template>
        <template v-slot:body-cell-exists="props">
            <q-td :props="props" class="text-center">
                <div>
                    <q-icon v-if="props.row.exists" name="check" color="green" size="xs" />
                    <q-icon v-else name="close" color="red" size="xs" />
                </div>
                <div v-if="props.row.exists">
                    <span class="text-caption q-ml-sm">Per {{ getTypeString(props.row.type) }}</span>
                </div>
            </q-td>
        </template>
        
        </q-table>
       
    </div>
</template>

<style lang="scss">
 
</style>

<script lang="ts">
import { defineComponent, ref } from 'vue';

import ReceiverRecord, { PostalAddress, ReceiverRecordConverter, SendDocReq } from '../../util/receivers/receiverRecord';
import {useBrifleStore} from 'src/stores/brifle-store';
import { useEncryptedStore } from 'src/stores/encrypted-store';
import { AccountData, ApiEndpoints } from 'app/src-electron/models/EncryptedStore';
import { useSessionStore } from 'src/stores/session-store';
import BrifleApi from 'src/services/node/Brifle';
import { ReceiverRequest } from '@brifle/brifle-sdk';
import Logger from 'src/services/node/Log';
import BirthdayParser from 'src/utils/birthdayParser';
import { CountryCodeUtil } from 'src/utils/countryCodes';

export default defineComponent({
  name: 'SearchReceiversResults',
  emits: ['confirmed'],
    props: {
        receiverRecords: {
            type: Array as () => ReceiverRecord[],
            required: true,
        },
    },
    methods: {
      
        emitSelectedRecords() {
            this.$emit('confirmed', this.selected);
        },
        getTypeString(type: string | undefined) : string {
            switch(type) {
                case 'birth_info':
                    return 'Geburtsinformationen';
                case 'email':
                    return 'E-Mail Adresse';
                case 'tel':
                    return 'Telefonnummer';
                case 'postal_address':
                    return 'Postadresse';                    
                default:
                    return '';
            }
        },
        getColumns(){
            // default for birth_info
            const defaultCol = [                  
                {
                    name: 'exists',
                    label: 'Hat Brifle Konto',
                    field: (row: ReceiverCheckRequestWithOriginal) => row.exists,
                    sortable: true,
                },
                {
                    name: 'receiverName',
                    label: 'Nachname',
                    field: (row: ReceiverCheckRequestWithOriginal) => row?.original.lastName,
                    sortable: true,
                },
                {
                    name: 'receiverName',
                    label: 'Vorname',
                    field: (row: ReceiverCheckRequestWithOriginal) => row?.original.firstName,
                    sortable: true,
                },
                {
                    name: 'receiverName',
                    label: 'Geburtsdatum',
                    field: (row: ReceiverCheckRequestWithOriginal) => row?.original.dateOfBirth,                    
                    sortable: true,
                    format: (val: string) => {
                        if(val) {
                            return BirthdayParser.parseBirthday(val)?.toLocaleDateString('de-DE');
                        }
                        return '';
                    },
                },
                {
                    name: 'postalAddress',
                    label: 'Adresse',
                    field: (row: ReceiverCheckRequestWithOriginal) => row.req.postal_address, 
                    format: (val: PostalAddress) => val ? `${val.street}, ${val.postcode} ${val.city}, ${val.country}` : '',
                    sortable: true,
                },
            ];

            return defaultCol;
        },
        computeCountryCode(row: ReceiverRecord) {
            const val = row.addressCountry ?? null;
            if( val ) {
                return CountryCodeUtil.parseCode(val)?.toString() ?? "DE";
            }
            return "DE";
        },
        checkForExistenceClick() {
            void this.checkForExistence().catch((e) => {
                Logger.error(e);
            });
        },
        async checkFoxExistenceChunk(chunkData: ReceiverRecord[]): Promise<Array<ReceiverCheckRequestWithOriginal>> {
            console.log("Checking existence for chunk of size " + chunkData.length);
            
            const receiverRequests = chunkData.map(record => ReceiverRecordConverter.toReceiverRequest(record, this.receiverType));
            console.log("receiverRequests: ", receiverRequests);
            return BrifleApi.content() 
            .contentCheckReceiverBulk(this.apiId, receiverRequests)
            .then(response => {
                console.log("Received response for chunk of size " + chunkData.length, response);
                if(response && response.isSuccess && response.data) {
                    const data : boolean[] = [];
                    const types: string[] = [];
                    if(response.data && response.data.receivers) {
                        response.data.receivers.forEach(r => {                            
                                data.push(r != null);                            
                                types.push(r?.type ?? 'null');
                        });
                    }
                    // fill up the data array to match the chunkData length (in case of missing responses)
                    for (let i = data.length; i < chunkData.length; i++) {
                        data.push(false); 
                    }
                    return chunkData.map((record, index) => {
                        return {
                            req: ReceiverRecordConverter.toReceiverRequest(record, this.receiverType),
                            original: record,
                            exists: data[index] || false,
                            type: types[index] || 'null',
                        }
                    });
                } else {
                    throw new Error('Fehler bei der Überprüfung der Empfänger');
                }
              
            })

           
        },
        ignoreLeadingZeros(id: string) : string {
            return id.replace(/^0+/, '');
        },
        async checkForExistence() {           
            Logger.debug("Starting to check for receiver existence...");            
            this.isLoading = true;
            Logger.debug("Start checking");
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
                record.receiverId = this.ignoreLeadingZeros(record.receiverId);
                Logger.debug("Mapping record for ID: " + record.receiverId);
                const r = {
                    req: ReceiverRecordConverter.toReceiverRequest(record, this.receiverType),
                    original: record,
                }                
                Logger.debug("Mapped record for ID: " + record.receiverId);
                receiverIdMap.set(this.ignoreLeadingZeros(record.receiverId), r);
                Logger.debug("Set record for ID: " + record.receiverId);
            });
            Logger.debug("Mapping receiver IDs: " + receiverIdMap.size);
            
 
            this.totalChecking = this.receiverRecords.length;
            this.totalChecked = 0;
            
            const chunkSize = 100; // send a maximum of 100 requests in parallel to avoid rate limiting
            const chunkBatchDelay = 20; // delay between batches in ms
            Logger.debug("Status check for " + this.totalChecking + " receivers.");
            Logger.debug("Status: " + this.totalChecked + " / " + this.totalChecking);      
            const checkChunks = [];
            this.records = [];
            Logger.debug("Creating chunks of size " + chunkSize); 
            for (let i = 0; i < this.receiverRecords.length; i += chunkSize) {
                checkChunks.push(this.receiverRecords.slice(i, i + chunkSize));
            }     
            for (let chunkIndex = 0; chunkIndex < checkChunks.length; chunkIndex++) {
                const chunkData = checkChunks[chunkIndex];
                if (chunkData == null || chunkData.length === 0) {
                    continue;
                }
            
                // check if the id is in the receiverIdMap
                Logger.debug("Checking for Chunk : " + (chunkIndex + 1) + " with length " + chunkData.length);
                await this
                    .checkFoxExistenceChunk(chunkData)
                    .then((result) => {
                        this.records.push(...result);
                    })
                .catch((e) => {
                    Logger.error("Error checking chunk " + (chunkIndex + 1) + ": " + e);
                })
                .finally(() => {
                    this.totalChecked += chunkData.length;
                    Logger.debug("Finished checking chunk " + (chunkIndex + 1) + ". Status: " + this.totalChecked + " / " + this.totalChecking);
                });                
                // wait for a short time to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, chunkBatchDelay));
            }
            // update table
            Logger.debug("All checks done. Preparing sendDocsRecords...");           
            
            this.isLoading = false;
            
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
  
    const totalChecked = ref<number>(0);
    const totalChecking = ref<number>(0);
    const apiKey = ref<string>('');
    const apiId = ref<string>('');
    const brifleStore = useBrifleStore();
    const encryptedStore = useEncryptedStore();
    const account = ref<AccountData | null>(null);
    const session = useSessionStore();
    const receiverType = ref<'birth_info' | 'email' | 'tel'>('birth_info');

    const records = ref<ReceiverCheckRequestWithOriginal[]>([]);
    const selected = ref<SendDocReq[]>([])

    return {
      isLoading,
      totalChecked, totalChecking, apiKey, apiId, brifleStore,
      encryptedStore, account, session, receiverType, records, selected

    };
  }
});

interface ReceiverCheckRequestWithOriginal {
    req: ReceiverRequest;
    original: ReceiverRecord;
    exists?: boolean;
    type?: string;
}

</script>