<template>   
    <q-btn
    @click="$router.push(to)"
    color="grey-9" 
    :fab-mini="true">
    <q-icon name="chevron_left" class="q-mr-sm" />
        <q-tooltip anchor="top middle" self="bottom middle" class="muted-tooltip">Zurück</q-tooltip>
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
