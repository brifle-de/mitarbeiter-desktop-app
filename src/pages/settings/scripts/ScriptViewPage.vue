<template>
     <div class="row">
        <div class="text-left text-h4 flex-1">
            Skript Ansicht
            <span class="text-muted"> {{scriptName}}</span>
        </div>
        <q-dialog v-model="showStartDialog" position="right" maximized  no-shake  transition-show="none"
  transition-hide="none">
            <q-card class="height-100-titlebar padding-top-titlebar material-card material-card-filled flex-column">
                <q-card-section class="flex-1 flex-column">
                    <div class="text-h6">Skript starten</div>
                    <div class="text-muted">Bist du sicher, dass du dieses Skript starten möchtest?</div>
                    <div class="material-card flex-1 q-mt-md code-result">
                        <div v-if="result !== null" class="text-pre-wrap">{{ result }}</div>
                        <div v-else-if="isExecuting"> 
                            <q-spinner color="secondary" />
                            <span>Skript wird ausgeführt...</span>
                        </div>
                        <div v-else-if="executionSucess === false" class="text-negative">Fehler beim Ausführen des Skripts.</div>
                        <div v-else class="text-muted">Das Skript wurde noch nicht ausgeführt.</div>
                    </div>
                </q-card-section>
                <q-card-actions class="row justify-between w-100 q-px-md">
                    <q-btn class="muted-action-btn" flat label="Abbrechen" color="red" @click="showStartDialog = false" />
                    <q-btn class="muted-action-btn" flat label="Starten" color="secondary" @click="startScript()" />
                </q-card-actions>
            </q-card>
        </q-dialog>            
        <div>
            <!-- Start button -->
             <q-btn 
             color="orange"
             class="muted-action-btn"
            @click="showStartDialog = true"
             flat>
                <q-icon name="play_arrow" class="q-mr-sm" />
                <q-tooltip class="muted-tooltip" :delay="500">Skript ausführen</q-tooltip>
                    
             </q-btn>
        </div>
    </div>
    <q-separator class="q-my-xl" />
    <div class="code-viewer material-card material-card-muted rounded-borders">
       
        <div class="code-content q-pa-md rounded-borders">
            <div ref="codeContainer" style="height: 100%"></div>
        </div>

    </div>
</template>
<style lang="scss" scoped>
.code-viewer{
    margin: 0x;
}
.code-content{
    height: 100vh;
}
.code-result{
    white-space-collapse: preserve;
}
</style>
<script lang="ts">

import { defineComponent, ref } from 'vue'
import * as monaco from 'monaco-editor';
import Scripts from 'src/services/node/Scripts';
import hotkeys from 'hotkeys-js';

export default defineComponent({
    name: 'ScriptViewPage',
    props: {
        scriptEnvironment: {
            type: String,
            required: true
        },
        scriptName: {
            type: String,
            required: true
        }
    },
    computed: {
        language (): string {
            switch (this.scriptEnvironment) {
                case 'python':
                    return 'python';
                case 'node':
                    return 'javascript';
                default:
                    return 'plaintext';
            }
        }
    },
    mounted() { 

        void this.scriptsService.readScriptContent(this.scriptEnvironment, this.scriptName).then(content => {
            this.data = content;
            this.initializeMonaco();
        });        
        // bind f5 to start script
        hotkeys('f5', (event) => {
            event.preventDefault();
            this.showStartDialog = !this.showStartDialog;
        });
        // if shows the dialog and enter is pressed, start the script
        hotkeys('enter', (event) => {
            if (this.showStartDialog) {
                event.preventDefault();
                this.startScript();
            }
    });
        
    },

    methods: {
        initializeMonaco() {
             monaco.editor.defineTheme("transparent-theme", {
            base: "vs-dark",   // or "vs"
            inherit: true,
            rules: [],
            colors: {
                "editor.background": "#00000000",  
            }
        });


        const editorContainer = this.$refs.codeContainer as HTMLElement;
        if (editorContainer) {
            // Initialize Monaco Editor
            monaco.editor.create(editorContainer, {
                value: this.data,
                language: this.language,
                automaticLayout: true,
                theme: 'transparent-theme',
                readOnly: true,
                minimap: { enabled: false }, 
                hideCursorInOverviewRuler: true,
                cursorBlinking: "expand",

            });
        }
        },
        startScript() {
            // Logic to start the script goes here
            this.isExecuting = true;
            this.scriptsService.executeScript(this.scriptEnvironment, this.scriptName).then(result => {
                this.result = result.output;
                this.executionSucess = true;
            }).catch(error => {
                console.error('Error executing script:', error);
                this.executionSucess = false;
                this.result = 'Fehler beim Ausführen des Skripts.';

            }).finally(() => {
                this.isExecuting = false;
            });
        },
    },
    setup() {
        const data = ref<string>('');
        const showStartDialog = ref<boolean>(false);
        const scriptsService = new Scripts();
        const result = ref<string | null>(null);
        const executionSucess = ref<boolean | null>(null);
        const isExecuting = ref<boolean>(false);
        return {data, showStartDialog, scriptsService, result, executionSucess, isExecuting};
    },
});

</script>