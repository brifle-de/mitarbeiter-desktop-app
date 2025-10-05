<template>
    <h5>Zuweisungsart</h5>
    <div class="src_grid q-my-lg">
        <div class="text-bold" 
            @click="selectTargetSource('file')" :class="{ active: documentSource.destType === 'file' }">
            Zuweisungsdatei 
        </div>
        <div class="text-bold" 
            @click="selectTargetSource('directory')" :class="{ active: documentSource.destType === 'directory' }">
            Verzeichnis Analyse
        </div>
    </div>
    <h5>Ursprung</h5>
    <div class="src_grid q-my-lg">
        <div class="text-bold" 
            @click="selectSource('file')" :class="{ active: documentSource.type === 'file' }">
            <template v-if="documentSource.destType === 'directory'">Lokales Verzeichnis</template>
            <template v-else>Lokale Datei</template>
        </div>
        <div class="text-bold" 
            @click="selectSource('sftp')" :class="{ active: documentSource.type === 'sftp' }">
            SFTP-Server
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
                <q-btn @click="showSftpModal = true" color="secondary" text-color="black" label="Datei auswählen" />
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
                    text-color="black" />
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
    .src_grid > div:hover {
        background-color: $bg-grid-item-hover;
        cursor: pointer;
    }
    .src_grid > div:active, .src_grid > div.active  {
        background-color: $bg-grid-item-active;
        border: 3px solid var(--q-secondary);
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
    this.documentSource = this.modelValue;
    const stored = window.localStorage.getItem('bulkSendingDocumentSource');
    if(stored) {
        const parsed = JSON.parse(stored);
        this.documentSource.destType = parsed.destType ? parsed.destType : this.documentSource.destType;
        this.documentSource.type = parsed.type ? parsed.type : this.documentSource.type;
        this.documentSource.file = parsed.file ? parsed.file : this.documentSource.file;
        this.documentSource.sftp = parsed.sftp ? parsed.sftp : this.documentSource.sftp;
        if(this.documentSource.file) {
            this.filePath = this.documentSource.file;
        }
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
        window.localStorage.setItem('bulkSendingDocumentSource', JSON.stringify(this.documentSource));
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
   