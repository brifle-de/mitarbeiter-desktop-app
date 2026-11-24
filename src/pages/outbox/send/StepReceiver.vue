<template>
  <!-- V2 Empfänger: receivers, Brifle check; result of the check on the right -->
  <div class="grid grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] items-start gap-6">
    <section class="ma-card">
      <div class="flex items-center gap-2">
        <h2 class="ma-title-m flex-1">{{ t('ui.send.receiver.title') }}</h2>
        <Button severity="secondary" outlined size="small" :label="t('ui.send.receiver.add')" :disabled="state.readonly" @click="showAddReceiverModal = true">
          <template #icon><UserPlus :size="16" /></template>
        </Button>
      </div>

      <p v-if="state.receivers.length === 0" class="text-ink-muted">{{ t('ui.send.receiver.empty') }}</p>

      <ul v-else class="flex flex-col gap-2">
        <li v-for="(receiver, index) in state.receivers" :key="index + 'receiver'" class="rounded-[10px] border border-line">
          <div class="flex items-center gap-3 px-3 py-2.5">
            <Button text rounded size="small" severity="secondary" :aria-label="t('ui.send.receiver.details')" :aria-expanded="expanded.has(index)" @click="toggle(index)">
              <template #icon><ChevronDown :size="16" :class="{ 'rotate-180': expanded.has(index) }" /></template>
            </Button>
            <span class="flex min-w-0 flex-1 flex-col">
              <span class="ma-text-strong truncate">{{ receiver.firstName }} {{ receiver.lastName }}</span>
              <span class="ma-small truncate text-ink-muted">{{ getReceiverAddressString(receiver) || receiver.email || receiver.phone || '—' }}</span>
            </span>
            <StatusTag :type="checkTag(receiver).type" :label="checkTag(receiver).label" />
            <Button
              v-tooltip.top="t('ui.send.receiver.remove')" text rounded size="small" severity="danger" :aria-label="t('ui.send.receiver.remove')" :disabled="state.readonly"
              @click="state.receivers.splice(index, 1); expanded.clear()"
            >
              <template #icon><Trash2 :size="16" /></template>
            </Button>
          </div>
          <dl v-if="expanded.has(index)" class="grid grid-cols-[130px_minmax(0,1fr)] gap-x-3 gap-y-1.5 border-t border-line px-4 py-3">
            <dt class="ma-small text-ink-muted">{{ t('ui.send.receiver.fields.name') }}</dt>
            <dd>{{ receiver.firstName }} {{ receiver.lastName }}</dd>
            <template v-if="getReceiverAddressString(receiver) !== ''">
              <dt class="ma-small text-ink-muted">{{ t('ui.send.receiver.fields.address') }}</dt>
              <dd>{{ getReceiverAddressString(receiver) }}</dd>
            </template>
            <template v-if="receiver.dateOfBirth">
              <dt class="ma-small text-ink-muted">{{ t('ui.send.receiver.fields.dateOfBirth') }}</dt>
              <dd>{{ receiver.dateOfBirth }}</dd>
            </template>
            <template v-if="receiver.placeOfBirth">
              <dt class="ma-small text-ink-muted">{{ t('ui.send.receiver.fields.placeOfBirth') }}</dt>
              <dd>{{ receiver.placeOfBirth }}</dd>
            </template>
            <template v-if="receiver.email">
              <dt class="ma-small text-ink-muted">{{ t('ui.send.receiver.fields.email') }}</dt>
              <dd>{{ receiver.email }}</dd>
            </template>
            <template v-if="receiver.phone">
              <dt class="ma-small text-ink-muted">{{ t('ui.send.receiver.fields.phone') }}</dt>
              <dd>{{ receiver.phone }}</dd>
            </template>
          </dl>
        </li>
      </ul>

      <div class="flex justify-end">
        <Button :label="t('ui.send.receiver.check')" :disabled="state.receivers.length === 0 || state.readonly" :loading="state.isCheckingReceivers" @click="flow.checkReceivers()">
          <template #icon><ShieldCheck :size="18" /></template>
        </Button>
      </div>
    </section>

    <div class="flex flex-col gap-4">
      <Message v-if="!state.hasCheckedReceivers" severity="info">
        <span class="ma-text-strong block">{{ t('ui.send.receiver.uncheckedTitle') }}</span>
        {{ t('ui.send.receiver.uncheckedText') }}
      </Message>
      <template v-else>
        <Message v-if="counts.brifle > 0" severity="success">
          <span class="ma-text-strong block">{{ t('ui.send.receiver.result.brifleTitle', { count: counts.brifle }) }}</span>
          {{ t('ui.send.receiver.result.brifleText') }}
        </Message>
        <Message v-if="counts.post > 0" severity="warn">
          <span class="ma-text-strong block">{{ t('ui.send.receiver.result.postTitle', { count: counts.post }) }}</span>
          {{ t('ui.send.receiver.result.postText') }}
        </Message>
        <Message v-if="counts.none > 0" severity="error">
          <span class="ma-text-strong block">{{ t('ui.send.receiver.result.noneTitle', { count: counts.none }) }}</span>
          {{ t('ui.send.receiver.result.noneText') }}
        </Message>
      </template>
    </div>

    <AddReceiverModal v-model="showAddReceiverModal" @save="flow.addReceiver($event)" />
  </div>
</template>

<script setup lang="ts">
import { computed, reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ChevronDown, ShieldCheck, Trash2, UserPlus } from 'lucide-vue-next';
import Button from 'openvue/button';
import Message from 'openvue/message';
import StatusTag, { type StatusType } from 'components/ui/StatusTag.vue';
import AddReceiverModal from '../modals/AddReceiverModal.vue';
import type { TrackableReceiverRecord } from '../util/types';
import { getReceiverAddressString } from './requests';
import { useSendDocument } from './useSendDocument';

const { t } = useI18n();
const flow = useSendDocument();
const state = flow.state;
const showAddReceiverModal = ref(false);
const expanded = reactive(new Set<number>());

function toggle(index: number) {
  if (expanded.has(index)) expanded.delete(index);
  else expanded.add(index);
}

/** result of the Brifle check of one receiver */
function checkTag(receiver: TrackableReceiverRecord): { type: StatusType; label: string } {
  if (receiver.existsBrifle === true) return { type: 'delivered', label: t('ui.send.receiver.tag.brifle') };
  if (receiver.existsBrifle === false && receiver.validPostalAddress) return { type: 'post', label: t('ui.send.receiver.tag.post') };
  if (receiver.existsBrifle === false) return { type: 'error', label: t('ui.send.receiver.tag.none') };
  return { type: 'test', label: t('ui.send.receiver.tag.unchecked') };
}

const counts = computed(() => ({
  brifle: state.receivers.filter((r) => r.existsBrifle === true).length,
  post: state.receivers.filter((r) => r.existsBrifle === false && r.validPostalAddress).length,
  none: state.receivers.filter((r) => r.existsBrifle !== true && !r.validPostalAddress).length,
}));
</script>
