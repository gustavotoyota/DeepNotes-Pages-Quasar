<template>
  <div style="display: contents">
    <div style="color: #a0a0a0">
      Drag and drop templates to change their order.
    </div>

    <Gap style="height: 16px" />

    <div style="display: flex">
      <q-btn
        label="Select all"
        color="primary"
        @click="selectAll()"
      />

      <Gap style="width: 16px" />

      <q-btn
        label="Deselect all"
        color="primary"
        @click="deselectAll()"
      />
    </div>

    <Gap style="height: 16px" />

    <div style="flex: 1; height: 0; display: flex">
      <div style="flex: 1">
        <q-list
          style="
            border-radius: 10px;
            max-height: 100%;
            padding: 0;
            overflow-y: auto;
          "
        >
          <draggable
            v-model="templates"
            item-key="id"
          >
            <template #item="{ element: template }">
              <q-item
                :key="template.id"
                class="text-grey-1"
                style="background-color: #424242"
                clickable
                v-ripple
                active-class="bg-grey-7"
                :active="selectedTemplates.has(template.id)"
                @click="toggleSelection(template.id)"
              >
                <q-item-section>{{ template.name }}</q-item-section>

                <q-item-section
                  v-if="template.id === defaultTemplateId"
                  side
                >
                  <q-icon name="mdi-check-circle" />
                </q-item-section>

                <q-item-section side>
                  <q-icon
                    :name="template.visible ? 'mdi-eye' : 'mdi-eye-off'"
                  />
                </q-item-section>
              </q-item>
            </template>
          </draggable>
        </q-list>
      </div>

      <div
        style="
          flex: none;
          margin-left: 16px;
          width: 200px;
          display: flex;
          flex-direction: column;
        "
      >
        <q-btn
          label="Set as default"
          color="primary"
          :disable="
            selectedTemplate == null || selectedTemplate.id == defaultTemplateId
          "
          @click="defaultTemplateId = selectedTemplate?.id ?? ''"
        />

        <Gap style="height: 16px" />

        <q-btn
          label="Rename"
          color="primary"
          :disable="selectedTemplate == null"
        />

        <Gap style="height: 16px" />

        <q-btn
          label="Toggle visibility"
          color="primary"
          :disable="selectedTemplates.size === 0"
          @click="toggleVisibility()"
        />

        <Gap style="height: 16px" />

        <q-btn
          label="Delete"
          color="primary"
          :disable="selectedTemplates.size === 0"
          @click="deleteSelection()"
        />
      </div>
    </div>
  </div>
</template>

<script
  setup
  lang="ts"
>
import Gap from '../misc/Gap.vue';
import { ITemplate, useTemplates } from 'src/stores/templates';
import { computed, reactive, ref } from 'vue';
import { Notify } from 'quasar';
import { remove } from 'lodash';
import draggable from 'vuedraggable';

const templates = ref([] as ITemplate[]);
const defaultTemplateId = ref('');

const selectedTemplates = reactive(new Set<string>());

const selectedTemplate = computed(() => {
  if (selectedTemplates.size !== 1) {
    return null;
  }

  return templates.value.find(
    (item) => item.id === selectedTemplates.values().next().value
  ) as ITemplate;
});

function selectAll() {
  for (const template of templates.value) {
    selectedTemplates.add(template.id);
  }
}
function deselectAll() {
  for (const template of templates.value) {
    selectedTemplates.delete(template.id);
  }
}

function toggleSelection(templateId: string) {
  if (selectedTemplates.has(templateId)) {
    selectedTemplates.delete(templateId);
  } else {
    selectedTemplates.add(templateId);
  }
}

function toggleVisibility() {
  let allVisible = true;
  for (const templateId of selectedTemplates) {
    const template = templates.value.find(
      (item) => item.id === templateId
    ) as ITemplate;

    if (template.visible) continue;

    allVisible = false;
    break;
  }

  for (const templateId of selectedTemplates) {
    const template = templates.value.find(
      (item) => item.id === templateId
    ) as ITemplate;

    template.visible = !allVisible;
  }
}

function deleteSelection() {
  // Check if default template is selected

  for (const templateId of selectedTemplates) {
    const template = templates.value.find(
      (item) => item.id === templateId
    ) as ITemplate;

    if (defaultTemplateId.value !== template.id) continue;

    Notify.create({
      message: 'Default template cannot be deleted',
      color: 'negative',
    });

    return;
  }

  remove(templates.value, (template) => selectedTemplates.has(template.id));

  selectedTemplates.clear();
}

async function save() {
  const templatesStore = useTemplates();

  templatesStore.list = templates.value;
  templatesStore.defaultId = defaultTemplateId.value;
}

defineExpose({
  templates,
  defaultTemplateId,
  selectedTemplates,
  save,
});
</script>
