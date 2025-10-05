<!-- eslint-disable @typescript-eslint/unbound-method -->
<!-- eslint-disable no-plusplus -->
<template>
    <q-page>
      <div class="row q-mb-xl">
        <div class="col-3">
          
        </div>
              
        <div class="col-9">
          <div class="text-center text-h4">
         {{ content?.meta.subject }}
      </div>
        </div>
      </div>
      <div class="row justify- q-col-gutter-lg">
      <div class="col-12 col-md-4 col-lg-3">
        <q-card class="no-shadow" bordered>
          <div v-if="isLoading" class="text-center q-pa-xl">
            <LoadingSpinner></LoadingSpinner>
          </div>
          <div v-else>
            <q-toolbar class="bg-dark text-white">
            <q-toolbar-title>{{content?.meta.subject}}</q-toolbar-title>
          </q-toolbar>
          <q-list>
            <q-item>
              <q-item-section>
                <q-item-label>{{$t('outbox_page.recipient')}}</q-item-label>
                <q-item-label caption>{{receiver}}</q-item-label>
              </q-item-section>
            </q-item>
              <q-item>
                <q-item-section>
                <q-item-label>{{$t('outbox_page.sent_at')}}</q-item-label>
                <q-item-label caption>{{getFormatedDate()}}</q-item-label>

              </q-item-section>
            </q-item>
            <q-item>
                <q-item-section>
                <q-item-label>{{$t('outbox_page.type')}}</q-item-label>
                <q-item-label caption>{{getDocumentType()}}</q-item-label>
              </q-item-section>
            </q-item>
          </q-list>
          <q-card-actions>
            <q-btn

              icon="cloud_download"
              @click="download()">
              <q-tooltip class="bg-secondary text-black">Download</q-tooltip>
            </q-btn>
            
          </q-card-actions>
          </div>

        </q-card>

        <q-card v-if="signatures" class="no-shadow q-mt-lg q-pa-md" bordered>
            <div class="text-center text-h6">{{ $t('inbox_page.signatures.title') }}</div>
              <div class="q-py-md"
              v-for="(embeddedSignature, index) in signatures?.embedded_signatures"
              :key="'embed-signature-'+index">

              <div class="row">
                <div class="col">Signaturfeld</div>
                <div class="col">{{embeddedSignature.field_name}}</div>
              </div>
              <hr/>
              <div class="row">
                <div class="col">Angefordert am</div>
                <div class="col">{{SignatureActionsParser.getRequestDate(embeddedSignature)}}</div>
              </div>
              <hr/>
              <div class="row">
                <div class="col">Status</div>
                <div class="col">
                  <q-badge
                :color="getSignatureBadgeBgColor(embeddedSignature)"
                :text-color="getSignatureBadgeTextColor(embeddedSignature)">
                {{SignatureActionsParser.getSignatureStatus(embeddedSignature)}}
                  </q-badge>

                </div>
              </div>
              <hr/>
              <div class="row">
                <div class="col">Unterschrieben am</div>
                <div class="col">{{SignatureActionsParser.getSigningDate(embeddedSignature)}}</div>
              </div>
              <hr/>
              <div class="row">
                <div class="col">An</div>
                <div class="col">
                  {{embeddedSignature.requested_to != myAccountId ? receiver: "mich"}}
                </div>
              </div>
              <hr/>
              <div class="row">
                <div class="col">Unterschriftsort</div>
                <div class="col">
                  {{SignatureActionsParser.getSignaturePlace(embeddedSignature)}}
                </div>
              </div>
              <hr/>
              <div class="row">
                <div class="col">Unterschrieben als</div>
                <div class="col">
                  {{SignatureActionsParser.getSignatureRoles(embeddedSignature)}}
                </div>
              </div>
              <hr/>
              <div class="row">
                <div class="col">
                  <q-btn v-if="embeddedSignature.value != null" :outline="true"
                    color="secondary"
                    style="width: 100%;"
                    @click="displaySignatureValue(embeddedSignature.value, embeddedSignature.id)">
                    {{ $t('inbox_page.signatures.display_signature') }}
                  </q-btn>
                  <q-btn v-else-if="embeddedSignature.requested_to == myAccountId"
                  :outline="false" color="secondary" text-color="black"
                  :disable="embeddedSignature.status === 'rejected'"
                  style="width: 100%;"
                  @click="openDocumentQrWindow()" >
                    {{ $t('inbox_page.signatures.create_signature') }}
                  </q-btn>
                </div>
              </div>
            </div>
        </q-card>
       

        <SignatureModal v-model="showDetails"
         @export-xml="downloadSignature"
        :account-id="myAccountId"
        :signature-id="shownSignatureId"
        :signatureValue="displayValue" />
      </div>

      <div class="col-12 col-md-8 col-lg-9">
 
        <DocumentView
          v-if="content != null"
          :content="content.content"
          />

     </div>
    </div>
    </q-page>
  </template>

