<template>
    <q-page class="wrapper">
        <div v-if="isInit">
                <load-page></load-page>
        </div>
        <div v-else>
                <init-page></init-page>
        </div>

    </q-page>
</template>
<script lang="ts">

import { defineComponent, ref } from 'vue';
import { useEncryptedStore } from 'src/stores/encrypted-store';
import InitPage from './Init.vue';
import LoadPage from './Load.vue';


export default defineComponent({
    name: 'UnsealPage',
    components: {
        InitPage,
        LoadPage,
    },
    methods: {
    },
    computed: {      
    },
    mounted() {
        this.encryptedStore.checkIfInitialized().then((res: boolean) => {
            this.isInit = res;
        }).catch(() => {
            this.isInit = true;
        });
    },
    setup () {
        const encryptedStore = useEncryptedStore();
        const isInit = ref<boolean>(true);
        return {
            encryptedStore,
            isInit,
        };
    },
});


</script>