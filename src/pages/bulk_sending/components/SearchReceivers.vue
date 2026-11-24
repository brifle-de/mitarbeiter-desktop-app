<template>
    <div class="flex flex-col gap-4">
        <div class="flex items-center gap-4">
            <p class="flex-1 text-ink-muted">{{ t('ui.bulk.search.intro') }}</p>
            <Button severity="secondary" outlined :label="t('ui.bulk.search.start')" :loading="isLoading" @click="checkForExistenceClick()">
                <template #icon><Search :size="18" /></template>
            </Button>
        </div>
        <div v-if="totalChecking > 0 && totalChecked < totalChecking" class="flex flex-col gap-2">
            <div class="flex items-center justify-between">
                <span class="ma-text-strong">{{ t('ui.bulk.search.progress', { done: totalChecked, total: totalChecking }) }}</span>
                <ProgressSpinner v-if="isLoading" style="width: 20px; height: 20px" stroke-width="5" />
            </div>
            <ProgressBar :value="Math.round((totalChecked / totalChecking) * 100)" :show-value="false" style="height: 8px" />
        </div>
        <template v-if="sendDocsRecords.length > 0">
            <div class="grid grid-cols-3 gap-4">
                <KpiCard :label="t('ui.bulk.search.withBrifle')" :value="brifleCount" />
                <KpiCard :label="t('ui.bulk.search.withoutBrifle')" :value="sendDocsRecords.length - brifleCount" />
                <KpiCard :label="t('ui.bulk.search.selected')" :value="selected.length" :hint="t('ui.bulk.search.ofDocuments', { n: sendDocsRecords.length })" />
            </div>
            <div class="flex flex-wrap items-center gap-2">
                <Button severity="secondary" outlined size="small" :label="t('ui.bulk.search.selectAll')" @click="selectAll()">
                    <template #icon><ListChecks :size="16" /></template>
                </Button>
                <Button severity="secondary" outlined size="small" :label="t('ui.bulk.search.selectBrifleOnly')" @click="selectBrifleOnly()">
                    <template #icon><UserCheck :size="16" /></template>
                </Button>
                <div class="flex-1" />
                <Button text size="small" :label="t('ui.bulk.search.resetSelection')" @click="selected = []" />
            </div>
            <TableCard>
                <DataTable v-model:selection="selected" :value="sendDocsRecords" data-key="doc.filePath" paginator :rows="10">
                    <Column selection-mode="multiple" header-style="width: 3rem" />
                    <Column field="exists" :header="t('ui.bulk.columns.brifle')" sortable>
                        <template #body="{ data }">
                            <StatusTag :type="data.exists ? 'delivered' : 'test'" :label="data.exists ? t('ui.bulk.status.hasBrifle') : t('ui.bulk.status.noBrifle')" />
                        </template>
                    </Column>
                    <Column field="receiver.original.receiverId" :header="t('ui.bulk.columns.receiverId')" sortable>
                        <template #body="{ data }">{{ data.receiver?.original.receiverId ?? t('ui.bulk.common.notAvailable') }}</template>
                    </Column>
                    <Column field="receiver.req.birth_information.last_name" :header="t('ui.bulk.columns.lastName')" sortable />
                    <Column field="receiver.req.birth_information.given_names" :header="t('ui.bulk.columns.firstName')" sortable />
                    <Column field="receiver.req.birth_information.date_of_birth" :header="t('ui.bulk.columns.dateOfBirth')" sortable>
                        <template #body="{ data }">{{ formatBirthday(data.receiver?.req.birth_information?.date_of_birth) }}</template>
                    </Column>
                    <Column :field="addressField" :header="t('ui.bulk.columns.address')" sortable />
                    <Column field="doc.filePath" :header="t('ui.bulk.columns.filePath')" sortable>
                        <template #body="{ data }"><span class="ma-small break-all text-ink-muted">{{ data.doc.filePath }}</span></template>
                    </Column>
                </DataTable>
            </TableCard>
        </template>
    </div>
</template>
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
import BirthdayParser from 'src/utils/birthdayParser';
import { CountryCodeUtil } from 'src/utils/countryCodes';
import { useI18n } from 'vue-i18n';
import Button from 'openvue/button';
import DataTable from 'openvue/datatable';
import Column from 'openvue/column';
import ProgressBar from 'openvue/progressbar';
import ProgressSpinner from 'openvue/progressspinner';
import { ListChecks, Search, UserCheck } from 'lucide-vue-next';
import KpiCard from 'components/ui/KpiCard.vue';
import StatusTag from 'components/ui/StatusTag.vue';
import TableCard from './ui/TableCard.vue';
import { useNotify } from 'src/composables/useNotify';

