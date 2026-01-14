<template>
    <div>
        Welche Aktion soll für Empfänger, die kein Brifle nutzen, ausgeführt werden?
    </div>
    <div class="src_grid q-my-lg">
        <div class="text-bold" 
            @click="selectAction('ignore')" :class="{ active: action === 'ignore' }">
            Ignorieren 
        </div>     
         <div class="text-bold" 
            @click="selectAction('papermail')" :class="{ active: action === 'papermail' }">
            Papierpost 
        </div>     
    </div>
    <div v-if="action === 'papermail'">
        <div class="text-h6">Optionen</div>
        <div class="q-my-lg">
            Damit ein Dokument per Papierpost versendet werden kann, muss das erste Blatt die Standards der deutschen Post erfüllen. Sollte dies nicht der Fall sein, sollte ein vorgefertigtes Deckblatt verwendet werden.
            
        </div>
        <div>
            <q-toggle
            v-model="useCoverLetter"
            color="secondary">
        </q-toggle>            
    
        <span>Deckblatt verwenden</span>
        </div>
        <div v-if="useCoverLetter" class="q-my-md">
            <CoverLetterSelectionModal
                :api-id="apiId"
                :tenant-id="tenantId"
                v-model="showCoverLetterSelectionModal"
                @selected="selectedCoverLetter = $event"
            />
            <q-btn 
                color="secondary" 
                outline 
                @click="showCoverLetterSelectionModal = true">
                <q-icon name="folder_open" class="q-mr-sm" />
                {{ selectedCoverLetter ? selectedCoverLetter.displayName : 'Deckblatt auswählen' }}
            </q-btn>
        </div>
        <div class="q-my-md row items-center">
            <q-toggle 
            v-model="testModePaperMail" 
            color="secondary">

            </q-toggle>
            <span>
                Testmodus für Papierpost
            </span>            
        </div>
        <div v-if="testModePaperMail">
            <q-input 
            color="secondary"
            v-model="paperMailTestEmailRecipient" 
            label="Empfänger für Testmodus" />
        </div>
    </div>
    <div class="q-mt-md">
         <q-btn 
        :disable="!valid"
         @click="update()" 
         color="secondary" text-color="black" label="Weiter" />
    </div>
</template>

<style lang="scss" scoped>

    $bg-grid-item: #f0f0f022;
    $bg-grid-item-hover: #f0f0f033;
    $bg-grid-item-active: #f0f0f02c;

    .src_grid {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
    }
    .src_grid > div {
        background-color: $bg-grid-item;
        padding: 20px;
        min-height: 200px;
        border-radius: 10px;        
        text-align: center;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        border: 3px solid $bg-grid-item;
    }
    .src_grid > div:hover {
        background-color: $bg-grid-item-hover;
        cursor: pointer;
    }
    .src_grid > div:active, .src_grid > div.active  {
        background-color: $bg-grid-item-active;
        border: 3px solid var(--q-secondary);
    }
</style>

<script lang="ts">

import { defineComponent, ref } from 'vue';
import CoverLetterSelectionModal from 'src/components/modals/coverLetter/CoverLetterSelectionModal.vue';

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
    }
    
  },
  emits: ['update'],
  components: {
CoverLetterSelectionModal
  },
  mounted() {
    const storedData = this.loadFromLocalStorage();
    if(storedData) {
        this.action = storedData.action;
        this.testModePaperMail = storedData.testModePaperMail;
        this.paperMailTestEmailRecipient = storedData.paperMailTestEmailRecipient;
        this.useCoverLetter = storedData.useCoverLetter;
        this.selectedCoverLetter = storedData.selectedCoverLetter;
    }
  },
  methods: {
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
        const dataString = localStorage.getItem('nonExistingReceiverAction');
        if(dataString) {
            return JSON.parse(dataString) as NonExistingReceiverAction;
        }
        return null;
    },
    storeToLocalStorage(data: NonExistingReceiverAction){
        localStorage.setItem('nonExistingReceiverAction', JSON.stringify(data));
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
    return {
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