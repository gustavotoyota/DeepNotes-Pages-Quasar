<template>
  <q-list v-if="uiStore.rightSidebarMini">
    <MiniSidebarBtn
      tooltip="Head"
      icon="mdi-page-layout-header"
      :active="note.collab.head.enabled"
      @click="
        changeProp(!note.collab.head.enabled, (note, value) => {
          note.collab.head.enabled = value;
          note.collab.body.enabled ||= note.react.numEnabledSections === 0;
        })
      "
    />

    <MiniSidebarBtn
      tooltip="Swap head and body"
      icon="mdi-swap-vertical"
      @click="
        changeProp(true, (note, value) => {
          swapSyncedTexts(note.collab.head.value, note.collab.body.value);
        })
      "
    />

    <MiniSidebarBtn
      tooltip="Body"
      icon="mdi-page-layout-body"
      :active="note.collab.body.enabled"
      @click="
        changeProp(!note.collab.body.enabled, (note, value) => {
          note.collab.body.enabled = value;
          note.collab.head.enabled ||= note.react.numEnabledSections === 0;
        })
      "
    />

    <q-separator />

    <MiniSidebarBtn
      tooltip="Container"
      icon="mdi-page-layout-footer"
      :active="note.collab.container.enabled"
      @click="
        changeProp(!note.collab.container.enabled, (note, value) => {
          note.collab.container.enabled = value;
          note.collab.body.enabled ||= note.react.numEnabledSections === 0;
        })
      "
    />

    <q-separator />

    <MiniSidebarBtn
      tooltip="Collapsible"
      icon="mdi-minus-box"
      :active="note.collab.collapsing.enabled"
      @click="
        changeProp(!note.collab.collapsing.enabled, (note, value) => {
          note.collab.collapsing.enabled = value;
        })
      "
    />

    <MiniSidebarBtn
      :tooltip="note.react.collapsing.collapsed ? 'Expand' : 'Collapse'"
      :icon="
        note.react.collapsing.collapsed
          ? 'mdi-chevron-down-box-outline'
          : 'mdi-chevron-up-box-outline'
      "
      :active="note.react.collapsing.collapsed"
      :disabled="!note.collab.collapsing.enabled"
      @click="
        changeProp(!note.react.collapsing.collapsed, (note, value) => {
          note.react.collapsing.collapsed = value;
        })
      "
    />
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

      <Gap style="height: 16px" />

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
        <Checkbox
          label="Head"
          :value="note.collab.head.enabled"
          @update="
            changeProp($event, (note, value) => {
              note.collab.head.enabled = value;
              note.collab.body.enabled ||= note.react.numEnabledSections === 0;
            })
          "
        />

        <Gap style="width: 16px" />

        <Checkbox
          label="Body"
          :value="note.collab.body.enabled"
          @update="
            changeProp($event, (note, value) => {
              note.collab.body.enabled = value;
              note.collab.head.enabled ||= note.react.numEnabledSections === 0;
            })
          "
        />
      </div>

      <Gap style="height: 16px" />

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

        <Gap style="width: 16px" />

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

    <!-- Template -->

    <div style="padding: 20px; display: flex; flex-direction: column">
      <q-btn
        label="Save as template"
        color="primary"
        style="flex: 1"
      />
    </div>

    <q-separator />

    <!-- Anchor -->

    <div style="padding: 20px; display: flex">
      <div style="flex: 1">
        <q-select
          label="X anchor"
          :model-value="note.collab.anchor.x"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.collab.pos.x +=
                (value - note.collab.anchor.x) * note.react.worldSize.x;
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

      <Gap style="width: 16px" />

      <div style="flex: 1">
        <q-select
          label="Y anchor"
          :model-value="note.collab.anchor.y"
          @update:model-value="
            changeProp($event, (note, value) => {
              note.collab.pos.y +=
                (value - note.collab.anchor.y) * note.react.worldSize.y;
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

    <!-- Collapsing -->

    <div style="padding: 20px; display: flex; flex-direction: column">
      <div style="display: flex">
        <Checkbox
          label="Collapsible"
          :value="note.collab.collapsing.enabled"
          @update="
            changeProp($event, (note, value) => {
              note.collab.collapsing.enabled = value;
            })
          "
        />

        <Gap style="width: 16px" />

        <Checkbox
          label="Collapsed"
          :value="note.collab.collapsing.collapsed"
          @update="
            changeProp($event, (note, value) => {
              note.collab.collapsing.collapsed = value;
            })
          "
          :disable="!note.collab.collapsing.enabled"
        />
      </div>

      <Gap style="height: 16px" />

      <div style="display: flex">
        <Checkbox
          label="Local collapsing"
          :value="note.collab.collapsing.localCollapsing"
          @update="
            changeProp($event, (note, value) => {
              note.collab.collapsing.localCollapsing = value;
            })
          "
          :disable="!note.collab.collapsing.enabled"
        />

        <Gap style="width: 16px" />

        <Checkbox
          label="Locally collapsed"
          :value="note.react.collapsing.locallyCollapsed"
          @update="
            changeProp($event, (note, value) => {
              note.react.collapsing.locallyCollapsed = value;
            })
          "
          :disable="
            !note.collab.collapsing.enabled ||
            !note.collab.collapsing.localCollapsing
          "
        />
      </div>
    </div>

    <q-separator />

    <!-- Container -->

    <div style="padding: 20px; display: flex; flex-direction: column">
      <div style="display: flex">
        <Checkbox
          label="Container"
          :value="note.collab.container.enabled"
          @update="
            changeProp($event, (note, value) => {
              note.collab.container.enabled = value;
              note.collab.body.enabled ||= note.react.numEnabledSections === 0;
            })
          "
        />

        <Gap style="width: 16px" />

        <Checkbox
          label="Horizontal"
          :value="note.collab.container.horizontal"
          @update="
            changeProp($event, (note, value) => {
              note.collab.container.horizontal = value;
            })
          "
          :disable="!note.collab.container.enabled"
        />
      </div>

      <Gap style="height: 16px" />

      <div style="display: flex">
        <Checkbox
          label="Stretch children"
          :value="note.collab.container.stretchChildren"
          @update="
            changeProp($event, (note, value) => {
              note.collab.container.stretchChildren = value;
            })
          "
          :disable="!note.collab.container.enabled"
        />

        <Gap style="width: 16px" />

        <Checkbox
          label="Wrap children"
          :value="note.collab.container.wrapChildren"
          @update="
            changeProp($event, (note, value) => {
              note.collab.container.wrapChildren = value;
            })
          "
          :disable="!note.collab.container.enabled"
        />
      </div>
    </div>

    <q-separator />

    <div style="padding: 20px; display: flex">
      <Checkbox
        label="Movable"
        :value="note.collab.movable"
        @update="
          changeProp($event, (note, value) => {
            note.collab.movable = value;
          })
        "
      />

      <Gap style="width: 16px" />

      <Checkbox
        label="Resizable"
        :value="note.collab.resizable"
        @update="
          changeProp($event, (note, value) => {
            note.collab.resizable = value;
          })
        "
      />
    </div>

    <q-separator />

    <div style="padding: 20px; display: flex">
      <Checkbox
        label="Read-only"
        :value="note.collab.readOnly"
        @update="
          changeProp($event, (note, value) => {
            note.collab.readOnly = value;
          })
        "
      />

      <Gap style="width: 16px" />

      <div style="flex: 1"></div>
    </div>
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
import Gap from '../misc/Gap.vue';
import MiniSidebarBtn from '../misc/MiniSidebarBtn.vue';
import Checkbox from '../misc/Checkbox.vue';

const uiStore = useUIStore();

const page = inject<Ref<AppPage>>('page')!;

const note = toRef(page.value.activeElem.react, 'elem') as Ref<PageNote>;

function changeProp(value: any, func: (note: PageNote, value: any) => void) {
  page.value.collab.doc.transact(() => {
    for (const note of page.value.selection.react.notes) {
      func(note, value);
    }
  });
}
</script>
