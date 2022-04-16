<template>
  <q-item
    clickable
    :active="active"
    active-class="bg-grey-9 text-grey-1"
    v-ripple
  >
    <q-item-section avatar>
      <q-icon name="mdi-note" />
    </q-item-section>
    <q-item-section>
      {{ name }}
    </q-item-section>

    <q-tooltip
      v-if="uiStore.leftSidebarMini"
      anchor="center right"
      self="center left"
      :offset="[10, 10]"
      max-width="200px"
      transition-show="jump-right"
      transition-hide="jump-left"
    >
      {{ name }}
    </q-tooltip>
  </q-item>
</template>

<script
  setup
  lang="ts"
>
import { useUIStore } from 'src/stores/ui-store';

defineProps<{
  active?: boolean;
  name: string;
}>();

const uiStore = useUIStore();
</script>
