<template>
  <!-- Einzelversand (Figma V1–V4): scrollable step content, footer pinned at the bottom -->
  <div class="flex min-h-0 flex-1 flex-col">
    <div class="flex flex-1 flex-col gap-6 overflow-auto px-8 py-7">
      <PageHeader :path="t('ui.send.path')" :title="t('ui.send.title')" :subtitle="t(`ui.send.subtitle.${STEP_KEYS[step]}`)">
        <template v-if="state.isProcessingOcr" #actions>
          <span class="flex items-center gap-2 text-ink-muted">
            <ProgressSpinner style="width: 18px; height: 18px" stroke-width="6" />
            {{ t('ui.send.document.ocrRunning') }}
          </span>
        </template>
      </PageHeader>

      <StepsHeader :steps="steps" :active="step" clickable @select="step = $event" />

      <StepDocument v-if="step === 0" />
      <StepReceiver v-else-if="step === 1" />
      <StepOptions v-else-if="step === 2" :show-errors="showErrors" />
      <StepReview v-else />
    </div>

    <WizardFooter
      :cancel-label="t('ui.send.cancel')"
      :back-label="step > 0 ? t('ui.send.back') : ''"
      :next-label="step === LAST_STEP ? t('ui.send.sendNow') : t('ui.send.next', { step: steps[step + 1]!.title })"
      :next-icon="step === LAST_STEP ? Send : ChevronRight"
      :next-disabled="nextDisabled"
      :loading="state.isCheckingReceivers || state.isSending"
      :hint="nextHint"
      @cancel="cancel()"
      @back="step--"
      @next="next()"
    />

    <!-- MA/Dialog: last confirmation before sending -->
    <Dialog v-model:visible="confirmOpen" modal :header="t('ui.send.confirm.title')" :style="{ width: '520px', maxWidth: '92vw' }">
      <div class="flex flex-col gap-3">
        <p>{{ t('ui.send.confirm.text', { count: state.receivers.length, subject: state.subject }) }}</p>
        <ul class="flex flex-col gap-1.5">
          <li v-if="groups.brifle.length" class="flex items-center gap-2"><StatusTag type="delivered" :label="t('ui.send.delivery.brifle')" /> {{ groups.brifle.length }}</li>
          <li v-if="groups.papermail.length" class="flex items-center gap-2"><StatusTag type="post" :label="t('ui.send.delivery.papermail')" /> {{ groups.papermail.length }}</li>
          <li v-if="groups.error.length" class="flex items-center gap-2"><StatusTag type="error" :label="t('ui.send.delivery.none')" /> {{ groups.error.length }}</li>
        </ul>
        <Message v-if="state.allowPapermail && state.testMode" severity="info">{{ t('ui.send.review.testText', { email: state.testModeEmail }) }}</Message>
      </div>
      <template #footer>
        <Button severity="secondary" outlined :label="t('ui.send.cancel')" @click="confirmOpen = false" />
        <Button :label="t('ui.send.confirm.send')" @click="onSendConfirm()">
          <template #icon><Send :size="18" /></template>
        </Button>
      </template>
    </Dialog>

    <!-- while sending -->
    <Dialog :visible="state.isSending" modal :closable="false" :show-header="false" :style="{ width: '420px' }">
      <div class="flex flex-col items-center gap-3 pt-6 text-center">
        <ProgressSpinner style="width: 48px; height: 48px" />
        <span class="ma-title-m">{{ t('ui.send.sending.title') }}</span>
        <span class="text-ink-muted">{{ t('ui.send.sending.text') }}</span>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ChevronRight, Send } from 'lucide-vue-next';
import Button from 'openvue/button';
import Dialog from 'openvue/dialog';
import Message from 'openvue/message';
import ProgressSpinner from 'openvue/progressspinner';
import { useConfirm } from 'openvue/useconfirm';
import PageHeader from 'components/shell/PageHeader.vue';
import StepsHeader from 'components/ui/StepsHeader.vue';
import WizardFooter from 'components/ui/WizardFooter.vue';
import StatusTag from 'components/ui/StatusTag.vue';
import { useSessionStore } from 'src/stores/session-store';
import { useEncryptedStore } from 'src/stores/encrypted-store';
import { useBrifleStore } from 'src/stores/brifle-store';
import { useNotify } from 'src/composables/useNotify';
import { ApiEndpoints } from 'app/src-electron/models/EncryptedStore';
import StepDocument from './send/StepDocument.vue';
import StepReceiver from './send/StepReceiver.vue';
import StepOptions from './send/StepOptions.vue';
import StepReview from './send/StepReview.vue';
import { provideSendDocument } from './send/useSendDocument';

