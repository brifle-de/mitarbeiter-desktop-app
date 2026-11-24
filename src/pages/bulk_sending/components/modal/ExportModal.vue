<template>
    <Dialog v-model:visible="value" modal :header="t('ui.bulk.export.title')" :style="{ width: '560px', maxWidth: '90vw' }">
        <div class="flex flex-col gap-5">
            <p class="text-ink-muted">{{ t('ui.bulk.export.text', { n: records.length }) }}</p>
            <div v-for="group in groups" :key="group.label" class="flex flex-col gap-2">
                <span class="ma-label text-ink-muted">{{ group.label }}</span>
                <div class="flex flex-wrap gap-2">
                    <Button
                        v-for="exporter in group.exporters"
                        :key="exporter.name"
                        v-tooltip.top="t('ui.bulk.export.as', { format: group.label })"
                        severity="secondary"
                        outlined
                        size="small"
                        :label="exporter.name"
                        @click="group.run(exporter.rules)"
                    >
                        <template #icon><Download :size="16" /></template>
                    </Button>
                </div>
            </div>
        </div>
        <template #footer>
            <Button severity="secondary" outlined :label="t('ui.bulk.common.close')" @click="$emit('update:modelValue', false)" />
        </template>
    </Dialog>
</template>
<script lang="ts">

import { defineComponent } from 'vue';
import { SendDocReceiverReq, SendDocReq } from '../../util/receivers/receiverRecord';
import { Exporters } from '../../util/reports/exampleExports';
import { ReportsExporter, ReportsExporterRules } from '../../util/reports/exporter';
import { useI18n } from 'vue-i18n';
import Dialog from 'openvue/dialog';
import Button from 'openvue/button';
import { Download } from 'lucide-vue-next';

export default defineComponent({
    name: 'ExportModal',
    emits: ['update:modelValue'],
    // eslint-disable-next-line vue/no-reserved-component-names -- OpenVue components keep their PrimeVue names
    components: { Dialog, Button, Download },

    props: {
        records: {
            type: Array as () => SendDocReq[] | SendDocReceiverReq[],
            default: () => [],
        },
        modelValue: {
            type: Boolean,
            default: false,
        },
        
    },
    setup() {
        const { t } = useI18n();
        return { t };
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
        groups(): { label: string, exporters: typeof Exporters, run: (rules: ReportsExporterRules) => void }[] {
            return [
                { label: 'CSV', exporters: this.csvExporters, run: (rules) => this.exportToCSV(rules) },
                { label: 'XML', exporters: this.xmlExporters, run: (rules) => this.exportToXML(rules) },
                { label: 'JSON', exporters: this.jsonExporters, run: (rules) => this.exportToJSON(rules) },
            ];
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
