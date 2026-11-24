<template>
  <Dialog v-model:visible="value" modal :header="t('ui.settings.account.backup.title')" :style="{ width: '520px', maxWidth: '90vw' }" @hide="password = ''; tried = false">
    <form class="flex flex-col gap-4" @submit.prevent="exportData()">
      <Message severity="info">
        <p>{{ t('ui.settings.account.backup.text') }}</p>
        <p class="mt-2">{{ t('ui.settings.account.backup.leakHint') }}</p>
      </Message>
      <FormField :label="t('ui.settings.account.backup.password')" for-id="backup-password" :error="tried && password.length === 0 ? t('ui.settings.account.backup.passwordEmpty') : ''">
        <Password input-id="backup-password" v-model="password" :feedback="false" toggle-mask fluid :invalid="tried && password.length === 0" />
      </FormField>
      <button type="submit" class="hidden" />
    </form>
    <template #footer>
      <Button severity="secondary" outlined :label="t('ui.settings.cancel')" @click="close()" />
      <Button :label="t('ui.settings.account.backup.submit')" :disabled="!password || password.length === 0" @click="exportData()">
        <template #icon><Download :size="18" /></template>
      </Button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Download } from 'lucide-vue-next';
import Button from 'openvue/button';
import Dialog from 'openvue/dialog';
import Message from 'openvue/message';
import Password from 'openvue/password';
import FormField from 'components/ui/FormField.vue';

const value = defineModel<boolean>({ required: true });
const emit = defineEmits<{ export: [event: { password: string }] }>();
const { t } = useI18n();
const password = ref('');
const tried = ref(false);

function close() {
  value.value = false;
}

function exportData() {
  tried.value = true;
  if (!password.value) return;
  emit('export', { password: password.value });
  close();
}
</script>
