<template>
  <div class="display-btns">
    <DisplayBtn
      icon="mdi-magnify-remove-outline"
      @click="page.camera.resetZoom()"
    />

    <SpaceGap style="height: 4px" />

    <DisplayBtn
      icon="mdi-image-filter-center-focus-weak"
      @click="page.camera.fitToScreen()"
    />
  </div>
</template>

<script
  setup
  lang="ts"
>
import SpaceGap from '../misc/SpaceGap.vue';
import DisplayBtn from '../misc/DisplayBtn.vue';
import { inject } from 'vue';
import { AppPage } from 'src/boot/app/page/page';

const page = inject<AppPage>('page')!;
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
