<template>
  <div
    class="display-background"
    @pointerdown.left="onPointerDown"
  ></div>
</template>

<script
  setup
  lang="ts"
>
import { AppPage } from 'src/boot/app/page/page';
import { inject } from 'vue';

const page = inject<AppPage>('page')!;

function onPointerDown(event: PointerEvent) {
  page.boxSelection.start(event);
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
