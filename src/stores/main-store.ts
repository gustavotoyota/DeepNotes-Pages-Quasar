import { defineStore } from 'pinia';
import { Page } from 'src/boot/app/page/page';
import { usePageCache } from './page-cache';

export interface IPageReference {
  id: string;
  name: string;
}

export const useMainStore = defineStore('main-store', {
  state: () => ({
    currentPageId: null,

    pathPages: [] as IPageReference[],
    recentPages: [] as IPageReference[],

    test: null,
  }),

  getters: {
    currentPageIndex(state) {
      return state.pathPages.findIndex(
        (item) => item.id === state.currentPageId
      );
    },

    currentPage(state): Page | null {
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
      const res = await this.axios.get('https://yjs-server.deepnotes.app/');

      this.test = res.data;
    },
  },
});

export type MainStore = ReturnType<typeof useMainStore>;
