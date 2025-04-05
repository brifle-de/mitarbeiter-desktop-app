<template>
    <div>
        <h4>Initialisiere Anwendung</h4>
    </div>
    <div class="bg-accent text-white text-subtitle1 q-pa-md q-mt-md">
        Die Anwendung ist noch nicht initialisiert. Bitte vergeben sie ein Passwort. Dieses kann nicht zurückgesetzt werden und wird zur 
        Verschlüsselung ihrer Daten verwendet.
    </div>
    <div class="q-mt-lg">
        <q-input v-model="password" filled 
        color="secondary"
        :type="isPwd ? 'password' : 'text'" 
        label="Passwort"
        hint="Passwort muss mindestens 12 Zeichen lang sein">
        <template v-slot:append>
          <q-icon
            :name="isPwd ? 'visibility_off' : 'visibility'"
            class="cursor-pointer"
            @click="isPwd = !isPwd"
          />
        </template>
      </q-input> 
    </div>
    <div class="text-right">
        <q-btn
        class="q-mt-lg q-px-md text-subtitle1"
        label="Initialisieren"
        rounded
        text-color="black"        
        :disable="!validPassword"
        color="secondary"
        @click="initApp()"
    />
    </div>
</template>
<script lang="ts">

import { defineComponent, ref } from 'vue';
import {useEncryptedStore} from '@src/stores/encrypted-store';

export default defineComponent({
    name: 'UnsealInitPage',
    components: {
    },
    methods: {
        initApp () {
            this.encryptedStorage.init(this.password).then(() => {
                void this.$router.push({ path: '/accounts' });
            }).catch((err: Error) => {
                console.error(err);
            });
        },
    },
    computed: {      
        validPassword() {
            return this.password.length >= 12;
        },
    },
    mounted() {
       
    },
    setup () {
        const password = ref<string>('');
        const isPwd = ref<boolean>(true);
        const encryptedStorage = useEncryptedStore();
        return {
            password,
            isPwd,
            encryptedStorage,
        };
    },
});

</script>