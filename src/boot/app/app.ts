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
});
