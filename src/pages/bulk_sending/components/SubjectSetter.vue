<template>
    <div class="flex flex-col gap-6">
        <div class="flex items-end gap-3">
            <FormField :label="t('ui.bulk.subject.default')" for-id="bulk-subject-default" class="flex-1">
                <InputText id="bulk-subject-default" v-model="subject.default" :placeholder="t('ui.bulk.subject.defaultPlaceholder')" />
            </FormField>
            <Button severity="secondary" outlined :label="t('ui.bulk.subject.builder')" @click="showBuildDialog = true">
                <template #icon><Braces :size="18" /></template>
            </Button>
        </div>

        <div class="flex flex-col gap-3">
            <div class="flex items-center gap-3">
                <h3 class="ma-title-m flex-1">{{ t('ui.bulk.subject.perDocType') }}</h3>
                <Button text size="small" :label="t('ui.bulk.subject.addDocType')" @click="addDocType()">
                    <template #icon><Plus :size="16" /></template>
                </Button>
            </div>
            <p class="ma-small text-ink-muted">{{ t('ui.bulk.subject.perDocTypeHint') }}</p>
            <div v-for="docType in docTypes" :key="docType" class="flex items-center gap-3">
                <div class="w-40 shrink-0"><DocTypePill :label="docType" :color="pillColors[docType]" /></div>
                <InputText v-model="subject.docTypes[docType]" class="flex-1" :placeholder="subject.default" :aria-label="t('ui.bulk.subject.forDocType', { type: docType })" />
            </div>
            <div v-for="(docType, index) in customDocTypes" :key="docType" class="flex items-center gap-3">
                <div class="w-40 shrink-0"><DocTypePill :label="docType" :color="pillColors[docType]" /></div>
                <InputText v-model="subject.docTypes[docType]" class="flex-1" :placeholder="subject.default" :aria-label="t('ui.bulk.subject.forDocType', { type: docType })" />
                <Button v-tooltip.top="t('ui.bulk.subject.renameDocType')" text rounded :aria-label="t('ui.bulk.subject.renameDocType')" @click="editIndex = index">
                    <template #icon><Pencil :size="16" /></template>
                </Button>
                <Button v-tooltip.top="t('ui.bulk.subject.removeDocType')" text rounded severity="danger" :aria-label="t('ui.bulk.subject.removeDocType')" @click="customDocTypes.splice(customDocTypes.indexOf(docType), 1)">
                    <template #icon><Trash2 :size="16" /></template>
                </Button>
            </div>
            <p v-if="docTypes.length === 0 && customDocTypes.length === 0" class="ma-small text-ink-muted">{{ t('ui.bulk.subject.noDocTypes') }}</p>
        </div>
    </div>

    <!-- Betreff-Designer: compose a subject with placeholders and copy it -->
    <Dialog v-model:visible="showBuildDialog" modal :header="t('ui.bulk.subject.builderTitle')" :style="{ width: '720px', maxWidth: '90vw' }">
        <div class="flex flex-col gap-4">
            <FormField :label="t('ui.bulk.subject.subject')" for-id="bulk-subject-builder">
                <InputText id="bulk-subject-builder" v-model="builderSubject" />
            </FormField>
            <div class="flex flex-col gap-1 rounded-[10px] bg-dezent px-4 py-3">
                <span class="ma-label text-ink-muted">{{ t('ui.bulk.subject.preview') }}</span>
                <span class="ma-text-strong break-words">{{ builderPreview || '–' }}</span>
            </div>
            <h3 class="ma-title-m">{{ t('ui.bulk.subject.placeholders') }}</h3>
            <ul class="flex max-h-[40vh] flex-col overflow-auto">
                <li v-for="placeholder in placeholders" :key="placeholder" class="flex items-center gap-3 border-b border-line py-2 last:border-b-0">
                    <button
                        type="button"
                        class="ma-label shrink-0 rounded-full bg-mint px-2.5 py-[3px] text-brand-ink hover:bg-brand hover:text-on-brand"
                        :title="t('ui.bulk.subject.insert')"
                        @click="insertPlaceholder(placeholder)"
                    >
                        {{ placeholder }}
                    </button>
                    <span class="ma-small text-ink-muted">{{ placeholderDescriptions[placeholder] }}</span>
                </li>
            </ul>
        </div>
        <template #footer>
            <Button severity="secondary" outlined :label="t('ui.bulk.common.close')" @click="showBuildDialog = false" />
            <Button :label="t('ui.bulk.subject.copy')" @click="copyFromBuilder()">
                <template #icon><Copy :size="18" /></template>
            </Button>
        </template>
    </Dialog>

    <Dialog :visible="editIndex !== -1" modal :header="t('ui.bulk.subject.renameDocType')" :style="{ width: '420px' }" @update:visible="(v: boolean) => { if (!v) editIndex = -1; }">
        <FormField v-if="editIndex !== -1" :label="t('ui.bulk.columns.docType')" for-id="bulk-doc-type-edit">
            <InputText id="bulk-doc-type-edit" v-model="customDocTypes[editIndex]" autofocus @keyup.enter="editIndex = -1" @keyup.esc="editIndex = -1" />
        </FormField>
        <template #footer>
            <Button :label="t('ui.bulk.common.close')" @click="editIndex = -1" />
        </template>
    </Dialog>
