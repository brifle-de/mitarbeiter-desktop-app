<template>
    <q-item
      clickable
      @click="openMail()"
      tag="a"
      :class="(markSelected ? 'selected q-pa-none outbox_item' : 'q-pa-none outbox_item')"
    >

    <q-item-section avatar top class="q-pa-sm">
                  <q-avatar color="primary" text-color="white">{{getAcronym(receiver)}}</q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label lines="1">{{subject}}</q-item-label>
                  <q-item-label caption>
                    {{ receiver }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side class="q-pa-sm q-pr-lg q-mr-sm" style="align-items: center;">
                  <q-icon
                    :name="isRead?'mark_email_read':'mark_email_unread'"
                    :color="!isRead?'secondary': 'white'" />
                    <q-item-label caption>
                    {{ formatDate(createdDate) }}
                  </q-item-label>
                </q-item-section>
    </q-item>
  </template>

  <style lang="scss">

.outbox_item {
    border-radius: 10px;
    border: 1px solid transparent;
  }

  .selected.outbox_item {
    background-color: rgba(50, 255, 125, 0.076);
    border: 1px solid rgba(50, 255, 125, 0.25);
  }

</style>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'InboxItem',
  props: {
    subject: {
      type: String,
      required: true,
    },
    mailId: {
      type: String,
      required: true,
    },
    receiver: {
      type: String,
      default: 'Unbekannt',
    },
    createdDate: {
      type: Date,
      default: new Date(0),
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    markSelected: {
      type: Boolean,
      default: false,
    },
  },
  methods: {
    formatDate(date: Date) {
      return date.toLocaleDateString('de-DE', {
        year: '2-digit',
        month: '2-digit',
        day: '2-digit',
      });
    },
    getAcronym(name: string) {
      const matches = name.split(' ').map((word) => word.split('')[0]);
      if (matches.length > 1) {
        return matches[0]! + matches[1]!;
      }
      if (matches) {
        return matches.join('');
      }
      return 'U';
    },
    openMail() {
      this.$emit('openMail', this.mailId);
    },
  },
});
</script>
