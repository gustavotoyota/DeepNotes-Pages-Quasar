<template>
  <q-drawer
    show-if-above
    :mini="uiStore.leftSidebarMini"
    side="left"
    bordered
    no-swipe-Mini
    no-swipe-close
    no-swipe-backdrop
    behavior="desktop"
  >
    <q-toolbar style="width: 299px">
      <q-avatar
        icon="mdi-animation"
        size="50px"
        style="margin-left: -9px"
      />

      <q-toolbar-title style="margin-left: 6px"> Path </q-toolbar-title>

      <div style="margin-right: -5px">
        <q-btn
          flat
          round
          size="12px"
        >
          <q-icon
            name="mdi-arrow-up"
            size="24px"
          />
        </q-btn>

        <q-btn
          flat
          round
          size="12px"
        >
          <q-icon
            name="mdi-arrow-down"
            size="24px"
          />
        </q-btn>
      </div>
    </q-toolbar>

    <q-list
      :class="{
        mini: uiStore.leftSidebarMini,
      }"
    >
      <MiniSidebarPage
        name="Main pagesdf sdh fkjhsdkf hshdkjfh kjsdhf ksjdh fkjsjkd fjks hdkfh"
        :active="true"
      />

      <MiniSidebarPage name="Another page" />

      <MiniSidebarPage name="Another page" />
    </q-list>
  </q-drawer>
</template>

<script
  setup
  lang="ts"
>
import { useUIStore } from 'src/stores/ui-store';

import MiniSidebarPage from './misc/MiniSidebarPage.vue';

const uiStore = useUIStore();
</script>
