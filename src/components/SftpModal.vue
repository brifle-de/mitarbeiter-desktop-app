<template>

    <q-dialog v-model="value" @show="onShow">

        <q-card class="searchSftpCard">
            <q-card-section class="row items-center q-pb-none">
                        <div class="text-h6 q-mr-md">Sftp Durchsuchen</div>

                        <q-space />
                        <q-btn icon="close" flat round dense v-close-popup />
                        </q-card-section>
           <div class="q-ma-lg q-px-sm">
            <div class="row">
              <div class="col">
                <q-btn @click="navBack">
                  <q-icon name="arrow_back" />
                </q-btn>
              </div>
              <div class="col-11">
                  <q-input outlined color="secondary"
                readonly
                dense v-model="path" label="Pfad" />
              </div>

            </div>
            <template v-if="isLoading">
              <div class="text-center q-my-lg">
                <LoadingSpinner />
              </div>
            </template>
            <template v-else>
              <template v-if="errorMsg.length > 0">
                <q-banner class="bg-red-5 text-white q-mt-md">
                  {{ errorMsg }}
                </q-banner>
              </template>

              <q-list padding class="rounded-borders">
              <!-- list all directories -->
              <template v-if="directories.length > 0 && showDirectories">
                <q-item-label header>Ordner</q-item-label>

                <q-item clickable v-ripple
                :key="'directory' + directory + index"
                @click="appendPath(directory)"
                v-for="(directory, index) in directories">
                  <q-item-section avatar top>
                    <q-avatar icon="folder" color="primary" text-color="white" />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label lines="1">{{ directory }}</q-item-label>
                  </q-item-section>

                </q-item>
                </template>

              <!-- list all files -->
              <template v-if="files.length > 0 && showFiles">
                  <q-item-label header>Dateien</q-item-label>

                  <q-item clickable v-ripple
                  @click="selectFile(file)"
                  :key="'file' + file + index"
                  v-for="(file, index) in files">
                    <q-item-section avatar top>
                      <q-avatar icon="insert_drive_file" color="secondary" text-color="green-7" />
                    </q-item-section>

                    <q-item-section>
                      <q-item-label lines="1">{{ file }}</q-item-label>
                    </q-item-section>

                  </q-item>
                </template>

            </q-list>
          </template>
           </div>

           <div class="q-ma-lg">
            <q-card-actions class="q-table-actions justify-between">
                <q-btn label="Abbrechen" outline @click="value = false" />
                <q-btn label="Öffnen"  outline @click="selectDirectory()"
                color="secondary" ></q-btn>
            </q-card-actions>
           </div>
        </q-card>
        </q-dialog>
    </template>

    <style lang="scss" scoped>

    .q-table-actions{
      text-align: right;
    }
    .searchSftpCard{
      width: 800px;
      max-width: 80vw;
      min-height: 300px;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      align-items: stretch;
      .item-section{
        flex: 1;
        display: flex;
        flex-direction: column;
        .q-table__container{
          flex: 1;
        }
      }
    }
    </style>

<script lang="ts">

import { defineComponent, PropType, Ref, ref } from 'vue';
import Sftp from 'src/services/node/Sftp';
import { SftpConnection } from 'app/src-electron/service/SftpConnector';
import LoadingSpinner from 'src/components/LoadingSpinner.vue';

export default defineComponent({
  name: 'SftpModal',
  components: {
    LoadingSpinner
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
  },
  mounted() {
    this.path = this.initPath;
  },
  methods: {
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
