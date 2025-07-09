<template>
    <p-page class="wrapper">
        <h4 class="text-center">Parsers</h4>
        <q-list class="q-mt-md bg-fading rounded-borders q-pa-md">
            <q-item clickable @click="goTo('/settings/parsers/receiver-records')">
                <q-item-section avatar>
                    <q-icon name="groups" size="2.5rem" color="secondary" />
                </q-item-section>
                <q-item-section class="text-h6">
                    <q-item-label>Massenversand - Empfänger</q-item-label>
                    <q-item-label caption>
                        Legt fest, wie Empfänger aus Stammdatendateien ausgelesen werden.
                    </q-item-label>
                </q-item-section>                
            </q-item>
            <!-- TODO:
            <q-item clickable @click="goTo('/settings/parsers/document-records')">
                <q-item-section avatar>
                    <q-icon name="description" size="2.5rem" color="secondary" />
                </q-item-section>
                <q-item-section class="text-h6">
                    <q-item-label>Massenversand - Verzeichnis Zuweisung</q-item-label>
                    <q-item-label caption>
                        Ermöglich das Auslesen eines Verzeichnissen und die Zuweisung der Dokumente anhand der Namen der Dokumente.
                    </q-item-label>
                </q-item-section>

            </q-item>
            -->
        </q-list>
    </p-page>
</template>
<script lang="ts">

import { defineComponent } from 'vue';


export default defineComponent({
    name: 'ParsersPage',
    setup() {
        return {};
    },
    methods: {
        goTo (path: string) {
            void this.$router.push({ path });
        },
    },
});


</script>