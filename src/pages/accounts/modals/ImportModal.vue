<template>
   <div>
     <q-dialog 
    class="unselectable"
    v-model="value">
    <q-card>
         <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 q-px-md">Account Importieren</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="close()" />
        </q-card-section>
        <q-card-section>
            <q-banner rounded class="bg-accent text-white q-mb-md">
                <p>Um die Backup-Datei zu importieren, wird ein das Passwort benötigt, das beim Erstellen des Backups verwendet wurde. Bitte gib das Passwort ein, um den Import durchzuführen.</p>
            </q-banner>
            <div class="row">
              <div class="col-9">Dateipfad: {{ filePath }}</div>
              <div class="col-3 text-right">
                <q-btn 
                outline
                @click="selectFile()"
                icon="upload"></q-btn>
              </div>
            </div>
            <div>
            <q-input 
              :disable="!filePath || filePath.length == 0"
                        v-model="password"
                        type="password"
                        color="secondary"
                        label="Gib das Passwort für das Backup ein"
                    />
            </div>          
        </q-card-section>
        <q-card-section>            
            <q-btn flat label="Abbrechen" @click="close()" />
            <q-btn 
                color="secondary"
                text-color="black" 
                label="Backup erstellen" 
                @click="importData()"
                class="q-ml-md"
                :disable="!password || password.length === 0"
            />
        </q-card-section>
      </q-card>
            
    </q-dialog>
   </div>
</template>
<script lang="ts">
import EncryptedStoreService from 'src/services/node/EncryptedStoreService';
import Files from 'src/services/node/Files';
import { defineComponent, ref } from 'vue';



export default defineComponent({
  name: 'ExportAccountModal',
    props: {
        modelValue: {
            type: Boolean,
            required: true,
        },
    },
    methods: {
        close() {            
            this.value = false;
            this.errorMsg = ""
            this.filePath = ""
            this.fileData = ""
        },
        selectFile(){
          void Files.pickFile({
            properties: ['openFile'],
            filters: [
                { name: 'Brifle Backup', extensions: ['json'] },
            ],
        }).then((filePaths: string[]) => {
            if (!filePaths) {
                return;
            }
            const filePath = filePaths[0] ?? "";
            this.filePath = filePath;
            Files.readFile(filePath, "utf8").then((data: string) => {
                if (!data) {
                    console.error('No data found in file');
                    return;
                }
                this.fileData = data;               
                
            }).catch((err: Error) => {
                console.error(err);
            });
            
        })
        },
        importData() {          
          // parse the data
          void this.encryptedStoreService.importAccount(this.password, this.fileData).then((parsedData) => {
            if (!parsedData) {
                console.error('No data found in file');
                this.$q.notify({
                    color: 'negative',
                    message: 'Fehler beim Importieren des Kontos: Datei konnte nicht gelesen werden. Bitte überprüfe, ob die Datei korrekt ist und das Passwort stimmt.',
                    icon: 'error'
                });
                return;
            }
            this.$emit('import', {accountData: parsedData});
            this.close();   
            this.$q.notify({
                color: 'positive',
                message: 'Kontodaten erfolgreich importiert.',
                icon: 'check'
            });
          }).catch((err: Error) => {
            this.$q.notify({
                color: 'negative',
                message: 'Fehler beim Importieren des Kontos: Datei konnte nicht gelesen werden. Bitte überprüfe, ob die Datei korrekt ist und das Passwort stimmt.',
                icon: 'error'
            });
              console.error(err);
          });              
        },
    },
    emits: ['update:modelValue', 'import'],
    computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(value : boolean) {
        this.$emit('update:modelValue', value);
      },
    },
  },
  setup() {
    const password = ref('');
    const encryptedStoreService = new EncryptedStoreService();
    const filePath = ref('')
    const fileData = ref('')
    const errorMsg  = ref('')
    return {
      password,
      encryptedStoreService,
      filePath,
      fileData,
      errorMsg
    };
  },
});
</script>
<style scoped>
</style>