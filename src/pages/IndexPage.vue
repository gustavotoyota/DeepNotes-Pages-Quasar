<template>
  <q-page>
    <div id="display">
      <ContentDisplay
        v-if="page != null"
        :page="page"
      />
    </div>
  </q-page>
</template>

<script
  setup
  lang="ts"
>
import { DeepNotesApp } from 'src/boot/app/app';
import { factory } from 'src/boot/app/composition-root';
import { AppPage } from 'src/boot/app/page/page';
import ContentDisplay from 'src/components/ContentDisplay.vue';
import { inject, onMounted, provide, shallowRef } from 'vue';

// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const app = inject<DeepNotesApp>('app')!;

const page = shallowRef<AppPage>();

provide('page', page);

onMounted(() => {
  page.value = factory.makePage(app, '');
});
</script>

<style scoped>
#display {
  position: absolute;

  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
}
</style>
