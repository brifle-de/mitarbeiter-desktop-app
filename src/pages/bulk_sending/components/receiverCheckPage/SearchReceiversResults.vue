<template>
    <div class="flex flex-col gap-4">
        <div class="flex items-center gap-4">
            <p class="flex-1 text-ink-muted">{{ t('ui.bulk.check.resultsIntro') }}</p>
            <Button :label="t('ui.bulk.check.start')" :loading="isLoading" @click="checkForExistenceClick()">
                <template #icon><UserSearch :size="18" /></template>
            </Button>
        </div>
        <div v-if="totalChecking > 0 && totalChecked < totalChecking" class="flex flex-col gap-3 rounded-[12px] border border-line bg-flaeche px-5 py-4">
            <span class="ma-text-strong">{{ t('ui.bulk.search.progress', { done: totalChecked, total: totalChecking }) }}</span>
            <ProgressBar :value="Math.round((totalChecked / totalChecking) * 100)" :show-value="false" style="height: 8px" />
        </div>
        <template v-if="records.length > 0">
            <div class="grid grid-cols-3 gap-4">
                <KpiCard :label="t('ui.bulk.check.reachable')" :value="reachableCount" :hint="t('ui.bulk.check.reachableHint', { percent: reachablePercent })" />
                <KpiCard :label="t('ui.bulk.check.unreachable')" :value="records.length - reachableCount" :hint="t('ui.bulk.check.unreachableHint')" />
                <KpiCard :label="t('ui.bulk.check.checked')" :value="records.length" :hint="t('ui.bulk.check.checkedHint', { n: receiverRecords.length })" />
            </div>
            <SelectButton v-model="filter" :options="filterOptions" option-label="label" option-value="value" :allow-empty="false" class="self-start" />
            <TableCard>
                <DataTable :value="filteredRecords" paginator :rows="10">
                    <Column :field="nameField" :header="t('ui.bulk.columns.receiver')" sortable>
                        <template #body="{ data }">
                            <span class="flex flex-col">
                                <span class="ma-text-strong">{{ nameField(data) || '–' }}</span>
                                <span class="ma-small text-ink-muted">{{ [formatBirthday(data.original.dateOfBirth), data.original.placeOfBirth].filter(Boolean).join(' · ') || '–' }}</span>
                            </span>
                        </template>
                    </Column>
                    <Column :field="addressField" :header="t('ui.bulk.columns.address')" sortable />
                    <Column field="type" :header="t('ui.bulk.columns.checkedBy')" sortable>
                        <template #body="{ data }">{{ data.exists ? getTypeString(data.type) : '–' }}</template>
                    </Column>
                    <Column field="exists" :header="t('ui.bulk.columns.result')" sortable>
                        <template #body="{ data }">
                            <StatusTag :type="data.exists ? 'delivered' : 'error'" :label="data.exists ? t('ui.bulk.check.reachableTag') : t('ui.bulk.check.unreachableTag')" />
                        </template>
                    </Column>
                    <template #empty><span class="text-ink-muted">{{ t('ui.bulk.check.emptyFilter') }}</span></template>
                </DataTable>
            </TableCard>
        </template>
    </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';

import ReceiverRecord, { ReceiverRecordConverter, SendDocReq } from '../../util/receivers/receiverRecord';
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
import SelectButton from 'openvue/selectbutton';
import { UserSearch } from 'lucide-vue-next';
import KpiCard from 'components/ui/KpiCard.vue';
import StatusTag from 'components/ui/StatusTag.vue';
import TableCard from '../ui/TableCard.vue';
import { useNotify } from 'src/composables/useNotify';

export default defineComponent({
  name: 'SearchReceiversResults',
  // eslint-disable-next-line vue/no-reserved-component-names -- OpenVue components keep their PrimeVue names
  components: { Button, DataTable, Column, ProgressBar, SelectButton, UserSearch, KpiCard, StatusTag, TableCard },
  emits: ['confirmed'],
  computed: {
    reachableCount(): number {
        return this.records.filter(r => r.exists).length;
    },
    reachablePercent(): number {
        return this.records.length === 0 ? 0 : Math.round((this.reachableCount / this.records.length) * 100);
    },
    filterOptions(): { label: string, value: 'all' | 'reachable' | 'unreachable' }[] {
        return [
            { label: this.t('ui.bulk.check.filterAll', { n: this.records.length }), value: 'all' },
            { label: this.t('ui.bulk.check.filterReachable', { n: this.reachableCount }), value: 'reachable' },
            { label: this.t('ui.bulk.check.filterUnreachable', { n: this.records.length - this.reachableCount }), value: 'unreachable' },
        ];
    },
    filteredRecords(): ReceiverCheckRequestWithOriginal[] {
        if (this.filter === 'reachable') {
            return this.records.filter(r => r.exists);
        }
        if (this.filter === 'unreachable') {
            return this.records.filter(r => !r.exists);
        }
        return this.records;
    },
  },
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
                    return this.t('ui.bulk.check.type.birthInfo');
                case 'email':
                    return this.t('ui.bulk.check.type.email');
                case 'tel':
                    return this.t('ui.bulk.check.type.tel');
                case 'postal_address':
                    return this.t('ui.bulk.check.type.postalAddress');
                default:
                    return '';
            }
        },
        nameField(row: ReceiverCheckRequestWithOriginal) {
            return [row.original.firstName, row.original.lastName].filter(Boolean).join(' ');
        },
        addressField(row: ReceiverCheckRequestWithOriginal) {
            const val = row.req.postal_address;
            return val ? `${val.street}, ${val.postcode} ${val.city}, ${val.country}` : '';
        },
        formatBirthday(val: string | undefined) {
            if(val) {
                return BirthdayParser.parseBirthday(val)?.toLocaleDateString('de-DE') ?? '';
            }
            return '';
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
                    throw new Error(this.t('ui.bulk.errors.checkReceivers'));
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
                this.notify.error(e.message || this.t('ui.bulk.errors.checkReceiver'));
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
    const filter = ref<'all' | 'reachable' | 'unreachable'>('all');
    const { t } = useI18n();
    const notify = useNotify();

    return {
      t, notify, filter,
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