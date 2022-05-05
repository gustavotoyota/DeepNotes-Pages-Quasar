<template>
  <div
    v-if="boxSelection.react.active"
    class="box-selection"
    :style="{
      left: `${Math.min(
        boxSelection.react.displayStart.x,
        boxSelection.react.displayEnd.x
      )}px`,
      top: `${Math.min(
        boxSelection.react.displayStart.y,
        boxSelection.react.displayEnd.y
      )}px`,
      width: `${Math.abs(
        boxSelection.react.displayEnd.x - boxSelection.react.displayStart.x
      )}px`,
      height: `${Math.abs(
        boxSelection.react.displayEnd.y - boxSelection.react.displayStart.y
      )}px`,
    }"
  ></div>
</template>

<script
  setup
  lang="ts"
>
import { AppPage } from 'src/code/app/page/page';
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
