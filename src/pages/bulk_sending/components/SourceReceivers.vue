<template>
    <div>
        Lege die Quelle der Empfänger fest.
    </div>
    <div class="src_grid q-my-lg">
        <div class="text-bold" 
            @click="selectSource('file')" :class="{ active: value.type === 'file' }">
            Lokale Datei
        </div>
        <div class="text-bold" 
            @click="selectSource('sftp')" :class="{ active: value.type === 'sftp' }">
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
                <q-btn @click="selectFile()" color="secondary" text-color="black" label="Datei auswählen" />
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
    emitValue() {
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