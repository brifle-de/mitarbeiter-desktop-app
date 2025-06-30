<template>

        <q-dialog v-model="value" class="signature-modal" >
          <q-card class="no-shadow"  style="height: 90%; width: 100%;">
            <q-card-section class="row items-center q-pb-none">
              <div class="text-h6">{{$t("signature_details_modal.title")}}</div>
              <div class="q-mx-lg">
              <q-btn color="purple-4" outline @click="downloadSignature()">
                <q-icon name="download" />
              </q-btn>
              </div>
              <q-space />
              <q-btn icon="close" flat round dense v-close-popup />
            </q-card-section>

            <q-card-section>
              <q-tabs
                  v-model="tab"
                  inline-label
                  class="text-white"
                  active-color="secondary"
                  indicator-color="secondary"
                  align="justify"
                  narrow-indicator
                >
                  <q-tab name="visual" icon="visibility"
                  :label="$t('signature_details_modal.visual')" />
                  <q-tab name="tech" icon="code"
                  :label="$t('signature_details_modal.technical')" />
                </q-tabs>
                <q-tab-panels v-model="tab" animated>
                  <q-tab-panel name="visual" class="visual-tab">
                    <div class="text-h6">{{$t("signature_details_modal.metadata")}}</div>
                    <div class="row">
                      <div class="col">{{$t("signature_details_modal.version")}}</div>
                      <div class="col">{{ xmlDoc?.meta.version  }}</div>
                    </div>
                    <hr>
                    <div class="row">
                      <div class="col">{{$t("signature_details_modal.base_url")}}</div>
                      <div class="col">{{ xmlDoc?.meta.baseUrl  }}</div>
                    </div>
                    <div class="text-h6">{{$t("signature_details_modal.info")}}</div>
                    <div class="row">
                      <div class="col">{{$t("signature_details_modal.canonicalization")}}</div>
                      <div class="col">
                        {{ xmlDoc?.signature.signedInfo.canonicalizationMethod  }}
                      </div>
                    </div>
                    <hr>
                    <div class="row">
                      <div class="col">{{$t("signature_details_modal.signature_method")}}</div>
                      <div class="col">
                        {{ xmlDoc?.signature.signedInfo.signatureMethod  }}
                      </div>
                    </div>
                    <hr>
                    <div v-for="(reference, index) in xmlDoc?.signature.signedInfo.reference"
                        :key="reference.id+'-ref'">
                          <div class="text-h6">Reference {{ index+1 }}</div>
                          <div class="row">
                            <div class="col">{{$t("signature_details_modal.uri")}}</div>
                            <div class="col">{{ reference.uri }}</div>
                          </div>
                          <hr>
                          <div class="row">
                            <div class="col">{{$t("signature_details_modal.transformations")}}</div>
                            <div class="col">{{ reference.transforms }}</div>
                          </div>
                          <hr>
                          <div class="row">
                            <div class="col">{{$t("signature_details_modal.digest_method")}}</div>
                            <div class="col">{{ reference.digestMethod }}</div>
                          </div>
                          <hr>
                          <div class="row">
                            <div class="col">{{$t("signature_details_modal.digest_value")}}</div>
                            <div class="col">{{ reference.digestValue }}</div>
                          </div>
                        </div>
                        <div class="text-h6">{{$t("signature_details_modal.properties")}}</div>
                        <div class="row">
                          <div class="col">{{$t("signature_details_modal.timestamp")}}</div>
                          <div class="col">
                            {{ getSignatureProperties()?.signedSignatureProperties.signingTime }}
                          </div>
                        </div>
                        <hr>
                        <div class="row">
                          <div class="col">{{$t("signature_details_modal.claimed_roles")}}</div>
                          <div class="col">
                            {{ getSignatureProperties()?.signedSignatureProperties
                            .signerRole.claimedRoles.map((role) => role.claimedRole).join(', ') }}
                          </div>
                        </div>
                        <hr>
                        <div class="row">
                          <div class="col">{{$t("signature_details_modal.certified_roles")}}</div>
                          <div class="col">
                            {{ getSignatureProperties()?.signedSignatureProperties
                            .signerRole.certifiedRoles.map((r) => r.certifiedRole).join(', ') }}
                          </div>
                        </div>
                        <hr>
                        <div class="row">
                          <div class="col">
                            {{$t("signature_details_modal.certificate_issuer")}}
                          </div>
                          <div class="col">
                            {{ getSignatureProperties()?.signedSignatureProperties
                            .signingCertificate.cert.issuerSerial.x509IssuerName }}
                          </div>
                        </div>
                        <hr>
                        <div class="row">
                          <div class="col">
                            {{$t("signature_details_modal.location")}}
                          </div>
                          <div class="col">
                            {{ getSignatureProperties()?.signedSignatureProperties
                            .signatureProductionPlace.city }}
                            (
                              {{ getSignatureProperties()?.signedSignatureProperties
                                  .signatureProductionPlace.countryName }}
                            )
                          </div>
                        </div>
                        <div class="text-h6">{{$t("signature_details_modal.signature")}}</div>
                        <div class="row">
                          <div class="col">
                            {{$t("signature_details_modal.signauture_value")}}
                          </div>
                          <div class="col">{{ xmlDoc?.signature.signatureValue }}</div>
                        </div>
                  </q-tab-panel>

                  <q-tab-panel name="tech">
                    {{signatureValue}}
                  </q-tab-panel>
                </q-tab-panels>

            </q-card-section>
          </q-card>
        </q-dialog>

    </template>

<style lang="scss" scoped>
.visual-tab .col{
  text-wrap: auto;
  line-break: anywhere;
}
.signature-modal{
  .q-card {
    max-width: 1200px;
    max-height: 90vh;
    overflow-y: auto;
  }
}
</style>
<script lang="ts">

import {
  defineComponent, Ref, ref, watch,
} from 'vue';
import { ParsedXmlSignature, XmlSignatureParser } from 'src/services/helper/xmlSignature';

export default defineComponent({
  name: 'SignatureModal',
  emits: ['update:modelValue', 'close', 'exportXml'],
  computed: {
    value: {
      get() {
        return this.modelValue;
      },
      set(value : boolean) {
        this.$emit('update:modelValue', value);
      },

    },
  },
  props: {
    modelValue: {
      type: Boolean,
      required: true,
    },
    signatureValue: {
      type: String,
      required: true,
    },
    signatureId: {
      type: String,
      required: true,
    },
    accountId: {
      type: String,
    },
  },

  setup(props) {
    const tab = ref('visual');
    const xmlDoc: Ref<ParsedXmlSignature |null> = ref(null);

    // watch the signatureValue prop
    watch(
      () => props.signatureValue,
      (newValue) => {
        xmlDoc.value = XmlSignatureParser.parseXmlSignature(newValue);
      },
    );

    return { tab, xmlDoc };
  },
  methods: {
    downloadSignature() {
      this.$emit('exportXml', this.signatureId);
    },
    getSignatureProperties() {
      return this.xmlDoc?.signature.object.qualifyingProperties.signedProperties;
    },
    close() {
      this.value = false;
      this.$emit('close');
    },
  },

});
</script>
