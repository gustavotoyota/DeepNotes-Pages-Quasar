<template>
  <router-view />
</template>

<script lang="ts">
import { defineComponent, onBeforeUnmount, onMounted } from 'vue';
import { useMainStore } from './stores/main-store';

export default defineComponent({
  name: 'App',

  async preFetch() {
    const mainStore = useMainStore();

    await mainStore.fetchData();
  },
});
</script>

<script
  setup
  lang="ts"
>
// Release pointer down for touchscreen

onMounted(() => {
  document.addEventListener('pointerdown', onPointerDownCapture, true);
});
function onPointerDownCapture(event: PointerEvent) {
  (event.target as Element).releasePointerCapture(event.pointerId);
}
onBeforeUnmount(() => {
  document.removeEventListener('pointerdown', onPointerDownCapture, true);
});

// Mark app as mounted

onMounted(() => {
  const mainStore = useMainStore();

  mainStore.mounted = true;
});
</script>
