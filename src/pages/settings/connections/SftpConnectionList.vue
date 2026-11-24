<template>
  <!-- list of SFTP connections with add / edit / test / remove; the parent decides when to save -->
  <div class="flex flex-col gap-3">
    <ul v-if="connections.length > 0" class="flex flex-col gap-2">
      <li v-for="(server, index) in connections" :key="server.id || index" class="flex items-center gap-3 rounded-[10px] border border-line bg-flaeche px-3.5 py-2.5">
        <Server :size="18" class="shrink-0 text-ink-muted" />
        <div class="flex min-w-0 flex-1 flex-col">
          <span class="ma-text-strong truncate">{{ server.displayName || server.host || t('ui.settings.connections.unnamed') }}</span>
          <span class="ma-small truncate text-ink-muted">
            <template v-if="server.displayName && server.host">{{ server.host }} · </template>{{ t('ui.settings.connections.summary', { port: server.port, user: server.username || '–' }) }}
          </span>
        </div>
        <Button size="small" text :label="t('ui.settings.connections.test')" :loading="testing === index" :disabled="!server.host" @click="test(server, index)" />
        <Button text rounded :aria-label="t('ui.settings.connections.edit')" v-tooltip.top="t('ui.settings.connections.edit')" @click="openEdit(index)">
          <template #icon><Pencil :size="18" /></template>
        </Button>
        <Button text rounded severity="danger" :aria-label="t('ui.settings.connections.remove')" v-tooltip.top="t('ui.settings.connections.remove')" @click="remove(index)">
          <template #icon><Trash2 :size="18" /></template>
        </Button>
      </li>
    </ul>
    <slot v-else name="empty" />
    <Button text size="small" class="self-start" :label="t('ui.settings.connections.add')" @click="openAdd">
      <template #icon><Plus :size="16" /></template>
    </Button>
    <SftpConnectionDialog v-model:visible="dialogVisible" :connection="editIndex === null ? null : connections[editIndex] ?? null" @save="onSave" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { Pencil, Plus, Server, Trash2 } from 'lucide-vue-next';
import Button from 'openvue/button';
import { useConfirm } from 'openvue/useconfirm';
import SftpConnectionDialog from '../modals/SftpConnectionDialog.vue';
import Sftp from 'src/services/node/Sftp';
import { useNotify } from 'src/composables/useNotify';
import type { SftpData } from 'app/src-electron/models/EncryptedStore';

const connections = defineModel<SftpData[]>({ required: true });
const { t } = useI18n();
const notify = useNotify();
const confirm = useConfirm();

const dialogVisible = ref(false);
const editIndex = ref<number | null>(null);
const testing = ref<number | null>(null);

function openAdd() {
  editIndex.value = null;
  dialogVisible.value = true;
}
function openEdit(index: number) {
  editIndex.value = index;
  dialogVisible.value = true;
}

function onSave(connection: SftpData) {
  const next = [...connections.value];
  if (editIndex.value === null) next.push(connection);
  else next[editIndex.value] = connection;
  connections.value = next;
}

function remove(index: number) {
  const server = connections.value[index];
  if (!server) return;
  confirm.require({
    header: t('ui.settings.connections.remove'),
    message: t('ui.settings.connections.removeConfirm', { name: server.displayName || server.host || t('ui.settings.connections.unnamed') }),
    rejectProps: { label: t('ui.settings.cancel'), severity: 'secondary', outlined: true },
    acceptProps: { label: t('ui.settings.connections.remove'), severity: 'danger' },
    accept: () => {
      connections.value = connections.value.filter((_, i) => i !== index);
    },
  });
}

/** a connection works when the root directory can be listed */
async function test(server: SftpData, index: number) {
  testing.value = index;
  try {
    const res = await Sftp.lsDir('/', { host: server.host, port: Number(server.port), username: server.username, password: server.password });
    if (res) notify.success(t('ui.settings.connections.testOk', { host: server.host }));
    else notify.error(t('ui.settings.connections.testFail', { host: server.host }), { detail: t('ui.settings.connections.testFailDetail') });
  } catch (e) {
    console.error('SFTP test failed', e);
    notify.error(t('ui.settings.connections.testFail', { host: server.host }), { detail: t('ui.settings.connections.testFailDetail') });
  } finally {
    testing.value = null;
  }
}
</script>
