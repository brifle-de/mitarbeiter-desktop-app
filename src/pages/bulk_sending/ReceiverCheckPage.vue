<template>
    <div class="flex flex-col gap-6 overflow-auto px-8 py-7">
        <PageHeader :path="t('ui.bulk.path')" :title="t('ui.bulk.check.title')" :subtitle="t('ui.bulk.check.subtitle')">
            <template #actions>
                <SelectButton
                    v-model="fileSource"
                    :options="sourceOptions"
                    option-label="label"
                    option-value="value"
                    :allow-empty="false"
                    @update:model-value="clear()"
                />
            </template>
        </PageHeader>

        <!-- local files -->
        <section v-if="fileSource === 'local'" class="ma-card">
            <h2 class="ma-title-m">{{ t('ui.bulk.check.localTitle') }}</h2>
            <FileDragAndDrop :formats="['text/csv']" :multiple="true" @drop="addFile($event)" />
            <ul v-if="files.length > 0" class="flex flex-col gap-2">
                <li v-for="file in files" :key="file.name + 'file_names'" class="flex items-center gap-3 rounded-[10px] border border-line px-4 py-2.5">
                    <FileText :size="18" class="shrink-0 text-icon-brand" />
                    <span class="min-w-0 flex-1 truncate">{{ file.name }}</span>
                    <Button text rounded severity="danger" size="small" :aria-label="t('ui.bulk.check.removeFile')" @click="files.splice(files.indexOf(file), 1)">
                        <template #icon><Trash2 :size="16" /></template>
                    </Button>
                </li>
            </ul>
        </section>

        <!-- files from an SFTP server -->
        <section v-if="fileSource === 'sftp'" class="ma-card">
            <h2 class="ma-title-m">{{ t('ui.bulk.check.sftpTitle') }}</h2>
            <div class="flex items-end gap-3">
                <FormField :label="t('ui.bulk.common.sftpServer')" class="flex-1">
                    <Select
                        v-model="sftpServerSelected"
                        :options="sftpServer"
                        option-label="displayName"
                        data-key="id"
                        :placeholder="t('ui.bulk.common.selectSftpServer')"
                    />
                </FormField>
                <Button severity="secondary" outlined :label="t('ui.bulk.check.addFile')" :disabled="sftpServerSelected == null" @click="showSftpModal = true">
                    <template #icon><Plus :size="18" /></template>
                </Button>
            </div>
            <SftpModal
                v-if="sftpServerSelected != null"
                v-model="showSftpModal"
                :sftp-connection="sftpServerSelected"
                :select-text="t('ui.bulk.check.addFile')"
                :show-path="false"
                @select-file="selectSftpFile"
            />
            <ul v-if="sftpFilePaths.length > 0" class="flex flex-col gap-2">
                <li v-for="filePath in sftpFilePaths" :key="filePath + 'file_paths'" class="flex items-center gap-3 rounded-[10px] border border-line px-4 py-2.5">
                    <FileText :size="18" class="shrink-0 text-icon-brand" />
                    <span class="min-w-0 flex-1 truncate" :title="filePath">{{ filePath }}</span>
                    <Button text rounded severity="danger" size="small" :aria-label="t('ui.bulk.check.removeFile')" @click="sftpFilePaths.splice(sftpFilePaths.indexOf(filePath), 1)">
                        <template #icon><Trash2 :size="16" /></template>
                    </Button>
                </li>
            </ul>
        </section>

        <!-- parser + read -->
        <section v-if="(fileSource === 'local' && files.length > 0) || (fileSource === 'sftp' && sftpFilePaths.length > 0)" class="flex items-end gap-3">
            <FormField :label="t('ui.bulk.common.parser')" class="flex-1">
                <Select
                    v-model="parser"
                    :options="getRules()"
                    option-label="name"
                    :placeholder="t('ui.bulk.common.selectParser')"
                    @update:model-value="cacheParser($event)"
                />
            </FormField>
            <Button :label="t('ui.bulk.common.read')" :disabled="!parser" :loading="isLoading" @click="fileSource === 'sftp' ? readSftpFiles() : parseLocalFile()">
                <template #icon><FileInput :size="18" /></template>
            </Button>
        </section>

        <template v-if="receivers.length > 0">
            <section class="flex flex-col gap-3">
                <h2 class="ma-title-l">{{ t('ui.bulk.check.inputTitle') }}</h2>
                <p class="text-ink-muted">{{ t('ui.bulk.check.inputText', { n: receivers.length }) }}</p>
                <TableCard>
                    <DataTable :value="receivers" paginator :rows="10" :loading="isLoading">
                        <Column v-for="col in receiverColumns" :key="col.name" :field="col.field" :header="col.label" sortable />
                    </DataTable>
                </TableCard>
            </section>
            <section class="flex flex-col gap-3">
                <h2 class="ma-title-l">{{ t('ui.bulk.check.resultsTitle') }}</h2>
                <SearchReceiversResults :receiver-records="receivers" />
            </section>
        </template>
    </div>
