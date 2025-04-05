<template>
    <q-layout view="hhh LpR lfr">
      <q-header class="unselectable bg-titlebar titlebar">
        <q-toolbar>         
          
        </q-toolbar>
      </q-header>  
      <div class="titlebar-placeholder"></div>
  
      <q-page-container class="unselectable main-container">        
        <router-view />
      </q-page-container>
    </q-layout>
  </template>
  
  <script lang="ts">
  import { defineComponent } from 'vue';
  
  
  export default defineComponent({
    name: 'SimpleLayout',
  
    components: {
   
    },  
    setup () {
      // get current route and query params
  
      return {        
      };
    }
  });
  </script>
  