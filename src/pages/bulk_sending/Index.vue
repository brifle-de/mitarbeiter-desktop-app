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
          <q-btn @click="step = 2" color="secondary" text-color="black" label="Weiter" />
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
        />

        <q-stepper-navigation>
          <q-btn @click="step = 3" color="primary" label="Continue" />
          <q-btn flat @click="step = 1" color="primary" label="Back" class="q-ml-sm" />
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

      </q-step>

      <q-step
        :name="4"
        title="Create an ad"
        color="secondary"
        icon="add_comment"
      >
        Try out different ad text to see what brings in the most customers, and learn how to
        enhance your ads using features like ad extensions. If you run into any problems with
        your ads, find out how to tell if they're running and how to resolve approval issues.

        <q-stepper-navigation>
          <q-btn color="primary" label="Finish" />
          <q-btn flat @click="step = 2" color="primary" label="Back" class="q-ml-sm" />
        </q-stepper-navigation>
      </q-step>
    </q-stepper>
  </div>
    </q-page>
</template>
<script lang="ts">

import { defineComponent, ref } from 'vue';

import { useSessionStore } from 'src/stores/session-store';
import { useEncryptedStore } from 'src/stores/encrypted-store';

import SourceReceivers from './components/SourceReceivers.vue';
import { DocumentSource, ReceiverSource } from './util/helper';
import SourceReceiversParser from './components/SourceReceiversParser.vue';
import SourceDocuments from './components/SourceDocuments.vue';

export default defineComponent({
    name: 'BulkSendingPage',
    components: {
        SourceReceivers, SourceReceiversParser, SourceDocuments
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
        return {
            sessionStore,
            encryptedStore,
            step,
            receiverSrc,
            documentsSrc,
        };
    },
    methods: {
        
    },
});


</script>