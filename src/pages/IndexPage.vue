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
import { factory } from 'src/boot/static/composition-root';
import { AppPage } from 'src/boot/app/page/page';
import ContentDisplay from 'src/components/ContentDisplay.vue';
import { inject, onMounted, provide, shallowRef } from 'vue';
import { usePageCache } from 'src/stores/page-cache';

const app = inject<DeepNotesApp>('app')!;

const pageCache = usePageCache();

const page = shallowRef<AppPage>();

provide('page', page);

onMounted(async () => {
  page.value = factory.makePage(app, '');

  pageCache.addPage(page.value);

  await page.value.collab.preSync();

  page.value.postSync();
});
</script>
