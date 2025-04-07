<template>
    <span v-show="spinnerValue">

        <span class="loadingSpinner" >
            <q-spinner :color="color" :size="size" />
        </span>

    </span>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

export default defineComponent({
  name: 'LoadingSpinner',
  props: {
    spinnerValue: {
      type: Boolean,
      default: true,
    },
    size: {
      type: String,
      default: '50px',
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

<style scoped>

.loadingSpinner {
    margin: 0 auto;
    display: inline-block;
    border-radius: 50%;
    padding: 3px;
    background-color: #f5f5f508;
    border: 1px solid #f5f5f512;
}

</style>