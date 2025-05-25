<template>
    <q-select v-if="isDirAnalysis"
        v-model="value.dirParser"
        :options="availableParsers"
        color="secondary"
        option-label="name"
        option-value="rules"
        label="Parser auswählen"
        emit-value
        map-options
    >
    </q-select>
    <q-select v-else
        v-model="value.fileAssignment"
        :options="availableAssignmentParser"
        color="secondary"
        option-label="name"
        option-value="rules"
        label="Parser auswählen"
        emit-value
        map-options
    ></q-select>
    <div class="q-my-xl" v-if="value.dirParser != null && isDirAnalysis">
        <div class="text-h6">Filter - Datum Zeitstempel</div>        
        <div class="row">
            <div class="col-6">
                <div class="q-pa-md">       
                    <q-date v-model="dateRange" 
                    text-color="black"
                    color="secondary" range /> 
                </div>               
            </div>
            <div class="col-6">                
                <div class="flex-column quick-actions">
                    <div>
                        <q-btn color="accent" class="q-mb-md" @click="dateRangeToThisMonth()">
                            Diesen Monat
                        </q-btn>
                    </div>
                    <div>
                        <q-btn  color="grey-3" outline @click="resetDateRange()">
                            Zurücksetzen
                        </q-btn>
                    </div>
                    
                </div>
            </div>
        </div>            
    </div>
    <div v-else-if="!isDirAnalysis">
        <!-- 
            requires that a base directory can be selected, required if the path is selected from a file system 
            (Window and Mac have different path structures)
            optional for sftp, since path should be be consistent (relative path is still recommended)
         -->
        <q-input v-model="basePath" 
            color="secondary"
            label="Basisverzeichnis"
            placeholder="z.B. /home/user/documents"
            :rules="[val => val && val.length > 0 || 'Pfad ist erforderlich']" />
    </div>
    <div class="q-my-lg text-right">        
        <q-btn color="secondary" text-color="black" label="Einlesen" @click="parse()" />
    </div>
    <div class="q-my-lg">
        <!-- table with results-->
        <q-table
            v-if="fileReceiverMapping.length > 0 || hasLoaded"
            :rows="fileReceiverMapping"
            :columns="columns()"
            class="q-pa-md"
            flat
            bordered
        />
    </div>
    
    <SftpModal v-if="documentSource.sftp?.connection != null"
                :sftpConnection="documentSource.sftp?.connection"
                @select-file="selectSftpBasePath"
                :showFiles="false"

                v-model="showSftpModalBasePath">
 
    </SftpModal>
</template>
<style lang="scss">
    .quick-actions{
        .q-btn {
            width: 300px;
            max-width: 100%;
        }
    }
</style>
<script lang="ts">

import { defineComponent, PropType, ref} from 'vue';
import { DocumentSource } from '../util/helper';
import Files from 'src/services/node/Files';
import Sftp from 'src/services/node/Sftp';
import { SftpLsDirResponse } from 'app/src-electron/service/SftpConnector';
import { FilesLsDirResponse } from 'app/src-electron/service/Files';
import { DocumentSourceDirParser, DocumentSourceDirParserResult, DocumentSourceDirParserRules } from '../util/documents/parsers';
import SampleParser from '../util/documents/sampleParsers';
import DocumentRecord from '../util/documents/documentRecord';
import { SftpData } from 'app/src-electron/models/EncryptedStore';
import AssignmentFile, { AssignmentRules } from '../util/documents/assignmentFile';
import SampleAssignmentParser from '../util/documents/sampleAssignmentRules';


export default defineComponent({
  name: 'SourceDocumentsParser',
  components: {
  },
  
  computed: {
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
    parse() {
        if(this.isDirAnalysis) {
            void this.parseDirectoryFiles();
        } else {
            void this.parseAssignmentFile();
        }
    },
    
    columns() {
        return [
            { name: 'fileName', label: 'Datei', field: 'fileName', sortable: true },
            { name: 'receiverId', label: 'Empfänger',  field: 'receiverId', sortable: true },
            { name: 'date', label: 'Datum', field: 'date', sortable: true, format: (val: Date|null) => {       
                    if(val == null) {
                        return '';
                    }      
                    return val.toLocaleDateString('de-DE', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                    });
                } 
            }
        ];
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
                fileName: await this.getFullPath(this.basePath,element.filePath),
                receiverId: element.receiverId,
                date: null,
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
            this.fileReceiverMapping = this.fileReceiverMapping.filter((element: DocumentSourceDirParserResult) => {
                const date = new Date(element.date?.toDateString() ?? '');
                if(date == null) {
                    return false;
                }
                // remove time from date
                const fromDate = new Date(new Date(this.dateRange!.from ?? '').toDateString());
                const toDate = new Date(new Date(this.dateRange!.to ?? '').toDateString());
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

        const res : DocumentRecord[] = await Promise.all(this.fileReceiverMapping.map(async (element: DocumentSourceDirParserResult) => {
            return {
                filePath: await this.getFullPath( dirBasePath, element.fileName),
                receiverId: element.receiverId,
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
    }
  },
  mounted() {
    this.documentSource = this.modelValue;
    this.hasLoaded = false;
    void this.getDefaultBasePath().then((path: string) => {
        this.basePath = path;        
    });
    if(this.isDirAnalysis) {
        void this.readDirectory().then(() => {
            void this.parseDirectoryFiles().then(() => {
               
            });
        });
    }
  },
  emits: ['update:modelValue', 'parsed'], 
  props: {
    modelValue: {
        type: Object as PropType<DocumentSource>,
        required: true,
    },    
  }, 
  
  setup() {       
    const files = ref<string[]>([]);
    const fileReceiverMapping = ref<DocumentSourceDirParserResult[]>([]);    
    const availableDirParsers = ref<{name: string, rules: DocumentSourceDirParserRules}[]>([]);
    const availableAssignmentParser = ref<{name: string, rules: AssignmentRules}[]>(SampleAssignmentParser);
    const documentSource = ref<DocumentSource>({
        type: 'file',
        destType: 'file',
    });
    const hasLoaded = ref<boolean>(false);
    const showSftpModalBasePath = ref<boolean>(false);
    const basePath = ref<string>('');
    
    SampleParser.forEach(element => {
        availableDirParsers.value.push({
            name: element.name,
            rules: element.rules,
        });
    });
    
    const dateRange = ref<{from?: string, to?: string}>();

    return {
        files,
        fileReceiverMapping,
        availableParsers: availableDirParsers,
        documentSource,
        hasLoaded,
        dateRange,
        availableAssignmentParser,
        showSftpModalBasePath,
        basePath,

    };

  }
});

</script>