<style lang="scss">
   .vue-pdf-embed > div{
    margin-bottom: 20px;
    border-radius: 15px;
    overflow: hidden
  }

  .vue-pdf-embed canvas {
    width: 100%;
    height: auto;
  }

  .breadcrum-item-hoverable{
    color: #c2c2c2;
    &:hover{
      cursor: pointer;
      text-decoration: underline;
    }
  }
</style>

<script lang="ts">

import { Ref, defineComponent, ref } from 'vue';
import { useRoute } from 'vue-router';
import Downloader from 'src/utils/downloader';

import dateFormat from 'dateformat';
import PdfBuilder from 'src/utils/pdfBuilder';


import SignatureModal from 'src/components/modals/SignatureModal.vue';

import { SignatureActionsParser } from 'src/services/helper/signatureActionsParser';

import DocumentView from 'src/components/ui-elements/DocumentView.vue'; 
import { useI18n } from 'vue-i18n';

import Brifle from 'src/services/node/Brifle';
import { useEncryptedStore } from 'src/stores/encrypted-store';
import { useSessionStore } from 'src/stores/session-store';
import { useBrifleStore } from 'src/stores/brifle-store';
import { ContentResponse, ContentActionsSignatureResponse, EmbbededSignatureResponse, Content } from '@brifle/brifle-sdk';
import SessionContext from 'src/utils/sessionContext';
import LoadingSpinner from 'src/components/LoadingSpinner.vue';



