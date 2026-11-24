<template>
    <div class="flex flex-col gap-4">
        <p class="text-ink-muted">{{ t('ui.bulk.receiverSource.intro') }}</p>
        <div class="grid grid-cols-2 gap-4">
            <SourceTile
                :icon="FileText"
                :title="t('ui.bulk.common.localFile')"
                :text="t('ui.bulk.receiverSource.localText')"
                :active="value.type === 'file'"
                @select="selectSource('file')"
            />
            <SourceTile
                :icon="Server"
                :title="t('ui.bulk.common.sftpServer')"
                :text="t('ui.bulk.receiverSource.sftpText')"
                :active="value.type === 'sftp'"
                @select="selectSource('sftp')"
            />
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
                    :icon="FileText"
                    :path="sftpFilePath"
                    :placeholder="t('ui.bulk.common.noFileSelected')"
                    :button-label="t('ui.bulk.common.chooseFile')"
                    @pick="showSftpModal = true"
                />
                <SftpModal
                    v-model="showSftpModal"
                    :sftp-connection="sftpServerSelected"
                    @select-file="selectSftpFile"
                />
            </template>
        </div>
        <SelectedPath
            v-if="value.type === 'file'"
            :icon="FileText"
            :path="filePath"
            :placeholder="t('ui.bulk.common.noFileSelected')"
            :button-label="t('ui.bulk.common.chooseFile')"
            @pick="selectFile()"
        />
    </div>
</template>
<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';
import { ReceiverSource } from '../util/helper';
import { useEncryptedStore } from 'src/stores/encrypted-store';
import { useSessionStore } from 'src/stores/session-store';
import Files from 'src/services/node/Files';
import { SftpData } from 'app/src-electron/models/EncryptedStore';
import SftpModal from 'src/components/SftpModal.vue';
import { useI18n } from 'vue-i18n';
import Select from 'openvue/select';
import { FileText, Server } from 'lucide-vue-next';
import FormField from 'components/ui/FormField.vue';
import SourceTile from './ui/SourceTile.vue';
import SelectedPath from './ui/SelectedPath.vue';

export default defineComponent({
  name: 'SourceReceivers',
  components: {
     
    SftpModal, Select, FormField, SourceTile, SelectedPath,
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
    const { t } = useI18n();
    return {
        t,
        FileText,
        Server,
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