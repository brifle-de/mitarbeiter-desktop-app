<template>
  <!-- second-level navigation of Einstellungen (Figma page 07) -->
  <nav class="flex w-[220px] shrink-0 flex-col gap-0.5 border-r border-line px-3 py-6">
    <div class="ma-title-m px-3 pb-3">{{ t('ui.shell.settingsNav.title') }}</div>
    <NavItem v-for="i in items" :key="i.to" :to="i.to" :icon="i.icon" :label="i.label" :active="route.path.startsWith(i.to)" />
  </nav>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { Code, FileText, Filter, KeyRound, Moon, RefreshCw, Server } from 'lucide-vue-next';
import NavItem from './NavItem.vue';

const { t } = useI18n();
const route = useRoute();
const items = [
  { to: '/settings/account', icon: KeyRound, label: 'ui.shell.settingsNav.account' },
  { to: '/settings/connections', icon: Server, label: 'ui.shell.settingsNav.connections' },
  { to: '/settings/parsers', icon: Filter, label: 'ui.shell.settingsNav.parsers' },
  { to: '/settings/cover_letters', icon: FileText, label: 'ui.shell.settingsNav.coverLetters' },
  { to: '/settings/scripts', icon: Code, label: 'ui.shell.settingsNav.scripts' },
  { to: '/settings/updates', icon: RefreshCw, label: 'ui.shell.settingsNav.updates' },
  { to: '/settings/appearance', icon: Moon, label: 'ui.shell.settingsNav.appearance' },
];
</script>
