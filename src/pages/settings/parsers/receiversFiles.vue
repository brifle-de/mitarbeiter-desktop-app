<template>
     <p-page class="wrapper">
        <h4>
            Empfänger - Stammdatendateien
        </h4>
        <div>
            <q-card flat bordered class="q-pa-md bg-fading rounded-borders">
                <div class="text-h5 q-mb-md">Vorinstalliert</div>
                <!-- iterate over all sample parsers-->
                <q-list>
                    <q-item v-for="parser in SampleParsers" :key="parser.name">
                        <q-item-section avatar>
                            <q-icon name="description" size="2.5rem" color="secondary" />
                        </q-item-section>
                        <q-item-section class="text-h6">
                            <q-item-label>{{ parser.name }}</q-item-label>
                            <q-item-label caption>
                                {{ parser.description }}
                            </q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-btn color="secondary" text-color="black" @click="showParser(parser)" label="Anzeigen" />
                        </q-item-section>

                    </q-item>
                </q-list>
            </q-card>

            <q-card flat bordered class="q-pa-md bg-fading rounded-borders q-mt-xl">
                <div class="text-h5 q-mb-md">Eigene Parsers</div>
                <div v-if="customParsers.length === 0" class="text-white">
                    <p>
                        Es sind keine eigenen Empfänger-Stammdatendatei-Parser vorhanden.
                    </p>
                </div>
                <!-- iterate over all sample parsers-->
                <q-list v-else>
                    <q-item v-for="parser in customParsers" :key="parser.name">
                        <q-item-section avatar>
                            <q-icon name="description" size="2.5rem" color="secondary" />
                        </q-item-section>
                        <q-item-section class="text-h6">
                            <q-item-label>{{ parser.name }}</q-item-label>
                            <q-item-label caption>
                                {{ parser.description }}
                            </q-item-label>
                        </q-item-section>
                        <q-item-section side>
                            <q-btn color="secondary" text-color="black" @click="showParser(parser)" label="Anzeigen" />
                        </q-item-section>

                    </q-item>
                </q-list>
            </q-card>
        </div>
    </p-page>
    <ParserDialog
        v-if="showParserDialog && selectedParser"
        v-model="showParserDialog"
        :parser="selectedParser"
    >

    </ParserDialog>
</template>
<script lang="ts">

import { defineComponent, ref } from 'vue';

import SampleParsers from '@src/pages/bulk_sending/util/receivers/sampleParsers'
import { ReceiverParserRules, ReceiversParserDefinition } from 'src/pages/bulk_sending/util/receivers/parsers';
import ParserDialog from './components/ParserDialog.vue';
import { ParsersProvider } from 'src/services/node/ParsersProvider';

export default defineComponent({
    name: 'ReceiversFiles',
    setup() {
        const showParserDialog = ref(false);
        const selectedParser = ref<{rules: ReceiverParserRules, name: string, description: string} | null>(null);
        const customParsers = ref<ReceiversParserDefinition[]>([]);
        const parsersProvider = new ParsersProvider();
        parsersProvider.getReceiversParsers().then((parsers) => {
            customParsers.value = Object.values(parsers);
        }).catch((err: Error) => {
            console.error('Error fetching custom parsers:', err);
        });
        return {SampleParsers, customParsers, showParserDialog, selectedParser, parsersProvider};
    },
    components: {
        ParserDialog,
    },
    methods: {
        showParser (parser: {rules: ReceiverParserRules, name: string, description: string}) {
            this.selectedParser = parser;
            this.showParserDialog = true;           
        },
    },
});

</script>