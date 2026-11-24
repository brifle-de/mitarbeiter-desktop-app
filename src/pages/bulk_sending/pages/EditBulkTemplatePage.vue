<template>
    <div class="flex min-h-0 flex-1 flex-col">
        <div class="flex flex-1 flex-col gap-6 overflow-auto px-8 py-7">
            <PageHeader :path="t('ui.bulk.edit.path')" :title="title" :subtitle="subtitle" />
            <StepsHeader :steps="phases" :active="phaseOfStep[step] ?? 0" />

            <SourceReceivers
                v-if="step === 1"
                v-model="receiverSrc"
                :use-local-storage="false"
                :init-value="receiverSrc"
            />

            <SourceReceiversParser
                v-if="step === 2"
                :use-local-storage="false"
                :init-value="receiverSrc"
                :receiver-source="receiverSrc"
                @parsed="onParsedReceivers($event)"
            />

            <SourceDocuments
                v-if="step === 3"
                v-model="documentsSrc"
                :use-local-storage="false"
                :init-value="documentsSrc"
            />

            <SourceDocumentsParser
                v-if="step === 4"
                v-model="documentsSrc"
                :use-local-storage="false"
                :init-value="documentsSrc"
                :use-date-filter="false"
                @parsed="onParsedDocuments($event)"
            />

            <NonExistingReceiversAction
                v-if="step === 5"
                ref="nonBrifle"
                :api-id="apiId"
                :tenant-id="tenantId"
                :use-local-storage="false"
                :init-value="actionNotBrifle"
                @valid="nonBrifleValid = $event"
                @update="goToPage6($event)"
            />

            <SubjectSetter v-if="step === 6" v-model="subjectData" :docs="documentRecords" />

            <div v-if="step === 7" class="grid grid-cols-2 gap-6">
                <section class="ma-card">
                    <h2 class="ma-title-m">{{ t('ui.bulk.edit.details') }}</h2>
                    <FormField :label="t('ui.bulk.edit.name')" for-id="bulk-template-name">
                        <InputText id="bulk-template-name" v-model="templateName" />
                    </FormField>
                    <FormField :label="t('ui.bulk.edit.description')" for-id="bulk-template-description">
                        <Textarea id="bulk-template-description" v-model="templateDescription" rows="4" auto-resize />
                    </FormField>
                </section>
                <section class="ma-card">
                    <h2 class="ma-title-m">{{ t('ui.bulk.edit.summary') }}</h2>
                    <dl class="grid grid-cols-[minmax(140px,auto)_1fr] gap-x-4 gap-y-2.5">
                        <template v-for="row in overviewRows" :key="row.property">
                            <dt class="ma-small text-ink-muted">{{ row.property }}</dt>
                            <dd class="break-words">{{ row.value || '–' }}</dd>
                        </template>
                    </dl>
                </section>
            </div>
        </div>
        <WizardFooter
            :cancel-label="t('ui.bulk.common.cancel')"
            :back-label="step > 1 ? t('ui.bulk.common.back') : ''"
            :next-label="step === 7 ? t('ui.bulk.edit.save') : t('ui.bulk.common.next')"
            :next-icon="step === 7 ? Save : ChevronRight"
            :next-disabled="!canProceed"
            @cancel="cancelTemplate()"
            @back="step--"
            @next="next()"
        />
    </div>
</template>
<script lang="ts"> 

import { defineComponent, ref } from 'vue';
import { useSessionStore } from 'src/stores/session-store';
import { useEncryptedStore } from 'src/stores/encrypted-store';
import { useBrifleStore } from 'src/stores/brifle-store';
import { ApiEndpoints, ApiEnvironment, SftpData } from 'app/src-electron/models/EncryptedStore';
import NonExistingReceiversAction, { NonExistingReceiverAction } from '../components/NonExistingReceiversAction.vue';
import { DocumentSource, loadReceiverSource, ReceiverSource, SubjectData } from '../util/helper';
import ReceiverRecord from '../util/receivers/receiverRecord';
import DocumentRecord from '../util/documents/documentRecord';
import Logger from 'src/services/node/Log';
import SourceReceivers from '../components/SourceReceivers.vue';
import SourceReceiversParser from '../components/SourceReceiversParser.vue';
import SourceDocuments from '../components/SourceDocuments.vue';
import SourceDocumentsParser from '../components/SourceDocumentsParser.vue';
import SubjectSetter from '../components/SubjectSetter.vue';
import { BulkSendTemplate } from '../../../../src-electron/service/send_templates/templates/template';
import SendTemplate from 'src/services/node/SendTemplate';
import { getAllAvailableDirParsers, loadDocumentSource } from '../util/helper';
import { useI18n } from 'vue-i18n';
import InputText from 'openvue/inputtext';
import Textarea from 'openvue/textarea';
import { ChevronRight, Save } from 'lucide-vue-next';
import PageHeader from 'components/shell/PageHeader.vue';
import StepsHeader from 'components/ui/StepsHeader.vue';
import WizardFooter from 'components/ui/WizardFooter.vue';
import FormField from 'components/ui/FormField.vue';
import { useNotify } from 'src/composables/useNotify';

