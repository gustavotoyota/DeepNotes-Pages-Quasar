<template>
  <div
    v-if="boxSelection.react.active"
    class="box-selection"
    :style="{
      left: `${Math.min(
        boxSelection.react.startPos.x,
        boxSelection.react.endPos.x
      )}px`,
      top: `${Math.min(
        boxSelection.react.startPos.y,
        boxSelection.react.endPos.y
      )}px`,
      width: `${Math.abs(
        boxSelection.react.endPos.x - boxSelection.react.startPos.x
      )}px`,
      height: `${Math.abs(
        boxSelection.react.endPos.y - boxSelection.react.startPos.y
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

const page = inject<AppPage>('page')!;
const boxSelection = page.boxSelection;
</script>

<style scoped>
.box-selection {
  position: absolute;

  border: 1px solid rgba(66, 165, 245, 0.8);

  background-color: rgba(33, 150, 243, 0.4);

  pointer-events: none;
}
</style>
