<template>
  <!-- Brifle access data of an account (used by Einstellungen → Konto and Konto anlegen) -->
  <div class="flex flex-col gap-4">
    <FormField :label="`${t('ui.settings.account.fields.name')} *`" :for-id="`${idPrefix}-name`" :hint="t('ui.settings.account.fields.nameHint')" :error="err(name)">
      <InputText :id="`${idPrefix}-name`" v-model="name" :invalid="!!err(name)" fluid />
    </FormField>
    <FormField :label="t('ui.settings.account.fields.env')" :for-id="`${idPrefix}-env`">
      <Select :input-id="`${idPrefix}-env`" v-model="apiEnv" :options="envOptions" option-label="label" option-value="value" fluid />
    </FormField>
    <div class="grid gap-4" :class="columns ? 'grid-cols-2' : 'grid-cols-1'">
      <FormField :label="`${t('ui.settings.account.fields.apiKey')} *`" :for-id="`${idPrefix}-key`" :error="err(apiKey)">
        <InputText :id="`${idPrefix}-key`" v-model="apiKey" :invalid="!!err(apiKey)" autocomplete="off" spellcheck="false" fluid />
      </FormField>
      <FormField
        :label="`${t('ui.settings.account.fields.apiSecret')} *`"
        :for-id="`${idPrefix}-secret`"
        :hint="t('ui.settings.account.fields.apiSecretHint')"
        :error="err(apiSecret)"
      >
        <Password :input-id="`${idPrefix}-secret`" v-model="apiSecret" :invalid="!!err(apiSecret)" :feedback="false" toggle-mask fluid />
      </FormField>
    </div>
    <FormField :label="t('ui.settings.account.fields.tenant')" :for-id="`${idPrefix}-tenant`" :hint="t('ui.settings.account.fields.tenantHint')">
      <InputText :id="`${idPrefix}-tenant`" v-model="tenantId" autocomplete="off" spellcheck="false" fluid />
    </FormField>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import InputText from 'openvue/inputtext';
import Password from 'openvue/password';
import Select from 'openvue/select';
import FormField from 'components/ui/FormField.vue';
import { ApiEndpoints, ApiEnvironment } from 'app/src-electron/models/EncryptedStore';

const props = withDefaults(defineProps<{ idPrefix?: string; columns?: boolean; showErrors?: boolean }>(), {
  idPrefix: 'account',
  columns: false,
  showErrors: false,
});
const name = defineModel<string>('name', { required: true });
const apiKey = defineModel<string>('apiKey', { required: true });
const apiSecret = defineModel<string>('apiSecret', { required: true });
const apiEnv = defineModel<ApiEnvironment>('apiEnv', { required: true });
const tenantId = defineModel<string>('tenantId', { required: true });

const { t } = useI18n();

const envOptions = computed(() =>
  [ApiEnvironment.PRODUCTION, ApiEnvironment.SANDBOX, ApiEnvironment.INTERNAL].map((value) => ({
    value,
    label: `${t(`ui.shell.account.environment.${value}`)} (${new URL(ApiEndpoints.getEndpoint(value)).host})`,
  })),
);

/** required-field error, only after the first submit attempt */
function err(value: string | undefined) {
  return props.showErrors && !value?.trim() ? t('ui.settings.account.fields.required') : '';
}
</script>
