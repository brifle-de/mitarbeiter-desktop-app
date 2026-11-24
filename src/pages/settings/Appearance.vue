<template>
  <div class="flex flex-col gap-6 overflow-auto px-8 py-7">
    <PageHeader :path="t('ui.settings.path')" :title="t('ui.settings.appearance.title')" :subtitle="t('ui.settings.appearance.subtitle')" />
    <section class="ma-card">
      <div class="grid grid-cols-3 gap-3" role="radiogroup">
        <button
          v-for="o in options"
          :key="o.value"
          role="radio"
          :aria-checked="choice === o.value"
          class="flex flex-col gap-2.5 rounded-[12px] p-3 text-left"
          :class="choice === o.value ? 'border-2 border-line-brand' : 'border border-line'"
          @click="setChoice(o.value)"
        >
          <span class="flex h-20 overflow-hidden rounded-lg border border-line">
            <span v-for="(c, i) in o.preview" :key="i" class="flex-1" :style="{ background: c }" />
          </span>
          <span class="flex items-center gap-2">
            <RadioButton :model-value="choice" :value="o.value" />
            <span :class="choice === o.value ? 'ma-text-strong' : ''">{{ t(`ui.settings.appearance.${o.label}`) }}</span>
          </span>
        </button>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n';
import RadioButton from 'openvue/radiobutton';
import PageHeader from 'components/shell/PageHeader.vue';
import { useTheme, type ThemeChoice } from 'src/composables/useTheme';

const { t } = useI18n();
const { choice, setChoice } = useTheme();
const light = '#f6faf6';
const dark = '#18201c';
const options: { value: ThemeChoice; label: string; preview: string[] }[] = [
  { value: 'system', label: 'system', preview: [light, dark] },
  { value: 'light', label: 'light', preview: [light] },
  { value: 'dark', label: 'dark', preview: [dark] },
];
</script>
