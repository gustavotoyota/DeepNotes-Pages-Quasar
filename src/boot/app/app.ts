import { boot } from 'quasar/wrappers';
import { factory } from './composition-root';
import 'src/boot/static/types';

export class App {
  constructor() {
    console.log('App created');
  }
}

export default boot(({ app }) => {
  app.config.globalProperties.$app = factory.makeApp();

  globalThis.page = app.config.globalProperties.$page = factory.makePage({
    id: 'page',
    axios: app.config.globalProperties.$axios,
  });
});
