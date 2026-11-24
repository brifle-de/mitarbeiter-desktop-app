<template>
    <div class="flex flex-col gap-6">
        <section class="ma-card">
            <h3 class="ma-title-m">{{ t('ui.bulk.overview.summary') }}</h3>
            <dl class="grid grid-cols-[240px_1fr] items-center gap-x-4 gap-y-3">
                <dt class="ma-small text-ink-muted">{{ t('ui.bulk.overview.brifleReceivers') }}</dt>
                <dd class="flex items-center gap-3">
                    <span class="ma-text-strong">{{ brifleReceivers.length }}</span>
                    <Button text size="small" :label="t('ui.bulk.common.show')" :disabled="brifleReceivers.length === 0" @click="showReceiversModal(brifleReceivers)" />
                </dd>
                <dt class="ma-small text-ink-muted">{{ t('ui.bulk.overview.externalReceivers') }}</dt>
                <dd class="flex items-center gap-3">
                    <span class="ma-text-strong">{{ externalReceivers.length }}</span>
                    <Button text size="small" :label="t('ui.bulk.common.show')" :disabled="externalReceivers.length === 0" @click="showReceiversModal(externalReceivers)" />
                </dd>
                <dt class="ma-small text-ink-muted">{{ t('ui.bulk.overview.externalAction') }}</dt>
                <dd>
                    <StatusTag v-if="actionNotBrifle.action === 'papermail'" type="post" :label="t('ui.bulk.overview.byPaperMail')" />
                    <StatusTag v-else type="test" :label="t('ui.bulk.overview.ignored')" />
                </dd>
                <dt class="ma-small text-ink-muted">{{ t('ui.bulk.subject.subject') }}</dt>
                <dd class="ma-text-strong break-words">{{ subject }}</dd>
            </dl>
        </section>

        <label class="flex items-center gap-2.5">
            <Checkbox v-model="confirmedSend" binary :disabled="hasStarted" />
            {{ t('ui.bulk.overview.confirm') }}
        </label>

        <section class="flex flex-col gap-4">
            <h3 class="ma-title-m">{{ t('ui.bulk.overview.process') }}</h3>
            <div class="flex flex-col gap-3 rounded-[12px] border border-line bg-flaeche px-5 py-4">
                <span class="ma-text-strong">{{ t('ui.bulk.progress.sentOf', { done: successItems.length + failedItems.length, total: totalDocs }) }}</span>
                <ProgressBar :value="progressPercent" :show-value="false" style="height: 8px" />
            </div>
            <div class="grid grid-cols-3 gap-4">
                <KpiCard :label="t('ui.bulk.kpi.pending')" :value="totalDocs - failedItems.length - successItems.length" />
                <KpiCard :label="t('ui.bulk.kpi.failed')" :value="failedItems.length" />
                <KpiCard :label="t('ui.bulk.kpi.sent')" :value="successItems.length" />
            </div>
        </section>

        <SendDocsModal v-model="showReceivers" :records="showReceiversRecords" />
    </div>
</template>
<script lang="ts">

import { defineComponent, PropType, ref } from 'vue';
import { SendDocReq } from '../util/receivers/receiverRecord';
import BrifleApi from 'src/services/node/Brifle';
import Sftp from 'src/services/node/Sftp';
import Files from 'src/services/node/Files';
import { useEncryptedStore } from 'src/stores/encrypted-store';

import SendDocsModal from './modal/SendDocsModal.vue';
import { SendContentRequest } from '@brifle/brifle-sdk';
import { NonExistingReceiverAction } from './NonExistingReceiversAction.vue';
import { useI18n } from 'vue-i18n';
import Button from 'openvue/button';
import Checkbox from 'openvue/checkbox';
import ProgressBar from 'openvue/progressbar';
import KpiCard from 'components/ui/KpiCard.vue';
import StatusTag from 'components/ui/StatusTag.vue';

