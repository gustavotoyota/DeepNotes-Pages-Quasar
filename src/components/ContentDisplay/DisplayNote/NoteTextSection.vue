<template>
  <div
    v-if="note.react[section].enabled"
    :class="`note-${section}-section`"
    style="display: flex; min-height: 36.453px"
    :style="{ height: 'auto' }"
  >
    <div
      style="flex: 1"
      :style="{ width: note.react.targetWidth }"
    >
      <NoteEditor
        :section="section"
        :wrap="note.react[section].wrap"
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
