<template>
    <h5>Zuweisungsart</h5>
    <div class="src_grid q-my-lg">
        <div class="text-bold selection-item-box clickable"
            @click="selectTargetSource('file')" :class="{ active: documentSource.destType === 'file' }">
            <div>
                <!-- icon -->
                <q-icon name="text_snippet" size="32px" class="q-mb-sm" />
            </div>
            <div>
                Zuweisungsdatei 
            </div>
            
        </div>
        <div class="text-bold selection-item-box clickable" 
            @click="selectTargetSource('directory')" :class="{ active: documentSource.destType === 'directory' }">
            <div>
                <!-- icon -->
                <q-icon name="folder_open" size="32px" class="q-mb-sm" />
            </div>
            <div>
                Verzeichnis Analyse
            </div>
        </div>
    </div>
    <h5>Ursprung</h5>
    <div class="src_grid q-my-lg">
        <div class="text-bold selection-item-box clickable" 
            @click="selectSource('file')" :class="{ active: documentSource.type === 'file' }">
            <div>
                <!-- icon -->
                <q-icon name="computer" size="32px" class="q-mb-sm" />              
                
            </div>
            <div>
                <template v-if="documentSource.destType === 'directory'">Lokales Verzeichnis</template>
                <template v-else>Lokale Datei</template>
            </div>
        </div>
        <div class="text-bold selection-item-box clickable" 
            @click="selectSource('sftp')" :class="{ active: documentSource.type === 'sftp' }">
            <div>
                <!-- icon -->
                <q-icon name="storage" size="32px" class="q-mb-sm" />
            </div>
            <div>
                SFTP-Server
            </div>
        </div>
    </div>
    <div v-if="value.type === 'sftp'">
        <q-select
            filled
            v-model="sftpServerSelected"
            :options="sftpServer"
            option-label="displayName"
            label="SFTP-Server auswählen"
            color="secondary"
            map-options
        />

        <div class="row q-my-md" v-if="sftpServerSelected != null">   
            <div class="col-9">
                {{ sftpFilePath }}
            </div>
            <div class="col-3 text-right">
                <SftpModal 
                :sftpConnection="sftpServerSelected"
                @select-file="selectSftpFile"
                :showFiles="documentSource.destType === 'file'"

                v-model="showSftpModal">
 
                </SftpModal>
                <q-btn @click="showSftpModal = true" color="secondary" flat class="muted-action-btn" 
                :label="documentSource.destType === 'directory' ? 'Verzeichnis auswählen' : 'Datei auswählen'" 
                />
            </div>
        </div>
        

    </div>
    <div v-if="value.type === 'file'">
        <div class="row">
            <div class="col-9">
                {{ filePath }}
            </div>
            <div class="col-3 text-right">
                <q-btn 
                    :label="documentSource.destType === 'directory' ? 'Verzeichnis auswählen' : 'Datei auswählen'"
                    @click="selectLocal()" 
                    color="secondary" 
                    flat class="muted-action-btn"
                     />
            </div>
        </div>
      
    </div>
</template>
<style lang="scss" scoped>

    $bg-grid-item: #f0f0f022;
    $bg-grid-item-hover: #f0f0f033;
    $bg-grid-item-active: #f0f0f02c;

    .src_grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
    }
    .src_grid > div {
        padding: 20px;
        min-height: 200px;
        border-radius: 10px;        
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        border-width: 1px;
        border-style: solid;
    }
</style>
<script lang="ts">
import { SftpData } from 'app/src-electron/models/EncryptedStore';
import { useEncryptedStore } from 'src/stores/encrypted-store';
import { useSessionStore } from 'src/stores/session-store';
import { defineComponent, PropType, ref } from 'vue';
import { DocumentSource } from '../util/helper';
import Files from 'src/services/node/Files';
import SftpModal from 'src/components/SftpModal.vue';

