<template>
    <p-page class="wrapper">
        <h4 class="text-center">Deckblätter</h4>

        <div class="q-my-xl">
            <q-card class="q-pa-md" > 
            <div>
                <FileDragAndDrop @drop="onDrop" />
               <AddCoverLetterModal 
               v-if="contentValue != null"
               v-model="showAddCoverLetterModal"
               @create="createCoverLetter"
               :content-value="contentValue!">

                </AddCoverLetterModal>
                
            </div>
            <div class="q-my-md">
                <q-icon name="info" class="q-mr-sm" />
                Weitere Deckblatter können Per Drag and Drop hinzugefügt werden.
            </div>
            </q-card>   
        </div>

        <q-card>
            <q-list class="cover-letter-selection-list">
            <q-item v-for="coverLetter in allCoverLetters" :key="coverLetter.name"
                clickable>
                <q-item-section>
                    <q-item-label>{{ coverLetter.displayName }}</q-item-label>
                    <q-item-label caption>
                        Typ: {{ coverLetter.type === 'default' ? 'Standard' : 'Benutzerdefiniert' }}
                    </q-item-label>
                </q-item-section>
                <q-item-section side>
                    <div>
                        <q-btn
                        v-if="coverLetter.type !== 'default'"
                        color="red"
                        @click="confirmDeleteItem(coverLetter)"
                        class="q-mr-sm"
                    >
                          
                        <q-icon name="delete"/>     
                    </q-btn>
                    <q-btn 
                        color="secondary" 
                        outline 
                        @click="displayPreview(coverLetter!)">
                        <q-icon name="visibility"/>
                    </q-btn>
                    </div>
                    </q-item-section>
            </q-item>
        </q-list>
        </q-card>
        <q-dialog v-model="confirmDelete" persistent>
                            <q-card>
                                <q-card-section class="row items-center">
                                <q-avatar icon="delete" color="red" text-color="white" />
                                <span class="q-ml-sm">Möchtest du das Deckblatt "{{ selectedDeleteItem?.name }}" wirklich löschen?</span>
                                </q-card-section>

                                <q-card-actions align="right">
                                <q-btn flat label="Abbrechen" color="primary" @click="confirmDelete = false" />
                                <q-btn flat label="Löschen" color="red" @click="deleteItem()" />
                                </q-card-actions>
                            </q-card>
                        </q-dialog>
        <q-dialog v-model="showPreview" class="full-size-modal" :key="'previewDialog'+previewContentName">
            <q-card>
                <div class="row w-100">
                <div class="col-2">
                   
                </div>
                <div class="col text-center">
                    <div class="text-h6 q-pa-md">
                        Deckblatt Vorschau
                    </div>
                </div>
                <div class="col-2 text-right">
                    <q-btn icon="close" flat round dense class="q-mr-md q-mt-md" @click="showPreview = false" />
                </div>
            </div>
                <q-card-section class="q-pa-lg">
                    <DocumentView
                            :baseKey="previewContentName"
                            :content="getPreviewContent()"
                            />
                </q-card-section>
            </q-card>
        </q-dialog>
    </p-page>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';  


import BrifleApi from 'src/services/node/Brifle'; 
import { useSessionStore } from 'src/stores/session-store';
import { useEncryptedStore } from 'src/stores/encrypted-store';
import { useBrifleStore } from 'src/stores/brifle-store';
import { AccountData, ApiEndpoints } from 'app/src-electron/models/EncryptedStore';
import { ContentBody } from '@brifle/brifle-sdk';
import FileDragAndDrop, { FileContent } from 'src/components/ui-elements/FileDragAndDrop.vue';

 
import DocumentView from 'src/components/ui-elements/DocumentView.vue'; 
import AddCoverLetterModal, { CoverLetterCreateValue } from './modals/AddCoverLetterModal.vue';

interface CoverLetterSelectionValue {
    name: string;
    type: 'default' | 'custom';
    displayName: string;
}



