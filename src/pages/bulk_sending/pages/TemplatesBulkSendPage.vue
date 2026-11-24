<template>
  <div class="flex flex-col gap-6 overflow-auto px-8 py-7">
    <PageHeader :path="t('ui.bulk.path')" :title="t('ui.bulk.templates.title')" :subtitle="t('ui.bulk.templates.subtitle')">
      <template #actions>
        <Button :label="t('ui.bulk.templates.new')" @click="newTemplate()">
          <template #icon><Plus :size="18" /></template>
        </Button>
      </template>
    </PageHeader>

    <div v-if="isLoading" class="flex justify-center py-12">
      <ProgressSpinner style="width: 40px; height: 40px" />
    </div>
    <div v-else class="grid grid-cols-[repeat(auto-fill,minmax(320px,1fr))] gap-6">
      <section v-for="template in templateMeta" :key="template.id" class="ma-card gap-3 p-5">
        <div class="flex items-start gap-2.5">
          <LayoutTemplate :size="20" class="mt-0.5 shrink-0 text-icon-brand" />
          <div class="flex min-w-0 flex-1 flex-col">
            <h2 class="ma-title-m break-words">{{ template.name }}</h2>
            <p v-if="template.description" class="ma-small line-clamp-2 text-ink-muted">{{ template.description }}</p>
          </div>
          <Button text rounded size="small" :aria-label="t('ui.bulk.templates.more')" @click="openMenu($event, template)">
            <template #icon><Ellipsis :size="18" /></template>
          </Button>
        </div>
        <ul class="flex flex-col gap-2 text-ink-muted">
          <li class="flex items-start gap-2.5">
            <Users :size="16" class="mt-0.5 shrink-0" />
            <span class="ma-small">{{ receiverSourceText(template) }}</span>
          </li>
          <li class="flex items-start gap-2.5">
            <FolderOpen :size="16" class="mt-0.5 shrink-0" />
            <span class="ma-small">{{ documentSourceText(template) }}</span>
          </li>
          <li class="flex items-start gap-2.5">
            <Clock :size="16" class="mt-0.5 shrink-0" />
            <span class="ma-small">{{ t('ui.bulk.templates.createdAt', { date: new Date(template.createdAt).toLocaleString() }) }}</span>
          </li>
          <li class="flex items-start gap-2.5">
            <Mail :size="16" class="mt-0.5 shrink-0" />
            <span class="ma-small">{{ getExternalReceiverActionText(template.nonExistingReceiverAction.action) }}</span>
          </li>
        </ul>
        <div class="flex flex-col gap-1.5">
          <span class="ma-label text-ink-muted">{{ t('ui.bulk.templates.subjects') }}</span>
          <div class="flex items-center gap-2">
            <DocTypePill :label="t('ui.bulk.templates.defaultSubject')" :color="pillColors['default']" />
            <span class="ma-small truncate">{{ template.subjects.default }}</span>
          </div>
          <div v-for="docType in Object.keys(template.subjects.docTypes)" :key="docType" class="flex items-center gap-2">
            <DocTypePill :label="docType" :color="pillColors[docType]" />
            <span class="ma-small truncate">{{ template.subjects.docTypes[docType] }}</span>
          </div>
        </div>
        <div class="mt-auto flex items-center gap-2 pt-1">
          <Button size="small" :label="t('ui.bulk.templates.run')" @click="startProcess(template.id)">
            <template #icon><Play :size="16" /></template>
          </Button>
          <Button text size="small" :label="t('ui.bulk.templates.edit')" @click="editTemplate(template.id)">
            <template #icon><Pencil :size="16" /></template>
          </Button>
        </div>
      </section>

      <button
        type="button"
        class="flex min-h-[220px] flex-col items-center justify-center gap-2 rounded-[12px] border-[1.5px] border-dashed border-line px-6 py-8 text-center transition-colors hover:border-line-brand hover:bg-mint"
        @click="newTemplate()"
      >
        <Plus :size="24" class="text-icon-brand" />
        <span class="ma-text-strong text-brand-ink">{{ t('ui.bulk.templates.newTile') }}</span>
        <span class="ma-small text-ink-muted">{{ t('ui.bulk.templates.newTileText') }}</span>
      </button>
    </div>

    <Menu ref="menu" :model="menuItems" popup />
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useConfirm } from 'openvue/useconfirm';
import Button from 'openvue/button';
import Menu from 'openvue/menu';
import ProgressSpinner from 'openvue/progressspinner';
import { Clock, Ellipsis, FolderOpen, LayoutTemplate, Mail, Pencil, Play, Plus, Users } from 'lucide-vue-next';
import { BulkSendTemplate } from 'app/src-electron/service/send_templates/templates/template';
import SendTemplate from 'src/services/node/SendTemplate';
import Logger from 'src/services/node/Log';
import PageHeader from 'components/shell/PageHeader.vue';
import { useNotify } from 'src/composables/useNotify';
import DocTypePill from '../components/ui/DocTypePill.vue';
import { computePillColors } from '../util/helper';

