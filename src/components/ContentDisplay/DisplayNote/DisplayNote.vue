<template>
  <NoteAnchor>
    <NoteDropZones />

    <NoteFrame>
      <NoteResizeHandles />

      <NoteContent>
        <NoteTextSection section="head" />

        <NoteDivider section="head" />

        <NoteTextSection section="body" />

        <NoteDivider section="body" />

        <NoteContainerSection />
      </NoteContent>
    </NoteFrame>
  </NoteAnchor>
</template>

<script
  setup
  lang="ts"
>
import { PageNote } from 'src/boot/app/page/notes/note';
import { provide, watchEffect } from 'vue';
import NoteAnchor from './NoteAnchor.vue';
import NoteFrame from './NoteFrame.vue';
import NoteContent from './NoteContent.vue';
import NoteTextSection from './NoteTextSection.vue';
import NoteContainerSection from './NoteContainerSection.vue';
import NoteDropZones from './NoteDropZones/NoteDropZones.vue';
import NoteResizeHandles from './NoteResizeHandles/NoteResizeHandles.vue';
import NoteDivider from './NoteDivider.vue';

const props = defineProps<{
  note: PageNote;
  index: number;
}>();

provide('note', props.note);

watchEffect(() => {
  // eslint-disable-next-line vue/no-mutating-props
  props.note.react.index = props.index;
});
</script>