</template>
<script lang="ts">
import { defineComponent, Ref, ref } from 'vue';
import FileDragAndDrop, { FileContent } from 'src/components/ui-elements/FileDragAndDrop.vue';
import { ReceiverParser, ReceiverParserResult, ReceiverParserRules } from './util/receivers/parsers';
import { ParsersProvider } from 'src/services/node/ParsersProvider';
import SampleParsers from './util/receivers/sampleParsers';
import { ReceiverSource } from './util/helper';
import Files from 'src/services/node/Files';
import Sftp from 'src/services/node/Sftp';
import { Buffer } from 'buffer'; 
import SearchReceiversResults from './components/receiverCheckPage/SearchReceiversResults.vue';
import { SftpData } from 'app/src-electron/models/EncryptedStore';
import SftpModal from 'src/components/SftpModal.vue';
import { useSessionStore } from 'src/stores/session-store';
import { useEncryptedStore } from 'src/stores/encrypted-store';
import { useI18n } from 'vue-i18n';
import Button from 'openvue/button';
import Column from 'openvue/column';
import DataTable from 'openvue/datatable';
import Select from 'openvue/select';
import SelectButton from 'openvue/selectbutton';
import { FileInput, FileText, Plus, Trash2 } from 'lucide-vue-next';
import PageHeader from 'components/shell/PageHeader.vue';
import FormField from 'components/ui/FormField.vue';
import { useNotify } from 'src/composables/useNotify';
import TableCard from './components/ui/TableCard.vue';
import { receiverColumnDefs } from './components/receiverColumns';

