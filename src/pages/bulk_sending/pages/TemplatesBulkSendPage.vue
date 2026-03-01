<template>
 <q-page class="wrapper">
        <div class="q-py-lg">
            <div class="text-h4">Vorlagen</div>            
        </div>
        <q-separator />
        <div class="q-py-lg text-right">         
            <q-btn flat color="secondary" class="muted-action-btn q-ml-sm" @click="newTemplate()">
                <q-icon name="add" class="q-mr-sm" />
                <span> 
                    Hinzufügen
                </span>
            </q-btn>
            
        </div>
        <div>
          <q-table
            :columns="columns"
            :rows="templateMeta"
            flat 
            class="material-card material-card-muted rounded-borders"
            row-key="id"
            :loading="isLoading"
          >
            <template v-slot:body-cell-createdAt="props">
              <q-td :props="props">
                {{ new Date(props.row.createdAt).toLocaleString() }}
              </q-td>
            </template>
            <template v-slot:body-cell-subjects="props">
              <q-td :props="props">
                <!-- grid 2 x 2-->
                <div class="q-grid q-gutter-sm">
                  <div class="muted-pill dense flex-inline-row items-center">                      
                      <div :class="'muted-pill dense text-caption q-mr-sm q-my-xs ' + (pillColors['default'] || '')">
                        Standard
                      </div>
                      <div>
                        {{props.row.subjects.default}}
                      </div>
                  </div>
                    <div class="muted-pill dense flex-inline-row items-center" v-for="(subject, index) in Object.keys(props.row.subjects.docTypes)" :key="index">                      
                      <div :class="'muted-pill dense text-caption q-mr-sm q-my-xs ' + (pillColors[subject] || '')">
                        {{ subject}}
                      </div>
                      <div>
                        {{ props.row.subjects.docTypes[subject] }}
                      </div>
                    </div>
                </div>
              </q-td>
            </template>
            <template v-slot:body-cell-nonBrifleAction="props">
              <q-td :props="props">
                {{ getExternalReceiverActionText(props.row.nonExistingReceiverAction.action) }}
              </q-td>
            </template>
            <template v-slot:body-cell-actions="props">
              <q-td :props="props">
                <q-btn 
                  flat 
                  class="muted-action-btn"
                  @click="goTo({ name: 'bulk_sending.edit_template', params: { id: props.row.id }})"
                  color="secondary">
                <q-icon name="edit" class="q-mr-sm" />
                <q-tooltip anchor="top middle" self="bottom middle" class="muted-tooltip">
                    Vorlage bearbeiten
                  </q-tooltip>
                </q-btn>
                <!-- start -->
                <q-btn 
                  flat 
                  class="muted-action-btn q-ml-sm"
                  @click="startProcess(props.row.id)"
                  color="orange">
                  <q-tooltip anchor="top middle" self="bottom middle" class="muted-tooltip">
                    Vorlage verwenden
                  </q-tooltip>
                <q-icon name="play_arrow" class="q-mr-sm" />
                </q-btn> 
              </q-td>
            </template>
          </q-table>


        </div>
    </q-page>
</template>
<script lang="ts">
import { BulkSendTemplate } from 'app/src-electron/service/send_templates/templates/template';
import SendTemplate from 'src/services/node/SendTemplate';
import { defineComponent, ref } from 'vue';
import { computePillColors } from '../util/helper';

export default defineComponent({
  name: 'TemplatesBulkSendPage',
  components: {
    
  },
  computed: {
    columns () {
        // id, name, non_brifle_action, createdAt, subjects
        return [
          { name: 'actions', label: 'Aktionen', field: 'actions', align: 'center' as const },
            { name: 'name', label: 'Name', field: 'name', sortable: true, align: 'left' as const },
            { name: 'subjects', label: 'Betreffzeilen', field: 'subjects', align: 'left' as const },
            { name: 'createdAt', label: 'Erstellt am', field: 'createdAt', sortable: true, align: 'left' as const },
            { name: 'nonBrifleAction', label: 'Aktion Externe Empfänger', field: 'nonExistingReceiverAction.action', align: 'left' as const },
            
        ]
    }
  },
  methods: {   
    goTo(route: { name: string, params?: Record<string, string> }) {
      void this.$router.push(route);
    },
    startProcess(templateId: string) {
      void this.$router.push({ name: 'bulk_sending.start', params: { templateId } });
    },
    newTemplate() {
      void this.$router.push({ name: 'bulk_sending.create_template' });
    },
    getExternalReceiverActionText(action: string) {
      switch (action) {
        case 'paper_mail':
        case 'papermail':
          return 'Per Post versenden';
        case 'skip':
        case 'ignore':
          return 'Empfänger überspringen';
      }
      return action;
    },
    async loadTemplates() {
      this.isLoading = true;
      await this.sendTemplateService.getAllTemplates().then((templates) => {
        this.templateMeta = templates;
        const allDocTypes = templates.flatMap(t => Object.keys(t.subjects.docTypes));
        const pillColorsObjs = allDocTypes.map(docType => ({ docType: docType}));
        pillColorsObjs.push({ docType: 'default' });
        this.pillColors = computePillColors(pillColorsObjs);
      }).finally(() => {
        this.isLoading = false;
      });
    },
  },
  mounted() {
    void this.loadTemplates();
  },
  setup() {    
      const templateMeta = ref<BulkSendTemplate[]>([]);
      const sendTemplateService = new SendTemplate();
      const pillColors = ref<Record<string, string>>({});
      const isLoading = ref(false);
      return { templateMeta, sendTemplateService, isLoading, pillColors };
  }
});
</script>