export default defineComponent({
    name: 'CoverLettersPage',
    components: {
        DocumentView, FileDragAndDrop, AddCoverLetterModal
    },
    setup() {
        const allCoverLetters = ref<CoverLetterSelectionValue[]>([
        ]);
        const brifleApi = new BrifleApi();
        const loading = ref(false);
        const sessionStore = useSessionStore();
        const encryptedStore = useEncryptedStore();
        const apiKey = ref<string>('');
        const apiId = ref<string>('');
        const brifleStore = useBrifleStore();
        const account = ref<AccountData | null>(null);
        const tenantId = ref<string>('');
        const showPreview = ref(false);
        const previewContent = ref<string | null>(null);         
        // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
        const contentValue = ref<FileContent | null>(null);
        const showAddCoverLetterModal = ref(false);
        const previewContentName = ref<string>('');
        const confirmDelete = ref(false);
        const selectedDeleteItem = ref<{name: string, type: 'default' | 'custom'} | null>(null);
        
        return {
            allCoverLetters,
            brifleApi,
            loading,
            account,
            apiKey,
            apiId,
            tenantId,
            sessionStore,
            encryptedStore,
            brifleStore,
            showPreview,
            previewContent,
            contentValue,
            showAddCoverLetterModal,
            previewContentName,
            confirmDelete,
            selectedDeleteItem,
        }; 
    }, 
    mounted() {
      

        this.loading = true;
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
                    this.loadData();                    
                } else {
                    this.apiKey = '';
                }
            });
        } else {
            this.apiKey = '';
            this.apiId = ''; 
        }
        
    },
    methods: {
        deleteItem(){
            if (!this.selectedDeleteItem) return;
            
            void BrifleApi.content().deleteCoverLetter(this.apiId, this.tenantId, this.selectedDeleteItem.name)
            .then(response => {
                if(response?.isSuccess) {                    
                    this.$q.notify({
                        type: 'positive',
                        message: 'Deckblatt erfolgreich gelöscht',
                    });
                    this.loadData();
                } else {
                    console.error('Error deleting cover letter:', response.error);
                    this.$q.notify({
                        type: 'negative',
                        message: 'Fehler beim Löschen des Deckblatts',
                    });
                }
            }).finally(() => {
                this.confirmDelete = false;
                this.selectedDeleteItem = null;
            });
        },
        confirmDeleteItem(coverLetter: {name: string, type: 'default' | 'custom'}) {
            this.selectedDeleteItem = coverLetter;
            this.confirmDelete = true;
        },
        uint8ToBase64(bytes: Uint8Array): string {
            let binary = "";
            const chunkSize = 0x8000; // 32 KB chunks

            for (let i = 0; i < bytes.length; i += chunkSize) {
                binary += String.fromCharCode(
                ...bytes.subarray(i, i + chunkSize)
                );
            }

            return btoa(binary);
        },
        createCoverLetter(value: CoverLetterCreateValue) {        
            this.loading = true;
            const base64Content = this.uint8ToBase64(value.content.content);
            const opts : {description?: string} = {};
            if (value.description) {
                opts.description = value.description;
            }
            BrifleApi.content().createCoverLetter(this.apiId, this.tenantId, value.name, base64Content, opts)
            .then(response => {
                if(response?.isSuccess) {
                    this.$q.notify({
                        type: 'positive',
                        message: 'Deckblatt erfolgreich erstellt',
                    });
                    this.loadData();
                } else {
                    console.error('Error creating cover letter:', response.error);
                    this.$q.notify({
                        type: 'negative',
                        message: 'Fehler beim Erstellen des Deckblatts',
                    });
                }
            })
            .catch(error => {
                console.error('Error creating cover letter:', error);
                this.$q.notify({
                    type: 'negative',
                    message: 'Fehler beim Erstellen des Deckblatts', 
                });
            }).finally(() => {
                this.loading = false;
            });
        },
    getPreviewContent() : ContentBody[] {       
        return this.previewContent ? [{
            type: 'application/pdf',
            content: this.previewContent
        }] : [];
    },
    onDrop(fileContent : FileContent[]) {
        if (fileContent.length === 0) return;
        this.contentValue = fileContent[0]!;
        this.showAddCoverLetterModal = true;
        // Handle the dropped files here
    },
    displayPreview(coverLetter: CoverLetterSelectionValue) {
        this.showPreview = true;
        this.loading = true;
        this.previewContentName = coverLetter.displayName;
        BrifleApi.content().contentCoverLetterGet(this.apiId, this.tenantId, coverLetter.type, coverLetter.name)
        .then(response => {         
            if(response?.isSuccess) {                
                this.previewContent = response.data || null;  
            }else{
                this.showPreview = false;   
                console.error('Error fetching cover letter preview:', response.error);
                 this.$q.notify({
                    type: 'negative',
                    message: 'Fehler beim Laden der Deckblatt Vorschau', 
                });
            }
        })
        .catch(error => {         
            this.showPreview = false;   
            console.error('Error fetching cover letter preview:', error);
            this.$q.notify({
                type: 'negative',
                message: 'Fehler beim Laden der Deckblatt Vorschau', 
            });
        }).finally(() => {            
            this.loading = false;
        });
    },
        loadData(){
            this.loading = true;
            BrifleApi.content().listCoverLetters(this.apiId,this.tenantId)
                .then(response => {
                    if (response.isSuccess) {
                    this.allCoverLetters = response.data?.cover_letters.map(cl => ({
                        name: cl.name,
                        type: cl.type as 'default' | 'custom',
                        displayName: cl.display_name,
                    }) ) || [];
                    }
                })
                .catch(error => {
                    console.error('Error fetching cover letters:', error);
                }).finally(() => {
                    this.loading = false;
                });
                },
        goTo (path: string) {
            void this.$router.push({ path });
        },
    },
});
</script>