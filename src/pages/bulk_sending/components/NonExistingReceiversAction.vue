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
        <div class="h4">Optionen</div>
        <div>            
            <q-toggle 
            @update:model-value="update()"
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
            @update:model-value="update()"
            label="Empfänger für Testmodus" />
        </div>
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

export default defineComponent({
  name: 'NonExistingReceiversAction',
  props: {
    
  },
  emits: ['selected', 'update'],
  methods: {
    selectAction(action: 'ignore' | 'papermail') {
      this.action = action;
      this.$emit('selected', action);
      this.update();
    },
    update() {
        const data : NonExistingReceiverAction = {
            action: this.action,
            testModePaperMail: this.testModePaperMail,
            paperMailTestEmailRecipient: this.paperMailTestEmailRecipient
        }
        this.$emit('update', data);
    }
  },
  setup() {
    const action = ref<'ignore' | 'papermail'>('ignore');
    const testModePaperMail = ref<boolean>(false);
    const paperMailTestEmailRecipient = ref<string>('');
    return {
        action,
        testModePaperMail,
        paperMailTestEmailRecipient
    };
  },
});

interface NonExistingReceiverAction {
  action: 'ignore' | 'papermail';
  testModePaperMail: boolean;
  paperMailTestEmailRecipient: string;
}

export type {
    NonExistingReceiverAction
}

</script>