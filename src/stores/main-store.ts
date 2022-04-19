import { defineStore } from 'pinia';
import { AppPage, IPageReference } from 'src/boot/app/page/page';
import { computed, reactive, toRefs } from 'vue';
import { usePageCache } from './page-cache';

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

  return {
    ...toRefs(state),

    currentPage,

    fetchData,
  };
});

/*
{
  state: () => ({
    mounted: false,

    currentPageId: null,

    pathPages: [] as IPageReference[],
    recentPages: [] as IPageReference[],
  }),

  getters: {
    currentPageIndex(state) {
      return state.pathPages.findIndex(
        (item) => item.id === state.currentPageId
      );
    },

    currentPage(state): AppPage | null {
      const pageCache = usePageCache();

      return (
        pageCache.cache.find((page) => {
          return page.id === state.currentPageId;
        }) ?? null
      );
    },
  },

  actions: {
    async fetchData() {
      console.log('Fetch data here');
    },
  },
}
*/

export type MainStore = ReturnType<typeof useMainStore>;
