<template>
  <!-- one OCR suggestion; click toggles whether it is taken over -->
  <label class="flex cursor-pointer items-start gap-3 rounded-[10px] border px-3 py-2.5" :class="selected ? 'border-line-brand bg-mint' : 'border-line hover:bg-dezent'">
    <Checkbox :model-value="selected" binary class="mt-0.5" @update:model-value="toggle" />
    <span class="grid min-w-0 flex-1 grid-cols-[120px_minmax(0,1fr)] gap-x-3">
      <span class="ma-small pt-0.5 text-ink-muted">{{ t(`ui.send.recommendations.types.${recommendation.type}`) }}</span>
      <span class="break-words">
        <template v-if="receiverData">
          <span class="ma-text-strong block">{{ receiverData.firstName }} {{ receiverData.lastName }}</span>
          <span v-if="receiverAddress" class="block">{{ receiverAddress }}</span>
          <span v-if="receiverData.email" class="block">{{ receiverData.email }}</span>
          <span v-if="receiverData.phone" class="block">{{ receiverData.phone }}</span>
        </template>
        <template v-else-if="recommendation.type === 'document_type'">{{ documentType }}</template>
        <template v-else>{{ recommendation.data }}</template>
      </span>
    </span>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import Checkbox from 'openvue/checkbox';
import type ReceiverRecord from 'src/pages/bulk_sending/util/receivers/receiverRecord';
import type { RecommendationRecord } from '../util/types';
import { isDocumentType } from '../util/outbox';

export type { RecommendationRecord };

const props = defineProps<{ recommendation: RecommendationRecord; selected: boolean }>();
const emit = defineEmits<{ select: [rec: RecommendationRecord]; unselect: [rec: RecommendationRecord] }>();
const { t } = useI18n();

const documentType = computed(() => {
  const data = props.recommendation.data as string;
  return isDocumentType(data) ? t(`ui.outbox.types.${data}`) : data;
});
const receiverData = computed(() => (props.recommendation.type === 'receiver_record' ? props.recommendation.data as ReceiverRecord : null));
const receiverAddress = computed(() => {
  const r = receiverData.value;
  if (!r) return '';
  const address = r.address?.trim() ?? '';
  if (address !== '') return address;
  return [r.addressStreet, `${r.addressPostcode ?? ''} ${r.addressCity ?? ''}`, r.addressCountry]
    .filter((part) => part && part.trim() !== '').join(', ');
});

function toggle(value: boolean) {
  if (value) emit('select', props.recommendation);
  else emit('unselect', props.recommendation);
}
</script>