const STEP_KEYS = ['document', 'receiver', 'options', 'review'] as const;
const LAST_STEP = STEP_KEYS.length - 1;

const { t } = useI18n();
const router = useRouter();
const notify = useNotify();
const confirm = useConfirm();
const sessionStore = useSessionStore();
const encryptedStore = useEncryptedStore();
const brifleStore = useBrifleStore();

const flow = provideSendDocument();
const state = flow.state;
const groups = flow.receiverGroups;

const step = ref(0);
const confirmOpen = ref(false);
const showErrors = ref(false);

const steps = computed(() => STEP_KEYS.map((key) => ({ title: t(`ui.send.steps.${key}.title`), description: t(`ui.send.steps.${key}.description`) })));

const optionsValid = computed(() => state.subject.trim() !== '' && !(state.allowPapermail && state.testMode && state.testModeEmail.trim() === ''));
const nextDisabled = computed(() => {
  if (state.readonly) return true;
  if (step.value === 0) return state.files.length === 0;
  if (step.value === 1) return state.receivers.length === 0;
  if (step.value === LAST_STEP) return !flow.canSend.value || !optionsValid.value;
  return false;
});
const nextHint = computed(() => {
  if (step.value === 1 && state.receivers.length > 0 && !state.hasCheckedReceivers) return t('ui.send.hints.checkOnNext');
  if (step.value === LAST_STEP && !state.hasCheckedReceivers) return t('ui.send.hints.checkFirst');
  return nextDisabled.value ? '' : t('ui.send.hints.shortcut');
});

async function next() {
  if (nextDisabled.value) return;
  if (step.value === 1 && !state.hasCheckedReceivers) {
    // "Weiter" checks the receivers first
    await flow.checkReceivers();
  }
  if (step.value === 2 && !optionsValid.value) {
    showErrors.value = true;
    return;
  }
  if (step.value === LAST_STEP) {
    confirmOpen.value = true;
    return;
  }
  showErrors.value = false;
  step.value++;
}

async function onSendConfirm() {
  confirmOpen.value = false;
  const result = await flow.send();
  if (result.sent.length === result.total) {
    notify.success(t('ui.send.notify.sent'), { detail: t('ui.send.notify.sentDetail', { count: result.total }) });
    const id = result.total === 1 ? result.sent[0]?.id : undefined;
    flow.reset();
    void router.push(id ? `/outbox/${id}` : '/outbox');
  } else {
    // sent receivers are removed; the others stay for another try
    notify.error(t('ui.send.notify.partial', { sent: result.sent.length, total: result.total }));
    step.value = 1;
  }
}

function cancel() {
  const leave = () => { flow.reset(); void router.push('/outbox'); };
  if (state.files.length === 0 && state.receivers.length === 0) {
    leave();
    return;
  }
  confirm.require({
    header: t('ui.send.cancelConfirm.title'),
    message: t('ui.send.cancelConfirm.text'),
    acceptLabel: t('ui.send.cancelConfirm.accept'),
    rejectLabel: t('ui.send.cancelConfirm.reject'),
    acceptProps: { severity: 'danger' },
    rejectProps: { severity: 'secondary', outlined: true },
    accept: leave,
  });
}

/** Ctrl/Cmd+Enter = next step (not while a dialog is open) */
function onKeydown(e: KeyboardEvent) {
  if (e.key !== 'Enter' || !(e.ctrlKey || e.metaKey)) return;
  if (confirmOpen.value || document.querySelector('[role="dialog"], [role="alertdialog"]')) return;
  e.preventDefault();
  void next();
}

onMounted(async () => {
  window.addEventListener('keydown', onKeydown);
  const accountId = sessionStore.getSelectedAccountId;
  const account = accountId ? encryptedStore.getAccount(accountId) : undefined;
  if (!account) return;
  state.tenantId = account.tenantId ?? '';
  const api = await brifleStore.getApi(account.apiKey ?? '', ApiEndpoints.getEndpoint(account.apiEnv));
  if (api) state.apiId = api;
});
onBeforeUnmount(() => window.removeEventListener('keydown', onKeydown));
</script>
