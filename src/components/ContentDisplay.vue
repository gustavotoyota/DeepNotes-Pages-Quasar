<template>
  <div class="display">
    <loading-overlay />
  </div>
</template>

<script
  setup
  lang="ts"
>
import { Page } from 'src/boot/app/page/page';
import LoadingOverlay from './LoadingOverlay.vue';

defineProps<{
  page: Page;
}>();
</script>

<style scoped>
.display {
  position: absolute;

  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}
</style>
