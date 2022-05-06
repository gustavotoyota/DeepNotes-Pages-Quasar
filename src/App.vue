<template>
  <router-view />
</template>

<script lang="ts">
import { onBeforeUnmount, onMounted, toRef } from 'vue';

import { useAPI } from './boot/external/axios';
import { PageNote } from './code/app/page/notes/note';
import { homeURL, tryRefreshTokens } from './code/static/auth';
import { useAuth } from './stores/auth';
import { useMainStore } from './stores/main-store';
</script>

<script
  setup
  lang="ts"
>
const mainStore = useMainStore();
const api = useAPI();
const auth = useAuth();

const page = toRef(mainStore, 'page');

// Release pointer down for touchscreen

onMounted(() => {
  document.addEventListener('pointerdown', onPointerDownCapture, true);
});
function onPointerDownCapture(event: PointerEvent) {
  (event.target as Element).releasePointerCapture(event.pointerId);
}
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDownCapture, true);
});

// Shortcuts

onMounted(() => {
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keypress', onKeyPress);
});

function onKeyDown(event: KeyboardEvent) {
  if (
    (event.target as HTMLElement).isContentEditable &&
    event.code === 'Escape'
  ) {
    page.value.editing.stop();
  }

  if (event.ctrlKey && event.code === 'KeyD') {
    event.preventDefault();
  }

  if (
    (event.target as HTMLElement).nodeName === 'INPUT' ||
    (event.target as HTMLElement).nodeName === 'TEXTAREA' ||
    (event.target as HTMLElement).isContentEditable
  ) {
    return;
  }

  if (event.code === 'Delete') {
    page.value.deleting.perform();
  }

  if (event.ctrlKey && event.code === 'KeyA') {
    page.value.selection.selectAll();
  }

  if (event.ctrlKey && event.code === 'KeyD') {
    page.value.cloning.perform();
  }

  if (event.ctrlKey && event.code === 'KeyC') {
    page.value.clipboard.copy();
  }
  if (event.ctrlKey && event.code === 'KeyV' && window.clipboardData) {
    page.value.clipboard.paste();
  }
  if (event.ctrlKey && event.code === 'KeyX') {
    page.value.clipboard.cut();
  }

  if (event.ctrlKey && event.code === 'KeyZ') {
    //page.value.undoRedo.undo()
  }
  if (event.ctrlKey && event.code === 'KeyY') {
    //page.value.undoRedo.redo()
  }

  if (
    event.code === 'F2' &&
    page.value.activeElem.react.elem instanceof PageNote
  ) {
    page.value.editing.start(page.value.activeElem.react.elem);
  }

  if (event.code === 'ArrowLeft') {
    page.value.selection.shift(-1, 0);
  }
  if (event.code === 'ArrowRight') {
    page.value.selection.shift(1, 0);
  }
  if (event.code === 'ArrowUp') {
    page.value.selection.shift(0, -1);
  }
  if (event.code === 'ArrowDown') {
    page.value.selection.shift(0, 1);
  }
}
function onKeyPress(event: KeyboardEvent) {
  if (
    (event.target as HTMLElement).nodeName === 'INPUT' ||
    (event.target as HTMLElement).nodeName === 'TEXTAREA' ||
    (event.target as HTMLElement).isContentEditable
  )
    return;

  if (page.value.activeElem.react.elem instanceof PageNote) {
    page.value.editing.start(page.value.activeElem.react.elem);
  }
}

onBeforeUnmount(() => {
  document.removeEventListener('keypress', onKeyPress);
  document.removeEventListener('keydown', onKeyDown);
});

// Clipboard pasting

onMounted(() => {
  document.addEventListener('paste', onPaste);
});

function onPaste(event: ClipboardEvent) {
  if (
    (event.target as HTMLElement).nodeName === 'INPUT' ||
    (event.target as HTMLElement).nodeName === 'TEXTAREA' ||
    (event.target as HTMLElement).isContentEditable
  )
    return;

  const text = (event.clipboardData || window.clipboardData).getData('text');

  page.value.clipboard.paste(text);
}

onBeforeUnmount(() => {
  document.removeEventListener('paste', onPaste);
});

// Mark app as mounted

onMounted(async () => {
  await (async function tokenRefreshLoop() {
    await tryRefreshTokens(api);

    setTimeout(tokenRefreshLoop, 10000);
  })();

  if (!auth.loggedIn) {
    location.assign(homeURL);
    return;
  }

  mainStore.mounted = true;
});
</script>