export default defineComponent({
  name: 'OutboxDetailsPage',
  components: { DocumentView, SignatureModal, LoadingSpinner },
  setup() {
    const route = useRoute();
    const myAccountId = ref('');
    const displayValue = ref('');
    const showDetails = ref(false);
    const isLoading = ref(true);
    const sender : Ref<string> = ref('');
    const receiver : Ref<string> = ref('');
    const content : Ref<ContentResponse | null> = ref(null);     
    
    const signatures: Ref<ContentActionsSignatureResponse | undefined> = ref(undefined);
    const showMyFoldersModal = ref(false);
    const backLink = route.query.back as string;
    const docId = route.params.id as string;
    const pdfRefreshCounter = ref(0);
    const currentFolderIds = ref<string[]>([]);
    const resizeTimer: Ref<number | null> = ref(null);
    const shownSignatureId = ref('');
    const showDocumentQrWindow = ref(false);
    const hasResponsiveContent = ref(false);
    const { t } = useI18n();
    const encryptedStore = useEncryptedStore();
    const sessionStore = useSessionStore();
    const brifleStore = useBrifleStore();
    const sessionContext = new SessionContext()
    return {
      route,
      content,
      isLoading,
      sender,
      receiver,
      signatures,
      myAccountId,
      displayValue,
      showDetails,
      SignatureActionsParser,
      shownSignatureId,
      showMyFoldersModal,
      backLink,
      docId,
      currentFolderIds,
      pdfRefreshCounter,
      resizeTimer,
      showDocumentQrWindow,
      hasResponsiveContent,
      encryptedStore,
      sessionStore,
      brifleStore,
      sessionContext,
      t,
    };
  },
  created() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    window.addEventListener('resize', this.onWindowResize);
  },
  unmounted() {
    // eslint-disable-next-line @typescript-eslint/unbound-method
    window.removeEventListener('resize', this.onWindowResize);
  },
  mounted() {
    void this.loadItem();
  },
  methods: {
    downloadSignature() {   
     
    },
    async loadItem(){
        this.isLoading = true;
    const apiId = await this.sessionContext.getCurrentApiId();

    void Brifle.content().contentGetContent(apiId, this.docId).then((response) => {
      if (response == null || response.data == null) {
        this.isLoading = false;
        return;
      }
      const res = response.data;
      this.content = res;
      if (res != null) {
        this.hasResponsiveContent = res.meta?.size_responsive != null
            && res.meta.size_responsive > 0;
        void Brifle.accounts().getById(apiId, res.meta.receiver as string).then((receiverRes) => {
          const receiver = receiverRes.data ?? null
          const privateNaame = receiver != null ? `${receiver.first_name} ${receiver.last_name}` : 'Unknow';
          const receiverName = receiver != null && receiver.type === 'private' ? privateNaame : receiver?.company_name;
          this.receiver = receiverName as string;
        }).finally(() => {
          void Brifle.content().contentGetContentActions(apiId, this.docId)
            .then((actionResponse) => {
              const actionRes = actionResponse.data;
              this.signatures = actionRes?.signatures;
            }).finally(() => {
                this.isLoading = false;
            });
        });
      } else {
        this.isLoading = false;
      }
    });
    },     
    onWindowResize() {
      if (this.resizeTimer != null) {
        window.clearTimeout(this.resizeTimer);
      }

      this.resizeTimer = window.setTimeout(() => {
        // requires two calls to reread the pdf
        this.pdfRefreshCounter += 1;
        window.setTimeout(() => {
          this.pdfRefreshCounter += 1;
        }, 50);
      }, 200);
    },
    getSignatureBadgeBgColor(embeddedSignature: EmbbededSignatureResponse) {
      if (embeddedSignature.status === 'rejected') {
        return 'red-2';
      }
      if (embeddedSignature.status === 'signed' || embeddedSignature.value != null) {
        return 'green-2';
      }
      return 'yellow-2';
    },
    openDocumentQrWindow() {
      this.showDocumentQrWindow = true;
    },
    getSignatureBadgeTextColor(embeddedSignature: EmbbededSignatureResponse) {
      if (embeddedSignature.status === 'rejected') {
        return 'red-9';
      }
      if (embeddedSignature.status === 'signed' || embeddedSignature.value != null) {
        return 'green-9';
      }
      return 'yellow-9';
    }, 
    openMyFoldersModal() {
      this.showMyFoldersModal = true;
    },
    buildPdfContent(content : Content) {
      if (content.type === 'application/pdf') {
        return PdfBuilder.buildPdfContent(content.content);
      }
      return content.content;
    },
    getFormatedDate() {
      return `${dateFormat(this.content?.meta.sent_date, 'dd.mm.yyyy HH:MM')} Uhr`;
    },    
    isInTrash() {
      return this.content?.meta.sender_state === 'trashed';
    },
    download() {
      this.content?.content.forEach((cont, index) => {
        if (cont.type === 'application/pdf') {
          const baseTitle = this.content?.meta.subject as string;
          const items = this.content == null ? 0 : this.content?.content.length;
          const title = items > 1 ? `${baseTitle}_${index}` : baseTitle;
          Downloader.downloadPdf(cont.content, title);
        }
      });
    },
    displaySignatureValue(xmlString: string, signatureId: string) {
      this.displayValue = xmlString;
      this.shownSignatureId = signatureId;
      this.showDetails = true;
    },
    getDocumentType() {
      if (this.content?.meta.type === 'letter') {
        this.$t('mail_type_letter');
      } if (this.content?.meta.type === 'invoice') {
        return this.$t('mail_type_invoice');
      } if (this.content?.meta.type === 'contract') {
        return this.$t('mail_type_contract');
      }
      return this.$t('mail_type_letter');
    },

    getBackLink() {
      if (this.backLink === undefined || this.backLink === null || this.backLink === '') {
        return '/outbox';
      }
      return this.backLink;
    },
  },
});
</script>
