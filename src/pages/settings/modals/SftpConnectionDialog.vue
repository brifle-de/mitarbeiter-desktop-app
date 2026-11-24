<template>
  <!-- MA/Dialog: add or edit one SFTP connection (SftpData of the account) -->
  <Dialog
    v-model:visible="visible"
    modal
    :header="isNew ? t('ui.settings.connections.dialog.addTitle') : t('ui.settings.connections.dialog.editTitle')"
    :style="{ width: '560px', maxWidth: '90vw' }"
    @show="reset"
  >
    <form class="flex flex-col gap-4" @submit.prevent="save">
      <FormField :label="t('ui.settings.connections.dialog.displayName')" for-id="sftp-name" :hint="t('ui.settings.connections.dialog.displayNameHint')">
        <InputText id="sftp-name" v-model="draft.displayName" fluid />
      </FormField>
      <div class="grid grid-cols-[1fr_120px] gap-4">
        <FormField :label="`${t('ui.settings.connections.dialog.host')} *`" for-id="sftp-host" :error="hostError">
          <InputText id="sftp-host" v-model="draft.host" :invalid="!!hostError" autocomplete="off" spellcheck="false" fluid />
        </FormField>
        <FormField :label="t('ui.settings.connections.dialog.port')" for-id="sftp-port">
          <InputNumber input-id="sftp-port" v-model="draft.port" :use-grouping="false" :min="1" :max="65535" fluid />
        </FormField>
      </div>
      <div class="grid grid-cols-2 gap-4">
        <FormField :label="t('ui.settings.connections.dialog.username')" for-id="sftp-user">
          <InputText id="sftp-user" v-model="draft.username" autocomplete="off" spellcheck="false" fluid />
        </FormField>
        <FormField :label="t('ui.settings.connections.dialog.password')" for-id="sftp-password">
          <Password input-id="sftp-password" v-model="draft.password" :feedback="false" toggle-mask fluid />
        </FormField>
      </div>
      <button type="submit" class="hidden" />
    </form>
    <template #footer>
      <Button severity="secondary" outlined :label="t('ui.settings.cancel')" @click="visible = false" />
      <Button :label="t('ui.settings.connections.dialog.save')" @click="save">
        <template #icon><Check :size="18" /></template>
      </Button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Check } from 'lucide-vue-next';
import Button from 'openvue/button';
import Dialog from 'openvue/dialog';
import InputNumber from 'openvue/inputnumber';
import InputText from 'openvue/inputtext';
import Password from 'openvue/password';
import FormField from 'components/ui/FormField.vue';
import type { SftpData } from 'app/src-electron/models/EncryptedStore';

const props = defineProps<{ connection: SftpData | null }>();
const emit = defineEmits<{ save: [connection: SftpData] }>();
const visible = defineModel<boolean>('visible', { required: true });
const { t } = useI18n();

const empty = (): SftpData => ({
  host: '',
  port: 22,
  username: '',
  password: '',
  displayName: '',
  // random id, same format as before the redesign
  id: Math.random().toString(36).substring(2, 15),
});
const draft = ref<SftpData>(empty());
const tried = ref(false);
const isNew = computed(() => props.connection === null);
const hostError = computed(() => (tried.value && !draft.value.host.trim() ? t('ui.settings.account.fields.required') : ''));

/** copy the edited connection so "Abbrechen" leaves it untouched */
function reset() {
  tried.value = false;
  draft.value = props.connection ? { ...props.connection, port: Number(props.connection.port) || 22 } : empty();
}

function save() {
  tried.value = true;
  if (!draft.value.host.trim()) return;
  emit('save', { ...draft.value, host: draft.value.host.trim(), port: Number(draft.value.port) || 22 });
  visible.value = false;
}
</script>
