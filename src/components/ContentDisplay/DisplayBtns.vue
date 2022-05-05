<template>
  <div class="display-btns">
    <DisplayBtn
      icon="mdi-magnify-remove-outline"
      @click="page.camera.resetZoom()"
    />

    <Gap style="height: 4px" />

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
import { AppPage } from 'src/code/app/page/page';
import { inject } from 'vue';

import DisplayBtn from '../misc/DisplayBtn.vue';
import Gap from '../misc/Gap.vue';

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
