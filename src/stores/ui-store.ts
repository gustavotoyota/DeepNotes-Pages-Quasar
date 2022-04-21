import { defineStore } from 'pinia';
import { negateProp } from 'src/boot/static/utils';

export const useUIStore = defineStore('ui-store', {
  state: () => ({
    leftSidebarMini: true,
    rightSidebarMini: true,
  }),

  getters: {},

  actions: {
    toggleLeftSidebar() {
      negateProp(this, 'leftSidebarMini');
    },
    toggleRightSidebar() {
      negateProp(this, 'rightSidebarMini');
    },
  },
});
