<template>
  <Dialog v-model:visible="value" modal :style="{ width: '960px', maxWidth: '92vw' }" @hide="emit('close')">
    <template #header>
      <div class="flex flex-1 items-center gap-3">
        <span class="ma-title-l">{{ t('signature_details_modal.title') }}</span>
        <Button v-tooltip.bottom="t('ui.outbox.details.signatures.exportXml')" severity="secondary" outlined size="small" :label="t('ui.outbox.details.signatures.exportXml')" @click="emit('exportXml', signatureId)">
          <template #icon><Download :size="16" /></template>
        </Button>
      </div>
    </template>

    <Tabs v-model:value="tab">
      <TabList>
        <Tab value="visual"><span class="flex items-center gap-2"><Eye :size="16" />{{ t('signature_details_modal.visual') }}</span></Tab>
        <Tab value="tech"><span class="flex items-center gap-2"><Code :size="16" />{{ t('signature_details_modal.technical') }}</span></Tab>
      </TabList>
      <TabPanels class="max-h-[65vh] overflow-auto">
        <TabPanel value="visual">
          <div class="flex flex-col gap-5">
            <section v-for="group in groups" :key="group.title" class="flex flex-col gap-2">
              <h3 class="ma-title-m">{{ group.title }}</h3>
              <dl class="grid grid-cols-[220px_minmax(0,1fr)] gap-x-4 gap-y-2">
                <template v-for="row in group.rows" :key="row.label">
                  <dt class="ma-small text-ink-muted">{{ row.label }}</dt>
                  <dd class="break-all">{{ row.value || '—' }}</dd>
                </template>
              </dl>
            </section>
          </div>
        </TabPanel>
        <TabPanel value="tech">
          <pre class="ma-small whitespace-pre-wrap break-all rounded-[10px] bg-dezent p-4">{{ signatureValue }}</pre>
        </TabPanel>
      </TabPanels>
    </Tabs>
  </Dialog>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { Code, Download, Eye } from 'lucide-vue-next';
import Dialog from 'openvue/dialog';
import Button from 'openvue/button';
import Tabs from 'openvue/tabs';
import TabList from 'openvue/tablist';
import Tab from 'openvue/tab';
import TabPanels from 'openvue/tabpanels';
import TabPanel from 'openvue/tabpanel';
import { type ParsedXmlSignature, XmlSignatureParser } from 'src/services/helper/xmlSignature';

const props = defineProps<{ modelValue: boolean; signatureValue: string; signatureId: string; accountId?: string }>();
const emit = defineEmits<{ 'update:modelValue': [value: boolean]; close: []; exportXml: [signatureId: string] }>();
const { t } = useI18n();

const value = computed({
  get: () => props.modelValue,
  set: (v: boolean) => emit('update:modelValue', v),
});
const tab = ref<string | number>('visual');
const xmlDoc = ref<ParsedXmlSignature | null>(null);

watch(() => props.signatureValue, (newValue) => {
  xmlDoc.value = newValue ? XmlSignatureParser.parseXmlSignature(newValue) : null;
}, { immediate: true });

const groups = computed(() => {
  const doc = xmlDoc.value;
  const sp = doc?.signature.object.qualifyingProperties.signedProperties.signedSignatureProperties;
  const place = sp?.signatureProductionPlace;
  return [
    {
      title: t('signature_details_modal.metadata'),
      rows: [
        { label: t('signature_details_modal.version'), value: doc?.meta.version },
        { label: t('signature_details_modal.base_url'), value: doc?.meta.baseUrl },
      ],
    },
    {
      title: t('signature_details_modal.info'),
      rows: [
        { label: t('signature_details_modal.canonicalization'), value: doc?.signature.signedInfo.canonicalizationMethod },
        { label: t('signature_details_modal.signature_method'), value: doc?.signature.signedInfo.signatureMethod },
      ],
    },
    ...(doc?.signature.signedInfo.reference ?? []).map((reference, index) => ({
      title: `Reference ${index + 1}`,
      rows: [
        { label: t('signature_details_modal.uri'), value: reference.uri },
        { label: t('signature_details_modal.transformations'), value: (reference.transforms ?? []).map((tr) => tr.transform).join(', ') },
        { label: t('signature_details_modal.digest_method'), value: reference.digestMethod },
        { label: t('signature_details_modal.digest_value'), value: reference.digestValue },
      ],
    })),
    {
      title: t('signature_details_modal.properties'),
      rows: [
        { label: t('signature_details_modal.timestamp'), value: sp?.signingTime },
        { label: t('signature_details_modal.claimed_roles'), value: sp?.signerRole.claimedRoles.map((role) => role.claimedRole).join(', ') },
        { label: t('signature_details_modal.certified_roles'), value: sp?.signerRole.certifiedRoles.map((role) => role.certifiedRole).join(', ') },
        { label: t('signature_details_modal.certificate_issuer'), value: sp?.signingCertificate.cert.issuerSerial.x509IssuerName },
        { label: t('signature_details_modal.location'), value: place ? `${place.city} (${place.countryName})` : '' },
      ],
    },
    {
      title: t('signature_details_modal.signature'),
      rows: [{ label: t('signature_details_modal.signauture_value'), value: doc?.signature.signatureValue }],
    },
  ];
});
</script>
