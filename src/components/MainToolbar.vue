<template>
  <q-header elevated>
    <q-toolbar
      class="bg-grey-10"
      style="padding: 0; justify-content: center; overflow: hidden"
    >
      <q-btn
        round
        :icon="
          uiStore.leftSidebarMini ? 'mdi-chevron-right' : 'mdi-chevron-left'
        "
        style="
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
          min-height: 50px;
          min-width: 50px;
        "
        class="bg-grey-9"
        @click="uiStore.toggleLeftSidebar()"
      />

      <div style="flex: 1; width: 0; display: flex">
        <space-gap style="width: 8px" />

        <toolbar-btn
          tooltip="Cut"
          icon="mdi-content-cut"
        />
        <toolbar-btn
          tooltip="Copy"
          icon="mdi-content-copy"
        />
        <toolbar-btn
          tooltip="Paste"
          icon="mdi-content-paste"
        />
        <toolbar-btn
          tooltip="Duplicate"
          icon="mdi-content-duplicate"
        />

        <q-separator
          vertical
          style="margin: 0 7px"
        />

        <toolbar-btn
          tooltip="Undo"
          icon="mdi-undo"
        />
        <toolbar-btn
          tooltip="Redo"
          icon="mdi-redo"
        />

        <q-separator
          vertical
          style="margin: 0 7px"
        />

        <toolbar-btn
          tooltip="Select all"
          icon="mdi-select-all"
          size="24px"
        />
        <toolbar-btn
          tooltip="Delete"
          icon="mdi-delete-outline"
          size="24px"
        />

        <q-separator
          vertical
          style="margin: 0 7px"
        />

        <toolbar-btn
          tooltip="Align left"
          icon="mdi-format-align-left"
          size="21px"
        />
        <toolbar-btn
          tooltip="Align center"
          icon="mdi-format-align-center"
          size="21px"
        />
        <toolbar-btn
          tooltip="Align right"
          icon="mdi-format-align-right"
          size="21px"
        />
        <toolbar-btn
          tooltip="Justify"
          icon="mdi-format-align-justify"
          size="21px"
        />

        <q-separator
          vertical
          style="margin: 0 7px"
        />

        <toolbar-btn
          tooltip="Header 1"
          icon="mdi-format-header-1"
          size="24px"
        />
        <toolbar-btn
          tooltip="Header 2"
          icon="mdi-format-header-2"
          size="24px"
        />

        <q-separator
          vertical
          style="margin: 0 7px"
        />

        <toolbar-btn
          tooltip="Clear formatting"
          icon="mdi-format-clear"
          size="24px"
        />

        <space-gap style="width: 8px" />
      </div>

      <q-btn
        dense
        round
        :icon="
          uiStore.rightSidebarMini ? 'mdi-chevron-left' : 'mdi-chevron-right'
        "
        style="
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
          min-height: 50px;
          min-width: 50px;
        "
        class="bg-grey-9"
        @click="uiStore.toggleRightSidebar()"
      />
    </q-toolbar>
  </q-header>
</template>

<script
  setup
  lang="ts"
>
import SpaceGap from 'src/components/misc/SpaceGap.vue';
import ToolbarBtn from 'src/components/misc/ToolbarBtn.vue';
import { useUIStore } from 'src/stores/ui-store';

const uiStore = useUIStore();
</script>

<style scoped>
.q-header {
  transition: left 0.2s ease, right 0.2s ease;
}
</style>
