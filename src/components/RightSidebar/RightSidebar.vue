<template>
  <q-drawer
    :mini="uiStore.rightSidebarMini"
    show-if-above
    side="right"
    bordered
    no-swipe-Mini
    no-swipe-close
    no-swipe-backdrop
    behavior="desktop"
    style="display: flex; flex-direction: column"
  >
    <q-toolbar style="flex: none">
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

    <div style="flex: 1; overflow-y: auto; background-color: rgb(33, 33, 33)">
      <template v-if="page.activeElem.react.elem != null">
        <note-properties v-if="page.activeElem.react.type === ElemType.NOTE" />
        <arrow-properties
          v-if="page.activeElem.react.type === ElemType.ARROW"
        />
      </template>

      <page-properties v-else />
    </div>
  </q-drawer>
</template>

<script
  setup
  lang="ts"
>
import { ElemType } from 'src/code/app/page/elems/elem';
import { useMainStore } from 'src/stores/main-store';
import { useUIStore } from 'src/stores/ui-store';
import NoteProperties from './NoteProperties.vue';
import ArrowProperties from './ArrowProperties.vue';
import PageProperties from './PageProperties.vue';
import { provide, toRef } from 'vue';

const uiStore = useUIStore();

const mainStore = useMainStore();

const page = toRef(mainStore, 'page');

provide('page', page);
</script>
