<template>
  <div
    v-if="note.collab[section].enabled"
    :class="`note-${section}-section`"
    style="display: flex"
    :style="{ height: note.react.height[section] }"
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
</template>

<script
  setup
  lang="ts"
>
import { NoteTextSection, PageNote } from 'src/boot/app/page/notes/note';
import { AppPage } from 'src/boot/app/page/page';
import { inject } from 'vue';
import NoteEditor from './NoteEditor.vue';
import NoteCollapseBtn from './NoteCollapseBtn.vue';

defineProps<{
  section: NoteTextSection;
}>();

const page = inject<AppPage>('page')!;
const note = inject<PageNote>('note')!;
</script>
