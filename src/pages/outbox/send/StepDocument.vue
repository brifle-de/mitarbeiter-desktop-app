<template>
  <!-- V1 Dokument: PDF drop, file list, suggestions of the text recognition; preview on the right -->
  <div class="grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)] items-start gap-6">
    <div class="flex flex-col gap-4">
      <FileDragAndDrop v-if="!state.readonly" @drop="flow.addFiles($event)" />

      <section v-for="(file, index) in state.files" :key="index + file.name" class="flex items-center gap-3 rounded-[12px] border border-line bg-flaeche px-4 py-3">
        <FileText :size="20" class="text-icon-brand" />
        <span class="flex min-w-0 flex-1 flex-col">
          <span class="ma-text-strong truncate">{{ file.name }}</span>
          <span class="ma-small text-ink-muted">{{ formatSize(file.content.length) }} · PDF</span>
        </span>
        <Button text size="small" :label="t('ui.send.document.remove')" :disabled="state.readonly" @click="flow.removeFile(index)">
          <template #icon><Trash2 :size="16" /></template>
        </Button>
      </section>

      <section v-if="state.isProcessingOcr" class="ma-card">
        <div class="flex items-center gap-3">
          <ProgressSpinner style="width: 22px; height: 22px" stroke-width="5" />
          <span class="ma-text-strong">{{ t('ui.send.document.ocrRunning') }}</span>
        </div>
        <span class="text-ink-muted">{{ t('ui.send.document.ocrRunningHint') }}</span>
      </section>

      <section v-else-if="state.recommendations.length > 0" class="ma-card">
        <div class="flex items-center gap-2">
          <ScanText :size="20" class="text-icon-brand" />
          <h2 class="ma-title-m flex-1">{{ t('ui.send.recommendations.title') }}</h2>
        </div>
        <p class="text-ink-muted">{{ t('ui.send.recommendations.intro') }}</p>
        <RecommendationItemSelection
          :recommendations="state.recommendations"
          :selected-recommendations="state.selectedRecommendations"
          @select="state.selectedRecommendations = $event"
        />
        <div class="flex items-center gap-2">
          <Button severity="secondary" outlined size="small" :label="t('ui.send.recommendations.accept')" :disabled="state.selectedRecommendations.length === 0" @click="accept()">
            <template #icon><Check :size="16" /></template>
          </Button>
          <Button text size="small" :label="t('ui.send.recommendations.reject')" @click="flow.rejectRecommendations()" />
        </div>
      </section>
    </div>

    <section class="flex min-h-[420px] flex-col rounded-[12px] border border-line bg-dezent p-6">
      <DocumentView v-if="state.files.length > 0" :content="previewContent" />
      <EmptyState v-else :icon="FileText" :title="t('ui.send.document.emptyTitle')" :text="t('ui.send.document.emptyText')" />
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { Check, FileText, ScanText, Trash2 } from 'lucide-vue-next';
import Button from 'openvue/button';
import ProgressSpinner from 'openvue/progressspinner';
import FileDragAndDrop from 'src/components/ui-elements/FileDragAndDrop.vue';
import DocumentView from 'src/components/ui-elements/DocumentView.vue';
import EmptyState from 'components/ui/EmptyState.vue';
import RecommendationItemSelection from '../components/recommendationItemSelection.vue';
import { formatSize } from '../util/outbox';
import { toContentBodies } from './pdf';
import { useSendDocument } from './useSendDocument';

const { t } = useI18n();
const flow = useSendDocument();
const state = flow.state;
const previewContent = computed(() => toContentBodies(state.files));

function accept() {
  flow.acceptRecommendations();
}
</script>
