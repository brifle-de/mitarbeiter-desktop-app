<template>
  <q-page class="q-px-xl">
    <div class="col">
      <div class="row">
        <h3>{{ $t("outbox_page.title", "Postausgang") }}</h3>
      </div>
      <div class="row row q-mb-lg">
        <div class="col-12 col-md-8 q-pl-xl text-left">      
          
        </div>
      <div class="col-12 col-md-4">
        <q-input filled dark dense v-model="subject" color="secondary"
        v-on:keyup.enter="search()" input-class="text-left" class="q-ml-lg accent-bordered"
        >
        <template v-slot:prepend>
            <q-icon name="search" />
          </template>
          <template v-slot:append>
            <q-icon v-if="subject !== ''" name="clear" @click="subject = ''; search();"/>
          </template>
        </q-input>
      </div>

    </div>
    <q-separator />
      <div class="q-pt-xl">
        <div class="row q-col-gutter-lg">
          <div class="col-3">
            <div class="sticky-pagination">
              <div class="q-pb-lg">
               
              </div>

              <q-list padding class="rounded-borders">
                <q-item-label header>{{ $t('mail_type') }}</q-item-label>
                <q-item :active="documentType==='all'"
                @click="changeType('all')" clickable>{{ $t('mail_type_all') }}</q-item>
                <q-item :active="documentType==='letter'"
                @click="changeType('letter')" clickable>{{ $t('mail_type_letter') }}</q-item>
                <q-item :active="documentType==='invoice'"
                @click="changeType('invoice')" clickable>{{ $t('mail_type_invoice') }}</q-item>
                <q-item :active="documentType==='contract'"
                @click="changeType('contract')" clickable>{{ $t('mail_type_contract') }}</q-item>
              </q-list>
              <div class="q-pt-lg">
                <q-pagination
                v-model="page"
                class="justify-center accent-bordered accent-bordered-green bg-dark q-pa-sm"
                @update:model-value="loadPage();"
                :max="totalPages"
                direction-links
                color="primary"
                active-design="unelevated"
                active-text-color="black"
                active-color="secondary"
              />
              </div>
            </div>
          </div>
          <div class="col-9">
            <div v-if="isLoading">
                <div align="center">
                  <LoadingSpinner :spinnerValue="isLoading" />
                </div>
            </div>

            <div v-else>
              <q-list padding class="accent-bordered accent-bordered-green
              rounded-borders bg-dark q-pa-sm">
                <div v-if="values.length>0">
                  <OutboxItem :key="'element-'+item.id+'-'+index" v-for="(item, index) in values"
                  :subject="item.subject"
                  :receiver="getReceiverName(receivers.get(item.receiver))"
                  :mail-id="item.id"
                  :is-read="item.read"
                  @openMail="routeToItem"
                  :created-date="new Date(item.sent_date)"></OutboxItem>
                </div>
                <div v-else>
                  <div class="text-center">
                    <img src="~assets/no-results.png" height="300"/>
                  </div>
                  <q-item-label class="text-h6 text-center">Keine Dokumente gefunden</q-item-label>
                </div>

              </q-list>
            </div>

          </div>
        </div>
      </div>
    </div>
  </q-page>
</template>
<style lang="scss" scoped>
  .sticky-pagination{
    position: sticky;
    top: 75px;
  }
</style>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { AccountInfo, Meta, OutboxFilter } from '@brifle/brifle-sdk'
import Brifle from 'src/services/node/Brifle';
import { useRouter } from 'vue-router';
import OutboxItem from 'src/components/OutboxItem.vue';
import { useEncryptedStore } from 'src/stores/encrypted-store';
import { useSessionStore } from 'src/stores/session-store';
import { useBrifleStore } from 'src/stores/brifle-store';
import { ApiEndpoints } from 'app/src-electron/models/EncryptedStore';

