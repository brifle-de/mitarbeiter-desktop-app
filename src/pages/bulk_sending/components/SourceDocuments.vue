<template>
    <div class="flex flex-col gap-6">
        <div class="flex flex-col gap-3">
            <h3 class="ma-title-m">{{ t('ui.bulk.documentSource.assignmentType') }}</h3>
            <div class="grid grid-cols-2 gap-4">
                <SourceTile
                    :icon="FileSpreadsheet"
                    :title="t('ui.bulk.documentSource.assignmentFile')"
                    :text="t('ui.bulk.documentSource.assignmentFileText')"
                    :active="documentSource.destType === 'file'"
                    @select="selectTargetSource('file')"
                />
                <SourceTile
                    :icon="FolderSearch"
                    :title="t('ui.bulk.documentSource.directory')"
                    :text="t('ui.bulk.documentSource.directoryText')"
                    :active="documentSource.destType === 'directory'"
                    @select="selectTargetSource('directory')"
                />
            </div>
        </div>
        <div class="flex flex-col gap-3">
            <h3 class="ma-title-m">{{ t('ui.bulk.documentSource.origin') }}</h3>
            <div class="grid grid-cols-2 gap-4">
                <SourceTile
                    :icon="Monitor"
                    :title="documentSource.destType === 'directory' ? t('ui.bulk.common.localDirectory') : t('ui.bulk.common.localFile')"
                    :text="t('ui.bulk.documentSource.localText')"
                    :active="documentSource.type === 'file'"
                    @select="selectSource('file')"
                />
                <SourceTile
                    :icon="Server"
                    :title="t('ui.bulk.common.sftpServer')"
                    :text="t('ui.bulk.documentSource.sftpText')"
                    :active="documentSource.type === 'sftp'"
                    @select="selectSource('sftp')"
                />
            </div>
        </div>
        <div v-if="value.type === 'sftp'" class="flex flex-col gap-4">
            <FormField :label="t('ui.bulk.common.sftpServer')">
                <Select
                    v-model="sftpServerSelected"
                    :options="sftpServer"
                    option-label="displayName"
                    data-key="id"
                    :placeholder="t('ui.bulk.common.selectSftpServer')"
                />
            </FormField>
            <template v-if="sftpServerSelected != null">
                <SelectedPath
                    :icon="documentSource.destType === 'directory' ? Folder : FileText"
                    :path="sftpFilePath"
                    :placeholder="documentSource.destType === 'directory' ? t('ui.bulk.common.noDirectorySelected') : t('ui.bulk.common.noFileSelected')"
                    :button-label="documentSource.destType === 'directory' ? t('ui.bulk.common.chooseDirectory') : t('ui.bulk.common.chooseFile')"
                    @pick="showSftpModal = true"
                />
                <SftpModal
                    v-model="showSftpModal"
                    :sftp-connection="sftpServerSelected"
                    :show-files="documentSource.destType === 'file'"
                    :select-text="documentSource.destType === 'directory' ? t('ui.bulk.common.chooseDirectory') : t('ui.bulk.common.chooseFile')"
                    @select-file="selectSftpFile"
                />
            </template>
        </div>
        <SelectedPath
            v-if="value.type === 'file'"
            :icon="documentSource.destType === 'directory' ? Folder : FileText"
            :path="filePath"
            :placeholder="documentSource.destType === 'directory' ? t('ui.bulk.common.noDirectorySelected') : t('ui.bulk.common.noFileSelected')"
            :button-label="documentSource.destType === 'directory' ? t('ui.bulk.common.chooseDirectory') : t('ui.bulk.common.chooseFile')"
            @pick="selectLocal()"
        />
    </div>
</template>
<script lang="ts">
import { SftpData } from 'app/src-electron/models/EncryptedStore';
import { useEncryptedStore } from 'src/stores/encrypted-store';
import { useSessionStore } from 'src/stores/session-store';
import { defineComponent, PropType, ref } from 'vue';
import { DocumentSource } from '../util/helper';
import Files from 'src/services/node/Files';
import SftpModal from 'src/components/SftpModal.vue';
import { useI18n } from 'vue-i18n';
import Select from 'openvue/select';
import { FileSpreadsheet, FileText, Folder, FolderSearch, Monitor, Server } from 'lucide-vue-next';
import FormField from 'components/ui/FormField.vue';
import SourceTile from './ui/SourceTile.vue';
import SelectedPath from './ui/SelectedPath.vue';

export default defineComponent({
  name: 'SourceDocuments',
  components: {
     
    SftpModal, Select, FormField, SourceTile, SelectedPath,
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
    const { t } = useI18n();
    return {
        t,
        FileSpreadsheet, FileText, Folder, FolderSearch, Monitor, Server,
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
   