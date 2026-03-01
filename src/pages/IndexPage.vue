<template>
  <q-page class="q-px-xl">

      <div class="text-h3 q-my-xl">Startseite</div>

      <q-separator class="q-mb-lg q-mt-xl" />

      <div class="row q-col-gutter-x-md q-col-gutter-y-lg">
        <div class="">
          <q-card class="q-pa-md clickable material-card material-card-muted home_item" @click="$router.push('/outbox/send')" >
            <div class="text-h3 text-center">
               <img src="~assets/img/invoice.png" style="width: 150px; aspect-ratio: 1;"/>
            </div>
            <div class="text-h5 text-center">
              Dokument versenden
            </div>
          </q-card>
        </div>      
        <div>
           
          <q-card class="q-pa-md clickable material-card material-card-muted home_item" @click="$router.push('/bulk_sending/receiver_check')" >
            <div class="text-h3 text-center">
               <img src="~assets/img/letter.png" style="width: 150px; aspect-ratio: 1;"/>
            </div>
            <div class="text-h5 text-center">
              Empfänger Prüfen
            </div>
          </q-card>
        </div>

      </div>
  </q-page>
</template>

<style lang="scss" scoped>
.home_item {
  transition: transform 0.2s ease-in-out;
  width: 22.5vw;
}
</style>

<script lang="ts">
import { defineComponent } from 'vue';
import EncryptedStorage from '../services/node/EncryptedStoreService';
import { useSessionStore } from 'src/stores/session-store';


export default defineComponent({
  name: 'IndexPage',

  components: {
    
  },
  computed: {
    accountId () {
        return this.sessionStore.selectedAccountId
    },
  },
  methods: {
   
  },
  setup () { 
    const encryptedStorage = new EncryptedStorage();
    const sessionStore = useSessionStore();


    return { encryptedStorage, sessionStore };
  },

});
</script>
