<template>
    <div class="flex flex-col gap-4">
        <div class="flex items-end gap-3">
            <FormField :label="t('ui.bulk.common.parser')" class="flex-1">
                <Select
                    v-model="parser"
                    :options="getRules()"
                    option-label="name"
                    :placeholder="t('ui.bulk.common.selectParser')"
                    @update:model-value="cacheParser($event)"
                />
            </FormField>
            <Button severity="secondary" outlined :label="t('ui.bulk.common.read')" :disabled="!parser" @click="parseFile()">
                <template #icon><FileInput :size="18" /></template>
            </Button>
        </div>
        <template v-if="receivers.length > 0">
            <div class="flex items-center gap-2">
                <StatusTag type="delivered" :label="t('ui.bulk.receiverParser.count', { n: receivers.length })" />
            </div>
            <TableCard>
                <DataTable :value="receivers" paginator :rows="10" :loading="isLoading">
                    <Column v-for="col in receiverColumns" :key="col.name" :field="col.field" :header="col.label" sortable />
                </DataTable>
            </TableCard>
        </template>
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
import { useI18n } from 'vue-i18n';
import Button from 'openvue/button';
import Select from 'openvue/select';
import DataTable from 'openvue/datatable';
import Column from 'openvue/column';
import { FileInput } from 'lucide-vue-next';
import FormField from 'components/ui/FormField.vue';
import StatusTag from 'components/ui/StatusTag.vue';
import TableCard from './ui/TableCard.vue';
import { useNotify } from 'src/composables/useNotify';
import { receiverColumnDefs } from './receiverColumns';


export default defineComponent({
  name: 'SourceReceiversParser',

  components: {
    // eslint-disable-next-line vue/no-reserved-component-names -- OpenVue components keep their PrimeVue names
    Button, Select, DataTable, Column, FileInput, FormField, StatusTag, TableCard,
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
    const { t } = useI18n();
    const notify = useNotify();
    const receiverColumns = receiverColumnDefs(t);
    

    const parsersProvider = ref(new ParsersProvider());

    return {
      t,
      notify,
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
        this.notify.error(this.t('ui.bulk.errors.loadParsers'));
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