export default defineComponent({
  name: 'OutboxPage',
  components: {
    OutboxItem,
  },
  setup() {
    const encryptedStore = useEncryptedStore();
    const sessionStore = useSessionStore();
    const accountId =  ref<string | null>(null);
    const apiKey = ref<string>('');
    const documentType = ref<string>('all');
    const currentTenant = ref<string>('default');
    const page = ref<number>(1);
    const values = ref<Meta[]>([]);
    const pageSize = ref<number>(25);
    const receivers = ref<Map<string, AccountInfo>>(new Map());
    const brifleStore = useBrifleStore();
    const total = ref<number>(0);
    const router = useRouter();
    return {
      subject: ref(''),
      viewType: ref('documents'),
      isLoading: ref(false),
      encryptedStore,
      sessionStore, 
        receivers,
      accountId,
      brifleStore,
        total,
      apiKey,
    documentType,currentTenant, page, values, pageSize,
    apiId: ref<string>(''),
    router,

    };
  },  

  mounted() {
    this.isLoading = true;
    this.accountId = this.sessionStore.getSelectedAccountId
    const account = this.encryptedStore.getAccount(this.accountId!)!;
    this.apiKey = this.encryptedStore.getAccount(this.accountId!)?.apiKey ?? '';
    this.currentTenant = this.encryptedStore.getAccount(this.accountId!)?.tenantId ?? '';

    void this.brifleStore.getApi(account.apiKey ?? '', ApiEndpoints.getEndpoint(account.apiEnv)).then(api => {
        if(api) {
            this.apiId = api;            
            void this.loadPage();        
        } else {
            this.apiKey = '';
        }
    });
    
 
    
    
  },
  computed: {
    totalPages(): number {
      return Math.ceil(this.total / this.pageSize);
    },
  },
  methods: {

   routeToItem(id: string) {     
      void this.router.push(`/outbox/${id}`);
    },

 async loadPage() {
      this.isLoading = true;
    
      const req : Filter = {
        state: ['active'],
        subject: this.subject,
       };
       
      if (this.documentType !== 'all') {
        req.type = this.documentType;
      }
      
      if (this.currentTenant != null) {
        void Brifle.mailbox().getOutbox(this.apiId, this.currentTenant, req, this.page)
          .then((res) => {            
            this.values = res.isSuccess ? res.data!.results : [];
            this.total = res.isSuccess ? res.data!.total : 0;
            const receiverIds: Set<string> = new Set(this.values.map((item) => item.receiver));
            let waitingFor = receiverIds.size;
            if (waitingFor === 0) {
              this.isLoading = false;
            }
            const receivers : Map<string, AccountInfo> = new Map();
            receiverIds.forEach((id) => {
              void Brifle.accounts().getById(this.apiId, id).then((receiver) => {
                if (receiver != null && receiver.isSuccess && receiver.data != null) {
                  receivers.set(id, receiver.data);
                }
                waitingFor -= 1;
                if (waitingFor === 0) {
                  this.isLoading = false;
                  receiverIds.forEach((receiverId) => {
                    if (receivers.has(receiverId) && receivers.get(receiverId) != null) {
                      this.receivers.set(receiverId, receivers.get(receiverId) as AccountInfo);
                    }
                  });
                }
              });
            });
          });
      } else {
        this.values = [];
        this.isLoading = false;
      }
    },

    search() {
        void this.loadPage();
    },   
   
    getReceiverName(receiver: AccountInfo | undefined) {
      if (receiver == null) {
        return 'Unbekannt';
      }
      if (receiver.type === 'private') {
        return `${receiver.first_name} ${receiver.last_name}`;
      }
      return `${receiver.company_name}`;
    },
    changeType(type: string) {
      this.documentType = type;
      this.page = 1;
      this.search();
    },
    changeTenant(id: string) {
      this.currentTenant = id;
      this.page = 1;
      this.search();
    },
  },
});


interface Filter extends OutboxFilter {
  type?: string;
  subject?: string;
}

</script>
