<template>
  <q-btn
    dense
    round
    style="min-height: 50px; min-width: 50px"
    :style="{
      [`border-top-${side}-radius`]: 0,
      [`border-bottom-${side}-radius`]: 0,
    }"
    class="bg-grey-9"
    @click="uiStore[`toggle${capitalize(side)}Sidebar`]()"
  >
    <q-icon
      :name="
        uiStore[`${side}SidebarMini`]
          ? `mdi-chevron-${otherSide}`
          : `mdi-chevron-${side}`
      "
      style="position: relative"
      :style="{ [side]: -2 + 'px' }"
    />
  </q-btn>
</template>

<script
  setup
  lang="ts"
>
import { capitalize } from 'src/boot/static/string';
import { useUIStore } from 'src/stores/ui-store';

const props = defineProps<{
  side: string;
}>();

const otherSide = props.side === 'left' ? 'right' : 'left';

const uiStore = useUIStore();
</script>
