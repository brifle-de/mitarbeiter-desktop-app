<template>
  <!-- MA/Dateiablage -->
  <div
    ref="dropZoneRef"
    role="button"
    tabindex="0"
    class="flex w-full cursor-pointer flex-col items-center gap-2 rounded-[12px] border-[1.5px] border-dashed px-6 py-8 text-center transition-colors"
    :class="isOverDropZone ? 'border-line-brand bg-mint' : 'border-line bg-flaeche hover:border-line-brand'"
    @click="openFileDialog"
    @keydown.enter="openFileDialog"
  >
    <span class="flex h-11 w-11 items-center justify-center rounded-full bg-mint text-icon-brand"><Upload :size="22" /></span>
    <span class="ma-text-strong">{{ isOverDropZone ? 'Loslassen zum Hinzufügen' : (multiple ? 'Dateien hierher ziehen oder auswählen' : 'Datei hierher ziehen oder auswählen') }}</span>
    <span class="ma-small text-ink-muted">Unterstützte Dateitypen: {{ formatedFormats }}</span>
  </div>
  <input ref="fileInputRef" :multiple="multiple" :accept="formats.join(',')" type="file" class="hidden" />
</template>




<script lang="ts">

import { useDropZone } from '@vueuse/core';
import { defineComponent, ref } from 'vue';
import { Upload } from 'lucide-vue-next';

interface FileContent { 
    name: string;
    content: Uint8Array;
}

export type { FileContent };

export default defineComponent({
    name: 'FileDragAndDrop',
    components: { Upload },
    emits: ['drop'],
    props: {
        formats: {
            type: Array as () => string[],
            default: () => ['application/pdf'],
        },
        multiple: {
            type: Boolean,
            default: false,
        },
    },
    computed: {
        formatedFormats(): string {
            return this.formats.map(format => {
                const parts = format.split('/');
                return parts.length > 1 ? parts[1]!.toUpperCase() : format.toUpperCase();
            }).join(', ');
        },
    },
    methods: {
        openFileDialog() {
            
            if (this.fileInputRef) {
                this.fileInputRef.click();
                this.fileInputRef.onchange = async (event: Event) => {
                    const input = event.target as HTMLInputElement;
                    if (input.files) {
                        const filesArray = Array.from(input.files);
                        await this.handleDrop(filesArray);
                        input.value = '';
                    }
                };
            }
        }
    },
    setup(props, { emit  }) {
        const dropZoneRef = ref<HTMLElement | null>(null);
        const fileInputRef = ref<HTMLInputElement | null>(null);    
        const formatElemets : string[] = props.formats;
        const handleDrop = async (files: File[] | null) => {
            let output : FileContent[] = [];
            if (files) {
                const readData = files.map((file) =>{
                    const content = file.arrayBuffer();
                    return content.then((data) => {
                        return {
                            name: file.name,
                            content: new Uint8Array(data),
                        };
                    }); 
                });
                output = await Promise.all(readData); 
                if (!props.multiple && output.length > 1) {
                    output = output.slice(0, 1);
                }
                emit('drop', output);
            }
            
        };

        

        const { isOverDropZone } = useDropZone(dropZoneRef, {
            onDrop: (files) => void handleDrop(files),
            dataTypes: formatElemets,  
            preventDefaultForUnhandled: false,
        })

        return {
            dropZoneRef,
            handleDrop,
            isOverDropZone,
            fileInputRef,
        };
    },
});


</script>
