<template>
    <q-page class="wrapper">
      <div class="q-pa-md q-mb-lg">
          <div class="text-h4">Serienversand Übersicht</div>            
      </div>
      <q-separator />
      <div 
      @click="goToRoute('bulk_sending.custom')"
      class="material-card material-card-muted clickable q-my-md q-mt-lg q-py-md q-px-sm">
        <div class="row align-items-center items-center">
          <div class="col-12 col-md-3 text-center">
            <img src="~assets/img/letter.png" style="width: 100px; aspect-ratio: 1;"/>
          </div>
          <div class="col-12 col-md-9">
            <div class="q-pa-md">
              <div class="text-h5 q-mb-md">Individuell</div>
              <p class="text-muted">
                Senden Sie Dokumente an mehrere Empfänger gleichzeitig. Ideal für Briefe, Rechnungen oder Verträge, die nur einmalig oder unregelmäßig gesendet werden müssen.
              </p>
            </div>
          </div>
        </div>
      </div>
      <div 
      @click="goToRoute('bulk_sending.templates')"
      class="material-card material-card-muted clickable q-my-md q-py-md q-px-sm">
        <div class="row align-items-center items-center">
          <div class="col-12 col-md-3 text-center">
            <img src="~assets/img/letter_old.png" style="width: 100px; aspect-ratio: 1;"/>
          </div>
          <div class="col-12 col-md-9">
            <div class="q-pa-md">
              <div class="text-h5 q-mb-md">Vorlagen</div>
              <p class="text-muted">
                Senden Sie Dokumente an mehrere Empfänger gleichzeitig. Ideal für Briefe, Rechnungen oder Verträge, die regelmäßig gesendet werden. Sie können Vorlagen mit vordefinierten Dokumentenursprung und Empfängerkreis definieren und anschließend immer wieder verwenden.
              </p>
            </div>
          </div>
        </div>
      </div>
    </q-page>
</template>
<style lang="scss">
   
</style>
<script lang="ts">

import { defineComponent } from 'vue';



export default defineComponent({
    name: 'BulkSendingPage',
    components: {
    },
    mounted() {
     
    },
    methods: {
      goToRoute(routeName: string) {
        void this.$router.push({ name: routeName });
      },
    },
    setup () {      
        return {
          
        };
    },
    computed: {
              
    },
});


</script>