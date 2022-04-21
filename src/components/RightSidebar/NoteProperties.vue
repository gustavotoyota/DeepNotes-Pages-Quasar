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
          :model-value="note.collab.head.enabled"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.collab.head.enabled = value;
              note.collab.body.enabled ||= note.react.numSections === 0;
            })
          "
          style="flex: 1; margin-left: -10px; margin-top: -10px"
        />

        <SpaceGap style="width: 16px" />

        <q-checkbox
          label="Body"
          :model-value="note.collab.body.enabled"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.collab.body.enabled = value;
              note.collab.head.enabled ||= note.react.numSections === 0;
            })
          "
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
          @click="
            changeProp(note, (note, value) => {
              swapSyncedTexts(note.collab.head.value, note.collab.body.value);
            })
          "
        />

        <SpaceGap style="width: 16px" />

        <q-btn
          label="Float"
          color="primary"
          dense
          style="flex: 1"
          @click="
            changeProp(note, (note, value) => {
              if (note.collab.head.value.length <= 1) {
                swapSyncedTexts(note.collab.head.value, note.collab.body.value);
              }
            })
          "
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
          :model-value="note.collab.anchor.x"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.collab.anchor.x = value;
            })
          "
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
          :model-value="note.collab.anchor.y"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.collab.anchor.y = value;
            })
          "
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
          :model-value="note.collab.collapsing.enabled"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.collab.collapsing.enabled = value;
            })
          "
          style="flex: 1; margin-left: -10px; margin-top: -10px"
        />

        <SpaceGap style="width: 16px" />

        <q-checkbox
          label="Collapsed"
          :model-value="note.collab.collapsing.collapsed"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.collab.collapsing.collapsed = value;
            })
          "
          :disable="!note.collab.collapsing.enabled"
          style="flex: 1; margin-left: -10px; margin-top: -10px"
        />
      </div>

      <SpaceGap style="height: 12px" />

      <div style="display: flex">
        <q-checkbox
          label="Local collapsing"
          :model-value="note.collab.collapsing.localCollapsing"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.collab.collapsing.localCollapsing = value;
            })
          "
          :disable="!note.collab.collapsing.enabled"
          style="flex: 1; margin-left: -10px; margin-top: -10px"
        />

        <SpaceGap style="width: 16px" />

        <q-checkbox
          label="Locally collapsed"
          :model-value="note.react.collapsing.locallyCollapsed"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.react.collapsing.locallyCollapsed = value;
            })
          "
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
          :model-value="note.collab.container.enabled"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.collab.container.enabled = value;
              note.collab.body.enabled ||= note.react.numSections === 0;
            })
          "
          style="flex: 1; margin-left: -10px; margin-top: -10px"
        />

        <SpaceGap style="width: 16px" />

        <q-checkbox
          label="Horizontal"
          :model-value="note.collab.container.horizontal"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.collab.container.horizontal = value;
            })
          "
          :disable="!note.collab.container.enabled"
          style="flex: 1; margin-left: -10px; margin-top: -10px"
        />
      </div>

      <SpaceGap style="height: 12px" />

      <div style="display: flex">
        <q-checkbox
          label="Stretch children"
          :model-value="note.collab.container.stretchChildren"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.collab.container.stretchChildren = value;
            })
          "
          :disable="!note.collab.container.enabled"
          style="flex: 1; margin-left: -10px; margin-top: -10px"
        />

        <SpaceGap style="width: 16px" />

        <q-checkbox
          label="Wrap children"
          :model-value="note.collab.container.wrapChildren"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.collab.container.wrapChildren = value;
            })
          "
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
import { AppPage } from 'src/boot/app/page/page';
import { swapSyncedTexts } from 'src/boot/static/synced-store';
import { useUIStore } from 'src/stores/ui-store';
import { inject, Ref, toRef } from 'vue';
import SpaceGap from '../misc/SpaceGap.vue';

const uiStore = useUIStore();

const page = inject<Ref<AppPage>>('page')!;

const note = toRef(page.value.activeElem.react, 'note');

function changeProp(value: any, func: (note: PageNote, value: any) => void) {
  page.value.collab.doc.transact(() => {
    for (const note of page.value.selection.react.notes) {
      func(note as PageNote, value);
    }
  });
}
</script>
