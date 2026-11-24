<template>
  <!-- MA/Seitenleiste (248px) -->
  <nav class="flex w-[248px] shrink-0 flex-col gap-1 border-r border-line bg-flaeche p-4">
    <template v-for="group in groups" :key="group.label">
      <div class="ma-label px-3 pb-1 pt-3 uppercase text-ink-muted">{{ t(group.label) }}</div>
      <NavItem v-for="item in group.items" :key="item.to" v-bind="item" :active="item.section === activeSection" />
    </template>
    <div class="flex-1" />
    <NavItem to="/settings" :icon="SlidersHorizontal" label="ui.shell.nav.settings" :active="activeSection === 'settings'" />
    <div class="flex items-center gap-2 pl-3 pt-3">
      <span class="ma-small flex-1 text-ink-muted">{{ t('ui.shell.version', { version }) }}</span>
      <Button size="small" severity="secondary" outlined :label="t('ui.shell.lock')" @click="emit('lock')">
        <template #icon><Lock :size="16" /></template>
      </Button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { House, Layers, LayoutTemplate, Lock, Mail, Send, SlidersHorizontal, UserCheck } from 'lucide-vue-next';
import Button from 'openvue/button';
import NavItem from './NavItem.vue';

const emit = defineEmits<{ lock: [] }>();
const { t } = useI18n();
const route = useRoute();
const version = ref('');
void window.electronApi.getAppVersion().then((v: string) => (version.value = v));

const activeSection = computed(() => {
  for (let i = route.matched.length - 1; i >= 0; i--) {
    const s = route.matched[i]?.meta.section;
    if (typeof s === 'string') return s;
  }
  return '';
});

const groups = [
  {
    label: 'ui.shell.groups.work',
    items: [
      { to: '/', section: 'home', icon: House, label: 'ui.shell.nav.home' },
      { to: '/outbox', section: 'outbox', icon: Mail, label: 'ui.shell.nav.outbox' },
      { to: '/outbox/send', section: 'send', icon: Send, label: 'ui.shell.nav.send' },
      { to: '/bulk_sending', section: 'bulk', icon: Layers, label: 'ui.shell.nav.bulk' },
    ],
  },
  {
    label: 'ui.shell.groups.bulk',
    items: [
      { to: '/templates', section: 'templates', icon: LayoutTemplate, label: 'ui.shell.nav.templates' },
      { to: '/bulk_sending/receiver_check', section: 'receiverCheck', icon: UserCheck, label: 'ui.shell.nav.receiverCheck' },
    ],
  },
];
</script>
