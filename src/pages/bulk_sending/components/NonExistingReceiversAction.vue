<template>
    <div class="flex flex-col gap-4">
        <p class="text-ink-muted">{{ t('ui.bulk.nonBrifle.intro') }}</p>
        <div class="grid grid-cols-2 gap-4">
            <SourceTile
                :icon="Ban"
                :title="t('ui.bulk.nonBrifle.ignore')"
                :text="t('ui.bulk.nonBrifle.ignoreText')"
                :active="action === 'ignore'"
                @select="selectAction('ignore')"
            />
            <SourceTile
                :icon="Mailbox"
                :title="t('ui.bulk.nonBrifle.paperMail')"
                :text="t('ui.bulk.nonBrifle.paperMailText')"
                :active="action === 'papermail'"
                @select="selectAction('papermail')"
            />
        </div>
        <section v-if="action === 'papermail'" class="ma-card">
            <h3 class="ma-title-m">{{ t('ui.bulk.nonBrifle.optionsTitle') }}</h3>
            <Message severity="info">{{ t('ui.bulk.nonBrifle.coverLetterInfo') }}</Message>
            <label class="flex items-center gap-2.5">
                <ToggleSwitch v-model="useCoverLetter" />
                {{ t('ui.bulk.nonBrifle.useCoverLetter') }}
            </label>
            <div v-if="useCoverLetter" class="flex items-center gap-3 pl-12">
                <Button severity="secondary" outlined :label="selectedCoverLetter ? selectedCoverLetter.displayName : t('ui.bulk.nonBrifle.chooseCoverLetter')" @click="showCoverLetterSelectionModal = true">
                    <template #icon><FileText :size="18" /></template>
                </Button>
                <span v-if="!selectedCoverLetter" class="ma-small text-danger">{{ t('ui.bulk.nonBrifle.coverLetterRequired') }}</span>
                <CoverLetterSelectionModal
                    v-model="showCoverLetterSelectionModal"
                    :api-id="apiId"
                    :tenant-id="tenantId"
                    @selected="selectedCoverLetter = $event"
                />
            </div>
            <label class="flex items-center gap-2.5">
                <ToggleSwitch v-model="testModePaperMail" />
                {{ t('ui.bulk.nonBrifle.testMode') }}
            </label>
            <FormField
                v-if="testModePaperMail"
                class="pl-12"
                for-id="paper-mail-test-recipient"
                :label="t('ui.bulk.nonBrifle.testRecipient')"
                :hint="t('ui.bulk.nonBrifle.testRecipientHint')"
                :error="paperMailTestEmailRecipient ? '' : t('ui.bulk.nonBrifle.testRecipientRequired')"
            >
                <InputText id="paper-mail-test-recipient" v-model="paperMailTestEmailRecipient" type="email" :invalid="!paperMailTestEmailRecipient" />
            </FormField>
        </section>
    </div>
</template>
<script lang="ts">

import { defineComponent, ref } from 'vue';
import CoverLetterSelectionModal from 'src/components/modals/coverLetter/CoverLetterSelectionModal.vue';
import { useI18n } from 'vue-i18n';
import Button from 'openvue/button';
import InputText from 'openvue/inputtext';
import Message from 'openvue/message';
import ToggleSwitch from 'openvue/toggleswitch';
import { Ban, FileText, Mailbox } from 'lucide-vue-next';
import FormField from 'components/ui/FormField.vue';
import SourceTile from './ui/SourceTile.vue';

export default defineComponent({
  name: 'NonExistingReceiversAction',
  props: {
    apiId: {
        type: String,
        required: true,
    },
    tenantId: {
        type: String,
        required: true,
    },
    useLocalStorage: {
        type: Boolean,
        default: true,
    },
     localStorageKey: {
        type: String,
        default: 'nonExistingReceiverAction',
     },
    initValue: {
        type: Object as () => NonExistingReceiverAction,
        default: null,
    }
    
  },
  // 'update' carries the chosen action (the flow's "next" calls update()), 'valid' reports whether it can be used
  emits: ['update', 'valid'],
  components: {
     
    CoverLetterSelectionModal, Button, InputText, Message, ToggleSwitch, FileText, FormField, SourceTile,
  },
  watch: {
    valid: {
        handler(value: boolean) {
            this.$emit('valid', value);
        },
        immediate: true,
    },
  },
  mounted() {
    const storedData = this.useLocalStorage? this.loadFromLocalStorage() : null;
    if(this.initValue) {
        this.loadData(this.initValue);
    } else if(storedData) {
        this.loadData(storedData);
    }
  },
  methods: {
    loadData(data: NonExistingReceiverAction) {
        this.action = data.action;
        this.testModePaperMail = data.testModePaperMail;
        this.paperMailTestEmailRecipient = data.paperMailTestEmailRecipient;
        this.useCoverLetter = data.useCoverLetter;
        this.selectedCoverLetter = data.selectedCoverLetter;
    },
    selectAction(action: 'ignore' | 'papermail') {
      this.action = action;
    },
    update() { 
        const data : NonExistingReceiverAction = {
            action: this.action,
            useCoverLetter: this.useCoverLetter,
            selectedCoverLetter: this.selectedCoverLetter,
            testModePaperMail: this.testModePaperMail,
            paperMailTestEmailRecipient: this.paperMailTestEmailRecipient
        }
        this.$emit('update', data);
    },
    loadFromLocalStorage(): NonExistingReceiverAction | null {
        if(!this.useLocalStorage) {
            return null;
        }
        const dataString = localStorage.getItem(this.localStorageKey);
        if(dataString) {
            return JSON.parse(dataString) as NonExistingReceiverAction;
        }
        return null;
    },
    storeToLocalStorage(data: NonExistingReceiverAction){
        if (this.useLocalStorage) {
            localStorage.setItem(this.localStorageKey, JSON.stringify(data));
        }
    }
  },
  computed: {
    valid () {
        if(this.action === 'papermail') {
            if(this.useCoverLetter && !this.selectedCoverLetter) {
                return false;
            }
            if(this.testModePaperMail && !this.paperMailTestEmailRecipient) {
                return false;
            }
        }
        return true;
    }
  },
  setup() {
    const action = ref<'ignore' | 'papermail'>('ignore');
    const testModePaperMail = ref<boolean>(false);
    const paperMailTestEmailRecipient = ref<string>('');
    const useCoverLetter = ref<boolean>(false);
    const showCoverLetterSelectionModal = ref<boolean>(false);
    const selectedCoverLetter = ref<{ name: string; type: 'default' | 'custom'; displayName: string } | null>(null);
    const { t } = useI18n();
    return {
        t,
        Ban,
        Mailbox,
        action,
        testModePaperMail,
        paperMailTestEmailRecipient,
        useCoverLetter,
        showCoverLetterSelectionModal,
        selectedCoverLetter
    };
  },
});

interface NonExistingReceiverAction {
  action: 'ignore' | 'papermail';
  testModePaperMail: boolean;
  paperMailTestEmailRecipient: string;
  useCoverLetter: boolean;
  selectedCoverLetter: { name: string; type: 'default' | 'custom'; displayName: string } | null;
}

export type {
    NonExistingReceiverAction
}

</script>