import { defineStore } from 'pinia';

export const useUIStore = defineStore('ui-store', {
  state: () => ({
    leftSidebarMini: true,
    rightSidebarMini: true,
  }),

  getters: {},

  actions: {
    toggleLeftSidebar() {
      this.leftSidebarMini = !this.leftSidebarMini;
    },
    toggleRightSidebar() {
      this.rightSidebarMini = !this.rightSidebarMini;
    },
  },
});
