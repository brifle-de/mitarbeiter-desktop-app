<template>
    <q-dialog
        v-model="value"
        persistent
        class="q-dialog--fullscreen q-dialog--border-radius-none"
        transition-show="slide-up">
        <q-card class="send-docs-card dialog-window-lg" flat bordered>
            <div>
                <q-toolbar class="bg-secondary text-black">
                    <q-toolbar-title class="text-h6">
                        {{ parser.name }}
                    </q-toolbar-title>
                    <q-btn flat round icon="close" @click="$emit('update:modelValue', false)" />
                </q-toolbar>
            </div>
            <q-card-section class="q-pt-none">
                <div class="text-h6 q-my-md">Beschreibung</div>
                <div class="text-subtitle2 q-mb-md">{{ parser.description }}</div>
                <span class="float-right">
                    <!-- copy to clipboard btn -->
                    <q-btn
                        color="secondary"
                        text-color="black"
                        icon="content_copy"
                        @click="cpToClipBoard(jsonValue)"
                        class="q-mr-sm"
                    />
                </span>
                <div class="text-h6 q-my-md">Regeln</div>
                <code style="white-space: pre-wrap; overflow: auto; ">
                    {{ jsonValue }}
                </code>
            </q-card-section>
            <q-card-actions vertical class="q-mt-none">
                <q-btn color="secondary" text-color="black" @click="value = false" label="Schließen" />
            </q-card-actions>
        </q-card>
    </q-dialog>
    
</template>
<script lang="ts">

import { copyToClipboard } from 'quasar';
import { defineComponent, PropType } from 'vue';

export default defineComponent({
    name: 'ParserDialog',
    emits: ['update:modelValue'],
    components: {},
    computed: {
        value: {
            get() {
                return this.modelValue;
            },
            set(value: boolean) {
                this.$emit('update:modelValue', value);
            },
        },
        jsonValue(){
            return JSON.stringify(this.parser.rules, null, 2);
        }
    },
    props: {
        parser: {
            type: Object as PropType<{
                rules: unknown; // Replace with the actual type of rules
                name: string;
                description: string;
            }>,
            required: true,
        },
        modelValue: {
            type: Boolean,
            default: false,
        },
    },
    methods: {
        cpToClipBoard(value: string) {
            copyToClipboard(value).then(() => {
                this.$q.notify({
                    message: 'In Zwischenablage kopiert',
                    color: 'green',
                    position: 'top',
                    timeout: 2000,
                });
            }).catch(() => {
                this.$q.notify({
                    message: 'Fehler beim Kopieren',
                    color: 'red',
                    position: 'top',
                    timeout: 2000,
                });
            });
        },
    },
    setup() {      
        return {  };
    },
});


</script>