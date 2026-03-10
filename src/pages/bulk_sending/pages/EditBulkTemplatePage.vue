<template>
    <p-page class="wrapper">
        <div class="q-py-lg">
            <div class="text-h4">{{ title }}</div>
            <div class="text-muted" v-if="id">
                {{ id }}
            </div>
        </div>
        <q-separator />
        <div class="q-py-lg">
             <q-stepper
      v-model="step"
      vertical
      flat
      color="secondary" 
      class="material-card material-card-muted"
      animated
    >
      <q-step
        :name="1"
        title="Quelle - Empfänger"
        color="secondary"
        icon="settings"
        :done="step > 1"
      >
        
            <SourceReceivers 
            :use-local-storage="false"
            :init-value="receiverSrc"
            v-model="receiverSrc" />


        <q-stepper-navigation class="text-center">
          <q-btn :disable="!validSourceReceiver" @click="step = 2" color="secondary" text-color="black" label="Weiter" />
        </q-stepper-navigation>
      </q-step>

      <q-step
        :name="2"
        title="Empfänger"        
        color="secondary"
        icon="create_new_folder"
        :disable="step < 2"
        :done="step > 2"
      >
        <SourceReceiversParser
          :use-local-storage="false"
          :init-value="receiverSrc"
          :receiverSource="receiverSrc"          
          @parsed="onParsedReceivers($event)"
        />


        <q-stepper-navigation>
          <q-btn @click="step = 3" color="secondary"  
          :disable="receiverRecords.length === 0"
          text-color="black"  label="Weiter" />
        </q-stepper-navigation>
      </q-step>

      <q-step
        :name="3"
        title="Quelle - Dokumente"
        color="secondary"
        icon="assignment"
        :disable="step < 3"
        :done="step > 3"
      >
        
      <SourceDocuments
        :use-local-storage="false"
        :init-value="documentsSrc"
        v-model="documentsSrc"      
      >
      </SourceDocuments>

      <q-stepper-navigation>
          <q-btn @click="step = 4" :disable="!validSourceDocuments" color="secondary"  text-color="black"  label="Weiter" />
        </q-stepper-navigation>

      </q-step>

      <q-step
        :name="4"
        :disable="step < 4"
        :done="step > 4"
        title="Zuweisung - Dokumente"
        color="secondary"
        icon="add_comment"
      >
        <SourceDocumentsParser
          :use-local-storage="false"
          :init-value="documentsSrc"
          :use-date-filter="false"
          @parsed="onParsedDocuments($event)"
          v-model="documentsSrc"
        />

        <q-stepper-navigation>
          <q-btn  @click="step = 5" color="secondary" 
          :disable="documentRecords.length === 0"
          text-color="black" label="Weiter" />
        </q-stepper-navigation>
      </q-step>
     
      <q-step
        :name="5"
        :disable="step < 5"
        :done="step > 5"
        title="Aktion - Nicht Brifle Empfänger"
        color="secondary"
        icon="local_post_office"
      >
        <NonExistingReceiversAction
        :api-id="apiId"
        :tenant-id="tenantId"
        :use-local-storage="false"
        :init-value="actionNotBrifle"
          @update="goToPage6($event)" 
        />
    
    </q-step>
    <q-step
        :name="6"
        :disable="step < 6"
        :done="step > 6"
        title="Betreff"
        color="secondary"
        icon="title"
      >
      <div class="q-my-lg text-center">
          <SubjectSetter v-model="subjectData" :docs="documentRecords" />
          <q-stepper-navigation>
            <q-btn @click="step = 7" color="secondary" 
            :disable="subjectData.default === ''"
            text-color="black" label="Weiter" />
          </q-stepper-navigation>

      </div>

    </q-step>
      <q-step
        :name="7"
        :disable="step < 7"
        :done="step > 7"
        title="Übersicht"
        color="secondary"
        icon="assignment_turned_in"
      >
    
    <div class="q-my-md">
      <q-table
          :columns="overviewColumns"
          :rows="overviewRows"
          flat
          separator="none"
          class="bg-transparent border-none"
          
          hide-pagination
          :pagination="{
            rowsPerPage: 100,
            page: 1,

          }"
        >
        <template v-slot:body-cell-property="props">
          <q-td :props="props" class="text-caption ">
            {{ props.row.property }}
          </q-td>
        </template>
         <template v-slot:body-cell-value="props">
          <q-td :props="props">
            <div v-if="props.row.value" class="text-caption q-ml-sm muted-pill">
              {{ props.row.value }}
            </div>
          </q-td>
        </template>
      </q-table>
      </div>

      <q-input filled v-model="templateName" label="Vorlagenname" color="secondary" class="q-mb-md" />
      <q-input filled v-model="templateDescription" label="Vorlagenbeschreibung" color="secondary" class="q-mb-md" type="textarea" />
      <div class="q-my-lg text-center row justify-between">
        <q-btn flat class="muted-action-btn q-mb-lg" @click="cancelTemplate()" color="secondary" label="Abbrechen" />
        <q-btn @click="storeTemplate()" color="secondary" text-color="black" label="Vorlage speichern" class="q-mb-lg" />
        </div>
    </q-step>

    </q-stepper>
        </div>
    </p-page>
                
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

