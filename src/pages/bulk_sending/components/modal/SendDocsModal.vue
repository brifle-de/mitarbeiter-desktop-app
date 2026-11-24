<template>
    <Dialog v-model:visible="value" modal :header="t('ui.bulk.receiversDialog.title')" :style="{ width: '1100px', maxWidth: '92vw' }">
        <TableCard>
            <DataTable :value="records" paginator :rows="10">
                <Column field="doc.filePath" :header="t('ui.bulk.columns.filePath')" sortable>
                    <template #body="{ data }"><span class="ma-small break-all text-ink-muted">{{ data.doc.filePath }}</span></template>
                </Column>
                <Column field="exists" :header="t('ui.bulk.columns.brifle')" sortable>
                    <template #body="{ data }">
                        <StatusTag :type="data.exists ? 'delivered' : 'test'" :label="data.exists ? t('ui.bulk.status.hasBrifle') : t('ui.bulk.status.noBrifle')" />
                    </template>
                </Column>
                <Column field="receiver.original.receiverId" :header="t('ui.bulk.columns.receiverId')" sortable />
                <Column field="receiver.req.birth_information.last_name" :header="t('ui.bulk.columns.lastName')" sortable />
                <Column field="receiver.req.birth_information.given_names" :header="t('ui.bulk.columns.firstName')" sortable />
                <Column field="receiver.req.birth_information.date_of_birth" :header="t('ui.bulk.columns.dateOfBirth')" sortable />
            </DataTable>
        </TableCard>
        <template #footer>
            <Button :label="t('ui.bulk.common.close')" @click="$emit('update:modelValue', false)" />
        </template>
    </Dialog>
</template>
<script lang="ts">
import { defineComponent } from 'vue';
import { SendDocReq } from '../../util/receivers/receiverRecord';
import { useI18n } from 'vue-i18n';
import Dialog from 'openvue/dialog';
import Button from 'openvue/button';
import DataTable from 'openvue/datatable';
import Column from 'openvue/column';
import StatusTag from 'components/ui/StatusTag.vue';
import TableCard from '../ui/TableCard.vue';

export default defineComponent({
  name: 'SendDocsModal',
  emits: ['update:modelValue'],
   
  components: { Dialog, Button, DataTable, Column, StatusTag, TableCard },
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
    records: {
        type: Array<SendDocReq>,
        required: true,
    }
 },
  setup() {
    const { t } = useI18n();
    return { t };
  },
});

</script>