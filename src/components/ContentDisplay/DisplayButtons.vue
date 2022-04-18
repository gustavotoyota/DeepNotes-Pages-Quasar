<template>
  <div class="display-buttons">
    <DisplayButton icon="mdi-magnify-remove-outline" />

    <SpaceGap style="height: 4px" />

    <DisplayButton icon="mdi-image-filter-center-focus-weak" />
  </div>
</template>

<script
  setup
  lang="ts"
>
import { AppPage } from 'src/boot/app/page/page';
import { inject } from 'vue';
import SpaceGap from '../misc/SpaceGap.vue';
import DisplayButton from '../misc/DisplayButton.vue';

const page = inject<AppPage>('page');
</script>

<style scoped>
.display-buttons {
  position: absolute;

  right: 16px;
  top: 16px;

  display: flex;
  flex-direction: column;
}
</style>
