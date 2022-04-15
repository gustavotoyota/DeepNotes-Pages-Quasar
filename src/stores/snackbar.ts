import { defineStore } from 'pinia';
import { debounce } from 'quasar';

export const useSnackbar = defineStore('snackbar', {
  state: () => ({
    active: false,
    color: null as string | null,
    text: null as string | null,
  }),

  getters: {},

  actions: {
    show(text: string, color: string) {
      this.active = true;
      this.color = color;
      this.text = text;

      hide(this);
    },
  },
});

const hide = debounce((store: ReturnType<typeof useSnackbar>) => {
  store.active = false;
}, 3000);
