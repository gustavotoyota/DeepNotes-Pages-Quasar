<template>
  <q-drawer
    show-if-above
    :mini="uiStore.rightSidebarMini"
    side="right"
    bordered
    no-swipe-Mini
    no-swipe-close
    no-swipe-backdrop
    behavior="desktop"
  >
    <q-toolbar>
      <q-avatar
        icon="mdi-animation"
        size="50px"
        style="margin-left: -9px"
      />

      <q-toolbar-title
        v-if="!uiStore.rightSidebarMini"
        style="margin-left: 6px"
      >
        Properties
      </q-toolbar-title>
    </q-toolbar>
  </q-drawer>
</template>

<script
  setup
  lang="ts"
>
import { useUIStore } from 'src/stores/ui-store';

const uiStore = useUIStore();
</script>
