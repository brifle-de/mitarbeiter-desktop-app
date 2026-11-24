<template>
  <Dialog v-model:visible="value" modal :header="t('ui.access.import.title')" :style="{ width: '520px', maxWidth: '90vw' }" @hide="reset()">
    <form class="flex flex-col gap-4" @submit.prevent="importData()">
      <p class="text-ink-muted">{{ t('ui.access.import.text') }}</p>
      <FormField :label="t('ui.access.import.file')">
        <div class="flex items-center gap-3 rounded-[10px] border border-line bg-flaeche px-3.5 py-2.5">
          <FileText :size="18" class="shrink-0 text-ink-muted" />
          <span class="min-w-0 flex-1 truncate" :class="filePath ? '' : 'text-ink-muted'" :title="filePath">{{ filePath || t('ui.access.import.noFile') }}</span>
          <Button type="button" size="small" severity="secondary" outlined :label="t('ui.access.import.choose')" @click="selectFile()">
            <template #icon><Upload :size="16" /></template>
          </Button>
        </div>
      </FormField>
      <FormField :label="t('ui.access.import.password')" for-id="import-password">
        <Password input-id="import-password" v-model="password" :feedback="false" toggle-mask fluid :disabled="!filePath || filePath.length == 0" />
      </FormField>
      <button type="submit" class="hidden" />
    </form>
    <template #footer>
      <Button severity="secondary" outlined :label="t('ui.access.import.cancel')" @click="close()" />
      <Button :label="t('ui.access.import.submit')" :disabled="!password || password.length === 0 || !fileData" @click="importData()">
        <template #icon><Check :size="18" /></template>
      </Button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Check, FileText, Upload } from 'lucide-vue-next';
import Button from 'openvue/button';
import Dialog from 'openvue/dialog';
import Password from 'openvue/password';
import FormField from 'components/ui/FormField.vue';
import EncryptedStoreService from 'src/services/node/EncryptedStoreService';
import Files from 'src/services/node/Files';
import { useNotify } from 'src/composables/useNotify';
import type { AccountData } from 'app/src-electron/models/EncryptedStore';

const value = defineModel<boolean>({ required: true });
const emit = defineEmits<{ import: [event: { accountData: AccountData }] }>();
const { t } = useI18n();
const notify = useNotify();
const encryptedStoreService = new EncryptedStoreService();

const password = ref('');
const filePath = ref('');
const fileData = ref('');

function reset() {
  filePath.value = '';
  fileData.value = '';
  password.value = '';
}

function close() {
  value.value = false;
}

function selectFile() {
  void Files.pickFile({
    properties: ['openFile'],
    filters: [{ name: 'Brifle Backup', extensions: ['json'] }],
  }).then((filePaths: string[]) => {
    if (!filePaths) {
      return;
    }
    const path = filePaths[0] ?? '';
    filePath.value = path;
    Files.readFile(path, 'utf8').then((data: string) => {
      if (!data) {
        console.error('No data found in file');
        return;
      }
      fileData.value = data;
    }).catch((err: Error) => {
      console.error(err);
    });
  });
}

function importData() {
  if (!password.value || !fileData.value) return;
  // parse the data
  void encryptedStoreService.importAccount(password.value, fileData.value).then((parsedData) => {
    if (!parsedData) {
      console.error('No data found in file');
      notify.error(t('ui.access.import.error'), { detail: t('ui.access.import.errorDetail') });
      return;
    }
    emit('import', { accountData: parsedData });
    close();
    notify.success(t('ui.access.import.success'), { detail: t('ui.access.import.successDetail') });
  }).catch((err: Error) => {
    notify.error(t('ui.access.import.error'), { detail: t('ui.access.import.errorDetail') });
    console.error(err);
  });
}
</script>
