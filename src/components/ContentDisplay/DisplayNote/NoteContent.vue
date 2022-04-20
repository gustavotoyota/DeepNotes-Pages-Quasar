<template>
  <div
    class="note-content"
    :style="{
      cursor:
        note.collab.link == null || note.react.selected ? undefined : 'pointer',
      'background-color': backgroundColor,
    }"
    @pointerdown.left.stop="onPointerDown"
  >
    <slot />
  </div>
</template>

<script
  setup
  lang="ts"
>
import { PageNote } from 'src/boot/app/page/notes/note';
import { AppPage } from 'src/boot/app/page/page';
import { isMouseOverScrollbar } from 'src/boot/static/dom';
import { computed, inject } from 'vue';

const page = inject<AppPage>('page')!;
const note = inject<PageNote>('note')!;

const backgroundColor = computed(() => {
  if (note.react.active) {
    return '#757575';
  } else if (note.react.selected) {
    return '#616161';
  } else {
    return '#424242';
  }
});

function onPointerDown(event: PointerEvent) {
  if (isMouseOverScrollbar(event)) {
    return;
  }

  page.clickSelection.perform(note, event);

  if (note.react.selected) {
    page.dragging.start(event);
  }
}
</script>

<style scoped>
.note-content {
  border-radius: 7px;
  border: 1px solid #212121;
  border-left-color: #757575;
  border-top-color: #757575;

  height: 100%;

  box-shadow: 0 3px 5px -1px rgba(0, 0, 0, 0.2),
    0 6px 10px 0 rgba(0, 0, 0, 0.14), 0 1px 18px 0 rgba(0, 0, 0, 0.12) !important;
}
</style>
