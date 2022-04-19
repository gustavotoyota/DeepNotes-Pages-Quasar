<template>
  <div
    class="display"
    @wheel="onWheel"
    @pointerdown.middle.prevent="onMiddlePointerDown"
  >
    <DisplayBackground />
    <DisplayNotes />
    <DisplayBoxSelection />
    <DisplayBtns />

    <LoadingOverlay v-if="!page.react.loaded" />
  </div>
</template>

<script
  setup
  lang="ts"
>
import { AppPage } from 'src/boot/app/page/page';
import { provide } from 'vue';
import LoadingOverlay from './misc/LoadingOverlay.vue';
import DisplayBackground from './ContentDisplay/DisplayBackground.vue';
import DisplayBoxSelection from './ContentDisplay/DisplayBoxSelection.vue';
import DisplayBtns from './ContentDisplay/DisplayBtns.vue';
import DisplayNotes from './ContentDisplay/DisplayNotes.vue';

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

<style scoped></style>
