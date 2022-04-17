import { defineStore } from 'pinia';
import { AppPage } from 'src/boot/app/page/page';
import { usePageCache } from './page-cache';

export interface IPageReference {
  id: string;
  name: string;
}

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
});

export type MainStore = ReturnType<typeof useMainStore>;