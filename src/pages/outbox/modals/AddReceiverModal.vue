<template>
  <Dialog v-model:visible="value" modal :header="t('ui.send.receiverModal.title')" :style="{ width: '720px', maxWidth: '92vw' }" @hide="onHide">
    <div v-if="current" class="flex flex-col gap-5">
      <p class="text-ink-muted">{{ t('ui.send.receiverModal.intro') }}</p>

      <section class="flex flex-col gap-3">
        <h3 class="ma-title-m">{{ t('ui.send.receiverModal.personal') }}</h3>
        <div class="grid grid-cols-2 gap-4">
          <FormField :label="t('ui.send.receiverModal.firstName') + '*'" for-id="rcv-first" :error="showErrors && !current.firstName?.trim() ? t('ui.send.receiverModal.required') : ''">
            <InputText id="rcv-first" v-model="current.firstName" :invalid="showErrors && !current.firstName?.trim()" autofocus />
          </FormField>
          <FormField :label="t('ui.send.receiverModal.lastName') + '*'" for-id="rcv-last" :error="showErrors && !current.lastName?.trim() ? t('ui.send.receiverModal.required') : ''">
            <InputText id="rcv-last" v-model="current.lastName" :invalid="showErrors && !current.lastName?.trim()" />
          </FormField>
        </div>
      </section>

      <section class="flex flex-col gap-3">
        <h3 class="ma-title-m">{{ t('ui.send.receiverModal.birth') }}</h3>
        <div class="grid grid-cols-2 gap-4">
          <FormField :label="t('ui.send.receiverModal.dateOfBirth')" for-id="rcv-dob" :hint="t('ui.send.receiverModal.dateHint')">
            <InputMask id="rcv-dob" v-model="current.dateOfBirth" mask="99/99/9999" slot-char="_" />
          </FormField>
          <FormField :label="t('ui.send.receiverModal.placeOfBirth')" for-id="rcv-pob">
            <InputText id="rcv-pob" v-model="current.placeOfBirth" />
          </FormField>
        </div>
      </section>

      <section class="flex flex-col gap-3">
        <h3 class="ma-title-m">{{ t('ui.send.receiverModal.address') }}</h3>
        <div class="grid grid-cols-2 gap-4">
          <FormField :label="t('ui.send.receiverModal.street')" for-id="rcv-street">
            <InputText id="rcv-street" v-model="current.addressStreet" />
          </FormField>
          <FormField :label="t('ui.send.receiverModal.postcode')" for-id="rcv-postcode">
            <InputMask id="rcv-postcode" v-model="current.addressPostcode" mask="99999" slot-char="_" />
          </FormField>
          <FormField :label="t('ui.send.receiverModal.city')" for-id="rcv-city">
            <InputText id="rcv-city" v-model="current.addressCity" />
          </FormField>
          <FormField :label="t('ui.send.receiverModal.country')" for-id="rcv-country">
            <Select v-model="current.addressCountry" input-id="rcv-country" :options="countriesValues" option-label="name" option-value="code" filter />
          </FormField>
        </div>
      </section>

      <section class="flex flex-col gap-3">
        <h3 class="ma-title-m">{{ t('ui.send.receiverModal.contact') }}</h3>
        <div class="grid grid-cols-2 gap-4">
          <FormField :label="t('ui.send.receiverModal.phone')" for-id="rcv-phone">
            <InputText id="rcv-phone" v-model="current.phone" />
          </FormField>
          <FormField :label="t('ui.send.receiverModal.email')" for-id="rcv-email">
            <InputText id="rcv-email" v-model="current.email" type="email" />
          </FormField>
        </div>
      </section>
      <span class="ma-small text-ink-muted">{{ t('ui.send.receiverModal.requiredHint') }}</span>
    </div>
    <template #footer>
      <Button text :label="t('ui.send.cancel')" @click="close()" />
      <Button :label="t('ui.send.receiverModal.save')" @click="save()">
        <template #icon><UserPlus :size="18" /></template>
      </Button>
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { UserPlus } from 'lucide-vue-next';
import Dialog from 'openvue/dialog';
import Button from 'openvue/button';
import InputText from 'openvue/inputtext';
import InputMask from 'openvue/inputmask';
import Select from 'openvue/select';
import FormField from 'components/ui/FormField.vue';
import { useNotify } from 'src/composables/useNotify';
import { getAllCountriesWithNames } from 'src/pages/bulk_sending/util/receivers/countries';
import type ReceiverRecord from 'src/pages/bulk_sending/util/receivers/receiverRecord';

const props = defineProps<{ modelValue: boolean; initValue?: ReceiverRecord }>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; close: []; save: [receiver: ReceiverRecord] }>();
const { t } = useI18n();
const notify = useNotify();

const value = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
});
const countriesValues = getAllCountriesWithNames('de');
const current = ref<ReceiverRecord>();
const showErrors = ref(false);

function reset() {
  showErrors.value = false;
  current.value = props.initValue
    // deep copy so the parent's data is not changed
    ? JSON.parse(JSON.stringify(props.initValue)) as ReceiverRecord
    : { firstName: '', lastName: '', dateOfBirth: '', placeOfBirth: '', addressStreet: '', addressPostcode: '', addressCity: '', addressCountry: 'DE', phone: '', email: '' };
}
watch(() => props.modelValue, (open) => { if (open) reset(); }, { immediate: true });

function validateInput(): boolean {
  const c = current.value;
  return !!c && [c.firstName, c.lastName].every((field) => field && field.trim() !== '');
}
function onHide() {
  emit('close');
}
function close() {
  value.value = false;
}
function save() {
  if (!validateInput()) {
    showErrors.value = true;
    notify.error(t('ui.send.receiverModal.missing'), { life: 3000 });
    return;
  }
  const val = JSON.parse(JSON.stringify(current.value)) as ReceiverRecord;
  // dd/mm/yyyy (or dd.mm.yyyy) → yyyy-mm-dd
  const dobParts = (val.dateOfBirth ?? '').split(/[/.]/);
  if (dobParts.length === 3) {
    val.dateOfBirth = `${dobParts[2]}-${dobParts[1]!.padStart(2, '0')}-${dobParts[0]!.padStart(2, '0')}`;
  }
  emit('save', val);
  close();
}
</script>
