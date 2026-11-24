<template>
    <div class="flex flex-col gap-4">
        <div class="flex items-end gap-3">
            <FormField :label="t('ui.bulk.common.parser')" class="flex-1">
                <Select
                    v-if="isDirAnalysis"
                    v-model="selectedDirParserName"
                    :options="availableDirParsers"
                    option-label="name"
                    option-value="name"
                    :placeholder="t('ui.bulk.common.selectParser')"
                    @update:model-value="selectDirParser($event)"
                />
                <Select
                    v-else
                    v-model="selectedFileParserName"
                    :options="availableAssignmentParser"
                    option-label="name"
                    option-value="name"
                    :placeholder="t('ui.bulk.common.selectParser')"
                    @update:model-value="selectFileParser($event)"
                />
            </FormField>
            <Button :label="t('ui.bulk.common.read')" severity="secondary" outlined @click="parse()">
                <template #icon><RefreshCw :size="18" /></template>
            </Button>
        </div>

        <!-- base directory: needed for local paths of an assignment file (Windows and macOS paths differ), optional for SFTP -->
        <FormField
            v-if="!isDirAnalysis"
            :label="t('ui.bulk.documentParser.basePath')"
            :error="basePath ? '' : t('ui.bulk.documentParser.basePathRequired')"
            :hint="t('ui.bulk.documentParser.basePathHint')"
        >
            <div class="flex gap-2">
                <InputText v-model="basePath" class="flex-1" :invalid="!basePath" :placeholder="t('ui.bulk.documentParser.basePathPlaceholder')" />
                <Button severity="secondary" outlined :label="t('ui.bulk.common.chooseDirectory')" @click="pickBasePath()">
                    <template #icon><FolderOpen :size="18" /></template>
                </Button>
            </div>
        </FormField>

        <Panel v-if="value.dirParser != null && isDirAnalysis && useDateFilter" v-model:collapsed="timeFilterCollapsed" toggleable>
            <template #header>
                <span class="flex items-center gap-2">
                    <CalendarRange :size="18" class="text-icon-brand" />
                    <span class="ma-text-strong">{{ t('ui.bulk.documentParser.dateFilter') }}</span>
                    <span class="ma-small text-ink-muted">{{ t('ui.bulk.common.optional') }}</span>
                </span>
            </template>
            <div class="flex flex-wrap items-start gap-6">
                <DatePicker v-model="dateRangeModel" selection-mode="range" inline :manual-input="false" />
                <div class="flex flex-col gap-2">
                    <p class="ma-small max-w-xs text-ink-muted">{{ t('ui.bulk.documentParser.dateFilterHint') }}</p>
                    <Button severity="secondary" outlined :label="t('ui.bulk.documentParser.thisMonth')" @click="dateRangeToThisMonth()">
                        <template #icon><CalendarDays :size="18" /></template>
                    </Button>
                    <Button text :label="t('ui.bulk.common.reset')" @click="resetDateRange()" />
                </div>
            </div>
        </Panel>

        <template v-if="fileReceiverMapping.length > 0 || hasLoaded">
            <div class="flex items-center gap-2">
                <StatusTag :type="fileReceiverMapping.length > 0 ? 'delivered' : 'error'" :label="t('ui.bulk.documentParser.assigned', { n: fileReceiverMapping.length })" />
            </div>
            <TableCard>
                <DataTable :value="fileReceiverMapping" paginator :rows="10" sort-mode="single">
                    <Column field="filePath" :header="t('ui.bulk.columns.file')" sortable>
                        <template #body="{ data }">
                            <span class="ma-small break-all text-ink-muted">{{ data.filePath }}</span>
                        </template>
                    </Column>
                    <Column field="receiverId" :header="t('ui.bulk.columns.receiver')" sortable>
                        <template #body="{ data }">
                            <DocTypePill v-if="data.receiverId" :label="data.receiverId" />
                        </template>
                    </Column>
                    <Column field="docType" :header="t('ui.bulk.columns.docType')" sortable>
                        <template #body="{ data }">
                            <DocTypePill v-if="data.docType" :label="data.docType" :color="pillColors[data.docType]" />
                        </template>
                    </Column>
                    <Column field="date" :header="t('ui.bulk.columns.date')" sortable>
                        <template #body="{ data }">{{ formatDate(data.date) }}</template>
                    </Column>
                    <template #empty>
                        <span class="text-ink-muted">{{ t('ui.bulk.documentParser.empty') }}</span>
                    </template>
                </DataTable>
            </TableCard>
        </template>

        <SftpModal
            v-if="documentSource.sftp?.connection != null"
            v-model="showSftpModalBasePath"
            :sftp-connection="documentSource.sftp?.connection"
            :show-files="false"
            :select-text="t('ui.bulk.common.chooseDirectory')"
            @select-file="selectSftpBasePath"
        />
    </div>
