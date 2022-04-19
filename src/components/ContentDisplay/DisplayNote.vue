<template>
  <NoteAnchor></NoteAnchor>
</template>

<script
  setup
  lang="ts"
>
import { PageNote } from 'src/boot/app/page/notes/note';
import { provide, watchEffect } from 'vue';
import NoteAnchor from './DisplayNote/NoteAnchor.vue';

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
