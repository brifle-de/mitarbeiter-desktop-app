<template>
  <!-- MA/Kachel: the whole tile is the link -->
  <RouterLink :to="to" class="group flex flex-col gap-3 rounded-[12px] border border-line bg-flaeche p-5 transition-colors hover:border-line-brand">
    <IconBadge :icon="icon" />
    <span class="ma-title-m">{{ title }}</span>
    <span class="flex-1 text-ink-muted">{{ text }}</span>
    <span class="ma-text-strong flex items-center gap-1 text-brand-ink">{{ link }} <ChevronRight :size="16" /></span>
  </RouterLink>
</template>

<script setup lang="ts">
import type { Component } from 'vue';
import type { RouteLocationRaw } from 'vue-router';
import { ChevronRight } from 'lucide-vue-next';
import IconBadge from './IconBadge.vue';

defineProps<{ to: RouteLocationRaw; icon: Component; title: string; text: string; link: string }>();
</script>
