<template>
  <NoteAnchor>
    <NoteDropZones />

    <NoteFrame>
      <NoteContent>
        <NoteTextSection section="head" />

        <q-separator
          v-if="note.react.head.visible && note.react.bottomSection !== 'head'"
        />

        <NoteTextSection section="body" />

        <q-separator
          v-if="
            note.react.container.visible &&
            note.react.topSection !== 'container'
          "
        />

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
