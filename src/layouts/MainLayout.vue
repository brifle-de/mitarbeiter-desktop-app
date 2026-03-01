<template>
  <q-layout view="hhh LpR lFr">
    <q-header class="unselectable bg-titlebar titlebar">
        <q-toolbar class="q-ml-sm">     
          <div class="row w-100">
            <div class="col-3">
            
              
                <q-btn 
                    class="titlebar-button q-ml-sm"
                    flat
                    dense
                    round
                    color="green-3"
                    @click="$router.back()"
                    icon="chevron_left" >
                    <q-tooltip :delay="1000">Zurück</q-tooltip>
                </q-btn>    
               </div>
              <div class="col row"> 
                <q-btn 
                    class="titlebar-button q-mr-sm"
                    flat
                    dense
                    round
                    color="green-3"
                    @click="$router.push('/')"
                    icon="home" >
                    <q-tooltip :delay="1000">Startseite</q-tooltip>
                </q-btn>
                <RoutesSearchbar class="no-drag" />
              </div>
              <div class="col-3">

              </div>
            
            </div>
        </q-toolbar>
      </q-header>  
    <div class="titlebar-placeholder"></div>

    <q-drawer
       class="non-selectable main-menu-drawer column no-wrap q-pa-md "
       c
      show-if-above
      :model-value="true"
      :width="300"
      :breakpoint="500"
    >
    <div class="flex-1 column justify-between main-menu-drawer-content">
      <div>      
        <q-list class="q-pa-sm mainMenuList">
          <EssentialLink
            v-for="link in essentialLinks"
            :key="link.title"
            v-bind="link"
            :title="$t(link.title)"
          />

        </q-list>
      </div>
      <div class="q-pa-sm text-center">
        <div class="q-my-sm">
          <q-btn flat class="muted-action-btn" @click="sealApplication()">
            <q-icon name="logout" class="q-mr-sm" />
            Sperren
          </q-btn>
        </div>
        <div class="app-version-text">Version: {{ appVersion }}</div>
      </div> 
      </div>
    
    
    </q-drawer>

    <q-page-container class="main-container unselectable">
      <div class="q-pa-md">
        <router-view />
      </div>
    </q-page-container>
  </q-layout>
</template>

<style lang="scss">



.sticky-color-toolbar {
  background-color: #212321;
  transition: background-color 0.35s;
}
.sticky-color-toolbar.sticky {
  border-bottom: 1px solid #213021;
  background-color: #293029;
}

.mainMenuList{
  a {
    border-radius: 15px;
    margin-top: 3px;
    margin-bottom: 3px;

    &.q-router-link--active {
      background-color: rgba(62, 110, 71, 0.266);
    }

  }
}

.app-version-text{
  text-align: center;
  font-size: 0.8em;
  color: #eeea;
}

.profile-dropdown-menu{
  margin-top: 10px !important;
}

</style>

<script lang="ts">
import { Ref, defineComponent, ref } from 'vue';
import EssentialLink from 'components/EssentialLink.vue';
import { useRouter } from 'vue-router';
import { useEncryptedStore } from 'src/stores/encrypted-store';
import RoutesSearchbar from 'components/RoutesSearchbar.vue';

import hotkeys from 'hotkeys-js';




export default defineComponent({
  name: 'MainLayout',
  components: {
    EssentialLink, RoutesSearchbar
  },
  emits: ['seal-app'],
  unmounted() {
   
  },
  mounted() {
     // register hotkey for new document
    hotkeys('ctrl+n,cmd+n', (event) => {
      event.preventDefault();
      this.goToSingleSend();
    }); 
    // register hotkey for new bulk send
    hotkeys('ctrl+shift+n,cmd+shift+n', (event) => {
      event.preventDefault();
      this.goToBulkSend();
    });
 
  },
  methods: {
    goToSingleSend() {
      void this.router.push('/outbox/send');
    },
    goToBulkSend() {
      void this.router.push('/bulk_sending');
    },
    sealApplication() {
      this.$emit('seal-app');
      this.encryptedStore.sealData();
      void this.router.push("/unseal")
      .catch((err) => {
        console.error('Router push error on seal:', err);
      });
    },
    checkStickyColor() {
      const toolbar = document.querySelector('.sticky-color-toolbar');
      if (toolbar) {
        if (window.scrollY > 0) {
          toolbar.classList.add('sticky');
        } else {
          toolbar.classList.remove('sticky');
        }
      }
    },
   
  },
  setup() {
    const router = useRouter();  
    const menuLinks: Ref<Array<{title: string, icon: string, link: string}>> = ref([]);

    const appVersion = ref<string>("");
  

    menuLinks.value = [
        {
          title: 'menu.home',
          icon: 'dashboard',
          link: '/',
        },
        {
          title: 'menu.outbox',
          icon: 'markunread_mailbox',
          link: '/outbox',
        },
        {
          title: 'menu.bulk_sending',
          icon: 'markunread_mailbox',
          link: '/bulk_sending',
        },
        {
          title: 'menu.settings',
          icon: 'settings',
          link: '/settings',
        },
       
      ];
 
    const encryptedStore = useEncryptedStore();

    void window.electronApi.getAppVersion().then((version: string) => {
      appVersion.value = version;
    });

    return {
      essentialLinks: menuLinks,
      miniState: ref(true),
      router,
      appVersion,
      encryptedStore,
    };
  },
});
</script>