<template>
    <div class="flex min-h-0 flex-1 flex-col">
        <div class="flex flex-1 flex-col gap-6 overflow-auto px-8 py-7">
            <PageHeader :path="t('ui.bulk.run.path')" :title="templateName" :subtitle="subtitle" />
            <StepsHeader :steps="phases" :active="phase" />

            <Panel toggleable collapsed>
                <template #header>
                    <span class="flex items-center gap-2">
                        <Info :size="18" class="text-icon-brand" />
                        <span class="ma-text-strong">{{ t('ui.bulk.run.details') }}</span>
                    </span>
                </template>
                <dl class="grid grid-cols-[minmax(200px,auto)_1fr] gap-x-4 gap-y-2.5">
                    <template v-for="value in detailsListItems" :key="value.label + '_detail_item'">
                        <dt class="ma-small text-ink-muted">{{ value.label }}</dt>
                        <dd class="break-words">{{ value.value }}</dd>
                    </template>
                </dl>
            </Panel>

            <template v-if="!showReport">
                <!-- before the start -->
                <section v-if="!hasStarted" class="ma-card">
                    <EmptyState :icon="Play" :title="t('ui.bulk.run.readyTitle')" :text="t('ui.bulk.run.readyText')" />
                </section>

                <!-- reading sources and checking receivers -->
                <section v-else-if="isLoading" class="flex flex-col gap-3 rounded-[12px] border border-line bg-flaeche px-5 py-4">
                    <span class="flex items-center gap-3">
                        <ProgressSpinner style="width: 20px; height: 20px" stroke-width="5" />
                        <span class="ma-text-strong">{{ t('ui.bulk.run.loadingPreview') }}</span>
                    </span>
                    <template v-if="totalChecking > 0">
                        <span class="ma-small text-ink-muted">{{ t('ui.bulk.search.progress', { done: totalChecked, total: totalChecking }) }}</span>
                        <ProgressBar :value="Math.round((totalChecked / totalChecking) * 100)" :show-value="false" style="height: 8px" />
                    </template>
                </section>

                <!-- sending: progress, counters, per-row result -->
                <template v-else-if="isSending">
                    <section class="flex flex-col gap-3 rounded-[12px] border border-line bg-flaeche px-5 py-4">
                        <span class="ma-text-strong">{{ t('ui.bulk.progress.sentOf', { done: itemsTriedToSend.length, total: itemsToSend.length }) }}</span>
                        <ProgressBar :value="sendPercent" :show-value="false" style="height: 8px" />
                    </section>
                    <div class="grid grid-cols-4 gap-4">
                        <KpiCard :label="t('ui.bulk.kpi.sentDigital')" :value="successItems.filter(item => item.exists).length" />
                        <KpiCard :label="t('ui.bulk.kpi.byPost')" :value="successItems.filter(item => !item.exists).length" />
                        <KpiCard :label="t('ui.bulk.kpi.failed')" :value="failedItems.length" />
                        <KpiCard :label="t('ui.bulk.kpi.open')" :value="itemsToSend.length - itemsTriedToSend.length" />
                    </div>
                    <TableCard>
                        <DataTable :value="itemsToSend" paginator :rows="10" data-key="doc.filePath">
                            <Column field="receiver.original.receiverId" :header="t('ui.bulk.columns.receiver')">
                                <template #body="{ data }">
                                    <span class="flex flex-col">
                                        <span class="ma-text-strong">{{ receiverName(data) }}</span>
                                        <span class="ma-small text-ink-muted">{{ data.receiver?.original.receiverId }}</span>
                                    </span>
                                </template>
                            </Column>
                            <Column field="doc.filePath" :header="t('ui.bulk.columns.document')">
                                <template #body="{ data }"><span class="ma-small break-all">{{ data.doc.filePath }}</span></template>
                            </Column>
                            <Column :header="t('ui.bulk.columns.result')">
                                <template #body="{ data }">
                                    <StatusTag :type="rowStatus(data).type" :label="rowStatus(data).label" />
                                </template>
                            </Column>
                        </DataTable>
                    </TableCard>
                </template>

                <!-- preview of the assignment, selection -->
                <template v-else>
                    <div class="grid grid-cols-3 gap-4">
                        <KpiCard :label="t('ui.bulk.run.documents')" :value="totalItemsCount" />
                        <KpiCard :label="t('ui.bulk.run.digital')" :value="sendDocsRecords.filter(item => item.exists).length" />
                        <KpiCard
                            :label="t('ui.bulk.run.withoutBrifle')"
                            :value="sendDocsRecords.filter(item => !item.exists).length"
                            :hint="usePaperMail ? t('ui.bulk.run.withoutBrifleByPost') : t('ui.bulk.run.withoutBrifleSkipped')"
                        />
                    </div>
                    <div class="flex items-center gap-3">
                        <h2 class="ma-title-m flex-1">{{ t('ui.bulk.run.previewTitle') }}</h2>
                        <label v-tooltip.top="t('ui.bulk.run.selectAllHint')" class="flex items-center gap-2.5">
                            <ToggleSwitch v-model="selectAll" />
                            {{ t('ui.bulk.run.selectAll') }}
                        </label>
                    </div>
                    <TableCard>
                        <DataTable v-model:selection="selected" :value="sendDocsRecords" data-key="doc.filePath" paginator :rows="10">
                            <Column v-if="!selectAll" selection-mode="multiple" header-style="width: 3rem" />
                            <Column field="exists" :header="t('ui.bulk.columns.delivery')" sortable>
                                <template #body="{ data }">
                                    <StatusTag v-if="data.exists" type="delivered" :label="t('ui.bulk.status.digital')" />
                                    <StatusTag v-else-if="usePaperMail" type="post" :label="t('ui.bulk.status.byPost')" />
                                    <StatusTag v-else type="test" :label="t('ui.bulk.status.noBrifle')" />
                                </template>
                            </Column>
                            <Column :field="subjectField" :header="t('ui.bulk.subject.subject')" sortable>
                                <template #body="{ data }">{{ getSubject(data) || t('ui.bulk.run.noSubject') }}</template>
                            </Column>
                            <Column field="doc.docType" :header="t('ui.bulk.columns.docType')" sortable>
                                <template #body="{ data }">
                                    <DocTypePill :label="data.doc.docType ?? t('ui.bulk.run.unknown')" :color="pillColors[data.doc.docType ?? 'default']" />
                                </template>
                            </Column>
                            <Column field="receiver.original.receiverId" :header="t('ui.bulk.columns.receiverId')" sortable />
                            <Column field="receiver.req.birth_information.last_name" :header="t('ui.bulk.columns.lastName')" sortable />
                            <Column field="receiver.req.birth_information.given_names" :header="t('ui.bulk.columns.firstName')" sortable />
                            <Column field="receiver.req.birth_information.date_of_birth" :header="t('ui.bulk.columns.dateOfBirth')" sortable>
                                <template #body="{ data }">{{ formatBirthday(data.receiver?.req.birth_information?.date_of_birth) }}</template>
                            </Column>
                            <Column :field="addressField" :header="t('ui.bulk.columns.address')" sortable>
                                <template #body="{ data }">
                                    <span v-if="data.postalAddress">{{ addressField(data) }}</span>
                                    <span v-else class="text-ink-muted">{{ t('ui.bulk.run.noAddress') }}</span>
                                </template>
                            </Column>
                            <Column field="doc.filePath" :header="t('ui.bulk.columns.filePath')" sortable>
                                <template #body="{ data }"><span class="ma-small break-all text-ink-muted">{{ data.doc.filePath }}</span></template>
                            </Column>
                            <template #empty><span class="text-ink-muted">{{ t('ui.bulk.run.empty') }}</span></template>
                        </DataTable>
                    </TableCard>
                </template>
            </template>

            <TemplateSendReports
                v-else
                :success-records="reportSuccess"
                :error-records="reportError"
                :not-brifle-records="reportNotBrifle"
            />
        </div>

        <WizardFooter
            :cancel-label="isSending ? '' : t('ui.bulk.run.backToTemplates')"
            :next-label="nextLabel"
            :next-icon="phase === 0 ? Play : phase === 3 ? Check : Send"
            :next-disabled="!canProceed"
            :loading="isLoading || isSending"
            :hint="phase === 0 ? t('ui.bulk.run.f5Hint') : phase === 1 ? t('ui.bulk.run.selectedHint', { n: selectAll ? totalItemsCount : selected.length }) : ''"
            @cancel="backToTemplates()"
            @next="next()"
        >
            <template v-if="phase === 1" #extra>
                <Button severity="secondary" outlined :label="t('ui.bulk.run.reload')" @click="start()">
                    <template #icon><RefreshCw :size="18" /></template>
                </Button>
            </template>
        </WizardFooter>

        <Dialog v-model:visible="showConfirmationDialog" modal :header="t('ui.bulk.run.confirmTitle')" :style="{ width: '480px', maxWidth: '90vw' }">
            <div class="flex flex-col gap-4">
                <p class="text-ink-muted">{{ t('ui.bulk.run.confirmText', { n: selectAll ? totalItemsCount : selected.length }) }}</p>
                <dl class="grid grid-cols-[1fr_auto] gap-x-4 gap-y-2.5">
                    <dt>{{ t('ui.bulk.run.confirmDigital') }}</dt>
                    <dd class="ma-text-strong text-right">{{ itemsToSend.filter(item => item.exists).length }}</dd>
                    <dt>{{ t('ui.bulk.run.confirmPost') }}</dt>
                    <dd class="ma-text-strong text-right">{{ usePaperMail ? itemsToSend.filter(item => !item.exists).length : 0 }}</dd>
                </dl>
            </div>
            <template #footer>
                <Button severity="secondary" outlined :label="t('ui.bulk.common.cancel')" @click="showConfirmationDialog = false" />
                <Button :label="t('ui.bulk.run.confirm')" @click="sendDocuments()">
                    <template #icon><Send :size="18" /></template>
                </Button>
            </template>
        </Dialog>
    </div>
