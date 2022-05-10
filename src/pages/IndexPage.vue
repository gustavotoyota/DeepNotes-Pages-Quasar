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
import { DeepNotesApp } from 'src/code/app/app';
import { AppPage } from 'src/code/app/page/page';
import { factory } from 'src/code/static/composition-root';
import ContentDisplay from 'src/components/ContentDisplay/ContentDisplay.vue';
import { usePageCache } from 'src/stores/page-cache';
import { inject, onMounted, provide, shallowRef } from 'vue';

const app = inject<DeepNotesApp>('app')!;

const pageCache = usePageCache();

const page = shallowRef<AppPage>();

provide('page', page);

onMounted(async () => {
  page.value = factory.makePage(app, '52bd9bc3-c28c-4185-82f7-6c5be30c9ce3a');

  pageCache.addPage(page.value);

  await page.value.collab.preSync();

  page.value.postSync();
});
</script>
