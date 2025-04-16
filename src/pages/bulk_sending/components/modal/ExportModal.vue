<template>
    <q-dialog v-model="value" full-width>
        <q-card class="send-docs-card dialog-window-lg" flat bordered>
            <div>
                <q-toolbar class="bg-secondary text-black">
                    <q-toolbar-title class="text-h6">
                        Export - Berichte
                    </q-toolbar-title>
                    <q-btn flat round icon="close" @click="$emit('update:modelValue', false)" />
                </q-toolbar>
            </div>
            <div class="card-body">
                <div class="q-mx-lg q-my-lg">
                    <h4>Exportieren</h4>
                    <p>Wähle das Format aus, in dem die Berichte exportiert werden sollen.</p>
                </div>
                <div class="q-mx-lg q-my-lg">
                    <h5>CSV</h5>
                    <q-btn v-for="exporter in csvExporters" :key="exporter.name" color="secondary" text-color="black" :label="exporter.name" @click="exportToCSV(exporter.rules)" class="q-mr-sm" />
                </div>
                <div class="q-mx-lg q-my-lg">
                    <h5>XML</h5>
                    <q-btn v-for="exporter in xmlExporters" :key="exporter.name" color="secondary" text-color="black" :label="exporter.name" @click="exportToXML(exporter.rules)" class="q-mr-sm" />
                </div>
                <div class="q-mx-lg q-my-lg">
                    <h5>JSON</h5>
                    <q-btn v-for="exporter in jsonExporters" :key="exporter.name" color="secondary" text-color="black" :label="exporter.name" @click="exportToJSON(exporter.rules)" class="q-mr-sm" />
                </div>
            </div>
            <div class="q-mx-lg text-right">
                <q-btn color="secondary" text-color="black" label="Schließen" @click="$emit('update:modelValue', false)" class="q-my-lg" />
            </div>
        </q-card>
    </q-dialog>
</template>
<script lang="ts">

import { defineComponent } from 'vue';
import { SendDocReq } from '../../util/receivers/receiverRecord';
import { Exporters } from '../../util/reports/exampleExports';
import { ReportsExporter, ReportsExporterRules } from '../../util/reports/exporter';

export default defineComponent({
    name: 'ExportModal',
    emits: ['update:modelValue'],
    
    props: {
        records: {
            type: Array<SendDocReq>,
            default: () => [],
        },
        modelValue: {
            type: Boolean,
            default: false,
        },
        
    },
    setup() {
        return {};
    },
    computed: {
        value: {
            get() {
                return this.modelValue;
            },
            set(value : boolean) {
                this.$emit('update:modelValue', value);
            },
        },
        csvExporters() {
            return Exporters.filter((exporter) => {
                return exporter.rules.type === 'csv';
            });
        },
        xmlExporters() {
            return Exporters.filter((exporter) => {
                return exporter.rules.type === 'xml';
            });
        },
        jsonExporters() {
            return Exporters.filter((exporter) => {
                return exporter.rules.type === 'json';
            });
        },
    },
    methods: {
        exportToCSV(rules: ReportsExporterRules) {
            const csvContent = new ReportsExporter(this.records).export(rules);
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const fileName = `report.csv`;
            this.downloadContent(blob, fileName);
        },
        exportToXML(rules: ReportsExporterRules) {
            const xmlContent = new ReportsExporter(this.records).export(rules);
            const blob = new Blob([xmlContent], { type: 'text/xml;charset=utf-8;' });
            const fileName = `report.xml`;
            this.downloadContent(blob, fileName);
        },
        exportToJSON(rules: ReportsExporterRules) {
            const jsonContent = new ReportsExporter(this.records).export(rules);
            const blob = new Blob([jsonContent], { type: 'application/json;charset=utf-8;' });
            const fileName = `report.json`;
            this.downloadContent(blob, fileName);
        },
        downloadContent(blob: Blob, fileName: string) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            a.click();
            URL.revokeObjectURL(url);
        },
    },
    mounted() {
        
    },

});

</script>
