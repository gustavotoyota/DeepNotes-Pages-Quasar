<template>
  <q-layout view="lHr lpR fFf">
    <main-toolbar />

    <left-sidebar />
    <right-sidebar />

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script
  setup
  lang="ts"
>
import MainToolbar from '../components/MainToolbar.vue';
import LeftSidebar from '../components/LeftSidebar.vue';
import RightSidebar from 'src/components/RightSidebar.vue';
</script>

<style>
* {
  touch-action: pan-x pan-y;
}
*:not(input) {
  user-select: none;
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
