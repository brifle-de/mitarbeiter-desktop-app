<template>
    <h4>Übersicht</h4>
    <div class="overview_grid q-my-lg">
        <div>     
            <div class="text-bold text-h5">
                {{ brifleReceivers.length }}
            </div>  
            <div class="text-h6">
                Brife Empfänger
            </div>
            <div class="q-pt-lg">
                <q-btn color="accent" @click="showReceiversModal(brifleReceivers)">
                    Anzeigen
                </q-btn>
            </div>
            
        </div>      
        <div>     
            <div class="text-bold text-h5">
                {{ externalReceivers.length }}
            </div>  
            <div class="text-h6">
                Externe Empfänger
            </div>
            <div class="q-pt-lg">
                <q-btn color="accent" @click="showReceiversModal(externalReceivers)">
                    Anzeigen
                </q-btn>
            </div>          
        </div>    
        <SendDocsModal 
        v-model="showReceivers"
        :records="showReceiversRecords"
        ></SendDocsModal>       
    </div>
    <div class="overview_card">
        <div class="text-h6">Externe Empfänger werden:</div>
        <div class="text-h5">
            Ignoriert
        </div>
    </div>
    <div class="overview_card q-mt-lg">
        <div class="text-h6">Betreff:</div>
        <div class="text-h5">
            {{ subject }}
        </div>
    </div>
    <div class="q-mt-lg row">
        <div class="col-9">
            <q-checkbox v-model="confirmedSend"  
            color="accent"
            label="Ich habe die Eingabe überprüft" />
        </div>
        <div class="col-3 text-right">
            <q-btn color="secondary" :disable="!confirmedSend"
            :loading="hasStarted" 
            @click="sendAll"
            text-color="black" icon="send" >
            
        </q-btn>
        </div>
    </div>
    <h5>
        Prozess
    </h5>
    <!-- grid 3 col -->
     <div class="result-grid">
        <div>
            <div class="text-bold text-h5">
                {{ totalDocs - failedItems.length - successItems.length }} 
            </div>
            <div class="text-h6 q-py-md" style="height: 60px;">
                Ausstehende Dokumente
            </div>            
        </div>
        <div>
            <div class="text-bold text-h5">
                {{ failedItems.length }}
            </div>
            <div class="text-h6 q-py-md" style="height: 60px;">
                Dokumente nicht versendet
            </div>             
        </div>
        <div>
            <div class="text-bold text-h5">
                {{ successItems.length }}
            </div>
            <div class="text-h6 q-py-md" style="height: 60px;">
                Dokumente erfolgreich versendet
            </div>
        </div>
     </div>
    
</template>
<style lang="scss" scoped>

    $bg-grid-item: #f0f0f022;
    $bg-grid-item-hover: #f0f0f033;
    $bg-grid-item-active: #f0f0f02c;

    .result-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;

    }

    .overview_grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
    }
    .overview_grid > div, .overview_card, .result-grid > div {
        background-color: $bg-grid-item;
        padding: 20px;
        min-height: 200px;
        border-radius: 10px;        
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        border: 3px solid $bg-grid-item;
    }
</style>
<script lang="ts">

import { defineComponent, ref } from 'vue';
import { SendDocReq } from '../util/receivers/receiverRecord';
import BrifleApi from 'src/services/node/Brifle';
import Sftp from 'src/services/node/Sftp';
import Files from 'src/services/node/Files';
import { useBrifleStore } from 'src/stores/brifle-store';
import { useEncryptedStore } from 'src/stores/encrypted-store';
import { AccountData, ApiEndpoints } from 'app/src-electron/models/EncryptedStore';
import { useSessionStore } from 'src/stores/session-store';

import SendDocsModal from './modal/SendDocsModal.vue';

export default defineComponent({
    name: 'SendingOverviewPage',
    emits: ['sent'],
    components: {
        SendDocsModal,
    },
    computed: {
        externalReceivers(){
            return this.sendDocRecord.filter((record: SendDocReq) => {
                return record.exists === false;
            });
        },
        brifleReceivers(){
            return this.sendDocRecord.filter((record: SendDocReq) => {
                return record.exists === true;
            });
        },
        totalDocs(){
            if(this.externalAction === 'ignore') {
                return this.brifleReceivers.length;
            }else if(this.externalAction === 'letter') {
                return this.externalReceivers.length + this.brifleReceivers.length; 
            }
            return this.brifleReceivers.length;
        }
    },
    props: {
        sendDocRecord: {
            type: Array<SendDocReq>,
            required: true,
        },
        subject: {
            type: String,
            required: true,
        },
    },
    methods: {
        async sendAll() {
            this.successItems = [];
            this.failedItems = [];
            this.hasStarted = true;
            for(const record of this.brifleReceivers) {
                void await this.sendItem(record);
            }
            // all sent
            this.$emit('sent', {
                success: this.successItems,
                failed: this.failedItems,
                notBrifle: this.externalReceivers,
            });
        },
        async getContent(record: SendDocReq) {
            // get content from the record
            if(record.doc.type === 'sftp' && record.doc.filePath && record.doc.sftp) {
                return await Sftp.readFile(record.doc.filePath, record.doc.sftp, 'base64')
                
            }else if(record.doc.type === 'file' && record.doc.filePath) {
                return await Files.readFile(record.doc.filePath, 'base64');               
            }
            return null;
        },
        async sendItem(record: SendDocReq){
            // get content
            const contentBase64 = await this.getContent(record);            
            if(contentBase64 && record.receiver ) {
                void BrifleApi.content().contentSendContent(this.apiId, this.tenantId, {
                    subject: this.subject,
                    to: record.receiver.req,
                    body: [
                        {
                            type: 'application/pdf',
                            content: contentBase64,
                        }
                    ],
                    type: 'letter'
                }).then((response) => {
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
        showReceiversModal(records: SendDocReq[]) {
            this.showReceivers = true;
            this.showReceiversRecords = records;
        },
    },
    mounted() {
        // get session data
        const accountId = this.session.getSelectedAccountId as string;
        // get account data
        this.account = this.encryptedStore.getAccount(accountId) ?? null;
        this.apiKey = this.account?.apiKey ?? '';
        // get api 
        if(this.account) {            
            this.tenantId = this.account.tenantId;
             void this.brifleStore.getApi(this.account.apiKey, ApiEndpoints.getEndpoint(this.account.apiEnv)).then(api => {
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
    
    },
    setup () {
        const confirmedSend = ref(false);
        const failedItems = ref<SendDocReq[]>([]);
        const successItems = ref<SendDocReq[]>([]);
        const apiKey = ref<string>('');
        const apiId = ref<string>('');
        const brifleStore = useBrifleStore();
        const encryptedStore = useEncryptedStore();
        const account = ref<AccountData | null>(null);
        const session = useSessionStore();
        const tenantId = ref<string>('');
        const showReceivers = ref<boolean>(false);
        const showReceiversRecords = ref<SendDocReq[]>([]);
        const hasStarted = ref<boolean>(false);
        const externalAction = ref<string>('ignore');
        return {
            confirmedSend,
            failedItems,
            successItems,
            apiKey,
            apiId,
            brifleStore,
            encryptedStore,
            account,
            session,
            tenantId,
            showReceivers,
            showReceiversRecords,
            hasStarted,
            externalAction
        };
    },
});

</script>