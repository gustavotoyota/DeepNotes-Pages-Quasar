import { defineStore } from 'pinia';
import { AppPage, IPageReference } from 'src/code/app/page/page';
import { computed, reactive, toRefs } from 'vue';

import { usePageCache } from './page-cache';

export const useMainStore = defineStore('main-store', () => {
  // State

  const state = reactive({
    mounted: false,

    pageId: null as string | null,

    pathPages: [] as IPageReference[],
    recentPages: [] as IPageReference[],
  });

  // Getters

  const page = computed(() => {
    const pageCache = usePageCache();

    return pageCache.cache.find((page) => {
      return page.id === state.pageId;
    }) as AppPage;
  });

  // Actions

  async function fetchData() {
    //
  }

  return {
    ...toRefs(state),

    page,

    fetchData,
  };
});

export type MainStore = ReturnType<typeof useMainStore>;
