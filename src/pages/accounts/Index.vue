<template>
    <q-page class="wrapper">
        <h4 class="text-center">Konto auswählen</h4>
        <div class="q-mt-xl">
            <div v-if="isLoading" class="text-center">
                <q-spinner color="secondary" size="50px" />
                <div class="q-my-lg">Verbinden mit Server</div>

            </div>
            <q-list v-else bordered class="rounded-borders q-pa-lg q-lg-xl">
                <q-item-label header>Konten</q-item-label>
                <q-item clickable v-ripple v-for="account in availableAccounts" 
                    :key="account.id"
                    @click="selectAccount(account.id)"
                    :class="{ 'bg-primary text-white': selectedAccount === account.id }"
              >
                   {{ account.name }}
                </q-item>

                <q-separator v-if="availableAccounts.length>0" inset="item" class="q-my-lg" />

                <div class="text-center q-mt-lg">
                    <q-btn outline 
                    @click="$router.push({ path: '/accounts/create' })"
                    color="secondary" class="q-mt-lg q-px-md text-subtitle1">
                        <q-icon name="add" class="q-mr-sm" />
                        <span>Neues Konto erstellen</span>
                    </q-btn>
                </div>
               
            </q-list>

        </div>
    </q-page>
</template>
<script lang="ts">

import { defineComponent, ref } from 'vue';

import { useEncryptedStore } from 'src/stores/encrypted-store';
import { useSessionStore } from 'src/stores/session-store';
import { AccountData } from 'app/src-electron/models/EncryptedStore';

export default defineComponent({
    name: 'AcocountSelectionPage',
    setup() {
       const availableAccounts = ref<AccountData[]>([

       ]);
       const selectedAccount = ref<string|null>(null);
       const encryptedStore = useEncryptedStore();
       const sessionStore = useSessionStore();
       const isLoading = ref<boolean>(false);
       return {
            availableAccounts,
            selectedAccount,
            encryptedStore,
            sessionStore,
            isLoading,

        };
    },
    methods: {
        selectAccount(accountId: string) {
            this.isLoading = true;
            this.selectedAccount = accountId;           
            this.sessionStore.setSelectedAccountId(accountId);                      
            void this.$router.push({ path: '/' }).finally(() => {
                this.isLoading = false; 
            });
        },
    },
    mounted() {
        this.availableAccounts = this.encryptedStore.accounts        
    }
});


</script>