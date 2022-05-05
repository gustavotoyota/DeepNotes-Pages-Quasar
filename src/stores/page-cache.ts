import { defineStore } from 'pinia';
import { AppPage } from 'src/code/app/page/page';
import {
  computed,
  reactive,
  shallowReactive,
  ShallowReactive,
  toRefs,
  watch,
} from 'vue';
import { useMainStore } from './main-store';

export const usePageCache = defineStore('page-cache', () => {
  const state = reactive({
    cache: [] as ShallowReactive<AppPage[]>,
  });

  function addPage(page: AppPage) {
    const mainStore = useMainStore();

    if (state.cache.find((item) => item.id === page.id)) {
      return;
    }

    if (mainStore.pageId == null) {
      mainStore.pageId = page.id;
    }

    state.cache.push(shallowReactive(page));
  }

  const totalSize = computed(() => {
    return state.cache.reduce((acc, item) => {
      return acc + item.react.size;
    }, 0);
  });

  watch(totalSize, () => {
    while (state.cache.length > 0 && totalSize.value > 512 * 1024) {
      state.cache.shift();
    }
  });

  return {
    ...toRefs(state),

    addPage,

    totalSize,
  };
});