</template>
<script lang="ts">
import { BulkSendTemplate } from 'app/src-electron/service/send_templates/templates/template';
import SendTemplate from 'src/services/node/SendTemplate';
import { defineComponent, ref } from 'vue';
import ReceiverRecord, { PostalAddress, ReceiverRecordConverter, SendDocReceiverReq } from '../util/receivers/receiverRecord';
import { computePillColors, DocumentSource, getAllAvailableDirParsers, getSubjectPlaceholders, loadDocumentSource, loadReceiverSource, parseDocumentsAssignmentFile, parseDocumentsDirectoryFiles, readReceiversData, ReceiverSource } from '../util/helper';
import { DocumentReceiverMappingResult, DocumentSourceDirParserRules } from '../util/documents/parsers';
import Logger from 'src/services/node/Log';
import BrifleApi from 'src/services/node/Brifle';
import { ReceiverRequest, SendContentRequest } from '@brifle/brifle-sdk';
import { ApiEndpoints, ApiEnvironment, SftpData } from 'app/src-electron/models/EncryptedStore';
import { useSessionStore } from 'src/stores/session-store';
import { useEncryptedStore } from 'src/stores/encrypted-store';
import { useBrifleStore } from 'src/stores/brifle-store';
import { CountryCodeUtil } from 'src/utils/countryCodes';
import SampleParsers from '../util/receivers/sampleParsers';
import { ParsersProvider } from 'src/services/node/ParsersProvider';
import { ReceiverParser, ReceiversParserDefinition } from '../util/receivers/parsers';
import { Buffer } from 'buffer';

