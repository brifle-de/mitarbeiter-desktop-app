<template>
  <!-- MA/Titelleiste: own title bar (titleBarStyle hidden). Windows/Linux draw the
       window buttons on the right (titleBarOverlay), macOS the traffic lights on the left. -->
  <header
    class="app-drag flex h-11 shrink-0 items-center gap-3 bg-brand-strong pl-3 text-on-brand-strong"
    :class="isMac ? 'pl-[76px]' : 'pr-[140px]'"
  >
    <img :src="mark" alt="" class="h-6 w-auto" />
    <span class="ma-text-strong">{{ t('ui.shell.appName') }}</span>
    <div class="app-no-drag ml-2 flex items-center gap-1">
      <button class="rounded-md p-1 hover:bg-white/10" :aria-label="t('ui.shell.back')" @click="router.back()">
        <ChevronLeft :size="18" />
      </button>
      <button class="rounded-md p-1 hover:bg-white/10" :aria-label="t('ui.shell.forward')" @click="router.forward()">
        <ChevronRight :size="18" />
      </button>
    </div>
    <div class="flex-1" />
    <CommandSearch v-if="showSearch" class="app-no-drag" />
    <div class="flex-1" />
    <button
      v-if="account"
      class="app-no-drag flex items-center gap-2 rounded-full bg-white/10 px-2.5 py-1 hover:bg-white/15"
      :title="t('ui.shell.account.switch')"
      @click="router.push('/accounts')"
    >
      <span class="h-2 w-2 rounded-full" :class="account.apiEnv === 'production' ? 'bg-highlight' : 'bg-warn-soft'" />
      <span class="ma-small">{{ account.name }} · {{ t(`ui.shell.account.environment.${account.apiEnv}`) }}</span>
      <ChevronDown :size="14" />
    </button>
  </header>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { ChevronDown, ChevronLeft, ChevronRight } from 'lucide-vue-next';
import mark from 'src/assets/brand/bildmarke-negativ.svg';
import CommandSearch from './CommandSearch.vue';
import { useEncryptedStore } from 'src/stores/encrypted-store';
import { useSessionStore } from 'src/stores/session-store';

withDefaults(defineProps<{ showSearch?: boolean }>(), { showSearch: true });

const { t } = useI18n();
const router = useRouter();
const encryptedStore = useEncryptedStore();
const sessionStore = useSessionStore();
const isMac = ref(document.body.classList.contains('darwin') || navigator.userAgent.includes('Mac'));

const account = computed(() =>
  encryptedStore.accounts.find((a) => a.id === sessionStore.selectedAccountId) ?? null,
);
</script>
