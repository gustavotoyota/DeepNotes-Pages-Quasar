import '@vue/runtime-core';
import 'pinia';

import axios, { AxiosInstance } from 'axios';
import { boot } from 'quasar/wrappers';
import { apiBaseURL } from 'src/code/static/auth';
import { getCurrentInstance } from 'vue';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $api: AxiosInstance;
  }
}

declare module 'pinia' {
  interface PiniaCustomProperties {
    $api: AxiosInstance;
  }
}

// Be careful when using SSR for cross-request state pollution
// due to creating a Singleton instance here;
// If any client changes this (global) instance, it might be a
// good idea to move this instance creation inside of the
// "export default () => {}" function below (which runs individually
// for each client)

export default boot(async ({ app, store }) => {
  const api = axios.create({ baseURL: apiBaseURL });

  app.config.globalProperties.$api = api;

  store.use(() => ({ $api: api }));
});

export function useAPI() {
  return getCurrentInstance()!.appContext.config.globalProperties
    .$api as AxiosInstance;
}
