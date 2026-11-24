<template>
  <Dialog v-model:visible="value" modal :header="t('ui.settings.coverLetters.create.title')" :style="{ width: '960px', maxWidth: '92vw' }" @show="name = ''; description = ''">
    <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-6">
      <form class="flex flex-col gap-4" @submit.prevent="createCoverLetter()">
        <FormField :label="t('ui.settings.coverLetters.create.name')" for-id="cover-letter-name">
          <InputText id="cover-letter-name" v-model="name" fluid autofocus />
        </FormField>
        <FormField :label="t('ui.settings.coverLetters.create.description')" for-id="cover-letter-description">
          <Textarea id="cover-letter-description" v-model="description" rows="4" auto-resize fluid />
        </FormField>
        <button type="submit" class="hidden" />
      </form>
      <!-- preview -->
      <div class="max-h-[65vh] overflow-auto rounded-[12px] bg-dezent p-4">
        <DocumentView :content="previewBody" />
      </div>
    </div>
    <template #footer>
      <Button severity="secondary" outlined :label="t('ui.settings.cancel')" @click="close()" />
      <Button :label="t('ui.settings.coverLetters.create.submit')" :disabled="name.trim().length === 0" @click="createCoverLetter()">
        <template #icon><Check :size="18" /></template>
      </Button>
    </template>
  </Dialog>
</template>

<script lang="ts">
import type { FileContent } from 'src/components/ui-elements/FileDragAndDrop.vue';

export interface CoverLetterCreateValue {
  name: string;
  description?: string;
  content: FileContent;
}
</script>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Check } from 'lucide-vue-next';
import Button from 'openvue/button';
import Dialog from 'openvue/dialog';
import InputText from 'openvue/inputtext';
import Textarea from 'openvue/textarea';
import FormField from 'components/ui/FormField.vue';
import DocumentView from 'src/components/ui-elements/DocumentView.vue';
import type { ContentBody } from '@brifle/brifle-sdk';

const props = defineProps<{ contentValue?: FileContent }>();
const value = defineModel<boolean>({ required: true });
const emit = defineEmits<{ create: [value: CoverLetterCreateValue] }>();
const { t } = useI18n();
const name = ref('');
const description = ref('');

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  const chunkSize = 0x8000; // 32 KB chunks
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
  }
  return btoa(binary);
}

// computed, so typing a name does not reload the PDF preview
const previewBody = computed<ContentBody[]>(() => [{
  type: 'application/pdf',
  content: uint8ToBase64(props.contentValue?.content || new Uint8Array()),
}]);

function close() {
  value.value = false;
}

function createCoverLetter() {
  if (name.value.trim().length === 0 || !props.contentValue) return;
  emit('create', {
    name: name.value.trim(),
    description: description.value,
    content: props.contentValue,
  });
  close();
}
</script>
