<template>
  <q-list v-if="uiStore.rightSidebarMini">
    <q-item
      clickable
      :active="page.camera.react.lockPos"
      @click="negateProp(page.camera.react, 'lockPos')"
    >
      <q-item-section avatar>
        <q-icon name="mdi-axis-arrow-lock" />
      </q-item-section>
    </q-item>

    <q-item
      clickable
      :active="page.camera.react.lockZoom"
      @click="negateProp(page.camera.react, 'lockZoom')"
    >
      <q-item-section avatar>
        <q-icon name="mdi-arrow-vertical-lock" />
      </q-item-section>
    </q-item>
  </q-list>

  <div></div>
</template>

<script
  setup
  lang="ts"
>
import { AppPage } from 'src/boot/app/page/page';
import { negateProp } from 'src/boot/static/utils';
import { useUIStore } from 'src/stores/ui-store';
import { inject, Ref } from 'vue';

const uiStore = useUIStore();

const page = inject<Ref<AppPage>>('page')!;
</script>
