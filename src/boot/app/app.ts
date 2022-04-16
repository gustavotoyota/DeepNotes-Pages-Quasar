import { boot } from 'quasar/wrappers';
import { Factory, factory } from './composition-root';
import 'src/boot/static/types';
import { AppSerialization } from './serialization';

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $app: App;
  }
}

export class DeepNotesApp {
  readonly serialization: AppSerialization;

  constructor(factory: Factory) {
    this.serialization = factory.makeSerialization(this);
  }
}

export default boot((params) => {
  const app = factory.makeApp();

  params.app.config.globalProperties.$app = factory.makeApp();

  params.app.provide('app', app);
});
