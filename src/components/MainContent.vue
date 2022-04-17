<template>
  <q-page>
    <div class="display">
      <loading-overlay />
    </div>
  </q-page>
</template>

<script
  setup
  lang="ts"
>
import LoadingOverlay from './LoadingOverlay.vue';
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
