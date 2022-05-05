<template>
  <div v-if="note.react.parent != null && page.dragging.react.active">
    <NoteDropZone
      :parent-note="note.react.parent"
      :index="note.react.index"
      :style="{
        top: note.react.parent.collab.container.horizontal ? '0' : '0%',
        bottom: note.react.parent.collab.container.horizontal ? '0' : '50%',
        left: note.react.parent.collab.container.horizontal ? '0%' : '0',
        right: note.react.parent.collab.container.horizontal ? '50%' : '0',
      }"
    />

    <NoteDropZone
      :parent-note="note.react.parent"
      :index="note.react.index + 1"
      :style="{
        top: note.react.parent.collab.container.horizontal ? '0' : '50%',
        bottom: note.react.parent.collab.container.horizontal ? '0' : '0%',
        left: note.react.parent.collab.container.horizontal ? '50%' : '0',
        right: note.react.parent.collab.container.horizontal ? '0%' : '0',
      }"
    />
  </div>
</template>

<script
  setup
  lang="ts"
>
import { PageNote } from 'src/code/app/page/notes/note';
import { AppPage } from 'src/code/app/page/page';
import { inject } from 'vue';

import NoteDropZone from './NoteDropZone.vue';

const note = inject<PageNote>('note')!;
const page = inject<AppPage>('page')!;
</script>
