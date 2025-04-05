<template>   
    <q-btn icon="keyboard_arrow_left" 
    @click="$router.push(to)"
    color="grey-9" 
    :fab-mini="true">
        <q-tooltip>Zurück</q-tooltip>
    </q-btn>
</template>
<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'BackBtn',
    components: {
        
    },
    props: {
        to: {
            type: String,
            required: true,
        },
    },
    methods: {
        
    },
    setup () { 
        return { };
    },

});
</script>