</template>
<script lang="ts">

import { defineComponent, PropType, ref} from 'vue';
import { DocumentSource } from '../util/helper';
import Files from 'src/services/node/Files';
import Sftp from 'src/services/node/Sftp';
import { SftpLsDirResponse } from 'app/src-electron/service/SftpConnector';
import { FilesLsDirResponse } from 'app/src-electron/service/Files';
import { DocumentSourceDirParser, DocumentReceiverMappingResult, DocumentSourceDirParserRules } from '../util/documents/parsers';
import SampleParser from '../util/documents/sampleParsers';
import DocumentRecord from '../util/documents/documentRecord';
import { SftpData } from 'app/src-electron/models/EncryptedStore';
import AssignmentFile, { AssignmentRules } from '../util/documents/assignmentFile';
import SampleAssignmentParser from '../util/documents/sampleAssignmentRules';
import SftpModal from 'src/components/SftpModal.vue';
import { computePillColors } from '../util/helper';
import { useI18n } from 'vue-i18n';
import Button from 'openvue/button';
import Select from 'openvue/select';
import InputText from 'openvue/inputtext';
import Panel from 'openvue/panel';
import DatePicker from 'openvue/datepicker';
import DataTable from 'openvue/datatable';
import Column from 'openvue/column';
import { CalendarDays, CalendarRange, FolderOpen, RefreshCw } from 'lucide-vue-next';
import FormField from 'components/ui/FormField.vue';
import StatusTag from 'components/ui/StatusTag.vue';
import TableCard from './ui/TableCard.vue';
import DocTypePill from './ui/DocTypePill.vue';