export default defineComponent({
  name: 'SourceDocuments',
  components: {
    SftpModal
  },
  setup() {   
    const documentSource = ref<DocumentSource>({
        type: 'file',
        destType: 'file',
    });
    const filePath = ref<string>('');
    const sessionStore = useSessionStore();
    const encryptedStore = useEncryptedStore();    
    const sftpServer = ref<SftpData[]>([]);
    const sftpServerSelected = ref<SftpData|null>(null);
    const showSftpModal = ref<boolean>(false);
    const sftpFilePath = ref<string>('');
    return {      
        filePath,
        sessionStore,
        encryptedStore,
        sftpServer,
        sftpServerSelected,
        showSftpModal,
        sftpFilePath,
        documentSource,
    };
  },
  mounted(){
    
    const stored = this.useLocalStorage ? window.localStorage.getItem(this.localStorageKey) : null;
    if(this.initValue) {
        this.loadData(this.initValue);
        this.emitValue();
    }else if(stored) {
        const parsed : DocumentSource = JSON.parse(stored);        
        this.loadData(parsed);
        this.emitValue();
    }
    
    const accId = this.sessionStore.selectedAccountId;
    if(accId != null) {
        this.sftpServer = this.encryptedStore.getAccount(accId)?.sftpData ?? [];           
    }
  },
  emits: ['update:modelValue'],
  computed: {
    value () {
        return this.modelValue;
    },
   
  },
  props: {
    modelValue: {
        type: Object as PropType<DocumentSource>,
        required: true,
    },
    useLocalStorage: {
        type: Boolean,
        default: true,
    },
    localStorageKey: {
        type: String,
        default: 'bulkSendingDocumentSource',
    },
    initValue: {
        type: Object as PropType<DocumentSource>,
        required: false,
    }
  },
  methods: {
    selectSource (source: string) {        
        if(source === 'file') {
            this.documentSource.type = 'file';
            this.emitValue();
           
        } else if(source === 'sftp') {
            this.documentSource.type = 'sftp';
            this.emitValue();
        }
    },
    loadData(data: DocumentSource) {
        this.documentSource.destType = data.destType ? data.destType : this.documentSource.destType;
        this.documentSource.type = data.type ? data.type : this.documentSource.type;
        this.documentSource.file = data.file ? data.file : this.documentSource.file;
        this.documentSource.sftp = data.sftp ? data.sftp : this.documentSource.sftp;
        if(this.documentSource.file) {
            this.filePath = this.documentSource.file;
        }
        if(this.documentSource.sftp) {
            this.sftpFilePath = this.documentSource.sftp.filePath ?? '';
            const accId = this.sessionStore.selectedAccountId;
            if(accId != null) {
                const sftpData = this.encryptedStore.getAccount(accId)?.sftpData ?? [];
                const selectedSftp = sftpData.find(s => s.id === this.documentSource.sftp?.connection?.id);
                if(selectedSftp) {
                    this.sftpServerSelected = selectedSftp;
                }
            }
        }
    },
    selectSftpFile (filePath: string) {
        this.sftpFilePath = filePath;
        if(!this.documentSource.sftp){
            this.documentSource.sftp = {
                filePath: '',
            }
        }
        this.documentSource.sftp.filePath = filePath;
        this.documentSource.sftp.connection = this.sftpServerSelected
        this.emitValue();
    },
    emitValue() {
        if(this.useLocalStorage) {
            window.localStorage.setItem(this.localStorageKey, JSON.stringify(this.documentSource));
        }
        this.$emit('update:modelValue', this.documentSource);
    },
    selectTargetSource (source: string) {        
        if(source === 'file') {
            this.documentSource.destType = 'file';
            this.emitValue();
           
        } else if(source === 'directory') {
            this.documentSource.destType = 'directory';
            this.emitValue();
        }
    },
    selectLocal(){
        if(this.documentSource.destType === 'file') {
            return this.selectLocalFile();
        } else if(this.documentSource.destType === 'directory') {
            return this.selectLocalDir();
        }  
        return Promise.resolve();
    },
    selectLocalDir(){
        return Files.pickFile(
            {               
                properties: ['openDirectory'],
            }
        ).then((files: string[]) => {
            if(files.length === 0 || files[0] == null) {
                return;
            }
           this.filePath = files[0];
           this.documentSource.file = files[0];
           this.documentSource.type = 'file';
           this.emitValue();
            
        }).catch((err: Error) => {
            console.error(err);
        });
    },
    selectLocalFile () {
        return Files.pickFile({
            filters: [
                { name: 'CSV', extensions: ['csv'] },
                { name: 'XML', extensions: ['xml'] },
                { name: 'All Files', extensions: ['*'] },
            ],
        }).then((files: string[]) => {
            if(files.length === 0 || files[0] == null) {
                return;
            }
           this.filePath = files[0];
           this.documentSource.file = files[0];
           this.documentSource.type = 'file';
           this.emitValue();
            
        }).catch((err: Error) => {
            console.error(err);
        });
    },
  }
});
</script>
   