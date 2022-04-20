<template>
  <q-list v-if="uiStore.rightSidebarMini">
    <q-item
      clickable
      v-ripple
    >
      Hello
    </q-item>
    <q-item
      clickable
      v-ripple
    >
      Hello
    </q-item>
    <q-item
      clickable
      v-ripple
    >
      Hello
    </q-item>
  </q-list>

  <div v-else>
    <!-- Link -->

    <div style="padding: 20px; display: flex; flex-direction: column">
      <q-input
        label="Link"
        :model-value="note.collab.link ?? 'None'"
        dense
        filled
        readonly
      />

      <SpaceGap style="height: 16px" />

      <q-btn
        label="Modify"
        color="primary"
        dense
      />
    </div>

    <q-separator />

    <!-- Head and body -->

    <div style="padding: 20px; display: flex; flex-direction: column">
      <div style="display: flex">
        <q-checkbox
          label="Head"
          v-model="note.collab.head.enabled"
          style="flex: 1; margin-left: -10px; margin-top: -10px"
        />

        <SpaceGap style="width: 16px" />

        <q-checkbox
          label="Body"
          v-model="note.collab.body.enabled"
          style="flex: 1; margin-left: -10px; margin-top: -10px"
        />
      </div>

      <SpaceGap style="height: 6px" />

      <div style="display: flex">
        <q-btn
          label="Swap"
          color="primary"
          dense
          style="flex: 1"
        />

        <SpaceGap style="width: 16px" />

        <q-btn
          label="Float"
          color="primary"
          dense
          style="flex: 1"
        />
      </div>
    </div>

    <q-separator />

    <div style="padding: 20px; display: flex; flex-direction: column">
      <q-btn
        label="Save as template"
        color="primary"
        style="flex: 1"
      />
    </div>

    <q-separator />

    <div style="padding: 20px; display: flex">
      <div style="flex: 1">
        <q-select
          label="X anchor"
          v-model="note.collab.anchor.x"
          :options="[
            { label: 'Left', value: 0 },
            { label: 'Center', value: 0.5 },
            { label: 'Right', value: 1 },
          ]"
          filled
          dense
          emit-value
          map-options
        />
      </div>

      <SpaceGap style="width: 16px" />

      <div style="flex: 1">
        <q-select
          label="Y anchor"
          v-model="note.collab.anchor.y"
          :options="[
            { label: 'Top', value: 0 },
            { label: 'Center', value: 0.5 },
            { label: 'Bottom', value: 1 },
          ]"
          filled
          dense
          emit-value
          map-options
        />
      </div>
    </div>

    <q-separator />

    <div
      style="
        padding: 20px;
        padding-bottom: 12px;
        display: flex;
        flex-direction: column;
      "
    >
      <div style="display: flex">
        <q-checkbox
          label="Collapsible"
          v-model="note.collab.collapsing.enabled"
          style="flex: 1; margin-left: -10px; margin-top: -10px"
        />

        <SpaceGap style="width: 16px" />

        <q-checkbox
          label="Collapsed"
          v-model="note.collab.collapsing.collapsed"
          :disable="!note.collab.collapsing.enabled"
          style="flex: 1; margin-left: -10px; margin-top: -10px"
        />
      </div>

      <SpaceGap style="height: 12px" />

      <div style="display: flex">
        <q-checkbox
          label="Local collapsing"
          v-model="note.collab.collapsing.localCollapsing"
          :disable="!note.collab.collapsing.enabled"
          style="flex: 1; margin-left: -10px; margin-top: -10px"
        />

        <SpaceGap style="width: 16px" />

        <q-checkbox
          label="Locally collapsed"
          v-model="note.react.locallyCollapsed"
          :disable="
            !note.collab.collapsing.enabled ||
            !note.collab.collapsing.localCollapsing
          "
          style="flex: 1; margin-left: -10px; margin-top: -10px"
        />
      </div>
    </div>

    <q-separator />

    <div
      style="
        padding: 20px;
        padding-bottom: 12px;
        display: flex;
        flex-direction: column;
      "
    >
      <div style="display: flex">
        <q-checkbox
          label="Container"
          v-model="note.collab.container.enabled"
          style="flex: 1; margin-left: -10px; margin-top: -10px"
        />

        <SpaceGap style="width: 16px" />

        <q-checkbox
          label="Horizontal"
          v-model="note.collab.container.horizontal"
          :disable="!note.collab.container.enabled"
          style="flex: 1; margin-left: -10px; margin-top: -10px"
        />
      </div>

      <SpaceGap style="height: 12px" />

      <div style="display: flex">
        <q-checkbox
          label="Stretch children"
          v-model="note.collab.container.stretchChildren"
          :disable="!note.collab.container.enabled"
          style="flex: 1; margin-left: -10px; margin-top: -10px"
        />

        <SpaceGap style="width: 16px" />

        <q-checkbox
          label="Wrap children"
          v-model="note.collab.container.wrapChildren"
          :disable="!note.collab.container.enabled"
          style="flex: 1; margin-left: -10px; margin-top: -10px"
        />
      </div>
    </div>

    <q-separator />
  </div>
</template>

<script
  setup
  lang="ts"
>
import { PageNote } from 'src/boot/app/page/notes/note';
import { useMainStore } from 'src/stores/main-store';
import { useUIStore } from 'src/stores/ui-store';
import { toRef } from 'vue';
import SpaceGap from '../misc/SpaceGap.vue';

const uiStore = useUIStore();

const mainStore = useMainStore();

const page = toRef(mainStore, 'currentPage');
const note = page.value.activeElem.react.elem as PageNote;
</script>
