<template>
  <div
    v-if="alwaysVisible || page.dragging.react.active"
    class="note-drop-zone"
    :class="{
      active:
        page.dragging.react.active &&
        page.dragging.react.dropRegionId == parentNote.id &&
        page.dragging.react.dropIndex === index,
    }"
    @pointerenter="onPointerEnter"
    @pointerleave="onPointerLeave"
    @pointerup.left="onPointerUp"
  />
</template>

<script
  setup
  lang="ts"
>
import { PageNote } from 'src/code/app/page/notes/note';
import { AppPage } from 'src/code/app/page/page';
import { inject } from 'vue';

const props = defineProps<{
  parentNote: PageNote;
  index?: number;
  alwaysVisible?: boolean;
}>();

const page = inject<AppPage>('page')!;

function onPointerEnter() {
  if (!page.dragging.react.active) {
    return;
  }

  page.dragging.react.dropRegionId = props.parentNote.id;
  page.dragging.react.dropIndex = props.index;
}

function onPointerLeave() {
  if (!page.dragging.react.active) {
    return;
  }

  page.dragging.react.dropRegionId = null;
  page.dragging.react.dropIndex = null;
}

function onPointerUp(event: PointerEvent) {
  if (!page.dragging.react.active) {
    return;
  }

  event.stopPropagation();

  page.dropping.perform(props.parentNote, props.index ?? 0);
}
</script>

<style scoped>
.note-drop-zone {
  position: absolute;
  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  background-color: #42a5f5;
  opacity: 0;

  z-index: 2147483646;
}
.note-drop-zone.active {
  opacity: 0.25;
}
</style>
