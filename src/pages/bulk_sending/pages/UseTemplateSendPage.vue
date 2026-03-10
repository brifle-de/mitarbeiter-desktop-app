<template>
    <q-page class="wrapper">
        <q-dialog v-model="isSending">
            <div class="material-card material-card-filled flex-column dialog-window-md q-pa-xl">
                <div>
                    <div class="text-h5 text-center">Versand</div>
                </div>
                <div class="flex-1 align-center justify-center w-100 q-py-xl">
                    <div class="flex-column items-center justify-center">
                        <div>
                            <img src="~assets/img/mailbox.png" alt="Warning" width="150" height="150" />
                        </div>
                        <div class="q-mt-md">
                            <q-spinner color="secondary" size="50px"/>
                        </div>
                        <div class="q-mt-xl">
                            {{ `Sende Dokumente... (${itemsTriedToSend.length}/${itemsToSend.length})` }}
                        </div>
                    </div>
                </div>
            </div>
        </q-dialog>
        <div class="q-pa-md">
            <div class="text-h4">Versand mit Vorlage</div>            
            <div class="text-muted">
                {{ templateName }}
            </div>
        </div>
        <q-separator class="q-my-md"/>
        <div class="q-my-md">
            <div class="material-card material-card-muted">
                <!-- expandable to show details -->
                 <q-expansion-item label="Details" icon="info" class="no-border">
                    <div class="q-pa-md">
                        <div class="q-my-sm row" v-for="value in detailsListItems" :key="value.label+'_detail_item'">
                            <span class="col-3 text-bold">{{ value.label }}: </span>
                            <span class="col">{{ value.value }}</span>
                        </div>
                    </div>
                </q-expansion-item>
            </div>
        </div>
        <template v-if="!showReport">
            <div class="text-right">
                <q-btn
                flat
                :disable="!canStart"
                @click="start()"
                color="secondary"
                class="muted-action-btn"
                >
                <q-tooltip anchor="top middle" self="bottom middle" class="muted-tooltip">
                    Versand Starten (F5)
                </q-tooltip>
                    Starten
                    <q-icon name="play_arrow" class="q-ml-sm" />
                </q-btn>
            </div>
            <!-- preview -->
            <div class="q-mt-lg material-card material-card-muted q-pa-md" v-if="hasStarted">
                <template v-if="isLoading">
                    <div class="text-center q-py-xl">
                        <div class="muted-pill">
                        <q-spinner color="secondary" size="25px" class="q-mr-sm"/>
                        Lade Vorschau...
                    </div>
                    </div>
                </template>
                <template v-else>
                    <div class="text-h6 q-mb-md">Vorschau der Zuordnung von Dokumenten zu Empfängern</div>
                    
                    <q-table
                        :columns="previewColumns"
                        :rows="sendDocsRecords"
                        row-key="doc.filePath"
                        color="green-9"

                        :selection="!selectAll ? 'multiple' : 'none'"
                        v-model:selected="selected" 
                        class="q-mt-md bg-transparent"
                        flat
                        :pagination="{ rowsPerPage: 5 }">
                        <template v-slot:body-cell-receiver="props">
                            <q-td :props="props">
                                <div v-if="props.row.receiver">
                                    {{ props.row.receiver.original.receiverId }} - {{ props.row.receiver.original.addressCity }}
                                </div>
                                <div v-else class="text-muted">
                                    Kein Empfänger gefunden
                                </div>
                            </q-td>
                        </template>
                        <template v-slot:body-cell-postalAddress="props">
                            <q-td :props="props">
                                <div v-if="props.row.postalAddress">
                                    {{ props.row.postalAddress.street }} {{ props.row.postalAddress.housenumber ?? '' }}, {{ props.row.postalAddress.postcode }} {{ props.row.postalAddress.city }}, {{ props.row.postalAddress.country }}
                                </div>
                                <div v-else class="text-muted">
                                    Keine Adresse gefunden
                                </div>
                            </q-td>
                        </template>
                        <template v-slot:body-cell-exists="props">
                            <q-td :props="props">
                                <div v-if="props.row.exists">
                                    <q-tooltip anchor="top middle" self="bottom middle" class="muted-tooltip">
                                        Empfänger hat ein Brifle Konto
                                    </q-tooltip>
                                    <img src="~assets/img/invoice.png" alt="Exists" width="50" height="50" />
                                </div>
                                <div v-else>
                                    <q-tooltip anchor="top middle" self="bottom middle" class="muted-tooltip">
                                        Empfänger hat kein Brifle Konto
                                    </q-tooltip>
                                    <img src="~assets/img/letter.png" alt="Not Exists" width="50" height="50" />
                                </div>
                            </q-td>
                        </template>
                        <template v-slot:body-cell-docType="props">
                            <q-td :props="props">
                                <div :class="'muted-pill text-caption ' + (pillColors[props.row.doc.docType ?? 'default'] || '')">
                                    {{ props.row.doc.docType ?? 'Unbekannt' }}
                                </div>
                            </q-td>

                        </template>
                        <template v-slot:body-cell-subject="props">
                            <q-td :props="props">
                                <div class="muted-pill text-caption">
                                    {{ getSubject(props.row) ?? 'Kein Betreff' }}
                                </div>
                            </q-td>
                        </template>
                    </q-table>

                    <!-- confirm switch -->
                    <div class="row items-center q-mt-md">
                        <q-toggle v-model="selectAll" color="secondary"/>
                        <span class="text-muted q-ml-sm">
                            <q-tooltip anchor="top middle" self="bottom middle" class="muted-tooltip">
                                Deaktiviert die Einzelauswahl
                            </q-tooltip>
                                Alle auswählen
                        </span>
                    </div>

                    <!-- prepare Send btn -->
                        <div class="text-right q-mt-md">
                            <q-btn
                            :disable="(selected.length === 0 && !selectAll) || totalItemsCount === 0" 
                            @click="showConfirmationDialog = true"
                            flat
                            color="secondary"                    
                            class="muted-action-btn"
                            >
                                Versand für ausgewählte Einträge starten
                                <q-icon name="play_arrow" class="q-ml-sm" />
                            </q-btn>

                        </div>

                        <q-dialog 
                        class="confirm-dialog"
                        v-model="showConfirmationDialog" position="right" 
                        maximized persistent  no-shake  transition-show="none"
                        transition-hide="none">
                            <q-card class="material-card material-card-filled flex-column  padding-top-titlebar unselectable">
                                <q-card-section class="w-100">
                                    <div class="text-h5">Bestätigung</div>
                                </q-card-section>

                                <q-card-section class="flex-1">
                                    <div class="q-py-lg text-muted">
                                        Bist du sicher, dass du den Versand für die {{ selectAll ? totalItemsCount : selected.length }} ausgewählten Einträge starten möchten?
                                    </div>
                                    <div class="row q-my-sm">
                                        <div class="col-8">
                                            Anzahl Digitaler Sendungen:
                                        </div>
                                        <div class="col-4 text-center text-bold muted-pill">
                                            {{ itemsToSend.filter(item => item.exists).length }}
                                        </div>
                                    </div>
                                    <div class="row q-my-sm">
                                        <div class="col-8">
                                            Anzahl Sendungen per Post:
                                        </div>
                                        <div class="col-4 text-center text-bold muted-pill">
                                            <template v-if="usePaperMail">
                                                {{ itemsToSend.filter(item => !item.exists).length }}
                                            </template>
                                            <template v-else>
                                                0
                                            </template>
                                        </div>
                                    </div>

                                </q-card-section>

                                <q-card-actions class="w-100 justify-between">
                                    <q-btn flat icon="cancel" class="muted-action-btn" label="Abbrechen" @click="showConfirmationDialog = false">
                                        <q-tooltip anchor="top middle" self="bottom middle" class="muted-tooltip">
                                            Abbrechen
                                        </q-tooltip>
                                    </q-btn>
                                    <q-btn flat icon="check" class="muted-action-btn" label="Bestätigen" color="secondary" @click="sendDocuments()">
                                        <q-tooltip anchor="top middle" self="bottom middle" class="muted-tooltip">
                                            Versand starten
                                        </q-tooltip>
                                    </q-btn>
                                </q-card-actions>
                            </q-card>
                        </q-dialog>
                    
                </template>
            </div>
         </template>
         <template v-else>
            <TemplateSendReports
                :success-records="reportSuccess"
                :error-records="reportError"
                :not-brifle-records="reportNotBrifle"
                ></TemplateSendReports>
         </template>
    </q-page>

