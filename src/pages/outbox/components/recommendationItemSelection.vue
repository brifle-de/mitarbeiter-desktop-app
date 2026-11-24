<template>
  <div class="flex flex-col gap-2">
    <RecommendationItem
      v-for="(rec, index) in recommendations"
      :key="index + 'recommendation'"
      :recommendation="rec"
      :selected="selectedRecommendations.some((item) => matchRecommendations(item, rec))"
      @select="selectRecommendation(rec)"
      @unselect="unselectRecommendation(rec)"
    />
  </div>
</template>

<script setup lang="ts">
import RecommendationItem from './recommendationItem.vue';
import type { RecommendationRecord } from '../util/types';

const props = withDefaults(defineProps<{ recommendations: RecommendationRecord[]; selectedRecommendations?: RecommendationRecord[] }>(), {
  selectedRecommendations: () => [],
});
const emit = defineEmits<{ select: [recs: RecommendationRecord[]] }>();

function matchRecommendations(rec1: RecommendationRecord, rec2: RecommendationRecord): boolean {
  return rec1.type === rec2.type && JSON.stringify(rec1.data) === JSON.stringify(rec2.data);
}
function selectRecommendation(rec: RecommendationRecord) {
  emit('select', [...props.selectedRecommendations, rec]);
}
function unselectRecommendation(rec: RecommendationRecord) {
  emit('select', props.selectedRecommendations.filter((item) => !matchRecommendations(item, rec)));
}
</script>
