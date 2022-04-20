<template>
  <NoteAnchor>
    <NoteFrame>
      <NoteContent>
        <NoteTextSection section="head" />

        <q-separator
          v-if="note.collab.head.enabled && note.react.bottomSection !== 'head'"
        />

        <NoteTextSection section="body" />
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
import NoteAnchor from './DisplayNote/NoteAnchor.vue';
import NoteFrame from './DisplayNote/NoteFrame.vue';
import NoteContent from './DisplayNote/NoteContent.vue';
import NoteTextSection from './DisplayNote/NoteTextSection.vue';

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
