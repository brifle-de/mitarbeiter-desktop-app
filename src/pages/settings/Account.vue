<template>
    <p-page class="wrapper">
        <h4 class="text-center">Konto</h4>
        <div class="bg-fading q-pa-md rounded-borders">

            <!-- fields for account-->
            <h5>
                Kontodaten
            </h5>
            <div>
                    <q-input v-model="name" filled 
                    color="secondary"
                    :type="'text'"  
                    hint="Name zum Erkennen des Kontos"
                    label="Name*">
                    </q-input>        
            </div>
            <div class="row q-mt-md">
                    <div class="col-6 q-pr-md">
                            <q-input v-model="apiKey" filled 
                            color="secondary"
                            :type="'text'"  
                            hint="API Key für den Zugriff auf die API."
                            label="API Key*">
                            </q-input>
                    </div>
                    <div class="col-6 q-pl-md">
                            <q-input v-model="apiSecret" filled 
                            color="secondary"
                            type="password"  
                            hint="API Secret für den Zugriff auf die API."
                            label="API Secret*">
                            </q-input>
                    </div>
            </div> 
            <div class="bg-accent text-white q-mt-lg q-pa-sm rounded-borders">
                    Hinweis: Neue API Keys können in Brifle unter "Einstellungen" erstellt werden.
            </div>
            <div class="q-mt-md">
                <q-input v-model="tenantId" filled
                color="secondary" label="Mandanten ID" 
                hint="Mandanten ID legt den Absender fest.">
                </q-input>
            </div>
            <div class="bg-accent text-white q-mt-lg q-pa-sm rounded-borders">
                Die Mandaten ID kann in Brifle unter 'Einstellungen > Absender' gefunden werden.
            </div>
            <div class="q-mt-md">
                    <!-- select api environment-->
                    <q-select filled v-model="apiEnv" :options="apiEnvs" 
                    emit-value
                    map-options
                    color="secondary"
                    label="API Umgebung" 
                    />
            </div>     
            <h5>
                    Sftp-Server
            </h5>
            <div class="bg-accent text-white q-pa-sm rounded-borders">
                    Hinweis: Die sFTP Daten werden nur lokal und verschlüsselt auf ihrem Computer gespeichert.
            </div>
            <div class="q-mt-md">          
                    <div v-for="(server, index) in sftpServer" 
                    :key="index+'sfpserver'" 
                    class="q-mt-md border q-pa-md rounded-borders">     
                        <div class="row">
                            <div class="col-12 q-px-md"> 
                                <q-input v-model="server.displayName" filled 
                                color="secondary"
                                :type="'text'"
                                hint="Name zum Erkennen des sFTP Servers"  
                                label="Anzeigename">
                                </q-input>     
                            </div>                                 
                        </div>           
                        <div class="row q-my-md">
                            <div class="col-6 q-px-md">
                                <q-input v-model="server.host" filled 
                                color="secondary"
                                :type="'text'"  
                                label="sFTP Hostname">
                                </q-input> 
                            </div>
                            <div class="col-6 q-px-md">
                                <q-input v-model="server.port" filled 
                                color="secondary"
                                :type="'text'"  
                                label="sFTP Port">
                                </q-input>
                            </div>                    
                        </div>
                        <div class="row">
                            <div class="col-6 q-px-md">
                                <q-input v-model="server.username" filled 
                                color="secondary"
                                type='text'  
                                label="sFTP Username">
                                </q-input>
                            </div>   
                            <div class="col-6 q-px-md">
                                <q-input v-model="server.password" filled 
                                color="secondary"
                                type='password'  
                                label="sFTP Passwort">
                                </q-input>
                            </div>                   
                        </div>
                        <div class="text-right q-my-lg q-px-md">
                            <q-btn 
                            @click="sftpServer.splice(index, 1)"
                            color="negative">
                                <q-icon name="delete" size="1.5rem" color="white" />
                            </q-btn>
                        </div>
                        
                    </div>
            </div>
            <div class="q-my-lg text-center">
                <!-- add new sfpt server-->
                <q-btn 
                @click="addNewSftpServer()"
                color="blue-grey-9">
                    +
                </q-btn>
            </div>
            <div class="q-my-lg">
                Pflichtfelder sind mit * gekennzeichnet.
            </div>
        </div>
        <div v-if="!requiredFieldsFilledOut" class="bg-negative text-white q-mt-lg q-pa-sm rounded-borders">
            Hinweis: Bitte füllen Sie alle Pflichtfelder aus.
        </div>
        <div class="text-right q-my-lg">
            <q-btn
            class="q-mt-lg q-px-md text-subtitle1"
            label="Änderungen speichern"
            rounded
            text-color="black"        
            color="secondary"
            @click="saveAccount()"
            :disable="!isDirty"
            />

        </div>
        <q-list class="q-mt-xl bg-fading rounded-borders q-pa-md">   
            <h5 class="text-negative">Gefährlicher Bereich</h5> 
            <q-item class="q-mt-xl" clickable @click="showExportAccountModal = true">
                <q-item-section avatar>
                    <q-icon name="download" size="2.5rem" color="primary" />
                </q-item-section>
                <q-item-section class="text-h6">Download Konto Backup</q-item-section>

            </q-item>        
            <q-item class="q-mt-xl" clickable @click="deleteAccount()">
                <q-item-section avatar>
                    <q-icon name="delete" size="2.5rem" color="negative" />
                </q-item-section>
                <q-item-section class="text-h6 text-negative">Konto löschen</q-item-section>
            </q-item>
            <ExportAccountModal
            v-model="showExportAccountModal"
            @export="backupAccount($event)"
        />
        </q-list>
        
    </p-page>
