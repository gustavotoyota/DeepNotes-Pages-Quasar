import { boot } from 'quasar/wrappers';
import axios, { AxiosInstance } from 'axios';
import { Cookies } from 'quasar';
import { apiBaseURL } from '../app/auth';

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

export default boot(async ({ app, store, ssrContext }) => {
  // Axios

  app.config.globalProperties.$axios = axios;

  // API

  const api = axios.create({ baseURL: apiBaseURL });

  const cookies = Cookies.parseSSR(ssrContext);

  api.defaults.headers.common.Authorization = cookies.get('auth._token.local');

  app.config.globalProperties.$api = api;

  store.use(() => ({ $axios: axios, $api: api }));
});