</template>
<script lang="ts">

import { defineComponent, PropType, ref } from 'vue';
import { getSubjectPlaceholderkeys, getSubjectPlaceholders, SubjectData } from '../util/helper';
import DocumentRecord from '../util/documents/documentRecord';
import { computePillColors } from '../util/helper';
import { copyToClipboard } from 'src/composables/useClipboard';
import { SendDocReceiverReq } from '../util/receivers/receiverRecord';
import { useI18n } from 'vue-i18n';
import Button from 'openvue/button';
import Dialog from 'openvue/dialog';
import InputText from 'openvue/inputtext';
import { Braces, Copy, Pencil, Plus, Trash2 } from 'lucide-vue-next';
import FormField from 'components/ui/FormField.vue';
import DocTypePill from './ui/DocTypePill.vue';
import { useNotify } from 'src/composables/useNotify';

export default defineComponent({
    name: 'SubjectSetter',
     
    components: { Button, Dialog, InputText, Braces, Copy, Pencil, Plus, Trash2, FormField, DocTypePill },
    props: {
        modelValue: {
            type: Object as PropType<SubjectData>,
            required: true,
        },
        docs: {
            type: Array<DocumentRecord>,
            required: false,
            default: () => []
        }
    },
    methods: {
        copyFromBuilder() {
            void copyToClipboard(this.builderSubject);
            this.notify.success(this.t('ui.bulk.subject.copied'));
            this.showBuildDialog = false;
        },
        insertPlaceholder(placeholder: string) {
            this.builderSubject += '{{' + placeholder + '}}';
        },
        addDocType() {
            this.customDocTypes.push('Dok' + (this.customDocTypes.length + 1));
        },
    },
    computed: {
        builderPreview(): string {
            let preview = this.builderSubject;
            const dummyData = getSubjectPlaceholders({doc: {docType: 'default'}} as SendDocReceiverReq);
            for (const key in dummyData) {
                preview = preview.replaceAll(`{{${key}}}`, dummyData[key]!);
            }
            return preview;
        },
        pillColors(): Record<string, string> {
            const types : {docType: string}[] = [];
            this.allTypes.forEach(doc => {
                if (doc) {
                    types.push({docType: doc});
                }
            });
            return computePillColors(types);
         },
        allTypes(): string[] {
            const types = new Set<string>();
            this.docs.forEach(doc => {
                if (doc.docType) {
                    types.add(doc.docType);
                }
            });
            this.customDocTypes.forEach(type => types.add(type));
            return Array.from(types);
        },
        docTypes(): string[] {
            const types = new Set<string>();
            this.docs.forEach(doc => {
                if (doc.docType) {
                    types.add(doc.docType);
                }
            });
            return Array.from(types);
        },
        subject: {
            get() : SubjectData {
                return this.modelValue;
            },
            set(value: SubjectData) {
                this.$emit('update:modelValue', value);
            }
        }
     },
    emits: ['update:modelValue'],
    setup() {
        const customDocTypes = ref<string[]>([]);
        const editIndex = ref<number>( - 1);
        const showBuildDialog = ref<boolean>(false);
        const placeholders = getSubjectPlaceholderkeys();
      
        const { t } = useI18n();
        const notify = useNotify();
        const placeholderDescriptions = Object.fromEntries(
            placeholders.map((key) => [key, t(`ui.bulk.subject.placeholder.${key}`)]),
        ) as Record<string, string>;
        const builderSubject = ref<string>('');
        return { t, notify, customDocTypes, editIndex, showBuildDialog, placeholders, placeholderDescriptions, builderSubject };
    },
});



</script>