export default defineComponent({
    name: 'EditBulkTemplatePage',
    components: {
        SourceReceivers, SourceReceiversParser, SourceDocuments, 
        SourceDocumentsParser, NonExistingReceiversAction, SubjectSetter,
         
        InputText, Textarea, PageHeader, StepsHeader, WizardFooter, FormField,
    },
    props: {
        id: {
            type: String,
            required: false
        }
    },
    computed: {
        title(): string {
            if (this.id === undefined) {
                return this.t('ui.bulk.edit.titleNew');
            } else {
                return this.t('ui.bulk.edit.titleEdit');
            }
        },
        subtitle(): string {
            const stepTitle = this.t(`ui.bulk.edit.step.s${this.step}`);
            return this.id ? `${stepTitle} · ${this.id}` : stepTitle;
        },
        phases(): { title: string, description: string }[] {
            return ['receivers', 'documents', 'options', 'subject', 'save'].map((key) => ({
                title: this.t(`ui.bulk.edit.phase.${key}`),
                description: this.t(`ui.bulk.edit.phaseText.${key}`),
            }));
        },
        canProceed(): boolean {
            switch (this.step) {
                case 1: return this.validSourceReceiver;
                case 2: return this.receiverRecords.length > 0;
                case 3: return this.validSourceDocuments;
                case 4: return this.documentRecords.length > 0;
                case 5: return this.nonBrifleValid;
                case 6: return this.subjectData.default !== '';
                default: return true;
            }
        },
        overviewRows(): { property: string, value: string }[] {
           const rows: { property: string, value: string }[] = [];
           const yes = this.t('ui.bulk.common.yes');
           const no = this.t('ui.bulk.common.no');

           const notBrifleAction = this.actionNotBrifle.action === 'ignore' ? this.t('ui.bulk.nonBrifle.ignore') : this.t('ui.bulk.nonBrifle.paperMail');

            rows.push({ property: this.t('ui.bulk.edit.row.receiverSource'), value: this.receiverSrc.type === 'file' ? this.t('ui.bulk.common.file') : 'SFTP' });
            rows.push({ property: this.t('ui.bulk.edit.row.documentSource'), value: this.documentsSrc.type === 'file' ? this.t('ui.bulk.common.file') : 'SFTP' });
            rows.push({ property: this.t('ui.bulk.edit.row.nonBrifleAction'), value: notBrifleAction });
            rows.push({ property: this.t('ui.bulk.edit.row.defaultSubject'), value: this.subjectData.default });

            for (const docType in this.subjectData.docTypes) {
                rows.push({ property: this.t('ui.bulk.subject.forDocType', { type: docType }), value: this.subjectData.docTypes[docType] ?? '' });
            }

            if(this.actionNotBrifle.action === 'papermail') {
              rows.push({ property: this.t('ui.bulk.edit.row.testMode'), value: this.actionNotBrifle.testModePaperMail ? yes : no });
              if (this.actionNotBrifle.testModePaperMail) {
                rows.push({ property: this.t('ui.bulk.edit.row.testRecipient'), value: this.actionNotBrifle.paperMailTestEmailRecipient });
              }
              rows.push({ property: this.t('ui.bulk.edit.row.useCoverLetter'), value: this.actionNotBrifle.useCoverLetter ? yes : no });
              if(this.actionNotBrifle.useCoverLetter && this.actionNotBrifle.selectedCoverLetter) {
                rows.push({ property: this.t('ui.bulk.edit.row.coverLetter'), value: this.actionNotBrifle.selectedCoverLetter.name });
              }
            }

            return rows;
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
     mounted() {
       const accountId = this.sessionStore.getSelectedAccountId as string;
        // get account data
        this.account = this.encryptedStore.getAccount(accountId) ?? null;
        this.apiKey = this.account?.apiKey ?? '';
        this.sftpServer = this.account?.sftpData ?? [];
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
        void this.loadTemplate();
    },
    methods: {
      next() {
        if (this.step === 5) {
          (this.$refs.nonBrifle as { update: () => void } | undefined)?.update();
        } else if (this.step === 7) {
          this.storeTemplate();
        } else {
          this.step++;
        }
      },
      loadDocumentSource(templateData: BulkSendTemplate): DocumentSource {
        return loadDocumentSource(templateData, this.availableDirParsers, this.sftpServer);
      },
      cancelTemplate() {
        void this.$router.push({ name: 'bulk_sending.templates' });
      },
      async loadTemplate() {
        if(this.id) {
          try {
            const template = await this.templateService.getTemplate(this.id);
            if(template) {
              this.templateName = template.name;
              this.templateDescription = template.description;
              this.documentsSrc = this.loadDocumentSource(template);
              this.receiverSrc = loadReceiverSource(template, this.sftpServer);
              this.subjectData = template.subjects;
              this.actionNotBrifle = template.nonExistingReceiverAction;             
            } else {
              this.notify.error(this.t('ui.bulk.edit.notFound'));
            }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (error: unknown) {
            Logger.error('Error loading template: ');
            this.notify.error(this.t('ui.bulk.edit.loadFailed'));
          }
        }
      },
      goToPage6($event: NonExistingReceiverAction) {
        this.actionNotBrifle = $event;
        this.step = 6;
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
      storeTemplate() {
        const template : BulkSendTemplate = {
          id: this.id ?? crypto.randomUUID(),
          name: this.templateName,
          description: this.templateDescription,
          postScripts: [],
          preScripts: [],
          documentSource: {
            type: this.documentsSrc.type,
            file: this.documentsSrc.file,
            sftp: this.documentsSrc.sftp?.connection?{
              serverId: this.documentsSrc.sftp?.connection?.id ?? '',
              filePath: this.documentsSrc.sftp?.filePath ?? '',
            }: undefined,
            destType: this.documentsSrc.destType,
            dirParser: this.documentsSrc.dirParser?.getID(),
            fileAssignment: this.documentsSrc.fileAssignment
          },
          receiverSource: {
            type: this.receiverSrc.type,
            file: this.receiverSrc.file,
            parserId: this.receiverSrc.parserId,
            sftp: this.receiverSrc.sftp?.connection?{
              serverId: this.receiverSrc.sftp?.connection?.id ?? '',
              filePath: this.receiverSrc.sftp?.filePath ?? '',
            }: undefined,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          subjects: this.subjectData,
          nonExistingReceiverAction: this.actionNotBrifle
        }
        
        this.templateService.saveTemplate(template).then(() => {
          this.notify.success(this.t('ui.bulk.edit.saved'));
          void this.$router.push({ name: 'bulk_sending.templates' });
        }).catch((error) => {
          Logger.error('Error saving template: ' + error);
          this.notify.error(this.t('ui.bulk.edit.saveFailed'));
        });
      }
    },
    setup() {      
        const sessionStore = useSessionStore();
        const encryptedStore = useEncryptedStore();
        const brifleStore = useBrifleStore();
        const tenantId = ref<string>('');
        const apiId = ref<string>('');
        const apiKey = ref<string>('');
        const templateService = new SendTemplate();
        const account = ref<null|{ tenantId?: string; apiKey?: string, apiEnv: ApiEnvironment, sftpData?: SftpData[] }>(null);
        const availableDirParsers = getAllAvailableDirParsers();
        const sftpServer = ref<SftpData[]>([]);
        const subjectData = ref<SubjectData>({
            default: '',
            docTypes: {},
        });
        const step = ref<number>(1);
        const actionNotBrifle = ref<NonExistingReceiverAction>({
          action: 'ignore',
          testModePaperMail: false,
          paperMailTestEmailRecipient: '',
          useCoverLetter: false,
          selectedCoverLetter: null,
        });
        const receiverSrc = ref<ReceiverSource>({
            type: 'file',
        });
        const documentsSrc = ref<DocumentSource>({
            type: 'file',
            destType: 'file',
        });       
        const receiverRecords = ref<ReceiverRecord[]>([]);
        const documentRecords = ref<DocumentRecord[]>([]);
        const templateName = ref<string>('');
        const templateDescription = ref<string>('');
        const { t } = useI18n();
        const notify = useNotify();
        const nonBrifleValid = ref<boolean>(true);
        // steps 1–7 grouped into the phases of the stepper header
        const phaseOfStep: Record<number, number> = { 1: 0, 2: 0, 3: 1, 4: 1, 5: 2, 6: 3, 7: 4 };
        return {
          t,
          notify,
          Save,
          ChevronRight,
          nonBrifleValid,
          phaseOfStep,
          sessionStore, 
          encryptedStore, 
          brifleStore, 
          tenantId,            
          subjectData, 
          step, 
          actionNotBrifle, 
          receiverSrc, 
          documentsSrc, 
          receiverRecords, 
          documentRecords,
          apiId, 
          apiKey, 
          account,
          templateName, 
          templateDescription,
          templateService,
          availableDirParsers,
          sftpServer
        };
    }
});

</script>