<template>
    <p-page class="wrapper">
        <!-- list with account und App einstellungen-->
         <h4 class="text-center">Einstellungen</h4>
         <q-list class="q-mt-md bg-fading rounded-borders q-pa-md">
            <q-item clickable @click="goTo('/settings/account')">
                <q-item-section avatar>
                    <q-icon name="account_circle" size="2.5rem" color="secondary" />
                </q-item-section>
                <q-item-section class="text-h6">Konto</q-item-section>
            </q-item>
            <q-item clickable @click="goTo('/settings/app')">
                <q-item-section avatar>
                    <q-icon name="settings" size="2.5rem" color="secondary" />
                </q-item-section>
                <q-item-section class="text-h6">App Einstellungen</q-item-section>
            </q-item>
        </q-list>
    </p-page>

</template>
<script lang="ts">
export default {
    name: 'SettingsPage',
    methods: {
        goTo (path: string) {
            void this.$router.push({ path });
        },
    },
};
</script>