<template>
    <div 
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
    @click="openFileDialog"
    ref="dropZoneRef" class="drag_and_drop_field w-100 q-pa-xl text-center">
            <q-icon name="upload_file" class="q-mr-sm drop-icon" size="60px" />
            <div>
                <div class="text-h6 q-my-md">Datei per Drag and Drop hinzufügen oder hier klicken</div>
                <div class="text-subtitle2">Unterstützte Dateitypen: {{ formatedFormats }}</div>
            </div>
    </div>
    <input
     :multiple="multiple"
     :accept="formats.join(',')"
     type="file" ref="fileInputRef" style="display:none" />

</template>


<style lang="scss">



.drag_and_drop_field{
    background-color: #333333;
    &:hover {
        background-color: #3C3C3C;
    }
    border-radius: 30px;
    border: 2px solid transparent;
    cursor: pointer;
    
}

.drag-over {
    border: 2px dashed var(--q-primary);

    .drop-icon {
        color: var(--q-primary);
    }
}




</style>

<script lang="ts">

import { useDropZone } from '@vueuse/core';
import { defineComponent, ref } from 'vue';

interface FileContent { 
    name: string;
    content: Uint8Array;
}

export type { FileContent };

export default defineComponent({
    name: 'FileDragAndDrop',
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
        onDragOver(event: DragEvent) {
            const element = event.currentTarget as HTMLElement;
            event.preventDefault();
            element.classList.add('drag-over');
        },
        onDragLeave(event: DragEvent) {
            const element = event.currentTarget as HTMLElement;
            event.preventDefault();
            element.classList.remove('drag-over');
        },
        onDrop(event: DragEvent) {
            event.preventDefault();
            const element = event.currentTarget as HTMLElement;
            element.classList.remove('drag-over');
        },
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
                        console.log(file);
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
