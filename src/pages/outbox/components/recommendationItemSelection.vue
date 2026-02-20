<template>
    <div>
        <RecommendationItem 
            v-for="(rec, index) in recommendations" 
            :key="index+'recommendation'"
            :recommendation="rec"
             class="q-my-sm"
            @unselect="unselectRecommendation(rec)"
            @select="selectRecommendation(rec)"
        />
    </div>
</template>
<script lang="ts">
import { defineComponent, ref } from 'vue';
import { RecommendationRecord } from './recommendationItem.vue';
import RecommendationItem from './recommendationItem.vue';

export default defineComponent({
    name: 'RecommendationItemSelection',
    emits: ['select'],
    components: {
        RecommendationItem
    },
    props: {
        recommendations: {
            type: Array as () => RecommendationRecord[],
            required: true,
        },
        selectedRecommendations: {
            type: Array as () => RecommendationRecord[],
            required: false,
            default: () => []
        }
    },
    watch: {
        selectedRecommendations(newVal) {
            this.selectedItems = newVal;
        }
    },
    methods: { 
        selectRecommendation(rec: RecommendationRecord) {   
            this.selectedItems.push(rec);
            this.$emit('select', this.selectedItems);
        },
        unselectRecommendation(rec: RecommendationRecord) {
            this.selectedItems = this.selectedItems.filter(item => !this.matchRecommendations(item, rec));
            this.$emit('select', this.selectedItems);
        },
        matchRecommendations(rec1: RecommendationRecord, rec2: RecommendationRecord): boolean {
            if (rec1.type !== rec2.type) return false;
            const v1 = JSON.stringify(rec1.data);
            const v2 = JSON.stringify(rec2.data);
            return v1 === v2;
        }
    },
    setup(props) {
        const selectedItems = ref<RecommendationRecord[]>(props.selectedRecommendations || []);

        return {
            selectedItems
        }
    }

});
</script> 