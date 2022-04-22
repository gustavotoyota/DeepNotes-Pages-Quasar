<template>
  <div style="position: relative">
    <q-separator
      v-if="
        !note.react.collapsing.collapsed &&
        note.react[section].visible &&
        note.react.bottomSection !== section
      "
    />

    <NoteResizeHandle
      side="s"
      :section="section"
      style="margin-top: -0.5px"
    />
  </div>
</template>

<script
  setup
  lang="ts"
>
import { NoteSection, PageNote } from 'src/boot/app/page/notes/note';
import { inject } from 'vue';
import NoteResizeHandle from './NoteResizeHandles/NoteResizeHandle.vue';

defineProps<{
  section: NoteSection;
}>();

const note = inject<PageNote>('note')!;
</script>
