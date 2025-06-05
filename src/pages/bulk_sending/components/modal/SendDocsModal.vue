<template>
    <q-dialog v-model="value" full-width class="unselectable">
        <q-card class="send-docs-card dialog-window-lg" flat bordered>
            <div>
                <q-toolbar class="bg-secondary text-black">
                    <q-toolbar-title class="text-h6">
                        Übersicht - Empfänger
                    </q-toolbar-title>
                    <q-btn flat round icon="close" @click="$emit('update:modelValue', false)" />
                </q-toolbar>
            </div>
           <div class="card-body">
            <q-table          
                :rows="records"
                :columns="getColumns()"
                flat
            >

            </q-table>
           </div>
           <div class="q-mx-lg text-right">
                <q-btn color="secondary" text-color="black" label="Schließen" @click="$emit('update:modelValue', false)" class="q-my-lg" />
           </div>
        </q-card>
    </q-dialog>
</template>
<style lang="scss">
   

</style>
<script lang="ts">
import { defineComponent } from 'vue';
import { SendDocReq } from '../../util/receivers/receiverRecord';

export default defineComponent({
  name: 'SendDocsModal',
  emits: ['update:modelValue'],
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
                    name: 'exists',
                    label: 'Hat Brifle Konto',
                    field: (row: SendDocReq) => row.exists,
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
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    records: {
        type: Array<SendDocReq>,
        required: true,
    }
 },
  setup() {
    
    return {
    };
  },
});

</script>