import hotkeys from 'hotkeys-js';
import BirthdayParser from 'src/utils/birthdayParser';
import Sftp from 'src/services/node/Sftp';
import Files from 'src/services/node/Files';

import TemplateSendReports from '../components/TemplateSendReports.vue';
import { useI18n } from 'vue-i18n';
import Button from 'openvue/button';
import Column from 'openvue/column';
import DataTable from 'openvue/datatable';
import Dialog from 'openvue/dialog';
import Panel from 'openvue/panel';
import ProgressBar from 'openvue/progressbar';
import ProgressSpinner from 'openvue/progressspinner';
import ToggleSwitch from 'openvue/toggleswitch';
import { Check, Info, Play, RefreshCw, Send } from 'lucide-vue-next';
import PageHeader from 'components/shell/PageHeader.vue';
import StepsHeader from 'components/ui/StepsHeader.vue';
import WizardFooter from 'components/ui/WizardFooter.vue';
import KpiCard from 'components/ui/KpiCard.vue';
import EmptyState from 'components/ui/EmptyState.vue';
import StatusTag, { type StatusType } from 'components/ui/StatusTag.vue';
import { useNotify } from 'src/composables/useNotify';
import TableCard from '../components/ui/TableCard.vue';
import DocTypePill from '../components/ui/DocTypePill.vue';

