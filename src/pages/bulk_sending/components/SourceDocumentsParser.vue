<template>
    <q-select
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
    <div class="q-my-xl" v-if="value.dirParser != null">
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
    <div class="q-my-lg text-right">        
        <q-btn color="secondary" text-color="black" label="Einlesen" @click="parseDirectoryFiles()" />
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
    columns() {
        return [
            { name: 'fileName', label: 'Datei', field: 'fileName', sortable: true },
            { name: 'receiverId', label: 'Empfänger',  field: 'receiverId', sortable: true },
            { name: 'date', label: 'Datum', field: 'date', sortable: true, format: (val: Date) => {             
                    return val.toLocaleDateString('de-DE', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                    });
                } 
            }
        ];
    },
    getBasePath() {
        if(this.isSFtp) {
            return this.value.sftp?.filePath ?? '/';
        } else {
            return this.value.file ?? '/';
        }
    },
    getFullPath(basePath: string, fileName: string) {
        // check if basePath ends with /
        if(basePath.endsWith('/')) {
            return basePath + fileName;
        } else {
            return basePath + '/' + fileName;
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
        }
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
        this.emitResult();
    },
    hasDateFilter(){
        if(this.dateRange == null) {
            return false;
        }
        return (this.dateRange.from !== undefined && this.dateRange.from !== "") || 
            (this.dateRange.to !== undefined && this.dateRange.to !== "");
    },
    emitResult(){
        const res : DocumentRecord[] = [];
        const basePath = this.getBasePath();

        const sftpConnection : SftpData | undefined = this.value.sftp?.connection ?? undefined;

        this.fileReceiverMapping.forEach((element: DocumentSourceDirParserResult) => {
            res.push({
                filePath: this.getFullPath(basePath, element.fileName),
                receiverId: element.receiverId,
                type: this.value.type,          
                ...(sftpConnection !== undefined) && { sftp: sftpConnection },  
            });
        });
        this.$emit('parsed', res);
    },
  },
  mounted() {
    this.documentSource = this.modelValue;
    this.hasLoaded = false;
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
    const availableParsers = ref<{name: string, rules: DocumentSourceDirParserRules}[]>([]);
    const documentSource = ref<DocumentSource>({
        type: 'file',
        destType: 'file',
    });
    const hasLoaded = ref<boolean>(false);

    SampleParser.forEach(element => {
        availableParsers.value.push({
            name: element.name,
            rules: element.rules,
        });
    });
    const dateRange = ref<{from?: string, to?: string}>();

    return {
        files,
        fileReceiverMapping,
        availableParsers,
        documentSource,
        hasLoaded,
        dateRange

    };

  }
});

</script>