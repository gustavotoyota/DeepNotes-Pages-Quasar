import { defineStore } from 'pinia';
import { Page } from 'src/boot/app/page/page';

export const usePageCache = defineStore('page-cache', {
  state: () => ({
    cache: [] as Page[],
  }),

  getters: {},

  actions: {},
});