export default defineComponent({
    name: 'UseTemplateSendPage',
    components: {
         
        TemplateSendReports, Button, Column, DataTable, Dialog, Panel, ProgressBar, ProgressSpinner, ToggleSwitch,
        Info, RefreshCw, PageHeader, StepsHeader, WizardFooter, KpiCard, EmptyState, StatusTag, TableCard, DocTypePill,
    },
    props: {
        id: {
            type: String,
            required: true,
        }
    },
    computed: {
        usePaperMail() : boolean {
            if(!this.templateData || !this.templateData.nonExistingReceiverAction || !this.templateData.nonExistingReceiverAction.action) {
                return false;
            }
            return this.templateData.nonExistingReceiverAction.action === 'papermail';
        },
        reportSuccess() {
            return this.sendDocsRecords.filter(record => this.successItems.includes(record) && record.exists);
        },
        reportError() {
            return this.sendDocsRecords.filter(record => this.failedItems.includes(record));
        },
        reportNotBrifle() {
            return this.sendDocsRecords.filter(record => !record.exists && this.failedItems.includes(record));
        },
        totalItemsCount(){
            return this.sendDocsRecords.length;
        },
        selectedItemsCount(){
            return this.selected.length;
        },
        /** 0 load, 1 check selection, 2 sending, 3 report */
        phase(): number {
            if (this.showReport) {
                return 3;
            }
            if (this.isSending) {
                return 2;
            }
            if (this.hasStarted && !this.isLoading) {
                return 1;
            }
            return 0;
        },
        phases(): { title: string, description: string }[] {
            return ['load', 'select', 'send', 'report'].map((key) => ({
                title: this.t(`ui.bulk.run.phase.${key}`),
                description: this.t(`ui.bulk.run.phaseText.${key}`),
            }));
        },
        subtitle(): string {
            if (!this.templateData) {
                return '';
            }
            const parts = [this.getExternalReceiverActionText(this.templateData.nonExistingReceiverAction.action)];
            if (this.usePaperMail) {
                parts.push(this.templateData.nonExistingReceiverAction.testModePaperMail ? this.t('ui.bulk.run.testModeOn') : this.t('ui.bulk.run.testModeOff'));
            }
            if (this.hasStarted && !this.isLoading) {
                parts.unshift(this.t('ui.bulk.run.documentsCount', { n: this.totalItemsCount }));
            }
            return parts.join(' · ');
        },
        nextLabel(): string {
            switch (this.phase) {
                case 0: return this.t('ui.bulk.run.start');
                case 1: return this.t('ui.bulk.run.sendSelected');
                case 2: return this.t('ui.bulk.run.sending');
                default: return this.t('ui.bulk.common.done');
            }
        },
        canProceed(): boolean {
            switch (this.phase) {
                case 0: return this.canStart && !this.isLoading;
                case 1: return !((this.selected.length === 0 && !this.selectAll) || this.totalItemsCount === 0);
                case 2: return false;
                default: return true;
            }
        },
        sendPercent(): number {
            if (this.itemsToSend.length === 0) {
                return 0;
            }
            return Math.round((this.itemsTriedToSend.length / this.itemsToSend.length) * 100);
        },
        itemsTriedToSend() : SendDocReceiverReq[] {
            return [...this.successItems, ...this.failedItems];
        },
        itemsToSend() : SendDocReceiverReq[] {
            if(this.selectAll) {
                return this.sendDocsRecords;
            }
            return this.selected;
        },
        isDocumentsDirAnalysis () {
        return this.documentsSource?.destType === 'directory';
        },
        isDocumentsSFtp() {
            return this.documentsSource?.type === 'sftp';
        },
        canStart(): boolean {
            // logic to determine if the process can be started, e.g. check if templateData is loaded and valid
            return this.templateData !== null;
        },
        detailsListItems() : { label: string, value: string }[] {
            if (!this.templateData) {
                return [];
            }
            const yes = this.t('ui.bulk.common.yes');
            const no = this.t('ui.bulk.common.no');
            const na = this.t('ui.bulk.common.notAvailable');
            const action = this.templateData.nonExistingReceiverAction;
            const res = [
                { label: 'ID', value: this.templateData.id },
                { label: this.t('ui.bulk.run.detail.name'), value: this.templateData.name },
                { label: this.t('ui.bulk.run.detail.createdAt'), value: new Date(this.templateData.createdAt).toLocaleString() },
                { label: this.t('ui.bulk.run.detail.updatedAt'), value: new Date(this.templateData.updatedAt).toLocaleString() },
                { label: this.t('ui.bulk.run.detail.subjectCount'), value: (Object.keys(this.templateData.subjects.docTypes).length + 1).toString() },
                { label: this.t('ui.bulk.run.detail.nonBrifleAction'), value: this.getExternalReceiverActionText(action.action) },
                // cover letter
                { label: this.t('ui.bulk.run.detail.useCoverLetter'), value: action.useCoverLetter ? yes : no },
                { label: this.t('ui.bulk.run.detail.coverLetter'), value: action.selectedCoverLetter ? action.selectedCoverLetter.displayName : na },
                { label: this.t('ui.bulk.run.detail.testMode'), value: action.testModePaperMail ? yes : no },
                { label: this.t('ui.bulk.run.detail.testRecipient'), value: action.paperMailTestEmailRecipient ?? na },
                // sources
                { label: this.t('ui.bulk.run.detail.documentSource'), value: this.templateData.documentSource.type === 'file' ? this.t('ui.bulk.run.detail.fileValue', { file: this.templateData.documentSource.file ?? '' }) : this.templateData.documentSource.type },
                { label: this.t('ui.bulk.run.detail.receiverSource'), value: this.templateData.receiverSource.type === 'file' ? this.t('ui.bulk.run.detail.fileValue', { file: this.templateData.receiverSource.file ?? '' }) : this.templateData.receiverSource.type },
                { label: this.t('ui.bulk.run.detail.receiverParser'), value: this.templateData.receiverSource.parserId ?? na },
            ];

            if(this.templateData.documentSource.destType === 'directory'){
                res.push({ label: this.t('ui.bulk.run.detail.dirParser'), value: this.templateData.documentSource.dirParser ?? na });
            }
            return res;
        }
    },
    mounted() {
        const accountId = this.sessionStore.getSelectedAccountId as string;
        // get account data
        this.account = this.encryptedStore.getAccount(accountId) ?? null;
        this.apiKey = this.account?.apiKey ?? '';
        // get api 
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
        void this.loadReceiverParsers().then(() => {
            void this.loadTemplate();
        });
        hotkeys('f5', () => {
            if(this.canStart) {
                void this.start();
            };
        });

    },
    beforeUnmount() {
        hotkeys.unbind('f5');
    },
    setup() {
        const sessionStore = useSessionStore();
        const encryptedStore = useEncryptedStore();
        const brifleStore = useBrifleStore();
        const tenantId = ref<string>('');
        const apiId = ref<string>('');
        const apiKey = ref<string>('');
        const account = ref<null|{ tenantId?: string; apiKey?: string, apiEnv: ApiEnvironment, sftpData?: SftpData[] }>(null);
       
        const templateData = ref<BulkSendTemplate | null>(null);
        const { t } = useI18n();
        const notify = useNotify();
        const templateName = ref(t('ui.bulk.run.loadingTemplate'));
        const fileReceiverMapping = ref<DocumentReceiverMappingResult[]>([]);   
        const sendTemplateService = new SendTemplate();
        const receiverRecords = ref<ReceiverRecord[]>([]);
        const receiversSource = ref<ReceiverSource | null>(null);
        const documentsSource = ref<DocumentSource | null>(null);
        const pillColors = ref<Record<string, string>>({});
        const basePath = ref<string>('');
        const userExistenceStatus = ref<Map<string, boolean>>(
            new Map<string, boolean>()
        ); 
        const selectAll = ref<boolean>(true);
        const totalChecking = ref<number>(0);
        const totalChecked = ref<number>(0);
        const sendDocsRecords = ref<SendDocReceiverReq[]>([]);
        const selected = ref<SendDocReceiverReq[]>([])
        const parsersProvider = ref(new ParsersProvider());
        const receiverParsersRules = ref<ReceiversParserDefinition[]>(SampleParsers); 
        const showConfirmationDialog = ref<boolean>(false);
        const isSending = ref<boolean>(false);
        const showReport = ref<boolean>(false);

        const failedItems = ref<SendDocReceiverReq[]>([]);
        const successItems = ref<SendDocReceiverReq[]>([]);

        const isLoading = ref<boolean>(false);
        const hasStarted = ref<boolean>(false);

        return {
            t, notify, Play, Send, Check,
            sessionStore, encryptedStore, brifleStore, tenantId, apiId, apiKey, account, userExistenceStatus, totalChecking, totalChecked,
            templateData, templateName, fileReceiverMapping, sendTemplateService, receiverRecords, receiversSource, documentsSource, pillColors, basePath, sendDocsRecords, selected, parsersProvider,
            receiverParsersRules, selectAll, showConfirmationDialog, failedItems, successItems, isSending, showReport, isLoading, hasStarted
        };
    },
    methods: {
        next() {
            if (this.phase === 0) {
                void this.start();
            } else if (this.phase === 1) {
                this.showConfirmationDialog = true;
            } else if (this.phase === 3) {
                this.backToTemplates();
            }
        },
        backToTemplates() {
            void this.$router.push({ name: 'bulk_sending.templates' });
        },
        receiverName(record: SendDocReceiverReq): string {
            const original = record.receiver?.original;
            if (!original) {
                return '–';
            }
            return original.fullName || [original.firstName, original.lastName].filter(Boolean).join(' ') || '–';
        },
        rowStatus(record: SendDocReceiverReq): { type: StatusType, label: string } {
            if (this.successItems.includes(record)) {
                return record.exists
                    ? { type: 'delivered', label: this.t('ui.bulk.status.sent') }
                    : { type: 'post', label: this.t('ui.bulk.status.byPost') };
            }
            if (this.failedItems.includes(record)) {
                return { type: 'error', label: this.t('ui.bulk.status.failed') };
            }
            return { type: 'processing', label: this.t('ui.bulk.status.pending') };
        },
        subjectField(record: SendDocReceiverReq): string {
            return this.getSubject(record);
        },
        addressField(record: SendDocReceiverReq): string {
            const a = record.postalAddress as (PostalAddress & { housenumber?: string }) | null | undefined;
            if (!a) {
                return '';
            }
            return `${a.street} ${a.housenumber ?? ''}, ${a.postcode} ${a.city}, ${a.country}`;
        },
        formatBirthday(val: string | undefined): string {
            if (val) {
                return BirthdayParser.parseBirthday(val)?.toLocaleDateString('de-DE') ?? '';
            }
            return '';
        },
        async sendDocuments() {
            this.showConfirmationDialog = false;
            this.sendAll().then(() => {
                this.notify.success(this.t('ui.bulk.run.doneTitle'), {
                    detail: this.t('ui.bulk.run.doneText', { success: this.successItems.length, failed: this.failedItems.length }),
                });
            }).catch((err) => {
                console.error('Error sending documents', err);
                this.notify.error(this.t('ui.bulk.run.sendFailed'));
                this.showConfirmationDialog = false;
            });
        },
        async getContent(record: SendDocReceiverReq) {
            // get content from the record
            if(this.documentsSource?.type === 'sftp' && this.documentsSource && this.documentsSource.sftp?.connection) {
                return await Sftp.readFile(record.doc.filePath, this.documentsSource.sftp.connection, 'base64')
                
            }else if(this.documentsSource?.type === 'file' && record.doc.filePath) {
                return await Files.readFile(record.doc.filePath, 'base64');               
            }
            return null;
        },
        getSubject(record: SendDocReceiverReq) : string{
            if(!this.templateData) {
                return '';
            }
            const docType = record.doc.docType ?? 'default';
            const subjectsMap : Record<string, string> = {};
             Object.keys(this.templateData.subjects.docTypes).forEach(key => {
                if(this.templateData?.subjects.docTypes[key] && this.templateData.subjects.docTypes[key].length > 0) {
                    subjectsMap[key] = this.templateData.subjects.docTypes[key] ?? '';
                }
             });
             subjectsMap['default'] = this.templateData?.subjects.docTypes['default'] ? this.templateData.subjects.docTypes['default'][0] ?? '' : '';

            const subjectTemplates = this.templateData.subjects.docTypes[docType] ?? this.templateData.subjects.docTypes['default'] ?? [];
            if(subjectTemplates.length === 0) {
                return '';
            }
            // for simplicity we just take the first template, if there are multiple templates for the same doc type, we could implement a more complex logic here
            const template = subjectsMap[docType] ?? subjectsMap['default'];
            // replace placeholders in the template with actual values from the record
            // e.g. {receiverId}, {docType}, etc.
            const placeholders = getSubjectPlaceholders(record);

            let subject = template ?? '';
            Object.keys(placeholders).forEach(key => {
                subject = subject.replace('{{' + key + '}}', placeholders[key]?.toString() ?? '');
            });
            return subject;
        },
        async sendAll() {
            this.successItems = [];
            this.failedItems = [];
            this.isSending = true;       
            this.showReport = false;     
            for(const record of this.itemsToSend) {
                void await this.sendItem(record); 
            }
            // wait for 100ms to make sure that the dialog is shown
            await new Promise(resolve => setTimeout(resolve, 100));

            this.isSending = false;
            this.showReport = true;
        },
        async sendItem(record: SendDocReceiverReq){
            // get content
            const contentBase64 = await this.getContent(record);
            const postalAddress = record.postalAddress;    
            const nonExistingReceiverAction = this.templateData?.nonExistingReceiverAction;
            const enableFallback = nonExistingReceiverAction?.action === 'papermail' && postalAddress != null;
            const subject = this.getSubject(record);

            if(contentBase64 && record.receiver ) {
                const options : SendContentRequest = {
                    subject: subject,
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
                            cover_letter: nonExistingReceiverAction.useCoverLetter ? {
                                type: nonExistingReceiverAction.selectedCoverLetter?.type?? 'default',
                                name: nonExistingReceiverAction.selectedCoverLetter?.name?? '',                                
                            }: undefined,
                            recipient: {
                                address_line1: receiverName,
                                address_line2: postalAddress.street,
                                city: postalAddress.city,
                                postal_code: postalAddress.postcode,
                                country: postalAddress.country,
                            },
                            test_mode: {
                                email: nonExistingReceiverAction.paperMailTestEmailRecipient,
                                enabled: nonExistingReceiverAction.testModePaperMail,
                            }
                        }
                    };
                }           

                return BrifleApi.content().contentSendContent(this.apiId, this.tenantId, options).then((response) => {
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
        async start(){
            if(!this.canStart || !this.templateData) {
                return;
            }
            this.isLoading = true;
            this.hasStarted = true;
            // parse documents and receivers, check for existence and prepare sendDocsRecords
            this.fileReceiverMapping = await this.parseDocuments() ?? [];
            this.pillColors = computePillColors(this.fileReceiverMapping);
            // parse receivers file and map to documents
            await this.parseReceiversFile();
            // check for existence of receivers and prepare sendDocsRecords
            await this.checkForExistence();

            this.isLoading = false;
        },
        getExternalReceiverActionText(action: string) {
            switch (action) {
                case 'paper_mail':
                case 'papermail':
                    return this.t('ui.bulk.templates.actionPaperMail');
                case 'skip':
                case 'ignore':
                    return this.t('ui.bulk.templates.actionSkip');
            }
            return action;
        },
        async loadTemplate() {
            try {                
                const template = await this.sendTemplateService.getTemplate(this.id);
                this.templateName = template.name;
                this.templateData = template;
                const availableDirParsers : {id: string, name: string, rules: DocumentSourceDirParserRules}[] = getAllAvailableDirParsers();
                // set source and document source
                this.receiversSource = loadReceiverSource(template, this.account?.sftpData ?? []);
                this.documentsSource = loadDocumentSource(template,availableDirParsers, this.account?.sftpData ?? []);
                
            } catch (error) {
                console.error('Fehler beim Laden der Vorlage:', error);
                this.templateName = this.t('ui.bulk.edit.loadFailed');
            }
        },
        // TODO: move to helper class since it will be used in multiple places
        parseDocuments() {
            let res: Promise<DocumentReceiverMappingResult[] | undefined>;
            if(this.isDocumentsDirAnalysis) {
                res = parseDocumentsDirectoryFiles(this.documentsSource);

            } else {
                res = this.parseDocumentsAssignmentFile();
            }
            
            return res;

        },  
        async checkReceiver(receiverRecords: ReceiverRequest[]) : Promise<boolean[]> {
            return BrifleApi.content().contentCheckReceiverBulk(this.apiId, receiverRecords)
            .then(response => {
                if(response && response.isSuccess) {
                    return response.data?.receivers.map((r: unknown) => r != null) ?? [];
                } else {
                    return [];
                }
            }).catch((e) => {
                this.notify.error(e.message || this.t('ui.bulk.errors.checkReceiver'));
                return [];
            });

        },
    async readReceiversFile(encoding: BufferEncoding) : Promise<string> {
        if(this.receiversSource){
            const result = await readReceiversData(this.receiversSource, encoding);
            return result ?? '';
        }
        return "";
        

    },
    loadReceiverParsers(){
        let rules = SampleParsers
        return this.parsersProvider.getReceiversParsers().then((parsers) => {
            const customParsers = Object.values(parsers);
            rules = rules.concat(customParsers);  
            this.receiverParsersRules = rules;         
        }).catch((err: Error) => {
            console.error('Error fetching custom parsers:', err);
            this.notify.error(this.t('ui.bulk.errors.loadParsers'));
        });    
    },
    loadParser(idOrName: string) {
        const found = this.receiverParsersRules.find((rule) => rule.name === idOrName || rule.id === idOrName);
        return found ?? null;
    },
    async parseReceiversFile() {        
        if(!this.receiversSource?.parserId){
            console.error('No parser selected');
            return;
        }
        const parser = this.loadParser(this.receiversSource.parserId);
        if(!parser) {
            console.error('Selected parser not found: ' + this.receiversSource.parserId);
            this.notify.error(this.t('ui.bulk.errors.parserNotFound'));
            return;
        }
        const fileContent = await this.readReceiversFile(parser.rules.encoding); 
        const buffer = new TextEncoder().encode(fileContent);
        // text encoder users utf-8 therefore override the encoding in rules to utf-8,
        //  use deep copy to avoid modifying original rules and cause conflicts
        const rulesCopy = JSON.parse(JSON.stringify(parser.rules));
        rulesCopy.encoding = 'utf-8';
        this.receiverRecords = ReceiverParser.parse(Buffer.from(buffer), rulesCopy); 
        console.log('Parsed receiver records: ', this.receiverRecords);
    },
        async checkForExistence() {           
            Logger.debug("Starting to check for receiver existence...");      
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
                    req: ReceiverRecordConverter.toDynamicRequest(record),
                    original: record,
                }                
                Logger.debug("Mapped record for ID: " + record.receiverId);
                receiverIdMap.set(this.ignoreLeadingZeros(record.receiverId), r);
                Logger.debug("Set record for ID: " + record.receiverId);
            });
            Logger.debug("Mapping receiver IDs: " + receiverIdMap.size);
            console.log("Receiver ID Map: ", receiverIdMap);
            
            
            // only check for receivers that have a at least one document, sort to keep order consistent
            const checkForIds = this.fileReceiverMapping.map(record => record.receiverId).sort();
            
 
            this.totalChecking = checkForIds.length;
            this.totalChecked = 0;
            const chunkSize = 50; // send a maximum of 25 requests in parallel to avoid rate limiting
            const chunkBatchDelay = 20; // delay between batches in ms
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
                await this.checkForExistenceChunk(chunkIds, receiverIdMap).catch((e) => {
                    Logger.error("Error checking chunk " + (chunkIndex + 1) + ": " + e);
                });                
                // wait for a short time to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, chunkBatchDelay));
            }
            // update table
            Logger.debug("All checks done. Preparing sendDocsRecords...");            
            this.sendDocsRecords = this.fileReceiverMapping.map(record => {
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
        
                    
            
        },
        computeCountryCode(row: ReceiverRecord) {
            const val = row.addressCountry ?? null;
            if( val ) {
                return CountryCodeUtil.parseCode(val)?.toString() ?? "DE";
            }
            return "DE";
        },
        async checkForExistenceChunk(checkForIds: string[], receiverIdMap: Map<string, {req: ReceiverRequest, original: ReceiverRecord}>) {
            
            const check = await this.checkReceiver(Array.from(receiverIdMap.values()).map(v => v.req));
            const res = Array.from(receiverIdMap.keys()).map((id, index) => ({ id: this.ignoreLeadingZeros(id), exists: check[index] }));

            for (const { id, exists } of res) {
                this.userExistenceStatus.set(id, exists ?? false);
                this.totalChecked++;
                Logger.debug("Checked ID: " + id + ", exists: " + exists);
                Logger.debug("Status: " + this.totalChecked + " / " + this.totalChecking);
            }

        },
        ignoreLeadingZeros(id: string) : string {
            return id.replace(/^0+/, '');
        },
        async parseDocumentsAssignmentFile(){               
            if(this.documentsSource == null) {
                console.error('No documents source provided for documents assignment parsing.');
                return;
            }
            return parseDocumentsAssignmentFile(this.documentsSource, this.basePath)
        },
        getDirAnalyticsBasePath() {
            if(this.isDocumentsSFtp) {
                return this.documentsSource?.sftp?.filePath ?? '/';
            } else {
                return this.documentsSource?.file ?? '/';
            }
        },
        
    },
})
</script>