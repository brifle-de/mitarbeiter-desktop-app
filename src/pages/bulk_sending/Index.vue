<template>
  <div class="flex flex-col gap-6 overflow-auto px-8 py-7">
    <PageHeader :path="t('ui.bulk.path')" :title="t('ui.bulk.index.title')" :subtitle="t('ui.bulk.index.subtitle')" />
    <div class="grid grid-cols-2 gap-6">
      <section class="ma-card">
        <IconBadge :icon="Layers" />
        <h2 class="ma-title-l">{{ t('ui.bulk.index.custom.title') }}</h2>
        <p class="flex-1 text-ink-muted">{{ t('ui.bulk.index.custom.text') }}</p>
        <div>
          <Button :label="t('ui.bulk.index.custom.action')" @click="go('bulk_sending.custom')">
            <template #icon><Play :size="18" /></template>
          </Button>
        </div>
      </section>
      <section class="ma-card">
        <IconBadge :icon="LayoutTemplate" />
        <h2 class="ma-title-l">{{ t('ui.bulk.index.template.title') }}</h2>
        <p class="flex-1 text-ink-muted">{{ t('ui.bulk.index.template.text') }}</p>
        <div>
          <Button severity="secondary" outlined :label="t('ui.bulk.index.template.action')" @click="go('bulk_sending.templates')">
            <template #icon><ChevronRight :size="18" /></template>
          </Button>
        </div>
      </section>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import Button from 'openvue/button';
import { ChevronRight, Layers, LayoutTemplate, Play } from 'lucide-vue-next';
import PageHeader from 'components/shell/PageHeader.vue';
import IconBadge from 'components/ui/IconBadge.vue';

const { t } = useI18n();
const router = useRouter();

function go(name: string) {
  void router.push({ name });
}
</script>
