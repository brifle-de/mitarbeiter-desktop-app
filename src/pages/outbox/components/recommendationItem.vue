<template>
    <div 
    :class="cssClasses"
    @click="toogleSelection()">
        <div class="text-h6">{{ title }}</div>
        <div v-if="recommendation.type === 'receiver_record'" class="q-mt-sm">
            <div><strong>Name:</strong> {{ receiverData?.firstName }} {{ receiverData?.lastName }}</div>
            <div v-if="receiverData?.email"><strong>Email:</strong> {{ receiverData?.email }}</div>
            <div v-if="receiverData?.phone"><strong>Tel.:</strong> {{ receiverData?.phone }}</div>
            <div v-if="receiverAddress.length > 0"><strong>Adresse:</strong> {{ receiverAddress }}</div>
        </div>
        <div v-else-if="recommendation.type === 'subject'">
            <div><strong>Betreff:</strong> {{ recommendation.data }}</div>
            </div>
        <div v-else-if="recommendation.type === 'document_type'">
            <div class="text-muted">
                Die Textanalyse des Dokuments deutet darauf hin, dass es sich um folgenden Dokumenttyp handeln könnte:
            </div>
            <div class="text-bold text-subtitle1">{{ documentType }}</div>
        </div>
        <div v-else-if="recommendation.type === 'invoice_iban'">
            <div><strong>Rechnungs-IBAN:</strong> {{ recommendation.data }}</div>
        </div>
        <div v-else-if="recommendation.type === 'invoice_amount'">
            <div><strong>Rechnungsbetrag:</strong> {{ recommendation.data }}</div>
        </div>
        <div v-else-if="recommendation.type === 'invoice_due_date'">
            <div><strong>Rechnungsfälligkeitsdatum:</strong> {{ recommendation.data }}</div>
        </div>
        <div v-else-if="recommendation.type === 'signature_field'">
            <div><strong>Empfohlenes Signaturfeld:</strong> {{ recommendation.data }}</div>
        </div>
        <div v-else-if="recommendation.type === 'invoice_reference'">
            <div><strong>Rechnungsreferenz:</strong> {{ recommendation.data }}</div>
        </div>
    </div>
</template>
<script lang="ts">
import ReceiverRecord from 'src/pages/bulk_sending/util/receivers/receiverRecord';
import { defineComponent, ref } from 'vue';


export interface RecommendationRecord {
    data: string | ReceiverRecord;
    type: 'receiver_record' | 'subject' | 'document_type' | 'invoice_iban' | 'invoice_amount' | 'invoice_due_date' | 'signature_field' | 'invoice_reference';

}

export default defineComponent({
    name: 'RecommendationItem',
    props: {
        recommendation: {
            type: Object,
            required: true,
        }
    },
    emits: ['select', 'unselect'],
    computed: {
        cssClasses(): string {
            let classes = 'selection-item-box q-pa-md rounded-borders cursor-pointer';
            if (this.selected) {
                classes += ' active';
            }
            return classes;
        },
        documentType(): string{
            switch(this.recommendation.data){
                case 'invoice':
                    return 'Rechnung';
                case 'letter':
                    return 'Brief';
                case 'contract':
                    return 'Vertrag';
                default:
                    return this.recommendation.data as string;

            }
        },
        receiverData(): ReceiverRecord | null {
            if (this.recommendation.type === 'receiver_record') {
                return this.recommendation.data as ReceiverRecord;
            }
            return null;
        },
        receiverAddress(): string {
            let address = ""
            if (this.receiverData && this.receiverData.address) {
                address = this.receiverData.address.trim();
            }
            if (this.receiverData && address === "") {
                const addressParts = [
                    this.receiverData.addressStreet,
                    this.receiverData.addressPostcode + ' ' + this.receiverData.addressCity,
                    this.receiverData.addressCountry

                ].filter(part => part && part.trim() !== '');
                address = addressParts.join(', ');
            }
            return address;
        },
        title(): string {
            switch (this.recommendation.type) {
                case 'receiver_record':
                    return 'Empfänger';
                case 'subject':
                    return 'Betreff';
                case 'document_type':
                    return 'Dokumenttyp';
                case 'invoice_iban':
                    return 'Rechnungs-IBAN';
                case 'invoice_amount':
                    return 'Rechnungsbetrag';
                case 'invoice_due_date':
                    return 'Rechnungsfälligkeitsdatum';
                case 'invoice_reference':
                    return 'Rechnungsreferenz';
                case 'signature_field':
                    return 'Signaturfeld';
                default:
                    return '';
            }
        }
    },
    methods: { 
        toogleSelection() {
            this.selected = !this.selected;
            this.$emit(this.selected ? 'select' : 'unselect', this.recommendation);
        }
    },
    setup() {
        const selected = ref(true);
        return {
            selected
        }
    }
}); 
</script>