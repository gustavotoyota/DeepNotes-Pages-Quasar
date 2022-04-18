<template>
  <div class="display-btns">
    <DisplayBtn icon="mdi-magnify-remove-outline" />

    <SpaceGap style="height: 4px" />

    <DisplayBtn icon="mdi-image-filter-center-focus-weak" />
  </div>
</template>

<script
  setup
  lang="ts"
>
import SpaceGap from '../misc/SpaceGap.vue';
import DisplayBtn from '../misc/DisplayBtn.vue';
</script>

<style scoped>
.display-btns {
  position: absolute;

  right: 16px;
  top: 16px;

  display: flex;
  flex-direction: column;
}
</style>
