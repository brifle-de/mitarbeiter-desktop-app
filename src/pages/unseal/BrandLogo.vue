<template>
  <!-- Brifle/Primär logo; the negative variant on dark backgrounds -->
  <img :src="primary" :alt="t('ui.access.logoAlt')" class="brand-logo-light h-[57px] w-auto" />
  <img :src="negative" :alt="t('ui.access.logoAlt')" class="brand-logo-dark h-[57px] w-auto" />
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import primary from 'src/assets/brand/logo-primaer.svg';
import negative from 'src/assets/brand/logo-negativ.svg';

const { t } = useI18n();
</script>

<style scoped>
/* follows the theme class set by useTheme (.app-dark on <html>) */
.brand-logo-dark { display: none; }
:global(.app-dark .brand-logo-light) { display: none; }
:global(.app-dark .brand-logo-dark) { display: block; }
</style>
