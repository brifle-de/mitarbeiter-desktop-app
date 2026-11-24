<template>
  <div class="flex h-full items-center justify-center">
    <EmptyState :icon="SearchX" :title="t('ui.shell.notFound.title')" :text="t('ui.shell.notFound.text')">
      <Button :label="t('ui.shell.notFound.home')" @click="router.push('/')" />
    </EmptyState>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { SearchX } from 'lucide-vue-next';
import Button from 'openvue/button';
import EmptyState from 'components/ui/EmptyState.vue';

const { t } = useI18n();
const router = useRouter();
</script>
