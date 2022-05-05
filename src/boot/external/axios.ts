import axios, { AxiosInstance } from 'axios';
import { boot } from 'quasar/wrappers';
import { apiBaseURL } from 'src/code/static/auth';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

declare module 'pinia' {
  interface PiniaCustomProperties {
    $axios: AxiosInstance;
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
  // Axios

  app.config.globalProperties.$axios = axios;

  // API

  const api = axios.create({ baseURL: apiBaseURL, withCredentials: true });

  app.config.globalProperties.$api = api;

  store.use(() => ({ $axios: axios, $api: api }));
});
