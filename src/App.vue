<template>
  <router-view />
  <!-- MA/Toast: top right, below the title bar -->
  <Toast position="top-right" :pt="{ root: { style: 'top: 56px' } }" />
  <ConfirmDialog :style="{ width: '440px', maxWidth: '90vw' }" />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import hotkeys from 'hotkeys-js';
import Toast from 'openvue/toast';
import ConfirmDialog from 'openvue/confirmdialog';

onMounted(() => {
  // open the developer tools with F12
  hotkeys('f12', () => {
    void window.electronApi.showDevTools();
  });
});
</script>
