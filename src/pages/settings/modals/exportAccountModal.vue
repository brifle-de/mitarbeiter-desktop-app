<template>
   <div>
     <q-dialog 
    class="unselectable"
    v-model="value">
    <q-card>
         <q-card-section class="row items-center q-pb-none">
          <div class="text-h6 q-px-md">Account Backup Erstellen</div>
          <q-space />
          <q-btn icon="close" flat round dense v-close-popup @click="close()" />
        </q-card-section>
        <q-card-section>
            <q-banner rounded class="bg-accent text-white q-mb-md">
                <p>Der aktuelle Account wird als Backup-Datei gespeichert. Hierfür wird ein Passwort für die Verschlüsselung benötigt. Für das Wiederherstellen des Backups wird dieses Passwort benötigt. Bitte wähle ein sicheres Passwort. Ein schwaches Passwort eröffnet eine Sicherheitslücke. Beachte, dass das Passwort für den Export nicht geändert werden kann.</p>
                <p>Sollte eine Backup-Datei geleaked oder verloren gehen, wird empfohlen neue Credentials wie API Schlüssel zu generieren.</p>
            </q-banner>
            <q-input 
                        v-model="password"
                        type="password"
                        color="secondary"
                        label="Wähle ein Passwort für das Backup"
                        :rules="[val => val && val.length > 0 || 'Password darf nicht leer sein']"
                    />
        </q-card-section>
        <q-card-section>            
            <q-btn flat label="Abbrechen" @click="close()" />
            <q-btn 
                color="secondary"
                text-color="black" 
                label="Backup erstellen" 
                @click="exportData()"
                class="q-ml-md"
                :disable="!password || password.length === 0"
            />
        </q-card-section>
      </q-card>
            
    </q-dialog>
   </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';

export default defineComponent({
  name: 'ExportAccountModal',
    props: {
        modelValue: {
            type: Boolean,
            required: true,
        },
    },
    methods: {
        close() {            
            this.value = false;
        },
        exportData() {
            this.$emit('export', {password: this.password});
            this.close();
        },
    },
    emits: ['update:modelValue', 'export'],
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
  setup() {
    const password = ref('');
    return {
      password,
    };
  },
});
</script>
<style scoped>
</style>