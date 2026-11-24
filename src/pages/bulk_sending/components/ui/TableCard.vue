<template>
  <!-- frame of MA/Kopfzelle + MA/Zelle tables: bordered card, tinted header row -->
  <div class="bulk-table min-w-0 overflow-hidden rounded-[12px] border border-line bg-flaeche">
    <slot />
  </div>
</template>

<style scoped>
.bulk-table :deep(.p-datatable-thead > tr > th) {
  background: var(--bg-mint);
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
}
</style>
