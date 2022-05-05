<template>
  <q-header elevated>
    <q-toolbar
      class="bg-grey-10"
      style="padding: 0; justify-content: center; overflow: hidden"
    >
      <q-btn
        round
        style="
          border-top-left-radius: 0;
          border-bottom-left-radius: 0;
          min-height: 50px;
          min-width: 50px;
        "
        class="bg-grey-9"
        @click="uiStore.toggleLeftSidebar()"
      >
        <q-icon
          style="position: relative; left: -2px"
          :name="
            uiStore.leftSidebarMini ? 'mdi-chevron-right' : 'mdi-chevron-left'
          "
        />
      </q-btn>

      <div style="flex: 1; width: 0; display: flex">
        <div
          style="
            flex: 1;
            width: 0;
            display: flex;
            overflow: hidden;
            align-items: center;
          "
        >
          <Gap style="width: 8px" />

          <ToolbarBtn
            tooltip="Cut"
            icon="mdi-content-cut"
            :disabled="!page.activeElem.react.exists"
            @click="page.clipboard.cut()"
          />
          <ToolbarBtn
            tooltip="Copy"
            icon="mdi-content-copy"
            :disabled="!page.activeElem.react.exists"
            @click="page.clipboard.copy()"
          />
          <ToolbarBtn
            tooltip="Paste"
            icon="mdi-content-paste"
            @click="page.clipboard.paste()"
          />
          <ToolbarBtn
            tooltip="Duplicate"
            icon="mdi-content-duplicate"
            :disabled="!page.activeElem.react.exists"
            @click="page.cloning.perform()"
          />

          <q-separator
            vertical
            style="margin: 0 7px"
          />

          <ToolbarBtn
            tooltip="Undo"
            icon="mdi-undo"
          />
          <ToolbarBtn
            tooltip="Redo"
            icon="mdi-redo"
          />

          <q-separator
            vertical
            style="margin: 0 7px"
          />

          <ToolbarBtn
            tooltip="Select all"
            icon="mdi-select-all"
            size="24px"
            @click="page.selection.selectAll()"
          />
          <ToolbarBtn
            tooltip="Delete"
            icon="mdi-delete-outline"
            size="24px"
            :disabled="!page.activeElem.react.exists"
            @click="page.deleting.perform()"
          />

          <q-separator
            vertical
            style="margin: 0 7px"
          />

          <ToolbarBtn
            tooltip="Align left"
            icon="mdi-format-align-left"
            size="21px"
            :disabled="!page.activeElem.react.exists"
            @click="format('formatLine', 'align', '')"
          />
          <ToolbarBtn
            tooltip="Align center"
            icon="mdi-format-align-center"
            size="21px"
            :disabled="!page.activeElem.react.exists"
            @click="format('formatLine', 'align', 'center')"
          />
          <ToolbarBtn
            tooltip="Align right"
            icon="mdi-format-align-right"
            size="21px"
            :disabled="!page.activeElem.react.exists"
            @click="format('formatLine', 'align', 'right')"
          />
          <ToolbarBtn
            tooltip="Justify"
            icon="mdi-format-align-justify"
            size="21px"
            :disabled="!page.activeElem.react.exists"
            @click="format('formatLine', 'align', 'justify')"
          />

          <q-separator
            vertical
            style="margin: 0 7px"
          />

          <ToolbarBtn
            tooltip="Header 1"
            icon="mdi-format-header-1"
            size="24px"
            :disabled="!page.activeElem.react.exists"
            @click="format('formatLine', 'header', 1)"
          />
          <ToolbarBtn
            tooltip="Header 2"
            icon="mdi-format-header-2"
            size="24px"
            :disabled="!page.activeElem.react.exists"
            @click="format('formatLine', 'header', 2)"
          />

          <q-separator
            vertical
            style="margin: 0 7px"
          />

          <ToolbarBtn
            tooltip="Clear formatting"
            icon="mdi-format-clear"
            size="24px"
            :disabled="!page.activeElem.react.exists"
            @click="format('removeFormat')"
          />
        </div>

        <Gap style="width: 6px" />

        <ToolbarBtn
          tooltip="Home"
          icon="mdi-home"
          size="28px"
          round
          :href="
            process.env.DEV
              ? 'http://localhost:60379/'
              : 'https://deepnotes.app/'
          "
        />

        <Gap style="width: 2px" />

        <SettingsDialog />

        <Gap style="width: 2px" />

        <ToolbarBtn
          tooltip="Account"
          icon="mdi-account-circle"
          size="28px"
          round
        />

        <Gap style="width: 10px" />
      </div>

      <q-btn
        dense
        round
        style="
          border-top-right-radius: 0;
          border-bottom-right-radius: 0;
          min-height: 50px;
          min-width: 50px;
        "
        class="bg-grey-9"
        @click="uiStore.toggleRightSidebar()"
      >
        <q-icon
          :name="
            uiStore.rightSidebarMini ? 'mdi-chevron-left' : 'mdi-chevron-right'
          "
          style="position: relative; right: -2px"
        />
      </q-btn>
    </q-toolbar>
  </q-header>
</template>

<script
  setup
  lang="ts"
>
import { NoteTextSection } from 'src/code/app/page/notes/note';
import Gap from 'src/components/misc/Gap.vue';
import ToolbarBtn from 'src/components/misc/ToolbarBtn.vue';
import { useMainStore } from 'src/stores/main-store';
import { useUIStore } from 'src/stores/ui-store';
import { toRef } from 'vue';

import SettingsDialog from './MainToolbar/SettingsDialog.vue';

const uiStore = useUIStore();

const mainStore = useMainStore();

const page = toRef(mainStore, 'page');

function format(funcName: 'formatLine' | 'removeFormat', ...args: any[]) {
  page.value.collab.doc.transact(() => {
    for (const selectedNote of page.value.selection.react.notes) {
      for (const section of ['head', 'body'] as NoteTextSection[]) {
        const quill = selectedNote.react[section].quill;

        if (quill == null) continue;

        const selection = quill.getSelection();

        if (quill.isEnabled()) {
          if (selection != null)
            quill[funcName](selection.index, selection.length, ...args);
        } else quill[funcName](0, Infinity, ...args);
      }
    }
  });
}
</script>

<style scoped>
.q-header {
  transition: left 0.2s ease, right 0.2s ease;
}
</style>
