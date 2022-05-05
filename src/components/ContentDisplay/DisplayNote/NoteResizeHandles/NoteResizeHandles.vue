<template>
  <div>
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

    <template v-if="!note.react.width.stretched">
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
import { PageNote } from 'src/code/app/page/notes/note';
import { inject } from 'vue';
import NoteResizeHandle from './NoteResizeHandle.vue';

const note = inject<PageNote>('note')!;
</script>
