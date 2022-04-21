<template>
  <q-layout
    view="lHr lpR fFf"
    v-show="mainStore.mounted"
  >
    <template v-if="mainStore.page != null">
      <MainToolbar />

      <LeftSidebar />
      <RightSidebar />
    </template>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>

  <loading-overlay v-if="mainStore.mounted !== true" />
</template>

<script
  setup
  lang="ts"
>
import MainToolbar from '../components/MainToolbar.vue';
import LeftSidebar from '../components/LeftSidebar.vue';
import RightSidebar from 'src/components/RightSidebar/RightSidebar.vue';
import LoadingOverlay from 'src/components/misc/LoadingOverlay.vue';

import { useMainStore } from 'src/stores/main-store';

const mainStore = useMainStore();
</script>

<style>
* {
  touch-action: pan-x pan-y;
}
*:not(input) {
  user-select: none;
}

html,
body {
  overflow: hidden;
}

.q-tooltip {
  font-size: 12px;
}

.q-drawer {
  transition: width 0.2s ease;
  overflow-x: hidden;
}
.q-drawer__content {
  overflow-x: hidden;
}
.q-drawer:not(.q-drawer--mini) .q-drawer__content {
  width: 299px !important;
}
.q-drawer.q-drawer--mini .q-item {
  justify-content: normal !important;
  padding-left: 16px !important;
}
.q-drawer .q-item {
  justify-content: normal !important;
  padding-left: 16px !important;
}

.q-page-container {
  transition: padding-left 0.2s ease, padding-right 0.2s ease;
}

/* Scrollbars */

::-webkit-scrollbar {
  width: 15px;
}
::-webkit-scrollbar-track {
  background: #202020;
}
::-webkit-scrollbar-thumb {
  background: #303030;
  border: solid 1px #404040;
}
::-webkit-scrollbar-thumb:hover {
  background: #404040;
}
</style>
