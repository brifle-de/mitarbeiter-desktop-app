<template>
  <div class="flex flex-col gap-6 overflow-auto px-8 py-7">
    <PageHeader :path="t('ui.settings.path')" :title="t('ui.settings.parsers.title')" :subtitle="t('ui.settings.parsers.subtitle')" />
    <section class="ma-card max-w-[760px] p-3">
      <ul class="flex flex-col">
        <li>
          <button class="flex w-full items-center gap-3 rounded-[10px] px-3 py-3 text-left hover:bg-dezent" @click="goTo('/settings/parsers/receiver-records')">
            <IconBadge :icon="Users" :size="40" />
            <span class="flex min-w-0 flex-1 flex-col gap-0.5">
              <span class="ma-text-strong">{{ t('ui.settings.parsers.receivers') }}</span>
              <span class="ma-small text-ink-muted">{{ t('ui.settings.parsers.receiversText') }}</span>
            </span>
            <ChevronRight :size="20" class="shrink-0 text-ink-muted" />
          </button>
        </li>
        <!-- TODO: Massenversand – Verzeichnis-Zuweisung (/settings/parsers/document-records):
             reads a directory and assigns the documents by their names -->
      </ul>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ChevronRight, Users } from 'lucide-vue-next';
import PageHeader from 'components/shell/PageHeader.vue';
import IconBadge from 'components/ui/IconBadge.vue';

const { t } = useI18n();
const router = useRouter();

function goTo(path: string) {
  void router.push({ path });
}
</script>
