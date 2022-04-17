<template>
  <q-page>
    <ContentDisplay
      v-if="page != null"
      :page="page"
    />
  </q-page>
</template>

<script
  setup
  lang="ts"
>
import { DeepNotesApp } from 'src/boot/app/app';
import { factory } from 'src/boot/app/composition-root';
import { Page } from 'src/boot/app/page/page';
import ContentDisplay from 'src/components/ContentDisplay.vue';
import { inject, onMounted, provide, shallowRef } from 'vue';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const app = inject<DeepNotesApp>('app')!;

const page = shallowRef<Page>();

provide('page', page);

onMounted(() => {
  page.value = factory.makePage(app, '');
});
</script>
