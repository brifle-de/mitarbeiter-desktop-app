<template>
  <Dialog v-model:visible="value" modal :header="t('ui.send.signatureModal.title')" :style="{ width: '560px', maxWidth: '92vw' }" @hide="emit('close')">
    <div v-if="current" class="flex flex-col gap-4">
      <FormField :label="t('ui.send.signatureModal.fieldName') + '*'" for-id="sig-name" :error="errorFor(current.fieldName)">
        <InputText id="sig-name" v-model="current.fieldName" :invalid="!!errorFor(current.fieldName)" autofocus />
      </FormField>
      <FormField :label="t('ui.send.signatureModal.purpose') + '*'" for-id="sig-purpose" :error="errorFor(current.purpose)">
        <InputText id="sig-purpose" v-model="current.purpose" :invalid="!!errorFor(current.purpose)" />
      </FormField>
      <FormField :label="t('ui.send.signatureModal.role') + '*'" for-id="sig-role" :hint="t('ui.send.signatureModal.roleHint')" :error="errorFor(current.role)">
        <InputText id="sig-role" v-model="current.role" :invalid="!!errorFor(current.role)" />
      </FormField>
      <fieldset class="flex flex-col gap-2">
        <legend class="ma-label mb-2">{{ t('ui.send.signatureModal.signingParty') }}</legend>
        <label v-for="option in partyOptions" :key="option.value" class="flex items-center gap-2.5">
          <RadioButton v-model="current.signingParty" :value="option.value" name="signing-party" />
          {{ option.label }}
        </label>
      </fieldset>
      <span class="ma-small text-ink-muted">{{ t('ui.send.receiverModal.requiredHint') }}</span>
    </div>
    <template #footer>
      <Button text :label="t('ui.send.cancel')" @click="value = false" />
      <Button :label="t('ui.send.signatureModal.save')" @click="save()">
        <template #icon><Plus :size="18" /></template>
      </Button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Plus } from 'lucide-vue-next';
import Dialog from 'openvue/dialog';
import Button from 'openvue/button';
import InputText from 'openvue/inputtext';
import RadioButton from 'openvue/radiobutton';
import FormField from 'components/ui/FormField.vue';
import { useNotify } from 'src/composables/useNotify';
import type { SignatureRecord } from '../util/types';

const props = defineProps<{ modelValue: boolean; initValue?: SignatureRecord }>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; close: []; save: [field: SignatureRecord] }>();
const { t } = useI18n();
const notify = useNotify();

const value = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
});
const current = ref<SignatureRecord>();
const showErrors = ref(false);
const partyOptions = computed(() => [
  { label: t('ui.send.signatureModal.receiver'), value: 'receiver' },
  { label: t('ui.send.signatureModal.sender'), value: 'sender' },
]);

function reset() {
  showErrors.value = false;
  current.value = props.initValue
    ? JSON.parse(JSON.stringify(props.initValue)) as SignatureRecord
    : { purpose: '', fieldName: '', role: '', signingParty: 'receiver' };
}
watch(() => props.modelValue, (open) => { if (open) reset(); }, { immediate: true });

function errorFor(field: string) {
  return showErrors.value && !field?.trim() ? t('ui.send.receiverModal.required') : '';
}
function save() {
  const c = current.value;
  if (!c || ![c.purpose, c.fieldName, c.role].every((field) => field && field.trim() !== '')) {
    showErrors.value = true;
    notify.error(t('ui.send.receiverModal.missing'), { life: 3000 });
    return;
  }
  emit('save', JSON.parse(JSON.stringify(c)) as SignatureRecord);
  value.value = false;
}
</script>
