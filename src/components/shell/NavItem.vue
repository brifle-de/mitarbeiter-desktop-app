<template>
  <!-- MA/NavEintrag -->
  <RouterLink
    :to="to"
    class="flex h-9 items-center gap-2.5 rounded-lg px-3 transition-colors"
    :class="active ? 'bg-mint text-brand-ink ma-text-strong' : 'text-ink hover:bg-dezent'"
  >
    <component :is="icon" :size="18" :class="active ? 'text-icon-brand' : 'text-ink-muted'" />
    <span class="flex-1 truncate">{{ t(label) }}</span>
    <span v-if="count" class="ma-label rounded-full px-[7px]" :class="active ? 'bg-brand text-on-brand' : 'bg-dezent text-ink-muted'">{{ count }}</span>
  </RouterLink>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import { useI18n } from 'vue-i18n';

defineProps<{ to: string; icon: Component; label: string; active?: boolean | undefined; count?: number }>();
const { t } = useI18n();
</script>
