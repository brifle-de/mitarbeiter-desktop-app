<template>
  <div class="flex flex-col gap-6 overflow-auto px-8 py-7">
    <PageHeader :path="`${t('ui.settings.path')} · ${t('ui.settings.parsers.title')}`" :title="t('ui.settings.parsers.receiverFiles.title')" :subtitle="t('ui.settings.parsers.receiverFiles.subtitle')">
      <template #actions>
        <Button severity="secondary" outlined :label="t('ui.settings.parsers.receiverFiles.back')" @click="$router.push('/settings/parsers')">
          <template #icon><ArrowLeft :size="18" /></template>
        </Button>
      </template>
    </PageHeader>

    <section class="ma-card">
      <h2 class="ma-title-m">{{ t('ui.settings.parsers.receiverFiles.builtIn') }}</h2>
      <ul class="flex flex-col divide-y divide-line">
        <li v-for="parser in SampleParsers" :key="parser.name" class="flex items-center gap-3 py-3">
          <FileText :size="20" class="shrink-0 text-icon-brand" />
          <span class="flex min-w-0 flex-1 flex-col gap-0.5">
            <span class="ma-text-strong">{{ parser.name }}</span>
            <span class="ma-small text-ink-muted">{{ parser.description }}</span>
          </span>
          <Button size="small" severity="secondary" outlined :label="t('ui.settings.parsers.receiverFiles.show')" @click="showParser(parser)">
            <template #icon><Eye :size="16" /></template>
          </Button>
        </li>
      </ul>
    </section>

    <section class="ma-card">
      <h2 class="ma-title-m">{{ t('ui.settings.parsers.receiverFiles.custom') }}</h2>
      <p v-if="customParsers.length === 0" class="text-ink-muted">{{ t('ui.settings.parsers.receiverFiles.emptyCustom') }}</p>
      <ul v-else class="flex flex-col divide-y divide-line">
        <li v-for="parser in customParsers" :key="parser.name" class="flex items-center gap-3 py-3">
          <FileText :size="20" class="shrink-0 text-icon-brand" />
          <span class="flex min-w-0 flex-1 flex-col gap-0.5">
            <span class="ma-text-strong">{{ parser.name }}</span>
            <span class="ma-small text-ink-muted">{{ parser.description }}</span>
          </span>
          <Button size="small" severity="secondary" outlined :label="t('ui.settings.parsers.receiverFiles.show')" @click="showParser(parser)">
            <template #icon><Eye :size="16" /></template>
          </Button>
        </li>
      </ul>
    </section>

    <ParserDialog v-if="selectedParser" v-model="showParserDialog" :parser="selectedParser" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { ArrowLeft, Eye, FileText } from 'lucide-vue-next';
import Button from 'openvue/button';
import PageHeader from 'components/shell/PageHeader.vue';
import SampleParsers from '@src/pages/bulk_sending/util/receivers/sampleParsers';
import { ReceiverParserRules, ReceiversParserDefinition } from 'src/pages/bulk_sending/util/receivers/parsers';
import ParserDialog from './components/ParserDialog.vue';
import { ParsersProvider } from 'src/services/node/ParsersProvider';

const { t } = useI18n();
const showParserDialog = ref(false);
const selectedParser = ref<{ rules: ReceiverParserRules; name: string; description: string } | null>(null);
const customParsers = ref<ReceiversParserDefinition[]>([]);
const parsersProvider = new ParsersProvider();
parsersProvider.getReceiversParsers().then((parsers) => {
  customParsers.value = Object.values(parsers);
}).catch((err: Error) => {
  console.error('Error fetching custom parsers:', err);
});

function showParser(parser: { rules: ReceiverParserRules; name: string; description: string }) {
  selectedParser.value = parser;
  showParserDialog.value = true;
}
</script>
