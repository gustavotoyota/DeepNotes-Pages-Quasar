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
      style="min-height: 36.45px"
      :style="{
        height: note.react.container.height,
      }"
    ></div>
  </div>
</template>

<script
  setup
  lang="ts"
>
import { PageNote } from 'src/boot/app/page/notes/note';
import { AppPage } from 'src/boot/app/page/page';
import { inject } from 'vue';

const page = inject<AppPage>('page')!;
const note = inject<PageNote>('note')!;
</script>
