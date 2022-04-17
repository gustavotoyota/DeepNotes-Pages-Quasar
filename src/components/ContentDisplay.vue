<template>
  <LoadingOverlay />
</template>

<script
  setup
  lang="ts"
>
import { AppPage } from 'src/boot/app/page/page';
import LoadingOverlay from './misc/LoadingOverlay.vue';

defineProps<{
  page: AppPage;
}>();
</script>

<style scoped></style>
