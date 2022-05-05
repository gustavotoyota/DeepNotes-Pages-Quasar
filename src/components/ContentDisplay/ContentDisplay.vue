<template>
  <div
    class="display"
    @wheel="onWheel"
    @pointerdown.middle.prevent="onMiddlePointerDown"
  >
    <template v-if="page.react.loaded">
      <DisplayBackground />
      <DisplayNotes />
      <DisplayBoxSelection />
      <DisplayBtns />
    </template>

    <LoadingOverlay v-else />
  </div>
</template>

<script
  setup
  lang="ts"
>
import { AppPage } from 'src/code/app/page/page';
import { provide } from 'vue';

import LoadingOverlay from '../misc/LoadingOverlay.vue';
import DisplayBackground from './DisplayBackground.vue';
import DisplayBoxSelection from './DisplayBoxSelection.vue';
import DisplayBtns from './DisplayBtns.vue';
import DisplayNotes from './DisplayNotes.vue';

const props = defineProps<{
  page: AppPage;
}>();

provide('page', props.page);

function onWheel(event: WheelEvent) {
  props.page.zooming.perform(event);
}

function onMiddlePointerDown(event: PointerEvent) {
  props.page.panning.start(event);
}
</script>

<style scoped>
.display {
  position: absolute;

  left: 0;
  top: 0;
  right: 0;
  bottom: 0;

  overflow: hidden;
}
</style>
