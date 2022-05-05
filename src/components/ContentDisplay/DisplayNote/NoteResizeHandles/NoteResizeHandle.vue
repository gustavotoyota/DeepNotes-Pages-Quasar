<template>
  <div
    v-if="note.collab.resizable && note.react.selected && !note.react.ghost"
    class="note-handle"
    :style="{
      left: left,
      top: top,
      cursor: `${side}-resize`,
      'pointer-events': page.dragging.react.active ? 'none' : 'auto',
      opacity: page.dragging.react.active ? '0.7' : undefined,
    }"
    @pointerdown.left.stop="onPointerDown"
  />
</template>

<script
  setup
  lang="ts"
>
import { computed } from 'vue';
import { NoteSide, NoteSection, PageNote } from 'src/code/app/page/notes/note';
import { AppPage } from 'src/code/app/page/page';
import { inject } from 'vue';

const props = defineProps<{
  side: NoteSide;
  section?: NoteSection;
}>();

const page = inject<AppPage>('page')!;
const note = inject<PageNote>('note')!;

const left = computed(() => {
  if (props.side.includes('w')) return '0%';
  else if (props.side.includes('e')) return '100%';
  else return '50%';
});
const top = computed(() => {
  if (props.side.includes('n')) return '0%';
  else if (props.side.includes('s')) return '100%';
  else return '50%';
});

function onPointerDown(event: PointerEvent) {
  page.resizing.start(event, note, props.side, props.section);
}
</script>

<style scoped>
.note-handle {
  position: absolute;

  border-radius: 999px;
  width: 10px;
  height: 10px;
  transform: translate(-50%, -50%);

  background-color: #2196f3;
  pointer-events: auto;
  z-index: 2147483647;
}
</style>
