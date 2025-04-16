<template>
    <h5>
        Bericht über den Versand der Dokumente       
    </h5>   
     <!-- grid 3 col -->
     <div class="result-grid">       
        <div>
            <div class="text-bold text-h5">
                {{ errorRecords.length }}
            </div>
            <div class="text-h6 q-py-md" style="height: 60px;">
                Dokumente nicht versendet
            </div>             
        </div>
        <div>
            <div class="text-bold text-h5">
                {{ successRecords.length }}
            </div>
            <div class="text-h6 q-py-md" style="height: 60px;">
                Dokumente erfolgreich versendet
            </div>
        </div>
        <div>
            <div class="text-bold text-h5">
                {{ notBrifleRecords.length }}
            </div>
            <div class="text-h6 q-py-md" style="height: 60px;">
                Kein Brifle Empfänger
            </div>
        </div>
     </div>
     <div class="q-mt-xl">
        <q-list class="rounded-borders">
      <q-expansion-item
        label="Erfolgreiche Versendung mit Brifle"
      >
        <q-card>
          <q-card-section>
            <q-table
              :rows="successRecords"
              :columns="getColumns()"
              row-key="path"
              :pagination="{ rowsPerPage: 10 }"
              class="q-pa-md"
              flat
            >
              <template v-slot:top-right>
                <q-btn color="secondary"  
                @click="showExport(successRecords)"
                text-color="black" label="Export" icon="file_download" />
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <q-expansion-item
        label="Fehlgeschlagene Versendung mit Brifle"
      >
        <q-card>
          <q-card-section>
            <q-table
              :rows="errorRecords"
              :columns="getColumns()"
              row-key="path"
              :pagination="{ rowsPerPage: 10 }"
              class="q-pa-md"
              flat
            >
              <template v-slot:top-right>
                <q-btn color="secondary" 
                @click="showExport(errorRecords)"
                text-color="black" label="Export" icon="file_download" />
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </q-expansion-item>

      <q-expansion-item
        label="Dokumente ohne Brifle Empfänger"
      >
        <q-card>
          <q-card-section>
            <q-table
              :rows="notBrifleRecords"
              :columns="getColumns()"
              row-key="path"
              :pagination="{ rowsPerPage: 10 }"
              class="q-pa-md"
              flat
            >
              <template v-slot:top-right>
                <q-btn color="secondary" 
                @click="showExport(notBrifleRecords)"
                text-color="black" label="Export" icon="file_download" />
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </q-expansion-item>

    </q-list>
    <ExportModal
    :records="exportRecords"
    v-model="showExportModal"
    />
     </div>
</template>
<style lang="scss" scoped>

    $bg-grid-item: #f0f0f022;
    $bg-grid-item-hover: #f0f0f033;
    $bg-grid-item-active: #f0f0f02c;

    .result-grid {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        gap: 10px;

    }

    .overview_grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
    }
    .overview_grid > div, .overview_card, .result-grid > div {
        background-color: $bg-grid-item;
        padding: 20px;
        min-height: 200px;
        border-radius: 10px;        
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        border: 3px solid $bg-grid-item;
    }
</style>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { SendDocReq } from '../util/receivers/receiverRecord';
import ExportModal from './modal/ExportModal.vue';

export default defineComponent({
    name: 'SendReports',
    components: {
        ExportModal
    },
    setup() {
        const exportRecords = ref<SendDocReq[]>([]);
        const showExportModal = ref<boolean>(false);
        return {
            exportRecords,
            showExportModal,
        };
    },
    methods: {
        getColumns(){
            // default for birth_info
            const defaultCol = [   
                {
                    name: 'path',
                    label: 'Dateipfad',
                    field: (row: SendDocReq) => row.doc.filePath,
                    sortable: true,
                },
                {
                    name: 'receiverID',
                    label: 'Empfänger ID',
                    field: (row: SendDocReq) => row.receiver?.original.receiverId,
                    sortable: true,
                },
                {
                    name: 'receiverName',
                    label: 'Nachname',
                    field: (row: SendDocReq) => row.receiver?.req.birth_information?.last_name,
                    sortable: true,
                },
                {
                    name: 'receiverName',
                    label: 'Vorname',
                    field: (row: SendDocReq) => row.receiver?.req.birth_information?.given_names,
                    sortable: true,
                },
                {
                    name: 'receiverName',
                    label: 'Geburtsdatum',
                    field: (row: SendDocReq) => row.receiver?.req.birth_information?.date_of_birth,
                    sortable: true,
                },
            ];

            return defaultCol;
        },
        showExport(records: SendDocReq[]) {
            this.exportRecords = records;
            this.showExportModal = true;
        },    
    },
    props: {
        successRecords: {
            type: Array<SendDocReq>,
            default: () => [],
        },
        errorRecords: {
            type: Array<SendDocReq>,
            default: () => [],
        },
        notBrifleRecords: {
            type: Array<SendDocReq>,
            default: () => [],
        },
    }
});
</script>