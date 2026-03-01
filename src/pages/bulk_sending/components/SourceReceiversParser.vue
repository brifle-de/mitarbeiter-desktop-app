<template>
    <div>
        <!-- Select Box to pick rules -->
        <q-select
            filled
            v-model="parser"
            :options="getRules()"
            @update:model-value="cacheParser($event)"
            option-label="name"
            label="Parser auswählen"
            color="secondary"
            map-options
            ></q-select>            
    </div>
    <div class="q-my-lg text-right">        
        <q-btn 
        flat class="muted-action-btn" color="secondary" label="Einlesen" @click="parseFile()" />
    </div>
    <div class="q-my-lg">
        <!-- table with results-->
        <q-table
            v-if="receivers.length > 0"
            :rows="receivers"
            :columns="receiverColumns"
            row-key="id"
            class="q-pa-md material-card material-card-muted"
            flat
            :pagination="{ rowsPerPage: 10 }"
            :loading="isLoading"
        />

    </div>

</template>

<script lang="ts">

import { defineComponent, PropType, Ref, ref } from 'vue';
import { ReceiverSource } from '../util/helper';
import SampleParsers from '../util/receivers/sampleParsers';
import { ReceiverParserResult, ReceiverParserRules } from '../util/receivers/parsers';
import Files from 'src/services/node/Files';
import { ReceiverParser } from '../util/receivers/parsers';
import ReceiverRecord from '../util/receivers/receiverRecord';
import Sftp from 'src/services/node/Sftp';
import { Buffer } from 'buffer';
import { ParsersProvider } from 'src/services/node/ParsersProvider';


export default defineComponent({
  name: 'SourceReceiversParser',

  components: {
   },
  setup() {   
    const parser = ref<{rules: ReceiverParserRules, name: string, id: string} | null>(null);
    const directories : Ref<string[]> = ref([]);
    const files : Ref<string[]> = ref([]);
    const isLoading = ref(false);
    const errorMsg = ref('');
    const rules = SampleParsers
    const content = ref<string>('');
    const receivers: Ref<ReceiverParserResult[]> = ref([]);
    const receiverColumns = ref([
        {
            name: 'id',
            label: 'ID',
            field: 'receiverId',
            sortable: true,
        },
        {
            name: 'firstName',
            label: 'Vorname',
            field: 'firstName',
            sortable: true,
        },
        {
            name: 'lastName',
            label: 'Nachname',
            field: 'lastName',
            sortable: true,
        },
        {
            name: 'dateOfBirth',
            label: 'Geburtsdatum',
            field: 'dateOfBirth',
            sortable: true,
        },
        {
            name: 'placeOfBirth',
            label: 'Geburtsort',
            field: 'placeOfBirth',
            sortable: true,
        },
        {
            name: 'email',
            label: 'Email',
            field: 'email',
            sortable: true,
        },
        {
            name: 'phone',
            label: 'Phone',
            field: 'phone',
            sortable: true,
        }
    ]);
    

    const parsersProvider = ref(new ParsersProvider());

    return {      
      parser,
      directories,
      files,
      isLoading,
      errorMsg,
      rules,
      content,
      receivers,
      receiverColumns,
     parsersProvider,
    };
  },
  emits: ['update:modelValue', 'parsed'],
  computed: {
    parserType() {
        const fileName = this.receiverSource.type === 'file' ? this.receiverSource.file : this.receiverSource.sftp?.filePath;
        if(fileName){
            const fileExtension = fileName.split('.').pop();
            return fileExtension;
        }
        return "";
    },
  },
  mounted() {
    
    const cachedParser = this.useLocalStorage ? localStorage.getItem(this.localStorageKey) : null;
    this.parsersProvider.getReceiversParsers().then((parsers) => {
        const customParsers = Object.values(parsers);
        this.rules = this.rules.concat(customParsers);
        if(cachedParser) {
            this.loadParser(cachedParser);
        }
        if(this.initValue && this.initValue.parserId) {
            this.loadParser(this.initValue?.parserId);
        }
    }).catch((err: Error) => {
        console.error('Error fetching custom parsers:', err);
        this.$q.notify({
            message: 'Fehler beim Laden der benutzerdefinierten Parser',
            color: 'red',
            position: 'top',
            timeout: 2000,
        });
    });    
  },
  methods: {
    loadParser(idOrName: string) {
        const found = this.rules.find((rule) => rule.name === idOrName || rule.id === idOrName);
        if(found) {
            this.parser = found;
        }
    },
    emitResults() {
        const receiverRecords : ReceiverRecord[] = [];
        this.receivers.forEach((receiver: ReceiverParserResult) => {
            const record : ReceiverRecord = receiver
            receiverRecords.push(record);
        });
        this.$emit('parsed', {records: receiverRecords, parserId: this.parser?.id?? this.parser?.name?? ''});
    },
    async readFile(encoding: BufferEncoding) : Promise<string> {
        if(this.receiverSource.type){
            if(this.receiverSource.type === 'file' && this.receiverSource.file){
                return Files.readFile(this.receiverSource.file, encoding);
            }else if(this.receiverSource.type === 'sftp' && this.receiverSource.sftp?.filePath && this.receiverSource.sftp?.connection){
                return Sftp
                .readFile(this.receiverSource.sftp.filePath, this.receiverSource.sftp.connection, encoding)
                .then((data => {
                    if (data) return data;
                    return "";
                }));

            }
        }
        return "";
    },
    async parseFile() {        
        if(!this.parser){
            console.error('No parser selected');
            return;
        }
        const fileContent = await this.readFile(this.parser.rules.encoding);     
        const buffer = new TextEncoder().encode(fileContent);
        // text encoder users utf-8 therefore override the encoding in rules to utf-8,
        //  use deep copy to avoid modifying original rules and cause conflicts
        const rulesCopy = JSON.parse(JSON.stringify(this.parser.rules));
        rulesCopy.encoding = 'utf-8';

        this.receivers = ReceiverParser.parse(Buffer.from(buffer), rulesCopy);  
        this.emitResults();  
    },
    getRules(){
        return this.rules.filter((rule) => {
            return rule.rules.type === this.parserType;
        });
    },
    cacheParser(event: {rules: ReceiverParserRules, name: string} | null) {
        if(this.useLocalStorage) {
            if(event) {
                localStorage.setItem(this.localStorageKey, event.name);
            } else {
                localStorage.removeItem(this.localStorageKey);
            }
        }
    }
  },

  props: {
    receiverSource: {
        type: Object as PropType<ReceiverSource>,
        required: true,
    },
    useLocalStorage: {
        type: Boolean,
        default: true,
    },
    localStorageKey: {
        type: String,
        default: 'selectedReceiverParser',
    },
    initValue: {
        type: Object as PropType<ReceiverSource>,
        required: false,
    }
    
  }
})

</script>