</template>
<script lang="ts">

import { defineComponent, ref } from 'vue';

import { useEncryptedStore } from '@src/stores/encrypted-store';
import { useSessionStore } from 'src/stores/session-store';
import { AccountData, ApiEnvironment, SftpData } from 'app/src-electron/models/EncryptedStore';
import ExportAccountModal from './modals/exportAccountModal.vue';

export default defineComponent({
    name: 'SettingsAccountPage',
    components: {
        ExportAccountModal,
    },
    setup () {
        const sessionStore = useSessionStore();
        const name = ref<string>('');
        const apiKey = ref<string>('');
        const apiSecret = ref<string>('');
        const sftpServer = ref<SftpData[]>([]);
        const apiEnv = ref<ApiEnvironment>(ApiEnvironment.PRODUCTION);
        const hasSent = ref<boolean>(false);
        const encryptedStore = useEncryptedStore();
        const lastData = ref<AccountData|null>(null);
        const tenantId = ref<string>('');
        const showExportAccountModal = ref<boolean>(false);
        const apiEnvs = [
            {
                label: 'Produktion',
                value: ApiEnvironment.PRODUCTION,
            },
            {
                label: 'Sandbox',
                value: ApiEnvironment.SANDBOX,
            },
            {
                label: 'Internal',
                value: ApiEnvironment.INTERNAL,
            },
        ]
        return { 
            name,
            apiKey,
            apiSecret,
            sftpServer,
            apiEnvs,
            hasSent,
            apiEnv,
            encryptedStore,
            sessionStore,
            lastData,
            tenantId,
            showExportAccountModal,
        };  
    },
    mounted() {
        const selectedAccountId = this.sessionStore.selectedAccountId
        if (!selectedAccountId) {
            console.error('No account selected for deletion.');
            return;
        }
        // copy to avoid reference issues
        const selectedAccount = this.cpAccount(this.encryptedStore.getAccount(selectedAccountId))
        if (selectedAccount) {
            this.name = selectedAccount.name
            this.apiKey = selectedAccount.apiKey
            this.apiSecret = selectedAccount.apiSecret
            this.sftpServer = selectedAccount.sftpData || []
            this.apiEnv = selectedAccount.apiEnv      
            this.tenantId = selectedAccount.tenantId || ''      
        }       
        // copy to avoid reference issues
        this.lastData = this.cpAccount({
            name: this.name,
            apiKey: this.apiKey,
            apiSecret: this.apiSecret,
            sftpData: this.sftpServer,
            apiEnv: this.apiEnv,
            id: selectedAccountId || '',
            tenantId: this.tenantId,
        })
    },
    computed: {
        requiredFieldsFilledOut () {
            return this.name && this.apiKey && this.apiSecret;
        },
        isDirty () {
            const hasFtpServerUpdated = this.sftpServer.some((server, index) => {
                if (!this.lastData?.sftpData) {
                    return true; // If lastData is not available, consider it as updated
                }
                return server.host !== this.lastData?.sftpData[index]?.host ||
                    server.port !== this.lastData?.sftpData[index]?.port ||
                    server.username !== this.lastData?.sftpData[index]?.username ||
                    server.password !== this.lastData?.sftpData[index]?.password ||
                    server.displayName !== this.lastData?.sftpData[index]?.displayName;

            });
           
            return this.name !== this.lastData?.name ||
                this.apiKey !== this.lastData?.apiKey ||
                this.apiSecret !== this.lastData?.apiSecret ||
                this.sftpServer.length !== this.lastData?.sftpData?.length ||
                hasFtpServerUpdated ||
                this.tenantId !== this.lastData?.tenantId ||
                this.apiEnv !== this.lastData?.apiEnv;
        },
    },
    methods: {
        backupAccount(event: { password: string }) {
            const accountData : AccountData = this.cpAccount({
                name: this.name,
                apiKey: this.apiKey,
                apiSecret: this.apiSecret,
                sftpData: this.sftpServer,
                apiEnv: this.apiEnv,
                id: this.sessionStore.selectedAccountId || '',
                tenantId: this.tenantId,
            });
            const password = event.password;
            void this.encryptedStore.exportAccount(password, accountData).then((exportData) => {
                if (!exportData) {
                    console.error('Export failed or no data to export.');
                    return;
                }
                // trigger download
                const blob = new Blob([exportData], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');  
                a.href = url;
                a.download = `${accountData.name || 'account'}.json`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            });
        },
        cpAccount(account?: AccountData) {
            if (!account) {
                return null;
            }
            return JSON.parse(JSON.stringify(account));       
        },
        addNewSftpServer () {
            this.sftpServer.push({
                host: '',
                port: 22,
                username: '',
                password: '',
                displayName: '',
                // random id for the sftp server
                id: Math.random().toString(36).substring(2, 15),
            });
        },
        goTo (path: string) {
            void this.$router.push({ path });
        },
        saveAccount(){
            // copy to avoid reference issues
            const accountData : AccountData = this.cpAccount({
                name: this.name,
                apiKey: this.apiKey,
                apiSecret: this.apiSecret,
                sftpData: this.sftpServer,
                apiEnv: this.apiEnv,
                id: this.sessionStore.selectedAccountId || '',
                tenantId: this.tenantId,
            });
            this.encryptedStore.updateAccount(accountData).then(() => {
                this.lastData = accountData
            }).catch((err: Error) => {
                console.error(err);
            });
        },
        deleteAccount(){            
            const selectedAccountId = this.sessionStore.selectedAccountId
            if (!selectedAccountId) {
                console.error('No account selected for deletion.');
                return;
            }
            void this.encryptedStore.deleteAccount(selectedAccountId).then(() => {
                this.$q.notify({
                    color: 'positive',
                    message: 'Konto erfolgreich gelöscht.',
                    icon: 'check'
                });
                void this.$router.push({ path: '/accounts' });
            }).catch(() => {
                this.$q.notify({
                    color: 'negative',
                    message: 'Fehler beim Löschen des Kontos.',
                    icon: 'error'
                });
            });
        }
    },
});

</script>