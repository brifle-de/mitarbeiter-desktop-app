import { onBeforeUnmount, onMounted, ref } from 'vue';
import type { UpdateChannel, UpdateInformation, UpdateStatus } from 'app/src-electron/service/AppUpdateService';

const status = ref<UpdateStatus | null>(null);
const info = ref<UpdateInformation | null>(null);

async function refresh() {
  [status.value, info.value] = await Promise.all([
    window.electronApi.getUpdateStatus(),
    window.electronApi.getUpdateInfo(),
  ]);
}

/**
 * Update state from the main process (AppUpdateService). Polls while a
 * component using it is mounted; the update banner and Einstellungen → Updates
 * share the same state.
 */
export function useUpdates(pollMs = 5000) {
  let timer: ReturnType<typeof setInterval> | undefined;
  onMounted(() => {
    void refresh();
    timer = setInterval(() => void refresh(), pollMs);
  });
  onBeforeUnmount(() => timer && clearInterval(timer));
  return {
    status,
    info,
    refresh,
    checkNow: async () => {
      status.value = await window.electronApi.checkForUpdates();
      info.value = await window.electronApi.getUpdateInfo();
    },
    setChannel: async (channel: UpdateChannel) => {
      status.value = await window.electronApi.setUpdateChannel(channel);
      info.value = await window.electronApi.getUpdateInfo();
    },
    installNow: () => window.electronApi.downloadAndInstallUpdate(),
  };
}
