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

<script lang="ts">
let QuillImport: Promise<any>;

if (process.env.CLIENT) {
  QuillImport = import('quill');
}
</script>

<script
  setup
  lang="ts"
>
import { NoteTextSection, PageNote } from 'src/code/app/page/notes/note';
import { AppPage } from 'src/code/app/page/page';
import { getQuillOptions } from 'src/code/static/quill';
import { computed, inject, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { QuillBinding } from 'y-quill';
import { SyncedText } from '@syncedstore/core';
import Delta from 'quill-delta';
import Quill from 'quill';

const props = defineProps<{
  section: NoteTextSection;
  wrap: boolean;
}>();

const page = inject<AppPage>('page')!;
const note = inject<PageNote>('note')!;

// Quill setup

const editor = ref<Element>();

let quill: Quill;
let quillBinding: QuillBinding | null = null;

let unwatch: () => void;

onMounted(async () => {
  quill = new (await QuillImport).default(
    editor.value!,
    getQuillOptions(page.id)
  );

  note.react[props.section].quill = quill;

  quill.enable(note.react.editing);

  if (!(note.collab[props.section].value instanceof SyncedText)) {
    quill.setContents(
      new Delta(note.collab[props.section].value as any) as any
    );
    return;
  }

  quillBinding = new QuillBinding(
    note.collab[props.section].value,
    quill,
    page.collab.websocketProvider.awareness
  );

  unwatch = watch(
    () => note.react.editing,
    () => {
      quill.enable(note.react.editing);

      if (note.react.editing) {
        // @ts-ignore
        quill.history.clear();

        if (page.editing.react.section === props.section) {
          quill.focus();
          quill.setSelection(0, 0);
          quill.setSelection(0, Infinity, 'user');
        }
      } else {
        quill.enable(false);
        quill.setSelection(null as any);
        // @ts-ignore
        quill.theme.tooltip.hide();
      }
    },
    { immediate: true }
  );
});

onBeforeUnmount(() => {
  if (unwatch != null) {
    unwatch();
  }

  if (quillBinding != null) {
    quillBinding.destroy();
  }

  note.react[props.section].quill = null;

  if (quill != null) {
    // @ts-ignore
    document.body.removeChild(quill.theme.tooltip.root.parentNode);
  }
});

// Padding fix

const paddingFix = computed(
  () =>
    note.collab.collapsing.enabled && props.section === note.react.topSection
);
</script>

<style
  scoped
  lang="scss"
>
.note-editor {
  height: 100%;

  position: relative;
}

.note-editor :deep(.ql-container) {
  position: static;
}

$note-padding: 9px;

.note-editor :deep(.ql-editor) {
  padding: $note-padding !important;

  min-width: MAX(1px + $note-padding * 2, 100%);
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

.note-editor :deep(h1) {
  font-weight: bold;
  line-height: unset;
  letter-spacing: unset;
}
.note-editor :deep(h2) {
  font-weight: bold;
  line-height: unset;
  letter-spacing: unset;
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

  tab-size: 2;
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
