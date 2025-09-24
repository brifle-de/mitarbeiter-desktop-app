<template>
    <q-page class="wrapper">
        <div class="q-pa-md">
            <h4 class="text-center">Massenversand</h4>            
        </div>
        <div class="q-pa-md">
    <q-stepper
      v-model="step"
      vertical
      flat
      color="secondary" 
      animated
    >
      <q-step
        :name="1"
        title="Quelle - Empfänger"
        color="secondary"
        icon="settings"
        :done="step > 1"
      >
        
            <SourceReceivers v-model="receiverSrc" />


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
        title="Suche - Empfänger Brifle Account"
        color="secondary"
        icon="add_comment"
      >     
      <SearchReceivers
        :receiverRecords="receiverRecords"
        :documentRecords="documentRecords"
        @confirmed="onConfirmedDocuments($event)"
      />
        
      </q-step>
      <q-step
        :name="6"
        :disable="step < 6"
        :done="step > 6"
        title="Aktion - Nicht Brifle Empfänger"
        color="secondary"
        icon="local_post_office"
      >
        <NonExistingReceiversAction
          @update="actionNotBrifle = $event"
        />
        <q-stepper-navigation>
          <q-btn @click="step = 7" color="secondary" text-color="black" label="Weiter" />
        </q-stepper-navigation>
    
    </q-step>
    <q-step
        :name="7"
        :disable="step < 7"
        :done="step > 7"
        title="Betreff"
        color="secondary"
        icon="title"
      >
      <div class="q-my-lg text-center">
          <q-input filled
          v-model="subject"
          color="secondary"
          label="Betreff"
          class="q-mt-lg"
          />
          <q-stepper-navigation>
            <q-btn @click="step = 8" color="secondary" 
            :disable="subject === ''"
            text-color="black" label="Weiter" />
          </q-stepper-navigation>

      </div>

    </q-step>
      <q-step
        :name="8"
        :disable="step < 8"
        :done="step > 8"
        title="Übersicht"
        color="secondary"
        icon="assignment_turned_in"
      >

      <SendingOverviewPage
      :subject="subject"
      :send-doc-record="docsToSend"
      :action-not-brifle="actionNotBrifle"
      @sent="sentAll($event)"
      >

      </SendingOverviewPage>
    </q-step>
    <q-step
        :name="9"
        :disable="step < 9"
        :done="step > 9"
        title="Bericht"
        color="secondary"
        icon="send"
      >
      <SendReports
      :success-records="reportSuccess"
      :error-records="reportError"
      :not-brifle-records="reportNotBrifle"
      ></SendReports>
    </q-step>
    </q-stepper>
  </div>
    </q-page>
</template>
<style lang="scss">
   
</style>
<script lang="ts">

import { defineComponent, ref } from 'vue';

import { useSessionStore } from 'src/stores/session-store';
import { useEncryptedStore } from 'src/stores/encrypted-store';

import SourceReceivers from './components/SourceReceivers.vue';
import { DocumentSource, ReceiverSource } from './util/helper';
import SourceReceiversParser from './components/SourceReceiversParser.vue';
import SourceDocuments from './components/SourceDocuments.vue';
import SourceDocumentsParser from './components/SourceDocumentsParser.vue';
import SearchReceivers from './components/SearchReceivers.vue';

import ReceiverRecord, { SendDocReq } from './util/receivers/receiverRecord';
import DocumentRecord from './util/documents/documentRecord';
import NonExistingReceiversAction, { NonExistingReceiverAction } from './components/NonExistingReceiversAction.vue';
import SendingOverviewPage from './components/SendingOverview.vue';
import SendReports from './components/SendReports.vue';
import Logger from 'src/services/node/Log';


export default defineComponent({
    name: 'BulkSendingPage',
    components: {
        SourceReceivers, SourceReceiversParser, SourceDocuments, 
        SourceDocumentsParser, SearchReceivers, NonExistingReceiversAction,
        SendingOverviewPage, SendReports,
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
          paperMailTestEmailRecipient: ''
        });
        const subject = ref<string>('');
        const reportSuccess = ref<SendDocReq[]>([]);
        const reportError = ref<SendDocReq[]>([]);
        const reportNotBrifle = ref<SendDocReq[]>([]);
        return {
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
        };
    },
    computed: {
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
    methods: {
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
      onParsedReceivers (parsed: ReceiverRecord[]) {
        this.receiverRecords = parsed;
        Logger.debug("Parsed receivers: " + this.receiverRecords.length);
      },
      onParsedDocuments (parsed: DocumentRecord[]) {
        this.documentRecords = parsed;
        Logger.debug("Parsed documents: " + this.documentRecords.length);
      },
        
    },
});


</script>