/** 'YYYY/MM/DD', the format the date filter has always stored */
function toFilterDate(d: Date): string {
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}/${mm}/${dd}`;
}


export default defineComponent({
  name: 'SourceDocumentsParser',
  components: {
    // eslint-disable-next-line vue/no-reserved-component-names -- OpenVue components keep their PrimeVue names
    SftpModal, Button, Select, InputText, Panel, DatePicker, DataTable, Column,
    CalendarDays, CalendarRange, FolderOpen, RefreshCw, FormField, StatusTag, TableCard, DocTypePill,
  },
  
  computed: {
    pillColors(): Record<string, string> {
        return computePillColors(this.fileReceiverMapping);
    },
    /** DatePicker range model on top of the stored {from, to} strings */
    dateRangeModel: {
        get(): (Date | null)[] | null {
            if (!this.dateRange || !this.dateRange.from) {
                return null;
            }
            return [new Date(this.dateRange.from), this.dateRange.to ? new Date(this.dateRange.to) : null];
        },
        set(val: (Date | null)[] | null) {
            const from = val?.[0];
            if (!from) {
                this.resetDateRange();
                return;
            }
            const to = val?.[1];
            this.dateRange = { from: toFilterDate(from), to: to ? toFilterDate(to) : '' };
        },
    },
    isDirAnalysis () {
        return this.value.destType === 'directory';
    },
    isSFtp() {
        return this.value.type === 'sftp';
    },
    value: {
        get(){
            return this.documentSource;
        },
        set(val: DocumentSource) {
            this.documentSource = val;
            this.$emit('update:modelValue', val);
        }
    },
  },
  methods: {
    loadParser(parserId: string) {
        const found = this.availableDirParsers.find((parser) => parser.name === parserId || parser.id === parserId);
        if(found) {
            this.value.dirParser = found.rules;
            this.selectedDirParserName = found.name;
        }
    },
    parse() {
        if(this.isDirAnalysis) {
            void this.parseDirectoryFiles();
        } else {
            void this.parseAssignmentFile();
        }
    },
    formatDate(val: Date | null) {
        if (val == null) {
            return '';
        }
        return val.toLocaleDateString('de-DE', { year: 'numeric', month: '2-digit', day: '2-digit' });
    },
    pickBasePath() {
        if (this.isSFtp) {
            this.showSftpModalBasePath = true;
        } else {
            this.selectLocaleBasePath();
        }
    },
    
    getDirAnalyticsBasePath() {
        if(this.isSFtp) {
            return this.value.sftp?.filePath ?? '/';
        } else {
            return this.value.file ?? '/';
        }
    },
    getFullPath(basePath: string, fileName: string) {
        if(this.isSFtp){
            return Sftp.pathJoin(basePath, fileName);
        }else{
            return Files.pathJoin(basePath, fileName);
        }
    },
    dateRangeToThisMonth() {
        const date = new Date();
        const currentMonth = date.getMonth();
        const start = new Date(date.getFullYear(), currentMonth, 1).getDate();
        const end = new Date(date.getFullYear(), currentMonth + 1, 0).getDate();
        const endStr = end < 10 ? `0${end}` : `${end}`;
        const monthStr = (currentMonth + 1) < 10 ? `0${currentMonth + 1}` : `${currentMonth + 1}`;
        const startStr = start < 10 ? `0${start}` : `${start}`;
        const separator = "/";
        
        const startOfMonth = `${date.getFullYear()}${separator}${monthStr}${separator}${startStr}`
        const endOfMonth =  `${date.getFullYear()}${separator}${monthStr}${separator}${endStr}`                
 
        this.dateRange = {
            from: startOfMonth,
            to: endOfMonth,
        };
    },
    resetDateRange() {
        this.dateRange = {
            from: "",
            to: "",
        };
    },
    async readSftpDir(){
        if(this.value.sftp == null || this.value.sftp.connection == null) {
            return;
        }
        this.files = await Sftp.lsDir(this.value.sftp.filePath, this.value.sftp.connection)
        .then((sftpRes: SftpLsDirResponse | null) => {
            if(sftpRes == null) {
                return [];
            }
            return sftpRes.files.map((file: { name: string }) => file.name);                
        }).catch((err: Error) => {
            console.error(err);
            return [];
        });
    },
    async readLocaleDir(){
        if(this.value.file == null) {
            return;
        }
        this.files = await Files.lsDir(this.value.file)
        .then((res: FilesLsDirResponse | null) => {
            if(!res) {
                return [];
            }
            return res.files.map((file: { name: string }) => file.name);
        }).catch((err: Error) => {
            console.error(err);
            return [];
        });
    },
    async readDirectory() {
        if(this.isSFtp){
            return this.readSftpDir();
        }else {
            return this.readLocaleDir();
        }
    },
    readData(filePath: string) {
        if(this.isSFtp) {
            if(this.value.sftp == null || this.value.sftp.connection == null) {
                console.error('No SFTP connection available.');
                return Promise.reject(new Error('No SFTP connection available.'));
            }
            return Sftp.readFile(filePath, this.value.sftp?.connection, 'utf-8');
        } else {
            if(this.value.file == null) {
                console.error('No file path provided.');
                return Promise.reject(new Error('No file path provided.'));
            }            
            return Files.readFile(filePath, 'utf-8')
        }
    },
    async parseAssignmentFile(){        
        if(this.value.fileAssignment == null) {
            return;
        }
        const parser = new AssignmentFile(this.value.fileAssignment);
        const filePath = this.isSFtp ? this.value.sftp?.filePath : this.value.file;
        if(filePath == null || filePath === '') {
            console.error('No file path provided for assignment file parsing.');
            return;
        }
        const data = await this.readData(filePath);
        if(data == null || data === '') {
            console.error('No data found in the file for assignment parsing.');
            return;
        }
        let res : DocumentRecord[] = parser.read(data);

        const m = res.map(async (element: DocumentRecord) => {
            return {
                filePath: await this.getFullPath(this.basePath,element.filePath),
                receiverId: element.receiverId,
                date: null,
                docType: element.docType,
            }
        });

        this.fileReceiverMapping = await Promise.all(m); 

        res = await Promise.all(res.map(async (element: DocumentRecord) => {
            element.filePath = await this.getFullPath(this.basePath, element.filePath);
            return element;
        }));
        this.$emit('parsed', res);
    },
    async parseDirectoryFiles() {
        const rules = this.value.dirParser
        
        if(rules == null) {
            return;
        }
        const parser = new DocumentSourceDirParser(this.files)
        const res = parser.parse(rules);
        this.fileReceiverMapping = res;
        if(this.hasDateFilter()) {
            this.fileReceiverMapping = this.fileReceiverMapping.filter((element: DocumentReceiverMappingResult) => {
                const date = new Date(element.date?.toDateString() ?? '');
                if(date == null) {
                    return false;
                }
                // remove time from date
                const fromDate = new Date(new Date(this.dateRange!.from ?? '').toDateString());
                const toDate = new Date(new Date(this.dateRange!.to || this.dateRange!.from || '').toDateString());
                return date >= fromDate && date <= toDate;
            });
        }
        this.hasLoaded = true;
        void this.emitDirAnalticsResult();
    },
    hasDateFilter(){
        if(this.dateRange == null) {
            return false;
        }
        return (this.dateRange.from !== undefined && this.dateRange.from !== "") || 
            (this.dateRange.to !== undefined && this.dateRange.to !== "");
    },
   
    async emitDirAnalticsResult(){    
        const dirBasePath = this.getDirAnalyticsBasePath();

        const sftpConnection : SftpData | undefined = this.value.sftp?.connection ?? undefined;

        const res : DocumentRecord[] = await Promise.all(this.fileReceiverMapping.map(async (element: DocumentReceiverMappingResult) => {
            return {
                filePath: await this.getFullPath( dirBasePath, element.filePath),
                receiverId: element.receiverId,
                docType: element.docType,
                type: this.value.type,          
                ...(sftpConnection !== undefined) && { sftp: sftpConnection },  
            };
        }));
        this.$emit('parsed', res);
    },
    selectSource (source: string) {        
        if(source === 'file') {
            this.documentSource.type = 'file';
           
        } else if(source === 'sftp') {
            this.documentSource.type = 'sftp';
        }
    },
    selectSftpBasePath (filePath: string) {
        this.basePath = filePath;
    },
    selectLocaleBasePath () {
        Files.pickFile({            
            properties: ['openDirectory'],
        }).then((files: string[]) => {
            if(files.length === 0 || files[0] == null) {
                return;
            }
           this.basePath = files[0];
            
        }).catch((err: Error) => {
            console.error(err);
        });
    },
    getDefaultBasePath(){
        if(this.isSFtp) {
            // get directory of filePath
            return Sftp.parseDirname(this.value.sftp?.filePath ?? '/');            
        } else {
            return Files.parseDirname(this.value.file ?? '/');
        }
    },
    selectDirParser(parserName: string | null) {        
       
        if(this.useLocalStorage) {
            if(parserName) {
                localStorage.setItem(this.localStorageDirKey, parserName);
            } else {
                localStorage.removeItem(this.localStorageDirKey);
            }
        }
        this.value.dirParser = this.availableDirParsers.find((parser) => parser.name === parserName || parser.id === parserName)!.rules;

    },
    selectFileParser(parserName: string | null) {
        if(this.useLocalStorage) {
            if(parserName) {
                localStorage.setItem(this.localStorageFileKey, parserName);
            } else {
                localStorage.removeItem(this.localStorageFileKey);
            }
        }
        this.value.fileAssignment = this.availableAssignmentParser.find((parser) => parser.name === parserName)!.rules;
    },
    loadState(){
        let cachedDirParser = this.useLocalStorage ? localStorage.getItem(this.localStorageDirKey) : null;
        if(this.initValue && this.initValue.dirParser) {
            const found = this.availableDirParsers.find((rule) => rule.rules === this.initValue.dirParser);
            if(found) {
                cachedDirParser = found.name;
            }

        }
        if(cachedDirParser) {
            const found = this.availableDirParsers.find((rule) => rule.name === cachedDirParser || rule.id === cachedDirParser);
            if(found) {
                this.value.dirParser = found.rules;
                this.selectedDirParserName = found.name;
            }
        }
        let cachedFileParser = this.useLocalStorage ? localStorage.getItem(this.localStorageFileKey) : null;
        if(this.initValue && this.initValue.fileAssignment) {
            const found = this.availableAssignmentParser.find((rule) => rule.rules === this.initValue.fileAssignment);
            if(found) {
                cachedFileParser = found.name;
            }

        }
        if(cachedFileParser) {
            const found = this.availableAssignmentParser.find((rule) => rule.name === cachedFileParser || rule.id === cachedFileParser);
            if(found) {
                this.value.fileAssignment = found.rules;
                this.selectedFileParserName = found.name;
            }
        }
    },

  },

  mounted() {
    this.documentSource = this.modelValue;
    this.hasLoaded = false;
    // get cached parser
    this.loadState();

    void this.getDefaultBasePath().then((path: string) => {
        this.basePath = path;        
    });
    if(this.isDirAnalysis) {
        void this.readDirectory().then(() => {
            
        });
    }
  },
  emits: ['update:modelValue', 'parsed'], 
  props: {
    modelValue: {
        type: Object as PropType<DocumentSource>,
        required: true,
    },    
    useDateFilter: {
        type: Boolean,
        default: true,
    },
    useLocalStorage: {
        type: Boolean,
        default: true,
    },
    localStorageDirKey: {
        type: String,
        default: 'selectedDocumentDirParser',
    },
    localStorageFileKey: {
        type: String,
        default: 'selectedDocumentFileParser',  
    },
    initValue : {
        type: Object as PropType<DocumentSource>,
        default: () => ({}),
    },
  }, 

  
  setup() {       
    const files = ref<string[]>([]);
    const fileReceiverMapping = ref<DocumentReceiverMappingResult[]>([]);    
    const availableDirParsers = ref<{name: string, rules: DocumentSourceDirParserRules, id: string}[]>([]);
    const availableAssignmentParser = ref<{name: string, rules: AssignmentRules, id: string}[]>(SampleAssignmentParser);
    const documentSource = ref<DocumentSource>({
        type: 'file',
        destType: 'file',
    });
    const hasLoaded = ref<boolean>(false);
    const showSftpModalBasePath = ref<boolean>(false);
    const basePath = ref<string>('');
    const timeFilterCollapsed = ref<boolean>(true);
    
    SampleParser.forEach(element => {
        availableDirParsers.value.push({
            id: element.id,
            name: element.name,
            rules: element.rules,
        });
    });
    
    const dateRange = ref<{from?: string, to?: string}>();
    const selectedDirParserName = ref<string>('');
    const selectedFileParserName = ref<string>('');
    const { t } = useI18n();

    return {
        files,
        fileReceiverMapping,
        availableDirParsers: availableDirParsers,
        documentSource,
        hasLoaded,
        dateRange,
        availableAssignmentParser,
        showSftpModalBasePath,
        basePath,
        timeFilterCollapsed,
        selectedDirParserName,
        selectedFileParserName,
        t,

    };

  }
});

</script>