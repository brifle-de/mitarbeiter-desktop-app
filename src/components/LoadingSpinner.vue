<template>
  <span v-show="spinnerValue" class="inline-flex">
    <ProgressSpinner :style="{ width: size, height: size }" stroke-width="4" />
  </span>
</template>


<script lang="ts">
import { defineComponent } from 'vue';
import ProgressSpinner from 'openvue/progressspinner';

export default defineComponent({
  name: 'LoadingSpinner',
  components: { ProgressSpinner },
  props: {
    spinnerValue: {
      type: Boolean,
      default: true,
    },
    size: {
      type: String,
      default: '40px',
    },
    color: {
      type: String,
      default: 'secondary',
    },
  },
  emits: ['update:modelValue', 'save'],
  computed: {
    value: {
      get() {
        return this.spinnerValue;
      },
      set(value : boolean) {
        this.$emit('update:modelValue', value);
      },
    },
  },

});
</script>

