<template>
    <div class="flex min-h-0 flex-1 flex-col">
        <div class="flex flex-1 flex-col gap-6 overflow-auto px-8 py-7">
            <PageHeader :path="t('ui.bulk.custom.path')" :title="t(`ui.bulk.custom.step.s${step}`)" :subtitle="summary || t(`ui.bulk.custom.stepText.s${step}`)" />
            <StepsHeader :steps="phases" :active="phaseOfStep[step] ?? 0" />

            <SourceReceivers v-if="step === 1" v-model="receiverSrc" />

            <SourceReceiversParser
                v-if="step === 2"
                :receiver-source="receiverSrc"
                @parsed="onParsedReceivers($event)"
            />

            <SourceDocuments v-if="step === 3" v-model="documentsSrc" />

            <SourceDocumentsParser
                v-if="step === 4"
                v-model="documentsSrc"
                @parsed="onParsedDocuments($event)"
            />

            <SearchReceivers
                v-if="step === 5"
                :receiver-records="receiverRecords"
                :document-records="documentRecords"
                @selection="pendingSelection = $event"
                @confirmed="onConfirmedDocuments($event)"
            />

            <NonExistingReceiversAction
                v-if="step === 6"
                ref="nonBrifle"
                :api-id="apiId"
                :tenant-id="tenantId"
                @valid="nonBrifleValid = $event"
                @update="goToPage7($event)"
            />

            <section v-if="step === 7" class="ma-card">
                <FormField :label="t('ui.bulk.subject.subject')" for-id="bulk-custom-subject" :hint="t('ui.bulk.custom.subjectHint')">
                    <InputText id="bulk-custom-subject" v-model="subject" :invalid="subject === ''" autofocus />
                </FormField>
            </section>

            <SendingOverviewPage
                v-if="step === 8"
                ref="overview"
                :subject="subject"
                :api-id="apiId"
                :tenant-id="tenantId"
                :send-doc-record="docsToSend"
                :action-not-brifle="actionNotBrifle"
                @update:confirmed="overviewConfirmed = $event"
                @sent="sentAll($event)"
            />

            <SendReports
                v-if="step === 9"
                :success-records="reportSuccess"
                :error-records="reportError"
                :not-brifle-records="reportNotBrifle"
            />
        </div>
        <WizardFooter
            :cancel-label="step < 9 && !sending ? t('ui.bulk.common.cancel') : ''"
            :back-label="step > 1 && step < 9 && !sending ? t('ui.bulk.common.back') : ''"
            :next-label="nextLabel"
            :next-icon="step === 8 ? Send : step === 9 ? Check : ChevronRight"
            :next-disabled="!canProceed"
            :loading="sending"
            :hint="footerHint"
            @cancel="leave()"
            @back="step--"
            @next="next()"
        />
    </div>
</template>
<script lang="ts">

import { defineComponent, ref } from 'vue';

import { useSessionStore } from 'src/stores/session-store';
import { useEncryptedStore } from 'src/stores/encrypted-store';

import SourceReceivers from '../components/SourceReceivers.vue';
import { DocumentSource, ReceiverSource } from '../util/helper';
import SourceReceiversParser from '../components/SourceReceiversParser.vue';
import SourceDocuments from '../components/SourceDocuments.vue';
import SourceDocumentsParser from '../components/SourceDocumentsParser.vue';
import SearchReceivers from '../components/SearchReceivers.vue';

import ReceiverRecord, { SendDocReq } from '../util/receivers/receiverRecord';
import DocumentRecord from '../util/documents/documentRecord';
import NonExistingReceiversAction, { NonExistingReceiverAction } from '../components/NonExistingReceiversAction.vue';
import SendingOverviewPage from '../components/SendingOverview.vue';
import SendReports from '../components/SendReports.vue';
import Logger from 'src/services/node/Log';
import { useBrifleStore } from 'src/stores/brifle-store';
import { AccountData, ApiEndpoints } from 'app/src-electron/models/EncryptedStore';
import { useI18n } from 'vue-i18n';
import InputText from 'openvue/inputtext';
import { Check, ChevronRight, Send } from 'lucide-vue-next';
import PageHeader from 'components/shell/PageHeader.vue';
import StepsHeader from 'components/ui/StepsHeader.vue';
import WizardFooter from 'components/ui/WizardFooter.vue';
import FormField from 'components/ui/FormField.vue';


