<template>
  <div
    class="note-editor"
    :class="{
      'padding-fix': paddingFix,
      wrap: wrap,
    }"
  >
    <div ref="editor" />
  </div>
</template>

<script
  setup
  lang="ts"
>
import { SyncedText } from '@syncedstore/core';
import { Quill } from 'quill';
import { NoteTextSection, PageNote } from 'src/boot/app/page/notes/note';
import { AppPage } from 'src/boot/app/page/page';
import { quillOptions } from 'src/boot/static/quill';
import { computed, inject, onBeforeUnmount, onMounted, ref } from 'vue';
import { QuillBinding } from 'y-quill';

const props = defineProps<{
  section: NoteTextSection;
  wrap: boolean;
}>();

const page = inject<AppPage>('page')!;
const note = inject<PageNote>('note')!;

// Quill setup

const text = computed(() => note.collab[props.section].value as SyncedText);

const editor = ref<Element>();

let quill: Quill;
let quillBinding: QuillBinding | null = null;

onMounted(async () => {
  const Quill = await import('quill');

  quill = new Quill.default(editor.value ?? '', quillOptions);

  note.react[props.section].quill = quill;

  quill.enable(note.react.editing);

  quillBinding = new QuillBinding(
    text.value,
    quill,
    page.collab.websocketProvider.awareness
  );
});

onBeforeUnmount(() => {
  if (quillBinding != null) {
    quillBinding.destroy();
  }

  note.react[props.section].quill = null;

  // @ts-ignore
  document.body.removeChild(quill.theme.tooltip.root.parentNode);
});

// Padding fix

const paddingFix = computed(
  () => note.react.collapsing.enabled && props.section === note.react.topSection
);
</script>

<style scoped>
.note-editor {
  height: 100%;

  position: relative;
}

.note-editor :deep(.ql-container) {
  position: static;
}

.note-editor :deep(.ql-editor) {
  padding: 9px !important;

  min-width: 100%;
  max-width: 100%;

  min-height: 100%;
  max-height: 100%;

  width: max-content;
  height: max-content;

  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;

  overflow: auto;

  white-space: nowrap;

  touch-action: pan-x pan-y !important;
}

.note-editor :deep(.ql-editor > *) {
  cursor: inherit;
}

.note-editor.padding-fix :deep(.ql-editor) {
  padding-right: 0 !important;
}

.note-editor.wrap :deep(.ql-editor) {
  white-space: normal;
}

/* Lists */

.note-editor :deep(ul) {
  padding-left: 0 !important;
}
.note-editor :deep(li) {
  padding-left: 1em !important;
}
.note-editor :deep(li.ql-indent-1) {
  padding-left: 2em !important;
}
.note-editor :deep(li.ql-indent-2) {
  padding-left: 3em !important;
}
.note-editor :deep(li.ql-indent-3) {
  padding-left: 4em !important;
}
.note-editor :deep(li.ql-indent-4) {
  padding-left: 5em !important;
}
.note-editor :deep(li.ql-indent-5) {
  padding-left: 6em !important;
}
.note-editor :deep(li.ql-indent-6) {
  padding-left: 7em !important;
}
.note-editor :deep(li.ql-indent-7) {
  padding-left: 8em !important;
}
.note-editor :deep(li.ql-indent-8) {
  padding-left: 9em !important;
}
.note-editor :deep(li.ql-indent-9) {
  padding-left: 10em !important;
}

/* Indentation */

.note-editor :deep(p.ql-indent-1) {
  padding-left: 1em !important;
}
.note-editor :deep(p.ql-indent-2) {
  padding-left: 2em !important;
}
.note-editor :deep(p.ql-indent-3) {
  padding-left: 3em !important;
}
.note-editor :deep(p.ql-indent-4) {
  padding-left: 4em !important;
}
.note-editor :deep(p.ql-indent-5) {
  padding-left: 5em !important;
}
.note-editor :deep(p.ql-indent-6) {
  padding-left: 6em !important;
}
.note-editor :deep(p.ql-indent-7) {
  padding-left: 7em !important;
}
.note-editor :deep(p.ql-indent-8) {
  padding-left: 8em !important;
}
.note-editor :deep(p.ql-indent-9) {
  padding-left: 9em !important;
}

/* Anchor links */

.note-editor :deep(a) {
  text-decoration: none !important;

  color: #64b5f6;
}

.note-editor :deep(a::before) {
  display: none;
}
.note-editor :deep(a::after) {
  display: none;
}

/* Code blocks */

.note-editor :deep(pre.ql-syntax) {
  min-width: 100%;
  width: fit-content;

  white-space: pre;
}

.note-editor.wrap :deep(pre.ql-syntax) {
  white-space: pre-wrap;
  max-width: 100%;
}

.note-editor :deep(pre.ql-syntax:empty) {
  display: none;
}

/* Inline codes */

.note-editor :deep(code) {
  background-color: #202020 !important;
}
</style>

<style>
/* Tooltip */

.ql-tooltip {
  z-index: 2147483647;

  background-color: #303030 !important;
  border-radius: 12px !important;
}

.ql-toolbar {
  display: flex;

  flex-direction: column;
}

.ql-formats {
  margin: 8px !important;
}
.ql-formats:not(:first-child) {
  margin-top: 0 !important;
}
</style>
