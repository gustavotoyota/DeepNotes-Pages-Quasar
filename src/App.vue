<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useMainStore } from './stores/main-store';

export default defineComponent({
  name: 'App',

  async preFetch() {
    const mainStore = useMainStore();

    await mainStore.fetchData();
  },
});
</script>