const { t } = useI18n();
const router = useRouter();
const confirm = useConfirm();
const notify = useNotify();

const templateMeta = ref<BulkSendTemplate[]>([]);
const sendTemplateService = new SendTemplate();
const pillColors = ref<Record<string, string>>({});
const isLoading = ref(false);

const menu = ref<InstanceType<typeof Menu> | null>(null);
const menuTemplate = ref<BulkSendTemplate | null>(null);
const menuItems = computed(() => [
  { label: t('ui.bulk.templates.run'), command: () => menuTemplate.value && startProcess(menuTemplate.value.id) },
  { label: t('ui.bulk.templates.edit'), command: () => menuTemplate.value && editTemplate(menuTemplate.value.id) },
  { separator: true },
  { label: t('ui.bulk.templates.delete'), class: 'text-danger', command: () => menuTemplate.value && deleteTemplate(menuTemplate.value) },
]);

function openMenu(event: Event, template: BulkSendTemplate) {
  menuTemplate.value = template;
  menu.value?.toggle(event);
}

function startProcess(templateId: string) {
  void router.push({ name: 'bulk_sending.start', params: { id: templateId } });
}
function editTemplate(templateId: string) {
  void router.push({ name: 'bulk_sending.edit_template', params: { id: templateId } });
}
function newTemplate() {
  void router.push({ name: 'bulk_sending.create_template' });
}

function deleteTemplate(template: BulkSendTemplate) {
  confirm.require({
    header: t('ui.bulk.templates.deleteTitle'),
    message: t('ui.bulk.templates.deleteText', { name: template.name }),
    acceptProps: { label: t('ui.bulk.templates.delete'), severity: 'danger' },
    rejectProps: { label: t('ui.bulk.common.cancel'), severity: 'secondary', outlined: true },
    accept: () => {
      sendTemplateService.deleteTemplate(template.id).then(() => {
        notify.success(t('ui.bulk.templates.deleted'));
        return loadTemplates();
      }).catch((error: unknown) => {
        Logger.error('Error deleting template: ' + String(error));
        notify.error(t('ui.bulk.templates.deleteFailed'));
      });
    },
  });
}

function getExternalReceiverActionText(action: string) {
  switch (action) {
    case 'paper_mail':
    case 'papermail':
      return t('ui.bulk.templates.actionPaperMail');
    case 'skip':
    case 'ignore':
      return t('ui.bulk.templates.actionSkip');
  }
  return action;
}

function receiverSourceText(template: BulkSendTemplate) {
  const src = template.receiverSource;
  const origin = src.type === 'sftp' ? t('ui.bulk.common.sftpServer') : (src.file ?? t('ui.bulk.common.localFile'));
  return src.parserId ? t('ui.bulk.templates.receiversWithParser', { origin, parser: src.parserId }) : t('ui.bulk.templates.receivers', { origin });
}

function documentSourceText(template: BulkSendTemplate) {
  const src = template.documentSource;
  const kind = src.destType === 'directory' ? t('ui.bulk.documentSource.directory') : t('ui.bulk.documentSource.assignmentFile');
  const origin = src.type === 'sftp' ? t('ui.bulk.common.sftpServer') : (src.file ?? t('ui.bulk.common.localFile'));
  return t('ui.bulk.templates.documents', { kind, origin });
}

async function loadTemplates() {
  isLoading.value = true;
  await sendTemplateService.getAllTemplates().then((templates) => {
    templateMeta.value = templates;
    const allDocTypes = templates.flatMap(tpl => Object.keys(tpl.subjects.docTypes));
    const pillColorsObjs = allDocTypes.map(docType => ({ docType: docType }));
    pillColorsObjs.push({ docType: 'default' });
    pillColors.value = computePillColors(pillColorsObjs);
  }).finally(() => {
    isLoading.value = false;
  });
}

onMounted(() => {
  void loadTemplates();
});
</script>
