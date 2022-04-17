import { defineStore } from 'pinia';
import { AppPage } from 'src/boot/app/page/page';

export const usePageCache = defineStore('page-cache', {
  state: () => ({
    cache: [] as AppPage[],
  }),

  getters: {},

  actions: {},
});
