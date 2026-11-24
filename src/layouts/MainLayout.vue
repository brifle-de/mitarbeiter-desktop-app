<template>
  <div class="flex h-full flex-col">
    <AppTitleBar />
    <div class="flex min-h-0 flex-1">
      <AppSidebar @lock="seal" />
      <SettingsNav v-if="section === 'settings'" />
      <main class="flex min-w-0 flex-1 flex-col overflow-hidden">
        <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import hotkeys from 'hotkeys-js';
import AppTitleBar from 'components/shell/AppTitleBar.vue';
import AppSidebar from 'components/shell/AppSidebar.vue';
import SettingsNav from 'components/shell/SettingsNav.vue';
import { useEncryptedStore } from 'src/stores/encrypted-store';
import { useBrifleStore } from 'src/stores/brifle-store';

const route = useRoute();
const router = useRouter();
const encryptedStore = useEncryptedStore();
const brifleStore = useBrifleStore();

const section = computed(() => route.matched.find((r) => typeof r.meta.section === 'string')?.meta.section);

/** Lock: forget the decrypted accounts and the API sessions, back to the unlock screen. */
function seal() {
  void window.brifleApi.closeAllSessions();
  brifleStore.$reset();
  encryptedStore.sealData();
  void router.push('/unseal');
}

onMounted(() => {
  hotkeys('ctrl+n,cmd+n', (e) => { e.preventDefault(); void router.push('/outbox/send'); });
  hotkeys('ctrl+shift+n,cmd+shift+n', (e) => { e.preventDefault(); void router.push('/bulk_sending'); });
  hotkeys('ctrl+l,cmd+l', (e) => { e.preventDefault(); seal(); });
});
onBeforeUnmount(() => hotkeys.unbind('ctrl+n,cmd+n,ctrl+shift+n,cmd+shift+n,ctrl+l,cmd+l'));
</script>
