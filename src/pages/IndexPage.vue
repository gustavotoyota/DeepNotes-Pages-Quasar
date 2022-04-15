<template>
  <q-page> </q-page>
</template>

<script
  setup
  lang="ts"
>
import { useMainStore } from 'src/stores/main-store';
import { onMounted } from 'vue';

onMounted(() => {
  const mainStore = useMainStore();

  console.log(mainStore.test);
});
</script>