export default defineComponent({
    name: 'EditBulkTemplatePage',
    components: {
        SourceReceivers, SourceReceiversParser, SourceDocuments, 
        SourceDocumentsParser, NonExistingReceiversAction, SubjectSetter
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
                return 'Neue Vorlage erstellen';
            } else {
                return 'Vorlage bearbeiten';
            }
        },
        overviewRows() {
           const rows = [];

           const notBrifleAction = this.actionNotBrifle.action === 'ignore' ? 'Ignorieren' : 'Papierpost';



            rows.push({ property: 'Empfängerquelle', value: this.receiverSrc.type === 'file' ? `Datei` : `SFTP` });
            rows.push({ property: 'Dokumentenquelle', value: this.documentsSrc.type === 'file' ? `Datei` : `SFTP` });
            rows.push({ property: 'Aktion bei nicht Brifle Empfängern', value: notBrifleAction });
            rows.push({ property: 'Betreff (Standard)', value: this.subjectData.default });

            for (const docType in this.subjectData.docTypes) {
                rows.push({ property: `Betreff für ${docType}`, value: this.subjectData.docTypes[docType] });
            }

            if(this.actionNotBrifle.action === 'papermail') {
              const useTestMode = this.actionNotBrifle.testModePaperMail ? 'Ja' : 'Nein';

              rows.push({ property: 'Papierpost Testmodus aktiviert', value: useTestMode });
              if (this.actionNotBrifle.testModePaperMail) {
                rows.push({ property: 'E-Mail Empfänger für Papierpost Testmodus', value: this.actionNotBrifle.paperMailTestEmailRecipient });
              }
              const useCoverLetter = this.actionNotBrifle.useCoverLetter ? 'Ja' : 'Nein';
              rows.push({ property: 'Deckblatt verwenden', value: useCoverLetter });
              if(this.actionNotBrifle.useCoverLetter && this.actionNotBrifle.selectedCoverLetter) {
                rows.push({ property: 'Ausgewähltes Deckblatt', value: this.actionNotBrifle.selectedCoverLetter.name });
              }
            }

          
            return rows;

        },
      overviewColumns(){
        return [
          {
            name: 'property',
            label: 'Eigenschaft',
            field: 'property',
            align: 'left' as const,
          },
          {
            name: 'value',
            label: 'Wert',
            field: 'value',
            align: 'left' as const,
          },
        ]
      },
      validSourceReceiver() {
        if(this.receiverSrc.type === 'file') {
            return this.receiverSrc.file != null && this.receiverSrc.file !== '';
        } else if(this.receiverSrc.type === 'sftp') {
            return this.receiverSrc.sftp?.filePath != null && this.receiverSrc.sftp?.filePath !== '';
        }
        return false;
    
      },
      validSourceDocuments() {
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
              this.$q.notify({
                type: 'negative',
                message: 'Vorlage nicht gefunden'
              });
            }
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          } catch (error: unknown) {
            Logger.error('Error loading template: ');
            this.$q.notify({
              type: 'negative',
              message: 'Fehler beim Laden der Vorlage'
            });
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
          this.$q.notify({
            type: 'positive',
            message: 'Vorlage erfolgreich gespeichert'
          });
          void this.$router.push({ name: 'bulk_sending.templates' });
        }).catch((error) => {
          Logger.error('Error saving template: ' + error);
          this.$q.notify({
            type: 'negative',
            message: 'Fehler beim Speichern der Vorlage'
          });
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
        return { 
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