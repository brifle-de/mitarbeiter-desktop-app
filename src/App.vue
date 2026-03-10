<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue';

import hotkeys from 'hotkeys-js';

export default defineComponent({
  name: 'App',
  mounted() {
    // open debug tools with F12
    hotkeys('f12', () => {
      void window.electronApi.showDevTools(); 
    });
  }
});
</script>