export default defineComponent({
    name: 'SendingOverviewPage',
    // the flow's footer starts sendAll(); 'update:confirmed' reports the review checkbox
    emits: ['sent', 'update:confirmed'],
    components: {
        // eslint-disable-next-line vue/no-reserved-component-names -- OpenVue components keep their PrimeVue names
        SendDocsModal, Button, Checkbox, ProgressBar, KpiCard, StatusTag,
    },
    watch: {
        confirmedSend(value: boolean) {
            this.$emit('update:confirmed', value);
        },
    },
    computed: {
        externalReceivers(){
            return this.sendDocRecord.filter((record: SendDocReq) => {
                return record.exists === false;
            });
        },
        brifleReceivers(){
            return this.sendDocRecord.filter((record: SendDocReq) => {
                return record.exists === true;
            });
        },
        progressPercent(): number {
            if (this.totalDocs === 0) {
                return 0;
            }
            return Math.round(((this.successItems.length + this.failedItems.length) / this.totalDocs) * 100);
        },
        totalDocs(){
            if(this.actionNotBrifle.action === 'ignore') {
                return this.brifleReceivers.length;
            }else if(this.actionNotBrifle.action === 'papermail') {
                return this.externalReceivers.length + this.brifleReceivers.length; 
            }
            return this.brifleReceivers.length;
        }
    },
    props: {
        sendDocRecord: {
            type: Array<SendDocReq>,
            required: true,
        },
        tenantId: {
            type: String,
            required: true
        },
        apiId:{
            type: String,
            required: true
        },
        subject: {
            type: String,
            required: true,
        },
        actionNotBrifle: {
            type: Object as PropType<NonExistingReceiverAction>,
            required: true,
        }
    },
    methods: {
        async sendAll() {
            this.successItems = [];
            this.failedItems = [];
            this.hasStarted = true;
            for(const record of this.brifleReceivers) {
                void await this.sendItem(record);
            }
            if(this.actionNotBrifle.action === 'papermail'){
                for(const record of this.externalReceivers) {
                    void await this.sendItem(record);
                }
            }
            // all sent
            this.$emit('sent', {
                success: this.successItems,
                failed: this.failedItems,
                notBrifle: this.externalReceivers,
            });
        },
        async getContent(record: SendDocReq) {
            // get content from the record
            if(record.doc.type === 'sftp' && record.doc.filePath && record.doc.sftp) {
                return await Sftp.readFile(record.doc.filePath, record.doc.sftp, 'base64')
                
            }else if(record.doc.type === 'file' && record.doc.filePath) {
                return await Files.readFile(record.doc.filePath, 'base64');               
            }
            return null;
        },
        async sendItem(record: SendDocReq){
            // get content
            const contentBase64 = await this.getContent(record);
            const postalAddress = record.postalAddress;    
            const enableFallback = this.actionNotBrifle.action === 'papermail' && postalAddress != null;

            if(contentBase64 && record.receiver ) {
                const options : SendContentRequest = {
                    subject: this.subject,
                    to: record.receiver.req,
                    body: [
                        {
                            type: 'application/pdf',
                            content: contentBase64,
                        }
                    ],
                    type: "letter",                    
                };
                if(enableFallback) {
                    const receiverName = record.receiver.original.fullName 
                        ? record.receiver.original.fullName 
                        : record.receiver.original.firstName + ' ' + record.receiver.original.lastName;
                    options.fallback = {
                        enabled_physical_delivery: true,
                        paper_mail: {
                            cover_letter: this.actionNotBrifle.useCoverLetter ? {
                                type: this.actionNotBrifle.selectedCoverLetter?.type?? 'default',
                                name: this.actionNotBrifle.selectedCoverLetter?.name?? '',                                
                            }: undefined,
                            recipient: {
                                address_line1: receiverName,
                                address_line2: postalAddress.street,
                                city: postalAddress.city,
                                postal_code: postalAddress.postcode,
                                country: postalAddress.country,
                            },
                            test_mode: {
                                email: this.actionNotBrifle.paperMailTestEmailRecipient,
                                enabled: this.actionNotBrifle.testModePaperMail,
                            }
                        }
                    };
                }           

                void BrifleApi.content().contentSendContent(this.apiId, this.tenantId, options).then((response) => {
                    if(response && response.isSuccess) {
                        this.successItems.push(record);
                    } else {
                        console.error('Error sending content', response.error);
                        this.failedItems.push(record);
                    }
                }).catch((err) => {
                    console.error(err);
                    this.failedItems.push(record);
                });
            }else{
                this.failedItems.push(record);
                return;
            }
        },
        showReceiversModal(records: SendDocReq[]) {
            this.showReceivers = true;
            this.showReceiversRecords = records;
        },
    },
    mounted() {
      
    
    },
    setup () {
        const confirmedSend = ref(false);
        const failedItems = ref<SendDocReq[]>([]);
        const successItems = ref<SendDocReq[]>([]);
        const encryptedStore = useEncryptedStore();
        const showReceivers = ref<boolean>(false);
        const showReceiversRecords = ref<SendDocReq[]>([]);
        const hasStarted = ref<boolean>(false);
        const { t } = useI18n();
        return {
            t,
            confirmedSend,
            failedItems,
            successItems,
            encryptedStore,
            showReceivers,
            showReceiversRecords,
            hasStarted,
        };
    },
});

</script>