<template>
    <div>
        <!-- Select Box to pick rules -->
        <q-select
            filled
            v-model="parser"
            :options="rules"
            option-label="name"
            label="Parser auswählen"
            color="secondary"
            map-options
            ></q-select>            
    </div>
    <div class="q-my-lg text-right">        
        <q-btn color="secondary" text-color="black" label="Einlesen" @click="parseFile()" />
    </div>
    <div class="q-my-lg">
        <!-- table with results-->
        <q-table
            v-if="receivers.length > 0"
            :rows="receivers"
            :columns="receiverColumns"
            row-key="id"
            class="q-pa-md"
            flat
            bordered
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


export default defineComponent({
  name: 'SourceReceiversParser',
  components: {
   },
  setup() {   
    const parser = ref<{rules: ReceiverParserRules, name: string} | null>(null);
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
    return {      
      parser,
      directories,
      files,
      isLoading,
      errorMsg,
      rules,
      content,
      receivers,
      receiverColumns
    };
  },
  emits: ['update:modelValue', 'parsed'],
  computed: {
    
  },
  methods: {
    emitResults() {
        const receiverRecords : ReceiverRecord[] = [];
        this.receivers.forEach((receiver: ReceiverParserResult) => {
            const record : ReceiverRecord = receiver
            receiverRecords.push(record);
        });
        this.$emit('parsed', receiverRecords);
    },
    async readFile() {
        if(this.receiverSource.type){
            if(this.receiverSource.type === 'file' && this.receiverSource.file){
                return Files.readFile(this.receiverSource.file, 'utf8');
            }else if(this.receiverSource.type === 'sftp' && this.receiverSource.sftp?.filePath && this.receiverSource.sftp?.connection){
                return Sftp.readFile(this.receiverSource.sftp.filePath, this.receiverSource.sftp.connection, 'utf8');
            }
        }
        return "";
    },
    async parseFile() {
        const fileContent = await this.readFile();
        if(!this.parser){
            console.error('No parser selected');
            return;
        }
        this.receivers = ReceiverParser.parse(fileContent??'', this.parser.rules);   
        this.emitResults();  
    },
  },
  props: {
    receiverSource: {
        type: Object as PropType<ReceiverSource>,
        required: true,
    },
  }
})

</script>