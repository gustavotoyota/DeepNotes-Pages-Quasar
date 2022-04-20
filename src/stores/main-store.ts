import { defineStore } from 'pinia';
import { AppPage, IPageReference } from 'src/boot/app/page/page';
import { computed, reactive, toRefs, watchEffect } from 'vue';
import { usePageCache } from './page-cache';

declare global {
  // eslint-disable-next-line no-var
  var __DEEP_NOTES__: {
    zoom?: number;
  };
}

export const useMainStore = defineStore('main-store', () => {
  // State

  const state = reactive({
    mounted: false,

    currentPageId: null as string | null,

    pathPages: [] as IPageReference[],
    recentPages: [] as IPageReference[],
  });

  // Getters

  const currentPage = computed(() => {
    const pageCache = usePageCache();

    return pageCache.cache.find((page) => {
      return page.id === state.currentPageId;
    }) as AppPage;
  });

  // Actions

  async function fetchData() {
    console.log('Fetch data here');
  }

  // Zoom watching for quill-cursors

  globalThis.__DEEP_NOTES__ = {};

  watchEffect(() => {
    if (currentPage.value == null) {
      return;
    }

    globalThis.__DEEP_NOTES__.zoom = currentPage.value.camera.react._zoom;
  });

  return {
    ...toRefs(state),

    currentPage,

    fetchData,
  };
});

export type MainStore = ReturnType<typeof useMainStore>;
