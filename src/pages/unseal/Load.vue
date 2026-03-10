<template>
     <div>
        <h4>Initialisiere Anwendung</h4>
    </div>
    <div class="muted-container-purple text-subtitle1 q-pa-md q-mt-md">
        Die Anwendung ist versiegelt. Bitte gibt das vergebene Passwort ein, um die Anwendung zu entsperren.
    </div>
    <div class="q-mt-lg">
        <q-input v-model="password" filled 
        color="secondary"
        :type="isPwd ? 'password' : 'text'"  
        @keyup.enter="unsealApp()"
        label="Passwort">
        <template v-slot:append>
          <q-icon
            :name="isPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPwd = !isPwd"
          />
        </template>
      </q-input> 
    </div>
    <div class="text-right">
        <q-btn
        class="q-mt-lg q-px-md text-subtitle1 muted-action-btn"
        label="Entsiegeln"        
        flat
        color="green-2"
        @click="unsealApp()"
    />
    </div>
    <div class="muted-container-orange q-pa-lg  q-mt-xl" v-if="showUpdateBox" >
        <div class="text-bold">
            Update verfügbar
        </div>
        
        <div>
            Die App-Version {{ appUpdateInfo?.version }} ist verfügbar.
        </div>
        <div class="text-right q-mt-lg">
            <q-btn
                class="q-px-md text-subtitle1 muted-action-btn"
                label="Update herunterladen"
                flat
                color="orange-2"
                @click="downloadAndInstallUpdate()"
            />

        </div>
    </div>
</template>
<script lang="ts">

import { defineComponent, ref } from 'vue';
import { useEncryptedStore } from '@src/stores/encrypted-store';
import { UpdateInformation } from 'app/src-electron/service/AppUpdateService';
import EletronService from 'src/services/node/EletronService';

export default defineComponent({
    name: 'UnsealInitPage',
    components: {
    },
    methods: {
        unsealApp () {
            this.encryptedStorage.loadData(this.password).then(() => {              
                void this.$router.push({ path: '/accounts' }); 
            }).catch((err: Error) => {
                console.error('Error unsealing application:', err);
                this.$q.notify({
                    message: 'Das Passwort ist falsch oder es ist ein Fehler beim Laden der Daten aufgetreten. Bitte versuche es erneut.',
                    color: 'negative',
                    icon: 'error',
                });
                console.error(err);
            });
        },
        downloadAndInstallUpdate() {
            this.electronService.downloadAndInstallUpdate().catch((err: Error) => {
                console.error('Error downloading and installing update:', err);
                this.$q.notify({
                    message: 'Beim Herunterladen und Installieren des Updates ist ein Fehler aufgetreten. Bitte versuche es erneut.',
                    color: 'negative',
                    icon: 'error',
                });
            });
        }
    },
    computed: {      
        showUpdateBox(){
            return this.appUpdateInfo !== null && this.appUpdateInfo.isUpdateAvailable;
        }
    },
    mounted() {
        this.electronService.getUpdateInfo().then((updateInfo) => {
            this.appUpdateInfo = updateInfo;
        }).catch((err: Error) => {
            console.error('Error getting update info:', err);
        });
       
    },
    setup () {
        const password = ref<string>('');
        const isPwd = ref<boolean>(true);
        const encryptedStorage = useEncryptedStore();
        const appUpdateInfo = ref<UpdateInformation | null>(null);
        const electronService = new EletronService();
        return {
            password,
            isPwd,
            encryptedStorage,
            appUpdateInfo,
            electronService
        };
    },
});

</script>