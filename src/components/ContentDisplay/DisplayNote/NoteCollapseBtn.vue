<template>
  <div
    v-if="note.collab.collapsing.enabled && note.react.topSection === section"
    style="flex: none"
  >
    <q-btn
      class="note-collapse-button"
      flat
      :style="{
        height: note.react.numEnabledSections === 1 ? '36.45px' : '100%',
      }"
      @click.left.stop="negateProp(note.collab.collapsing, 'collapsed')"
      @pointerdown.left.stop
      @dblclick.left.stop
    >
      <q-icon
        :name="
          note.react.collapsing.collapsed
            ? 'mdi-chevron-down'
            : 'mdi-chevron-up'
        "
      />
    </q-btn>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { NoteSection, PageNote } from 'src/boot/app/page/notes/note';
import { negateProp } from 'src/boot/static/utils';
import { inject } from 'vue';

defineProps<{
  section: NoteSection;
}>();

const note = inject<PageNote>('note')!;
</script>

<style scoped>
.note-collapse-button {
  min-width: 0 !important;
  width: 32px;

  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
</style>
