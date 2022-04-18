import { defineStore } from 'pinia';
import { AppPage } from 'src/boot/app/page/page';
import { computed, markRaw, reactive, toRefs, watch } from 'vue';

export const usePageCache = defineStore('page-cache', () => {
  const state = reactive({
    cache: [] as AppPage[],
  });

  function addPage(page: AppPage) {
    if (state.cache.find((item) => item.id === page.id)) {
      return;
    }

    state.cache.push(markRaw(page));
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
