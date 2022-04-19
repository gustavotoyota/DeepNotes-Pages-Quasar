<template>
  <div
    class="display-background"
    @pointerdown.left="onPointerDown"
    @dblclick.left="onDoubleClick"
  ></div>
</template>

<script
  setup
  lang="ts"
>
import { DeepNotesApp } from 'src/boot/app/app';
import { AppPage } from 'src/boot/app/page/page';
import { inject } from 'vue';

const app = inject<DeepNotesApp>('app')!;

const page = inject<AppPage>('page')!;

function onPointerDown(event: PointerEvent) {
  page.boxSelection.start(event);
}

function onDoubleClick(event: MouseEvent) {
  const clientPos = page.pos.eventToClient(event);

  page.notes.createFromTemplate(app.templates.react.default, clientPos);
}
</script>

<style scoped>
.display-background {
  position: absolute;

  left: 0;
  right: 0;
  top: 0;
  bottom: 0;

  background-color: #181818;
}
</style>