export default defineComponent({
  name: 'SearchReceivers',
  components: {
     
    Button, DataTable, Column, ProgressBar, ProgressSpinner, ListChecks, Search, UserCheck, KpiCard, StatusTag, TableCard,
  },
  emits: ['confirmed', 'selection'],
  computed: {
    brifleCount(): number {
        return this.sendDocsRecords.filter(record => record.exists).length;
    },
  },
  watch: {
    selected(value: SendDocReq[]) {
        this.$emit('selection', value);
    },
  },
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
        formatBirthday(val: string | undefined) {
            if(val) {
                return BirthdayParser.parseBirthday(val)?.toLocaleDateString('de-DE') ?? '';
            }
            return '';
        },
        addressField(row: SendDocReq) {
            return this.formatAddress(row.postalAddress);
        },
        formatAddress(val: PostalAddress | null | undefined) {
            return val ? `${val.street}, ${val.postcode} ${val.city}, ${val.country}` : '';
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
        async checkFoxExistenceChunk(checkForIds: string[], receiverIdMap: Map<string, {req: ReceiverRequest, original: ReceiverRecord}>) {
            
            return Promise.all(
                checkForIds
                .sort() // keep consistent order
                .map(id => {
                const preparedId = this.ignoreLeadingZeros(id);
                // check if the id is in the receiverIdMap
                Logger.debug("Checking ID: " + preparedId);
               

                if(receiverIdMap.has(preparedId)) {
                    Logger.debug("Checking existence for ID: " + preparedId);
                    const record = receiverIdMap.get(preparedId);
                    Logger.debug("Checking Record: " + JSON.stringify(record));
                    if(record) {
                        return this.checkReceiver(record.req).then(exists => {  
                            Logger.debug("Checked existence for ID: " + preparedId + ", exists: " + exists);                         
                            this.userExistenceStatus.set(preparedId, exists);
                        }).catch((e) => {
                            console.error('Error checking receiver existence:', e);
                            this.userExistenceStatus.set(preparedId, false);
                        }).finally(() => {
                            this.totalChecked++;           
                            Logger.debug("Status: " + this.totalChecked + " / " + this.totalChecking);                
                            
                        });
                    } else {
                        Logger.debug("No record found for ID: " + preparedId);
                        // notification
                        this.notify.error(this.t('ui.bulk.errors.checkReceiverId', { id: preparedId }));
                        this.userExistenceStatus.set(preparedId, false);
                        this.totalChecked++;                       
                    }
                } else {
                    Logger.debug("No receiver found for ID: " + preparedId);
                    // notification
                    this.notify.error(this.t('ui.bulk.errors.noReceiverForId', { id: preparedId }));
                    this.userExistenceStatus.set(preparedId, false);
                    this.totalChecked++;                      
                }
            })); 
        },
        ignoreLeadingZeros(id: string) : string {
            return id.replace(/^0+/, '');
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
            
            
            // only check for receivers that have a at least one document, sort to keep order consistent
            const checkForIds = this.documentRecords.map(record => record.receiverId).sort();
 
            this.totalChecking = checkForIds.length;
            this.totalChecked = 0;
            const chunkSize = 5; // send a maximum of 5 requests in parallel to avoid rate limiting
            const chunkBatchDelay = 50; // delay between batches in ms
            Logger.debug("Found IDs to check: " + checkForIds.join(', '));
            Logger.debug("Status check for " + this.totalChecking + " receivers.");
            Logger.debug("Status: " + this.totalChecked + " / " + this.totalChecking);      
            const checkChunks = [];
            Logger.debug("Creating chunks of size " + chunkSize); 
            for (let i = 0; i < checkForIds.length; i += chunkSize) {
                checkChunks.push(checkForIds.slice(i, i + chunkSize));
            }     
            for (let chunkIndex = 0; chunkIndex < checkChunks.length; chunkIndex++) {
                const chunkIds = checkChunks[chunkIndex];
                if (chunkIds == null || chunkIds.length === 0) {
                    continue;
                }
            
                // check if the id is in the receiverIdMap
                Logger.debug("Checking for Chunk : " + (chunkIndex + 1) + " with IDs: " + chunkIds.join(', '));
                await this.checkFoxExistenceChunk(chunkIds, receiverIdMap).catch((e) => {
                    Logger.error("Error checking chunk " + (chunkIndex + 1) + ": " + e);
                });                
                // wait for a short time to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, chunkBatchDelay));
            }
            // update table
            Logger.debug("All checks done. Preparing sendDocsRecords...");            
            this.sendDocsRecords = this.documentRecords.map(record => {
                const preparedDocReceiverId = this.ignoreLeadingZeros(record.receiverId);
                const receiver = receiverIdMap.get(preparedDocReceiverId) ?? null;

                const postalAddress = receiver ? {
                    street: receiver?.original.addressStreet ?? '',
                    postcode: receiver?.original.addressPostcode ?? '',
                    city: receiver?.original.addressCity ?? '',
                    country: receiver ? this.computeCountryCode(receiver?.original) ?? 'DE' : 'DE',
                } : null;
                
                
                return {
                    doc: record,
                    receiver: receiver,
                    postalAddress: postalAddress,
                    exists: this.userExistenceStatus.get(preparedDocReceiverId) ?? false,
                };
            })
            .filter(record => record.receiver != null)
            .sort((a, b) => {
                const idA = a.receiver?.original.receiverId ?? '';
                const idB = b.receiver?.original.receiverId ?? '';
                return idA.localeCompare(idB);
            });
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
                this.notify.error(e.message || this.t('ui.bulk.errors.checkReceiver'));
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
    const { t } = useI18n();
    const notify = useNotify();

    return {
      t, notify,
      isLoading, userExistenceStatus,
      totalChecked, totalChecking, apiKey, apiId, brifleStore,
      encryptedStore, account, session, receiverType, sendDocsRecords, selected

    };
  }
});



</script>