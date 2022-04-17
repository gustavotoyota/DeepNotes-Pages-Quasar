<template>
  <DisplayBackground />
  <DisplayBoxSelection />

  <LoadingOverlay v-if="!page.react.loaded" />
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

const props = defineProps<{
  page: AppPage;
}>();

provide('page', props.page);
</script>

<style scoped></style>
