<template>
    <q-dialog v-model="value" class="full-size-modal" > 
          <q-card class="no-shadow unselectable">
            <div class="row w-100">
                <div class="col-2">
                    <!-- back btn --> 
                     
                </div>
                <div class="col text-center">
                    <div class="text-h6 q-pa-md">
                        Empfänger hinzufügen
                    </div>
                </div>
                <div class="col-2 text-right">
                    <q-btn icon="close" flat round dense class="q-mr-md q-mt-md" @click="close()" />
                </div>
            </div>
            <div class="q-pa-md flex-1">
                <div class="text-outline q-px-lg">
                    Wir suchen den Brifle Empfänger anhand der folgenden Informationen. Nicht alle Informationen sind notwendig, aber je mehr du bereitstellst, desto höher ist die Chance den Empfänger zu finden.
                </div>
                <div class="text-h6 q-px-lg q-mt-md">
                    Persönliche Informationen
                </div>
                <div class="row q-my-md">

                    <div class="col-6 q-px-lg">
                        <q-input 
                            v-model="currentReceiver!.firstName"
                            label="Vorname*"
                            color="secondary"
                            class="q-mb-md"
                        />
                    </div>
                    <div class="col-6 q-px-lg">
                        <q-input 
                            v-model="currentReceiver!.lastName"
                            label="Nachname*"
                            color="secondary"
                            class="q-mb-md"
                        />   
                    </div>                     
                </div>
                <div>
                    <div class="text-h6 q-px-lg">
                        Geburtsdaten (optional)
                    </div>
                </div>
                <div class="row">
                    <div class="col-6 q-px-lg">
                        <q-input 
                            v-model="currentReceiver!.dateOfBirth"
                            label="Geburtsdatum"
                            color="secondary"
                            class="q-mb-md"
                        />
                    </div>
                    <div class="col-6 q-px-lg">
                        <q-input 
                            v-model="currentReceiver!.placeOfBirth"
                            label="Geburtsort"
                            color="secondary"
                            class="q-mb-md"
                        />   
                    </div>
                </div>
                <div>
                    <div class="text-h6 q-px-lg">
                        Postanschrift
                    </div>
                    <div class="row">
                        <div class="col-6 q-px-lg">
                            <q-input 
                                v-model="currentReceiver!.addressStreet"
                                label="Straße und Hausnummer*"
                                color="secondary"
                                class="q-mb-md"
                            />
                        </div>
                        <div class="col-6 q-px-lg">
                            <q-input 
                                v-model="currentReceiver!.addressPostcode"
                                label="Postleitzahl*"
                                color="secondary"
                                class="q-mb-md"
                            />   
                        </div>
                        <div class="col-6 q-px-lg">
                            <q-input 
                                v-model="currentReceiver!.addressCity"
                                label="Stadt*"
                                color="secondary"
                                class="q-mb-md"
                            />   
                        </div>
                        <div class="col-6 q-px-lg">
                            <q-select
                                v-model="currentReceiver!.addressCountry"
                                :options="countriesValues"
                                option-label="name"
                                option-value="code"
                                label="Land"
                                color="secondary"
                                class="q-mb-md"
                            />   
                        </div>
                    </div>
                </div>
                <div>
                    <div class="text-h6 q-px-lg">
                        Kontaktinformationen (optional)
                    </div>
                    <div class="row">
                        <div class="col-6 q-px-lg">
                            <q-input 
                                v-model="currentReceiver!.phone"
                                label="Telefonnummer"
                                color="secondary"
                                class="q-mb-md"
                            />
                        </div>
                        <div class="col-6 q-px-lg">
                            <q-input 
                                v-model="currentReceiver!.email"
                                label="E-Mail Adresse"
                                color="secondary"
                                class="q-mb-md"
                            />   
                        </div>
                    </div>
                </div>
                <div class="text-caption q-px-lg">
                    * Pflichtfelder
                </div>
            </div>
            <div class="row q-pa-md justify-end">
                <q-btn 
                    label="Abbrechen" 
                    flat 
                    class="q-mr-md" 
                    @click="close()" 
                />
                <q-btn 
                    label="Empfänger hinzufügen" 
                    color="secondary" 
                    text-color="green-9"
                    @click="save()" 
                />
            </div>
          </q-card>
    </q-dialog>


</template>
<script lang="ts">

import { getAllCountriesWithNames } from 'src/pages/bulk_sending/util/receivers/countries';
import ReceiverRecord from 'src/pages/bulk_sending/util/receivers/receiverRecord';
import { defineComponent, PropType, ref } from 'vue';

export default defineComponent({
    name: 'AddReceiverModal',
    props: {
        modelValue: {
            type: Boolean,
            required: true,
        },
        initValue: {
            type: Object as PropType<ReceiverRecord>,
            required: false,
        }
    },
    emits: ['update:modelValue', 'close', 'save'],
    computed: {   
    value: {
      get() {
        return this.modelValue;
      },
      set(value : boolean) {
        this.$emit('update:modelValue', value);
      },
    },
  },
    methods: { 
        validateInput(): boolean {
            if(!this.currentReceiver) return false;
            const requiredFields = [
                this.currentReceiver.firstName,
                this.currentReceiver.lastName,
            ];
            return requiredFields.every(field => field && field.trim() !== '');
        },
        close() {            
            this.value = false;
            this.currentReceiver = JSON.parse(JSON.stringify(this.initValue))
            this.$emit('close');
        },
        save() {
            if (this.validateInput()) {
                this.$emit('save', this.currentReceiver);
                this.close();
            } else {
                this.$q.notify({
                    type: 'negative',
                    message: 'Bitte fülle alle Pflichtfelder aus.',
                    timeout: 3000
                });
            }
        }
    },
    mounted() {
        if(this.initValue){
            // deep copy to avoid mutating the parent component's data
            this.currentReceiver = JSON.parse(JSON.stringify(this.initValue));
        }else{
            this.currentReceiver = {
                firstName: '',
                lastName: '',
                dateOfBirth: '',
                placeOfBirth: '',
                addressStreet: '',
                addressPostcode: '',
                addressCity: '',
                addressCountry: 'DE',
                phone: '',
                email: ''
            };
        }
    },
    setup() {      
        const countriesValues = getAllCountriesWithNames("de");
        const currentReceiver = ref<ReceiverRecord>();

        return {
            countriesValues,
            currentReceiver
        };
    }
});

</script>