export default defineComponent({
  name: 'ReceiverCheckPage',
  components: {
    FileDragAndDrop,
    SearchReceiversResults,
    SftpModal,
     
    Button, Column, DataTable, Select, SelectButton, FileInput, FileText, Plus, Trash2, PageHeader, FormField, TableCard,
  },
  computed: {
    parserType() {        
        return "csv";
    },
    sourceOptions(): { label: string, value: string }[] {
        return [
            { label: this.t('ui.bulk.check.sourceLocal'), value: 'local' },
            { label: 'SFTP', value: 'sftp' },
        ];
    },
  },
  methods: {
    readSftpFiles() {
        this.isLoading = true;
        this.parseSftpFiles().catch((err: Error) => {
            console.error(err);
        }).finally(() => {
            this.isLoading = false;
        });
    },
    selectSftpFile (filePath: string) {
        this.sftpFilePaths.push(filePath);
    },
    async readFile(receiverSource: ReceiverSource, encoding: BufferEncoding) : Promise<string> {
        if(receiverSource.type){
            if(receiverSource.type === 'file' && receiverSource.file){
                return Files.readFile(receiverSource.file, encoding);
            }else if(receiverSource.type === 'sftp' && receiverSource.sftp?.filePath && receiverSource.sftp?.connection){
                return Sftp
                .readFile(receiverSource.sftp.filePath, receiverSource.sftp.connection, encoding)
                .then((data => {
                    if (data) return data;
                    return "";
                }));

            }
        }
        return "";
    },
    async parseSftpFiles() : Promise<ReceiverParserResult[]> {
        if(!this.parser){
            console.error('No parser selected');
            return Promise.reject(new Error('No parser selected'));
        }
        this.receivers = [];

        const receiverSources: ReceiverSource[] = this.sftpFilePaths.map((filePath) => {
            return {
                type: 'sftp',
                sftp: {
                    filePath,
                    connection: this.sftpServerSelected as SftpData
                }
            }
        });

        const fileContents = await Promise.all(receiverSources.map((source) => this.readFile(source, this.parser!.rules.encoding)));

        for (const fileContent of fileContents) {  
            console.log('File content read:', fileContent.substring(0, 100)); // Log the first 100 characters of the file content for debugging
            const buffer = new TextEncoder().encode(fileContent);
            // text encoder users utf-8 therefore override the encoding in rules to utf-8,
            //  use deep copy to avoid modifying original rules and cause conflicts
            const rulesCopy = JSON.parse(JSON.stringify(this.parser.rules));
            rulesCopy.encoding = 'utf-8';

            const parsedReceivers = ReceiverParser.parse(Buffer.from(buffer), rulesCopy);  
            this.receivers.push(...parsedReceivers);
        }

        return this.receivers;
    },
    async parseLocalFile(){
        if(!this.parser){
            console.error('No parser selected');
            return;
        }
        this.receivers = [];
        this.isLoading = true;
        for(const file of this.files){
            const rulesCopy = JSON.parse(JSON.stringify(this.parser.rules)); 
            const parsedReceivers = ReceiverParser.parse(Buffer.from(file.content), rulesCopy);
            this.receivers.push(...parsedReceivers);
        }
        this.isLoading = false;
    },  
    getRules(){
        return this.rules.filter((rule) => {
            return rule.rules.type === this.parserType;
        });
    },
    cacheParser(event: {rules: ReceiverParserRules, name: string} | null) {
        if(event) {
            localStorage.setItem('selectedReceiverParserReceiverCheck', event.name);
        } else {
            localStorage.removeItem('selectedReceiverParserReceiverCheck');
        }
    },
    addFile(fileContent: FileContent[]) {
        this.files.push(...fileContent);   
    },
    clear() {
        this.files = [];
        this.receivers = [];
        this.parser = null;
    },
    loadFromLocalStorage(){
        
    }

  },
  mounted() {
        const cachedParser = localStorage.getItem('selectedReceiverParserReceiverCheck');
        this.parsersProvider.getReceiversParsers().then((parsers) => {
        const customParsers = Object.values(parsers);
        this.rules = this.rules.concat(customParsers);
        const accId = this.sessionStore.selectedAccountId;
        if(accId != null) {
            this.sftpServer = this.encryptedStore.getAccount(accId)?.sftpData ??  [];           
        }
        this.loadFromLocalStorage();
        if(cachedParser) {
            const found = this.rules.find((rule) => rule.name === cachedParser);
            if(found) {
                this.parser = found;
            }
        }
    }).catch((err: Error) => {
        console.error('Error fetching custom parsers:', err);
        this.notify.error(this.t('ui.bulk.errors.loadParsers'));
    });    
    },
  setup() {
    const fileSource = ref('local');
    const files = ref<FileContent[]>([]);
    const parser = ref<{rules: ReceiverParserRules, name: string} | null>(null);
    const parsersProvider = ref(new ParsersProvider());
    const rules = SampleParsers
    const receivers: Ref<ReceiverParserResult[]> = ref([]);
    const isLoading = ref(false);
    const sessionStore = useSessionStore();
    const encryptedStore = useEncryptedStore();
    const { t } = useI18n();
    const notify = useNotify();
    const receiverColumns = receiverColumnDefs(t);

    const sftpServer = ref<SftpData[]>([]);
    const sftpServerSelected = ref<SftpData|null>(null);
    const showSftpModal = ref<boolean>(false);
    const sftpFilePaths = ref<string[]>([]);
  
    return {
      t,
      notify,
      fileSource,
      files,
      parser,
      parsersProvider,
      sessionStore,
        rules,
        receivers,
        receiverColumns,
        isLoading,
        sftpServer,
        sftpServerSelected,
        showSftpModal,
        sftpFilePaths,
        encryptedStore
    };
  },
});
</script>

