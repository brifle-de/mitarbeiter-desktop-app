<template>
    <q-page class="wrapper">
       <div class="q-mt-xl">
        <BackBtn to="/accounts" />
       </div>
       <div class="text-center">
            <h4>Konto anlegen</h4>
       </div>
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
       <div class="bg-accent q-mt-lg q-pa-sm rounded-borders">
            Hinweis: Neue API Keys können in Brifle unter "Einstellungen" erstellt werden.
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
       <div class="bg-accent q-pa-sm rounded-borders">
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
       <div v-if="!requiredFieldsFilledOut && hasSent" class="bg-negative text-white q-pa-sm rounded-borders">
            Es müssen alle Pflichtfelder ausgefüllt werden.
       </div>
       <div class="q-my-lg text-right">
            <q-btn
            class="q-mt-lg q-px-md text-subtitle1"
            label="Konto anlegen"
            rounded
            text-color="black"        
            @click="addAccount()"
            color="secondary"
        />
       </div>

    </q-page>
</template>
<script lang="ts">
import { SftpData, ApiEnvironment, AccountData } from 'app/src-electron/models/EncryptedStore';
import BackBtn from 'src/components/BackBtn.vue';
import { defineComponent, ref } from 'vue';

import { useEncryptedStore } from 'src/stores/encrypted-store';


export default defineComponent({
  name: 'CreateAccountPage',

  components: {
    BackBtn,
  },
  computed: {
    requiredFieldsFilledOut () {
        return this.name.trim() !== '' && this.apiKey.trim() !== '' && this.apiSecret.trim() !== '';
    },
  },
  methods: {
    addNewSftpServer () {
        this.sftpServer.push({
            host: '',
            port: 22,
            username: '',
            password: '',
            displayName: '',
        });
    },
    addAccount () {
        if (!this.requiredFieldsFilledOut) {
            this.hasSent = true;
            return;
        }
        const accountData : AccountData = {
            name: this.name,
            apiKey: this.apiKey,
            apiSecret: this.apiSecret,
            sftpData: this.sftpServer,
            apiEnv: this.apiEnv,
            id: ""
        };
        // save account data to encrypted store
        this.encryptedStore.createAccount(accountData).then(() => {
            void this.$router.push({ path: '/accounts' });
        }).catch((err: Error) => {
            console.error(err);
        });
    },
  },
  setup () { 
    const name = ref<string>('');
    const apiKey = ref<string>('');
    const apiSecret = ref<string>('');
    const sftpServer = ref<SftpData[]>([]);
    const apiEnv = ref<ApiEnvironment>(ApiEnvironment.PRODUCTION);
    const hasSent = ref<boolean>(false);
    const encryptedStore = useEncryptedStore();
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
        encryptedStore
    };
  },

});
</script>