<template>
  <div v-if="note.collab.resizable && note.react.selected">
    <NoteResizeHandle
      side="nw"
      :section="note.react.topSection"
    />
    <NoteResizeHandle
      side="n"
      :section="note.react.topSection"
    />
    <NoteResizeHandle
      side="ne"
      :section="note.react.topSection"
    />

    <NoteResizeHandle side="w" />
    <NoteResizeHandle side="e" />

    <NoteResizeHandle
      side="sw"
      :section="note.react.bottomSection"
    />
    <NoteResizeHandle
      side="se"
      :section="note.react.bottomSection"
    />
    <NoteResizeHandle
      side="s"
      :section="note.react.bottomSection"
    />
  </div>
</template>

<script
  setup
  lang="ts"
>
import { PageNote } from 'src/boot/app/page/notes/note';
import { inject } from 'vue';
import NoteResizeHandle from './NoteResizeHandle.vue';

const note = inject<PageNote>('note')!;
</script>
