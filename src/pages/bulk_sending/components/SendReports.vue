<template>
    <div class="flex flex-col gap-6">
        <div class="grid grid-cols-3 gap-4">
            <KpiCard :label="t('ui.bulk.kpi.sent')" :value="successRecords.length" />
            <KpiCard :label="t('ui.bulk.kpi.failed')" :value="errorRecords.length" />
            <KpiCard :label="t('ui.bulk.kpi.notBrifle')" :value="notBrifleRecords.length" />
        </div>
        <Accordion multiple :value="[]">
            <AccordionPanel v-for="group in groups" :key="group.key" :value="group.key">
                <AccordionHeader>
                    <span class="flex flex-1 items-center gap-3 pr-3">
                        <span class="ma-text-strong flex-1 text-left">{{ group.title }}</span>
                        <StatusTag :type="group.status" :label="String(group.records.length)" />
                    </span>
                </AccordionHeader>
                <AccordionContent>
                    <div class="flex flex-col gap-3">
                        <div class="flex justify-end">
                            <Button severity="secondary" outlined size="small" :label="t('ui.bulk.report.export')" :disabled="group.records.length === 0" @click="showExport(group.records)">
                                <template #icon><Download :size="16" /></template>
                            </Button>
                        </div>
                        <TableCard>
                            <DataTable :value="group.records" paginator :rows="10">
                                <Column field="doc.filePath" :header="t('ui.bulk.columns.filePath')" sortable>
                                    <template #body="{ data }"><span class="ma-small break-all text-ink-muted">{{ data.doc.filePath }}</span></template>
                                </Column>
                                <Column field="receiver.original.receiverId" :header="t('ui.bulk.columns.receiverId')" sortable />
                                <Column field="receiver.req.birth_information.last_name" :header="t('ui.bulk.columns.lastName')" sortable />
                                <Column field="receiver.req.birth_information.given_names" :header="t('ui.bulk.columns.firstName')" sortable />
                                <Column field="receiver.req.birth_information.date_of_birth" :header="t('ui.bulk.columns.dateOfBirth')" sortable />
                                <template #empty><span class="text-ink-muted">{{ t('ui.bulk.report.empty') }}</span></template>
                            </DataTable>
                        </TableCard>
                    </div>
                </AccordionContent>
            </AccordionPanel>
        </Accordion>
        <ExportModal v-model="showExportModal" :records="exportRecords" />
    </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { SendDocReq } from '../util/receivers/receiverRecord';
import ExportModal from './modal/ExportModal.vue';
import { useI18n } from 'vue-i18n';
import Accordion from 'openvue/accordion';
import AccordionPanel from 'openvue/accordionpanel';
import AccordionHeader from 'openvue/accordionheader';
import AccordionContent from 'openvue/accordioncontent';
import Button from 'openvue/button';
import DataTable from 'openvue/datatable';
import Column from 'openvue/column';
import { Download } from 'lucide-vue-next';
import KpiCard from 'components/ui/KpiCard.vue';
import StatusTag, { type StatusType } from 'components/ui/StatusTag.vue';
import TableCard from './ui/TableCard.vue';

export default defineComponent({
    name: 'SendReports',
    components: {
         
        ExportModal, Accordion, AccordionPanel, AccordionHeader, AccordionContent, Button, DataTable, Column, Download, KpiCard, StatusTag, TableCard,
    },
    computed: {
        groups(): { key: string, title: string, status: StatusType, records: SendDocReq[] }[] {
            return [
                { key: 'success', title: this.t('ui.bulk.report.success'), status: 'delivered', records: this.successRecords },
                { key: 'error', title: this.t('ui.bulk.report.failed'), status: 'error', records: this.errorRecords },
                { key: 'notBrifle', title: this.t('ui.bulk.report.notBrifle'), status: 'post', records: this.notBrifleRecords },
            ];
        },
    },
    setup() {
        const exportRecords = ref<SendDocReq[]>([]);
        const showExportModal = ref<boolean>(false);
        const { t } = useI18n();
        return {
            t,
            exportRecords,
            showExportModal,
        };
    },
    methods: {
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