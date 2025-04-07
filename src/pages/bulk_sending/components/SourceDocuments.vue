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
            Lokale Datei
        </div>
        <div class="text-bold" 
            @click="selectSource('sftp')" :class="{ active: documentSource.type === 'sftp' }">
            SFTP-Server
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

export default defineComponent({
  name: 'SourceDocuments',
  components: {
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
  emits: ['update:modelValue', 'selectFile'],
  computed: {
   
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
    selectFile () {
        Files.pickFile({
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
   