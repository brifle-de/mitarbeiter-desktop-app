<template>
  <q-layout view="hhh LpR lFr">
    <q-header class="unselectable bg-titlebar titlebar">
        <q-toolbar class="q-ml-sm">          
          <q-btn 
                class="titlebar-button"
                flat
                dense
                round
                color="green-3"
                @click="$router.push('/')"
                icon="home" >
                <b-tooltip
                    text="Startseite"
                />
            </q-btn>
        </q-toolbar>
      </q-header>  
    <div class="titlebar-placeholder"></div>

    <q-drawer
       class="non-selectable column justify-between no-wrap"
      show-if-above
      :model-value="true"
      :width="250"
      :breakpoint="500"
      bordered
    >
    <div class="">
     
      <q-list class="q-pa-sm mainMenuList">
        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
          :title="$t(link.title)"
        />

      </q-list>
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

.profile-dropdown-menu{
  margin-top: 10px !important;
}

</style>

<script lang="ts">
import { Ref, defineComponent, ref } from 'vue';
import EssentialLink from 'components/EssentialLink.vue';
import { useRouter } from 'vue-router';


export default defineComponent({
  name: 'MainLayout',
  components: {
    EssentialLink,
  },
  unmounted() {
   
  },
  mounted() {
    
  },
  methods: {
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
    const showRefreshLogin = ref(false);
  

    menuLinks.value = [
        {
          title: 'menu.home',
          icon: 'dashboard',
          link: '/',
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
  
 



    return {
      essentialLinks: menuLinks,
      miniState: ref(true),
      showRefreshLogin,
      router,
    };
  },
});
</script>