export default defineComponent({
    name: 'CustomBulkSendPage',
    components: {
        SourceReceivers, SourceReceiversParser, SourceDocuments, 
        SourceDocumentsParser, SearchReceivers, NonExistingReceiversAction,
        SendingOverviewPage, SendReports, InputText, PageHeader, StepsHeader, WizardFooter, FormField,
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
    },
    setup () {
        const sessionStore = useSessionStore();
        const encryptedStore = useEncryptedStore();
        const step = ref<number>(1);
        const receiverSrc = ref<ReceiverSource>({
            type: 'file',
        });
        const documentsSrc = ref<DocumentSource>({
            type: 'file',
            destType: 'file',
        });       
        const receiverRecords = ref<ReceiverRecord[]>([]);
        const documentRecords = ref<DocumentRecord[]>([]);
        const docsToSend = ref<SendDocReq[]>([]);
        const actionNotBrifle = ref<NonExistingReceiverAction>({
          action: 'ignore',
          testModePaperMail: false,
          paperMailTestEmailRecipient: '',
          useCoverLetter: false,
          selectedCoverLetter: null,
        });
        const subject = ref<string>('');
        const reportSuccess = ref<SendDocReq[]>([]);
        const reportError = ref<SendDocReq[]>([]);
        const reportNotBrifle = ref<SendDocReq[]>([]);
           const apiKey = ref<string>('');
        const apiId = ref<string>('');
        const brifleStore = useBrifleStore();
        const account = ref<AccountData | null>(null);
        const tenantId = ref<string>('');
        const { t } = useI18n();
        // footer state reported by the step components
        const pendingSelection = ref<SendDocReq[]>([]);
        const nonBrifleValid = ref<boolean>(true);
        const overviewConfirmed = ref<boolean>(false);
        const sending = ref<boolean>(false);
        // steps 1–9 grouped into the phases of the stepper header
        const phaseOfStep: Record<number, number> = { 1: 0, 2: 0, 3: 1, 4: 1, 5: 2, 6: 3, 7: 4, 8: 5, 9: 5 };
        return {
            t,
            Send,
            Check,
            ChevronRight,
            pendingSelection,
            nonBrifleValid,
            overviewConfirmed,
            sending,
            phaseOfStep,
            sessionStore,
            encryptedStore,
            step,
            receiverSrc,            
            documentsSrc,
            receiverRecords,
            documentRecords,
            docsToSend,
            actionNotBrifle,
            subject,
            reportSuccess,
            reportError,
            reportNotBrifle,
            apiKey,
            apiId,  
            brifleStore,
            tenantId,
            account,
        };
    },
    watch: {
      // step components start empty when they are shown again, so their footer state does too
      step(value: number) {
        if (value === 5) {
          this.pendingSelection = [];
        } else if (value === 8) {
          this.overviewConfirmed = false;
        }
      },
    },
    computed: {
      phases(): { title: string, description: string }[] {
        return ['receivers', 'documents', 'check', 'options', 'subject', 'send'].map((key) => ({
          title: this.t(`ui.bulk.custom.phase.${key}`),
          description: this.t(`ui.bulk.custom.phaseText.${key}`),
        }));
      },
      summary(): string {
        const parts: string[] = [];
        if (this.receiverRecords.length > 0) {
          parts.push(this.t('ui.bulk.custom.summaryReceivers', { n: this.receiverRecords.length }));
        }
        if (this.documentRecords.length > 0) {
          parts.push(this.t('ui.bulk.custom.summaryDocuments', { n: this.documentRecords.length }));
        }
        if (this.step >= 6 && this.docsToSend.length > 0) {
          parts.push(this.t('ui.bulk.custom.summarySelected', { n: this.docsToSend.length }));
        }
        return parts.join(' · ');
      },
      canProceed(): boolean {
        switch (this.step) {
          case 1: return this.validSourceReceiver;
          case 2: return this.receiverRecords.length > 0;
          case 3: return this.validSourceDocuments;
          case 4: return this.documentRecords.length > 0;
          case 5: return this.pendingSelection.length > 0;
          case 6: return this.nonBrifleValid;
          case 7: return this.subject !== '';
          case 8: return this.overviewConfirmed && !this.sending;
          default: return true;
        }
      },
      nextLabel(): string {
        if (this.step === 8) {
          return this.t('ui.bulk.custom.sendNow');
        }
        if (this.step === 9) {
          return this.t('ui.bulk.common.done');
        }
        return this.t('ui.bulk.common.next');
      },
      footerHint(): string {
        if (this.step === 5 && this.pendingSelection.length > 0) {
          return this.t('ui.bulk.search.selectedHint', { n: this.pendingSelection.length });
        }
        return '';
      },
      validSourceReceiver(): boolean {
        if(this.receiverSrc.type === 'file') {
            return this.receiverSrc.file != null && this.receiverSrc.file !== '';
        } else if(this.receiverSrc.type === 'sftp') {
            return this.receiverSrc.sftp?.filePath != null && this.receiverSrc.sftp?.filePath !== '';
        }
        return false;
    
      },
      validSourceDocuments(): boolean {
        if(this.documentsSrc.type === 'file') {
            return this.documentsSrc.file != null && this.documentsSrc.file !== '';
        } else if(this.documentsSrc.type === 'sftp') {
            return this.documentsSrc.sftp?.filePath != null && this.documentsSrc.sftp?.filePath !== '';
        }
        return false;    
      },
    },
    methods: {
      next() {
        switch (this.step) {
          case 5:
            this.onConfirmedDocuments(this.pendingSelection);
            break;
          case 6:
            (this.$refs.nonBrifle as { update: () => void } | undefined)?.update();
            break;
          case 8: {
            const overview = this.$refs.overview as { sendAll: () => Promise<void> } | undefined;
            if (overview) {
              this.sending = true;
              void overview.sendAll().finally(() => {
                this.sending = false;
              });
            }
            break;
          }
          case 9:
            this.leave();
            break;
          default:
            this.step++;
        }
      },
      leave() {
        void this.$router.push({ name: 'bulk_sending.index' });
      },
      goToPage7($event: NonExistingReceiverAction) {
        this.actionNotBrifle = $event;
        this.step = 7;
      },
      sentAll(event: {
        success: SendDocReq[],
        failed: SendDocReq[],
        notBrifle: SendDocReq[],
      }) {
        this.reportSuccess = event.success;
        this.reportError = event.failed;        
        this.reportNotBrifle = event.notBrifle;
        this.step = 9;
        Logger.info("Sent all documents. Success: " + this.reportSuccess.length + ", Failed: " + this.reportError.length + ", Not Brifle: " + this.reportNotBrifle.length);
      },
      onConfirmedDocuments(records : SendDocReq[]){        
        this.docsToSend = records;
        this.step = 6;
        Logger.debug("Confirmed documents to send: " + this.docsToSend.length);
      },
      onParsedReceivers (parsed: {records: ReceiverRecord[], parserId: string}) {
        this.receiverRecords = parsed.records;
        this.receiverSrc.parserId = parsed.parserId;
        Logger.debug("Parsed receivers: " + this.receiverRecords.length);
      },
      onParsedDocuments (parsed: DocumentRecord[]) {
        this.documentRecords = parsed;
        Logger.debug("Parsed documents: " + this.documentRecords.length);
      },
        
    },
});


</script>