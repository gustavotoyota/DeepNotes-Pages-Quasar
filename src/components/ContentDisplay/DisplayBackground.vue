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
import { AppPage } from 'src/code/app/page/page';
import { useTemplates } from 'src/stores/templates';
import { inject } from 'vue';

const page = inject<AppPage>('page')!;

function onPointerDown(event: PointerEvent) {
  page.editing.stop();

  if (!event.ctrlKey && !event.shiftKey) {
    page.selection.clear(null);
  }

  page.boxSelection.start(event);
}

function onDoubleClick(event: MouseEvent) {
  const templates = useTemplates();

  const clientPos = page.pos.eventToClient(event);

  page.notes.createFromTemplate(templates.default, clientPos);
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
