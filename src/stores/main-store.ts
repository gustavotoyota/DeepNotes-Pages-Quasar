import { defineStore } from 'pinia';
import { AppPage, IPageReference } from 'src/boot/app/page/page';
import { usePageCache } from './page-cache';

export const useMainStore = defineStore('main-store', {
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
          return page.value.id === state.currentPageId;
        })?.value ?? null
      );
    },
  },

  actions: {
    async fetchData() {
      console.log('Fetch data here');
    },
  },
});

export type MainStore = ReturnType<typeof useMainStore>;
