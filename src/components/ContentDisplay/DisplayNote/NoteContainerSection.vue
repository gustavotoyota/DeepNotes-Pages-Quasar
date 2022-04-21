<template>
  <div
    v-if="note.collab.container.enabled"
    :style="{
      height: note.react.container.visible ? undefined : '0px',
      overflow: note.react.container.visible ? undefined : 'hidden',
    }"
  >
    <div
      class="note-container-section"
      :style="{
        height: note.react.container.height,
      }"
    >
      <div
        class="note-container-content"
        :style="{
          width: note.react.width.target,
          'flex-direction': note.collab.container.horizontal ? 'row' : 'column',
          'flex-wrap': note.collab.container.wrapChildren ? 'wrap' : undefined,
        }"
      >
        <!-- Placeholder -->

        <div
          v-if="note.react.notes.length === 0"
          class="note-container-placeholder"
        >
          Drop notes here

          <NoteDropZone
            :parent-note="note"
            :index="0"
            style="top: 0; bottom: 0"
          />
        </div>

        <!-- Children -->

        <div
          v-for="(child, index) in note.react.notes"
          :key="child.id"
          class="note-container-child"
          :style="{
            'flex-direction': note.collab.container.horizontal
              ? 'row'
              : 'column',
            width:
              !note.collab.container.horizontal &&
              note.collab.container.stretchChildren
                ? 'calc(100% - 6px)'
                : undefined,
          }"
        >
          <DisplayNote
            :note="child"
            :index="index"
          />

          <div style="position: relative">
            <NoteDropZone
              v-if="index < note.react.notes.length - 1"
              :parent-note="note"
              :index="index + 1"
              style="position: absolute; min-width: 6px; min-height: 6px"
            />
          </div>
        </div>

        <!-- Last drop zone -->

        <div style="flex: 1; position: relative">
          <NoteDropZone
            :parent-note="note"
            :index="note.react.notes.length"
            style="right: 3px; bottom: 3px"
            :style="{
              left: note.collab.container.horizontal ? '-3px' : '3px',
              top: note.collab.container.horizontal ? '3px' : '-3px',
            }"
          />
        </div>
      </div>

      <NoteCollapseBtn section="container" />
    </div>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { PageNote } from 'src/boot/app/page/notes/note';
import { inject } from 'vue';
import NoteCollapseBtn from './NoteCollapseBtn.vue';
import NoteDropZone from './NoteDropZones/NoteDropZone.vue';
import DisplayNote from './DisplayNote.vue';

const note = inject<PageNote>('note')!;
</script>

<style scoped>
.note-container-section {
  display: flex;

  min-height: 52.45px;
}

.note-container-content {
  flex: 1;

  padding: 4px;

  display: flex;
  align-content: flex-start;

  overflow: auto;

  touch-action: pan-x pan-y !important;
}

.note-container-placeholder {
  position: relative;

  width: 100%;
  height: 100%;

  border-radius: 4px;

  overflow: hidden;

  display: flex;
  align-items: center;
  justify-content: center;

  color: #e0e0e0;
  font-size: 13px;
}

.note-container-drop-zone {
  background-color: #42a5f5;

  opacity: 0;
}
.note-container-drop-zone.active {
  opacity: 0.25;
}

.note-container-child {
  flex: none;

  display: flex;

  margin: 3px;
}
</style>