</template>

<style lang="scss" scoped>
.confirm-dialog .q-card {
    width: 500px;
    max-width: 70vw;
}
</style>

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

export default defineComponent({
    name: 'UseTemplateSendPage',
    components: {
        TemplateSendReports
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
        previewColumns(){
            // default for birth_info
            const defaultCol = [                  
                {
                    name: 'exists',
                    label: 'Brifle?',
                    field: (row: SendDocReceiverReq) => row.exists,
                    sortable: true,
                },
                {
                    name: 'subject',
                    label: 'Betreff',
                    field: (row: SendDocReceiverReq) => this.getSubject(row) ?? 'Kein Betreff',
                    sortable: true,
                },
                {
                    name: 'docType',
                    label: 'Dokumententyp',
                    field: (row: SendDocReceiverReq) => {
                        return row.doc.docType ?? 'Unbekannt';
                    },
                    sortable: true,
                },
                {
                    name: 'receiverID',
                    label: 'Empfänger ID',
                    field: (row: SendDocReceiverReq) => row.receiver?.original.receiverId ?? 'Nicht vorhanden',
                    sortable: true,
                },
                {
                    name: 'receiverName',
                    label: 'Nachname',
                    field: (row: SendDocReceiverReq) => row.receiver?.req.birth_information?.last_name,
                    sortable: true,
                },
                {
                    name: 'receiverName',
                    label: 'Vorname',
                    field: (row: SendDocReceiverReq) => row.receiver?.req.birth_information?.given_names,
                    sortable: true,
                },
                {
                    name: 'receiverName',
                    label: 'Geburtsdatum',
                    field: (row: SendDocReceiverReq) => row.receiver?.req.birth_information?.date_of_birth,                    
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
                    field: (row: SendDocReceiverReq) => row.postalAddress,
                    format: (val: PostalAddress) => val ? `${val.street}, ${val.postcode} ${val.city}, ${val.country}` : '',
                    sortable: true,
                },
                 {
                    name: 'path',
                    label: 'Dateipfad',
                    field: (row: SendDocReceiverReq) => row.doc.filePath,
                    sortable: true,
                },
            ];


            return defaultCol;
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
            const res = [
                { label: 'ID', value: this.templateData.id },
                { label: 'Name', value: this.templateData.name },
                { label: 'Erstellt am', value: new Date(this.templateData.createdAt).toLocaleString() },
                { label: 'Aktualisiert am', value: new Date(this.templateData.updatedAt).toLocaleString() },
                 { label: 'Anzahl Betreffzeilen', value: (Object.keys(this.templateData.subjects.docTypes).length + 1).toString()  },
                 { label: 'Aktion bei nicht existierenden Empfängern', value: this.getExternalReceiverActionText(this.templateData.nonExistingReceiverAction.action) },
              
                 
                // cover letter
                 { label: 'Deckblatt verwenden bei nicht existierenden Empfängern', value: this.templateData.nonExistingReceiverAction.useCoverLetter ? 'Ja' : 'Nein' },
                 { label: 'Ausgewähltes Deckblatt', value: this.templateData.nonExistingReceiverAction.selectedCoverLetter ? this.templateData.nonExistingReceiverAction.selectedCoverLetter.displayName : 'N/A' },
                 { label: 'Testmodus für Postversand', value: this.templateData.nonExistingReceiverAction.testModePaperMail ? 'Ja' : 'Nein' },
                 { label: 'Test E-Mail Empfänger für Postversand', value: this.templateData.nonExistingReceiverAction.paperMailTestEmailRecipient ?? 'N/A' },
                 // sources
                 { label: 'Dokumentenquelle', value: this.templateData.documentSource.type === 'file' ? `Datei: ${this.templateData.documentSource.file}` : this.templateData.documentSource.type },
                 { label: 'Empfängerquelle', value: this.templateData.receiverSource.type === 'file' ? `Datei: ${this.templateData.receiverSource.file}` : this.templateData.receiverSource.type },
                 { label: 'Empfänger Parser', value: this.templateData.receiverSource.parserId ?? 'N/A' },
                 
            ];

            if(this.templateData.documentSource.destType === 'directory'){
                res.push({ label: 'Dokumenten Verzeichnis Parser', value: this.templateData.documentSource.dirParser ?? 'N/A' });
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
    setup() {
        const sessionStore = useSessionStore();
        const encryptedStore = useEncryptedStore();
        const brifleStore = useBrifleStore();
        const tenantId = ref<string>('');
        const apiId = ref<string>('');
        const apiKey = ref<string>('');
        const account = ref<null|{ tenantId?: string; apiKey?: string, apiEnv: ApiEnvironment, sftpData?: SftpData[] }>(null);
       
        const templateData = ref<BulkSendTemplate | null>(null);
        const templateName = ref('Lade Vorlage...');
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
            sessionStore, encryptedStore, brifleStore, tenantId, apiId, apiKey, account, userExistenceStatus, totalChecking, totalChecked,
            templateData, templateName, fileReceiverMapping, sendTemplateService, receiverRecords, receiversSource, documentsSource, pillColors, basePath, sendDocsRecords, selected, parsersProvider,
            receiverParsersRules, selectAll, showConfirmationDialog, failedItems, successItems, isSending, showReport, isLoading, hasStarted
        };
    },
    methods: {
        async sendDocuments() {
            this.showConfirmationDialog = false;
            this.sendAll().then(() => {
                this.$q.notify({
                    color: 'green',
                    message: `Der Versandprozess wurde abgeschlossen. ${this.successItems.length} Einträge wurden erfolgreich versendet, ${this.failedItems.length} Einträge konnten nicht versendet werden.`,
                    
                });
            }).catch((err) => {
                console.error('Error sending documents', err);
                this.$q.notify({
                    message: 'Es ist ein Fehler beim Versandprozess aufgetreten. Bitte versuchen Sie es erneut.',
                    color: 'red',
                });
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
                    return 'Per Post versenden';
                case 'skip':
                case 'ignore':
                    return 'Empfänger überspringen';
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
                this.templateName = 'Fehler beim Laden der Vorlage';
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
                this.$q.notify({
                    color: 'negative',
                    message: e.message || 'Fehler beim Überprüfen des Empfängers',
                    icon: 'error'
                });
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
            this.$q.notify({
                message: 'Fehler beim Laden der benutzerdefinierten Parser',
                color: 'red',
                position: 'top',
                timeout: 2000,
            });
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
            this.$q.notify({
                message: 'Fehler: Ausgewählter Parser nicht gefunden',
                color: 'red',
                position: 'top',
                timeout: 2000,
            });
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