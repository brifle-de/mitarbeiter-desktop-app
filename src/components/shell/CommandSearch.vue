<template>
  <div>
    <button
      class="flex h-[30px] w-[420px] items-center gap-2 rounded-lg bg-white/10 px-2.5 text-left hover:bg-white/15"
      @click="open = true"
    >
      <Search :size="16" />
      <span class="ma-small flex-1 opacity-80">{{ t('ui.shell.search') }}</span>
      <kbd class="ma-label rounded bg-white/15 px-1.5">{{ t('ui.shell.searchShortcut') }}</kbd>
    </button>
    <Dialog v-model:visible="open" modal :show-header="false" :style="{ width: '560px', top: '-20vh' }" dismissable-mask>
      <div class="flex flex-col gap-3 pt-4">
        <IconField>
          <InputIcon><Search :size="16" /></InputIcon>
          <InputText ref="input" v-model="query" class="w-full" :placeholder="t('ui.shell.search')" @keydown.enter="go(results[0])" />
        </IconField>
        <ul class="flex max-h-[360px] flex-col gap-1 overflow-auto">
          <li v-for="r in results" :key="String(r.name ?? r.path)">
            <button class="flex w-full flex-col rounded-lg px-3 py-2 text-left hover:bg-mint" @click="go(r)">
              <span class="ma-text-strong">{{ r.meta?.title }}</span>
              <span class="ma-small text-ink-muted">{{ r.meta?.description }}</span>
            </button>
          </li>
          <li v-if="results.length === 0" class="ma-small px-3 py-2 text-ink-muted">{{ t('ui.shell.searchEmpty') }}</li>
        </ul>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { useRouter, type RouteRecordRaw } from 'vue-router';
import { useI18n } from 'vue-i18n';
import hotkeys from 'hotkeys-js';
import { Search } from 'lucide-vue-next';
import Dialog from 'openvue/dialog';
import InputText from 'openvue/inputtext';
import IconField from 'openvue/iconfield';
import InputIcon from 'openvue/inputicon';
import { searchRoutes } from 'src/router/routes';

const { t } = useI18n();
const router = useRouter();
const open = ref(false);
const query = ref('');
const input = ref<{ $el: HTMLInputElement } | null>(null);
const results = computed(() => searchRoutes(query.value));

function go(route: RouteRecordRaw | undefined) {
  if (!route) return;
  void router.push(route.name ? { name: route.name } : route.path);
  open.value = false;
  query.value = '';
}

watch(open, async (v) => {
  if (v) {
    await nextTick();
    input.value?.$el?.focus();
  }
});

onMounted(() => {
  hotkeys('ctrl+k,cmd+k', (event) => {
    event.preventDefault();
    open.value = !open.value;
  });
});
onBeforeUnmount(() => hotkeys.unbind('ctrl+k,cmd+k'));
</script>
