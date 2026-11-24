<template>
  <Dialog v-model:visible="value" modal header="SFTP durchsuchen" :style="{ width: '800px', maxWidth: '80vw' }" @show="onShow">
    <div class="flex flex-col gap-4">
      <div class="flex items-center gap-2">
        <Button severity="secondary" outlined aria-label="Zum Stammverzeichnis" @click="backToRoot"><template #icon><House :size="18" /></template></Button>
        <Button severity="secondary" outlined aria-label="Eine Ebene zurück" @click="navBack"><template #icon><ArrowLeft :size="18" /></template></Button>
        <InputText v-if="showPath" v-model="path" readonly class="flex-1" aria-label="Pfad" />
      </div>
      <div v-if="isLoading" class="flex justify-center py-8"><LoadingSpinner /></div>
      <template v-else>
        <Message v-if="errorMsg.length > 0" severity="error">{{ errorMsg }}</Message>
        <div class="max-h-[50vh] overflow-auto">
          <template v-if="directories.length > 0 && showDirectories">
            <div class="ma-label px-2 pb-1 pt-2 text-ink-muted">Ordner</div>
            <button
              v-for="(directory, index) in directories"
              :key="'directory' + directory + index"
              class="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-dezent"
              @click="appendPath(directory)"
            >
              <Folder :size="18" class="text-icon-brand" />
              <span class="truncate">{{ directory }}</span>
            </button>
          </template>
          <template v-if="files.length > 0 && showFiles">
            <div class="ma-label px-2 pb-1 pt-3 text-ink-muted">Dateien</div>
            <button
              v-for="(file, index) in files"
              :key="'file' + file + index"
              class="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-left hover:bg-dezent"
              @click="selectFile(file)"
            >
              <FileText :size="18" class="text-ink-muted" />
              <span class="truncate">{{ file }}</span>
            </button>
          </template>
        </div>
      </template>
    </div>
    <template #footer>
      <Button severity="secondary" outlined label="Abbrechen" @click="value = false" />
      <Button :label="selectText" @click="selectDirectory()" />
    </template>
  </Dialog>
</template>


    

<script lang="ts">

import { defineComponent, PropType, Ref, ref } from 'vue';
import Sftp from 'src/services/node/Sftp';
import { SftpConnection } from 'app/src-electron/service/SftpConnector';
import LoadingSpinner from 'src/components/LoadingSpinner.vue';
import Dialog from 'openvue/dialog';
import Button from 'openvue/button';
import InputText from 'openvue/inputtext';
import Message from 'openvue/message';
import { ArrowLeft, FileText, Folder, House } from 'lucide-vue-next';

export default defineComponent({
  name: 'SftpModal',
  components: {
    LoadingSpinner, Dialog, Button, InputText, Message, ArrowLeft, FileText, Folder, House,
  },
  setup() {   
    const path = ref('/');
    const directories : Ref<string[]> = ref([]);
    const files : Ref<string[]> = ref([]);
    const isLoading = ref(false);
    const errorMsg = ref('');
    return {      
      path,
      directories,
      files,
      isLoading,
      errorMsg,
    };
  },
  emits: ['update:modelValue', 'selectFile'],
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
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    sftpConnection: {
      type: Object as PropType<SftpConnection>,
      required: true,
    },    
    showFiles: {
      type: Boolean,
      default: true,
    },
    showDirectories: {
      type: Boolean,
      default: true,
    },
    initPath: {
      type: String,
      default: '/',
    },
    useProxy: {
      type: Boolean,
      default: false,
    },
    selectText: {
      type: String,
      default: 'Datei auswählen',
    },
    showPath: {
      type: Boolean,
      default: true,
    },



  },
  mounted() {
    this.path = this.initPath;
  },
  methods: {
    backToRoot() {
      this.path = '/';
      this.searchCurrentPath();
    },
    selectDirectory() {
      this.$emit('selectFile', this.path);
      this.value = false;
    },
    navBack() {
      if (this.path === '/') {
        return;
      }
      const pathArray = this.path.split('/');
      // pop the last two elements
      pathArray.pop();
      pathArray.pop();
      this.path = `${pathArray.join('/')}/`;
      this.searchCurrentPath();
    },
    appendPath(directory : string) {
      this.path = `${this.path + directory}/`;
      this.searchCurrentPath();
    },
    selectFile(file : string) {
      const filePath = `${this.path}${file}`;
      this.$emit('selectFile', filePath);
      this.value = false;
    },
    onShow() {
      this.searchCurrentPath();
    },
    searchCurrentPath() {     
      this.isLoading = true;
      void Sftp.lsDir(this.path, this.sftpConnection).then((res) => {      
        if(res == null) {
          this.errorMsg = 'Verbindungsfehler';          
        }else {
          this.errorMsg = '';
        }
        this.directories = res?.directories.map(e => e.name) ?? [];        
        this.files = res?.files.map(e => e.name) ?? [];
        this.isLoading = false;
      }).finally(() => {
        this.isLoading = false;
      });
    },
  },

});
</script>
