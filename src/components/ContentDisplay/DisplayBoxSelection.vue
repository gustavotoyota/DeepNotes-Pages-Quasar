<template>
  <div
    v-if="page.boxSelection.react.active"
    class="selection"
    :style="{
      left: `${Math.min(
        page.boxSelection.react.startPos.x,
        page.boxSelection.react.endPos.x
      )}px`,
      top: `${Math.min(
        page.boxSelection.react.startPos.y,
        page.boxSelection.react.endPos.y
      )}px`,
      width: `${Math.abs(
        page.boxSelection.react.endPos.x - page.boxSelection.react.startPos.x
      )}px`,
      height: `${Math.abs(
        page.boxSelection.react.endPos.y - page.boxSelection.react.startPos.y
      )}px`,
    }"
  ></div>
</template>

<script
  setup
  lang="ts"
>
import { AppPage } from 'src/boot/app/page/page';
import { inject } from 'vue';

const page = inject<AppPage>('page');
</script>
