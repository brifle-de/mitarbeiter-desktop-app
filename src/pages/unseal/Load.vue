<template>
     <div>
        <h4>Initialisiere Anwendung</h4>
    </div>
    <div class="bg-accent text-white text-subtitle1 q-pa-md q-mt-md">
        Die Anwendung ist versiegelt. Bitte gibt das vergebene Passwort ein, um die Anwendung zu entsperren.
    </div>
    <div class="q-mt-lg">
        <q-input v-model="password" filled 
        color="secondary"
        :type="isPwd ? 'password' : 'text'"  
        @keyup.enter="unsealApp()"
        label="Passwort">
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
        label="Entsiegeln"
        rounded
        text-color="black"        
        color="secondary"
        @click="unsealApp()"
    />
    </div>
</template>
<script lang="ts">

import { defineComponent, ref } from 'vue';
import { useEncryptedStore } from '@src/stores/encrypted-store';

export default defineComponent({
    name: 'UnsealInitPage',
    components: {
    },
    methods: {
        unsealApp () {
            this.encryptedStorage.loadData(this.password).then((res) => {
                console.log(res);
                void this.$router.push({ path: '/accounts' }); 
            }).catch((err: Error) => {
                console.error(err);
            });
        },
    },
    computed: {      
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