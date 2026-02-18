<template>
    <q-page class="q-px-xl">

      <div class="text-h4 q-my-xl">Empfänger Prüfen</div>

      <q-separator class="q-mb-lg q-mt-lg" />

      <div class="text-right">
         <q-btn-toggle
        v-model="fileSource"
        push
        glossy
        @update:model-value="clear()"
        toggle-color="green-7"
        :options="[
          {label: 'Lokal', value: 'local', slot: 'local'},
          {label: 'Sftp', value: 'sftp', slot: 'sftp'},
        ]"
      >
        <template v-slot:local>
          <q-tooltip>Lokale Datei</q-tooltip>
        </template>

        <template v-slot:sftp>
          <q-tooltip>Sftp Server</q-tooltip>
        </template>

      </q-btn-toggle>
      </div>
      
      <div v-if="fileSource === 'local'" class="q-mt-xl" color="material-card">
        <div class="text-h5 q-mb-lg">
            Lokale Datei
        </div>
        <div>
             <FileDragAndDrop 
                :formats="['text/csv']"
                :multiple="true"
                @drop="addFile($event)"
            />
        </div>
        <div>
            <!-- files grid -->
             <div class="row q-col-gutter-md q-mt-md">
                <div v-for="file in files" :key="file.name+'file_names'" class="col-4">
                    <q-card class="bg-fading rounded-borders q-pa-md">
                        <div class="text-h6">{{ file.name }}</div>       
                        <!-- delete -->                
                        <q-btn icon="delete" color="red-5" flat round dense class="absolute-top-right" @click="files.splice(files.indexOf(file), 1)" />
                    </q-card>   
                </div>
            </div>
        </div>        
      </div>
      <div v-if="fileSource === 'sftp'" class="q-mt-xl ">
        <div class="text-h5 q-mb-lg">
            SFTP Verbindung
        </div>
        <div class="material-card rounded-borders q-pa-md">
            <div class="text-h6 q-mb-lg">
                Sftp Server
            </div>
            <div>
                <q-select
                filled
                v-model="sftpServerSelected"
                :options="sftpServer"
                option-label="displayName"
                label="SFTP-Server auswählen"
                color="secondary"
                map-options
            />
            </div>
            <div class="row q-my-md" v-if="sftpServerSelected != null">   
                <div class="col-9">
              
                </div>
                <div class="col-3 text-right">
                    <SftpModal 
                    :sftpConnection="sftpServerSelected"
                    @select-file="selectSftpFile"
                    :select-text="'Datei hinzufügen'"
                    :show-path="false"
                    v-model="showSftpModal">
    
                    </SftpModal>
                    <q-btn @click="showSftpModal = true" color="secondary" text-color="black" label="Datei auswählen" />
                </div>
            </div>
        </div>
        <div>
                <!-- files grid -->
                <div class="row q-col-gutter-md q-mt-md" v-if="sftpFilePaths.length > 0">
                     <div v-for="filePath in sftpFilePaths" :key="filePath+'file_paths'" class="col-4">
                    <div class="col-4">
                        <q-card class="bg-fading rounded-borders q-pa-md">
                            <div class="text-h6">{{ filePath }}</div>       
                            <!-- delete -->                
                            <q-btn icon="delete" color="red-5" flat round dense class="absolute-top-right" @click="sftpFilePaths.splice(sftpFilePaths.indexOf(filePath), 1)" />
                        </q-card>   
                    </div>
                    </div>
                </div>
        </div>
        <div class="q-mt-lg" v-if="sftpFilePaths.length > 0">
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
        <div>
            <!-- Search Btn -->
            <div class="row q-my-md" v-if="sftpFilePaths.length > 0">   
                <div class="col-9">
            
                </div>
                <div class="col-3 text-right">
                    <q-btn color="secondary" text-color="black" label="Einlesen" @click="parseSftpFiles()" />
                </div>
            </div>
        </div>
       
      </div>
      <div class="q-mt-lg" v-if="files.length > 0">
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
    <div class="q-my-lg text-right" v-if="files.length > 0">
        <q-btn color="secondary" text-color="black" label="Einlesen" @click="parseLocalFile()" />
    </div>
    <div v-if="receivers.length > 0">
        <q-separator class="q-mb-lg q-mt-lg" />
        <div class="text-h5 q-mb-lg">
            Datei Eingabe
        </div>
        <div class="q-my-md">
            Die eingelesenen Dateien enthalten {{ receivers.length }} Empfänger. Die folgende Tabelle zeigt die Einträge die geprüft werden.
        </div>
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
    <div class="text-h5 q-my-lg" v-if="receivers.length > 0">
            Ergebnisse
    </div>
    <SearchReceiversResults
        v-if="receivers.length > 0"
        :receiverRecords="receivers"
    />
    </q-page>
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

export default defineComponent({
  name: 'ReceiverCheckPage',
  components: {
    FileDragAndDrop,
    SearchReceiversResults,
    SftpModal
  },
  computed: {
    parserType() {        
        return "csv";
    }
  },
  methods: {
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
        this.$q.notify({
            message: 'Fehler beim Laden der benutzerdefinierten Parser',
            color: 'red',
            position: 'top',
            timeout: 2000,
        });
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

    const sftpServer = ref<SftpData[]>([]);
    const sftpServerSelected = ref<SftpData|null>(null);
    const showSftpModal = ref<boolean>(false);
    const sftpFilePaths = ref<string[]>([]);
  
    return {
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

