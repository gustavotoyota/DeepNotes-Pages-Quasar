<template>
  <div v-if="note.collab.resizable && note.react.selected">
    <template v-if="note.parentId == null">
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
      <NoteResizeHandle
        side="sw"
        :section="note.react.bottomSection"
      />
      <NoteResizeHandle side="w" />
    </template>

    <template v-if="!note.react.width.uncontrolled">
      <NoteResizeHandle side="e" />
      <NoteResizeHandle
        side="se"
        :section="note.react.bottomSection"
      />
    </template>

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
