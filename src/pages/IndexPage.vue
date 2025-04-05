<template>
  <q-page class="wrapper">
    {{ accountId }}
  </q-page>
</template>

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
