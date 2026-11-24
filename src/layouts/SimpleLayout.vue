<template>
  <!-- before login (unlock, accounts): title bar without search, content centred -->
  <div class="flex h-full flex-col">
    <AppTitleBar :show-search="false" />
    <main class="flex min-h-0 flex-1 flex-col items-center overflow-auto p-8">
      <router-view />
    </main>
  </div>
</template>

<script setup lang="ts">
import AppTitleBar from 'components/shell/AppTitleBar.vue';
</script>
