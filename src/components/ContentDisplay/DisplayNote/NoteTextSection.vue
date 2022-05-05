<template>
  <div
    v-if="note.collab[section].enabled"
    :style="{
      height: note.react[section].visible ? undefined : '0px',
      overflow: note.react[section].visible ? undefined : 'hidden',
    }"
  >
    <div
      :class="`note-${section}-section`"
      style="display: flex; min-height: 36.45px"
      :style="{ height: note.react[section].height }"
    >
      <div
        style="flex: 1"
        :style="{ width: note.react.width.target }"
        @dblclick.left="page.editing.start(note, section)"
      >
        <NoteEditor
          :section="section"
          :wrap="note.collab[section].wrap"
        />
      </div>

      <NoteCollapseBtn :section="section" />
    </div>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { NoteTextSection, PageNote } from 'src/code/app/page/notes/note';
import { AppPage } from 'src/code/app/page/page';
import { inject } from 'vue';

import NoteCollapseBtn from './NoteCollapseBtn.vue';
import NoteEditor from './NoteEditor.vue';

defineProps<{
  section: NoteTextSection;
}>();

const page = inject<AppPage>('page')!;
const note = inject<PageNote>('note')!;
</script>
