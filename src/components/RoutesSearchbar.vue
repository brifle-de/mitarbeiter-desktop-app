<template>
  <div class="search-container flex-1">
    <div class="row q-pa-xs searchbar w-100" @click="showSearch()">
        <div class="flex-1">
            <span class="searchbar-text">Suche nach Seite</span>
        </div>
        <div class="q-mr-md shortcut-hint">
            <span>Strg + K</span>
        </div>
    </div>
    <q-dialog v-model="showSearchModal">
        <div class="search-modal-content material-card material-card-filled">
           <q-input 
                ref="searchBarInput"
                v-model="query" 
                label="Suche nach Seite"                  
                clearable 
                input-class="search-input-text"
                standout="standout-input  text-secondary" 
                color="secondary"
                
                class="q-mb-md search-input"> 
            </q-input> 
            <div class="q-pa-md search-results">
            <div v-for="route in filteredRoutes" :key="route.path + '_'+query" @click="goToRoute(route)" class="search-result-item">
              
              <div class="text-h6">
                    {{ route.meta?.title || route.name }}
                </div>
                <div class="text-muted">
                    {{  route.meta?.description || route.path }}

                </div>
            </div>
            </div>
        </div>
    </q-dialog>
  </div>
</template>
<style lang="scss" scoped>
.search-results{
    overflow: auto;
}
.search-modal-content{
    min-height: 350px;
    min-width: 700px;
    max-width: 70vw;
    height: 500px;
    max-height: 55vh;
    display: flex;
    flex-direction: column;
}

.search-input-text{
    color: red;
}

.search-input{
    background-color: transparent;
    border: none;
    outline: none;

   
    
    .q-field__control{
        padding: 0;
        &::before, &::after{
            border: none;
        }
    }
   
}

 .search-result-item{
    padding: 10px;
    border-radius: 10px;
    cursor: pointer;
    &:hover{
        background-color: rgba(52, 81, 58, 0.266);

        .text-h6 {
            color: #acd586;
        }

    }
}
.searchbar{
    cursor: pointer;
    user-select: none;
    border-radius: 15px;
    padding-left: 20px;
    background-color: rgba(74, 88, 77, 0.266);
    align-items: stretch;

   

    .searchbar-text{
        color: rgba(255,255,255,0.5);
    }
    
    &:hover{
        background-color: rgba(62, 110, 71, 0.266);
    }
    .shortcut-hint{        
        color: rgba(255,255,255,0.5);
        padding-left: 10px;
        border-left: 1px solid rgba(255, 255, 255, 0.147);
        span {
            font-size: 0.8em;
        }
    }
}

</style>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { searchRoutes } from 'src/router/routes';
import { RouteRecordRaw } from 'vue-router';
import hotkeys from 'hotkeys-js';

export default defineComponent({
  name: 'RoutesSearchbar',
  computed: {
    filteredRoutes(): RouteRecordRaw[] {   
      const lowerQuery = this.query.toLowerCase();
      const res = searchRoutes(lowerQuery);
      console.log('Filtered routes:', res, 'for query:', lowerQuery);
      return res; 
    },
  },
  methods: {
    goToRoute(route: RouteRecordRaw) {
      void this.$router.push({ name: route.name });
      this.query = '';
      this.showSearchModal = false;
    },
    showSearch() {
      this.showSearchModal = true;     
      // Focus the input after the modal is shown
      // wait for 5ms to prevent potential timing issues with the dialog rendering
        setTimeout(() => {
            this.focusSearchInput();
        }, 5);
    },
    toogleSearch() {
      this.showSearchModal = !this.showSearchModal;
      if (this.showSearchModal) {
        // Focus the input after the modal is shown
        // wait for 5ms to prevent potential timing issues with the dialog rendering
        setTimeout(() => {
            this.focusSearchInput();
        }, 5);
      }
    },
    focusSearchInput() {
      void this.$nextTick(() => {
        const inputElement = this.$refs.searchBarInput as HTMLInputElement | null;
        inputElement?.focus();
      });
    }
  },
  mounted() {
    hotkeys('ctrl+k,cmd+k', (event) => {
      event.preventDefault();
      this.toogleSearch(); 
    });
  },
  setup() {
    const query = ref('');
    const showSearchModal = ref(false);
    const searchBarInput = ref<HTMLInputElement | null>(null);
    return {
      query,
      showSearchModal,
      searchBarInput,

    };
  },
});

</script>