<template>
  <div
    class="display"
    @wheel="onWheel"
  >
    <DisplayBackground />
    <DisplayBoxSelection />
    <DisplayButtons />

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
import DisplayButtons from './ContentDisplay/DisplayButtons.vue';

const props = defineProps<{
  page: AppPage;
}>();

provide('page', props.page);

function onWheel(event: WheelEvent) {
  props.page.zooming.perform(event);
}
</script>

<style scoped></style>
