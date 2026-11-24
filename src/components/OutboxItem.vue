<template>
  <!-- one row of a sent document (MA/Zelle), e.g. "Letzte Sendungen" on the home page -->
  <button
    type="button"
    class="grid w-full grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)_minmax(0,1fr)_auto] items-center gap-4 border-b border-line px-3 py-2.5 text-left last:border-b-0 hover:bg-dezent"
    :class="{ 'bg-mint': markSelected }"
    @click="emit('openMail', mailId)"
  >
    <span class="flex min-w-0 flex-col">
      <span class="ma-text-strong truncate">{{ subject }}</span>
      <span v-if="caption" class="ma-small truncate text-ink-muted">{{ caption }}</span>
    </span>
    <span class="truncate">{{ receiver ?? t('ui.outbox.unknownReceiver') }}</span>
    <span class="text-ink-muted">{{ formatDateTime(createdDate) }}</span>
    <StatusTag :type="STATE_TAG[state]" :label="t(`ui.outbox.state.${state}`)" />
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import StatusTag from 'components/ui/StatusTag.vue';
import { formatDateTime, outboxState, STATE_TAG } from 'src/pages/outbox/util/outbox';

const props = withDefaults(defineProps<{
  subject: string;
  mailId: string;
  receiver?: string | null;
  caption?: string;
  createdDate?: Date;
  isRead?: boolean;
  isDelivered?: boolean;
  markSelected?: boolean;
}>(), { receiver: null, caption: '', createdDate: () => new Date(0), isRead: false, isDelivered: false, markSelected: false });

const emit = defineEmits<{ openMail: [id: string] }>();
const { t } = useI18n();
const state = computed(() => outboxState({ read: props.isRead, delivered: props.isDelivered }));
</script>
