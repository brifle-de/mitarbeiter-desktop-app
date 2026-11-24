<template>
  <!-- A1 / A2: centred in SimpleLayout, card width 480 -->
  <div class="my-auto flex w-full max-w-[480px] flex-col items-center gap-6 py-6">
    <LoadPage v-if="isInit === true" />
    <InitPage v-else-if="isInit === false" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useEncryptedStore } from 'src/stores/encrypted-store';
import InitPage from './Init.vue';
import LoadPage from './Load.vue';

const encryptedStore = useEncryptedStore();
// null while checking, so neither form flashes up first
const isInit = ref<boolean | null>(null);

encryptedStore.checkIfInitialized().then((res: boolean) => {
  isInit.value = res;
}).catch(() => {
  isInit.value = true;
});
</script>
