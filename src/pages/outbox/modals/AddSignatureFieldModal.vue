<template>
    <q-dialog v-model="value" class="full-size-modal" > 
          <q-card class="no-shadow unselectable">
            <div class="row w-100">
                <div class="col-2">
                    <!-- back btn --> 
                     
                </div>
                <div class="col text-center">
                    <div class="text-h6 q-pa-md">
                        Signaturfeld hinzufügen
                    </div>
                </div>
                <div class="col-2 text-right">
                    <q-btn icon="close" flat round dense class="q-mr-md q-mt-md" @click="close()" />
                </div>
            </div>
            <div class="q-pa-md flex-1">
               
                <div class="text-h6 q-px-lg q-mt-md">
                    Informationen zum Signaturfeld
                </div>
                <!-- name -->
                <q-input 
                    v-model="currentSignatureField!.fieldName"
                    label="Feldname*"
                    color="secondary"
                    class="q-mb-md q-px-lg"
                />
                <!-- purpose -->
                <q-input 
                    v-model="currentSignatureField!.purpose"
                    label="Zweck*"
                    color="secondary"
                    class="q-mb-md q-px-lg"
                />
                <!-- role -->
                <q-input 
                    v-model="currentSignatureField!.role"
                    label="Rolle* (z.B. Unterzeichner, Vertragsnehmer, etc.)"
                    color="secondary"
                    class="q-mb-md q-px-lg"
                />
                <!-- signing party -->
                <div class="q-px-lg q-mt-md">
                    <div class="text-subtitle1 q-mb-sm">Wer soll dieses Feld unterschreiben?</div>
                    <q-option-group
                        v-model="currentSignatureField!.signingParty"
                        :options="[
                            { label: 'Empfänger', value: 'receiver' },
                            { label: 'Absender', value: 'sender' }
                        ]"
                        color="secondary"
                    />
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
                    label="Signaturfeld hinzufügen" 
                    color="secondary" 
                    text-color="green-9"
                    @click="save()" 
                />
            </div>
          </q-card>
    </q-dialog>


</template>
<script lang="ts">
import { defineComponent, PropType, ref } from 'vue';


export interface SignatureRecord {
    purpose: string;
    fieldName: string;
    role: string;
    signingParty?: 'sender' | 'receiver';
}

export default defineComponent({
    name: 'AddSignatureFieldModal',
    props: {
        modelValue: {
            type: Boolean,
            required: true,
        },
        initValue: {
            type: Object as PropType<SignatureRecord>,
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
            if(!this.currentSignatureField) return false;
            const requiredFields = [
                this.currentSignatureField.purpose,
                this.currentSignatureField.fieldName,
                this.currentSignatureField.role
            ];
            return requiredFields.every(field => field && field.trim() !== '');
        },
        close() {            
            this.value = false;
            this.reset();
            this.$emit('close');
        },
        reset(){
            if(this.initValue){
            // deep copy to avoid mutating the parent component's data
            this.currentSignatureField = JSON.parse(JSON.stringify(this.initValue));
            }else{
                this.currentSignatureField = {
                    purpose: '',
                    fieldName: '',
                    role: '',
                    signingParty: 'receiver'
                };
            }
        },
        save() {
            if (this.validateInput()) {

                // deep copy value
                const val = JSON.parse(JSON.stringify(this.currentSignatureField));
             
                
                this.$emit('save', val);
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
        this.reset();
    },
    setup() {      
        const currentSignatureField = ref<SignatureRecord>();

        return {
            currentSignatureField
        };
    }
});

</script>