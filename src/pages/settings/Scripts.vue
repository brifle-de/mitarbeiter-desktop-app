<template>
    <div class="settings-page wrapper">
        <div class="text-left text-h4">Skripte</div>
        <q-separator class="q-my-xl" />
        
        <p class="text-muted">
            Skripte ermöglichen die Automatisierung von Aufgaben und die Erweiterung der Funktionalität von Brifle. 
        </p>

        <div class="material-card material-card-muted q-pa-md rounded-borders">
            <div class="text-h6">Unterstützte Skriptumgebungen</div>
            <p>Die folgenden Skriptumgebungen werden von Brifle unterstützt.</p>
            <div class="row q-my-md" v-for="env in supportedEnvironments" :key="'env_'+env.name">
                <div class="col-3 title-case text-bold">
                    {{ env.name }} 
                </div>
                <div class="col-9">
                    <div class="muted-pill green" v-if="env.installed">
                        <q-tooltip  class="muted-tooltip" :content="'Version: ' + env.version" anchor="top middle" self="bottom middle">
                            Installiert
                        </q-tooltip>
                        {{ env.version }}
                    </div>
                    <div class="muted-pill red" v-else>
                        <q-tooltip  class="muted-tooltip" content="Die Skriptumgebung ist nicht auf diesem System installiert. Skripte, die diese Umgebung benötigen, können nicht ausgeführt werden." anchor="top middle" self="bottom middle">
                            Nicht installiert
                        </q-tooltip>
                        Nicht installiert
                    </div>
                </div>
            </div>           
        </div>
        <!-- List and Tabs with different script environments and scripts -->
        <div class="material-card material-card-muted q-my-lg">
            <q-tabs v-model="selectedEnv" class="text-bold" dense active-color="secondary">
                <q-tab v-for="env in allEnvs" :key="'tab_'+env" :name="env" :label="env.toUpperCase()" />
            </q-tabs>
            <q-separator />
            <div class="q-pa-md">
                <div v-if="scriptsForEnv.length === 0" class="text-muted">Keine Skripte für diese Umgebung gefunden.</div>
                <!-- Future: List of scripts with options to add/edit/remove scripts -->
                 <div v-else class="row q-col-gutter-md">
                    <div v-for="script in scriptsForEnv" :key="'script_'+script" class="col-12 col-md-6">
                        <div class="material-card material-card-muted rounded-borders q-pa-md row">
                            <div class="text-bold flex-1">{{ script }}</div>
                            <div class="col-auto q-ml-auto">
                                <q-btn 
                                @click="goTo(`/settings/scripts/view/${selectedEnv}/${script}`)"
                                class="q-mx-sm muted-action-btn" color="green-3" size="sm" icon="visibility" flat dense />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            

        </div>    

    </div>
</template>
<style lang="scss" scoped>
.settings-page {
    .material-card {
        border-radius: 8px;
    }
}

</style>
<script lang="ts">
import Scripts from 'src/services/node/Scripts';
import { defineComponent, ref } from 'vue'

export default defineComponent({
    name: 'ScriptsSettings',
    mounted() {
        void this.loadSupportedEnvironments()
        void this.loadScriptsForEnvironment(this.selectedEnv)
    },
    watch: {
        selectedEnv(newEnv) {
            void this.loadScriptsForEnvironment(newEnv)
        }
    },
    methods: {
        async goTo(path: string) {
            await this.$router.push({ path });
        },
        async loadSupportedEnvironments() {
            try {
                const environments = await this.scriptsService.getSupportedScriptEnvironments()
                this.supportedEnvironments = environments
            } catch (error) {
                console.error('Error loading supported script environments:', error)
                this.$q.notify({
                    type: 'negative',
                    message: 'Fehler beim Laden der unterstützten Skriptumgebungen. Bitte überprüfen Sie die Konsole für weitere Details.'
                })
            }
        },
        async loadScriptsForEnvironment(env: string) {
           this.scriptsService.getAvailableScripts(env).then(scripts => {
                this.scriptsForEnv = scripts
           }).catch(error => {
                console.error(`Error loading scripts for environment ${env}:`, error)
                this.$q.notify({
                    type: 'negative',
                    message: `Fehler beim Laden der Skripte für die Umgebung ${env}. Bitte überprüfen Sie die Konsole für weitere Details.`
                })
           })
        }
    },
    setup() {
        const supportedEnvironments = ref<{name: string, version: string, installed: boolean}[]>([])
        const scriptsService = new Scripts()
        const allEnvs = ["python", "node"]
        const selectedEnv = ref<string>('python')
        const scriptsForEnv = ref<string[]>([])
        // Future script management logic will go here
        return {
            supportedEnvironments,
            scriptsService,
            allEnvs,
            selectedEnv,
            scriptsForEnv
        }
    }
})
</script>