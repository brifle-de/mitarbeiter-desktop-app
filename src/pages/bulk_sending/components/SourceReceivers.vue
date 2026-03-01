<template>
    <div>
        Lege die Quelle der Empfänger fest.
    </div>
    <div class="src_grid q-my-lg">
        <div class="text-bold selection-item-box clickable" 
            @click="selectSource('file')" :class="{ active: value.type === 'file' }">
            <div>
                <!-- icon -->
                <q-icon name="file_open" size="32px" class="q-mb-sm" />
            </div>
            <div>
                Lokale Datei
            </div>
        </div>
        <div class="text-bold selection-item-box clickable" 
            @click="selectSource('sftp')" :class="{ active: value.type === 'sftp' }">
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
                v-model="showSftpModal">
 
                </SftpModal>
                <q-btn
                flat class="muted-action-btn"
                 @click="showSftpModal = true" color="secondary" label="Datei auswählen" />
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
                flat class="muted-action-btn"
                @click="selectFile()" color="secondary"  label="Datei auswählen" />
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
import { defineComponent, PropType, ref } from 'vue';
import { ReceiverSource } from '../util/helper';
import { useEncryptedStore } from 'src/stores/encrypted-store';
import { useSessionStore } from 'src/stores/session-store';
import Files from 'src/services/node/Files';
import { SftpData } from 'app/src-electron/models/EncryptedStore';
import SftpModal from 'src/components/SftpModal.vue';

export default defineComponent({
  name: 'SourceReceivers',
  components: {
    SftpModal
  },
  emits: ['update:modelValue'],
  props: {
    modelValue: {
        type: Object as PropType<ReceiverSource>,
        required: true,
    },
    useLocalStorage: {
        type: Boolean,
        default: true,
    },
    initValue: {
        type: Object as PropType<ReceiverSource>,
        required: false,
    },
    localStorageKey: {
        type: String,
        default: 'bulkSendingReceiverSource',
    }
  },
  watch: {
    initValue: {
        handler(newVal) {
            if(newVal) {
                this.loadFromInitValue();
            }
        },
        deep: true,
    }
  },
  methods: {
    selectSource (source: string) {        
        if(source === 'file') {
            this.receiverSrc.type = 'file';
            this.emitValue();
           
        } else if(source === 'sftp') {
            this.receiverSrc.type = 'sftp';
            this.emitValue();
        }
    },
    selectSftpFile (filePath: string) {
        this.sftpFilePath = filePath;
        if(!this.receiverSrc.sftp){
            this.receiverSrc.sftp = {
                filePath: '',
            }
        }
        this.receiverSrc.sftp.filePath = filePath;
        this.receiverSrc.sftp.connection = this.sftpServerSelected
        this.emitValue();
    },
    loadFromInitValue() {
        console.log('Loading from init value', this.initValue);
        if(this.initValue) {
            this.loadData(this.initValue);
        }
    },
    loadData(data: ReceiverSource) {
        this.receiverSrc.type = data.type;
        this.receiverSrc.file = data.file;
        this.receiverSrc.sftp = data.sftp;
        if(this.receiverSrc.file) {
            this.filePath = this.receiverSrc.file;
        }
        if(this.receiverSrc.sftp) {
            this.sftpFilePath = this.receiverSrc.sftp.filePath ? this.receiverSrc.sftp.filePath : '';
        }
    },
    loadFromLocalStorage() {
        const stored = window.localStorage.getItem(this.localStorageKey);
        if(stored) {                     
            try {
                const parsed = JSON.parse(stored);
                if(parsed && typeof parsed === 'object') {
                    this.loadData(parsed);
                }
            } catch (e) {
                console.error('Error parsing bulkSendingReceiverSource from localStorage', e);
            }
        }
    },
    emitValue() {
        if(this.useLocalStorage) {
            window.localStorage.setItem(this.localStorageKey, JSON.stringify(this.receiverSrc));
        }
        
        this.$emit('update:modelValue', this.receiverSrc);
    },
    selectFile () {
        Files.pickFile({
            filters: [
                { name: 'CSV', extensions: ['csv'] },
                { name: 'XML', extensions: ['xml'] },
            ],
        }).then((files: string[]) => {
            if(files.length === 0 || files[0] == null) {
                return;
            }
           this.filePath = files[0];
           this.receiverSrc.file = files[0];
            this.receiverSrc.type = 'file';
            this.emitValue();
            
        }).catch((err: Error) => {
            console.error(err);
        });
    },
  },
  computed: {
    value: {
        get () {
            return this.modelValue;
        },
        set (value: ReceiverSource) {
            this.$emit('update:modelValue', value);
        },
    },
  },
  mounted() {
        this.receiverSrc = this.modelValue;
        const accId = this.sessionStore.selectedAccountId;
        if(accId != null) {
            this.sftpServer = this.encryptedStore.getAccount(accId)?.sftpData ?? [];           
        }
        if (this.useLocalStorage) {
            this.loadFromLocalStorage();
        }
        if(this.initValue) {
            this.loadFromInitValue();
        }
  },
  setup () {   
    const receiverSrc = ref<ReceiverSource>({
        type: 'file',
    });
    const filePath = ref<string>('');
    const sessionStore = useSessionStore();
    const encryptedStore = useEncryptedStore();    
    const sftpServer = ref<SftpData[]>([]);
    const sftpServerSelected = ref<SftpData|null>(null);
    const showSftpModal = ref<boolean>(false);
    const sftpFilePath = ref<string>('');
    return {
        receiverSrc,
        filePath,
        sessionStore,
        encryptedStore,
        sftpServer,
        sftpServerSelected,
        showSftpModal,
        sftpFilePath,
    };
  },
});
</script>